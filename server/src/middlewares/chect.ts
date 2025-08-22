import { Request, Response, NextFunction } from "express";

export interface CustomRequest extends Request {
  userId?: number;
}

export const checkMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  req.userId = 12345;
  next();
};
