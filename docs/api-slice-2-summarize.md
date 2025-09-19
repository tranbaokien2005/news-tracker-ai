# Slice 2 – Summarize (MVP)

**Base URL (dev):** `http://localhost:5051/api/v1`  
**Auth:** Không yêu cầu  
**Content-Type:** `application/json`

---

## Endpoint

### POST `/summarize`

**Purpose**  
Sinh tóm tắt bài báo bằng AI. MVP nhận **text** đã được trích sẵn (không tự fetch từ URL).

---

## Request Body (MVP)

```json
{
  "text": "Nội dung bài báo cần tóm tắt...",
  "lang": "en",             // optional: "auto" | "en" | "vi" | ...
  "mode": "bullets",        // optional: "bullets" | "paragraph"
  "title": "Apple unveils...", // optional: hỗ trợ giữ ngữ cảnh
  "topic": "tech"              // optional: gợi ý phong cách tóm tắt
}
````

### Ràng buộc

* `text` **bắt buộc**, string non-empty.
* Giới hạn độ dài: `MAX_SUMMARY_INPUT_CHARS` (ENV, mặc định 8000).
* `mode` mặc định = `"bullets"`.
* `lang` mặc định = `"en"` (hoặc `"auto"` nếu cấu hình).

---

## Response 200

```json
{
  "summary": "• Apple launched a new AI-accelerated chip...\n• ...",
  "mode": "bullets",
  "lang": "en",
  "model": "gpt-4o-mini",
  "cached": false,
  "cache_ttl": 600,
  "usage": {
    "prompt_tokens": 0,
    "completion_tokens": 0,
    "total_tokens": 0
  },
  "meta": {
    "hash": "sha256-of-text",
    "provider": "openai",
    "elapsed_ms": 123
  }
}
```

---

## Error Responses

* **400 INVALID\_INPUT**

  ```json
  { "error": "INVALID_INPUT", "message": "Field 'text' is required." }
  ```

* **413 INPUT\_TOO\_LARGE**

  ```json
  { "error": "INPUT_TOO_LARGE", "message": "Text exceeds MAX_SUMMARY_INPUT_CHARS." }
  ```

* **429 RATE\_LIMITED**

  ```json
  { "error": "RATE_LIMITED", "message": "Too many requests, please try later." }
  ```

* **502 AI\_PROVIDER\_ERROR**

  ```json
  { "error": "AI_PROVIDER_ERROR", "message": "Failed to generate summary." }
  ```

---

## Caching

* **Cache key**:

  ```
  sum:{model}:{lang}:{mode}:{sha256(normalized_text)}
  ```
* **TTL**: `SUMMARIZE_CACHE_TTL` (ENV, mặc định 600s).
* **Normalize**: collapse whitespace, trim, slice tới `MAX_SUMMARY_INPUT_CHARS`.

---

## Rate Limiting

* Config qua ENV:

  * `AI_RATE_MAX` (mặc định 5)
  * `AI_RATE_WINDOW_MS` (mặc định 60000ms = 1 phút)
* Trả về headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.

---

## Notes

* MVP: chỉ nhận `text`.
* Fast-follow: hỗ trợ `{ "url": "..." }` để server fetch và extract.
* Ngôn ngữ: auto-detect nếu `lang=auto`.
* Style:

  * `bullets`: 3–5 bullet, ≤80 words.
  * `paragraph`: 1 đoạn ngắn, 80–120 words.

```