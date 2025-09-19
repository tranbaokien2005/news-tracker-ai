// server/src/middleware/aiRateLimit.js
import rateLimit from "express-rate-limit";

const windowMs = parseInt(process.env.AI_RATE_WINDOW_MS || "60000", 10); // 60s
const max = parseInt(process.env.AI_RATE_MAX || "5", 10);               // 5 req / window

const aiRateLimit = rateLimit({
  windowMs,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req /*, res*/) => req.ip, // sau này có auth thì đổi thành userId
  handler: (_req, res /*, next, options*/) => {
    res.status(429).json({
      error: "RATE_LIMITED",
      message: "Too many requests, please try later.",
    });
  },
});

export default aiRateLimit;
