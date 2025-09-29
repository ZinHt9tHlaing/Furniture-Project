import express from "express";

import { aboutView, homeView } from "../../../controllers/web/viewController";

const router = express.Router();

router.get("/home", homeView);

router.get("/about", aboutView);

export default router;
