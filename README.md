### News Tracker AI

#### Development – Backend

1. Copy `.env.example` thành `.env` trong thư mục **server**.
   Ví dụ các biến cần:

   ```env
   NEWS_PAGE_SIZE=30
   NEWS_CACHE_TTL=300
   VALIDATE_TOPIC_STRICT=false
   ```
2. Cài dependencies:

   ```bash
   npm install
   npm run dev
   ```
3. API sẽ chạy ở `http://localhost:5051/api/v1`.

#### Available Endpoints (Slice 1)

* `GET /api/v1/health` → `{ ok: true, version: "v1" }`
* `GET /api/v1/news?topic=tech&page=1[&forceRefresh=1]`

  * **Params:**

    * `topic`: `tech | finance | world` (fallback = tech nếu không strict).
    * `page`: số trang, mặc định = 1.
    * `forceRefresh`: `"1"` để bypass cache.
  * **Response:**

    ```json
    {
      "topic": "tech",
      "page": 1,
      "pageSize": 30,
      "count": 123,
      "cache": "hit",
      "items": [
        { "id": "...", "title": "...", "url": "...", "source": "...", "publishedAt": "..." }
      ]
    }
    ```

#### Development – Frontend (mock client vẫn giữ)

1. Run mock API nếu muốn test client tĩnh:

   ```bash
   npx json-server --watch db.json --port 5050
   ```
2. Start frontend bằng Live Server (mở `client/src/index.html`).
