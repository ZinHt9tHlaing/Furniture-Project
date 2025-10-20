import express from "express";

// routes imports
import testRoutes from "../../routes/v1/testRoutes";
import authRoutes from "../../routes/v1/auth/authRoute";
import adminRoutes from "../../routes/v1/admin/index";
import userRoutes from "../../routes/v1/api/profileRoute";

// view routes
import viewRoutes from "../../routes/v1/web/viewRoute";
import * as errorController from "../../controllers/web/errorController";
import path from "path";

// middlewares
import { authMiddleware } from "../../middlewares/authMiddleware";
import { authorize } from "../../middlewares/authorizeMiddleware";
import { maintenanceMiddleware } from "../../middlewares/maintenanceMiddleware";

const router = express.Router();

// routes
// router.use("/api/v1", testRoutes);

// router.use("/api/v1/user", maintenanceMiddleware, userRoutes);
// router.use(
//   "/api/v1/admins",
//   maintenanceMiddleware,
//   authMiddleware,
//   authorize(true, "ADMIN"),
//   adminRoutes
// );

router.use("/api/v1", authRoutes);
router.use("/api/v1/user", userRoutes);
router.use(
  "/api/v1/admins",
  authMiddleware,
  authorize(true, "ADMIN"),
  adminRoutes
);

// view routes
router.use(viewRoutes);

// error view routes
// app.use(errorController.notFound);

export default router;
