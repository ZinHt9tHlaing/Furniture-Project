import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { errorCode } from "../../config/errorCode";
import { createError } from "../../utils/error";
import { getUserById } from "../../services/authServices";
import { checkUserIfNotExist } from "../../utils/auth";
import { checkUploadFile } from "../../utils/check";
import ImageQueue from "../../jobs/queues/imageQueue";

interface CustomRequest extends Request {
  userId?: number;
}

export const createPost = [
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      return next(createError(errors[0].msg, 400, errorCode.invalid));
    }

    const { title, content, body, category, type, tags } = req.body;
    const userId = req.userId;
    const image = req.file;

    const userDoc = await getUserById(userId!);
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

    res.status(200).json({ message: "OK" });
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
