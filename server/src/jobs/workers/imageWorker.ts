import { Worker } from "bullmq";

import path from "path";
import sharp from "sharp";
import "dotenv/config";

import { redis } from "../../config/redisClient";

// Create a worker to process the image optimization job
const ImageWorker = new Worker(
  "imageQueue",
  async (job) => {
    const { filePath, fileName, width, height, quality } = job.data;

    // get optimized image file path
    const optimizedImagePath = path.join(
      __dirname,
      "../../..",
      "/uploads/optimizeImages",
      fileName
    );

    // optimize image
    await sharp(filePath)
      .resize(width, height)
      .webp({ quality: quality })
      .toFile(optimizedImagePath);
  },
  { connection: redis }
);

ImageWorker.on("completed", (job) => {
  console.log(`Job completed with result ${job.id}`);
});

ImageWorker.on("failed", (job: any, err) => {
  console.log(`Job ${job.id} failed with result ${err.message}`);
});
