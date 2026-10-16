'use client';

import TimelineSection from '@/components/TimelineSection';
import { EventItem, fetchEvents } from '@/lib/api';
import { Calendar as CalIcon, MapPin, Plus, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function HomePageContent() {
  const searchParams = useSearchParams();
  const cityParam = searchParams.get('city');
  const categoryParam = searchParams.get('category');

  const [timeframe, setTimeframe] = useState<'upcoming' | 'past'>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'All');
  const [cityFilter, setCityFilter] = useState<string | null>(cityParam);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const categories = ['All', 'AI', 'Tech', 'Arts & Culture', 'Food & Drink', 'Running', 'Fitness'];

  useEffect(() => {
    if (cityParam) setCityFilter(cityParam);
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [cityParam, categoryParam]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchEvents({
      timeframe,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      city: cityFilter || undefined,
      search: searchQuery || undefined,
    })
      .then((data) => {
        if (isMounted) {
          setEvents(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load events:', err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [timeframe, selectedCategory, cityFilter, searchQuery]);

  // Group events by date string (e.g. "2026-10-24")
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = event.startAt.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, EventItem[]>);

  const dateKeys = Object.keys(groupedEvents);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-16">
      {/* Top Banner / Hero Pill */}
      {/* <div className="mb-6 flex justify-center sm:justify-start">
        <Link
          href="/calendar/deepmind"
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 hover:bg-blue-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explore Google DeepMind Developer Events Calendar →</span>
        </Link>
      </div> */}

      {/* Page Header: Title & Segmented Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/[0.08] mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Events</h1>
          <p className="text-sm text-white/50 mt-1">
            Browse upcoming community events, hackathons, and gatherings.
          </p>
        </div>

        {/* Luma Segmented Switcher (Upcoming / Past) */}
        <div className="flex items-center p-1 bg-white/[0.05] border border-white/[0.08] rounded-full self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe('upcoming')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${timeframe === 'upcoming'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-white/60 hover:text-white'
              }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('past')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${timeframe === 'past'
                ? 'bg-white text-black font-semibold shadow-sm'
                : 'text-white/60 hover:text-white'
              }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border ${selectedCategory === cat
                  ? 'bg-blue-600 border-blue-500 text-white font-medium'
                  : 'bg-white/[0.03] border-white/[0.06] text-white/60 hover:text-white hover:border-white/20'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-xs text-white placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* Active City Filter Badge */}
      {cityFilter && (
        <div className="flex items-center gap-2 mb-6 px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>
            Filtering by city: <strong className="text-white font-semibold">{cityFilter}</strong>
          </span>
          <button
            type="button"
            onClick={() => setCityFilter(null)}
            className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.08] hover:bg-white/[0.14] text-white transition-colors"
          >
            <span>Clear filter</span>
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Events Timeline Container */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-white/40">Loading events...</p>
        </div>
      ) : dateKeys.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-white/[0.1] rounded-2xl p-8 space-y-4">
          <CalIcon className="w-10 h-10 text-white/20 mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-white">No events found</h3>
            <p className="text-xs text-white/50 mt-1 max-w-sm mx-auto">
              There are no {timeframe} events matching your current filter criteria.
            </p>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 luma-btn luma-btn-primary px-4 py-2 text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            Host the First Event
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {dateKeys.map((dateKey, index) => (
            <TimelineSection
              key={dateKey}
              dateStr={dateKey}
              events={groupedEvents[dateKey]}
              isLast={index === dateKeys.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}

