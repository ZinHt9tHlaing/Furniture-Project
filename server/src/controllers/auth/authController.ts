import { Request, Response, NextFunction } from "express";
import { body, check, validationResult } from "express-validator";
import {
  createOtp,
  getUserByPhone,
  getOtpByPhone,
  updateOtp,
  createUser,
  updateUser,
  getUserById,
} from "../../services/authServices";
import {
  checkOtpErrorIfSameDate,
  checkOtpRow,
  checkUserExist,
  checkUserIfNotExist,
} from "../../utils/auth";
import { generateOTP, generateToken } from "../../utils/generate";
import bcrypt from "bcrypt";
import moment from "moment";
import jwt from "jsonwebtoken";
import { errorCode } from "../../config/errorCode";
import { createError } from "../../utils/error";

interface CustomRequest extends Request {
  userId?: number;
}

export const registerController = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

    // If validation error occurs
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    let phone = req.body.phone;
    if (phone.slice(0, 2) === "09") {
      phone = phone.substring(2, phone.length);
    }

    const user = await getUserByPhone(phone);
    checkUserExist(user);

    // OTP sending logic here
    // Generate OTP & call OTP sending API
    // if sms OTP cannot be sent, response error
    // Save OTP in DB

    const otp = 123456; // For testing
    // const otp = generateOTP(); // For production user
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp.toString(), salt);

    const token = generateToken();

    const otpRow = await getOtpByPhone(phone);
    let result;
    if (!otpRow) {
      // OTP does not exist in DB
      const otpData = {
        phone,
        otp: hashedOtp,
        rememberToken: token,
        count: 1,
      };
      result = await createOtp(otpData);
    } else {
      const lastOtpRequestDate = new Date(
        otpRow.updatedAt
      ).toLocaleDateString();
      const today = new Date().toLocaleDateString();
      const isSameDate = lastOtpRequestDate === today;
      checkOtpErrorIfSameDate(isSameDate, otpRow.error);

      // If OTP request is not the same date
      if (!isSameDate) {
        const otpData = {
          otp: hashedOtp,
          rememberToken: token,
          count: 1,
          error: 0,
        };
        result = await updateOtp(otpRow.id, otpData);
      } else {
        // If OTP request is not the same date and over limit
        if (otpRow.count === 3) {
          return next(
            createError(
              "OTP is allowed to request 3 times per day.",
              405,
              errorCode.overLimit
            )
          );
        } else {
          // If OTP request is not the same date and not over limit
          const otpData = {
            otp: hashedOtp,
            rememberToken: token,
            count: {
              increment: 1,
            },
          };
          result = await updateOtp(otpRow.id, otpData);
        }
      }
    }

    res.status(200).json({
      message: `OTP has been sent to 09${result.phone}`,
      phone: result.phone,
      token: result.rememberToken,
    });
  },
];

export const verifyOtp = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("otp", "Invalid OTP")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("token", "Invalid token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    const { phone, otp, token } = req.body;

    const user = await getUserByPhone(phone);
    checkUserExist(user);

    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    const lastOtpVerify = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const isSameDate = lastOtpVerify === today;
    // If OTP verify is in the same date and over limit
    checkOtpErrorIfSameDate(isSameDate, otpRow!.error);

    // Token is wrong
    if (otpRow?.rememberToken !== token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);

      const error: any = new Error("Invalid token.");
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    // OTP is expired
    const isOTPExpired = moment().diff(otpRow!.updatedAt, "minutes") > 2;
    if (isOTPExpired) {
      return next(createError("OTP is expired.", 403, errorCode.otpExpired));
    }

    const isMatchOTP = await bcrypt.compare(otp, otpRow!.otp);
    // OTP is wrong
    if (!isMatchOTP) {
      // If OTP error is first time today
      if (isSameDate) {
        const otpData = {
          error: 1,
        };

        await updateOtp(otpRow!.id, otpData);
      } else {
        // If OTP error is not first time today
        const otpData = {
          error: {
            increment: 1,
          },
        };

        await updateOtp(otpRow!.id, otpData);
      }

      return next(createError("OTP is incorrect.", 401, errorCode.invalid));
    }

    // All are ok
    const verifyToken = generateToken();
    const otpData = {
      verifyToken,
      error: 0,
      count: 1,
    };

    const result = await updateOtp(otpRow!.id, otpData);

    res.status(200).json({
      message: "OTP is successfully verified.",
      phone: result.phone,
      token: result.verifyToken,
    });
  },
];

// Sending OTP --> Verify OTP --> Confirm password = New Account
export const confirmPassword = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("password", "Password must be 8 digits")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 8, max: 8 }),
  body("token", "Invalid token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    const { phone, password, token } = req.body;

    // Check if user exist
    const existingUser = await getUserByPhone(phone);
    checkUserExist(existingUser);

    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    // if OTP count is over limit
    if (otpRow?.error === 5) {
      return next(
        createError("This request may be an attack.", 400, errorCode.attack)
      );
    }

    // Token is wrong
    if (otpRow?.verifyToken !== token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);

      const error: any = new Error("Invalid token.");
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    // request is expired
    const isExpired = moment().diff(otpRow!.updatedAt, "minutes") > 10;
    if (isExpired) {
      return next(
        createError(
          "Your request is expired. Please try again!",
          403,
          errorCode.requestExpired
        )
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const randomToken = "I will replace Refresh Token soon";

    // Creating new account
    const userData = {
      phone,
      password: hashedPassword,
      randomToken,
    };

    const newUser = await createUser(userData);

    const accessTokenPayload = { id: newUser.id };
    const refreshTokenPayload = { id: newUser.id, phone: newUser.phone };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: 60 * 15 } // 15 minutes
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "30d" }
    );

    // Updating randomToken with refreshToken
    const userUpdateData = {
      randomToken: refreshToken,
    };

    await updateUser(newUser.id, userUpdateData);

    res
      .status(201)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      })
      .json({
        message: "Your account is successfully created.",
        userId: newUser.id,
      });
  },
];

export const loginController = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("password", "Password must be 8 digits")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 8, max: 8 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    // const password = req.body.password;
    // let phone = req.body.phone;

    const password = req.body.password;
    let phone = req.body.phone;
    if (phone.slice(0, 2) === "09") {
      phone = phone.substring(2, phone.length);
    }

    // Check if user doesn't exist
    const user = await getUserByPhone(phone);
    checkUserIfNotExist(user);

    // If wrong password 3 times in a day was over limit, user is FREEZE
    if (user?.status === "FREEZE") {
      const error: any = new Error(
        "Your account is temporarily locked. Please contact us."
      );
      error.status = 401;
      error.code = errorCode.accountFreeze;
      return next(error);
    }

    const isMatchPassword = await bcrypt.compare(password, user!.password);
    if (!isMatchPassword) {
      // --------- Starting to record wrong times
      const lastRequest = new Date(user!.updatedAt).toLocaleDateString();
      const today = new Date().toLocaleDateString();
      const isSameDate = lastRequest === today;

      // Today password is wrong first time
      if (!isSameDate) {
        const userData = {
          errorLoginCount: 1,
        };
        await updateUser(user!.id, userData);
      } else {
        // Today password was wrong 2 times
        if (user!.errorLoginCount >= 2) {
          const userData = {
            status: "FREEZE",
          };
          await updateUser(user!.id, userData);
        } else {
          // Today password was wrong 1 times
          const userData = {
            errorLoginCount: {
              increment: 1,
            },
          };
          await updateUser(user!.id, userData);
        }
      }
      // --------- Ending -----------------------
      const error: any = new Error(req.t("wrongPasswd"));
      error.status = 401;
      error.code = errorCode.invalid;
      return next(error);
    }

    const accessTokenPayload = { id: user!.id };
    const refreshTokenPayload = { id: user!.id, phone: user!.phone };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15, // 15 minutes
      }
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "30d" } // 30 days
    );

    const userData = {
      errorLoginCount: 0, // reset error count
      randomToken: refreshToken,
    };

    await updateUser(user!.id, userData);

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      })
      .json({
        message: "Successfully Logged In.",
        userId: user?.id,
      });
  },
];

// clear HttpOnly cookies ( accessToken, refreshToken )
// Update randomToken to delete in User Table
export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as {
      id: number;
      phone: string;
    };
  } catch (err) {
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
  checkUserIfNotExist(user);

  if (user?.phone !== decoded.phone) {
    return next(
      createError(
        "You are not a authenticated user.",
        401,
        errorCode.unauthenticated
      )
    );
  }

  // Update randomToken
  const userData = {
    randomToken: generateToken(),
  };
  await updateUser(user!.id, userData);

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    path: "/",
  });

  return res.status(200).json({ message: "Successfully Logged Out." });
};

export const forgetPassword = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    let phone = req.body.phone;
    if (phone.slice(0, 2) === "09") {
      phone = phone.substring(2, phone.length);
    }

    const user = await getUserByPhone(phone);
    checkUserIfNotExist(user);

    // OTP sending logic here
    // Generate OTP & call OTP sending API
    // if sms OTP cannot be sent, response error
    // Save OTP in DB

    const otp = 123456; // For testing
    // const otp = generateOTP(); // For production use
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp.toString(), salt);
    const token = generateToken();

    const otpRow = await getOtpByPhone(phone);
    // Warning - Your app may let users change their phone number.
    // if so, you need to check if phone number exists in OTP table

    let result;

    const lastOtpRequest = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const isSameDate = lastOtpRequest === today;
    checkOtpErrorIfSameDate(isSameDate, otpRow!.error);
    // If OTP request is not the same date
    if (!isSameDate) {
      const otpData = {
        otp: hashedOtp,
        rememberToken: token,
        count: 1,
        error: 0,
      };
      result = await updateOtp(otpRow!.id, otpData);
    } else {
      // If OTP request is not the same date and over limit
      if (otpRow!.count === 3) {
        return next(
          createError(
            "OTP is allowed to request 3 times per day.",
            405,
            errorCode.overLimit
          )
        );
      } else {
        // If OTP request is not the same date and not over limit
        const otpData = {
          otp: hashedOtp,
          rememberToken: token,
          count: {
            increment: 1,
          },
        };
        result = await updateOtp(otpRow!.id, otpData);
      }
    }

    res.status(200).json({
      message: `We are sending OTP to 09${result.phone} to reset password`,
      phone: result.phone,
      token: result.rememberToken,
    });
  },
];

export const verifyOtpForPassword = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("otp", "Invalid OTP")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 6, max: 6 }),
  body("token", "Invalid token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    const { phone, otp, token } = req.body;

    const user = await getUserByPhone(phone);
    checkUserIfNotExist(user);

    const otpRow = await getOtpByPhone(phone);
    checkOtpRow(otpRow);

    const lastOtpVerify = new Date(otpRow!.updatedAt).toLocaleDateString();
    const today = new Date().toLocaleDateString();
    const isSameDate = lastOtpVerify === today;
    // If OTP verify is in the same date and over limit
    checkOtpErrorIfSameDate(isSameDate, otpRow!.error);

    // Token is wrong
    if (otpRow?.rememberToken !== token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);

      return next(createError("Invalid token.", 400, errorCode.invalid));
    }

    // OTP is expired
    const isOTPExpired = moment().diff(otpRow!.updatedAt, "minutes") > 2;
    if (isOTPExpired) {
      return next(createError("OTP is expired.", 403, errorCode.otpExpired));
    }

    const isMatchOTP = await bcrypt.compare(otp, otpRow!.otp);
    // OTP is wrong
    if (!isMatchOTP) {
      // If OTP error is first time today
      if (isSameDate) {
        const otpData = {
          error: 1,
        };

        await updateOtp(otpRow!.id, otpData);
      } else {
        // If OTP error is not first time today
        const otpData = {
          error: {
            increment: 1,
          },
        };

        await updateOtp(otpRow!.id, otpData);
      }

      const error: any = new Error("OTP is incorrect.");
      error.status = 401;
      error.code = errorCode.invalid;
      return next(error);
    }

    // All are ok
    const verifyToken = generateToken();
    const otpData = {
      verifyToken,
      error: 0,
      count: 1,
    };

    const result = await updateOtp(otpRow!.id, otpData);

    res.status(200).json({
      message: "OTP is successfully verified to reset password.",
      phone: result.phone,
      token: result.verifyToken,
    });
  },
];

export const resetPassword = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  body("password", "Password must be 8 digits")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 8, max: 8 }),
  body("token", "Invalid token").trim().notEmpty().escape(),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });
    // If validation error occurs
    if (errors.length > 0) {
      const error: any = new Error(errors[0].msg);
      error.status = 400;
      error.code = errorCode.invalid;
      return next(error);
    }

    const { phone, password, token } = req.body;

    const user = await getOtpByPhone(phone);
    checkUserIfNotExist(user);

    const otpRow = await getOtpByPhone(phone);

    if (otpRow?.error === 5) {
      return next(
        createError(
          "This request may be an attack. It not, try again tomorrow.",
          401,
          errorCode.attack
        )
      );
    }

    if (otpRow?.verifyToken !== token) {
      const otpData = {
        error: 5,
      };
      await updateOtp(otpRow!.id, otpData);

      return next(createError("Invalid token.", 400, errorCode.invalid));
    }

    // request is expired
    const isExpired = moment().diff(otpRow!.updatedAt, "minutes") > 5;
    if (isExpired) {
      return next(
        createError(
          "Your request is expired. Please try again.",
          403,
          errorCode.otpExpired
        )
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    // jwt token
    const accessTokenPayload = { id: user!.id };
    const refreshTokenPayload = { id: user!.id, phone: user!.phone };

    const accessToken = jwt.sign(
      accessTokenPayload,
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: 60 * 15, // 15 minutes
      }
    );

    const refreshToken = jwt.sign(
      refreshTokenPayload,
      process.env.REFRESH_TOKEN_SECRET!,
      { expiresIn: "30d" } // 30 days
    );

    const userData = {
      password: hashPassword, // reset error count
      randomToken: refreshToken,
    };

    await updateUser(user!.id, userData);

    res
      .status(200)
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 15 * 60 * 1000, // 15 minutes
        path: "/",
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: "/",
      })
      .json({
        message: "Successfully reset your password.",
        userId: user?.id,
      });
  },
];

export const authCheck = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const userId = req.userId;
  const user = await getUserById(userId!);
  checkUserIfNotExist(user);

  const fullName = `${user?.firstName} ${user?.lastName}`;

  res.status(200).json({
    message: "You are a authenticated user.",
    userId: user?.id,
    username: fullName,
    image: user?.image,
  });
};
