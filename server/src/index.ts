import "dotenv/config";
import { app } from "./app";
import { redisClient } from "./config/redisClient";

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server ready at: http://localhost:${PORT}`);
});

// Connect to Redis
redisClient.connect().then(() => {
  console.log("Connected to Redis");
}).catch((err) => console.log(err));
