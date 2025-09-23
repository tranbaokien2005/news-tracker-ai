# 📊 Showcase Case Study: Why Cache and Rate-Limit

In real-world API design, **performance** and **stability** are just as important as returning correct data.  
This case study highlights why we added **caching** and **rate-limiting** to News Tracker AI.

---

## ⚡ Caching

**Problem**  
- Repeatedly fetching RSS feeds or re-calling AI summarization wastes time and resources.  
- Users often request the same topic or text multiple times.  

**Solution**  
- Cache normalized RSS results (`/news`) for a short TTL (e.g., 5 minutes).  
- Cache summarization results (`/summarize`) for a longer TTL (e.g., 24 hours).  

**Benefits**  
- Faster response times for common queries.  
- Reduced external API calls.  
- Lower server load and costs.  

---

## 🛡️ Rate-Limiting

**Problem**  
- Public APIs can be abused with spam or heavy requests.  
- AI endpoints have usage costs and quota limits.  

**Solution**  
- Apply rate-limiting to AI endpoints (`/summarize`, `/recommend`).  
- Example policy: max **5 requests/minute per IP**.  

**Benefits**  
- Protects API stability under load.  
- Prevents unexpected costs or denial of service.  
- Ensures fair usage across users.  

---

## ✅ Outcome

By combining **caching** + **rate-limiting**:  
- The API is **fast** (cached responses).  
- The API is **predictable** (consistent performance).  
- The API is **safe** (protected against abuse).  

This transforms a simple demo backend into a more **production-ready showcase**, demonstrating patterns that scale in real projects.
