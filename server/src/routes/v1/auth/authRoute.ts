import express from "express";
import {
  confirmPassword,
  loginController,
  logoutController,
  registerController,
  verifyOtp,
} from "../../../controllers/auth/authController";

const router = express.Router();

router.post("/register", registerController);
router.post("/verify-otp", verifyOtp);
router.post("/confirm-password", confirmPassword);
router.post("/login", loginController);
router.post("/logout", logoutController);

export default router;
