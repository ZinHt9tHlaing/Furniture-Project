import { Request, Response, NextFunction } from "express";
import { CustomRequest } from "../../middlewares/authMiddleware";

export const getAllUsers = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const id = req.userId;

  res.status(200).json({ message: "All Users.", currentUserId: id });
};
