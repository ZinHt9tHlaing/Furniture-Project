import { Queue } from "bullmq";
import { Redis } from "ioredis";
import "dotenv/config";

const redisConnection = new Redis({
  username: process.env.REDIS_USERNAME,
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});

const ImageQueue = new Queue("imageQueue", { connection: redisConnection });

export default ImageQueue;
