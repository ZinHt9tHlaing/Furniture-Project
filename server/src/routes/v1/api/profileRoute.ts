import express from "express";
import {
  changeLanguage,
  testPermission,
} from "../../../controllers/api/profileController";
import { authMiddleware } from "../../../middlewares/authMiddleware";

const router = express.Router();

router.post("/change-language", changeLanguage);
router.get("/test-permission", authMiddleware, testPermission);

export default router;
