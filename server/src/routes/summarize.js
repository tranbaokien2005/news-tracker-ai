// server/src/routes/summarize.js
import { Router } from "express";
import crypto from "crypto";
import aiRateLimit from "../middleware/aiRateLimit.js";
import { summarizeService } from "../lib/summarize.js";

const router = Router();

function buildMockSummary({ text, lang = "en", mode = "bullets", title, topic, meta = {} }) {
  // lấy vài câu đầu làm bullets đơn giản
  const sentences = String(text || "")
    .replace(/\s+/g, " ")
    .split(/[.!?]\s+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const bullets = sentences.length
    ? sentences
    : ["Sample point 1.", "Sample point 2.", "Sample point 3."];

  const summary = mode === "paragraph"
    ? bullets.join(" ")
    : "• " + bullets.join("\n• ");

  return {
    summary,
    mode,
    lang,
    model: "mock",
    cached: false,
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    meta: {
      provider: meta.provider || "mock",
      reason: meta.reason,
      title,
      topic,
      hash: crypto.createHash("sha256").update(String(text || "")).digest("hex"),
      elapsed_ms: meta.elapsed_ms ?? 5,
    },
  };
}

/**
 * POST /api/v1/summarize
 * Body: { text, lang?, mode?, title?, topic? }
 */
router.post("/summarize", aiRateLimit, async (req, res) => {
  const started = Date.now();
  try {
    const { text, lang, mode, title, topic } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "INVALID_INPUT", message: "Field 'text' is required." });
    }

    const useMock = process.env.AI_PROVIDER === "mock" || !process.env.AI_API_KEY;

    // 1) Chạy mock nếu được yêu cầu (CI/dev)
    if (useMock) {
      const payload = buildMockSummary({
        text, lang, mode, title, topic,
        meta: { provider: "mock", elapsed_ms: Date.now() - started },
      });
      return res.json(payload);
    }

    // 2) Provider thật (OpenAI, v.v.)
    const data = await summarizeService({ text, lang, mode, title, topic });
    return res.json(data);

  } catch (err) {
    // 3) Cho phép fallback an toàn khi chạy CI
    if (process.env.CI === "true" || process.env.ALLOW_AI_FALLBACK === "true") {
      const { text, lang, mode, title, topic } = req.body || {};
      const payload = buildMockSummary({
        text, lang, mode, title, topic,
        meta: { provider: "fallback", reason: String(err), elapsed_ms: Date.now() - (req._startedAt || Date.now()) },
      });
      return res.json(payload);
    }

    const status = err.status || 502;
    const code = err.code || "AI_PROVIDER_ERROR";
    const message = err.message || "Failed to generate summary.";
    if (status >= 500) console.error(err);
    return res.status(status).json({ error: code, message });
  }
});

export default router;
