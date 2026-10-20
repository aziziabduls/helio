'use client';

import { Instagram, MailIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  // If on an event detail page, the event view renders its own thematic footer
  // with dynamic event prominent border color.
  const isEventDetail =
    pathname &&
    pathname !== '/' &&
    pathname !== '/events' &&
    pathname !== '/discover' &&
    pathname !== '/profile' &&
    pathname !== '/create' &&
    pathname !== '/login' &&
    !pathname.startsWith('/calendar/');

  if (isEventDetail) {
    return null;
  }

  return (
    <footer className="border-t border-white/[0.08] mt-16 py-6 text-xs text-white/50">
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
            className="hover:text-white transition-colors text-md font-mono text-[22px]"
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
  );
}
