import { fetchNews, summarizeText } from "./api.js";
import { $topic, $reload, setLoading, toast, renderArticles } from "./ui.js";

async function load(topic) {
  setLoading(true);
  try {
    const data = await fetchNews(topic);

    renderArticles(data.items, {
      onSummarize: async (article, panel) => {
        panel.hidden = false;
        panel.textContent = "Summarizing…";
        try {
          const text = article.snippet || article.title || "";
          const res = await summarizeText(text);
          panel.textContent = res.summary || "(no summary)";
        } catch (e) {
          panel.textContent = `Error: ${e.message}`;
          toast("Summarize failed.");
        }
      }
    });
  } catch (e) {
    console.error(e);
    const $list = document.getElementById("news-list");
    const $status = document.getElementById("status");
    $list.innerHTML = "";
    $status.hidden = false;
    $status.textContent = `Failed to load: ${e.message}`;
    toast("Cannot load news. Check backend or mock server.");
  } finally {
    setLoading(false);
  }
}

// Events
$reload.addEventListener("click", () => load($topic.value));
$topic.addEventListener("change", () => load($topic.value));

// First load
load($topic.value || "tech");
