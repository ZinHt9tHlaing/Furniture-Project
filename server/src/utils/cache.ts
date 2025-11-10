import { redis } from "../config/redisClient";

// key => for get in Redis
// cb => if does not have in cache, a callback function to pull data from the database and cache in Redis
export const getOrSetCache = async (key: any, cb: any) => {
  try {
    const cachedData = await redis.get(key);
    if (cachedData) {
      console.log("Cache hit");
      return JSON.parse(cachedData); // JSON to JS Object
    }

    console.log("Cache miss");
    const freshData = await cb();
    await redis.setex(key, 3600, JSON.stringify(freshData)); // Cache for 1 hour
    return freshData;
  } catch (error) {
    console.error("Redis Error", error);
    throw error;
  }
};
