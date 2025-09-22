import { fetchNews, summarizeText } from "./api/api.js";
import { $topic, $reload, setLoading, toast, renderArticles, $list, $status, $prev, $next, updatePager } from "./ui.js";


const state = {
  topic: "tech",
  page: 1,
  totalPages: 1,
};

async function load(topic = state.topic, page = state.page) {
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
          // ⚠️ BE dùng 'excerpt', không phải 'snippet'
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

    // cập nhật paginator nếu có
    // if (typeof updatePager === "function") {
    //   updatePager({ page: state.page, totalPages: state.totalPages });
    // }
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

// Events
$reload.addEventListener("click", () => {
  state.page = 1;                  // reload về trang 1
  load(state.topic, state.page);
});

$topic.addEventListener("change", () => {
  state.topic = $topic.value;      // nhớ đã có option 'world'
  state.page = 1;                  // đổi topic reset trang
  load(state.topic, state.page);
});

// Nếu bạn đã có nút Prev/Next trong HTML & binding trong ui.js:
// $prev?.addEventListener("click", () => {
//   if (state.page > 1) {
//     state.page -= 1;
//     load(state.topic, state.page);
//   }
// });
// $next?.addEventListener("click", () => {
//   if (state.page < state.totalPages) {
//     state.page += 1;
//     load(state.topic, state.page);
//   }
// });

// Boot
load($topic.value || "tech", 1);

