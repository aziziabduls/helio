'use client';

import TimelineSection from '@/components/TimelineSection';
import { useAuth } from '@/context/AuthContext';
import { EventItem, fetchEvents } from '@/lib/api';
import { Calendar as CalIcon, Plus, Search, Share2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const POPULAR_CITIES = ['San Francisco', 'New York', 'London', 'Jakarta', 'Los Angeles'];
const CATEGORIES = ['All', 'AI', 'Tech', 'Arts & Culture', 'Food & Drink', 'Running', 'Fitness'];

interface CityEventsViewProps {
  initialCity?: string;
}

export default function CityEventsView({ initialCity = 'San Francisco' }: CityEventsViewProps) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();

  const [activeCity, setActiveCity] = useState<string>(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [timeframe, setTimeframe] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (initialCity) {
      setActiveCity(initialCity);
    }
  }, [initialCity]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchEvents({
      timeframe,
      city: activeCity,
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      search: searchQuery || undefined,
    })
      .then((data) => {
        if (active) {
          setEvents(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(`Failed to load events for ${activeCity}:`, err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeCity, selectedCategory, timeframe, searchQuery]);

  const handleCityChange = (newCity: string) => {
    setActiveCity(newCity);
    router.push(`/city?city=${encodeURIComponent(newCity)}`);
  };

  const handleCreateClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal();
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      toast.success(`Copied link to ${activeCity} events!`);
    }
  };

  // Group events by date string
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = event.startAt.split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, EventItem[]>);

  const dateKeys = Object.keys(groupedEvents);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20">
      {/* City Hero Header */}
      <div className="flex flex-col items-start pb-8 border-b border-black/[0.08] dark:border-white/[0.08] mb-8">
        {/* <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4">
          <MapPin className="w-3.5 h-3.5" />
          <span>Events City Guide</span>
        </div> */}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between w-full gap-4">
          <div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              Popular events in <br></br> <span className="luma-gradient-text">{activeCity}</span>
            </h1>
            <p className="text-sm text-slate-600 dark:text-white/60 mt-2 max-w-xl leading-relaxed">
              Discover the hottest events in {activeCity}, and get notified of new gatherings before they sell out.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-full border border-black/[0.1] dark:border-white/10 hover:border-black/[0.2] dark:hover:border-white/20 text-slate-600 dark:text-white/70 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Share city calendar"
              aria-label="Share city calendar"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <Link
              href="/create"
              onClick={handleCreateClick}
              className="luma-btn luma-btn-primary px-4 py-2 text-xs font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Host Event
            </Link>
          </div>
        </div>

        {/* City Switcher Bar */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1 w-full scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 dark:text-white/40 mr-1 flex-shrink-0">
            Cities:
          </span>
          {POPULAR_CITIES.map((c) => {
            const isSelected = activeCity.toLowerCase() === c.toLowerCase();
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleCityChange(c)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-black border-transparent font-semibold shadow-sm'
                  : 'bg-black/[0.03] dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08] text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:border-black/20 dark:hover:border-white/20'
                  }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Switcher Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all border ${selectedCategory === cat
                ? 'luma-btn luma-btn-primary font-medium'
                : 'bg-black/[0.03] dark:bg-white/[0.03] border-black/[0.06] dark:border-white/[0.06] text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:border-black/20 dark:hover:border-white/20'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right side: Search & Upcoming/Past Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${activeCity}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/40 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="flex items-center p-1 bg-black/[0.04] dark:bg-white/[0.05] border border-black/[0.08] dark:border-white/[0.08] rounded-full">
            <button
              type="button"
              onClick={() => setTimeframe('upcoming')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${timeframe === 'upcoming'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Upcoming
            </button>
            <button
              type="button"
              onClick={() => setTimeframe('past')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${timeframe === 'past'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-black font-semibold shadow-sm'
                : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              Past
            </button>
          </div>
        </div>
      </div>

      {/* Events Timeline Container */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 dark:text-white/40">Loading events in {activeCity}...</p>
        </div>
      ) : dateKeys.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-black/[0.1] dark:border-white/[0.1] rounded-2xl p-8 space-y-4">
          <CalIcon className="w-10 h-10 text-slate-300 dark:text-white/20 mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">
              No events found in {activeCity}
            </h3>
            <p className="text-xs text-slate-500 dark:text-white/50 mt-1 max-w-sm mx-auto">
              There are no {timeframe} events matching your criteria in {activeCity}.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/create"
              onClick={handleCreateClick}
              className="inline-flex items-center gap-1.5 luma-btn luma-btn-primary px-4 py-2 text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Host the First Event in {activeCity}
            </Link>
            <Link
              href="/events"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View all cities
            </Link>
          </div>
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
