import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, List, AlignLeft, Sparkles } from 'lucide-react';
import type { Summary } from '@/lib/types';

interface SummaryPanelProps {
  summary: Summary;                 // { mode: 'bullets' | 'paragraph', items? | text? }
  isExpanded: boolean;
  onToggle: () => void;
  onModeChange?: (mode: 'bullets' | 'paragraph') => void;
}

export default function SummaryPanel({
  summary,
  isExpanded,
  onToggle,
  onModeChange,
}: SummaryPanelProps) {
  // Local view mode (can differ from BE mode if user switches tabs)
  const [currentMode, setCurrentMode] = useState<'bullets' | 'paragraph'>(summary.mode);

  // Keep local mode in sync if BE sends a new summary with a different mode
  useEffect(() => {
    setCurrentMode(summary.mode);
  }, [summary.mode]);

  const handleModeChange = (mode: 'bullets' | 'paragraph') => {
    setCurrentMode(mode);
    onModeChange?.(mode);
  };

  // Compute what to display based on current tab
  const display = useMemo(() => {
    if (currentMode === 'bullets') {
      // Already bullets
      if (summary.mode === 'bullets' && Array.isArray((summary as any).items)) {
        return (summary as any).items as string[];
      }
      // Convert paragraph → bullets (best-effort split)
      const text = (summary as any).text ?? '';
      return String(text)
        .split(/\r?\n|(?<=[.!?])\s+/)
        .map(s => s.replace(/^[-•\s]+/, '').trim())
        .filter(Boolean)
        .slice(0, 8);
    } else {
      // Paragraph view
      if (summary.mode === 'paragraph' && typeof (summary as any).text === 'string') {
        return (summary as any).text as string;
      }
      const items = Array.isArray((summary as any).items) ? (summary as any).items : [];
      return items.join(' ');
    }
  }, [summary, currentMode]);

  const showBadge = import.meta.env.DEV; // hide the "Generated" badge in production

  return (
    <div className="border-t border-[hsl(var(--color-border))] mt-4">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-[hsl(var(--color-border))]
                   transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2
                   focus:ring-[hsl(var(--color-accent))] focus:ring-offset-2 focus:ring-offset-[hsl(var(--color-bg))]"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[hsl(var(--color-accent))]" />
          <span className="font-medium text-[hsl(var(--color-text))]">AI Summary</span>
          {showBadge && <span className="badge badge-info">Generated</span>}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4 text-[hsl(var(--color-muted))]" />
        ) : (
          <ChevronDown className="h-4 w-4 text-[hsl(var(--color-muted))]" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-[hsl(var(--color-muted))]">View as:</span>
            <div className="flex bg-[hsl(var(--color-border))] rounded-lg p-1">
              <button
                onClick={() => handleModeChange('bullets')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all duration-150
                  ${currentMode === 'bullets'
                    ? 'bg-[hsl(var(--color-accent))] text-[hsl(var(--color-text))]'
                    : 'text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]'}`}
              >
                <List className="h-3 w-3" />
                Bullets
              </button>
              <button
                onClick={() => handleModeChange('paragraph')}
                className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all duration-150
                  ${currentMode === 'paragraph'
                    ? 'bg-[hsl(var(--color-accent))] text-[hsl(var(--color-text))]'
                    : 'text-[hsl(var(--color-muted))] hover:text-[hsl(var(--color-text))]'}`}
              >
                <AlignLeft className="h-3 w-3" />
                Paragraph
              </button>
            </div>
          </div>

          {/* Summary Body */}
          <div className="bg-[hsl(var(--color-bg))] rounded-lg p-4">
            {currentMode === 'bullets' ? (
              <ul className="space-y-2">
                {(Array.isArray(display) ? display : []).map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-[hsl(var(--color-text))]">
                    <span className="w-1.5 h-1.5 bg-[hsl(var(--color-accent))] rounded-full mt-2 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[hsl(var(--color-text))] leading-relaxed">
                {typeof display === 'string' ? display : ''}
              </p>
            )}
          </div>

          {/* Footer (optional meta) */}
          <div className="flex items-center justify-between mt-3 text-xs text-[hsl(var(--color-muted))]">
            <span>Generated by AI</span>
            {/* add time/usage here if needed */}
          </div>
        </div>
      )}
    </div>
  );
}
