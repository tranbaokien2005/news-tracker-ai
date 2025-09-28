**Base URL (dev):** `http://localhost:5051/api/v1`

### Common Headers

* **Requests:** `Content-Type: application/json`
* **Responses:** `Content-Type: application/json; charset=utf-8`

**Authentication:** Not required (MVP)
**Rate Limit (recommended):** 5 req/min/IP for AI endpoints (`/summarize`, `/recommend`)

---

## Endpoints

### GET `/health`

**Purpose:** Health check

**200 Example**

```json
{ "ok": true, "version": "v1" }
```

---

### GET `/news`

**Purpose:** Retrieve a list of news articles by topic (normalized from multiple RSS).
**Docs:** see **Slice 1 – News Feed**

---

### POST `/summarize`

**Purpose:** Generate an AI summary for provided text.
**Docs:** see **Slice 2 – Summarize**

---

### POST `/recommend` (planned)

**Purpose:** Suggest actions based on a given summary (future slice).

---

## General Implementation Notes

* **Pagination**: 30 items/page (ENV `NEWS_PAGE_SIZE`)
* **Caching**

  * `/news`: cached per `topic` (TTL = `NEWS_CACHE_TTL`, default ~300s)
  * `/summarize`: cached by `sha256(text + params)` (TTL = `SUMMARIZE_CACHE_TTL`, default ~600s)
* **CORS**: lock to production frontend origins after deploy
* **Logging**: include `cacheStatus` (`cached|live`) and `elapsed_ms` where sensible
* **Versioning**: prefix `/api/v1`
