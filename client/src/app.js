import { fetchNews, summarizeText } from "./api/api.js";
import {
  $topic, $reload, setLoading, toast, renderArticles, renderListHeader, $list, $status,
  $prev, $next, updatePager
} from "./ui.js";

// ---------- URL + LocalStorage helpers ----------
const STORAGE_KEY = "nta:view";

function validTopic(t) {
  const list = window.ENV?.TOPICS || ["tech", "finance", "world"];
  return list.includes(t) ? t : (window.ENV?.DEFAULT_TOPIC ?? "tech");
}

function getInitialView() {
  // 1) Ưu tiên URL ?topic=&page=
  const sp = new URLSearchParams(location.search);
  let topic = validTopic(sp.get("topic") || "");
  let page  = Math.max(1, parseInt(sp.get("page") || "1", 10) || 1);

  // 2) Nếu URL không có gì → thử lấy localStorage
  if (!sp.has("topic") && !sp.has("page")) {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (saved.topic) topic = validTopic(saved.topic);
      if (saved.page)  page  = Math.max(1, parseInt(saved.page, 10) || 1);
    } catch (_) {}
  }
  return { topic, page };
}

function persistView(topic, page) {
  // Lưu localStorage
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ topic, page })); } catch (_) {}

  // Đồng bộ URL (?topic=&page=) mà không reload
  const sp = new URLSearchParams(location.search);
  sp.set("topic", topic);
  sp.set("page", String(page));
  history.replaceState(null, "", `${location.pathname}?${sp.toString()}`);
}

// ---------- App state ----------
const initial = getInitialView();

const state = {
  topic: initial.topic,
  page: initial.page,
  totalPages: 1,
};

// Đồng bộ select ban đầu theo state
if ($topic && $topic.value !== state.topic) $topic.value = state.topic;

async function load(topic = state.topic, page = state.page) {
  // khoá pager khi đang tải để tránh spam
  if ($prev) $prev.disabled = true;
  if ($next) $next.disabled = true;

  setLoading(true);
  try {
    // Lấy thêm field cache
    const { items, page: currentPage, pageSize, count, cache } = await fetchNews(topic, page);

    // cập nhật state từ server
    state.topic = topic;
    state.page  = currentPage || page;
    state.totalPages = pageSize > 0 ? Math.ceil(count / pageSize) : 1;

    // render header meta (badge cache + page info)
    // TODO: Hide cache badge in production (only show in dev for debugging)
    renderListHeader({
      cache,                        // "hit" | "miss"
      page: state.page,
      totalPages: state.totalPages,
      count: count ?? 0
    });

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

    // Đồng bộ URL + lưu vị trí
    persistView(state.topic, state.page);

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
load(state.topic, state.page);
