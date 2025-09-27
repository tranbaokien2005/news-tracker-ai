// client/src/components/StatusBar.tsx
import type { StatusData } from '@/lib/types';

// Extended UI status to carry a last updated timestamp
export interface UIStatus extends StatusData {
  lastUpdated?: number; // epoch milliseconds
}

// Convert a timestamp into a short "time ago" string
function timeAgo(ts?: number) {
  if (!ts) return 'just now';
  const diff = Date.now() - ts;
  const mins = Math.max(1, Math.round(diff / 60000));
  return mins < 60 ? `${mins}m ago` : `${Math.round(mins / 60)}h ago`;
}

interface Props {
  status: UIStatus;
  className?: string;
  // "dev" shows detailed counters for debugging; "prod" shows a cleaner wording
  variant?: 'dev' | 'prod';
}

export default function StatusBar({ status, className = '', variant = 'dev' }: Props) {
  // Safe number parsing
  const cached = Number(status?.cached ?? 0);
  const fresh = Number(status?.fresh ?? 0);
  const currentPage = Number(status?.currentPage ?? 1);
  const totalPages = Number(status?.totalPages ?? 1);
  const totalItems = Number(status?.totalItems ?? 0);

  const isCached = cached > 0;

  const badge = (
    <span
      className={`px-2 py-0.5 rounded-md border text-xs font-medium ${
        isCached
          ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
          : 'border-sky-500/30 text-sky-400 bg-sky-500/10'
      }`}
    >
      {isCached ? 'Cached' : 'Live'}
    </span>
  );

  return (
    <div className={`w-full border-b border-[var(--color-border)] bg-[var(--color-card)]/40 ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-sm">
        {variant === 'dev' ? (
          // DEV wording: show raw counters for debugging
          <div className="flex items-center gap-3">
            {badge}
            <span className="text-[var(--color-muted)]">
              Items:{' '}
              <span className="text-[var(--color-text)] font-medium">{totalItems}</span>
            </span>
            {isCached ? (
              <span className="text-[var(--color-muted)]">
                Cached: <span className="text-[var(--color-text)]">{cached}</span>
              </span>
            ) : (
              <span className="text-[var(--color-muted)]">
                Fresh: <span className="text-[var(--color-text)]">{fresh}</span>
              </span>
            )}
          </div>
        ) : (
          // PROD wording: cleaner, user-facing
          <div className="flex items-center gap-3 text-[var(--color-muted)]">
            {badge}
            <span>
              Updated {timeAgo(status?.lastUpdated)} ·{' '}
              <span className="text-[var(--color-text)] font-medium">{totalItems}</span> articles
            </span>
          </div>
        )}

        <div className="text-[var(--color-muted)]">
          Page <span className="text-[var(--color-text)] font-medium">{currentPage}</span>/
          <span className="text-[var(--color-text)] font-medium">{totalPages}</span>
        </div>
      </div>
    </div>
  );
}
