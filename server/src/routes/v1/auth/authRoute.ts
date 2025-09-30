import express from "express";
import {
  confirmPassword,
  loginController,
  registerController,
  verifyOtp,
} from "../../../controllers/auth/authController";

const router = express.Router();

router.post("/register", registerController);
router.post("/verify-otp", verifyOtp);
router.post("/confirm-password", confirmPassword);
router.post("/login", loginController);

export default router;
