'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  CategoryItem,
  CityItem,
  EventItem,
  fetchCalendars,
  fetchCategories,
  fetchCities,
  fetchEvents,
} from '@/lib/api';
import {
  ArrowRight,
  Check,
  MapPin,
  Plus,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

function formatPopularEventDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const day = d.getDate();
    let hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${weekday}, ${month} ${day}, ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return dateStr;
  }
}

function detectDefaultCity(): string {
  if (typeof window === 'undefined') return 'Jakarta';

  // Check URL query param first (e.g. ?city=...)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const qCity = urlParams.get('city');
    if (qCity) return qCity;
  } catch (e) {
    // ignore
  }

  // Detect based on user timezone
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) {
      const lower = tz.toLowerCase();
      if (lower.includes('jakarta') || lower.includes('pontianak') || lower.includes('makassar') || lower.includes('jayapura')) return 'Jakarta';
      if (lower.includes('los_angeles') || lower.includes('san_francisco')) return 'San Francisco';
      if (lower.includes('new_york') || lower.includes('detroit')) return 'New York';
      if (lower.includes('london')) return 'London';
      if (lower.includes('singapore')) return 'Singapore';
      if (lower.includes('tokyo')) return 'Tokyo';
      if (lower.includes('paris')) return 'Paris';
      if (lower.includes('berlin')) return 'Berlin';
      if (lower.includes('sydney') || lower.includes('melbourne')) return 'Sydney';
      if (lower.includes('dubai')) return 'Dubai';
      if (lower.includes('bangkok')) return 'Bangkok';
      if (lower.includes('seoul')) return 'Seoul';

      const parts = tz.split('/');
      if (parts.length > 1) {
        const cityPart = parts[parts.length - 1].replace(/_/g, ' ');
        if (cityPart) return cityPart;
      }
    }
  } catch (e) {
    // fallback
  }

  return 'Jakarta';
}

export default function DiscoverPage() {
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [selectedCity, setSelectedCity] = useState<string>('Jakarta');
  const [popularEvents, setPopularEvents] = useState<EventItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);

  const toggleFollow = (slug: string) => {
    setFollowing((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // 1. Load categories, calendars, and cities directly from database
  useEffect(() => {
    fetchCategories().then(setCategories).catch(console.error);
    fetchCalendars().then(setCalendars).catch(console.error);
    fetchCities().then(setCities).catch(console.error);
  }, []);

  const placesByContinent = useMemo(() => {
    const map: Record<string, CityItem[]> = {};
    for (const place of cities) {
      const continent = place.continent || place.region || 'Other';
      if (!map[continent]) map[continent] = [];
      map[continent].push(place);
    }
    return map;
  }, [cities]);

  // 2. Detect location on mount (Timezone immediate + Geolocation high-accuracy refinement)
  useEffect(() => {
    const initialCity = detectDefaultCity();
    setSelectedCity(initialCity);

    // Geolocation API check for precise city
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            if (res.ok) {
              const data = await res.json();
              const detected = data.city || data.locality || data.principalSubdivision;
              if (detected) {
                setSelectedCity(detected);
              }
            }
          } catch (err) {
            console.warn('Geolocation reverse geocode error:', err);
          }
        },
        () => {
          // Gracefully keep default or timezone-detected city
        },
        { timeout: 6000 }
      );
    }
  }, []);

  // 3. Fetch events matching selectedCity, fallback to all events if city has no events yet
  useEffect(() => {
    let isMounted = true;
    fetchEvents({ city: selectedCity, timeframe: 'all' })
      .then((data) => {
        if (isMounted) {
          if (data && data.length > 0) {
            setPopularEvents(data);
          } else {
            // If no events found for the detected city, fetch general events so page is full
            fetchEvents({ timeframe: 'all' })
              .then((allData) => {
                if (isMounted && allData && allData.length > 0) {
                  setPopularEvents(allData);
                }
              })
              .catch(() => { });
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load events for', selectedCity, err);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-24 space-y-16">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Discover Events
        </h1>
        <p className="text-sm sm:text-base text-white/60 max-w-2xl leading-relaxed">
          Explore popular events near you, browse by category, or check out some of the great community calendars.
        </p>
      </div>

      {/* ================= POPULAR EVENTS (MATCHING USER SCREENSHOT) ================= */}
      <section className="space-y-6">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Popular Events
            </h2>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <span className="text-base text-white/60 font-medium">In {selectedCity}</span>
            </div>
          </div>

          <Link
            href={`/city?city=${encodeURIComponent(selectedCity)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-xs font-semibold text-white transition-colors flex-shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 2-Column Grid matching Screenshot */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {popularEvents.slice(0, 6).map((event) => (
            <Link
              key={event.id || event.slug}
              href={`/${event.slug}`}
              className="flex items-start gap-4 group cursor-pointer"
            >
              {/* Cover Image Thumbnail (Portrait Aspect Ratio) */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 aspect-square sm:aspect-[3/4] rounded-2xl overflow-hidden bg-white/[0.05] border border-white/[0.08] flex-shrink-0 relative shadow-sm">
                <img
                  src={event.coverUrl}
                  alt={event.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Event Metadata */}
              <div className="flex-1 min-w-0 space-y-1 pt-0.5">
                <div className="text-xs text-white/50 font-medium">
                  {formatPopularEventDate(event.startAt)}
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                  {event.name}
                </h3>

                <div className="text-xs text-white/40 truncate">
                  {event.address || event.city}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 1. BROWSE BY CATEGORY ================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Browse by Category</span>
          </h2>
        </div>

        {/* Category Grid loaded from Database */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug || cat.name}
              href={`/events?category=${encodeURIComponent(cat.name)}`}
              className="luma-card p-3 sm:p-3.5 flex items-center gap-3 group hover:border-white/20 hover:bg-white/[0.04] transition-all"
            >
              <img
                src={cat.icon}
                alt={cat.name}
                className="w-10 h-10 object-contain rounded-lg flex-shrink-0 group-hover:scale-105 transition-transform"
              />
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                  {cat.name}
                </div>
                <div className="text-[11px] text-white/40 mt-0.5">
                  {cat.count} Events
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= 2. FEATURED CALENDARS ================= */}
      <section className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">Featured Calendars</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {calendars.map((cal) => (
            <Card
              key={cal.slug}
              className="p-5 flex flex-col justify-between space-y-4 group hover:border-white/20 transition-all bg-[#161b22]/70 backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/calendar/${cal.slug}`}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/10 flex-shrink-0 bg-white/[0.05]"
                    style={{ borderTop: `2px solid ${cal.tintColor || '#3b82f6'}` }}
                  >
                    <img
                      src={cal.avatarUrl || 'https://images.lumacdn.com/discovery/calgary-icon.png'}
                      alt={cal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {cal.name}
                    </h3>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      {cal.subscriberCount?.toLocaleString() || '0'} followers
                    </div>
                  </div>
                </Link>

                {/* Follow Button using shadcn Button */}
                <Button
                  size="sm"
                  variant={following[cal.slug] ? 'outline' : 'default'}
                  onClick={() => toggleFollow(cal.slug)}
                  className={`text-xs font-semibold gap-1.5 ${following[cal.slug]
                    ? 'border-blue-500/40 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20'
                    : ''
                    }`}
                >
                  {following[cal.slug] ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Following
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      Follow
                    </>
                  )}
                </Button>
              </div>

              {/* Description */}
              <p className="text-xs text-white/60 line-clamp-2 leading-relaxed whitespace-pre-line">
                {cal.description}
              </p>

              <Link
                href={`/calendar/${cal.slug}`}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors pt-2 border-t border-white/[0.05] flex items-center justify-between"
              >
                <span>View Community Calendar</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* ================= 3. EXPLORE LOCAL EVENTS ================= */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-black/[0.08] dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Explore Local Events
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-white/40">
            {cities.length} cities available
          </span>
        </div>

        {cities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-white/40 text-xs">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading local cities from database...
          </div>
        ) : (
          /* Shadcn Tabs by Continent */
          <Tabs defaultValue={Object.keys(placesByContinent)[0] || 'North America'} className="w-full space-y-6">
            <TabsList className="bg-black/[0.04] dark:bg-white/[0.04] p-1 border border-black/[0.08] dark:border-white/[0.08] overflow-x-auto max-w-full justify-start h-auto">
              {Object.keys(placesByContinent).map((continent) => (
                <TabsTrigger
                  key={continent}
                  value={continent}
                  className="px-4 py-2 text-xs font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black"
                >
                  {continent}
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.entries(placesByContinent).map(([continent, places]) => (
              <TabsContent key={continent} value={continent} className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
                  {places.map((place) => (
                    <Link
                      key={place.slug || place.name}
                      href={place.slug ? `/city/${place.slug}` : `/city?city=${encodeURIComponent(place.name)}`}
                      className="luma-card p-3 flex items-center gap-3 group hover:border-black/20 dark:hover:border-white/20 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] transition-all"
                    >
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 p-1 flex items-center justify-center"
                        style={{ backgroundColor: place.tint || '#2f7ca9' }}
                      >
                        <img
                          src={place.icon}
                          alt={place.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate">
                          {place.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-white/40 mt-0.5">
                          {place.count} Events
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </section>
    </div>
  );
}
