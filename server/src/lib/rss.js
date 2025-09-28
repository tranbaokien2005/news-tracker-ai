import Parser from "rss-parser";
import pLimit from "p-limit";

const parser = new Parser({
  timeout: Number(process.env.NEWS_TIMEOUT_MS || 6000),
  headers: {
    "User-Agent": process.env.NEWS_UA || "NewsTrackerBot/1.0 (+https://example.com)",
    "Accept": "application/rss+xml, application/xml, text/xml, */*",
  },
  // Extract a few common extra fields
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["media:content", "mediaContent", { keepArray: true }],
      ["media:thumbnail", "mediaThumb", { keepArray: true }],
    ],
  },
});

function parseDateSafe(d) {
  // d can be isoDate, pubDate, or empty
  const s = (d || "").toString().trim();
  const t = s ? Date.parse(s) : NaN;
  return Number.isFinite(t) ? new Date(t).toISOString() : new Date().toISOString();
}

function stripHtml(s = "") {
  return s.replace(/<\/?[^>]+(>|$)/g, "").replace(/\s+/g, " ").trim();
}

function firstImage(item) {
  // Priority: media:content → media:thumbnail → enclosure → scan from content
  const media =
    item.mediaContent?.[0]?.$.url ||
    item.mediaThumb?.[0]?.$.url ||
    item.enclosure?.url;
  if (media) return media;

  const html = item.contentEncoded || item.content || "";
  const m = html && html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function normalizeUrl(u) {
  try {
    const url = new URL(u);
    // Remove common tracking params
    ["utm_source","utm_medium","utm_campaign","utm_term","utm_content","fbclid","gclid","yclid"]
      .forEach(k => url.searchParams.delete(k));
    return url.toString();
  } catch {
    return u || null;
  }
}

function canonicalKey(u, sourceName, title) {
  const nu = normalizeUrl(u);
  try {
    const { hostname, pathname } = new URL(nu);
    return `${hostname}${pathname}`.toLowerCase();
  } catch {
    return `${sourceName}:${(title || "").toLowerCase()}`;
  }
}

function normalizeItem(item, topic, sourceName) {
  const url = normalizeUrl(item.link || item.guid || item.id || "");
  const publishedAt = parseDateSafe(item.isoDate || item.pubDate);
  const excerptSrc = item.contentSnippet || item.summary || item.contentEncoded || item.content || "";
  return {
    id: url || `${sourceName}:${(item.title || "").trim()}`,
    title: (item.title || "Untitled").trim(),
    url,
    source: sourceName,
    topic,
    publishedAt,
    excerpt: stripHtml(excerptSrc).slice(0, 240),
    author: item.creator || item.author || sourceName,
    image: firstImage(item),
  };
}

function withTimeout(promise, ms, label = "timeout") {
  return Promise.race([
    promise,
    new Promise((_, rej) => setTimeout(() => rej(new Error(label)), ms)),
  ]);
}

async function parseURLSafe(url, { timeoutMs = 6000, retries = 1 } = {}) {
  let lastErr;
  for (let i = 0; i <= retries; i++) {
    try {
      return await withTimeout(parser.parseURL(url), timeoutMs);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export async function fetchTopicFeed(topic, sources, { maxPerSource = 30 } = {}) {
  const concurrency = Number(process.env.NEWS_CONCURRENCY || 2);
  const limit = pLimit(concurrency);

  const tasks = sources.map(src =>
    limit(async () => {
      try {
        const feed = await parseURLSafe(src.url, {
          timeoutMs: Number(process.env.NEWS_TIMEOUT_MS || 6000),
          retries: Number(process.env.NEWS_RETRY || 1),
        });
        return (feed.items || [])
          .slice(0, maxPerSource)
          .map(it => normalizeItem(it, topic, src.name));
      } catch (e) {
        console.warn(`[RSS] fail ${src.name}:`, e.message);
        return [];
      }
    })
  );

  const blocks = await Promise.all(tasks);

  // Strong dedupe by canonical key
  const seen = new Set();
  const merged = [];
  for (const it of blocks.flat()) {
    const key = canonicalKey(it.url, it.source, it.title);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(it);
  }

  // Sort newest → oldest
  merged.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  return merged;
}
