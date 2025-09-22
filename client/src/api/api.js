export async function fetchNews(topic = ENV.DEFAULT_TOPIC, page = 1) {
  // Ghép URL an toàn
  const base = String(ENV.API_BASE || "").replace(/\/+$/, "");
  const url = new URL(`${base}/news`);
  url.searchParams.set("topic", topic);
  url.searchParams.set("page", String(page));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Failed to fetch news: ${res.status}`);
  }
  const data = await res.json();

  // Chuẩn hoá payload để FE dùng thống nhất
  const items = Array.isArray(data?.items)
    ? data.items
    : (Array.isArray(data?.articles) ? data.articles : []);

  return {
    items,
    page: Number(data?.page ?? page),
    pageSize: Number(data?.pageSize ?? 0),
    count: Number(data?.count ?? (Array.isArray(items) ? items.length : 0)),
    cache: data?.cache || "miss",
    topic: data?.topic || topic,
  };
}

export async function summarizeText(text) {
  const base = String(ENV.API_BASE || "").replace(/\/+$/, "");
  const url = `${base}/summarize`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(`Failed to summarize: ${res.status}`);
  }
  return res.json();
}