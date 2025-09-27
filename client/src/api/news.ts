// client/src/api/news.ts
import { getJSON } from './http';
import type { Topic } from '@/lib/types';

// Raw từ server v1
type RawServerRes = {
  topic?: string;
  page?: number | string;
  pageSize?: number | string;
  count?: number | string;               // tổng bài
  cache?: 'hit' | 'miss' | string;       // cache flag chuỗi
  items?: any[];                         // mảng bài viết
  data?: any[];                          // phòng khi về sau BE đổi lại tên
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
  // gửi cả pageSize & limit để tương thích
  const params = { topic, page, pageSize, limit: pageSize, forceRefresh };

  const raw = await getJSON<RawServerRes>('news', params);

  // ---- Chuẩn hoá về schema FE mong muốn ----
  const pageNum  = toNum(raw?.page, 1);
  const sizeNum  = toNum(raw?.pageSize, pageSize);
  const dataArr  = Array.isArray(raw?.items) ? raw!.items! : (Array.isArray(raw?.data) ? raw!.data! : []);
  const totalNum = toNum(raw?.count, dataArr.length);

  const pagesNum = Math.max(1, Math.ceil(totalNum / (sizeNum || 1)));

  // Map cache 'hit'|'miss' -> 'cached'|'live' và boolean
  const cacheStatus = String(raw?.cache || '').toLowerCase() === 'hit' ? 'cached' : 'live';
  const cacheBool   = cacheStatus === 'cached';

  return {
    page: pageNum,
    pages: pagesNum,
    items: totalNum,        // số bài
    data: dataArr,          // mảng bài
    cache: cacheBool,       // để code cũ dùng cũng chạy
    cacheStatus,            // cho code mới
  };
}
