import express from "express";
import {
  changeLanguage,
  uploadProfile,
  testPermission,
  getMyPhoto,
  uploadProfileMultiple,
  uploadProfileOptimize,
} from "../../../controllers/api/profileController";
import { authMiddleware } from "../../../middlewares/authMiddleware";
import uploadFileMiddleware, {
  uploadMemoryMiddleware,
} from "../../../middlewares/uploadFileMiddleware";
import {
  getInfinitePostsByPagination,
  getPost,
  getPostsByPagination,
} from "../../../controllers/api/postController";
import {
  getProduct,
  getProductsByPagination,
} from "../../../controllers/api/productController";

const router = express.Router();

router.post("/change-language", changeLanguage);
router.get("/test-permission", authMiddleware, testPermission);
router.patch(
  "/profile/upload",
  authMiddleware,
  uploadFileMiddleware.single("avatar"),
  uploadProfile
);
router.patch(
  "/profile/upload/optimize",
  authMiddleware,
  uploadFileMiddleware.single("avatar"),
  uploadProfileOptimize
);
router.patch(
  "/profile/upload/multiple",
  authMiddleware,
  uploadFileMiddleware.array("avatar"),
  uploadProfileMultiple
);

router.get("/profile/my-photo", authMiddleware, getMyPhoto); // Just for testing

router.get("/posts", authMiddleware, getPostsByPagination); // Offset Pagination
router.get("/posts/infinite", authMiddleware, getInfinitePostsByPagination); // Cursor-based Pagination
router.get("/post/:id", authMiddleware, getPost);

// For product
router.get("/products/:id", authMiddleware, getProduct);
router.get("/infinite/products", authMiddleware, getProductsByPagination); // Cursor-based pagination but as alike as Offset Pagination

export default router;
