import { Filter, TrendingUp } from 'lucide-react';

/**
 * Source/time-range types used by Sidebar and parent page.
 * Keep in sync with the page that owns filter state.
 */
export type SourceId = 'theverge' | 'hackernews' | 'bbc' | 'techcrunch';
export type TimeRange = '1h' | '6h' | '1d' | '1w';

/** Optional per-source article counts to show badges */
type Counts = Partial<Record<SourceId, number>>;

interface SidebarProps {
  /** Which sources are currently selected */
  selectedSources: SourceId[];
  /** Current time-range filter */
  timeRange: TimeRange;
  /** (Optional) counts to display near each source */
  counts?: Counts;

  /** Toggle handler for a single source checkbox */
  onToggleSource: (id: SourceId) => void;
  /** Radio-change handler for time range */
  onChangeTime: (tr: TimeRange) => void;

  /**
   * When true, the entire panel is visually disabled (for MVP deploy).
   * We still render it to keep layout, but block interactions.
   */
  disabled?: boolean;

  className?: string;
}

/**
 * Sidebar (Filter Panel) — MVP functional version
 * - Renders list of sources (checkboxes)
 * - Renders time range (radio group)
 * - Delegates state changes via callbacks to the parent page
 */
export default function Sidebar({
  selectedSources,
  timeRange,
  counts = {},
  onToggleSource,
  onChangeTime,
  disabled = false,
  className = '',
}: SidebarProps) {
  const wrapperDisabledCls = disabled ? 'pointer-events-none select-none' : '';
  const rowCls =
    'flex items-center justify-between p-2 rounded-lg ' +
    (disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-[hsl(var(--color-border))] cursor-pointer');

  const isChecked = (id: SourceId) => selectedSources.includes(id);

  return (
    <aside
      className={`w-60 bg-[hsl(var(--color-card))] border-r border-[hsl(var(--color-border))] ${className}`}
      aria-label="Filters"
    >
      <div className={`p-4 ${wrapperDisabledCls}`}>
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-5 w-5 text-[hsl(var(--color-accent))]" />
          <h2 className="font-semibold text-[hsl(var(--color-text))]">Filters</h2>
          {disabled && (
            <span className="ml-2 text-[11px] rounded-md bg-slate-700/70 px-2 py-0.5">Coming soon</span>
          )}
        </div>

        {/* Sources */}
        <h3 className="text-sm font-medium text-[hsl(var(--color-muted))] mb-3">Sources</h3>
        <div className="space-y-2">
          {(['theverge', 'hackernews', 'bbc', 'techcrunch'] as SourceId[]).map((id) => (
            <label key={id} className={rowCls}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={isChecked(id)}
                  onChange={() => onToggleSource(id)}
                  className="w-4 h-4 accent-[hsl(var(--color-accent))]"
                />
                <span className="text-sm text-[hsl(var(--color-text))]">
                  {id === 'theverge'
                    ? 'The Verge'
                    : id === 'hackernews'
                    ? 'Hacker News'
                    : id === 'bbc'
                    ? 'BBC News'
                    : 'TechCrunch'}
                </span>
              </div>
              <span className="text-xs text-[hsl(var(--color-muted))] bg-[hsl(var(--color-border))] px-2 py-1 rounded-full">
                {counts[id] ?? 0}
              </span>
            </label>
          ))}
        </div>

        {/* Time Range */}
        <h3 className="mt-6 text-sm font-medium text-[hsl(var(--color-muted))] mb-3">Time Range</h3>
        <div className="space-y-2">
          {([
            { k: '1h', label: 'Last Hour' },
            { k: '6h', label: 'Last 6 Hours' },
            { k: '1d', label: 'Last Day' },
            { k: '1w', label: 'Last Week' },
          ] as { k: TimeRange; label: string }[]).map((t) => (
            <label key={t.k} className={rowCls}>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="tr"
                  disabled={disabled}
                  checked={timeRange === t.k}
                  onChange={() => onChangeTime(t.k)}
                  className="w-4 h-4 accent-[hsl(var(--color-accent))]"
                />
                <span className="text-sm text-[hsl(var(--color-text))]">{t.label}</span>
              </div>
            </label>
          ))}
        </div>

        {/* Quick Stats (static for now; wire real data later) */}
        <div className="mt-8 p-4 bg-[hsl(var(--color-bg))] rounded-xl">
          <h3 className="text-sm font-medium text-[hsl(var(--color-text))] mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Quick Stats
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--color-muted))]">Today's Articles</span>
              <span className="text-[hsl(var(--color-text))] font-medium">124</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--color-muted))]">Trending</span>
              <span className="text-[hsl(var(--color-text))] font-medium">18</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[hsl(var(--color-muted))]">Bookmarked</span>
              <span className="text-[hsl(var(--color-text))] font-medium">7</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
