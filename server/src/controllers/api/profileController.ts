import { Request, Response, NextFunction } from "express";
import { query, validationResult } from "express-validator";
import { errorCode } from "../../config/errorCode";
import { authorize } from "../../utils/authorize";
import { getUserById } from "../../services/authServices";
import { checkUserIfNotExist } from "../../utils/auth";
import { checkUploadFile } from "../../utils/check";

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

  const user = await getUserById(userId!);
  checkUserIfNotExist(user);

  checkUploadFile(image);

  res
    .status(200)
    .json({ message: "Profile uploaded successfully.", file: req.file });
};
