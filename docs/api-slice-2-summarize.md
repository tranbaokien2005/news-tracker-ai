**Base URL (dev):** `http://localhost:5051/api/v1`
**Auth:** None
**Content-Type:** `application/json`

## POST `/summarize`

**Purpose**
Generate an AI summary. **MVP accepts raw `text`** (server does not fetch URL content).

### Request Body (MVP)

```json
{
  "text": "Article text to summarize...",
  "url": "https://source-article.example.com",   // optional (for reference/attribution)
  "title": "Apple unveils ...",                   // optional (helps context)
  "lang": "en",                                   // optional: "auto" | "en" | "vi" | ...
  "mode": "bullets",                              // optional: "bullets" | "paragraph"
  "topic": "tech"                                 // optional: may guide style
}
```

**Constraints**

* `text`: **required**, non-empty
* Max length: `MAX_SUMMARY_INPUT_CHARS` (ENV, default 8000)
* Defaults: `mode="bullets"`, `lang="en"` (or `"auto"` if enabled)

### 200 Response (aligned with FE `Summary` type)

```json
{
  "summary": {
    "mode": "bullets",
    "items": [
      "Apple launched a new AI-accelerated chip...",
      "The chip integrates on-device LLM optimizations..."
    ]
  },
  "lang": "en",
  "model": "gpt-4o-mini",
  "cacheStatus": "live",
  "cache_ttl": 600,
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  },
  "meta": {
    "hash": "sha256-of-normalized-text",
    "provider": "openai",
    "elapsed_ms": 123
  }
}
```

> If `mode="paragraph"`, return:
>
> ```json
> { "summary": { "mode": "paragraph", "text": "Short paragraph..." } }
> ```

### Errors

**400 INVALID_INPUT**

```json
{ "error": "INVALID_INPUT", "message": "Field 'text' is required." }
```

**413 INPUT_TOO_LARGE**

````json
{ "error": "INPUT_TOO_LARGE", "message": "Text exceeds MAX_SUMMARY_INPUT_CHARS." }
``>
**429 RATE_LIMITED**
```json
{ "error": "RATE_LIMITED", "message": "Too many requests, please try later." }
````

**502 AI_PROVIDER_ERROR**

```json
{ "error": "AI_PROVIDER_ERROR", "message": "Failed to generate summary." }
```

### Caching

* **Key:** `sum:{model}:{lang}:{mode}:{sha256(normalized_text)}`
* **TTL:** `SUMMARIZE_CACHE_TTL` seconds
* **Normalize:** collapse whitespace, trim, slice to `MAX_SUMMARY_INPUT_CHARS`

### Rate Limiting

* ENV:

  * `AI_RATE_MAX` (default 5)
  * `AI_RATE_WINDOW_MS` (default 60000)
* Return headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

---

## Why these changes?

* **One response shape** across FE/BE:

  * `/news`: `{ page, pages, items, cacheStatus, data }`
  * Articles: `{ excerpt, image }` (no `snippet`)
* **`/summarize` matches FE types**: `summary` is an **object** with `{mode, items|text}`.
* **`cacheStatus: 'cached' | 'live'`** used everywhere (instead of boolean `cache` or `"hit"/"miss"`).
* **Optional `url`** accepted by `/summarize` (FE is already sending it).
