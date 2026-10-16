'use client';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import { EventItem, fetchEvents } from '@/lib/api';
import { ArrowUpRight, Calendar, MapPin, Search, Sparkles, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EventSearchBar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Fetch search results on query change
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const events = await fetchEvents({ search: query.trim() || undefined });
        setResults(events.slice(0, 8));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, open]);

  const handleSelect = (slug: string) => {
    setOpen(false);
    setQuery('');
    router.push(`/${slug}`);
  };

  const handleQuickTag = (tag: string) => {
    setQuery(tag);
  };

  return (
    <>
      {/* Mobile: Icon-only Search Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search events"
        className="sm:hidden text-sm text-white/70 hover:text-white p-2 focus:outline-none"
      >
        <Search className="w-5 h-5" />
      </button>

      {/* Desktop: Full Search Trigger Button */}
      <div className="relative hidden sm:block">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] hover:border-white/[0.15] text-xs text-white/50 hover:text-white/80 transition-all focus:outline-none sm:w-56 md:w-64"
        >
          <Search className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
          <span className="truncate text-left flex-1">
            Search events, city, #tags...
          </span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.06] text-white/40 border border-white/[0.06]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Shadcn Command Dialog with Autocomplete Suggestions */}
      <CommandDialog open={open} onOpenChange={setOpen}>
        <div className="flex items-center border-b border-white/[0.08] px-3">
          <Search className="w-4 h-4 text-white/40 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by event name, city, or #tag"
            className="w-full bg-transparent py-3.5 text-sm text-white outline-none placeholder:text-white/40"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Tag Pills */}
        <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
          <span className="text-white/40 text-[11px] font-medium mr-1 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-blue-400" /> Suggestions:
          </span>
          {['#Fitness', '#Running', '#Tech', '#AI', 'Jakarta', 'San Francisco'].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleQuickTag(tag)}
              className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-white/[0.05] hover:bg-white/[0.12] border border-white/[0.08] text-white/70 hover:text-white transition-colors flex-shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        <CommandList className="max-h-[380px] p-2 overflow-y-auto">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-white/40 flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
              Searching events...
            </div>
          ) : results.length === 0 ? (
            <CommandEmpty className="py-8 text-center text-xs text-white/40">
              No events found matching "{query}". Try searching by name, city, or #category.
            </CommandEmpty>
          ) : (
            <CommandGroup heading={query ? 'Matching Events' : 'Popular & Upcoming Events'}>
              {results.map((ev) => {
                const date = new Date(ev.startAt);
                const dateStr = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
                return (
                  <CommandItem
                    key={ev.id}
                    onSelect={() => handleSelect(ev.slug)}
                    className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-white/[0.08] transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="w-11 h-11 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 border border-white/10 relative">
                      <img
                        src={ev.coverUrl}
                        alt={ev.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors truncate">
                        {ev.name}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-white/40" />
                          {dateStr}
                        </span>
                        {ev.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-white/40" />
                            {ev.city}
                          </span>
                        )}
                        {ev.category && (Array.isArray(ev.category) ? ev.category.length > 0 : Boolean(ev.category)) && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-white/[0.06] text-white/60">
                            {Array.isArray(ev.category)
                              ? ev.category.map((c) => (c.startsWith('#') ? c : `#${c}`)).join(' ')
                              : ev.category.startsWith('#')
                              ? ev.category
                              : `#${ev.category}`}
                          </span>
                        )}
                      </div>
                    </div>

                    <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors flex-shrink-0" />
                  </CommandItem>
                );
              })}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
