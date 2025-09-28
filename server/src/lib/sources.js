const DEFAULT_SOURCES = {
  tech: [
    { name: "theverge", url: "https://www.theverge.com/rss/index.xml" },
    { name: "bbc", url: "https://feeds.bbci.co.uk/news/technology/rss.xml" },
    { name: "hackernews", url: "https://hnrss.org/frontpage" }
  ],
  finance: [
    { name: "marketwatch-top", url: "https://www.marketwatch.com/rss/topstories" },
    { name: "marketwatch-rt", url: "https://www.marketwatch.com/rss/realtimeheadlines" }
  ],
  world: [
    { name: "bbc", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
    { name: "aljazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" }
  ]
};

/**
 * Parse sources from ENV string and override defaults when provided.
 *
 * ENV example:
 *   NEWS_SOURCES=tech:theverge,bbc,hackernews;finance:marketwatch,marketwatch-rt;world:bbc,aljazeera
 *
 * Resulting shape:
 *   {
 *     tech:    [{ name, url }, ...],
 *     finance: [{ name, url }, ...],
 *     world:   [{ name, url }, ...]
 *   }
 */
function parseEnvSources(envString) {
  if (!envString) return null;

  // Known source aliases mapped to URLs and default topic (for reference only)
  const KNOWN = {
    // MarketWatch (finance)
    marketwatch:      { url: "https://www.marketwatch.com/rss/topstories", topic: "finance" },
    "marketwatch-rt": { url: "https://www.marketwatch.com/rss/realtimeheadlines", topic: "finance" },

    // The Verge (tech)
    theverge: { url: "https://www.theverge.com/rss/index.xml", topic: "tech" },

    // BBC (tech + world)
    "bbc-tech":  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", topic: "tech" },
    "bbc-world": { url: "https://feeds.bbci.co.uk/news/world/rss.xml", topic: "world" },

    // Hacker News (tech)
    hackernews: { url: "https://hnrss.org/frontpage", topic: "tech" },

    // Al Jazeera (world)
    aljazeera: { url: "https://www.aljazeera.com/xml/rss/all.xml", topic: "world" },
  };

  function resolve(name, topic) {
    // Direct match in KNOWN table
    if (KNOWN[name]) return { name, url: KNOWN[name].url };

    // Special alias: "bbc" picks tech/world feed by topic
    if (name === "bbc") {
      if (topic === "tech") return { name: "bbc", url: KNOWN["bbc-tech"].url };
      return { name: "bbc", url: KNOWN["bbc-world"].url };
    }

    // Special alias: "marketwatch" defaults to Top Stories
    if (name === "marketwatch") {
      return { name: "marketwatch", url: KNOWN["marketwatch"].url };
    }

    return null;
  }

  const result = {};
  for (const block of envString.split(";")) {
    const [rawTopic, csv] = block.split(":").map(s => s && s.trim());
    if (!rawTopic || !csv) continue;

    const topic = rawTopic.toLowerCase();
    const names = csv.split(",").map(s => s.trim()).filter(Boolean);

    const arr = [];
    for (const n of names) {
      const item = resolve(n, topic);
      if (item && item.url) arr.push(item);
    }
    if (arr.length) result[topic] = arr;
  }
  return Object.keys(result).length ? result : null;
}

// Note: parseEnvSources may return an empty object or null
const parsed = parseEnvSources(process.env.NEWS_SOURCES) || {};
// Merge: ENV overrides defaults where provided
const SOURCES = { ...DEFAULT_SOURCES, ...parsed };

function getSourcesByTopic(topic = "tech") {
  const t = (topic || "tech").toLowerCase();
  return SOURCES[t] || SOURCES.tech;
}

export { getSourcesByTopic, DEFAULT_SOURCES };
