// client/src/api.js

export async function fetchNews(topic = ENV.DEFAULT_TOPIC, page = 1) {
  const url = `${ENV.API_BASE}/news?topic=${encodeURIComponent(topic)}&page=${page}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch news: ${res.status}`);
  }
  return res.json();
}

export async function summarizeText(text) {
  const url = `${ENV.API_BASE}/summarize`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (!res.ok) {
    throw new Error(`Failed to summarize: ${res.status}`);
  }
  return res.json();
}
