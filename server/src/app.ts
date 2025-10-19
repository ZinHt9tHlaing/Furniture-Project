import express, { NextFunction, Response } from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { limiter } from "./middlewares/rateLimiter";
import path from "path";

// i18n
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import middleware from "i18next-http-middleware"; // connected express and i18next

// middlewares
import { CustomRequest } from "./middlewares/check";

// routes imports
import routes from "./routes/v1/indexRoute";

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

i18next
  .use(Backend) // Get the translation file
  .use(middleware.LanguageDetector) // Detect the language
  .init({
    backend: {
      loadPath: path.join(
        process.cwd(),
        "src/locales",
        "{{lng}}",
        "{{ns}}.json"
      ),
    },
    detection: {
      order: ["querystring", "cookie"],
      caches: ["cookie"],
    },
    fallbackLng: "en",
    preload: ["en", "mm"],
  });
app.use(middleware.handle(i18next));

// static
app.use(express.static("public"));

// routes
app.use(routes);

app.use((error: any, req: CustomRequest, res: Response, next: NextFunction) => {
  const status = error.status || 500;
  const message = error.message || "Server Error";
  const errorCode = error.code || "Error_Code";

  res.status(status).json({ message, error: errorCode });
  next();
});
