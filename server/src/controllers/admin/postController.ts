import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { errorCode } from "../../config/errorCode";
import { createError } from "../../utils/error";
import { getUserById } from "../../services/authServices";
import { checkUserIfNotExist } from "../../utils/auth";
import { checkUploadFile } from "../../utils/check";
import ImageQueue from "../../jobs/queues/imageQueue";
import {
  createOnePost,
  getPostById,
  PostType,
  updateOnePost
} from "../../services/postService";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { notFound } from "../web/errorController";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const removeFiles = async (
  originalFile: string,
  optimizedFile: string | null
) => {
  try {
    // get old image file path
    const originalFilePath = path.join(
      __dirname,
      "../../..",
      "/uploads/images",
      originalFile
    );

    await unlink(originalFilePath);

    // get old optimized image file path
    if (optimizedFile) {
      const optimizedFilePath = path.join(
        __dirname,
        "../../..",
        "/uploads/optimizeImages",
        optimizedFile
      );

      await unlink(optimizedFilePath);
    }
  } catch (error) {
    console.log("No image found.", error);
  }
};

export const createPost = [
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { title, content, body, category, type, tags } = req.body;
    // const user = req.userId;
    const user = req.user;
    checkUploadFile(req.file);

    const userDoc = await getUserById(user!.id);
    if (!userDoc) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }

      return next(
        createError(
          "This user has not registered.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    // no extension, just filename
    const splitFileName = req.file?.filename.split(".")[0];

    // add job to Queue
    await ImageQueue.add(
      "optimize-image",
      {
        filePath: req.file?.path,
        fileName: `${splitFileName}.webp`,
        width: 835,
        height: 577,
        quality: 100,
      },
      {
        attempts: 3, // max attempts
        backoff: {
          type: "exponential",
          delay: 1000,
        },
      }
    );

    const data: PostType = {
      title,
      content,
      body,
      image: req.file!.filename,
      authorId: user!.id,
      category,
      type,
      tags,
    };

    const post = await createOnePost(data);

    res
      .status(201)
      .json({ message: "Successfully created a new post.", postId: post.id });
  },
];

export const updatePost = [
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { postId, title, content, body, category, type, tags } = req.body;

    // const user = req.userId;
    const user = req.user;

    const userDoc = await getUserById(user!.id);
    if (!userDoc) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }

      return next(
        createError(
          "This user has not registered.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    const post = await getPostById(+postId); // string to number eg: "8" => 8

    // post data does not exist in POST Database
    if (!post) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }

      return next(
        createError("This data does not exist.", 401, errorCode.invalid)
      );
    }

    // Admin A --> Post A --> update/delete
    // Admin B --> update/delete -> can't Post A
    if (user.id !== post?.authorId) {
      if (req.file) {
        await removeFiles(req.file.filename, null);
      }

      // Check if the user is not authorized to modify this post
      return next(
        createError("This action is not allowed.", 403, errorCode.unauthorized)
      );
    }

    let data: any = {
      title,
      content,
      body,
      image: req.file,
      category,
      type,
      tags,
    };

    if (req.file) {
      data.image = req.file.filename;

      // no extension, just filename
      const splitFileName = req.file.filename.split(".")[0];

      // add job to Queue
      await ImageQueue.add(
        "optimize-image",
        {
          filePath: req.file?.path,
          fileName: `${splitFileName}.webp`,
          width: 835,
          height: 577,
          quality: 100,
        },
        {
          attempts: 3, // max attempts
          backoff: {
            type: "exponential",
            delay: 1000,
          },
        }
      );

      const optimizedFile = post.image.split(".")[0] + ".webp";
      await removeFiles(post.image, optimizedFile);
    }

    const postUpdated = await updateOnePost(post.id, data);

    res
      .status(201)
      .json({
        message: "Successfully updated a new post.",
        postId: postUpdated.id,
      });
  },
];

export const deletePost = [
  body(""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {},
];
