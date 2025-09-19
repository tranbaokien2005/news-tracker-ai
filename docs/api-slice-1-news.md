# Slice 1 – News Feed (Implemented)

**Base URL (dev):** `http://localhost:5051/api/v1`
**Auth:** Không yêu cầu
**Content-Type:** `application/json`

## 1) GET `/health`

**Mục đích:** Kiểm tra trạng thái API.

**Response**

```json
{ "ok": true, "version": "v1" }
```

---

## 2) GET `/news`

**Mục đích:** Lấy danh sách bài viết theo `topic` (đã chuẩn hoá từ nhiều RSS), có phân trang và cache.

### Query Parameters

| Name          | Type   | Required | Default | Description                                                                                   |
| ------------- | ------ | -------- | ------- | --------------------------------------------------------------------------------------------- |
| `topic`       | string | ✅       | —       | `tech \| finance \| world`. If `VALIDATE_TOPIC_STRICT=false` → fallback `tech`. If `true` → 400 error. |
| `page`        | number | ❌       | `1`     | Current page (>=1). Each page contains `pageSize` items (configurable in ENV).                |
| `forceRefresh`| `"1"`  | ❌       | —       | If `"1"`, cache will be cleared before fetching RSS (ignore TTL).                             |
        |                                                                                                                                                 |

### Response 200 (ví dụ)

```json
{
  "topic": "tech",
  "page": 1,
  "pageSize": 30,
  "count": 123,
  "cache": "hit",
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

### Item Fields

* `id` *(string)* — duy nhất, thường là URL bài viết
* `title` *(string)*
* `url` *(string, absolute URL)*
* `source` *(string, hostname)*
* `topic` *(string)*
* `publishedAt` *(ISO 8601)*
* `snippet` *(string, optional)*

### Errors (chuẩn hoá)

* **400 Bad Request** — topic không hợp lệ khi strict mode

  ```json
  { "error": "INVALID_TOPIC", "message": "Topic must be one of: tech, finance, world" }
  ```
* **502 Bad Gateway** — lỗi lấy RSS upstream / tổng hợp thất bại

  ```json
  { "error": "UPSTREAM_FETCH_FAILED", "message": "Không lấy được RSS từ các nguồn." }
  ```

---

## Caching & Pagination

### Caching

* **Key:** `news:{topic}`
* **TTL:** đọc từ `NEWS_CACHE_TTL` (giây). Trong code hiện tại chuyển sang **ms** khi set cache.
* **Store:** in-memory (Map) với `{ value, expiresAt }`.
* **Force refresh:** query `forceRefresh=1` sẽ xoá key trước khi fetch.

### Pagination

* `pageSize` đọc từ ENV `NEWS_PAGE_SIZE` (giới hạn **1..100**, mặc định `30`).
* Phân trang server-side bằng cách `slice` mảng đã tổng hợp.

---

## ENV liên quan (server)

```env
PORT=5051
NEWS_PAGE_SIZE=30                 # 1..100
NEWS_CACHE_TTL=300               # giây (s)
# (tuỳ chọn) fallback key cũ:
CACHE_TTL=300
VALIDATE_TOPIC_STRICT=false      # true => invalid topic trả 400
```

---

## Ghi chú triển khai (implementation notes)

* `lib/sources.js`: ánh xạ `topic -> RSS sources` (vd: theverge, bbc, marketwatch, aljazeera…).
* `lib/rss.js`: fetch nhiều RSS theo topic, **normalize + sort + dedupe**.
* `lib/cache.js`: cache TTL in-memory theo **milliseconds**.
* Route: `GET /api/v1/news` (đặt trong `routes/v1.js`).
* Trả về trường `cache`: `"hit" | "miss"` để debug/quan sát.

---

## Ví dụ gọi nhanh

### cURL

```bash
curl "http://localhost:5051/api/v1/news?topic=tech&page=1"
```

### Postman (gợi ý test cases)

1. **Happy path**: `topic=tech`, `page=1` → 200, `items` non-empty.
2. **Pagination**: `page=2` → dữ liệu trang 2.
3. **Cache hit/miss**: gọi 2 lần liên tiếp → lần 2 `cache="hit"`.
4. **Force refresh**: thêm `&forceRefresh=1` → `cache="miss"` và làm mới dữ liệu.
5. **Invalid topic (strict=true)**: `topic=abc` → 400 `INVALID_TOPIC`.
6. **Upstream error**: tạm ngắt mạng/nguồn RSS → 502 `UPSTREAM_FETCH_FAILED`.

---

## Roadmap liên quan

* **Slice 2 – Summarize**: thêm `POST /summarize` (AI tóm tắt, có cache + rate limit).
* **Slice 3 – Recommend**: thêm `POST /recommend`.
