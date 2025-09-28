import OpenAI from "openai";

/**
 * Call OpenAI to generate a text summary.
 * @param {Object} params
 * @param {string} params.text - Input text to summarize (required).
 * @param {string} [params.lang="en"] - Language code, or "auto" to detect.
 * @param {"bullets"|"paragraph"} [params.mode="bullets"] - Output format.
 * @param {string} [params.model] - OpenAI model (defaults to AI_MODEL env or gpt-4o-mini).
 * @param {string} [params.title] - Optional title to provide context.
 * @param {string} [params.topic] - Optional topic to guide style.
 * @returns {Promise<{content: string, usage: object}>}
 * @throws {Error} Missing API key or failed completion.
 */
export async function openaiSummarize({
  text,
  lang = "en",
  mode = "bullets",
  model = process.env.AI_MODEL || "gpt-4o-mini",
  title,
  topic,
}) {
  // Get API key from env; avoid top-level client creation
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const err = new Error("Missing OPENAI_API_KEY/AI_API_KEY");
    err.status = 502;
    throw err;
  }
  const client = new OpenAI({ apiKey });

  const modeHint =
    mode === "paragraph"
      ? "Write one compact paragraph (~80–120 words)."
      : "Write 3–5 concise bullet points.";
  const langHint =
    lang && lang !== "auto"
      ? `Write in ${lang}.`
      : "Detect the input language and write in that language.";
  const topicHint = topic ? `Topic: ${topic}.` : "";

  const system = [
    "You are a precise news summarizer.",
    "Preserve facts, names, numbers, tickers, and dates. Avoid speculation.",
    "No headings, no emojis.",
  ].join(" ");

  const user = [
    title ? `Title: ${title}` : "",
    topicHint,
    `Style: ${modeHint}`,
    langHint,
    "",
    "=== ARTICLE START ===",
    text,
    "=== ARTICLE END ===",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const r = await client.chat.completions.create({
      model,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const content = r?.choices?.[0]?.message?.content?.trim() || "";
    if (!content) {
      const err = new Error("Empty completion from model");
      err.status = 502;
      throw err;
    }
    return {
      content,
      usage:
        r?.usage || {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0,
        },
    };
  } catch (e) {
    const err = new Error("Failed to generate summary");
    err.status = 502;
    err.cause = e;
    throw err;
  }
}
