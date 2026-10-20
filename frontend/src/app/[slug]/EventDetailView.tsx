'use client';

import RsvpModal from '@/components/RsvpModal';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/context/AuthContext';
import { EventItem, Ticket } from '@/lib/api';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Globe,
  Instagram,
  Lock,
  MailIcon,
  MapPin,
  Maximize2,
  Minus,
  Pencil,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface EventDetailViewProps {
  initialEvent: EventItem;
}

function getPalette(hex?: string | null) {
  if (!hex || !hex.startsWith('#')) {
    return {
      pageBg: '#0e1626',
      cardBg: '#162238',
      squircleBg: '#142034',
      cardBorder: 'rgba(56, 110, 200, 0.25)',
      footerBorder: '#1c2d4a',
    };
  }
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map((x) => x + x).join('');
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h = 0,
    s = 0,
    l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  const deg = Math.round(h * 360);
  const sat = Math.round(s * 45);
  return {
    pageBg: `hsl(${deg}, ${sat}%, 11%)`,
    cardBg: `hsl(${deg}, ${sat}%, 15%)`,
    squircleBg: `hsl(${deg}, ${sat}%, 13%)`,
    cardBorder: `hsla(${deg}, ${sat}%, 30%, 0.3)`,
    footerBorder: `hsla(${deg}, ${sat}%, 22%, 0.4)`,
  };
}

function formatEventDate(startAt: string, endAt?: string) {
  try {
    const d = new Date(startAt);
    if (isNaN(d.getTime())) {
      return {
        month: 'OCT',
        day: '18',
        fullDate: 'Sunday, October 18',
        timeRange: '5:30 AM - 9:30 AM',
      };
    }
    const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = d.getDate();
    const fullDate = d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
    const startTime = d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    let endTime = '';
    if (endAt) {
      const end = new Date(endAt);
      if (!isNaN(end.getTime())) {
        endTime = end.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        });
      }
    }
    return {
      month,
      day,
      fullDate,
      timeRange: endTime ? `${startTime} - ${endTime}` : startTime,
    };
  } catch {
    return {
      month: 'OCT',
      day: '18',
      fullDate: 'Sunday, October 18',
      timeRange: '5:30 AM - 9:30 AM',
    };
  }
}

export default function EventDetailView({ initialEvent }: EventDetailViewProps) {
  const router = useRouter();
  const [event] = useState<EventItem>(initialEvent);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);

  // Exact SaladStop x Radius detection
  const isSaladStop =
    event.slug.includes('saladstop') ||
    event.slug === 'fzxb1tj6' ||
    event.name.toLowerCase().includes('saladstop');

  // Exact Matte Deep Forest Green from screenshot (#152614) or dynamic prominent palette
  const defaultPalette = isSaladStop
    ? {
      pageBg: '#152614',
      cardBg: '#1c331c',
      squircleBg: '#1a301a',
      cardBorder: 'rgba(74, 114, 71, 0.25)',
      footerBorder: '#233b21',
    }
    : getPalette(event.tintColor);

  const { pageBg, cardBg, squircleBg, cardBorder, footerBorder } = defaultPalette;

  // Sync navbar and body background seamlessly with event's custom pageBg
  useEffect(() => {
    document.documentElement.style.setProperty('--event-page-bg', pageBg);
    const prevBodyBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = pageBg;

    // Enforce dark mode on event detail view (including navbar & footer)
    const wasDark = document.documentElement.classList.contains('dark');
    document.documentElement.classList.add('dark', 'event-detail-active');
    document.documentElement.classList.remove('light');

    return () => {
      document.documentElement.style.removeProperty('--event-page-bg');
      document.body.style.backgroundColor = prevBodyBg;
      document.documentElement.classList.remove('event-detail-active');
      if (!wasDark) {
        const savedTheme = localStorage.getItem('theme');
        const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const shouldBeDark = savedTheme === 'dark' || (savedTheme === 'system' && isSystemDark);
        if (!shouldBeDark) {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
        }
      }
    };
  }, [pageBg]);

  // Available tickets from event data (with realistic defaults if empty)
  const availableTickets: Ticket[] =
    event.tickets && event.tickets.length > 0
      ? event.tickets
      : [
        {
          id: 'default-ticket',
          name: 'General Admission',
          description: 'Standard event RSVP pass',
          type: 'free',
          price: 0,
          currency: 'IDR',
          capacity: 100,
          requireApproval: event.requireApproval,
        },
      ];

  const now = new Date();
  const startDate = new Date(event.startAt);
  const endDate = new Date(event.endAt);
  const isOngoing = now >= startDate && now <= endDate;
  const isPast = now > endDate;

  function getTicketSaleStatus(ticket: Ticket) {
    if (isPast) {
      return {
        status: 'ended' as const,
        badgeText: 'Event Ended',
        badgeClass: 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
        canPurchase: false,
      };
    }

    const saleStart = ticket.saleStartAt ? new Date(ticket.saleStartAt) : null;
    const saleEnd = ticket.saleEndAt ? new Date(ticket.saleEndAt) : null;

    if (saleStart && !isNaN(saleStart.getTime()) && now < saleStart) {
      const formatted = saleStart.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
      return {
        status: 'upcoming' as const,
        badgeText: `Sale opens ${formatted}`,
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        canPurchase: false,
      };
    }

    if (saleEnd && !isNaN(saleEnd.getTime()) && now > saleEnd) {
      return {
        status: 'ended' as const,
        badgeText: 'Sale Ended',
        badgeClass: 'bg-red-500/20 text-red-300 border-red-500/30',
        canPurchase: false,
      };
    }

    if (saleEnd && !isNaN(saleEnd.getTime())) {
      const formatted = saleEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return {
        status: 'presale' as const,
        badgeText: `Presale ends ${formatted}`,
        badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        canPurchase: true,
      };
    }

    return {
      status: 'open' as const,
      badgeText: null,
      badgeClass: '',
      canPurchase: true,
    };
  }

  // Find first purchasable ticket, or fallback to first available
  const initialTicket =
    availableTickets.find((t) => getTicketSaleStatus(t).canPurchase) ||
    availableTickets[0];

  const [selectedTicketId, setSelectedTicketId] = useState<string>(
    initialTicket?.id || ''
  );

  const selectedTicket =
    availableTickets.find((t) => t.id === selectedTicketId) || availableTickets[0];

  const selectedTicketSaleStatus = selectedTicket
    ? getTicketSaleStatus(selectedTicket)
    : { status: 'open', badgeText: null, badgeClass: '', canPurchase: true };

  // Merchandise selection state
  const [selectedMerchQuantities, setSelectedMerchQuantities] = useState<Record<string, number>>({});

  const handleUpdateMerchQuantity = (merchId: string, delta: number, maxStock?: number | null) => {
    setSelectedMerchQuantities((prev) => {
      const current = prev[merchId] || 0;
      const next = Math.max(0, current + delta);
      if (maxStock !== undefined && maxStock !== null && maxStock > 0 && next > maxStock) {
        toast.info(`Only ${maxStock} in stock for this item`);
        return prev;
      }
      if (next === 0) {
        const copy = { ...prev };
        delete copy[merchId];
        return copy;
      }
      return { ...prev, [merchId]: next };
    });
  };

  const selectedMerchList = (event.merchandises || [])
    .filter((m) => Boolean(m.id && (selectedMerchQuantities[m.id] || 0) > 0))
    .map((m) => ({
      id: m.id,
      name: m.name,
      quantity: selectedMerchQuantities[m.id] || 0,
      price: m.price,
      currency: m.currency || selectedTicket?.currency || 'IDR',
      imageUrl: m.imageUrl,
    }));

  const totalMerchCost = selectedMerchList.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const ticketCost = selectedTicket?.price || 0;
  const totalCost = ticketCost + totalMerchCost;
  const currencyDisplay = selectedTicket?.currency || event.merchandises?.[0]?.currency || 'IDR';

  const dateInfo = formatEventDate(event.startAt, event.endAt);
  const locationQuery = encodeURIComponent(
    isSaladStop
      ? 'Senayan City Mall, Jakarta'
      : `${event.address || ''} ${event.city || ''}`.trim()
  );
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;

  const attendeeCount = event._count?.registrations ?? event.registrations?.length ?? 0;
  const realRegistrations = event.registrations || [];

  const { user } = useAuth();
  const isOwner = Boolean(
    user && (
      (event.host?.id && user.id === event.host.id) ||
      (event.host?.email && user.email?.toLowerCase() === event.host.email.toLowerCase()) ||
      (user.username && event.host?.username === user.username)
    )
  );

  const canEdit = isOwner && !isOngoing;

  const fontClass =
    event.font === 'serif'
      ? 'font-style-serif'
      : event.font === 'mono'
        ? 'font-style-mono'
        : event.font === 'grotesk'
          ? 'font-style-grotesk'
          : 'font-style-sans';

  const cityName = event.city || 'Jakarta';

  const handleReportEvent = () => {
    toast.success('Thank you for reporting. Our safety team will review this event.');
  };

  return (
    <div
      className={`dark event-detail-view min-h-screen text-white antialiased selection:bg-white/20 ${fontClass}`}
      style={{ backgroundColor: pageBg }}
    >
      {/* Main Container - fully responsive mobile and desktop */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-20">
        {/* Host Banner with Manage and Edit Buttons */}
        {/* {isOwner && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/15 shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center gap-2.5 text-xs text-white/90">
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isOngoing
                  ? 'bg-rose-500 animate-ping'
                  : isPast
                    ? 'bg-zinc-500'
                    : 'bg-emerald-400 animate-pulse'
                  } shadow-sm`}
              />
              <div>
                <span className="font-bold text-white">
                  {isOngoing
                    ? 'Event is Currently Ongoing'
                    : isPast
                      ? 'Event has Concluded'
                      : 'You are hosting this event'}
                </span>
                <span className="text-white/50 hidden sm:inline">
                  {isOngoing
                    ? ' · In-progress now (Editing is locked)'
                    : isPast
                      ? ' · Past gathering'
                      : ' · Track guests, manage approvals, or edit details before start'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && (
                <Link
                  href={`/create?edit=${event.slug}`}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 border border-white/20 active:scale-95 shadow-sm"
                  title="Edit event details (name, date, location, tickets, cover)"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-400" />
                  <span>Edit Event</span>
                </Link>
              )}
              <Link
                href={`/manage/${event.slug}`}
                className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs hover:bg-white/90 transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Manage Event</span>
              </Link>
            </div>
          </div>
        )} */}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* ================= LEFT COLUMN ================= */}
          <div className="md:col-span-5 space-y-6">
            {/* Square Poster with rounded-2xl corners matching screenshot */}
            <div className="w-full rounded-2xl aspect-[3/4] overflow-hidden border border-white/10 shadow-2xl relative bg-black/40">
              <img
                src={
                  event.coverUrl ||
                  'https://images.lumacdn.com/uploads/34/701c30c6-affc-40bf-b327-ccb06f9d11af.jpg'
                }
                alt={event.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Hosted By Section */}
            <div className="space-y-3 pt-1">
              <h3 className="text-xs font-semibold text-white/50">Hosted By</h3>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between group">
                  <Link
                    href={`/profile/${event.host?.username || event.host?.id || ''}`}
                    className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/15 bg-white/10 flex items-center justify-center text-xs">
                      {event.host?.avatarUrl ? (
                        <img
                          src={event.host.avatarUrl}
                          alt={event.host.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{(event.host?.name || 'H').charAt(0)}</span>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-white/95 group-hover:text-blue-400 transition-colors">
                      {event.host?.name || 'Community Host'}
                    </span>
                  </Link>

                  {event.host?.instagramHandle && (
                    <a
                      href={`https://instagram.com/${event.host.instagramHandle}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white/40 hover:text-white transition-colors p-1"
                      title={`Instagram @${event.host.name}`}
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {event.calendar && event.calendar.name !== event.host?.name && (
                  <div className="flex items-center justify-between group">
                    <Link
                      href={`/calendar/${event.calendar.slug}`}
                      className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/15 bg-white/10 flex items-center justify-center text-xs">
                        {event.calendar.avatarUrl ? (
                          <img
                            src={event.calendar.avatarUrl}
                            alt={event.calendar.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{event.calendar.name.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-white/95 group-hover:text-blue-400 transition-colors">
                        {event.calendar.name}
                      </span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Going Attendees Section */}
            <div className="pt-4 border-t border-white/[0.08] space-y-2">
              <h3 className="text-xs font-semibold text-white/50">
                {attendeeCount} Going
              </h3>
              {attendeeCount > 0 ? (
                <>
                  <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
                    {realRegistrations.slice(0, 6).map((reg, i) => {
                      const avatar = reg.user?.avatarUrl;
                      const initial = (reg.name || 'G').charAt(0).toUpperCase();
                      return avatar ? (
                        <img
                          key={reg.id || i}
                          src={avatar}
                          alt={reg.name}
                          title={reg.name}
                          className="inline-block w-6 h-6 rounded-full ring-2 ring-black/40 object-cover"
                        />
                      ) : (
                        <div
                          key={reg.id || i}
                          title={reg.name}
                          className="inline-flex items-center justify-center w-6 h-6 rounded-full ring-2 ring-black/40 bg-white/20 text-[10px] font-semibold text-white uppercase"
                        >
                          {initial}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-white/60">
                    {(() => {
                      if (attendeeCount === 1) {
                        return `${realRegistrations[0]?.name || '1 guest'} is going`;
                      }
                      if (attendeeCount === 2) {
                        const first = realRegistrations[0]?.name || 'Guest';
                        const second = realRegistrations[1]?.name || '1 other';
                        return `${first} and ${second} are going`;
                      }
                      const first = realRegistrations[0]?.name || 'Guest';
                      const second = realRegistrations[1]?.name || 'Guest';
                      const others = attendeeCount - 2;
                      return `${first}, ${second} and ${others} other${others > 1 ? 's' : ''}`;
                    })()}
                  </p>
                </>
              ) : (
                <p className="text-xs text-white/40">
                  Be the first to register for this event!
                </p>
              )}
            </div>

            {/* Contact Host & Report Links */}
            {/* <div className="space-y-1.5 text-xs text-white/50">
              {isOwner && (
                <div className="space-y-1 pb-1">
                  {canEdit && (
                    <Link
                      href={`/create?edit=${event.slug}`}
                      className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>Edit Event Details</span>
                    </Link>
                  )}
                  <Link
                    href={`/manage/${event.slug}`}
                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Manage Event Dashboard</span>
                  </Link>
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => setIsRsvpOpen(true)}
                  className="hover:text-white transition-colors"
                >
                  Contact the Host
                </button>
              </div>
              <div>
                <button
                  type="button"
                  onClick={handleReportEvent}
                  className="hover:text-white transition-colors"
                >
                  Report Event
                </button>
              </div>
            </div> */}

            {/* Category Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {(() => {
                const cats = Array.isArray(event.category)
                  ? event.category
                  : typeof event.category === 'string'
                    ? event.category.split(',').map((c) => c.trim()).filter(Boolean)
                    : [];
                return cats.map((cat, idx) => {
                  const tag = cat.startsWith('#') ? cat : `#${cat}`;
                  return (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/10 text-white/70"
                    >
                      {tag}
                    </span>
                  );
                });
              })()}
              {/* <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/10 text-white/70">
                #{isSaladStop ? 'Running' : cityName}
              </span> */}
            </div>
          </div>

          {/* ================= RIGHT COLUMN (FULLY DYNAMIC BASED ON EVENT) ================= */}
          <div className="md:col-span-7 space-y-6">
            {/* Featured in City Pill */}
            {/* row */}
            <div className='flex flex-row gap-2'>
              <Link
                href={`/?city=${encodeURIComponent(cityName)}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-semibold text-white/90 transition-colors"
              >
                <span className="text-amber-400">🗺️</span>
                <span>
                  Featured in <strong className="text-white">{cityName}</strong>
                </span>
                {/* <span className="text-white/40 text-[10px] ml-0.5">›</span> */}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {isOwner && (
                <div className="flex items-center gap-2 pt-0">
                  {canEdit ? (
                    <Link
                      href={`/create?edit=${event.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-semibold text-white/90 transition-colors"
                    >
                      <span>
                        Edit Event
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <div className="relative group/editlock inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.08] border border-white/[0.1] text-xs font-semibold text-white/50 transition-colors cursor-not-allowed">
                      <span>
                        {isOngoing ? 'Edit Event' : 'Event Concluded'}
                      </span>
                      <Lock className="w-3.5 h-3.5" />
                      <div
                        role="tooltip"
                        className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-[#161b22] border border-white/[0.1] px-2.5 py-1 text-[11px] font-medium text-white/90 shadow-xl opacity-0 translate-y-1 group-hover/editlock:opacity-100 group-hover/editlock:translate-y-0 transition-all duration-150 z-30"
                      >
                        <span className="font-semibold text-white">This event is</span>{' '}
                        {isOngoing ? "ongoing, you can't edit it anymore." : "concluded, you can't edit it anymore."}
                        <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 -mt-1 rotate-45 bg-[#161b22] border-r border-b border-white/[0.1]" />
                      </div>
                    </div>

                  )}
                  <Link
                    href={`/manage/${event.slug}`}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-xs font-semibold text-white/90 transition-colors"
                  >
                    <span>Manage Event</span>
                    {/* <span className="text-white/40 text-[10px] ml-0.5">›</span> */}
                    <ArrowRight className="w-3.5 h-3.5" />

                  </Link>
                </div>
              )}
            </div>

            {/* Event Title (Supports multi-line breaking on colons like screenshot) */}
            <div>
              {event.name.includes(':') ? (
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {event.name.split(':')[0]}:
                  <br />
                  <span className="text-white/95">
                    {event.name.split(':').slice(1).join(':').trim()}
                  </span>
                </h1>
              ) : (
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight whitespace-pre-line">
                  {event.name}
                </h1>
              )}
            </div>

            {/* Date and Time Row */}
            <div className="flex items-center gap-3.5">
              {/* Calendar Squircle */}
              <div
                className="w-11 h-11 rounded-xl flex flex-col items-center justify-center text-center flex-shrink-0 border border-white/10 shadow-sm"
                style={{ backgroundColor: squircleBg }}
              >
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-white/50 leading-none">
                  {dateInfo.month}
                </span>
                <span className="text-sm font-extrabold text-white leading-none mt-1">
                  {dateInfo.day}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-white">{dateInfo.fullDate}</div>
                <div className="text-xs text-white/60 mt-0.5">{dateInfo.timeRange}</div>
              </div>
            </div>

            {/* Location Row */}
            <div className="flex items-center gap-3.5">
              {/* Pin Squircle */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10 shadow-sm hover:border-white/30 transition-colors"
                style={{ backgroundColor: squircleBg }}
                title="View on Google Maps"
              >
                {event.locationType === 'online' ? (
                  <Globe className="w-5 h-5 text-white/80" />
                ) : (
                  <MapPin className="w-5 h-5 text-white/80" />
                )}
              </a>
              <div>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-white hover:underline inline-flex items-center gap-1 group"
                >
                  <span>
                    {event.locationType === 'online'
                      ? 'Virtual Gathering'
                      : event.address?.split(',')[0] || event.city || 'Event Venue'}
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-white/60 group-hover:text-white transition-colors" />
                </a>
                <div className="text-xs text-white/60 mt-0.5">
                  {event.locationType === 'online'
                    ? 'Online Stream · Link provided after registration'
                    : event.city
                      ? `${event.address ? `${event.address}, ` : ''}${event.city}, ${event.region || 'Indonesia'}`
                      : event.address || 'Location provided upon registration'}
                </div>
              </div>
            </div>

            {/* ================= REGISTRATION CARD WITH DYNAMIC TICKET SELECTION ================= */}
            <div
              className="rounded-2xl border overflow-hidden shadow-2xl transition-all"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
              }}
            >
              {/* Registration Header */}
              <div className="px-5 pt-4 pb-2 text-xs font-semibold text-white/50 flex items-center justify-between">
                <span>Registration & Tickets</span>
                <span className="text-[11px] text-white/40">
                  {availableTickets.length} ticket tier{availableTickets.length > 1 ? 's' : ''}
                </span>
              </div>

              {/* Selection Tickets (With Presale Status & Spots Remaining) */}
              <div className="px-5 py-2 space-y-2.5">
                {availableTickets.map((ticket) => {
                  const isSelected = ticket.id === selectedTicketId;
                  const isFree = ticket.price === 0 || ticket.type === 'free';
                  const saleStatus = getTicketSaleStatus(ticket);
                  const remaining = ticket.capacity
                    ? Math.max(1, ticket.capacity - (event._count?.registrations || 0))
                    : isSaladStop && ticket.type === 'vip'
                      ? 3
                      : null;

                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => {
                        if (!saleStatus.canPurchase) {
                          toast.info(saleStatus.badgeText || 'This ticket is not currently on sale');
                          return;
                        }
                        setSelectedTicketId(ticket.id);
                      }}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-3 ${!saleStatus.canPurchase
                        ? 'opacity-60 border-white/[0.05] bg-black/40 cursor-not-allowed'
                        : isSelected
                          ? 'border-white/50 bg-white/[0.1] shadow-md ring-1 ring-white/20'
                          : 'border-white/[0.08] bg-black/20 hover:border-white/20 hover:bg-white/[0.04]'
                        }`}
                    >
                      {/* Radio Indicator & Details */}
                      <div className="flex items-start gap-3 min-w-0">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${isSelected && saleStatus.canPurchase
                            ? 'border-white bg-white text-black'
                            : 'border-white/30 bg-transparent'
                            }`}
                        >
                          {isSelected && saleStatus.canPurchase && (
                            <div className="w-1.5 h-1.5 rounded-full bg-black" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-white truncate">
                              {ticket.name}
                            </span>

                            {/* Presale / Sale Date Status Badge */}
                            {saleStatus.badgeText && (
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${saleStatus.badgeClass}`}
                              >
                                {saleStatus.badgeText}
                              </span>
                            )}
                          </div>

                          {ticket.description && (
                            <div className="text-xs text-white/60 mt-0.5 line-clamp-1">
                              {ticket.description}
                            </div>
                          )}

                          {remaining !== null && (
                            <div className="text-[11px] text-white/50 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3 text-white/40" />
                              <span>{remaining} spots remaining</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ticket Price */}
                      <div className="text-right flex-shrink-0">
                        {isFree ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-white/10 text-white">
                            FREE
                          </span>
                        ) : (
                          <span className="text-sm font-extrabold text-white">
                            {ticket.currency} {ticket.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Approval Notice if Selected Ticket or Event Requires Approval */}
              {(selectedTicket?.requireApproval || event.requireApproval) && (
                <div className="px-5 pt-1 pb-1">
                  <div className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-black/25 border border-white/[0.08] text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-white">Approval Required</div>
                      <div className="text-[11px] text-white/60">
                        Your registration for {selectedTicket?.name} is subject to host approval before ticket issuance.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ================= OPTIONAL MERCHANDISE SECTION ================= */}
              {event.merchandises && event.merchandises.length > 0 && (
                <div className="px-5 pt-3 border-t border-white/[0.08] mt-2">
                  <div className="flex items-center justify-between mb-2.5">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-purple-400" />
                        <span>Event Merchandise & Add-ons</span>
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/10 text-white/70">
                          Optional
                        </span>
                      </div>
                      <div className="text-[11px] text-white/50 mt-0.5">
                        Add official items to your ticket before checkout
                      </div>
                    </div>
                    {selectedMerchList.length > 0 && (
                      <span className="text-xs font-bold text-purple-300">
                        +{currencyDisplay} {totalMerchCost.toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    {event.merchandises.map((item, idx) => {
                      const merchId = item.id || `merch-${idx}`;
                      const qty = selectedMerchQuantities[merchId] || 0;
                      const isSelected = qty > 0;
                      const isFree = item.price === 0;

                      return (
                        <div
                          key={merchId}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${isSelected
                            ? 'border-purple-500/50 bg-purple-500/[0.08]'
                            : 'border-white/[0.08] bg-black/20 hover:border-white/20 hover:bg-white/[0.02]'
                            }`}
                        >
                          {/* Image & Info */}
                          <div className="flex items-center gap-3 min-w-0">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-11 h-11 rounded-lg object-cover bg-white/5 border border-white/10 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-white/40">
                                <Tag className="w-4 h-4 text-white/40" />
                              </div>
                            )}

                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-bold text-white truncate flex items-center gap-1.5">
                                <span>{item.name}</span>
                                {item.stock && item.stock > 0 && (
                                  <span className="text-[10px] text-white/40 font-normal">
                                    ({item.stock} left)
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <div className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                                  {item.description}
                                </div>
                              )}
                              <div className="text-xs font-bold text-white/90 mt-0.5">
                                {isFree
                                  ? 'FREE'
                                  : `${item.currency || 'IDR'} ${item.price.toLocaleString()}`}
                              </div>
                            </div>
                          </div>

                          {/* Add / Counter Controls */}
                          <div className="flex items-center flex-shrink-0">
                            {qty === 0 ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateMerchQuantity(merchId, 1, item.stock)}
                                className="px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/40 hover:bg-white/10 text-xs font-semibold text-white transition-all flex items-center gap-1 active:scale-95"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-lg p-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateMerchQuantity(merchId, -1, item.stock)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/20 text-white transition-all active:scale-90"
                                  aria-label="Decrease"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="text-xs font-bold text-white min-w-[1.2rem] text-center font-mono">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateMerchQuantity(merchId, 1, item.stock)}
                                  disabled={Boolean(item.stock && qty >= item.stock)}
                                  className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/20 text-white transition-all active:scale-90 disabled:opacity-40"
                                  aria-label="Increase"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Breakdown if merchandise selected or ticket has price */}
              {(selectedMerchList.length > 0 || ticketCost > 0) && (
                <div className="px-5 pt-3">
                  <div className="p-3 rounded-xl bg-black/30 border border-white/[0.08] text-xs space-y-1.5">
                    <div className="flex justify-between text-white/70">
                      <span>{selectedTicket?.name || 'Selected Ticket'}</span>
                      <span className="font-semibold text-white">
                        {ticketCost === 0 ? 'FREE' : `${currencyDisplay} ${ticketCost.toLocaleString()}`}
                      </span>
                    </div>
                    {selectedMerchList.length > 0 && (
                      <div className="flex justify-between text-white/70">
                        <span>
                          Merchandise ({selectedMerchList.reduce((c, m) => c + m.quantity, 0)} items)
                        </span>
                        <span className="font-semibold text-purple-300">
                          +{currencyDisplay} {totalMerchCost.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-white/[0.08] pt-1.5 flex justify-between font-bold text-white text-sm">
                      <span>Total Amount</span>
                      <span className="text-emerald-400 font-mono">
                        {totalCost === 0 ? 'FREE' : `${currencyDisplay} ${totalCost.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-white/[0.08] my-3" />

              {/* Welcome text & Clean Solid White Button */}
              <div className="px-5 pb-5 space-y-3">
                <p className="text-xs text-white/90 font-medium">
                  {isPast
                    ? 'This event has ended. Registrations are closed.'
                    : 'Welcome! To join the event, please select a ticket and register below.'}
                </p>

                <button
                  type="button"
                  disabled={isPast || !selectedTicketSaleStatus.canPurchase}
                  onClick={() => setIsRsvpOpen(true)}
                  className={`w-full py-3.5 rounded-xl font-extrabold text-sm sm:text-base transition-all shadow-md active:scale-[0.99] ${!isPast && selectedTicketSaleStatus.canPurchase
                    ? 'bg-white hover:bg-white/90 text-black cursor-pointer'
                    : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                    }`}
                >
                  {isPast
                    ? 'Event Ended'
                    : !selectedTicketSaleStatus.canPurchase
                      ? (selectedTicketSaleStatus.badgeText || 'Ticket Unavailable')
                      : selectedTicket?.requireApproval || event.requireApproval
                        ? 'Request to Join'
                        : totalCost > 0
                          ? `Register & Pay ${currencyDisplay} ${totalCost.toLocaleString()}`
                          : 'Register Now'}
                </button>

                {isOwner && (
                  <div className="flex items-center gap-2 pt-1">
                    {canEdit ? (
                      <Link
                        href={`/create?edit=${event.slug}`}
                        className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-white/15 active:scale-95"
                      >
                        <Pencil className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit Event</span>
                      </Link>
                    ) : (
                      <div className="flex-1 py-2 px-2.5 rounded-xl bg-white/5 border border-white/10 text-white/50 text-[11px] text-center font-medium">
                        {isOngoing ? 'Editing Locked (Ongoing)' : 'Event Concluded'}
                      </div>
                    )}
                    <Link
                      href={`/manage/${event.slug}`}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 border border-white/15 active:scale-95"
                    >
                      <Settings className="w-3.5 h-3.5 text-blue-400" />
                      <span>Manage Event</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* ================= ABOUT EVENT SECTION ================= */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold text-white/50">About Event</h3>

              {isSaladStop ? (
                <div className="text-sm text-white/90 leading-relaxed space-y-4">
                  <h4 className="text-base font-extrabold text-white">
                    Radius x SaladStop! : GOODNESS IN MOTION 🏃🥗
                  </h4>

                  <div className="space-y-2">
                    <p>Drop bag and meeting point : South Lobby Senayan City (Near Starbucks)</p>
                    <p>Time : 5:30 – Start Registration. Please come on time!</p>
                    <p>
                      Lace up your shoes and bring your appetite! Join us for a fun community run
                      followed by delicious, healthy refueling.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-bold text-white">What’s waiting for you at the finish line?</h5>
                    <ul className="space-y-1">
                      <li>👕 Free exclusive jersey</li>
                      <li>🥗 Free post-run meal from SaladStop!</li>
                      <li>🧃 Free refreshing drinks</li>
                      <li>🎉 Plus, exciting games and fun activities!</li>
                    </ul>
                  </div>

                  <p className="font-bold text-white">🎟️ Entry is 100% FREE!</p>

                  <p className="italic text-xs text-white/60 leading-relaxed pt-1">
                    Please note: Registration operates on a waitlist system. Join the waitlist now,
                    and if your spot is confirmed, you will be notified and receive your ticket directly
                    via email.
                  </p>
                </div>
              ) : (
                <div className="text-sm text-white/90 leading-relaxed space-y-3 whitespace-pre-line">
                  {event.description}
                </div>
              )}
            </div>

            {/* ================= LOCATION SECTION & MAP ================= */}
            <div className="space-y-3 pt-4">
              <h3 className="text-xs font-semibold text-white/50">Location</h3>

              <div className="space-y-1">
                <div className="text-sm font-bold text-white">
                  {isSaladStop
                    ? 'Senayan City Mall'
                    : event.locationType === 'online'
                      ? 'Online Stream'
                      : event.address || event.city || 'Event Location'}
                </div>
                <div className="text-xs text-white/60 leading-relaxed">
                  {isSaladStop
                    ? 'Jl. Asia Afrika No.19, RT.1/RW.3, Gelora, Kecamatan Tanah Abang, Kota Jakarta Pusat, Daerah Khusus Ibukota Jakarta 10270, Indonesia'
                    : event.locationType === 'online'
                      ? 'Join from anywhere via web browser or phone.'
                      : event.city
                        ? `${event.address ? `${event.address}, ` : ''}${event.city}, ${event.region || 'Indonesia'}`
                        : event.address || 'Address provided upon registration'}
                </div>
                {isSaladStop && (
                  <div className="text-xs text-white/70 pt-0.5">South Lobby Senayan City</div>
                )}
              </div>

              {/* Stylized Google Map Frame matching Screenshot (Only for offline events) */}
              {event.locationType !== 'online' && (
                <div className="w-full h-56 rounded-2xl overflow-hidden relative border border-white/10 shadow-lg mt-3 bg-[#111f12]">
                  <iframe
                    title="Event Location Map"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=106.786%2C-6.234%2C106.808%2C-6.220&layer=mapnik&marker=-6.2271953%2C106.7970117`}
                    className="w-full h-full border-0 filter brightness-[0.92] contrast-[1.05]"
                    loading="lazy"
                  />

                  {/* Top Left "Open in Maps ↗" Pill */}
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/95 hover:bg-white text-black text-xs font-bold shadow-md transition-all hover:scale-105"
                  >
                    <span>Open in Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>

                  {/* Bottom Right Fullscreen Icon */}
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-3 right-3 p-2 rounded-lg bg-white/90 hover:bg-white text-black shadow-md transition-all"
                    title="Expand map"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= EXACT FOOTER FROM SCREENSHOT (WITHOUT PRICING) ================= */}
      <footer className="border-t border-white/[0.08] mt-16 py-6 text-xs text-white/50 event-detail-footer">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Brand Star & Links (No Pricing) */}
          <div className="flex items-center gap-5">
            {/* <Link href="/" className="text-white/60 hover:text-white transition-colors text-sm">
            ✦
          </Link> */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              <span className="text-sm sm:text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5 font-sans">
                <span>helio</span>
                <span className="text-blue-500 text-[12px] transform -translate-y-1">✦</span>
              </span>
            </Link>
            <Link href="/discover" className="hover:text-white transition-colors">
              Discover
            </Link>
            <a
              href="mailto:support@helio.events"
              className="hover:text-white transition-colors"
            >
              Help
            </a>
          </div>

          {/* Right: Socials & Get the App */}
          <div className="flex items-center gap-4">
            <a
              href="https:/instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              title="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="https:/x.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors text-xs font-mono text-[22px]"
              title="X"
            >
              𝕏
            </a>
            <a
              href="mailto:hello@helio.events"
              className="hover:text-white transition-colors text-xs"
              title="Contact"
            >
              <MailIcon className="w-4 h-4" />
            </a>
            <button
              type="button"
              className="px-3 py-1 rounded-full border border-white/20 hover:border-white/40 text-xs font-medium text-white transition-all ml-1"
            >
              Get the App
            </button>
          </div>
        </div>
      </footer>

      {/* RSVP Modal with Selected Ticket ID & Selected Merchandise */}
      <RsvpModal
        event={event}
        isOpen={isRsvpOpen}
        onClose={() => setIsRsvpOpen(false)}
        initialTicketId={selectedTicketId}
        selectedMerchandise={selectedMerchList}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
