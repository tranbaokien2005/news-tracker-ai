import { Router } from "express";
import crypto from "crypto";
import aiRateLimit from "../middleware/aiRateLimit.js";
import { summarizeService } from "../lib/summarize.js";

const router = Router();

function buildMockSummary({ text, lang = "en", mode = "bullets", title, topic, meta = {} }) {
  const sentences = String(text || "")
    .replace(/\s+/g, " ")
    .split(/[.!?]\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const bullets = sentences.length
    ? sentences
    : ["Sample point 1.", "Sample point 2.", "Sample point 3."];

  const content = mode === "paragraph" ? bullets.join(" ") : bullets;

  return {
    content,
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

router.post("/summarize", aiRateLimit, async (req, res) => {
  const started = Date.now();
  try {
    if (process.env.NODE_ENV !== "production") {
      console.log("[route:/summarize] AI_PROVIDER=", process.env.AI_PROVIDER, "HasKey=", !!(process.env.OPENAI_API_KEY || process.env.AI_API_KEY));
    }

    const { text, lang, mode, title, topic } = req.body || {};
    if (!text || !String(text).trim()) {
      return res.status(400).json({ error: "INVALID_INPUT", message: "Field 'text' is required." });
    }

    const hasKey = !!(process.env.OPENAI_API_KEY || process.env.AI_API_KEY);
    const forceMock = (process.env.AI_PROVIDER || "").toLowerCase() === "mock";
    const useMock = forceMock || !hasKey;

    if (useMock) {
      const payload = buildMockSummary({
        text, lang, mode, title, topic,
        meta: { provider: forceMock ? "mock" : "fallback", elapsed_ms: Date.now() - started },
      });
      return res.json(payload);
    }

    const data = await summarizeService({ text, lang, mode, title, topic });
    return res.json(data);

  } catch (err) {
    if (process.env.CI === "true" || process.env.ALLOW_AI_FALLBACK === "true") {
      const { text, lang, mode, title, topic } = req.body || {};
      const payload = buildMockSummary({
        text, lang, mode, title, topic,
        meta: { provider: "fallback", reason: String(err), elapsed_ms: Date.now() - started },
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
