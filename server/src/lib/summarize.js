import { getCache, setCache } from "./cache.js";
import { sha256 } from "./hash.js";
import { summarizeWithAI } from "./ai/index.js";

/**
 * Chuẩn hoá text trước khi hash/gọi AI
 */
function normalizeText(raw, maxChars) {
  const s = String(raw || "").replace(/\s+/g, " ").trim();
  return s.slice(0, maxChars);
}

/**
 * Tóm tắt (validate → normalize → cache → AI → cache)
 * @param {Object} payload
 * @param {string} payload.text - văn bản cần tóm tắt (bắt buộc)
 * @param {string} [payload.lang="en"] - "auto" | "en" | "vi" | ...
 * @param {string} [payload.mode="bullets"] - "bullets" | "paragraph"
 * @param {string} [payload.title] - optional, hỗ trợ ngữ cảnh
 * @param {string} [payload.topic] - optional, gợi ý style theo topic
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
    err.status = 400; // INVALID_INPUT
    err.code = "INVALID_INPUT";
    throw err;
  }

  const maxChars = parseInt(process.env.MAX_SUMMARY_INPUT_CHARS || "8000", 10);
  if (text.length > maxChars * 3) {
    // chặn payload siêu lớn từ client
    const err = new Error("Text exceeds MAX_SUMMARY_INPUT_CHARS hard limit.");
    err.status = 413; // INPUT_TOO_LARGE
    err.code = "INPUT_TOO_LARGE";
    throw err;
  }

  // 2) Normalize + make cache key
  const normalized = normalizeText(text, maxChars);
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const key = `sum:${model}:${lang}:${mode}:${sha256(normalized)}`;

  // 3) Check cache
  const ttlSec = parseInt(process.env.SUMMARIZE_CACHE_TTL || "600", 10);
  const cached = getCache(key);
  if (cached) {
    return {
      summary: cached.content,
      mode,
      lang,
      model,
      cached: true,
      cache_ttl: ttlSec,
      usage: cached.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      meta: { hash: key.split(":").at(-1), provider: cached.provider || process.env.AI_PROVIDER || "openai", elapsed_ms: 0 },
    };
  }

  // 4) Call AI
  const started = Date.now();
  let aiRes;
  try {
    aiRes = await summarizeWithAI({ text: normalized, lang, mode, title, topic, model });
  } catch (e) {
    const err = new Error("AI_PROVIDER_ERROR: Failed to generate summary");
    err.status = e.status || 502;
    err.code = "AI_PROVIDER_ERROR";
    err.cause = e;
    throw err;
  }
  const elapsed = Date.now() - started;

  const toStore = { content: aiRes.content, usage: aiRes.usage, provider: process.env.AI_PROVIDER || "openai" };
  setCache(key, toStore, ttlSec * 1000);

  // 5) Shape response
  return {
    summary: aiRes.content,
    mode,
    lang,
    model,
    cached: false,
    cache_ttl: ttlSec,
    usage: aiRes.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    meta: { hash: key.split(":").at(-1), provider: process.env.AI_PROVIDER || "openai", elapsed_ms: elapsed },
  };
}
