# Postman Evidence

Env: local (mock) — baseUrl: http://localhost:5051

## Requests
- GET /api/v1/news — 200, JSON, items[], cache present, pagination fields
- POST /api/v1/summarize — 200, JSON, has summary

## Run
- Result: All tests passed (xem `news-tracker-ai_test_run.json`)
![Postman Tests Result](test-results.png)

### Run Postman Tests via CLI (Newman)
```bash
npm install -g newman
newman run docs/postman/news-tracker-ai_collection.json \
  --reporters cli,json \
  --reporter-json-export docs/postman/news-tracker-ai_newman_result.json
