import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { errorCode } from "../../config/errorCode";
import { createError } from "../../utils/error";

interface CustomRequest extends Request {
  user?: any;
}

export const getPostById = [
  body("title", "Title is required.").trim().notEmpty().escape(),
  body("content", "Content is required.").trim().notEmpty().escape(),
  //   body("body", "Body is required.")
  //     .trim()
  //     .notEmpty()
  //     .customSanitizer((value) => sanitizeHtml(value))
  //     .notEmpty(),
  body("category", "Category is required.").trim().notEmpty().escape(),
  body("type", "Type is required.").trim().notEmpty().escape(),
  async (req: CustomRequest, res: Response, next: NextFunction) => {
    const { title, content, body, category, type, tags } = req.body;
    const user = req.user;
  },
];

export const getPostsByPagination = [
  body(""),
  async (req: CustomRequest, res: Response, next: NextFunction) => {},
];
