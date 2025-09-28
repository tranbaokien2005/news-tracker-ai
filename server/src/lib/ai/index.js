// server/src/lib/ai/index.js
import { openaiSummarize } from "./openai.js";

/**
 * Decide which provider to use:
 * - Priority: AI_PROVIDER (openai | mock)
 * - If not set: use OpenAI if OPENAI_API_KEY/AI_API_KEY exists, otherwise fallback to mock
 */
function decideProvider() {
  const p = (process.env.AI_PROVIDER || "").toLowerCase();
  if (p) return p;
  return (process.env.OPENAI_API_KEY || process.env.AI_API_KEY) ? "openai" : "mock";
}

/**
 * Normalize summary output for FE (content + usage + provider)
 */
export async function summarizeWithAI(opts = {}) {
  const provider = decideProvider();
  console.log("[summarizeWithAI] provider =", provider);
  const { text = "", mode = "bullets", lang = "en", title, topic, model } = opts;

  if (!text || !String(text).trim()) {
    const err = new Error("Missing text");
    err.status = 400;
    err.code = "INVALID_INPUT";
    throw err;
  }

  if (provider === "openai") {
    const { content, usage } = await openaiSummarize({
      text: String(text),
      lang,
      mode,
      model,
      title,
      topic,
    });
    return { content, usage, provider: "openai" };
  }

  // ---- MOCK: generate output based on text (ensures variation per input) ----
  const sentences = String(text)
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean)
    .slice(0, 5);

  const content = mode === "bullets" ? sentences : sentences.join(" ");
  return {
    content,
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
    provider: "mock",
  };
}
