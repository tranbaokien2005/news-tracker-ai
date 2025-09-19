// ==== Config (json-server)
const API_BASE = window.ENV?.API_BASE || "http://localhost:5050"; // json-server --watch db.json --port 5050

// ==== DOM
const $topic   = document.getElementById("topic");
const $reload  = document.getElementById("reload");
const $list    = document.getElementById("news-list");
const $status  = document.getElementById("status");
const $tpl     = document.getElementById("item-tpl");
const $toast   = document.getElementById("toast");
const $spinner = document.getElementById("spinner");

// ==== UI helpers
function setLoading(v) {
  // overlay spinner + disable controls + status text
  $spinner.classList.toggle("hidden", !v);
  $spinner.setAttribute("aria-hidden", String(!v));
  [$topic, $reload].forEach(el => (el.disabled = v));
  $status.textContent = v ? "Loading…" : "";
  $status.hidden = !v;
}
function toast(msg = "Có lỗi xảy ra. Vui lòng thử lại.") {
  $toast.textContent = msg;
  $toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => $toast.classList.remove("show"), 3800);
}
async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, { cache: "no-store", ...opts });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`);
  }
  return res.json();
}
function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ==== API (mock via json-server)
// /news trả về array; lọc theo topic ở FE (json-server không query như BE thật)
async function fetchNews(topic) {
  const all = await fetchJSON(`${API_BASE}/news`);
  const items = (all || []).filter(a => (a.topic || "tech") === topic);
  return { topic, page: 1, count: items.length, items };
}
const fetchSummarize = () => fetchJSON(`${API_BASE}/summarize`);
const fetchRecommend = () => fetchJSON(`${API_BASE}/recommend`);

// ==== Render
function renderArticles(items) {
  $list.innerHTML = "";
  if (!items?.length) {
    $status.hidden = false;
    $status.textContent = "No items.";
    return;
  }
  $status.hidden = true;

  for (const a of items) {
    const li = $tpl.content.firstElementChild.cloneNode(true);
    li.querySelector(".source").textContent = a.source || "unknown";
    li.querySelector(".time").textContent = timeAgo(a.publishedAt || new Date().toISOString());
    const $title = li.querySelector(".title");
    $title.textContent = a.title || "(no title)";
    $title.href = a.url || "#";
    li.querySelector(".snippet").textContent = a.snippet || "";

    const panel = li.querySelector(".panel");

    li.querySelector(".summarize").addEventListener("click", async () => {
      panel.hidden = false;
      panel.textContent = "Summarizing…";
      try {
        const data = await fetchSummarize();
        panel.textContent = data.summary || "(no summary)";
      } catch (e) {
        panel.textContent = `Error: ${e.message}`;
        toast("Tóm tắt thất bại (mock).");
      }
    });

    li.querySelector(".recommend").addEventListener("click", async () => {
      panel.hidden = false;
      panel.textContent = "Generating actions…";
      try {
        const data = await fetchRecommend();
        panel.textContent = (data.actions || []).map(b => `• ${b}`).join("\n");
      } catch (e) {
        panel.textContent = `Error: ${e.message}`;
        toast("Không lấy được gợi ý (mock).");
      }
    });

    $list.appendChild(li);
  }
}

// ==== Load flow
async function load(topic) {
  setLoading(true);
  try {
    const data = await fetchNews(topic);
    renderArticles(data.items);
  } catch (e) {
    console.error(e);
    $list.innerHTML = "";
    $status.hidden = false;
    $status.textContent = `Failed to load: ${e.message}`;
    toast("Không tải được dữ liệu mock. Kiểm tra json-server & db.json.");
  } finally {
    setLoading(false);
  }
}

// ==== Events
$reload.addEventListener("click", () => load($topic.value));
$topic.addEventListener("change", () => load($topic.value));

// First load
load($topic.value || "tech");
