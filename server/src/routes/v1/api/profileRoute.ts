import express from "express";
import {
  changeLanguage,
  uploadProfile,
  testPermission,
} from "../../../controllers/api/profileController";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import uploadFileMiddleware from "../../../middlewares/uploadFileMiddleware";

const router = express.Router();

router.post("/change-language", changeLanguage);
router.get("/test-permission", authMiddleware, testPermission);
router.patch(
  "/profile-upload",
  authMiddleware,
  uploadFileMiddleware.single("avatar"),
  uploadProfile
);

export default router;
