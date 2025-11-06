import { Request, Response, NextFunction } from "express";
import { body, param, validationResult } from "express-validator";
import { errorCode } from "../../config/errorCode";
import { createError } from "../../utils/error";
import { getUserById } from "../../services/authServices";
import { checkUserIfNotExist } from "../../utils/auth";
import { checkModelIfExist } from "../../utils/check";
import { getPostById, getPostWithRelations } from "../../services/postService";

interface CustomRequest extends Request {
  userId?: number;
}

export const getPost = [
  param("id", "Post ID is required.").isInt({ gt: 0 }),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;
    const postId = req.params.id;

    const userDoc = await getUserById(userId!);
    checkUserIfNotExist(userDoc);

    const post = await getPostWithRelations(+postId);

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

    const tagNames = post?.tags.map((tag) => tag.name);

    const transformedPost = {
      ...post,
      tags: tagNames,
    };

    res.status(200).json({ message: "Post Details", transformedPost });
  },
];

export const getPostsByPagination = [
  body(""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {},
];

export const getInfinitePostsByPagination = [
  body(""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {},
];
