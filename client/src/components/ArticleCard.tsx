// client/src/components/ui/ArticleCard.tsx
import { useMemo, useState } from 'react';
import { ExternalLink, Clock, Sparkles, Bookmark, Share2, Loader2 } from 'lucide-react';
import type { ArticleWithSummary } from '@/lib/types';
import SummaryPanel from './SummaryPanel';

interface ArticleCardProps {
  article: ArticleWithSummary;
  onSummarize: (articleId: string) => void;
  onBookmark?: (articleId: string) => void;
  onShare?: (articleId: string) => void;
  /** show loading state for summarize action (controlled by parent) */
  isSummarizing?: boolean;
}

const PLACEHOLDER = '/no-image-placeholder.png';

export default function ArticleCard({
  article,
  onSummarize,
  onBookmark,
  onShare,
  isSummarizing = false,
}: ArticleCardProps) {
  const [summaryExpanded, setSummaryExpanded] = useState<boolean>(
    article.summaryExpanded || false
  );

  // Choose an image source with graceful fallback.
  const imgSrc = useMemo(() => {
    const src =
      (article as any).image ||
      (article as any).thumbnail ||
      (article as any).urlToImage ||
      (article as any).img ||
      '';
    return src || PLACEHOLDER;
  }, [article]);

  // Simple "time ago" formatter
  const timeAgo = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return 'Just now';
    const now = Date.now();
    const diffHours = Math.floor((now - d.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Summarize toggler: calls API the first time, toggles panel otherwise
  const handleSummarize = () => {
    if (isSummarizing) return; // ignore while loading
    if (!article.summary) {
      onSummarize(article.id);
      setSummaryExpanded(true);
      return;
    }
    setSummaryExpanded((v) => !v);
  };

  return (
    <article className="card-article">
      {/* Thumbnail with fallback */}
      <div className="mb-4 overflow-hidden rounded-xl">
        <img
          src={imgSrc || PLACEHOLDER}
          alt={article.title || 'article thumbnail'}
          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            const el = e.currentTarget;
            // Avoid infinite loop if placeholder fails
            if (!el.dataset.fallbackApplied) {
              el.src = PLACEHOLDER;
              el.dataset.fallbackApplied = 'true';
            }
          }}
        />
      </div>

      {/* Header: source + time + quick actions */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[hsl(var(--color-accent))]">
            {article.source}
          </span>
          <span className="text-[hsl(var(--color-muted))]">•</span>
          <div className="flex items-center gap-1 text-[hsl(var(--color-muted))]">
            <Clock className="h-3 w-3" />
            <span className="text-sm">{timeAgo(article.publishedAt)}</span>
          </div>
        </div>

        {/* Quick Actions  (MVP): Share only. Hid bookmark*/}
        <div className="flex items-center gap-1">
          {/* <button
            onClick={() => onBookmark?.(article.id)}
            className="p-1 text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))] rounded transition-all duration-150"
            aria-label="Bookmark article"
          >
            <Bookmark className="h-4 w-4" />
          </button> */}
          <button
            onClick={() => onShare?.(article.id)}
            className="p-1 text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))] hover:bg-[hsl(var(--color-border))] rounded transition-all duration-150"
            aria-label="Share article"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h2 className="mb-3">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-semibold text-[hsl(var(--color-text))] hover:text-[hsl(var(--color-accent))] transition-colors duration-150 line-clamp-2 flex items-start gap-2 group"
        >
          <span className="flex-1">{article.title}</span>
          <ExternalLink className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex-shrink-0 mt-0.5" />
        </a>
      </h2>

      {/* Excerpt */}
      <p className="text-[hsl(var(--color-muted))] mb-4 line-clamp-3 leading-relaxed">
        {article.excerpt}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSummarize}
            disabled={isSummarizing}
            aria-busy={isSummarizing}
            className={`btn-secondary flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
              article.summary ? 'text-[hsl(var(--color-accent))]' : ''
            }`}
            title={isSummarizing ? 'Summarizing…' : 'Generate summary'}
          >
            {isSummarizing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Summarizing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                {article.summary ? 'View Summary' : 'Summarize'}
              </>
            )}
          </button>
        </div>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost flex items-center gap-2"
        >
          Read More
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Summary Panel */}
      {article.summary && (
        <SummaryPanel
          summary={article.summary}
          isExpanded={summaryExpanded}
          onToggle={() => setSummaryExpanded((v) => !v)}
          onModeChange={(mode) => {
            // lift state to parent if you want to persist summary mode
            console.log('Summary mode changed to:', mode);
          }}
        />
      )}
    </article>
  );
}
