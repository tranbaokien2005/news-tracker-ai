import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
});

/**
 * Gọi OpenAI để tóm tắt văn bản.
 * Trả về { content, usage }
 */
export async function openaiSummarize({
  text,
  lang = "en",
  mode = "bullets",
  model = process.env.AI_MODEL || "gpt-4o-mini",
  title,
  topic,
}) {
  if (!process.env.AI_API_KEY) {
    const err = new Error("Missing AI_API_KEY");
    err.status = 502;
    throw err;
  }

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
    "Preserve facts, names, numbers, tickers, dates. Avoid speculation.",
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
      usage: r?.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0,
      },
    };
  } catch (e) {
    // Chuẩn hoá lỗi cho tầng route xử lý
    const err = new Error("Failed to generate summary");
    err.status = 502;
    err.cause = e;
    throw err;
  }
}
