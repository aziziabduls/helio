'use client';

import CityEventsView from '@/components/CityEventsView';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function CityPageContent() {
  const searchParams = useSearchParams();
  const cityParam = searchParams.get('city') || 'San Francisco';

  return <CityEventsView initialCity={cityParam} />;
}

export default function CityPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <CityPageContent />
    </Suspense>
  );
}
