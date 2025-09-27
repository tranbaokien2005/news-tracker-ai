# 📝 UI Spec v1 – Final (News Tracker AI)

## 1. Style Direction

* **Modern Minimal**: clean, trung tính, techy.
* **Dark mode** mặc định.
* **Card-based design**: mỗi bài báo là một card, có khoảng cách rõ ràng, dễ scan.
* **Accent vừa phải**: dùng 1 màu chính cho trạng thái, nút, highlight.
* **Trải nghiệm**: tập trung vào đọc → line-height rộng, contrast rõ.

---

## 2. Tone Màu (Neutral + Blue)

* **Background**: `#0b0b0c`
* **Card**: `#141416`
* **Border**: `#2a2a2a`
* **Text**: `#f2f2f2`
* **Muted**: `#9aa0a6`
* **Accent**: `#3b82f6`
* **Success**: `#22c55e`
* **Error**: `#ef4444`
* **Info (bổ sung)**: `#38bdf8`
* **Warning (bổ sung)**: `#f59e0b`

---

## 3. Typography System

* **Font**: system-ui / Inter / Roboto.
* **Size & weight**:

  * H1 (page title): 24px / bold / line-height 1.4
  * H2 (article title): 18px / semibold / line-height 1.4
  * H3 (section title): 16px / semibold / line-height 1.45
  * H4 (subsection): 14px / semibold / line-height 1.5
  * Body text (excerpt): 15–16px / regular / line-height 1.5
  * Meta (source/time): 13–14px / medium / line-height 1.6, muted color

---

## 4. Card Shape & Spacing

* Border-radius: 16px (card), 12px (thumbnail).
* Padding card: 16px.
* Margin giữa card: 12–16px.
* Shadow: nhẹ, `0 6px 20px rgba(0,0,0,.35)`.

---

## 5. Layout Tổng Thể

* Container max-width: 960–1024px.
* Grid:

  * Mobile: 1 cột.
  * Desktop: 2 cột (sidebar trái 240px cho filters/status, main feed bên phải).
* Spacing sidebar–main: 24px.

---

## 6. States Chuẩn

* **Loading**: skeleton card, shimmer 1.5s linear infinite.
* **Empty**: icon/illustration line style + text muted + nút Reload.
* **Error**: toast đỏ, auto hide 3s, nút Retry.
* **Warning/Info (bổ sung)**: toast vàng/xanh khi cần thông báo nhẹ.

---

## 7. Interaction

* Hover card: `translateY(-2px)`, `brightness(1.05)`, transition 150–200ms ease-in-out.
* Hover button: accent sáng hơn 10%.
* Focus: outline accent, offset 2px.
* Summarize: inline mở rộng dưới excerpt, toggle bullet/paragraph.

---

## 8. Branding

* Header: logo nhỏ/emoji.
* Footer: “Made with ❤️ by \<Tên bạn>”.
* README: badge **Live Demo** + screenshots.

---

## 9. Components Nhỏ

* **Button**: accent (#3b82f6), radius 8px, padding 8–12px, transition 150ms.
* **Badge**: success (xanh lá), error (đỏ), info (xanh), warning (vàng), cached/live indicator.
* **Toast**: top-right, auto hide 3s, màu theo state.
* **Form elements (bổ sung)**:

  * Input: bg card, border `#2a2a2a`, focus border accent.
  * Select: padding 8–12px, radius 8px, hover bg `#1f1f23`.

---

## 10. Accessibility (A11y)

* Contrast ratio ≥ 4.5 cho text chính.
* Keyboard tab → focus rõ ràng.
* Alt text cho ảnh (title/source).
* Responsive typography (scale nhẹ theo viewport).

---

## 11. Design Tokens

```css
--color-bg: #0b0b0c;
--color-card: #141416;
--color-border: #2a2a2a;
--color-text: #f2f2f2;
--color-muted: #9aa0a6;
--color-accent: #3b82f6;
--color-success: #22c55e;
--color-error: #ef4444;
--color-info: #38bdf8;
--color-warning: #f59e0b;

--font-h1: 24px/700;
--font-h2: 18px/600;
--font-h3: 16px/600;
--font-h4: 14px/600;
--font-body: 15px/400;
--font-meta: 13px/500;

--radius-card: 16px;
--radius-thumb: 12px;

--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

--shadow-card: 0 6px 20px rgba(0,0,0,.35);
--transition-base: 150ms ease-in-out;
```

---

## 12. Responsive Breakpoints

* **sm**: 640px → mobile
* **md**: 768px → tablet
* **lg**: 1024px → desktop
* **xl**: 1280px → large desktop

---

## 13. Icons

* Style: line icons (Lucide/Feather).
* Size: 16px (meta), 20–24px (action buttons).
* Color: muted text / accent tùy ngữ cảnh.

---

## 14. Motion / Animation

* Transition: 150–200ms ease-in-out (hover, focus, buttons).
* Skeleton shimmer: 1.5s linear infinite.
* Hover card: `translateY(-2px) + brightness(1.05)`.
* Toast: fade-in/out 200ms.


15. Illustration Style (bổ sung)

Empty state: dùng line illustration hoặc icon style tối giản (2 màu: muted + accent).

Không dùng ảnh stock hoặc hình quá phức tạp.

Ví dụ: feather-style icons hoặc Heroicons outline.

16. Grid Examples (bổ sung)
[ Mobile ]
--------------------
|  Article Card    |
|  Article Card    |
|  Article Card    |
--------------------

[ Desktop ]
-------------------------------------------------
| Sidebar (240px) |      Main Feed (cards)      |
| Filters/Status  |  Card   Card   Card         |
-------------------------------------------------


Sidebar–main spacing: 24px.

Card grid trong main: 1 cột mobile, 2–3 cột desktop nếu cần.

17. Naming Convention (bổ sung)

Cards: card-article, card-skeleton

Buttons: btn-primary, btn-secondary, btn-accent

Badges: badge-success, badge-error, badge-info, badge-warning

Toast: toast-success, toast-error, …

Form: input-base, select-base
👉 Nếu dùng Tailwind, có thể gom vào component classes hoặc utility-first + @apply.