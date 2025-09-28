import { Router } from "express";
import { getSourcesByTopic } from "../lib/sources.js";
import { fetchTopicFeed } from "../lib/rss.js";
import { getCache, setCache, delCache } from "../lib/cache.js";
import summarizeRouter from "./summarize.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.json({ ok: true, version: "v1" });
});

// GET /api/v1/news?topic=tech&page=1&forceRefresh=0
router.get("/news", async (req, res) => {
  try {
    // 4) Validate/sanitize topic theo flag
    const allowed = new Set(["tech", "finance", "world"]);
    const rawTopic = String(req.query.topic || "").toLowerCase();
    const strict =
      String(process.env.VALIDATE_TOPIC_STRICT || "false").toLowerCase() === "true";

    let topic;
    if (allowed.has(rawTopic)) {
      topic = rawTopic;
    } else if (strict) {
      return res.status(400).json({
        error: "INVALID_TOPIC",
        message: "Topic must be one of: tech, finance, world",
      });
    } else {
      topic = "tech"; // fallback ở chế độ non-strict (MVP/demo)
    }

    const page = Math.max(parseInt(req.query.page || "1", 10), 1);

    // 1) pageSize từ ENV (1..100)
    const pageSize = Math.min(
      Math.max(parseInt(process.env.NEWS_PAGE_SIZE || "30", 10), 1),
      100
    );

    // ✅ TTL: đọc giây từ ENV, đổi sang milliseconds cho cache.js
    const ttlSec = parseInt(
      process.env.NEWS_CACHE_TTL || process.env.CACHE_TTL || "300",
      10
    );
    const ttlMs = ttlSec * 1000;

    // 2) Force refresh
    const forceRefresh = req.query.forceRefresh === "1";
    const cacheKey = `news:${topic}`;
    if (forceRefresh) delCache(cacheKey);

    // 3) Cache hit/miss
    let allItems = getCache(cacheKey);
    const cacheHit = Boolean(allItems);

    if (!allItems) {
      const sources = getSourcesByTopic(topic);
      allItems = await fetchTopicFeed(topic, sources);
      if (!allItems.length) {
        return res.status(502).json({
          error: "UPSTREAM_FETCH_FAILED",
          message: "Không lấy được RSS từ các nguồn.",
        });
      }
      setCache(cacheKey, allItems, ttlMs); // dùng ms
    }

    const count = allItems.length;
    const start = (page - 1) * pageSize;
    const items = allItems.slice(start, start + pageSize);

    res.json({
      topic,
      page,
      pageSize,
      count,
      cache: cacheHit ? "hit" : "miss",
      items,
    });
  } catch (err) {
    console.error(err);
    res.status(502).json({
      error: "UPSTREAM_FETCH_FAILED",
      message: "Có lỗi khi lấy RSS.",
    });
  }
});
router.use("/", summarizeRouter);

export default router;

