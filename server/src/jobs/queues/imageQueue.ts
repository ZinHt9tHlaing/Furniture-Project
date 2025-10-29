import { Queue } from "bullmq";
import { Redis } from "ioredis";

const redisConnection = new Redis({
  //   username: process.env.REDIS_USERNAME,
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT!),
  password: process.env.REDIS_PASSWORD,
});

const ImageQueue = new Queue("imageQueue", { connection: redisConnection });

export default ImageQueue;
