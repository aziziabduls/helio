'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EventItem, fetchEvents } from '@/lib/api';
import {
  ArrowRight,
  Check,
  MapPin,
  Plus,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// 12 Exact Categories from Luma Inspection
const CATEGORIES = [
  { name: 'Family', slug: 'family', count: '772', icon: 'https://images.lumacdn.com/uploads/aq/f5fbdde4-46a9-4d9e-b730-7144b3c0e335.png' },
  { name: 'Books', slug: 'books', count: '767', icon: 'https://images.lumacdn.com/uploads/3g/f33c0b3c-9090-40bb-b99c-875b534bcee4.png' },
  { name: 'Games', slug: 'games', count: '554', icon: 'https://images.lumacdn.com/uploads/mp/c65f64de-a537-4867-b7e6-7eedd3470c82.png' },
  { name: 'Tech', slug: 'tech', count: '4,198', icon: 'https://images.lumacdn.com/uploads/v7/3f6baafa-d90d-4013-9853-0fa10331f796.png' },
  { name: 'Food & Drink', slug: 'food', count: '579', icon: 'https://images.lumacdn.com/uploads/36/a77db635-cb3b-4720-9758-2bc9dae948e4.png' },
  { name: 'AI', slug: 'ai', count: '3,915', icon: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png' },
  { name: 'Running', slug: 'running', count: '636', icon: 'https://images.lumacdn.com/uploads/9f/9a31599b-38be-49c8-9c46-dfa19becb9ad.png' },
  { name: 'Arts & Culture', slug: 'arts', count: '3,620', icon: 'https://images.lumacdn.com/uploads/u8/5eeba5a4-d305-4bc1-9017-329937813f30.png' },
  { name: 'Climate', slug: 'climate', count: '1,029', icon: 'https://images.lumacdn.com/uploads/on/19946552-9254-41de-b105-d086a2e4ac68.png' },
  { name: 'Fitness', slug: 'fitness', count: '1,773', icon: 'https://images.lumacdn.com/uploads/7b/f3930d36-b2f2-4df3-8db6-798df9b0897f.png' },
  { name: 'Wellness', slug: 'wellness', count: '1,064', icon: 'https://images.lumacdn.com/uploads/y5/4f225f49-0c10-4bba-b1cb-77ae216268ac.png' },
  { name: 'Crypto', slug: 'crypto', count: '559', icon: 'https://images.lumacdn.com/uploads/yl/096bc517-f9fc-49fe-befd-401e29cc4662.png' },
];

// Exact Featured Calendars from Luma Inspection
const FEATURED_CALENDARS = [
  {
    name: 'Google DeepMind',
    slug: 'deepmind',
    avatar: 'https://images.lumacdn.com/calendars/ph/5ee73ff7-6554-47d8-8505-4306f1091baa.jpg',
    tint: '#4286f5',
    followers: '14,200',
    desc: 'Connect with the Google DeepMind Developer Experience Team. Hackathons, workshops, and AI showcases.',
  },
  {
    name: 'Reading Rhythms Global',
    slug: 'readingrhythms-global',
    avatar: 'https://images.lumacdn.com/calendars/ni/4f930fb4-2ff5-4e98-8f46-7107a8c6b7cb',
    tint: '#2f7ca9',
    followers: '22,400',
    desc: 'Not a book club. A reading party. Read with friends to live music & curated playlists!',
  },
  {
    name: 'Build Club',
    slug: 'buildercommunityanz',
    avatar: 'https://images.lumacdn.com/calendars/xv/cd043d3e-0ce7-490f-9970-f27a79399858',
    tint: '#146AEB',
    followers: '30,000',
    desc: 'The most collaborative AI community in the world (50+ Cities, 30K+ community).',
  },
  {
    name: 'South Park Commons',
    slug: 'southparkcommons-events',
    avatar: 'https://images.lumacdn.com/calendars/zd/801eab25-f945-44b2-8d32-29a455bd485d',
    tint: '#131517',
    followers: '18,900',
    desc: 'South Park Commons helps you get from -1 to 0. Real conversations with top founders and researchers.',
  },
  {
    name: 'Design Buddies',
    slug: 'design',
    avatar: 'https://images.lumacdn.com/calendars/pt/e584cc5b-7a57-4f13-ab7a-2abcb3a4c1a9',
    tint: '#87BDF9',
    followers: '35,000',
    desc: "Events for all creatives across SF/LA, online, and the world! Founded by Grace Ling.",
  },
  {
    name: 'SpaceXAI Community',
    slug: 'spacexai-community',
    avatar: 'https://images.lumacdn.com/uploads/zm/9c632192-f465-4db5-b8d2-effa261cbb27.png',
    tint: '#ff6519',
    followers: '16,700',
    desc: 'SpaceXAI frontier intelligence community meetups and research circles in 250+ cities.',
  },
  {
    name: 'Creative Coffee Club',
    slug: 'coffeeclubworldwide',
    avatar: 'https://images.lumacdn.com/calendars/i2/63802dd5-e4ec-41e5-8559-35f64795e652.png',
    tint: '#ED2B32',
    followers: '19,500',
    desc: 'Unique experiences for creatives and builders in NYC, SF, Toronto, London, Chicago, Austin, and Miami.',
  },
];

// Exact Places / Cities by Continent from Luma Inspection
const PLACES_BY_CONTINENT: Record<
  string,
  { name: string; slug: string; count: number; icon: string; tint: string }[]
> = {
  'North America': [
    { name: 'New York', slug: 'nyc', count: 95, icon: 'https://images.lumacdn.com/discovery/nyc-icon.png', tint: '#e08d55' },
    { name: 'San Francisco', slug: 'sf', count: 58, icon: 'https://images.lumacdn.com/discovery/sf-icon.png', tint: '#ff6519' },
    { name: 'Los Angeles', slug: 'la', count: 44, icon: 'https://images.lumacdn.com/discovery/la-icon.png', tint: '#538f21' },
    { name: 'Boston', slug: 'boston', count: 29, icon: 'https://images.lumacdn.com/discovery/boston-icon.png', tint: '#d77f30' },
    { name: 'Las Vegas', slug: 'las-vegas', count: 26, icon: 'https://images.lumacdn.com/discovery/vegas-icon.png', tint: '#e5ba47' },
    { name: 'Seattle', slug: 'seattle', count: 21, icon: 'https://images.lumacdn.com/discovery/seattle-icon.png', tint: '#9198e6' },
    { name: 'Philadelphia', slug: 'philadelphia', count: 21, icon: 'https://images.lumacdn.com/discovery/philly-icon.png', tint: '#e7963f' },
    { name: 'Miami', slug: 'miami', count: 20, icon: 'https://images.lumacdn.com/discovery/miami-icon.png', tint: '#408dae' },
    { name: 'Montréal', slug: 'montreal', count: 20, icon: 'https://images.lumacdn.com/discovery/montreal-icon.png', tint: '#387eb1' },
    { name: 'Washington, DC', slug: 'dc', count: 19, icon: 'https://images.lumacdn.com/discovery/dc-icon.png', tint: '#bbb0a6' },
    { name: 'Chicago', slug: 'chicago', count: 18, icon: 'https://images.lumacdn.com/discovery/chicago-icon.png', tint: '#e66c9f' },
    { name: 'Atlanta', slug: 'atlanta', count: 17, icon: 'https://images.lumacdn.com/discovery/atlanta-icon.png', tint: '#2f7ca9' },
    { name: 'Austin', slug: 'austin', count: 16, icon: 'https://images.lumacdn.com/discovery/austin-icon.png', tint: '#f5b938' },
    { name: 'Minneapolis', slug: 'minneapolis', count: 16, icon: 'https://images.lumacdn.com/discovery/minneapolis-icon.png', tint: '#ba365c' },
    { name: 'Dallas', slug: 'dallas', count: 15, icon: 'https://images.lumacdn.com/discovery/dallas-icon.png', tint: '#dbb58c' },
    { name: 'Toronto', slug: 'toronto', count: 14, icon: 'https://images.lumacdn.com/discovery/toronto-icon.png', tint: '#306ed1' },
    { name: 'Sacramento', slug: 'sacramento', count: 13, icon: 'https://images.lumacdn.com/discovery/sacramento-icon.png', tint: '#34d1a7' },
    { name: 'San Diego', slug: 'sd', count: 13, icon: 'https://images.lumacdn.com/discovery/sd-icon.png', tint: '#3ba4eb' },
    { name: 'Raleigh', slug: 'raleigh', count: 12, icon: 'https://images.lumacdn.com/discovery/raleigh-icon.png', tint: '#70bf2a' },
    { name: 'Salt Lake City', slug: 'salt-lake-city', count: 11, icon: 'https://images.lumacdn.com/discovery/slc-icon.png', tint: '#e2a533' },
    { name: 'Houston', slug: 'houston', count: 11, icon: 'https://images.lumacdn.com/discovery/houston-icon.png', tint: '#bc693b' },
    { name: 'Denver', slug: 'denver', count: 10, icon: 'https://images.lumacdn.com/discovery/denver-icon.png', tint: '#e98406' },
  ],
  'Europe': [
    { name: 'London', slug: 'london', count: 56, icon: 'https://images.lumacdn.com/discovery/london-icon.png', tint: '#e89800' },
    { name: 'Amsterdam', slug: 'amsterdam', count: 48, icon: 'https://images.lumacdn.com/discovery/ams-icon.png', tint: '#de475e' },
    { name: 'Paris', slug: 'paris', count: 23, icon: 'https://images.lumacdn.com/discovery/paris-icon.png', tint: '#ce8f5c' },
    { name: 'Lisbon', slug: 'lisbon', count: 19, icon: 'https://images.lumacdn.com/discovery/lisbon-icon.png', tint: '#df7440' },
    { name: 'Madrid', slug: 'madrid', count: 15, icon: 'https://images.lumacdn.com/discovery/madrid-icon.png', tint: '#c2bc4f' },
    { name: 'Dublin', slug: 'dublin', count: 12, icon: 'https://images.lumacdn.com/discovery/dublin-icon.png', tint: '#f5a55d' },
    { name: 'Berlin', slug: 'berlin', count: 24, icon: 'https://images.lumacdn.com/discovery/calgary-icon.png', tint: '#37b1b8' },
  ],
  'Asia & Pacific': [
    { name: 'Jakarta', slug: 'jakarta', count: 4, icon: 'https://images.lumacdn.com/discovery/dubai-icon.png', tint: '#2c022cff' },
    { name: 'Tokyo', slug: 'tokyo', count: 40, icon: 'https://images.lumacdn.com/discovery/tokyo-icon.png', tint: '#e69f93' },
    { name: 'Tel Aviv-Yafo', slug: 'tel-aviv', count: 22, icon: 'https://images.lumacdn.com/discovery/telaviv-icon.png', tint: '#f39050' },
    { name: 'Singapore', slug: 'singapore', count: 24, icon: 'https://images.lumacdn.com/discovery/miami-icon.png', tint: '#408dae' },
    { name: 'Dubai', slug: 'dubai', count: 14, icon: 'https://images.lumacdn.com/discovery/dubai-icon.png', tint: '#ab52ab' },
    { name: 'Seoul', slug: 'seoul', count: 11, icon: 'https://images.lumacdn.com/discovery/seoul-icon.png', tint: '#7fabeb' },
    { name: 'Osaka', slug: 'osaka', count: 7, icon: 'https://images.lumacdn.com/discovery/osaka-icon.png', tint: '#d072d4' },
  ],
  'South America': [
    { name: 'São Paulo', slug: 'saopaulo', count: 12, icon: 'https://images.lumacdn.com/discovery/sp-icon.png', tint: '#7f747a' },
    { name: 'Medellín', slug: 'medellin', count: 8, icon: 'https://images.lumacdn.com/discovery/medellin-icon.png', tint: '#4e98cf' },
    { name: 'Buenos Aires', slug: 'buenos-aires', count: 7, icon: 'https://images.lumacdn.com/discovery/ba-icon.png', tint: '#e57d6e' },
    { name: 'Bogotá', slug: 'bogota', count: 6, icon: 'https://images.lumacdn.com/discovery/bogota-icon.png', tint: '#d28a4f' },
  ],
  'Africa': [
    { name: 'Cape Town', slug: 'capetown', count: 14, icon: 'https://images.lumacdn.com/discovery/capetown-icon.png', tint: '#57c9c9' },
    { name: 'Lagos', slug: 'lagos', count: 13, icon: 'https://images.lumacdn.com/discovery/lagos-icon.png', tint: '#757366' },
    { name: 'Nairobi', slug: 'nairobi', count: 11, icon: 'https://images.lumacdn.com/discovery/nairobi-icon.png', tint: '#546d06' },
  ],
};

const DEFAULT_JAKARTA_EVENTS: EventItem[] = [
  {
    id: 'jakarta-1',
    slug: '247-x-pepro-run-jakarta',
    name: '247 X PÈPRO RUN: JAKARTA',
    description: 'Join the 247 Run Club in collaboration with PÈPRO for an energetic morning 5K & 10K community run through the heart of South Jakarta.',
    coverUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&auto=format&fit=crop&q=80',
    startAt: '2026-10-18T05:30:00.000Z',
    endAt: '2026-10-18T08:30:00.000Z',
    timezone: 'Asia/Jakarta',
    locationType: 'offline',
    address: 'Hustle Mahakam',
    city: 'Jakarta',
    category: 'Running',
    tintColor: '#2563eb',
    requireApproval: false,
    host: { id: 'h1', name: '247 Run Club' },
    tickets: [],
  },
  {
    id: 'jakarta-2',
    slug: 'radius-x-saladstop-goodness-in-motion',
    name: 'Radius x SaladStop! : GOODNESS IN MOTION',
    description: 'A celebration of mindful movement, community fitness, and clean nutrition.',
    coverUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
    startAt: '2026-10-18T05:30:00.000Z',
    endAt: '2026-10-18T09:00:00.000Z',
    timezone: 'Asia/Jakarta',
    locationType: 'offline',
    address: 'Senayan City Mall',
    city: 'Jakarta',
    category: 'Fitness',
    tintColor: '#16a34a',
    requireApproval: false,
    host: { id: 'h2', name: 'Radius' },
    tickets: [],
  },
  {
    id: 'jakarta-3',
    slug: 'indonesias-first-official-miniso-lisa-pop-up',
    name: "Indonesia’s First Official MINISO × LISA Pop-Up",
    description: 'Experience the grand pop-up debut of the exclusive MINISO × LISA collection.',
    coverUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    startAt: '2026-10-21T10:00:00.000Z',
    endAt: '2026-10-21T22:00:00.000Z',
    timezone: 'Asia/Jakarta',
    locationType: 'offline',
    address: 'Senayan City Mall',
    city: 'Jakarta',
    category: 'Arts & Culture',
    tintColor: '#ec4899',
    requireApproval: false,
    host: { id: 'h3', name: 'MINISO' },
    tickets: [],
  },
  {
    id: 'jakarta-4',
    slug: 'road-to-devfest-monthly-meetup-gdg-cloud-jakarta',
    name: 'Road to DevFest: Monthly Meetup October by GDG Cloud Jakarta',
    description: 'Get ready for DevFest 2026 with GDG Cloud Jakarta!',
    coverUrl: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png',
    startAt: '2026-10-22T18:30:00.000Z',
    endAt: '2026-10-22T21:30:00.000Z',
    timezone: 'Asia/Jakarta',
    locationType: 'offline',
    address: 'Senayan City Mall',
    city: 'Jakarta',
    category: 'Tech',
    tintColor: '#3b82f6',
    requireApproval: false,
    host: { id: 'h4', name: 'GDG Cloud Jakarta' },
    tickets: [],
  },
  {
    id: 'jakarta-5',
    slug: 'indonesia-temporal-user-group',
    name: 'Indonesia Temporal User Group',
    description: 'Connect with software engineers using Temporal for resilient execution.',
    coverUrl: 'https://images.lumacdn.com/uploads/v7/3f6baafa-d90d-4013-9853-0fa10331f796.png',
    startAt: '2026-11-10T18:00:00.000Z',
    endAt: '2026-11-10T21:00:00.000Z',
    timezone: 'Asia/Jakarta',
    locationType: 'offline',
    address: 'GoWork Menara Rajawali - Coworking and ...',
    city: 'Jakarta',
    category: 'Tech',
    tintColor: '#8b5cf6',
    requireApproval: false,
    host: { id: 'h5', name: 'Temporal Community' },
    tickets: [],
  },
];

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
  const [popularEvents, setPopularEvents] = useState<EventItem[]>(DEFAULT_JAKARTA_EVENTS);

  const toggleFollow = (slug: string) => {
    setFollowing((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // 1. Detect location on mount (Timezone immediate + Geolocation high-accuracy refinement)
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

  // 2. Fetch events matching selectedCity, fallback to all events if city has no events yet
  useEffect(() => {
    let isMounted = true;
    fetchEvents({ city: selectedCity })
      .then((data) => {
        if (isMounted) {
          if (data && data.length > 0) {
            setPopularEvents(data);
          } else {
            // If no events found for the detected city, fetch general events so page is full
            fetchEvents()
              .then((allData) => {
                if (isMounted && allData && allData.length > 0) {
                  setPopularEvents(allData);
                } else if (isMounted) {
                  setPopularEvents(DEFAULT_JAKARTA_EVENTS);
                }
              })
              .catch(() => {
                if (isMounted) setPopularEvents(DEFAULT_JAKARTA_EVENTS);
              });
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load events for', selectedCity, err);
        if (isMounted) setPopularEvents(DEFAULT_JAKARTA_EVENTS);
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
              {/* <div className="flex items-center gap-1.5">
                {['Jakarta', 'San Francisco', 'New York', 'London'].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCity(city)}
                    className={`text-xs px-2.5 py-0.5 rounded-full transition-all ${selectedCity === city
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-white/40 hover:text-white/70 bg-white/[0.03]'
                      }`}
                  >
                    {city}
                  </button>
                ))}
              </div> */}
            </div>
          </div>

          <Link
            href={`/?city=${encodeURIComponent(selectedCity)}`}
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

        {/* 12 Category Grid matching Luma exact cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/?category=${encodeURIComponent(cat.name)}`}
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
          {FEATURED_CALENDARS.map((cal) => (
            <Card
              key={cal.slug}
              className="p-5 flex flex-col justify-between space-y-4 group hover:border-white/20 transition-all bg-[#161b22]/70 backdrop-blur-md"
            >
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={cal.slug === 'deepmind' ? '/calendar/deepmind' : `/?calendarSlug=${cal.slug}`}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div
                    className="w-12 h-12 rounded-xl overflow-hidden ring-1 ring-white/10 flex-shrink-0 bg-white/[0.05]"
                    style={{ borderTop: `2px solid ${cal.tint || '#3b82f6'}` }}
                  >
                    <img
                      src={cal.avatar}
                      alt={cal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {cal.name}
                    </h3>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      {cal.followers} followers
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
                {cal.desc}
              </p>

              <Link
                href={cal.slug === 'deepmind' ? '/calendar/deepmind' : `/?calendarSlug=${cal.slug}`}
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight text-white">Explore Local Events</h2>
          </div>
        </div>

        {/* Shadcn Tabs by Continent */}
        <Tabs defaultValue="North America" className="w-full space-y-6">
          <TabsList className="bg-white/[0.04] p-1 border border-white/[0.08] overflow-x-auto max-w-full justify-start h-auto">
            {Object.keys(PLACES_BY_CONTINENT).map((continent) => (
              <TabsTrigger
                key={continent}
                value={continent}
                className="px-4 py-2 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-black"
              >
                {continent}
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(PLACES_BY_CONTINENT).map(([continent, places]) => (
            <TabsContent key={continent} value={continent} className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-3">
                {places.map((place) => (
                  <Link
                    key={place.slug}
                    href={`/?city=${encodeURIComponent(place.name)}`}
                    className="luma-card p-3 flex items-center gap-3 group hover:border-white/20 hover:bg-white/[0.04] transition-all"
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
                      <div className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                        {place.name}
                      </div>
                      <div className="text-[11px] text-white/40 mt-0.5">
                        {place.count} Events
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
