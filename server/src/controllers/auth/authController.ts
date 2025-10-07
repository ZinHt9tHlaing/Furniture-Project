import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import {
  createOtp,
  getUserByPhone,
  getOtpByPhone,
  updateOtp,
} from "../../services/authServices";
import {
  checkOtpErrorIfSameDate,
  checkOtpRow,
  checkUserExist,
} from "../../utils/auth";
import { generateOTP, generateToken } from "../../utils/generate";
import bcrypt from "bcrypt";

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
      error.code = "Error_Invalid";
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
          const error: any = new Error(
            "OTP is allowed to request 3 times per day."
          );
          error.status = 405;
          error.code = "Error_OverLimit";
          return next(error);
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
      error.code = "Error_Invalid";
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

    let result;

    // Token is wrong
    if (otpRow?.rememberToken !== token) {
      const otpData = {
        error: 5,
      };
      result = await updateOtp(otpRow!.id, otpData);

      const error: any = new Error("Invalid token.");
      error.status = 400;
      error.code = "Error_Invalid";
      return next(error);
    }

    res.status(200).json({ message: "OTP has been verified." });
  },
];

export const confirmPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};
