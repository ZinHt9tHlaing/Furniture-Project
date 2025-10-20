import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { errorCode } from "../config/errorCode";
import { getUserById, updateUser } from "../services/authServices";
import { createError } from "../utils/error";

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
    return next(
      createError(
        "You are not a authenticated user.",
        401,
        errorCode.unauthenticated
      )
    );
  }

  // Generate new tokens
  const generateNewTokens = async () => {
    let decoded;

    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
        id: number;
        phone: string;
      };
    } catch (error) {
      return next(
        createError(
          "You are not a authenticated user.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    // Check if decoded id is number or not
    if (isNaN(decoded.id)) {
      return next(
        createError(
          "You are not a authenticated user.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    const user = await getUserById(decoded.id);
    if (!user) {
      return next(
        createError(
          "This account has not registered.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    if (user.phone !== decoded.phone) {
      return next(
        createError(
          "You are not a authenticated user.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    // Check if refresh token is valid
    if (user.randomToken !== refreshToken) {
      return next(
        createError(
          "You are not a authenticated user.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    const accessTokenPayload = { id: user.id };
    const refreshTokenPayload = { id: user.id, phone: user.phone };

    const newAccessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15, // 15 minutes
      }
    );

    const newRefreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "30d" } // 30 days
    );

    const userData = {
      randomToken: newRefreshToken,
    };

    await updateUser(user.id, userData);

    res
      .cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
      })
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

    req.userId = user.id;
    next();
  };

  if (!accessToken) {
    generateNewTokens();
    // return next(
    //   createError(
    //     "Access token has expired.",
    //     401,
    //     errorCode.accessTokenExpired
    //   )
    // );
  } else {
    // Verify access token
    let decoded;
    try {
      decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET!) as {
        id: number;
      };

      // Check if decoded id is number or not
      if (isNaN(decoded.id)) {
        return next(
          createError(
            "You are not a authenticated user.",
            401,
            errorCode.unauthenticated
          )
        );
      }

      req.userId = decoded.id;

      next();
    } catch (error: any) {
      console.log("error", error);
      if (error.name === "TokenExpiredError") {
        generateNewTokens();
        // error.message = "Access token has expired.";
        // error.status = 401;
        // error.code = errorCode.accessTokenExpired;
      } else {
        // if not correct JWT token ( jwt secret key )
        return next(
          createError("Access Token is invalid.", 400, errorCode.attack)
        );
      }
    }
  }
};
