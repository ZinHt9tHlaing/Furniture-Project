import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorCode } from "../config/errorCode";

export interface CustomRequest extends Request {
  userId?: number;
}

export const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const accessToken = req.cookies ? req.cookies.accessToken : null;
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;

  if (!refreshToken) {
    const error: any = new Error("You are not a authenticated user.");
    error.status = 401;
    error.code = errorCode.unauthenticated;
    return next(error);
  }

  if (!accessToken) {
    const error: any = new Error("Access token has expired.");
    error.status = 401;
    error.code = "Error_AccessTokenExpired";
    return next(error);
  }

  // Verify access token
  let decoded;
  try {
    decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
      id: number;
    };
  } catch (error: any) {
    console.log("error", error);
    if (error.name === "TokenExpiredError") {
      error.message = "Access token has expired.";
      error.status = 401;
      error.code = errorCode.accessTokenExpired;
    } else {
      error.message = "Access Token is invalid.";
      error.status = 400;
      error.code = errorCode.attack;
    }
    return next(error);
  }

  req.userId = decoded.id;

  next();
};
