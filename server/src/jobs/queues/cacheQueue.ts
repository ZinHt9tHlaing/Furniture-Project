import { Queue } from "bullmq";
import "dotenv/config";

import { redis } from "../../config/redisClient";

const CacheQueue = new Queue("cache-invalidation", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3, // max attempts
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: true, // remove job from queue when completed
    removeOnFail: 1000, // remove job from queue after 1 second
  },
});

export default CacheQueue;
