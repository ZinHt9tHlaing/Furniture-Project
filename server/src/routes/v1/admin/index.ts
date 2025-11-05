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
  updatePostValidator,
} from "../../../validators/postValidators";

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
router.patch("/posts", deletePost);

export default router;
