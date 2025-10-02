import { count, log } from "console";
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { createOtp, getUserByPhone } from "../../services/authServices";
import { checkUserExist } from "../../utils/auth";
import { generateOTP, generateToken } from "../../utils/generate";

export const registerController = [
  body("phone", "Invalid phone number")
    .trim()
    .notEmpty()
    .matches("^[0-9]+$")
    .isLength({ min: 5, max: 12 }),
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req).array({ onlyFirstError: true });

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
    const otp = generateOTP();
    const token = generateToken();
    const otpData = {
      phone,
      otp: otp.toString(),
      rememberToken: token,
      count: 1,
    };
    const result = await createOtp(otpData);

    res.status(200).json({
      message: `OTP has been sent to 09${result.phone}`,
      phone: result.phone,
      token: result.rememberToken,
    });
  },
];

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

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
