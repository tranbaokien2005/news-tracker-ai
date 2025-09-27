import { Filter, TrendingUp, Clock, Star, Settings } from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const filterSections = [
  {
    title: 'Sources',
    items: [
      { name: 'The Verge', count: 45, active: true },
      { name: 'Hacker News', count: 32, active: false },
      { name: 'BBC News', count: 28, active: false },
      { name: 'TechCrunch', count: 19, active: false },
    ],
  },
  {
    title: 'Time Range',
    items: [
      { name: 'Last Hour', count: 12, active: false },
      { name: 'Last 6 Hours', count: 45, active: true },
      { name: 'Last Day', count: 124, active: false },
      { name: 'Last Week', count: 892, active: false },
    ],
  },
];

export default function Sidebar({ className = '' }: SidebarProps) {
  return (
    <aside className={`w-60 bg-[hsl(var(--color-card))] border-r border-[hsl(var(--color-border))] ${className}`}>
      <div className="p-4">
        {/* Filters Header */}
        <div className="flex items-center gap-2 mb-6">
          <Filter className="h-5 w-5 text-[hsl(var(--color-accent))]" />
          <h2 className="font-semibold text-[hsl(var(--color-text))]">Filters</h2>
        </div>

        {/* Filter Sections */}
        <div className="space-y-6">
          {filterSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-medium text-[hsl(var(--color-muted))] mb-3">
                {section.title}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <label
                    key={item.name}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[hsl(var(--color-border))] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.active}
                        onChange={() => {}}
                        className="w-4 h-4 text-[hsl(var(--color-accent))] bg-[hsl(var(--color-bg))] 
                                 border-[hsl(var(--color-border))] rounded focus:ring-[hsl(var(--color-accent))]"
                      />
                      <span className="text-sm text-[hsl(var(--color-text))]">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs text-[hsl(var(--color-muted))] bg-[hsl(var(--color-border))] 
                                   px-2 py-1 rounded-full">
                      {item.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
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