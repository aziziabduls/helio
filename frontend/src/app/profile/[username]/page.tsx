'use client';

import { useAuth } from '@/context/AuthContext';
import { EventItem, UserProfile, fetchUserByUsername } from '@/lib/api';
import {
  Calendar as CalendarIcon,
  Globe,
  Instagram,
  Linkedin,
  Twitter,
  Users,
  Youtube
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// Format Luma style relative dates: "Today, 6:00 PM", "Tomorrow, 1:30 PM", "Mon, Oct 19, 6:00 PM"
function formatProfileEventDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (isToday) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;
  if (isYesterday) return `Yesterday, ${timeStr}`;

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();

  return `${weekday}, ${month} ${day}, ${timeStr}`;
}

function formatJoinedDate(dateString?: string): string {
  if (!dateString) return 'Joined recently';
  const d = new Date(dateString);
  const month = d.toLocaleDateString('en-US', { month: 'long' });
  const year = d.getFullYear();
  return `Joined ${month} ${year}`;
}

export default function UserPublicProfilePage() {
  const params = useParams();
  const username = params?.username as string;

  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!username) return;
    setLoading(true);

    fetchUserByUsername(username)
      .then((data) => {
        setProfileUser(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Failed to load user profile by username:', err);
        setProfileUser(null);
        setLoading(false);
      });
  }, [username]);

  if (loading) {
    return (
      <div className="py-32 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-white/50">Loading profile...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="max-w-md mx-auto py-32 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-white/[0.05] border border-white/[0.1] text-white/30 flex items-center justify-center mx-auto text-2xl font-bold">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Profile Not Found</h2>
        <p className="text-xs sm:text-sm text-white/50 max-w-sm mx-auto">
          We couldn&apos;t find a profile for &ldquo;@{username}&rdquo;.
        </p>
        <Link href="/" className="inline-block luma-btn luma-btn-primary px-5 py-2.5 text-sm font-semibold">
          Return to Events
        </Link>
      </div>
    );
  }

  const isOwner =
    currentUser?.id === profileUser.id ||
    (currentUser?.username && currentUser.username === profileUser.username);

  const allEvents = profileUser.events || [];
  const now = new Date();

  // Upcoming vs Past Events
  const upcomingEvents = allEvents.filter((e) => new Date(e.startAt) >= now);
  const pastEvents = allEvents.filter((e) => new Date(e.startAt) < now);

  // If all events happen to be in the past or future in seed data, display smartly
  const displayUpcoming = upcomingEvents.length > 0 ? upcomingEvents : allEvents;
  const displayPast = upcomingEvents.length > 0 ? pastEvents : [];

  const hostedCount =
    profileUser._count?.events ?? allEvents.length;
  const attendedCount =
    profileUser._count?.registrations ?? (profileUser.registrations?.length || 0);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-10 pb-24">
      {/* ================= PROFILE HEADER ================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-7">
        {/* Large Round Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white/[0.06] ring-1 ring-white/10 flex-shrink-0 flex items-center justify-center">
          {profileUser.avatarUrl ? (
            <img
              src={profileUser.avatarUrl}
              alt={profileUser.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-4xl font-extrabold text-white">
              {profileUser.name.charAt(0)}
            </span>
          )}
        </div>

        {/* Info Right */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
              {profileUser.name}
            </h1>

            {isOwner && (
              <Link
                href="/profile"
                className="text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-full px-3 py-1 transition-colors"
              >
                Edit
              </Link>
            )}
          </div>

          <div className="text-sm text-white/60 font-normal">
            @{profileUser.username || 'user'}
          </div>

          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-white/50 pt-0.5">
            <CalendarIcon className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            <span>{formatJoinedDate(profileUser.createdAt)}</span>
          </div>

          {/* Stats: Hosted / Attended */}
          <div className="flex items-center gap-4 pt-1 text-xs sm:text-sm">
            <div>
              <span className="font-bold text-white text-sm sm:text-base mr-1">
                {hostedCount}
              </span>
              <span className="text-white/50">Hosted</span>
            </div>
            <div>
              <span className="font-bold text-white text-sm sm:text-base mr-1">
                {attendedCount}
              </span>
              <span className="text-white/50">Attended</span>
            </div>
          </div>

          {/* Social Icons Row */}
          <div className="flex items-center gap-3.5 pt-2 text-white/50">
            {profileUser.instagramHandle && (
              <a
                href={`https://instagram.com/${profileUser.instagramHandle}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                title={`@${profileUser.instagramHandle} on Instagram`}
              >
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {profileUser.twitterHandle && (
              <a
                href={`https://x.com/${profileUser.twitterHandle}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                title={`@${profileUser.twitterHandle} on X`}
              >
                <Twitter className="w-4 h-4" />
              </a>
            )}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              title="YouTube"
            >
              <Youtube className="w-4 h-4" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition-colors"
              title="LinkedIn"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            {profileUser.website && (
              <a
                href={profileUser.website}
                target="_blank"
                rel="noreferrer"
                className="hover:text-white transition-colors"
                title={profileUser.website}
              >
                <Globe className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-b border-white/[0.08] my-8 sm:my-10" />

      {/* ================= HOSTING SECTION ================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-white">Hosting</h2>
          {displayUpcoming.length > 3 && (
            <button type="button" className="text-xs sm:text-sm font-medium text-white/50 hover:text-white transition-colors">
              View All
            </button>
          )}
        </div>

        {displayUpcoming.length === 0 ? (
          <div className="p-8 text-center text-xs text-white/40">
            No upcoming events scheduled.
          </div>
        ) : (
          <div className="space-y-2">
            {displayUpcoming.map((event) => (
              <EventRow key={event.id} event={event} host={profileUser} />
            ))}
          </div>
        )}
      </div>

      {/* ================= PAST EVENTS SECTION ================= */}
      {displayPast.length > 0 && (
        <div className="space-y-4 mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white">Past Events</h2>
            {displayPast.length > 3 && (
              <button type="button" className="text-xs sm:text-sm font-medium text-white/50 hover:text-white transition-colors">
                View All
              </button>
            )}
          </div>

          <div className="space-y-2">
            {displayPast.map((event) => (
              <EventRow key={event.id} event={event} host={profileUser} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EventRow({ event, host }: { event: EventItem; host: UserProfile }) {
  const locationTag = event.calendar?.name || event.city || event.address || 'Online';

  return (
    <Link
      href={`/${event.slug}`}
      className="flex items-center gap-3.5 sm:gap-4 p-2 sm:p-2.5 -mx-2 sm:-mx-2.5 rounded-2xl hover:bg-white/[0.04] transition-all group"
    >
      {/* Square Thumbnail */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/[0.05] ring-1 ring-white/[0.08] flex-shrink-0">
        <img
          src={event.coverCardUrl || event.coverUrl}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
        <div className="text-xs text-white/50 font-medium">
          {formatProfileEventDate(event.startAt)}
        </div>

        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1 leading-snug">
          {event.name}
        </h3>

        {/* Host Avatars & Name */}
        <div className="flex items-center gap-1.5 text-xs text-white/60">
          <div className="w-4 h-4 rounded-full overflow-hidden bg-blue-500/20 ring-1 ring-white/10 flex-shrink-0">
            {host.avatarUrl ? (
              <img src={host.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[9px] text-white flex items-center justify-center h-full">
                {host.name.charAt(0)}
              </span>
            )}
          </div>
          <span className="truncate">By {host.name}</span>
        </div>

        {/* Calendar / Hub Tag */}
        {locationTag && (
          <div className="text-xs text-white/40 truncate">
            {locationTag}
          </div>
        )}
      </div>
    </Link>
  );
}
