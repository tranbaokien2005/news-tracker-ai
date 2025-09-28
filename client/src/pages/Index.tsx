// client/src/pages/Index.tsx
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, RefreshCw, FileX } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import type {
  Topic,
  AppState,
  ArticleWithSummary,
  Toast as ToastType,
  StatusData,
  SummaryMode,
} from '@/lib/types';

import Header from '@/components/Header';
import StatusBar, { UIStatus } from '@/components/StatusBar';
// 👉 Make sure this path matches your actual file location
import Sidebar, { SourceId, TimeRange } from '@/components/Sidebar';
import ArticleCard from '@/components/ArticleCard';
import SkeletonCard from '@/components/SkeletonCard';
import Pagination from '@/components/Pagination';
import { ToastContainer } from '@/components/Toast';

import { fetchNews } from '@/api/news';
import { summarizeArticle } from '@/api/summarize';

// ---- Defaults
const DEFAULT_TOPIC: Topic = (import.meta.env.VITE_DEFAULT_TOPIC as Topic) || 'tech';
const PAGE_SIZE = Number(import.meta.env.VITE_PAGE_SIZE) || 30;
const MAX_SUMMARY_INPUT = Number(import.meta.env.VITE_MAX_SUMMARY_INPUT_CHARS) || 8000;

// ---- API response type
type NewsResponse =
  & { page?: number; pages?: number; items?: number; data?: any[] }
  & (
      | { cache: boolean; cacheStatus?: never }
      | { cache?: never; cacheStatus: 'cached' | 'live' }
    );

// Normalize cache flag across both response shapes
const getCacheFlag = (res: Partial<NewsResponse>): boolean => {
  if (typeof (res as any)?.cache === 'boolean') return !!(res as any).cache;
  if (typeof (res as any)?.cacheStatus === 'string') {
    return (res as any).cacheStatus === 'cached';
  }
  return false;
};

// Build the text to summarize
function buildSummaryText(a: any): string {
  const parts = [a?.title || '', a?.excerpt || a?.description || a?.content || ''].filter(Boolean);
  const raw = parts.join('\n\n').replace(/\s+/g, ' ').trim();
  return raw.slice(0, MAX_SUMMARY_INPUT);
}

// Show StatusBar
const SHOW_STATUS = import.meta.env.DEV || import.meta.env.VITE_SHOW_STATUS === '1';

/** Filter state type kept in the page (MVP) */
type Filters = { sources: SourceId[]; timeRange: TimeRange };

const Index = () => {
  // --------- Routing helpers (for querystring sync) ---------
  const location = useLocation();
  const navigate = useNavigate();

  // --------- State ---------
  const [selectedTopic, setSelectedTopic] = useState<Topic>(DEFAULT_TOPIC);
  const [appState, setAppState] = useState<AppState>('loading');

  const [articles, setArticles] = useState<ArticleWithSummary[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [cacheFlag, setCacheFlag] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastType[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  // Track summarization loading state by article ID
  const [loadingSummaryById, setLoadingSummaryById] = useState<Record<string, boolean>>({});

  // Last successful refresh time
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // --------- Filters (own the state here; pass down to Sidebar) ---------
  // Initialize from URL querystring so a refresh keeps the same filters
  const initFiltersFromQS = (): Filters => {
    const qs = new URLSearchParams(location.search);
    const src = (qs.getAll('src') as SourceId[]) || [];
    const tr = (qs.get('tr') as TimeRange) || '6h';
    // Provide a sensible default when nothing in URL
    return { sources: src.length ? src : ['theverge'], timeRange: tr };
  };
  const [filters, setFilters] = useState<Filters>(initFiltersFromQS);

  // --------- Derived UI status ---------
  const status: UIStatus = useMemo(() => {
    const cached = cacheFlag ? totalItems : 0;
    const fresh = cacheFlag ? 0 : totalItems;
    return { cached, fresh, currentPage, totalPages, totalItems, lastUpdated };
  }, [cacheFlag, currentPage, totalItems, totalPages, lastUpdated]);

  // --------- Effects ---------
  // Load articles whenever topic/page/filters change.
  useEffect(() => {
    // Sync querystring with current filters + page
    const qs = new URLSearchParams();
    filters.sources.forEach((s) => qs.append('src', s));
    qs.set('tr', filters.timeRange);
    qs.set('page', String(currentPage));
    navigate({ pathname: '/', search: qs.toString() }, { replace: true });

    // NOTE (MVP): backend fetchNews(topic, page, PAGE_SIZE) might not accept filters yet.
    // We still update UI state + URL now; later extend API to accept {sources, timeRange}.
    void loadArticles(selectedTopic, currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTopic, currentPage, filters]);

  // --------- Actions ---------
  const loadArticles = async (topic: Topic, page: number) => {
    setAppState('loading');
    try {
      const res = (await fetchNews(topic, page, PAGE_SIZE)) as NewsResponse;

      setArticles(
        (res.data || []).map((a) => ({
          ...a,
          summaryExpanded: false,
        }))
      );

      setTotalPages(res.pages || 1);
      setTotalItems(res.items || 0);
      setCacheFlag(getCacheFlag(res));
      setLastUpdated(Date.now());

      // ✅ Clear per-article summary loading states when refreshing data
      setLoadingSummaryById({});

      setAppState(!res.data || res.data.length === 0 ? 'empty' : 'loaded');
    } catch (err: any) {
      console.error('loadArticles error:', err);
      setAppState('error');
      addToast({
        type: 'error',
        title: 'Loading Failed',
        message: err?.message ? String(err.message) : 'Failed to load articles. Please try again.',
      });
    }
  };

  const handleReload = async () => {
    setIsReloading(true);
    await loadArticles(selectedTopic, currentPage);
    setIsReloading(false);
  };

  const handleTopicChange = async (topic: Topic) => {
    if (topic === selectedTopic) return;
    setSelectedTopic(topic);
    setCurrentPage(1);
    addToast({ type: 'info', title: 'Topic Changed', message: `Switched to ${topic} news` });
  };

  const handlePageChange = async (page: number) => {
    if (page === currentPage) return;
    setCurrentPage(page);
    setAppState('loading');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSummarize = async (articleId: string, desiredMode: SummaryMode = 'bullets') => {
    if (loadingSummaryById[articleId]) return;
    setLoadingSummaryById((m) => ({ ...m, [articleId]: true }));

    try {
      const idx = articles.findIndex((a) => a.id === articleId);
      if (idx === -1) return;
      const article = articles[idx];

      const text = buildSummaryText(article);

      const { summary } = await summarizeArticle({
        text,
        url: article.url,
        title: article.title,
        mode: desiredMode,
        lang: 'en',
      });

      const next = [...articles];
      next[idx] = { ...article, summary, summaryExpanded: true };
      setArticles(next);

      addToast({
        type: 'success',
        title: 'Summary Generated',
        message: 'AI summary has been created for the article',
      });
    } catch (err: any) {
      console.error('summarize error:', err);
      addToast({
        type: 'error',
        title: 'Summarize Failed',
        message: err?.message ? String(err.message) : 'Unable to generate summary.',
      });
    } finally {
      setLoadingSummaryById((m) => {
        const { [articleId]: _drop, ...rest } = m;
        return rest;
      });
    }
  };

  // MVP bookmark/share (kept as simple toasts)
  const handleBookmark = (articleId: string) => {
    addToast({ type: 'info', title: 'Bookmarked', message: 'Article saved to your reading list' });
  };

  const handleShare = async (articleId: string) => {
    const a = articles.find((x) => x.id === articleId);
    if (a?.url && navigator?.clipboard) {
      await navigator.clipboard.writeText(a.url);
    }
    addToast({ type: 'info', title: 'Link Copied', message: 'Article link copied to clipboard' });
  };

  // --------- Toast helpers ---------
  const generateToastId = () => Math.random().toString(36).slice(2);
  const addToast = (toast: Omit<ToastType, 'id'>) =>
    setToasts((prev) => [...prev, { ...toast, id: generateToastId() }]);
  const dismissToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // --------- Render helpers ---------
  const renderLoadingState = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 p-4 bg-[var(--color-card)] rounded-2xl">
        <FileX className="h-12 w-12 text-[var(--color-muted)]" />
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">No Articles Found</h3>
      <p className="text-[var(--color-muted)] mb-6 max-w-md">
        We couldn't find any articles for the selected topic. Try changing your filters or reload to
        see fresh content.
      </p>
      <div className="flex gap-4">
        <button onClick={handleReload} className="btn-primary flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Reload Articles
        </button>
        <button onClick={() => setAppState('loaded')} className="btn-secondary">
          Reset View
        </button>
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-6 p-4 bg-[var(--color-error)] rounded-2xl">
        <AlertCircle className="h-12 w-12 text-[var(--color-text)]" />
      </div>
      <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2">Something Went Wrong</h3>
      <p className="text-[var(--color-muted)] mb-6 max-w-md">
        We encountered an error while loading the articles. Please check your connection and try
        again.
      </p>
      <div className="flex gap-4">
        <button onClick={handleReload} className="btn-primary flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <button onClick={() => setAppState('loaded')} className="btn-secondary">
          Use Cached Data
        </button>
      </div>
    </div>
  );

  const renderLoadedState = () => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {articles.map((article) => (
          <ArticleCard
            key={article.id}
            article={article}
            onSummarize={(id) => handleSummarize(id, 'bullets')}
            onBookmark={handleBookmark}
            onShare={handleShare}
            isSummarizing={!!loadingSummaryById[article.id]}
          />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        disabled={appState === 'loading'}
      />
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Header
        selectedTopic={selectedTopic}
        onTopicChange={handleTopicChange}
        onReload={handleReload}
        isLoading={isReloading}
      />

      {SHOW_STATUS && <StatusBar status={status} variant={import.meta.env.DEV ? 'dev' : 'prod'} />}

      <div className="flex">
        <Sidebar
          className="hidden lg:flex flex-shrink-0"
          selectedSources={filters.sources}
          timeRange={filters.timeRange}
          counts={{ theverge: 45, hackernews: 32, bbc: 28, techcrunch: 19 }} // TODO: wire real counts
          onToggleSource={(id) =>
            setFilters((f) => ({
              ...f,
              sources: f.sources.includes(id) ? f.sources.filter((x) => x !== id) : [...f.sources, id],
            }))
          }
          onChangeTime={(tr) => setFilters((f) => ({ ...f, timeRange: tr }))}
          disabled={true} // Set to true if you want to freeze the panel for MVP deploy
        />

        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-7xl">
            {/* Debug controls */}
            {import.meta.env.DEV && (
              <div className="mb-6 p-4 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)]">
                <h3 className="text-sm font-medium text-[var(--color-text)] mb-3">
                  Debug Controls (Demo Only)
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setAppState('loading')} className="btn-ghost">
                    Loading State
                  </button>
                  <button onClick={() => setAppState('loaded')} className="btn-ghost">
                    Loaded State
                  </button>
                  <button
                    onClick={() => {
                      setArticles([]);
                      setAppState('empty');
                    }}
                    className="btn-ghost"
                  >
                    Empty State
                  </button>
                  <button onClick={() => setAppState('error')} className="btn-ghost">
                    Error State
                  </button>
                </div>
              </div>
            )}

            {appState === 'loading' && renderLoadingState()}
            {appState === 'empty' && renderEmptyState()}
            {appState === 'error' && renderErrorState()}
            {appState === 'loaded' && renderLoadedState()}
          </div>
        </main>
      </div>

      <footer className="border-t border-[var(--color-border)] mt-12 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-[var(--color-muted)]">
            Made with ❤️ by <span className="text-[var(--color-accent)] font-medium">Kien</span>
          </p>
        </div>
      </footer>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default Index;
