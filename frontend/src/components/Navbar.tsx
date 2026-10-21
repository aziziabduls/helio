'use client';

import { useAuth } from '@/context/AuthContext';
import { Calendar as CalendarIcon, Compass, LogOut, Plus, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import EventSearchBar from './EventSearchBar';

export default function Navbar() {
  const pathname = usePathname();
  const { user, openAuthModal, logout } = useAuth();
  const [time, setTime] = useState<string>('');
  const [menuOpen, setMenuOpen] = useState(false);

  const isCityPath =
    pathname.startsWith('/city') ||
    ['/la', '/sf', '/san-francisco', '/nyc', '/new-york', '/jakarta', '/london', '/hillsborough'].includes(
      pathname.toLowerCase()
    );

  const isEventDetail =
    pathname === '/create' ||
    (Boolean(pathname) &&
      pathname !== '/' &&
      pathname !== '/events' &&
      pathname !== '/discover' &&
      pathname !== '/profile' &&
      pathname !== '/login' &&
      !isCityPath &&
      !pathname.startsWith('/calendar/') &&
      !pathname.startsWith('/manage/') &&
      !pathname.startsWith('/profile/'));

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      const offsetMinutes = -now.getTimezoneOffset();
      const sign = offsetMinutes >= 0 ? '+' : '-';
      const hours = Math.floor(Math.abs(offsetMinutes) / 60);
      const mins = Math.abs(offsetMinutes) % 60;
      const gmt = `GMT${sign}${hours}${mins > 0 ? `:${mins.toString().padStart(2, '0')}` : ''}`;
      setTime(`${timeStr} ${gmt}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`navbar-root sticky top-0 z-50 w-full backdrop-blur-[6px] transition-colors duration-200 ${isEventDetail
        ? 'is-event-detail border-white/[0.06]'
        : 'border-white/[0.08]'
        }`}
      style={{
        backgroundColor: isEventDetail
          ? 'color-mix(in srgb, var(--event-page-bg, var(--bg-color)) 70%, transparent)'
          : 'var(--header-bg)',
      }}
    >
      <div className="w-full px-4 sm:px-6 h-11 flex items-center justify-between xl:grid xl:grid-cols-[1fr_minmax(0,56rem)_1fr]">
        {/* Section 1 - Left: Brand Logo */}
        <div className="flex items-center justify-start flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-0 font-sans">
              <span>helio</span>
              <span className="text-blue-500 text-sm transform -translate-y-1">✦</span>
            </span>
          </Link>
        </div>

        {/* Section 2 - Center: Menu and Search Bar (Exact boundary above Events and Upcoming/Past) */}
        <div className="w-full h-full flex items-center justify-between gap-4 px-4 sm:px-6">
          {/* Left boundary: directly above "Events" title */}
          <div className="hidden sm:flex items-center gap-4">
            <Link
              href="/events"
              className={`text-[13px] font-semibold transition-colors flex items-center gap-1 ${pathname === '/events'
                ? 'text-white'
                : 'text-white/70 hover:text-white'
                }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>Events</span>
            </Link>

            <Link
              href="/discover"
              className={`text-[13px] font-semibold transition-colors flex items-center gap-1 ${pathname === '/discover'
                ? 'text-white'
                : 'text-white/70 hover:text-white'
                }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Discover</span>
            </Link>
          </div>

          {/* Right boundary: directly above "Upcoming / Past" */}
          <div className="flex items-center ml-auto sm:ml-0">
            <EventSearchBar />
          </div>
        </div>

        {/* Section 3 - Right: Time, Create Event & Profile / Sign In */}
        <div className="flex items-center justify-end gap-3 sm:gap-3 flex-shrink-0">
          <Link
            href="/discover"
            className="sm:hidden text-sm text-white/70 hover:text-white mr-1 flex-shrink-0"
          >
            <Compass className="w-5 h-5" />
          </Link>

          {time && (
            <div className="hidden sm:flex items-center gap-1 text-[12px] text-white/50 mr-0 px-0.5 py-1 rounded-full flex-shrink-0">
              <span>{time}</span>
            </div>
          )}

          {user && (
            <Link
              href="/create"
              className="luma-btn luma-btn-primary px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-sm flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">Host</span>
            </Link>
          )}


          {/* User Session Management */}
          {user ? (
            <div className="relative flex-shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/20 bg-blue-600/30 flex items-center justify-center text-xs font-semibold text-white focus:outline-none"
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name.charAt(0)}</span>
                )}
              </button>

              {/* User Dropdown */}
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#161b22] border border-white/[0.1] shadow-2xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-white/[0.06]">
                      <div className="font-bold text-white truncate">{user.name}</div>
                      <div className="text-[11px] text-white/40 truncate">{user.email}</div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-white/70 hover:text-white hover:bg-white/[0.05] transition-colors"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>My Profile & Tickets</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-white/[0.05] transition-colors text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/90 hover:text-white border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] transition-all flex-shrink-0"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
