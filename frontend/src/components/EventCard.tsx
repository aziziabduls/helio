'use client';

import { useAuth } from '@/context/AuthContext';
import { EventItem } from '@/lib/api';
import { formatEventTime } from '@/lib/utils';
import { MapPin, Settings, Users } from 'lucide-react';
import Link from 'next/link';

interface EventCardProps {
  event: EventItem;
}

export default function EventCard({ event }: EventCardProps) {
  const timeFormatted = formatEventTime(event.startAt, event.endAt);
  const guestCount = event._count?.registrations || 0;
  const attendees = event.registrations?.slice(0, 3) ?? [];
  const { user } = useAuth();
  const isOwner = !!user && !!event.host?.id && user.id === event.host.id;

  return (
    <div className="group relative luma-card p-3.5 sm:p-5 flex flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      {/* Event Details Left */}
      <div className="flex-1 min-w-0 pr-1 sm:pr-4">
        {/* Time & Category Header */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
            {timeFormatted}
          </span>

          <div className="hidden sm:flex items-center flex-wrap gap-2">
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
                    className="inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium bg-white/[0.04] border border-white/10 text-white/70 leading-none"
                  >
                    {tag}
                  </span>
                );
              });
            })()}
          </div>
        </div>

        {/* Title */}
        <Link href={`/${event.slug}`} className="block">
          <h3 className="text-sm sm:text-xl font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
            {event.name}
          </h3>
        </Link>

        {/* Host & Location */}
        <div className="mt-3 flex flex-col gap-1.5 text-xs text-white/60">
          {/* Host */}
          <div className="flex items-center gap-2">
            {event.host.avatarUrl ? (
              <img
                src={event.host.avatarUrl}
                alt={event.host.name}
                className="w-4 h-4 rounded-full object-cover"
              />
            ) : (
              <div className="w-4 h-4 rounded-full bg-blue-500/30 flex items-center justify-center text-[9px] text-white">
                {event.host.name.charAt(0)}
              </div>
            )}
            <span className="truncate">By {event.host.name}</span>
            {event.calendar && (
              <span className="text-white/40 truncate">
                in <span className="text-white/70">{event.calendar.name}</span>
              </span>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            <span className="truncate">
              {event.locationType === 'online'
                ? 'Online Event'
                : event.city
                  ? `${event.city}${event.region ? `, ${event.region}` : ''}`
                  : event.address || 'Location on RSVP'}
            </span>
          </div>
        </div>

        {/* Bottom stats & Manage link */}
        <div className="mt-4 pt-3 flex items-center justify-between text-xs text-white/40">
          <div className="flex items-center gap-2">
            {attendees.length > 0 ? (
              <div className="flex items-center -space-x-1.5">
                {attendees.map((a, i) => (
                  <div
                    key={a.id}
                    className="relative group/avatar hover:z-20"
                    style={{ zIndex: attendees.length - i }}
                  >
                    <div className="w-5 h-5 rounded-full ring-2 ring-[#0b0e14] overflow-hidden bg-gradient-to-br from-blue-500/60 to-purple-500/60 flex items-center justify-center text-[9px] font-bold text-white transition-transform duration-150 group-hover/avatar:-translate-y-0.5 group-hover/avatar:scale-110">
                      {a.user?.avatarUrl ? (
                        <img
                          src={a.user.avatarUrl}
                          alt={a.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{a.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>

                    {/* Hover tooltip */}
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded-lg bg-[#161b22] border border-white/[0.1] px-2.5 py-1 text-[11px] font-medium text-white/90 shadow-xl opacity-0 translate-y-1 group-hover/avatar:opacity-100 group-hover/avatar:translate-y-0 transition-all duration-150"
                    >
                      <span className="font-semibold text-white">{a.name.split(' ')[0]}</span>{' '}
                      is going to this event
                      <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 -mt-1 rotate-45 bg-[#161b22] border-r border-b border-white/[0.1]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Users className="w-3.5 h-3.5" />
            )}
            <span>{guestCount} going</span>
          </div>

          {isOwner && (
            <Link
              href={`/manage/${event.slug}`}
              className="flex items-center gap-1 text-white/50 hover:text-white transition-colors"
              title="Host Dashboard & Guest List"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Manage</span>
            </Link>
          )}
        </div>
      </div>

      {/* Cover Image Right (Portrait Aspect Ratio) */}
      <Link
        href={`/${event.slug}`}
        className="w-24 sm:w-28 md:w-32 aspect-[3/4] flex-shrink-0 rounded-2xl overflow-hidden bg-white/[0.05] relative self-start sm:self-center"
      >
        {/* coverCardUrl yg square, untuk tampilan card */}
        <img
          src={event.coverUrl}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
    </div>
  );
}
