import express from "express";
import {
  changeLanguage,
  uploadProfile,
  testPermission,
  getMyPhoto,
} from "../../../controllers/api/profileController";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import uploadFileMiddleware from "../../../middlewares/uploadFileMiddleware";

const router = express.Router();

router.post("/change-language", changeLanguage);
router.get("/test-permission", authMiddleware, testPermission);
router.patch(
  "/profile/upload",
  authMiddleware,
  uploadFileMiddleware.single("avatar"),
  uploadProfile
);

router.get("/profile/my-photo", authMiddleware, getMyPhoto); // Just for testing

export default router;
