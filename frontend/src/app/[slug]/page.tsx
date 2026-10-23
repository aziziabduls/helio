import React from 'react';
import { notFound } from 'next/navigation';
import EventDetailView from './EventDetailView';
import { EventItem } from '@/lib/api';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4450/api';

export const dynamic = 'force-dynamic';

async function getEventData(slug: string): Promise<EventItem | null> {
  try {
    const res = await fetch(`${API_BASE}/events/${slug}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return json.data as EventItem;
      }
    }
  } catch (error) {
    console.warn(`Server-side fetch failed for slug "${slug}":`, error);
  }

  return null;
}

import CityEventsView from '@/components/CityEventsView';

const CITY_ALIASES: Record<string, string> = {
  la: 'Los Angeles',
  sf: 'San Francisco',
  'san-francisco': 'San Francisco',
  nyc: 'New York',
  'new-york': 'New York',
  jakarta: 'Jakarta',
  london: 'London',
  hillsborough: 'Hillsborough',
};

export default async function EventDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const event = await getEventData(params.slug);

  if (!event) {
    const normalizedKey = params.slug.toLowerCase().replace(/\s+/g, '-');
    const cityMatch = CITY_ALIASES[normalizedKey] || CITY_ALIASES[params.slug.toLowerCase()];
    if (cityMatch) {
      return <CityEventsView initialCity={cityMatch} />;
    }
    notFound();
  }

  // Renders immediately with exact prominent background color in initial HTML response - ZERO DELAY
  return <EventDetailView initialEvent={event} />;
}
