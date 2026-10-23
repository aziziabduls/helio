'use client';

import EventCard from '@/components/EventCard';
import GradientWaves from '@/components/GradientWaves';
import Grainient from '@/components/Grainient';
import LightRays from '@/components/LightRays';
import SpecularButton from '@/components/SpecularButton';
import { useAuth } from '@/context/AuthContext';
import { EventItem, fetchEvents } from '@/lib/api';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Compass, Plus, Sparkles, Ticket, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const WORDS = [
  {
    text: 'Delightful',
    className: "font-['Playfair_Display',serif] italic font-normal tracking-tighter text-pink-300 dark:text-pink-200",
  },
  {
    text: 'Vivid',
    className: "font-['Space_Grotesk',sans-serif] font-bold tracking-tighter bg-gradient-to-r from-violet-400 via-fuchsia-400 to-amber-300 bg-clip-text text-transparent",
  },
  {
    text: 'Stellar',
    className: "font-['JetBrains_Mono',monospace] font-semibold tracking-tighter text-blue-400 dark:text-blue-300",
  },
  {
    text: 'Lovely',
    className: "font-['Cinzel',serif] uppercase font-bold tracking-tighter text-emerald-300 dark:text-emerald-200 text-[0.88em]",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
  const [wordIndex, setWordIndex] = useState(0);
  const [heroEffect, setHeroEffect] = useState<'grainient' | 'lightrays' | 'waves'>('waves');
  // const [heroEffect, setHeroEffect] = useState<'grainient' | 'lightrays' | 'waves'>('grainient');
  // const [heroEffect, setHeroEffect] = useState<'grainient' | 'lightrays' | 'waves'>('lightrays');
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const handleCreateClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal();
    }
  };

  const handleHeroCreate = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      openAuthModal();
    } else {
      router.push('/create');
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
    <div className="relative overflow-hidden min-h-screen -mt-11">
      {/* Hero Backdrop (Switchable between Grainient, LightRays, and GradientWaves) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 w-full h-[100dvh] overflow-hidden z-0 opacity-50 [mask-image:radial-gradient(ellipse_100%_80%_at_50%_40%,#000_30%,transparent_100%)]">
        {heroEffect === 'grainient' ? (
          <Grainient
            colors={['#0b0e14', '#180d2b', '#3b1261', '#6d28d9', '#a855f7', '#e9d5ff']}
            angle={55}
            flow={0.8}
            silk={0.35}
            grainAmount={0.08}
          />
        ) : heroEffect === 'lightrays' ? (
          <LightRays
            raysOrigin="top-center"
            raysColor="#7c3aed"
            raysSpeed={1}
            lightSpread={0.4}
            rayLength={3}
            glow={0.65}
            haze={0.25}
            followMouse
            mouseInfluence={0.1}
            saturation={0.85}
          />
        ) : (
          <GradientWaves
            horizonColor="#8b5cf6"
            waveColor="#e879f9"
            crestColor="#f5d0fe"
            speed={0.4}
            amplitude={2.5}
            relief={1}
            lightAngle={120}
            mouseInteraction
            swellOnClick
          />
        )}
      </div>

      {/* Hero Section */}
      <section className="relative z-10 w-full min-h-screen max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-12 sm:pb-16 text-center flex flex-col items-center justify-center">
        {/* Hero Title */}
        <div className="flex items-center justify-start flex-shrink-0 mb-7 sm:mb-10">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-0 font-sans">
              <span>helio</span>
              <span className="text-blue-500 text-sm transform -translate-y-1">✦</span>
            </span>
          </Link>
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tighter text-slate-900 dark:text-white leading-tight flex flex-col items-center justify-center gap-1 sm:gap-2">
          <span className="relative h-[1.18em] overflow-hidden flex items-center justify-center mb-[-20px] z-10">
            <AnimatePresence mode="wait">
              <motion.span
                key={WORDS[wordIndex].text}
                initial={{ opacity: 0, y: 32, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -32, filter: 'blur(6px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className={`inline-block px-1 ${WORDS[wordIndex].className}`}
              >
                {WORDS[wordIndex].text}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="text-slate-900 dark:text-white pb-[-10px] mb-[-17px] sm:mb-[-10px] z-5">events</span>
          <span className="luma-gradient-text pb-1 z-1">start here</span>
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
          <SpecularButton
            size="lg"
            radius={18}
            tint="#18181b"
            tintOpacity={1}
            textColor="#fafafa"
            lineColor="#ffffff"
            baseColor="#3f3f46"
            intensity={1}
            idleIntensity={0.35}
            shineSize={10}
            shineFade={34}
            thickness={1.2}
            glow={1}
            followMouse
            proximity={250}
            onClick={handleHeroCreate}
          >
            Create Your First Event
          </SpecularButton>

          <Link
            href="/discover"
            className="inline-flex items-center gap-1.5 px-5 py-3 text-sm sm:text-base font-semibold text-slate-600 hover:text-slate-900 dark:text-white/80 dark:hover:text-white transition-colors group"
          >
            <span>Discover Events</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          {/* Hero Backdrop Switcher Pill */}
          {/* <div className="mt-2 flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] backdrop-blur-md text-[11px] text-white/50">
            <span className="px-2 text-[10px] uppercase tracking-wider text-white/30 font-medium select-none">
              Hero Vibe:
            </span>
            <button
              type="button"
              onClick={() => setHeroEffect('grainient')}
              className={`px-3 py-1 rounded-full transition-all ${
                heroEffect === 'grainient'
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'hover:text-white'
              }`}
            >
              Grainient
            </button>
            <button
              type="button"
              onClick={() => setHeroEffect('lightrays')}
              className={`px-3 py-1 rounded-full transition-all ${
                heroEffect === 'lightrays'
                  ? 'bg-white/15 text-white font-medium shadow-sm'
                  : 'hover:text-white'
              }`}
            >
              Light Rays
            </button>
          </div> */}
        </div>
      </section>

      {/* Featured / Live Upcoming Events Preview */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 dark:border-white/[0.08]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {/* <Calendar className="w-5 h-5 text-blue-500 dark:text-blue-400" /> */}
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
            <span className='hidden sm:block'>View all</span>
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
