import express from "express";
import {
  confirmPassword,
  forgetPassword,
  loginController,
  logoutController,
  registerController,
  resetPassword,
  verifyOtp,
  verifyOtpForPassword,
} from "../../../controllers/auth/authController";

const router = express.Router();

router.post("/register", registerController);
router.post("/verify-otp", verifyOtp);
router.post("/confirm-password", confirmPassword);
router.post("/login", loginController);
router.post("/logout", logoutController);

router.post("/forget-password", forgetPassword);
router.post("/verify-password", verifyOtpForPassword);
router.post("/reset-password", resetPassword);

// Refresh Token api for mobile coz mobile does not have cookie
// router.post("/refresh-token", setRefreshToken); 

export default router;
