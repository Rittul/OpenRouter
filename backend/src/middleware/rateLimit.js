const redis = require("../config/redis");

const LIMIT = Number(process.env.RATE_LIMIT);
const WINDOW = Number(process.env.RATE_WINDOW);

const rateLimit = async (req, res, next) => {
  try {
    const key = `rate_limit:${req.apiKeyId}`;

    const requests = await redis.incr(key);

    if (requests === 1) {
      await redis.expire(key, WINDOW);
    }

    if (requests > LIMIT) {

      const retryAfter = await redis.ttl(key);


      return res.status(429).json({
        message: "Rate limit exceeded",
        retryAfter
      });

    }

    next();

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      message: "Rate limiter failed"
    });

  }
};

module.exports = rateLimit;