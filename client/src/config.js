const USE_MOCK = false; // đổi sang true để test offline

window.ENV = {
  API_BASE: USE_MOCK 
    ? "http://localhost:5050"   // json-server
    : "http://localhost:5051/api/v1", // backend thật
  TOPICS: ["tech", "finance", "world"],
  DEFAULT_TOPIC: "tech",
  PAGE_SIZE: 10
};
