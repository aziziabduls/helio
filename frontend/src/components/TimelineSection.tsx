import React from 'react';
import { EventItem } from '@/lib/api';
import EventCard from './EventCard';
import { formatEventDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TimelineSectionProps {
  dateStr: string;
  events: EventItem[];
  isLast?: boolean;
}

export default function TimelineSection({ dateStr, events, isLast = false }: TimelineSectionProps) {
  const formattedDate = formatEventDate(dateStr);
  const dateObj = new Date(dateStr);
  const weekday = isNaN(dateObj.getTime())
    ? ''
    : dateObj.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="relative flex scroll-mt-20 justify-end gap-2 w-full pb-8">
      {/* Desktop Sticky Date Column (timeline-component-05 pattern) */}
      <div className="sticky top-24 flex w-32 md:w-36 flex-col items-end gap-1.5 self-start pb-4 max-md:hidden flex-shrink-0">
        <Badge className="flex w-auto justify-end rounded-md text-xs font-bold uppercase tracking-wider bg-white/[0.08] hover:bg-white/[0.12] text-white/90 border border-white/10 px-2.5 py-1">
          {formattedDate}
        </Badge>
        {weekday && (
          <div className="text-white/40 text-right text-xs font-medium">
            {weekday}
          </div>
        )}
      </div>

      {/* Center Timeline Spine with Glowing Node (timeline-component-05 pattern) */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="sticky top-24 mb-6 flex size-6 items-center justify-center max-sm:top-5 z-10">
          <span className="bg-blue-500/20 flex size-4.5 shrink-0 items-center justify-center rounded-full ring-4 ring-[#0b0e14]">
            <span className="bg-blue-500 size-2.5 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
          </span>
        </div>
        {!isLast && <span className="-mt-7 w-px flex-1 border-r border-white/10" />}
      </div>

      {/* Right Column: Events Content (timeline-component-05 pattern) */}
      <div className="flex flex-1 flex-col gap-4 pb-8 pl-3 md:pl-6 lg:pl-8 min-w-0">
        {/* Mobile Date Header */}
        <div className="flex items-center gap-2 md:hidden mb-1">
          <Badge className="flex rounded-md text-xs font-bold uppercase tracking-wider bg-white/[0.08] text-white/90 border border-white/10 px-2.5 py-0.5">
            {formattedDate}
          </Badge>
          {weekday && <span className="text-xs text-white/40 font-medium">{weekday}</span>}
        </div>

        {/* Stack of Event Cards */}
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}
