import { Request, Response, NextFunction } from "express";
import { query, validationResult } from "express-validator";
import { unlink } from "node:fs/promises";
import path from "path";
import sharp from "sharp";

import { errorCode } from "../../config/errorCode";
import { authorize } from "../../utils/authorize";
import { getUserById, updateUser } from "../../services/authServices";
import { checkUserIfNotExist } from "../../utils/auth";
import { checkUploadFile } from "../../utils/check";
import ImageQueue from "../../jobs/queues/imageQueue";

interface CustomRequest extends Request {
  userId?: number;
}

export const changeLanguage = [
  query("lng", "Invalid Language code.")
    .trim()
    .notEmpty()
    .matches("^[a-z]+$")
    .isLength({ min: 2, max: 3 }),
  (req: CustomRequest, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    const { lng } = req.query;

    res.cookie("i18next", lng);
    res.status(200).json({
      message: req.t("changeLang", { lang: lng }),
    });
  },
];

export const testPermission = async (req: CustomRequest, res: Response) => {
  const userId = req.userId;
  const user = await getUserById(userId!);
  checkUserIfNotExist(user);

  const info: any = {
    title: "Testing permission",
  };

  // if user.role === "AUTHOR"
  // content = "You are an author."

  const canAuthorize = authorize(true, user!.role, "AUTHOR");
  if (canAuthorize) {
    info.content = "Your have permission to read this line.";
  }

  res.status(200).json({ currentUserRole: user?.role, info });
};

export const uploadProfile = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const image = req.file;

  const userDoc = await getUserById(userId!);
  checkUserIfNotExist(userDoc);

  checkUploadFile(image);

  const fileName = image?.filename;
  // const filePath = image?.path; // for Mac
  // const filePath = image?.path.replace("\\", "/"); // for Windows

  // Delete old image
  if (userDoc?.image) {
    try {
      // get old image file path
      const filePath = path.join(
        __dirname,
        "../../..",
        "/uploads/images",
        userDoc?.image!
      );

      await unlink(filePath);
    } catch (error) {
      console.log("No image found.", error);
    }
  }

  const userData = {
    image: fileName,
  };
  await updateUser(userDoc?.id!, userData);

  res
    .status(200)
    .json({ message: "Profile uploaded successfully.", image: fileName });
};

export const uploadProfileMultiple = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  console.log("req.files -------", req.files);

  const file = res.status(200).json({
    message: "Multiple Profile pictures uploaded successfully.",
  });
};

export const uploadProfileOptimize = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const image = req.file;
  const userDoc = await getUserById(userId!);
  checkUserIfNotExist(userDoc);
  checkUploadFile(image);

  // no extension, just filename
  const splitFileName = req.file?.filename.split(".")[0];

  // add job to Queue
  const job = await ImageQueue.add(
    "optimize-image",
    {
      filePath: req.file?.path,
      fileName: `${splitFileName}.webp`,
      width: 200,
      height: 200,
      quality: 50,
    },
    {
      attempts: 3, // max attempts
      backoff: {
        type: "exponential",
        delay: 1000,
      },
    }
  );

  // try {
  //   // get optimized image file path
  //   const optimizedImagePath = path.join(
  //     __dirname,
  //     "../../..",
  //     "/uploads/images",
  //     splitFileName
  //   );

  //   // optimize image
  //   await sharp(req.file?.buffer)
  //     .resize(200, 200)
  //     .webp({ quality: 50 })
  //     .toFile(optimizedImagePath);
  // } catch (error) {
  //   console.error("error", error);
  //   res.status(500).json({ message: "Image optimization failed." });
  //   return;
  // }

  // Delete old image
  if (userDoc?.image) {
    try {
      // get old image file path
      const originalFilePath = path.join(
        __dirname,
        "../../..",
        "/uploads/images",
        userDoc?.image!
      );

      // get old optimized image file path
      const optimizedFilePath = path.join(
        __dirname,
        "../../..",
        "/uploads/optimizeImages",
        userDoc!.image!.split(".")[0] + ".webp"
      );

      await unlink(originalFilePath);
      await unlink(optimizedFilePath);
    } catch (error) {
      console.log("No image found.", error);
    }
  }

  const userData = {
    image: req.file?.filename,
  };
  await updateUser(userDoc?.id!, userData);

  res.status(200).json({
    message: "Profile picture uploaded successfully.",
    image: splitFileName + ".webp",
    jobId: job.id,
  });
};

export const getMyPhoto = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const userDoc = await getUserById(userId!);

  const file = path.join(
    __dirname,
    "../../..",
    "/uploads/images",
    userDoc?.image!
  ); // user.image

  res.sendFile(file, (err) => {
    res.status(404).send("File not found");
  });
};
