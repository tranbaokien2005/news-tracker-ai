# ✅ Slice 1 – News Feed (Implemented, normalized)

**Base URL (dev):** `http://localhost:5051/api/v1`
**Auth:** None
**Content-Type:** `application/json`

## 1) GET `/health`

**200**

```json
{ "ok": true, "version": "v1" }
```

---

## 2) GET `/news`

**Purpose:** Get articles by `topic` with pagination & cache.

### Query Parameters

| Name           | Type   | Req | Default | Description                                |         |                                                                                                     |
| -------------- | ------ | --- | ------- | ------------------------------------------ | ------- | --------------------------------------------------------------------------------------------------- |
| `topic`        | string | ✅   | —       | One of `tech                               | finance | world`. If `VALIDATE_TOPIC_STRICT=false`, invalid topics fallback to `tech`; if `true`, return 400. |
| `page`         | number | ❌   | `1`     | Page index (>=1).                          |         |                                                                                                     |
| `forceRefresh` | `"1"`  | ❌   | —       | If `"1"`, bypass/clear cache before fetch. |         |                                                                                                     |

> **Reserved (future):** `sources[]`, `timeRange` — The frontend can attach it to the URL, but the backend **does not** filter it yet.

### 200 Response (normalized to FE types)

```json
{
  "topic": "tech",
  "page": 1,
  "pages": 5,
  "items": 123,
  "pageSize": 30,
  "cacheStatus": "cached",
  "data": [
    {
      "id": "https://www.reuters.com/technology/article-123",
      "title": "Apple unveils new AI chip",
      "url": "https://www.reuters.com/technology/article-123",
      "source": "reuters.com",
      "publishedAt": "2025-09-16T10:00:00Z",
      "excerpt": "Apple introduced its latest chip with built-in AI acceleration...",
      "image": "https://images.example.com/ai-chip.jpg"
    }
  ]
}
```

### Article Fields (align with FE)

* `id` *(string, unique; often the article URL)*
* `title` *(string)*
* `url` *(string, absolute URL)*
* `source` *(string, hostname)*
* `publishedAt` *(ISO 8601)*
* `excerpt` *(string)*
* `image` *(string, optional)*

### Errors

**400 Bad Request** — invalid topic when strict mode

```json
{ "error": "INVALID_TOPIC", "message": "Topic must be one of: tech, finance, world" }
```

**502 Bad Gateway** — upstream RSS error

```json
{ "error": "UPSTREAM_FETCH_FAILED", "message": "Failed to aggregate RSS sources." }
```

---

## Caching & Pagination

**Caching**

* **Key:** `news:{topic}`
* **TTL:** `NEWS_CACHE_TTL` seconds (store internally as ms)
* **Store:** in-memory `{ value, expiresAt }`
* **Force refresh:** `forceRefresh=1` clears key before fetch

**Pagination**

* `pageSize`: ENV `NEWS_PAGE_SIZE` (1..100, default 30)
* Paginate server-side (`slice`) after aggregation

---

## Server ENV

```env
PORT=5051
NEWS_PAGE_SIZE=30
NEWS_CACHE_TTL=300
VALIDATE_TOPIC_STRICT=false
```

---

## Quick Tests

```bash
curl "http://localhost:5051/api/v1/news?topic=tech&page=1"
curl "http://localhost:5051/api/v1/news?topic=tech&page=1&forceRefresh=1"
```
