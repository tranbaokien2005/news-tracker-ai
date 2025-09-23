# Postman Evidence

Env: local (mock) — baseUrl: http://localhost:5051

## Requests
- GET /api/v1/news — ✅ 200, JSON, items[], cache present, pagination fields
- POST /api/v1/summarize — ✅ 200, JSON, has summary

## Run
- Kết quả: All tests passed (xem `news-tracker-ai_test_run.json`)
- Screenshot:
![Run Pass](./img/run-1.png)
