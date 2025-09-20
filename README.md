# 📖 News Tracker AI

## 📌 Giới thiệu
News Tracker AI là dự án demo backend (Node.js + Express) để:
- Thu thập tin tức từ nhiều nguồn RSS.
- Chuẩn hoá dữ liệu, cache tạm thời.
- Tích hợp AI để tóm tắt & gợi ý tin tức.

---

## 🚀 Development – Backend

### Cài đặt
1. Clone repo:
   ```bash
   git clone https://github.com/<username>/news-tracker-ai.git
   cd news-tracker-ai/server
````

2. Copy `.env.example` thành `.env` và cấu hình.
3. Cài dependencies:

   ```bash
   npm install
   npm run dev
   ```
4. API chạy tại:

   ```
   http://localhost:5051/api/v1
   ```

---

## 📡 Available Endpoints

### Slice 1 – News Feed (✅ Done)

* `GET /api/v1/health`
* `GET /api/v1/news?topic=tech&page=1[&forceRefresh=1]`
  (… ví dụ request/response …)

---

### Slice 2 – Summarize (✅ Done)

**Endpoint:** `POST /api/v1/summarize`
**Mục tiêu:** Tóm tắt văn bản bằng AI, có cache theo nội dung + rate limit.

**Request Body**

```json
{
  "text": "Nội dung cần tóm tắt...",
  "lang": "en",            // optional: "auto" | "en" | "vi" | ...
  "mode": "bullets",       // optional: "bullets" | "paragraph"
  "title": "Optional title",
  "topic": "tech"          // optional
}
```

**Response 200**

```json
{
  "summary": "• ... 3–5 bullet points ...",
  "mode": "bullets",
  "lang": "en",
  "model": "gpt-4o-mini",
  "cached": false,
  "cache_ttl": 86400,
  "usage": { "prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0 },
  "meta": { "hash": "sha256-of-text", "provider": "openai", "elapsed_ms": 123 }
}
```

**Quy tắc & Hành vi**

* Validate `text` (bắt buộc).
* Chuẩn hoá & **cắt** chuỗi về `MAX_SUMMARY_INPUT_CHARS` trước khi gọi AI.
* **Cache key:** `sum:{model}:{lang}:{mode}:{sha256(normalized_text)}`
* **TTL:** `SUMMARIZE_CACHE_TTL` (mặc định 86400s).
* **Rate limit:** `AI_RATE_MAX` req / `AI_RATE_WINDOW_MS` ms (mặc định 5 req / 60s) theo IP.

**Biến môi trường liên quan**

```
AI_PROVIDER=openai|mock
AI_MODEL=gpt-4o-mini
AI_API_KEY=...
SUMMARIZE_CACHE_TTL=86400
AI_RATE_MAX=5
AI_RATE_WINDOW_MS=60000
MAX_SUMMARY_INPUT_CHARS=8000
DEFAULT_SUMMARY_MODE=bullets
DEFAULT_SUMMARY_LANG=en
```

**Lỗi chuẩn hoá**

* `400 INVALID_INPUT` – thiếu `text`

  ```json
  { "error": "INVALID_INPUT", "message": "Field 'text' is required." }
  ```
* `413 INPUT_TOO_LARGE` – `text.length > MAX_SUMMARY_INPUT_CHARS * 3`

  ```json
  { "error": "INPUT_TOO_LARGE", "message": "Text exceeds MAX_SUMMARY_INPUT_CHARS." }
  ```
* `429 RATE_LIMITED` – vượt giới hạn

  ```json
  { "error": "RATE_LIMITED", "message": "Too many requests, please try later." }
  ```
* `502 AI_PROVIDER_ERROR` – lỗi từ AI provider (ví dụ insufficient\_quota)

  ```json
  { "error": "AI_PROVIDER_ERROR", "message": "Failed to generate summary." }
  ```

**Curl nhanh**

```bash
# Happy path
curl -X POST http://localhost:5051/api/v1/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"Apple vừa công bố chip AI mới giúp tăng hiệu năng và tiết kiệm pin.","lang":"en","mode":"bullets"}'

# Gọi lại y hệt để thấy cached:true
curl -X POST http://localhost:5051/api/v1/summarize \
  -H "Content-Type: application/json" \
  -d '{"text":"Apple vừa công bố chip AI mới giúp tăng hiệu năng và tiết kiệm pin.","lang":"en","mode":"bullets"}'

# Thiếu text -> 400
curl -X POST http://localhost:5051/api/v1/summarize \
  -H "Content-Type: application/json" -d '{}'
```

**Troubleshooting**

* Nhận `502` với `insufficient_quota`: dùng `AI_PROVIDER=mock` để dev, hoặc nạp quota.
* Nhận response của `/news`: kiểm tra **method=POST** & **URL** đúng `/api/v1/summarize`.
* Không parse được body: đảm bảo `Content-Type: application/json` và server có `app.use(express.json())`.

### Slice 3 – Recommend (🔜 Chưa làm)

👉 **Placeholder – sẽ bổ sung sau**

### Slice 4 – Lưu trạng thái cục bộ (🔜 Chưa làm)

👉 **Placeholder – sẽ bổ sung sau**

---

## 🖥 Development – Frontend (mock client)

* Run mock API:

  ```bash
  npx json-server --watch db.json --port 5050
  ```
* Mở `client/src/index.html` bằng Live Server.

---

## 🧪 Testing

* Slice 1: đã test Postman (happy path, pagination, cache hit/miss, fallback topic, lỗi upstream).
* Slice 2+: **sẽ bổ sung test cases khi hoàn thành**.

---

## 🗺 Roadmap

* ✅ Slice 1: News Feed (không AI)
* 🔜 Slice 2: Summarize API (AI tóm tắt bài viết)
* 🔜 Slice 3: Recommend API
* 🔜 Slice 4: Lưu trạng thái cục bộ
* 🔜 Polish + Deploy + README update
