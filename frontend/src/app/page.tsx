'use client';

import EventCard from '@/components/EventCard';
import { useAuth } from '@/context/AuthContext';
import { EventItem, fetchEvents } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Calendar, Compass, Plus, Sparkles, Ticket, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const WORDS = ['Delightful', 'Vivid', 'Stellar', 'Lovely'];

export default function LandingPage() {
  const { user, openAuthModal } = useAuth();
  const [wordIndex, setWordIndex] = useState(0);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCreateClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal();
    }
  };

  // Cycling headline word like luma.com
  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  // Fetch top upcoming events for live preview
  useEffect(() => {
    let active = true;
    fetchEvents({ timeframe: 'upcoming' })
      .then((data) => {
        if (active) {
          setEvents(data.slice(0, 4));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load landing preview events:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Ambient background glow (adapts opacity across light/dark) */}
      <div
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[550px] opacity-15 dark:opacity-25 blur-[120px] rounded-full transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(circle, rgba(171,70,221,0.4) 0%, rgba(243,26,124,0.3) 35%, rgba(248,113,43,0.2) 65%, transparent 80%)',
        }}
      />

      {/* Hero Section */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center flex flex-col items-center">
        {/* Hero Title */}
        <div className="flex items-center justify-start flex-shrink-0 mb-0 sm:mb-10">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-0 font-sans">
              <span>helio</span>
              <span className="text-blue-500 text-sm transform -translate-y-1">✦</span>
            </span>
          </Link>
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight flex flex-col items-center justify-center gap-1 sm:gap-2">
          <span className="relative h-[1.18em] overflow-hidden flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={WORDS[wordIndex]}
                initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -32, filter: 'blur(6px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block text-slate-900 dark:text-white"
              >
                {WORDS[wordIndex]}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="text-slate-900 dark:text-white">events</span>
          <span className="luma-gradient-text pb-1">start here</span>
        </h1>

        {/* Hero Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-white/60 max-w-xl leading-relaxed">
          From{' '}
          <Link
            href="/events?category=Running"
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 underline decoration-emerald-500/30 dark:decoration-emerald-500/40 decoration-wavy underline-offset-4"
          >
            run clubs
          </Link>{' '}
          to{' '}
          <Link
            href="/events?category=Tech"
            className="text-pink-600 dark:text-pink-400 hover:text-pink-500 dark:hover:text-pink-300 underline decoration-pink-500/30 dark:decoration-pink-500/40 decoration-wavy underline-offset-4"
          >
            launch parties
          </Link>{' '}
          and{' '}
          <Link
            href="/events?category=AI"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 underline decoration-blue-500/30 dark:decoration-blue-500/40 decoration-wavy underline-offset-4"
          >
            hackathons
          </Link>
          , Helio makes every event feel effortless.
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <Link
            href="/create"
            onClick={handleCreateClick}
            className="luma-btn luma-btn-primary px-6 py-3 text-sm sm:text-base font-semibold shadow-lg shadow-black/5 dark:shadow-white/5 hover:scale-[1.02] transition-transform"
          >
            Create Your First Event
          </Link>

          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 px-5 py-3 text-sm sm:text-base font-semibold text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white transition-colors group"
          >
            <span>Discover Events</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Featured / Live Upcoming Events Preview */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 border-t border-black/[0.08] dark:border-white/[0.08]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              <span>Happening Soon</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-white/50 mt-0.5">
              Explore the latest gatherings in tech, design, and culture
            </p>
          </div>

          <Link
            href="/events"
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400 dark:text-white/40 mt-3">Loading upcoming events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-black/[0.1] dark:border-white/[0.1] rounded-2xl p-6">
            <p className="text-sm text-slate-600 dark:text-white/60">No upcoming events right now.</p>
            <Link
              href="/create"
              onClick={handleCreateClick}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              Host the very first one
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </section>

      {/* Value Pillars / Feature Grid */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 border-t border-black/[0.08] dark:border-white/[0.08]">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Designed for unforgettable gatherings
          </h2>
          <p className="text-sm text-slate-500 dark:text-white/50 mt-2 max-w-lg mx-auto">
            Everything you need to invite friends, manage registrations, and foster vibrant communities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="luma-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">Delightful Pages</h3>
              <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">
                Stunning invites with custom themes, portrait posters, and responsive typography that look exquisite on any screen.
              </p>
            </div>
          </div>

          <div className="luma-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4">
                <Ticket className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">Seamless RSVPs</h3>
              <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">
                One-click registration, guest approvals, automated calendar invites, and instant ticket confirmations.
              </p>
            </div>
          </div>

          <div className="luma-card p-6 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1.5">Community Centric</h3>
              <p className="text-xs text-slate-600 dark:text-white/60 leading-relaxed">
                Curated city calendars, subscriber notifications, and discovery tools to grow and engage your audience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner (Luma signature) */}
      <section className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
        <div className="flex flex-col items-center justify-center gap-6">
          <h2 className="luma-gradient-text text-3xl sm:text-5xl font-bold tracking-tight max-w-2xl leading-tight">
            Your next unforgettable memory awaits.
          </h2>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <Link
              href="/discover"
              className="luma-btn px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold border border-black/[0.12] dark:border-white/20 text-slate-700 dark:text-white hover:border-black/[0.25] dark:hover:border-white/40 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all"
            >
              <Compass className="w-4 h-4 mr-1.5" />
              Discover Events
            </Link>

            <Link
              href="/create"
              onClick={handleCreateClick}
              className="luma-btn luma-btn-primary px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Host an Event
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
