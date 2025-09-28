// client/src/api/news.ts
import { getJSON } from './http';
import type { Topic } from '@/lib/types';

// Raw response format from backend v1
type RawServerRes = {
  topic?: string;
  page?: number | string;
  pageSize?: number | string;
  count?: number | string;               // total number of articles
  cache?: 'hit' | 'miss' | string;       // cache flag as string
  items?: any[];                         // articles array (v1)
  data?: any[];                          // fallback if BE switches back to "data"
};

const toNum = (v: unknown, def = 0) => {
  const n = typeof v === 'string' ? Number(v) : (typeof v === 'number' ? v : NaN);
  return Number.isFinite(n) ? n : def;
};

export async function fetchNews(
  topic: Topic,
  page = 1,
  pageSize = Number(import.meta.env.VITE_PAGE_SIZE) || 30,
  forceRefresh = 0
) {
  // Send both pageSize & limit to stay compatible with BE
  const params = { topic, page, pageSize, limit: pageSize, forceRefresh };

  const raw = await getJSON<RawServerRes>('news', params);

  // ---- Normalize into the schema expected by FE ----
  const pageNum  = toNum(raw?.page, 1);
  const sizeNum  = toNum(raw?.pageSize, pageSize);
  const dataArr  = Array.isArray(raw?.items) ? raw!.items! : (Array.isArray(raw?.data) ? raw!.data! : []);
  const totalNum = toNum(raw?.count, dataArr.length);

  const pagesNum = Math.max(1, Math.ceil(totalNum / (sizeNum || 1)));

  // Map cache 'hit'|'miss' → 'cached'|'live' plus a boolean for backward compatibility
  const cacheStatus = String(raw?.cache || '').toLowerCase() === 'hit' ? 'cached' : 'live';
  const cacheBool   = cacheStatus === 'cached';

  return {
    page: pageNum,
    pages: pagesNum,
    items: totalNum,        // total count
    data: dataArr,          // article array
    cache: cacheBool,       // backward-compatible boolean
    cacheStatus,            // normalized cache status
  };
}
