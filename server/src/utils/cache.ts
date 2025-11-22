import { redis } from "../config/redisClient";

// key => cache key
// cb => callback function, for get data from database and cache in Redis

export const getOrSetCache = async (key: any, cb: any) => {
  try {
    // Check if the data exists in Redis
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log("Cache hit");
      return JSON.parse(cachedData); // JSON String to JS Object
    }

    // If not in Redis, fetch from the database
    console.log("Cache miss");
    const freshData = await cb(); // Get data from database
    await redis.setex(key, 3600, JSON.stringify(freshData)); // Cache for 1 hour
    return freshData;
  } catch (error) {
    console.error("Redis Error", error);
    throw error;
  }
};
