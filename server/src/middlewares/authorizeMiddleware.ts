import { Request, Response, NextFunction } from "express";
import { getUserById } from "../services/authServices";
import { errorCode } from "../config/errorCode";
import { createError } from "../utils/error";

interface CustomRequest extends Request {
  userId?: number;
  user?: any;
}

// authorize( true, "ADMIN", "AUTHOR" ) => deny - "USER"
// authorize( false, "USER" ) => allow - "ADMIN", "AUTHOR"
// If the authorize function is called, a parameter will be added and the middleware will return
export const authorize = (permission: boolean, ...roles: string[]) => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    const userId = req.userId;

    const user = await getUserById(userId!);
    if (!user) {
      return next(
        createError(
          "This account has not registered.",
          401,
          errorCode.unauthenticated
        )
      );
    }

    const result = roles.includes(user.role); // true or false
    if (permission && !result) {
      return next(
        createError(
          "This action is not allowed.",
          403,
          errorCode.unauthenticated
        )
      );
    }

    if (!permission && result) {
      return next(
        createError(
          "This action is not allowed.",
          403,
          errorCode.unauthenticated
        )
      );
    }

    req.user = user;

    next();
  };
};
