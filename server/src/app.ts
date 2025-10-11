import express, { NextFunction, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { limiter } from "./middlewares/rateLimiter";

// middlewares
import { checkMiddleware, CustomRequest } from "./middlewares/check";
import { authMiddleware } from "./middlewares/authMiddleware";

// routes imports
import testRoutes from "./routes/v1/testRoutes";
import authRoutes from "./routes/v1/auth/authRoute";
import userRoutes from "./routes/v1/admin/userRoute";

// view routes
import viewRoutes from "./routes/v1/web/viewRoute";
import * as errorController from "./controllers/web/errorController";

export const app = express();

// view engine
app.set("view engine", "ejs");
app.set("views", "src/views"); // set the views directory

// cors options
let whitelist = ["http://example1.com", "http://localhost:5173"];
let corsOptions = {
  origin: function (
    origin: any,
    callback: (err: Error | null, origin?: any) => void
  ) {
    // Allow requests with no origin ( like mobile apps or curl requests as Postman )
    if (!origin) return callback(null, true);

    if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Allow cookies or authorization headers
};

// middlewares
app
  .use(morgan("dev")) // request logger
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cookieParser())
  .use(cors(corsOptions))
  .use(helmet())
  .use(compression())
  .use(limiter);

// static
app.use(express.static("public"));

// routes
app.use("/api/v1", testRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1/admins", authMiddleware, userRoutes);

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
