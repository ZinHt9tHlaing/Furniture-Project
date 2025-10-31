import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { errorCode } from "../../config/errorCode";
import { createError } from "../../utils/error";
import { getUserById } from "../../services/authServices";
import { checkUserIfNotExist } from "../../utils/auth";
import { checkUploadFile } from "../../utils/check";
import ImageQueue from "../../jobs/queues/imageQueue";
import { createOnePost, PostType } from "../../services/postService";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

export const createPost = [
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { title, content, body, category, type, tags } = req.body;
    // const user = req.userId;
    const user = req.user;
    const image = req.file;

    const userDoc = await getUserById(user!);
    checkUserIfNotExist(userDoc);
    checkUploadFile(image);

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
  body(""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {},
];

export const deletePost = [
  body(""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {},
];
