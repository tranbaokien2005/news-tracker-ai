// Một bài báo cơ bản
export type Article = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO
  excerpt: string;
  image?: string;
};

// Dạng summary (AI tóm tắt)
export type Summary =
  | { mode: 'bullets'; items: string[] }
  | { mode: 'paragraph'; text: string };

// Bài báo kèm summary
export type ArticleWithSummary = Article & {
  summary?: Summary;
  summaryExpanded?: boolean;
};

// Chủ đề (topic)
export type Topic = 'tech' | 'finance' | 'world';

// Trạng thái app
export type AppState = 'loading' | 'loaded' | 'empty' | 'error';

// Toast UI
export type ToastType = 'info' | 'success' | 'error' | 'warning';
export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
};

// FE status (tính toán client-side khi render)
export type StatusData = {
  cached: number;
  fresh: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

// ✅ Response từ API /news (đã sửa)
export type NewsResponse = {
  page: number;
  pages: number;
  items: number;
  cacheStatus: 'cached' | 'live'; // <-- thay vì `cache: boolean`
  data: Article[];
};

// Mode summary
export type SummaryMode = 'bullets' | 'paragraph';

// Request body cho /summarize
export type SummarizeRequest = {
  articleId: string;
  text: string;
  mode?: SummaryMode;
};

// Response từ API /summarize
export type SummarizeResponse = {
  summary: Summary;
};
