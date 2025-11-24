import express from "express";
import { getAllUsers } from "../../../controllers/admin/userController";
import { setMaintenance } from "../../../controllers/admin/systemController";
import uploadFileMiddleware from "../../../middlewares/uploadFileMiddleware";
import {
  createPost,
  deletePost,
  updatePost,
} from "../../../controllers/admin/postController";
import {
  createPostValidator,
  deletePostValidator,
  updatePostValidator,
} from "../../../validators/postValidators";
import { createProduct, deleteProduct, updateProduct } from "../../../controllers/admin/productController";
import { createProductValidator, deleteProductValidator, updateProductValidator } from "../../../validators/productValidators";

const router = express.Router();

router.get("/users", getAllUsers);
router.post("/maintenance", setMaintenance);

// CRUD for Posts
router.post(
  "/posts",
  uploadFileMiddleware.single("image"),
  createPostValidator,
  createPost
);
router.patch(
  "/posts",
  uploadFileMiddleware.single("image"),
  updatePostValidator,
  updatePost
);
router.delete("/posts", deletePostValidator, deletePost);

// CRUD for Products
router.post(
  "/products",
  uploadFileMiddleware.array("images", 4),
  createProductValidator,
  createProduct
);
router.patch(
  "/products",
  uploadFileMiddleware.array("images"),
  updateProductValidator,
  updateProduct
);
router.delete("/products", deleteProduct);

export default router;
