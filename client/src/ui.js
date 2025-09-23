// ===== Refs (controls, list, templates, overlays) =====
export const $topic   = document.getElementById("topic");
export const $reload  = document.getElementById("reload");
export const $list    = document.getElementById("news-list");
export const $status  = document.getElementById("status");
export const $tpl     = document.getElementById("item-tpl");
export const $toast   = document.getElementById("toast");
export const $spinner = document.getElementById("spinner");
// ===== Pager exports =====
export const $prev = document.getElementById("prevPage");
export const $next = document.getElementById("nextPage");
export const $pageIndicator = document.getElementById("pageIndicator");

// ===== Loading / Toast =====
export function setLoading(v) {
  $spinner.classList.toggle("hidden", !v);
  $spinner.setAttribute("aria-hidden", String(!v));
  [$topic, $reload, $prev, $next].forEach(el => {
    if (el) el.disabled = v;
  });
  $status.textContent = v ? "Loading…" : "";
  $status.hidden = !v;
}

export function toast(msg = "Something went wrong.") {
  $toast.textContent = msg;
  $toast.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => $toast.classList.remove("show"), 3000);
}

// ===== Utils =====
function timeAgo(iso) {
  if (!iso) return "";
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return "";
  const diff = (Date.now() - t.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

//làm gọn excerpt (cắt phần “Article URL… Comments… Points…”)
function cleanExcerpt(txt = "") {
  return String(txt)
    .replace(/Article URL:.*$/i, "")  // cắt từ "Article URL" trở đi (nếu có)
    .replace(/\s{2,}/g, " ")          // gọn khoảng trắng thừa
    .trim();
}

// ===== Renderer =====
export function renderArticles(items, { onSummarize, onRecommend } = {}) {
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

    // BE trả 'excerpt', không phải 'snippet'
    li.querySelector(".snippet").textContent = cleanExcerpt(a.excerpt || "");

    const panel   = li.querySelector(".panel");
    const btnSum  = li.querySelector(".summarize");
    const btnRec  = li.querySelector(".recommend");

    if (onSummarize) {
      btnSum.addEventListener("click", () => onSummarize(a, panel, btnSum));
    } else {
      btnSum.disabled = true;
    }

    if (onRecommend) {
      btnRec.addEventListener("click", () => onRecommend(a, panel, btnRec));
    } else {
      btnRec.disabled = true;
      btnRec.classList.add("hidden"); // ẩn khi chưa hỗ trợ
    }

    $list.appendChild(li);
  }
}

/**
 * Cập nhật trạng thái phân trang
 * @param {{page:number, totalPages:number}} param0
 */
export function updatePager({ page, totalPages }) {
  if (!$prev || !$next || !$pageIndicator) return;

  const tp = Math.max(1, Number(totalPages || 1));
  const cp = Math.min(Math.max(1, Number(page || 1)), tp);

  $pageIndicator.textContent = `Page ${cp} / ${tp}`;
  $prev.disabled = cp <= 1;
  $next.disabled = cp >= tp;
}
