// server/src/middleware/aiRateLimit.js
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const aiRateLimit = rateLimit({
  windowMs: Number(process.env.AI_RATE_WINDOW_MS || 60_000),
  // v7+ uses `limit` (not `max`)
  limit: Number(process.env.AI_RATE_MAX || 5),

  // Send standard rate-limit headers
  standardHeaders: "draft-7",
  legacyHeaders: false,

  // Required: generate valid keys for both IPv4 and IPv6
  keyGenerator: ipKeyGenerator(),

  // Custom handler for blocked requests
  handler: (_req, res) => {
    res.status(429).json({
      error: "RATE_LIMITED",
      message: "Too many requests, please try later.",
    });
  },
});

export default aiRateLimit