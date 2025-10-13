import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorCode } from "../config/errorCode";

export interface CustomRequest extends Request {
  userId?: number;
}

// Refresh Token api for mobile coz mobile does not have cookie
// request api -->
// <-- response error expired
// call refresh-token api -->
// <-- response 2 new tokens ( access & refresh token )
// request api with new access token -->

// Call every api include - 2 httpOnly cookies in Website
export const authMiddleware = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  // Check platform with custom header ( eg: mobile )
  const platform = req.headers["x-platform"];
  if (platform === "mobile") {
    const accessTokenMobile = req.headers.authorization?.split(" ")[1];
    console.log("Request from Mobile", accessTokenMobile);
  } else {
    console.log("Request from Web");
  }

  // Check access token for web
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
