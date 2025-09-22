import { fetchNews, summarizeText } from "./api/api.js";
import {
  $topic, $reload, setLoading, toast, renderArticles, $list, $status,
  $prev, $next, updatePager
} from "./ui.js";

const state = {
  topic: ($topic?.value) || (window.ENV?.DEFAULT_TOPIC ?? "tech"),
  page: 1,
  totalPages: 1,
};

async function load(topic = state.topic, page = state.page) {
  // khoá pager khi đang tải để tránh spam
  if ($prev) $prev.disabled = true;
  if ($next) $next.disabled = true;

  setLoading(true);
  try {
    const { items, page: currentPage, pageSize, count } = await fetchNews(topic, page);

    // cập nhật state từ server
    state.topic = topic;
    state.page = currentPage || page;
    state.totalPages = pageSize > 0 ? Math.ceil(count / pageSize) : 1;

    // render list
    renderArticles(items, {
      onSummarize: async (article, panel, btn) => {
        panel.hidden = false;
        panel.textContent = "Summarizing…";
        btn.disabled = true;
        try {
          const text = article.excerpt || article.title || "";
          const res = await summarizeText(text);
          panel.textContent = res.summary || "(no summary)";
        } catch (e) {
          panel.textContent = `Error: ${e.message}`;
          toast("Summarize failed.");
        } finally {
          btn.disabled = false;
        }
      }
    });

    // Ẩn status nếu đang hiện lỗi
    $status.hidden = true;
    $status.textContent = "";

    // cập nhật paginator
    updatePager({ page: state.page, totalPages: state.totalPages });

    // UX: kéo lên đầu danh sách mỗi lần đổi trang
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    console.error(e);
    $list.innerHTML = "";
    $status.hidden = false;
    $status.textContent = `Failed to load: ${e.message}`;
    toast("Cannot load news. Check backend or mock server.");

    // vẫn cập nhật pager để phản ánh trạng thái hiện tại
    updatePager({ page: state.page, totalPages: Math.max(state.totalPages, 1) });
  } finally {
    setLoading(false);
  }
}

// Events
$reload.addEventListener("click", () => {
  state.page = 1;                  // reload về trang 1
  load(state.topic, state.page);
});

$topic.addEventListener("change", () => {
  state.topic = $topic.value;      // tech | finance | world
  state.page = 1;                  // đổi topic reset trang
  load(state.topic, state.page);
});

$prev?.addEventListener("click", () => {
  if (state.page > 1) {
    state.page -= 1;
    load(state.topic, state.page);
  }
});

$next?.addEventListener("click", () => {
  if (state.page < state.totalPages) {
    state.page += 1;
    load(state.topic, state.page);
  }
});

// Boot
load(state.topic, 1);
