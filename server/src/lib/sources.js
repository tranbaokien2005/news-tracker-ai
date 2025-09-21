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



// ENV ví dụ:
// NEWS_SOURCES=tech:theverge,bbc,hackernews;finance:marketwatch,marketwatch-rt;world:bbc,aljazeera
function parseEnvSources(envString) {
  if (!envString) return null;

  const KNOWN = {
  // 🔄 Thay vì Reuters (đã chết), mình thay bằng MarketWatch
  // MarketWatch (finance)
  marketwatch:     { url: "https://www.marketwatch.com/rss/topstories", topic: "finance" },
  "marketwatch-rt": { url: "https://www.marketwatch.com/rss/realtimeheadlines", topic: "finance" },


  // The Verge (tech) ✅ sống
  theverge: { url: "https://www.theverge.com/rss/index.xml", topic: "tech" },

  // BBC (tech + world) ✅ sống
  "bbc-tech":  { url: "https://feeds.bbci.co.uk/news/technology/rss.xml", topic: "tech" },
  "bbc-world": { url: "https://feeds.bbci.co.uk/news/world/rss.xml", topic: "world" },

  // HackerNews làm nguồn tech thay thế
  hackernews: { url: "https://hnrss.org/frontpage", topic: "tech" },

  // Al Jazeera làm nguồn world thay thế
  aljazeera: { url: "https://www.aljazeera.com/xml/rss/all.xml", topic: "world" },
};


function resolve(name, topic) {
  // Nếu có trong KNOWN thì lấy trực tiếp
  if (KNOWN[name]) return { name, url: KNOWN[name].url };

  // Alias đặc biệt: bbc
  if (name === "bbc") {
    if (topic === "tech") return { name: "bbc", url: KNOWN["bbc-tech"].url };
    return { name: "bbc", url: KNOWN["bbc-world"].url };
  }

  // Alias đặc biệt: marketwatch → mặc định Top Stories
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

// parseEnvSources có thể trả ra object rỗng hoặc null
const parsed = parseEnvSources(process.env.NEWS_SOURCES) || {};
// merge: ENV override default
const SOURCES = { ...DEFAULT_SOURCES, ...parsed };

function getSourcesByTopic(topic = "tech") {
  const t = (topic || "tech").toLowerCase();
  return SOURCES[t] || SOURCES.tech;
}

export { getSourcesByTopic, DEFAULT_SOURCES };

