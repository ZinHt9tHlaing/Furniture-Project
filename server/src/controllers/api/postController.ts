import { Request, Response, NextFunction } from "express";
import { body, param, query, validationResult } from "express-validator";
import { errorCode } from "../../config/errorCode";
import { createError } from "../../utils/error";
import { getUserById } from "../../services/authServices";
import { checkUserIfNotExist } from "../../utils/auth";
import { checkModelIfExist } from "../../utils/check";
import {
  getPostById,
  getPostsList,
  getPostWithRelations,
} from "../../services/postService";
import { prisma } from "../../services/prismaClient";
import { getOrSetCache } from "../../utils/cache";

interface CustomRequest extends Request {
  userId?: number;
}

export const getPost = [
  param("id", "Post ID is required.").isInt({ gt: 0 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const userId = req.userId;
    const postId = req.params.id;

    const userDoc = await getUserById(userId!);
    checkUserIfNotExist(userDoc);

    // const post = await getPostWithRelations(+postId);

    const cacheKey = `posts:${JSON.stringify(+postId)}`;
    console.log(cacheKey);

    const post = await getOrSetCache(cacheKey, async () => {
      return await getPostWithRelations(+postId);
    });

    checkModelIfExist(post);

    // const modifiedPost = {
    //   id: post?.id,
    //   title: post?.title,
    //   content: post?.content,
    //   body: post?.body,
    //   image: "/optimizeImages/" + post?.image.split(".")[0] + ".webp",
    //   updatedAt: post?.updatedAt.toLocaleDateString("en-US", {
    //     year: "numeric",
    //     month: "long",
    //     day: "numeric",
    //   }),
    //   fullName:
    //     (post?.author.firstName ?? "") + " " + (post?.author.lastName ?? ""),
    //   category: post?.category.name,
    //   type: post?.type.name,
    //   tags:
    //     post?.tags && post.tags.length > 0
    //       ? post.tags.map((tag) => tag.name)
    //       : null,
    // };

    // console.log(
    //   "Date",
    //   post?.updatedAt ? post?.updatedAt.toISOString().split("T")[0] : null
    // );

    // const tagNames = post?.tags.map((tag) => tag.name);

    // const transformedPost = {
    //   ...post,
    //   tags: tagNames,
    // };

    res.status(200).json({ message: "Post Details", post });
  },
];

// Offset Pagination
export const getPostsByPagination = [
  query("page", "Page number must be unsigned integer.")
    .isInt({ gt: 0 })
    .optional(),
  query("limit", "Limit number must be unsigned integer")
    .isInt({ gt: 4 }) // starts from page 5
    .optional(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    // string to number with +
    const page = req.query.page ? +req.query.page : 1;
    const limit = req.query.limit ? +req.query.limit : 5;

    const userId = req.userId;
    const userDoc = await getUserById(userId!);
    checkUserIfNotExist(userDoc);

    // pagination skip formula
    const skip = (page - 1) * limit;
    // ( 1 - 1 ) * 5 => page 1မှာ 0ကို skipပီး 1 ကနေ စယူ
    // ( 2 - 1 ) * 5 => page 2မှာ 1 - 5ကို skipပီး 6 ကနေ စယူ

    const options = {
      skip,
      take: limit + 1,
      select: {
        id: true,
        title: true,
        content: true,
        body: true,
        image: true,
        updatedAt: true,
        author: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    };

    const cacheKey = `posts:${JSON.stringify(req.query)}`;
    const posts = await getOrSetCache(cacheKey, async () => {
      return await getPostsList(options);
    });

    const hasNextPage = posts.length > limit; // if 6 > 5
    let nextPage = null;

    const previousPage = page !== 1 ? page - 1 : null;

    if (hasNextPage) {
      // pop() -> remove the last element from an array
      posts.pop(); // if 6 posts, remove 6 and response 5 posts
      nextPage = page + 1; // nextPage starts 6
    }

    res.status(200).json({
      message: "Get All Posts",
      count: posts.length,
      currentPage: page,
      hasNextPage,
      nextPage,
      previousPage,
      posts,
    });
  },
];

// Cursor-based Pagination
export const getInfinitePostsByPagination = [
  query("cursor", "Cursor must be Post ID.").isInt({ gt: 0 }).optional(),
  query("limit", "Limit number must be unsigned integer")
    .isInt({ gt: 2 }) // starts from page 3
    .optional(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    // string to number with +
    const lastCursor = req.query.cursor && +req.query.cursor;
    const limit = req.query.limit ? +req.query.limit : 5;

    const userId = req.userId;
    const userDoc = await getUserById(userId!);
    checkUserIfNotExist(userDoc);

    const options = {
      take: limit + 1,
      skip: lastCursor ? 1 : 0,
      cursor: lastCursor ? { id: lastCursor } : undefined,
      select: {
        id: true,
        title: true,
        content: true,
        body: true,
        image: true,
        updatedAt: true,
        author: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: { id: "desc" },
    };

    // const posts = await getPostsList(options);

    const cacheKey = `posts:${JSON.stringify(req.query)}`;
    console.log("cacheKey", cacheKey);

    const posts = await getOrSetCache(cacheKey, async () => {
      return await getPostsList(options);
    });

    const hasNextPage = posts.length > limit; // if 6 > 5

    if (hasNextPage) {
      // pop() -> remove the last element from an array
      posts.pop(); // if 6 posts, remove 6 and response 5 posts
    }

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].id : null;

    res.status(200).json({
      message: "Get All infinite posts",
      hasNextPage,
      nextCursor,
      prevCursor: lastCursor,
      posts,
    });
  },
];
