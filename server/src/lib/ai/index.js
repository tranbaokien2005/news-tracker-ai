import { openaiSummarize } from "./openai.js";

/**
 * Adapter theo provider. Hiện hỗ trợ 'openai'.
 * Trả về { content, usage }.
 */
export async function summarizeWithAI(opts) {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();

  switch (provider) {
    case "openai":
      return openaiSummarize(opts);
    default: {
      const err = new Error(`Unsupported AI_PROVIDER: ${provider}`);
      err.status = 502;
      throw err;
    }
  }
}
