import { Worker } from "bullmq";
import { redis } from "../../config/redisClient";

export const cacheWorker = new Worker(
  "cache-invalidation",
  async (job) => {
    const { pattern } = job.data;
    
    await invalidateCache(pattern);
  },
  {
    connection: redis,
    concurrency: 5, // Process 5 jobs concurrently at the same time
  }
);

cacheWorker.on("completed", (job) => {
  console.log(`Job completed with result ${job.id}`);
});

cacheWorker.on("failed", (job: any, err) => {
  console.log(`Job ${job.id} failed with result ${err.message}`);
});

const invalidateCache = async (pattern: string) => {
  try {
    // scan keys
    const stream = redis.scanStream({
      match: pattern, // pattern to match keys
      count: 100,
    });

    const pipeline = redis.pipeline();
    let totalKeys = 0;

    // Process keys in batches
    stream.on("data", (keys: string[]) => {
      if (keys.length > 0) {
        keys.forEach((key) => {
          pipeline.del(key);
          totalKeys++;
        });
      }
    });

    // Wrap stream events in a Promise
    await new Promise<void>((resolve, reject) => {
      // End the stream
      stream.on("end", async () => {
        try {
          if (totalKeys > 0) {
            await pipeline.exec();
            console.log(`Invalidated ${totalKeys} keys`);
          }
          resolve();
        } catch (execError) {
          reject(execError);
        }
      });

      // Handle errors
      stream.on("error", (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.log("Cache Invalidation error: ", error);
    throw error;
  }
};
