# API Contract v1

**Base URL (dev):** `http://localhost:5051/api/v1`

### Common Headers

* **Requests:** `Content-Type: application/json`
* **Responses:** `Content-Type: application/json; charset=utf-8`

**Authentication:** Not required (MVP)
**Rate Limit (recommended):** 5 req/min/IP for AI endpoints (`/summarize`, `/recommend`)

---

## Slice 1 – News Feed (✅ Implemented)

### **GET `/health`**

**Purpose:** Check API status
**Response Example:**

```json
{
  "ok": true,
  "version": "v1"
}
```

### **GET `/news`**

**Purpose:** Retrieve a list of news articles by topic.
➡️ See details: `api-slice-1-news.md`

---

## Slice 2 – Summarize (🔜 Planned – MVP accepts raw text)

### **POST `/summarize`**

**Purpose:** Generate a summary using AI.
➡️ See details: `api-slice-2-summarize.md`

---

## Slice 3 – Recommend (🔜 Planned)

### **POST `/recommend`**

**Purpose:** Suggest actions based on a given summary.
➡️ See details: `api-slice-3-recommend.md`

---

## General Implementation Notes

* **Pagination**: 30 items per page (configurable via `NEWS_PAGE_SIZE`).
* **Caching**:

  * `/news`: cached per `topic` (TTL = `NEWS_CACHE_TTL`, default \~300s).
  * `/summarize`: cached by **hash(text + params)** (TTL = `SUMMARIZE_CACHE_TTL`, default \~600s).
* **CORS**: After deployment, only allow valid frontend origins.
* **Logging**: Log server errors, `cache: hit/miss`, `elapsed_ms` for summarize.
* **Versioning**: Prefix `/api/v1` to prevent breaking changes during upgrades.

---

## Sample Data (for FE Mocking)

* `mock/news-tech.json` → sample response for `GET /news?topic=tech`
* `mock/summarize.json` → sample response for `POST /summarize`
* `mock/recommend.json` → sample response for `POST /recommend`
