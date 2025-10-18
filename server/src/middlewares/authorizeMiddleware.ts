import { Request, Response, NextFunction } from "express";
import { getUserById } from "../services/authServices";
import { errorCode } from "../config/errorCode";

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
      const error: any = new Error("This account has not registered.");
      error.status = 401;
      error.code = errorCode.unauthenticated;
      return next(error);
    }

    const result = roles.includes(user.role); // true or false
    if (permission && !result) {
      const error: any = new Error("This action is not allowed.");
      error.status = 403;
      error.code = errorCode.unauthorized;
      return next(error);
    }

    if (!permission && result) {
      const error: any = new Error("This action is not allowed.");
      error.status = 403;
      error.code = errorCode.unauthorized;
      return next(error);
    }

    req.user = user;

    next();
  };
};
