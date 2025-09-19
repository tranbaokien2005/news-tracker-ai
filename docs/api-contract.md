**Base URL (dev):** `http://localhost:5050/api/v1`

**Common Headers**:

* **Requests:** `Content-Type: application/json`
* **Responses:** `Content-Type: application/json; charset=utf-8`

**Authentication:** Not required (MVP)
**Rate Limit (recommended):** 5 req/min/IP for AI endpoints (`/summarize`, `/recommend`)

---

## 1) GET `/news`

**Purpose:** Retrieve a list of articles by `topic` (standardized from RSS feeds).

**Query Parameters:**

* `topic` *(string, required)* — e.g., `tech`, `finance`
* `page` *(number, optional, default=1)* — pagination, 30 items per page

**Response 200 Example:**

```json
{
  "topic": "tech",
  "page": 1,
  "count": 123,
  "items": [
    {
      "id": "https://www.reuters.com/...",
      "title": "Apple unveils new AI chip",
      "url": "https://www.reuters.com/technology/article-123",
      "source": "reuters.com",
      "topic": "tech",
      "publishedAt": "2025-09-16T10:00:00Z",
      "snippet": "Apple introduced its latest chip with built-in AI acceleration..."
    }
  ]
}
```

**Item Fields:**

* `id` *(string)* — unique identifier, usually the article URL
* `title` *(string)*
* `url` *(string, absolute URL)*
* `source` *(string, hostname)*
* `topic` *(string)*
* `publishedAt` *(ISO 8601 datetime string)*
* `snippet` *(string, optional)*

**Errors:**

* `400 Bad Request` — invalid topic

  ```json
  { "error": "Invalid topic" }
  ```
* `500 Internal Server Error` — server error

  ```json
  { "error": "Server error" }
  ```

---

## 2) POST `/summarize`

**Purpose:** Generate an AI-powered summary of an article.

**Request Body (one of two forms):**

```json
{ "url": "https://www.reuters.com/technology/article-123" }
```

or

```json
{
  "title": "Apple unveils new AI chip",
  "snippet": "Apple introduced its latest chip with built-in AI acceleration..."
}
```

**Response 200 Example:**

```json
{
  "summary": "• Apple launched a new AI-accelerated chip.\n• Targeted for iPhone/Mac with better performance and battery.\n• Analysts expect competitive advantage in mobile AI.",
  "tags": ["apple", "ai", "chipset"]
}
```

**Rules:**

* Summary should be **3–5 bullet points**, total ≤ \~80 words.
* Server caches summaries by `url` (if provided) for ≥ 24h.
* If article content cannot be fetched, server may use `title` + `snippet`.

**Errors:**

* `400 Bad Request` — missing both `url` and `title`

  ```json
  { "error": "Missing url or title" }
  ```
* `429 Too Many Requests` — exceeded rate limit

  ```json
  { "error": "Too Many Requests" }
  ```
* `500 Internal Server Error` — server/AI error

  ```json
  { "error": "Server error" }
  ```

---

## 3) POST `/recommend`

**Purpose:** Suggest 1–2 practical actions based on a `summary` and `topic`.

**Request Body:**

```json
{
  "topic": "tech",
  "summary": "Apple launched a new AI-accelerated chip..."
}
```

**Response 200 Example:**

```json
{
  "actions": [
    "Track third-party benchmark results for real-world gains.",
    "Follow Apple's next developer event for SDK updates."
  ]
}
```

**Rules:**

* Must return **1–2 neutral, practical suggestions**.
* Should **not provide financial advice**.
* Fallback rules per `topic` if AI fails.

**Errors:**

* `400 Bad Request` — missing `summary`

  ```json
  { "error": "Missing summary" }
  ```
* `429 Too Many Requests` — exceeded rate limit

  ```json
  { "error": "Too Many Requests" }
  ```
* `500 Internal Server Error` — server/AI error

  ```json
  { "error": "Server error" }
  ```

---

## 4) General Implementation Notes

* **Pagination:** 30 items/page (configurable via `pageSize` in future).
* **Caching:**

  * `/news`: cache by topic/page for 15 minutes.
  * `/summarize`: cache by url for 24h.
* **CORS:** Only allow frontend origin after deployment.
* **Logging:** Log server errors and empty model responses for debugging.
* **Versioning:** Prefix with `/api/v1` to avoid breaking frontend in future upgrades.

---

## 5) Sample Data Files (for FE mocking)

* `mock/news-tech.json` → sample response for `GET /news?topic=tech`
* `mock/summarize.json` → sample response for `POST /summarize`
* `mock/recommend.json` → sample response for `POST /recommend`

---