import express from "express";
import { testController } from "../../controllers/testController";
import { checkMiddleware } from "../../middlewares/check";

const router = express.Router();

router.get("/test", checkMiddleware, testController);

export default router;
