import { fetchNews, summarizeText } from "./api/api.js";
import { $topic, $reload, setLoading, toast, renderArticles, $list, $status } from "./ui.js";

async function load(topic) {
  setLoading(true);
  try {
    const data = await fetchNews(topic);

    renderArticles(data.items, {
      onSummarize: async (article, panel, btn) => {
        panel.hidden = false;
        panel.textContent = "Summarizing…";
        btn.disabled = true;               // chống bấm liên tục
        try {
          const text = article.snippet || article.title || "";
          const res = await summarizeText(text);
          panel.textContent = res.summary || "(no summary)";
        } catch (e) {
          panel.textContent = `Error: ${e.message}`;
          toast("Summarize failed.");
        } finally {
          btn.disabled = false;
        }
      }
      // Chưa có recommend → không truyền
    });
  } catch (e) {
    console.error(e);
    $list.innerHTML = "";
    $status.hidden = false;
    $status.textContent = `Failed to load: ${e.message}`;
    toast("Cannot load news. Check backend or mock server.");
  } finally {
    setLoading(false);
  }
}

$reload.addEventListener("click", () => load($topic.value));
$topic.addEventListener("change", () => load($topic.value));
load($topic.value || "tech");
