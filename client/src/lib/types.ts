// A basic article object
export type Article = {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO date string
  excerpt: string;
  image?: string;
};

// AI-generated summary format
export type Summary =
  | { mode: 'bullets'; items: string[] }
  | { mode: 'paragraph'; text: string };

// Article extended with optional summary data
export type ArticleWithSummary = Article & {
  summary?: Summary;
  summaryExpanded?: boolean;
};

// Supported topics
export type Topic = 'tech' | 'finance' | 'world';

// High-level app state for rendering
export type AppState = 'loading' | 'loaded' | 'empty' | 'error';

// Toast notification types
export type ToastType = 'info' | 'success' | 'error' | 'warning';
export type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
};

// Client-side computed status data (for UI display)
export type StatusData = {
  cached: number;
  fresh: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

// ✅ Response from /news API (normalized shape)
export type NewsResponse = {
  page: number;
  pages: number;
  items: number;
  cacheStatus: 'cached' | 'live';
  data: Article[];
};

// Summary modes
export type SummaryMode = 'bullets' | 'paragraph';

// Request body for /summarize API
export type SummarizeRequest = {
  articleId: string;
  text: string;
  mode?: SummaryMode;
};

// Response from /summarize API
export type SummarizeResponse = {
  summary: Summary;
};
