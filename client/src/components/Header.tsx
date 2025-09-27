// client/src/components/ui/Header.tsx
import { useEffect, useRef, useState } from 'react';
import { RefreshCw, ChevronDown } from 'lucide-react';
import type { Topic } from '@/lib/types';

interface HeaderProps {
  selectedTopic: Topic;
  onTopicChange: (topic: Topic) => void;
  onReload: () => void;
  isLoading?: boolean;
}

const topics: { value: Topic; label: string }[] = [
  { value: 'tech',    label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'world',   label: 'World News' },
];

export default function Header({
  selectedTopic,
  onTopicChange,
  onReload,
  isLoading = false,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(
    Math.max(0, topics.findIndex((t) => t.value === selectedTopic))
  );

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<HTMLButtonElement[]>([]);

  // Close when clicking outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        menuRef.current && !menuRef.current.contains(t) &&
        btnRef.current && !btnRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // Keep active item aligned with selected
  useEffect(() => {
    const i = topics.findIndex((t) => t.value === selectedTopic);
    if (i >= 0) setActiveIdx(i);
  }, [selectedTopic]);

  // Ensure active item visible
  useEffect(() => {
    if (!open) return;
    const el = itemRefs.current[activeIdx];
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, activeIdx]);

  const current = topics.find((t) => t.value === selectedTopic) ?? topics[0];

  const toggleMenu = () => setOpen((o) => !o);

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIdx((i) => Math.min(i + (e.key === 'ArrowDown' ? 1 : 0), topics.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) setOpen(true);
      setActiveIdx((i) => Math.max(i - 1, 0));
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, topics.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const t = topics[activeIdx];
      if (t) {
        onTopicChange(t.value);
        setOpen(false);
        btnRef.current?.focus();
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[hsl(var(--color-bg))] border-b border-[hsl(var(--color-border))] backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="News Tracker AI logo"
              className="h-12 w-12 object-contain"
              loading="eager"
            />
            <h1 className="text-2xl font-bold text-[hsl(var(--color-text))] ml-2">
              News Tracker AI
            </h1>
          </div>


          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* Custom Select */}
            <div className="relative">
              <button
                ref={btnRef}
                type="button"
                onClick={toggleMenu}
                onKeyDown={onButtonKeyDown}
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2
                           bg-[hsl(var(--color-card))] border border-[hsl(var(--color-border))]
                           text-[hsl(var(--color-text))] hover:border-[hsl(var(--color-accent))]
                           focus:outline-none focus:ring-2 focus:ring-[hsl(var(--color-accent))]
                           focus:ring-offset-2 focus:ring-offset-[hsl(var(--color-bg))]"
                aria-haspopup="listbox"
                aria-expanded={open}
              >
                {current.label}
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
              </button>

              {open && (
                <div
                  ref={menuRef}
                  role="listbox"
                  tabIndex={-1}
                  onKeyDown={onMenuKeyDown}
                  className="absolute z-[60] mt-2 w-[220px] rounded-lg
                             border border-[hsl(var(--color-border))]
                             bg-[hsl(var(--color-card))] shadow-lg overflow-hidden"
                >
                  <ul className="max-h-64 overflow-auto py-1">
                    {topics.map((t, i) => {
                      const selected = t.value === selectedTopic;
                      const active = i === activeIdx;
                      return (
                        <li key={t.value}>
                          <button
                            ref={(el) => { if (el) itemRefs.current[i] = el; }}
                            role="option"
                            aria-selected={selected}
                            onMouseEnter={() => setActiveIdx(i)}
                            onClick={() => {
                              onTopicChange(t.value);
                              setOpen(false);
                              btnRef.current?.focus();
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between
                                        outline-none transition
                                        ${active ? 'bg-[hsl(var(--color-border))]/20' : 'bg-[hsl(var(--color-card))]'}
                                        text-[hsl(var(--color-text))]`}
                          >
                            <span>{t.label}</span>
                            {selected && (
                              <span className="text-[hsl(var(--color-accent))] text-xs font-medium">
                                Selected
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Reload Button */}
            <button
              onClick={onReload}
              disabled={isLoading}
              aria-busy={isLoading}
              title={isLoading ? 'Reloading…' : 'Reload articles'}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reload</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
