'use client';

import CityEventsView from '@/components/CityEventsView';
import { useParams } from 'next/navigation';

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

export default function CitySlugPage() {
  const params = useParams();
  const rawCity = (params?.city as string) || '';
  const decoded = decodeURIComponent(rawCity);
  const normalizedKey = decoded.toLowerCase().replace(/\s+/g, '-');
  const formattedFallback = decoded.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const cityName = CITY_ALIASES[normalizedKey] || CITY_ALIASES[decoded.toLowerCase()] || formattedFallback || 'San Francisco';

  return <CityEventsView initialCity={cityName} />;
}
