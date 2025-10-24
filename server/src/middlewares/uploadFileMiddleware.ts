import { Request, Response, NextFunction } from "express";
import multer, { FileFilterCallback } from "multer";

const fileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/images");

    // const type = file.mimetype.split("/")[0];
    // if (type === "image") {
    //   cb(null, "uploads/images");
    // } else {
    //   // if not image, store in files
    //   cb(null, "uploads/files");
    // }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const uploadFileMiddleware = multer({
  storage: fileStorage,
  fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 }, // Testing purpose, Maximum file size is 5MB
});

export default uploadFileMiddleware;
