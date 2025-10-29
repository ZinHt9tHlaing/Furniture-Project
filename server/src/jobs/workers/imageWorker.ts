import { Worker } from "bullmq";
import { Redis } from "ioredis";
import path from "path";
import sharp from "sharp";

const redisConnection = new Redis({
  //   username: process.env.REDIS_USERNAME,
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT!),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
});

// Create a worker to process the image optimization job
const ImageWorker = new Worker(
  "imageQueue",
  async (job) => {
    const { filePath, filename } = job.data;
    const optimizedImagePath = path.join(
      __dirname,
      "../../..",
      "/uploads/optimizeImages",
      filename
    );
    await sharp(filePath)
      .resize(200, 200)
      .webp({ quality: 50 })
      .toFile(optimizedImagePath);
    return true;
  },
  { connection: redisConnection }
);

ImageWorker.on("completed", (job) => {
  console.log(`Job completed with result ${job.id}`);
});

ImageWorker.on("failed", (job: any, err) => {
  console.log(`Job ${job.id} failed with result ${err.message}`);
});
