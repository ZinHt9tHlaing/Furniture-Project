import express from "express";
import helmet from "helmet";
import compression from "compression";
import cors from "cors";
import morgan from "morgan";
import { limiter } from "./middlewares/rateLimiter";

export const app = express();

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

app
  .use(morgan("dev")) // request logger
  .use(express.urlencoded({ extended: true }))
  .use(express.json())
  .use(cors())
  .use(helmet())
  .use(compression())
  .use(limiter);

app.get("/", (req, res) => {
  res.status(200).json("Hello World!");
});
