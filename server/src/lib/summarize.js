import { getCache, setCache } from "./cache.js";
import { sha256 } from "./hash.js";
import { summarizeWithAI } from "./ai/index.js";

/** Normalize text before hashing/calling AI */
function normalizeText(raw, maxChars) {
  const s = String(raw || "").replace(/\s+/g, " ").trim();
  return s.slice(0, maxChars);
}

/**
 * Summarize (validate → normalize → cache → AI → cache)
 * @param {Object} payload
 * @param {string} payload.text 
 * @param {string} [payload.lang="en"]
 * @param {string} [payload.mode="bullets"] - 'bullets' | 'paragraph'
 * @param {string} [payload.title]
 * @param {string} [payload.topic]
 */
export async function summarizeService(payload = {}) {
  const {
    text,
    lang = process.env.DEFAULT_SUMMARY_LANG || "en",
    mode = process.env.DEFAULT_SUMMARY_MODE || "bullets",
    title,
    topic,
  } = payload;

  // 1) Validate
  if (!text || typeof text !== "string" || !text.trim()) {
    const err = new Error("Field 'text' is required.");
    err.status = 400;
    err.code = "INVALID_INPUT";
    throw err;
  }

  const maxChars = parseInt(process.env.MAX_SUMMARY_INPUT_CHARS || "8000", 10);
  if (text.length > maxChars * 3) {
    const err = new Error("Text exceeds MAX_SUMMARY_INPUT_CHARS hard limit.");
    err.status = 413;
    err.code = "INPUT_TOO_LARGE";
    throw err;
  }

  // 2) Normalize + make cache key
  const normalized = normalizeText(text, maxChars);
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const key = `sum:${model}:${lang}:${mode}:${sha256(normalized)}`;

  // 3) Cache
  const ttlSec = parseInt(process.env.SUMMARIZE_CACHE_TTL || "600", 10);
  const cached = getCache(key);
  if (cached) {
    return {
      content: cached.content,
      mode,
      lang,
      model,
      cached: true,
      cache_ttl: ttlSec,
      usage: cached.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      meta: {
        hash: key.split(":").at(-1),
        provider: cached.provider || process.env.AI_PROVIDER || "openai",
        elapsed_ms: 0,
      },
    };
  }

  // 4) Call AI
  const started = Date.now();
  let aiRes;
  try {
    aiRes = await summarizeWithAI({ text: normalized, lang, mode, title, topic, model });
    // aiRes: { content, usage, provider }
  } catch (e) {
    const err = new Error("AI_PROVIDER_ERROR: Failed to generate summary");
    err.status = e.status || 502;
    err.code = "AI_PROVIDER_ERROR";
    err.cause = e;
    throw err;
  }
  const elapsed = Date.now() - started;

  // 5) Store to cache
  setCache(
    key,
    {
      content: aiRes.content,
      usage: aiRes.usage,
      provider: aiRes.provider || process.env.AI_PROVIDER || "openai",
    },
    ttlSec * 1000
  );

  // 6) Shape response
  return {
    content: aiRes.content,
    mode,
    lang,
    model,
    cached: false,
    cache_ttl: ttlSec,
    usage: aiRes.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    meta: {
      hash: key.split(":").at(-1),
      provider: aiRes.provider || process.env.AI_PROVIDER || "openai",
      elapsed_ms: elapsed,
    },
  };
}
