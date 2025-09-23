// server/src/middleware/aiRateLimit.js
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

const aiRateLimit = rateLimit({
  windowMs: Number(process.env.AI_RATE_WINDOW_MS || 60_000),
  // v7+ dùng 'limit' (không phải 'max')
  limit: Number(process.env.AI_RATE_MAX || 5),

  // headers chuẩn
  standardHeaders: "draft-7",
  legacyHeaders: false,

  // ✅ BẮT BUỘC: sinh key hợp lệ cho IPv4/IPv6
  keyGenerator: ipKeyGenerator(),

  handler: (_req, res) => {
    res.status(429).json({
      error: "RATE_LIMITED",
      message: "Too many requests, please try later.",
    });
  },
});

export default aiRateLimit;
