const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL);

redis.once("ready", () => {
  console.log("✅ Redis Connected");
});

redis.on("error", (err) => {
  console.error("Redis Error:", err.message);
});

module.exports = redis;