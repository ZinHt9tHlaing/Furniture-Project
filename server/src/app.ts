import express, { NextFunction, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { limiter } from "./middlewares/rateLimiter";
import { checkMiddleware, CustomRequest } from "./middlewares/check";

// routes imports
import testRoutes from "./routes/v1/testRoutes";
import authRoutes from "./routes/v1/auth/authRoute";

// view routes
import viewRoutes from "./routes/v1/web/viewRoute";
import * as errorController from "./controllers/web/errorController";

export const app = express();

// view engine
app.set("view engine", "ejs");
app.set("views", "src/views"); // set the views directory

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// middlewares
app
  .use(morgan("dev")) // request logger
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cors())
  .use(helmet())
  .use(compression())
  .use(limiter);

// static
app.use(express.static("public"));

// routes
app.use("/api/v1", testRoutes);
app.use("/api/v1", authRoutes);

// view routes
app.use(viewRoutes);
// error view routes
// app.use(errorController.notFound);

app.use((error: any, req: CustomRequest, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Server Error";
  const errorCode = error.code || "Error_Code";

  res.status(status).json({ message, error: errorCode });
  next();
});
