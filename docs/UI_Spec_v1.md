# UI Specification v1 – Final (News Tracker AI)

## 1. Style Direction

* **Modern Minimal**: clean, neutral, technology-focused.
* **Default Dark Mode** for consistent experience.
* **Card-Based Layout**: each article is presented as a card with clear spacing, optimized for scanning.
* **Subtle Accents**: one primary accent color for highlights, actions, and states.
* **Reading Experience First**: wide line-height, strong contrast, uncluttered design.

---

## 2. Color Palette (Neutral + Blue)

* **Background**: `#0b0b0c`
* **Card**: `#141416`
* **Border**: `#2a2a2a`
* **Text (primary)**: `#f2f2f2`
* **Muted text**: `#9aa0a6`
* **Accent**: `#3b82f6`
* **Success**: `#22c55e`
* **Error**: `#ef4444`
* **Info**: `#38bdf8`
* **Warning**: `#f59e0b`

---

## 3. Typography System

* **Font family**: system-ui / Inter / Roboto.
* **Hierarchy**:

  * H1 (page title): 24px, bold, 1.4 line-height
  * H2 (article title): 18px, semibold, 1.4 line-height
  * H3 (section title): 16px, semibold, 1.45 line-height
  * H4 (subsection): 14px, semibold, 1.5 line-height
  * Body text (excerpt): 15–16px, regular, 1.5 line-height
  * Meta (source, time): 13–14px, medium, 1.6 line-height, muted color

---

## 4. Card Shape & Spacing

* Border-radius: 16px (cards), 12px (thumbnails).
* Card padding: 16px.
* Card margin: 12–16px.
* Shadow: subtle `0 6px 20px rgba(0,0,0,0.35)`.

---

## 5. Layout

* Max container width: 960–1024px.
* **Grid**:

  * Mobile: 1 column.
  * Desktop: 2 columns (sidebar: 240px for filters/status, main feed beside).
* Sidebar–main spacing: 24px.

---

## 6. UI States

* **Loading**: skeleton cards, shimmer (1.5s linear infinite).
* **Empty**: minimal illustration or line icon, muted text, reload button.
* **Error**: red toast, auto-hide after 3s, retry button.
* **Warning/Info**: yellow/blue toast for lightweight notifications.

---

## 7. Interaction

* Hover (card): `translateY(-2px)`, `brightness(1.05)`, smooth transition (150–200ms).
* Hover (button): accent color lightened by 10%.
* Focus: accent outline with 2px offset.
* Summarize toggle: expand/collapse under excerpt with bullet/paragraph mode switch.

---

## 8. Branding

* Header: minimal logo or small mark.
* Footer: “Made with ❤️ by <Your Name>”.
* README: include “Live Demo” badge and screenshots.

---

## 9. Components

* **Buttons**: accent `#3b82f6`, radius 8px, padding 8–12px, 150ms transition.
* **Badges**: success (green), error (red), info (blue), warning (yellow), cached/live indicator.
* **Toast**: top-right position, auto-hide in 3s, colors per state.
* **Form Elements**:

  * Input: card background, `#2a2a2a` border, accent border on focus.
  * Select: padding 8–12px, radius 8px, hover background `#1f1f23`.

---

## 10. Accessibility (A11y)

* Minimum contrast ratio: 4.5 for body text.
* Keyboard navigation: visible focus outline.
* Alt text for all images (title/source).
* Responsive typography with slight scaling across breakpoints.

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

--shadow-card: 0 6px 20px rgba(0,0,0,0.35);
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

* Style: line icons (Lucide / Feather).
* Size: 16px (meta), 20–24px (actions).
* Color: muted text or accent depending on context.

---

## 14. Motion / Animation

* General transition: 150–200ms ease-in-out (hover, focus, buttons).
* Skeleton shimmer: 1.5s linear infinite.
* Hover card: `translateY(-2px)` with slight brightness.
* Toast: fade-in/out in 200ms.

---

## 15. Illustration Style

* Empty state: line illustration, minimal (2 colors: muted + accent).
* Avoid stock photos or complex visuals.
* Preferred: outline/feather-style icons, Heroicons outline.

---

## 16. Grid Examples

**Mobile**

```
--------------------
|  Article Card    |
|  Article Card    |
|  Article Card    |
--------------------
```

**Desktop**

```
-------------------------------------------------
| Sidebar (240px) |      Main Feed (cards)      |
| Filters/Status  |  Card   Card   Card         |
-------------------------------------------------
```

* Sidebar–main spacing: 24px.
* Card grid: 1 column (mobile), 2–3 columns (desktop).

---

## 17. Naming Convention

* **Cards**: `card-article`, `card-skeleton`
* **Buttons**: `btn-primary`, `btn-secondary`, `btn-accent`
* **Badges**: `badge-success`, `badge-error`, `badge-info`, `badge-warning`
* **Toast**: `toast-success`, `toast-error`, …
* **Form**: `input-base`, `select-base`
* With Tailwind: can be grouped via `@apply` for reusable component classes.
