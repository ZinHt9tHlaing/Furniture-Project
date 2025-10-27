import { createClient } from "redis";

export const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-18993.crce194.ap-seast-1-1.ec2.redns.redis-cloud.com",
    port: 18993,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

// await redisClient.set("foo", "bar");
// const result = await redisClient.get("foo");
// console.log(result); // >>> bar
