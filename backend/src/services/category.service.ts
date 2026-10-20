import { prisma } from '../db';
import type { Category, City } from '@prisma/client';

const CATEGORY_METADATA: Record<string, { icon: string; countFallback: string }> = {
  Tech: {
    icon: 'https://images.lumacdn.com/uploads/v7/3f6baafa-d90d-4013-9853-0fa10331f796.png',
    countFallback: '4K',
  },
  AI: {
    icon: 'https://images.lumacdn.com/uploads/0z/c1143c0e-a2ab-4434-b82b-80b0ba3ec2f0.png',
    countFallback: '4K',
  },
  'Food & Drink': {
    icon: 'https://images.lumacdn.com/uploads/36/a77db635-cb3b-4720-9758-2bc9dae948e4.png',
    countFallback: '579',
  },
  'Arts & Culture': {
    icon: 'https://images.lumacdn.com/uploads/u8/5eeba5a4-d305-4bc1-9017-329937813f30.png',
    countFallback: '4K',
  },
  Books: {
    icon: 'https://images.lumacdn.com/uploads/3g/f33c0b3c-9090-40bb-b99c-875b534bcee4.png',
    countFallback: '767',
  },
  Games: {
    icon: 'https://images.lumacdn.com/uploads/mp/c65f64de-a537-4867-b7e6-7eedd3470c82.png',
    countFallback: '554',
  },
  Climate: {
    icon: 'https://images.lumacdn.com/uploads/on/19946552-9254-41de-b105-d086a2e4ac68.png',
    countFallback: '1K',
  },
  Fitness: {
    icon: 'https://images.lumacdn.com/uploads/7b/f3930d36-b2f2-4df3-8db6-798df9b0897f.png',
    countFallback: '2K',
  },
  Wellness: {
    icon: 'https://images.lumacdn.com/uploads/y5/4f225f49-0c10-4bba-b1cb-77ae216268ac.png',
    countFallback: '1K',
  },
  Crypto: {
    icon: 'https://images.lumacdn.com/uploads/yl/096bc517-f9fc-49fe-befd-401e29cc4662.png',
    countFallback: '559',
  },
  Running: {
    icon: 'https://images.lumacdn.com/uploads/9f/9a31599b-38be-49c8-9c46-dfa19becb9ad.png',
    countFallback: '636',
  },
  Family: {
    icon: 'https://images.lumacdn.com/uploads/aq/f5fbdde4-46a9-4d9e-b730-7144b3c0e335.png',
    countFallback: '772',
  },
};

const CITY_METADATA = [
  { name: 'San Francisco', region: 'North America', icon: 'https://images.lumacdn.com/discovery/sf-icon.png', count: 58 },
  { name: 'New York', region: 'North America', icon: 'https://images.lumacdn.com/discovery/nyc-icon.png', count: 95 },
  { name: 'London', region: 'Europe', icon: 'https://images.lumacdn.com/discovery/boston-icon.png', count: 48 },
  { name: 'Los Angeles', region: 'North America', icon: 'https://images.lumacdn.com/discovery/la-icon.png', count: 44 },
  { name: 'Austin', region: 'North America', icon: 'https://images.lumacdn.com/discovery/austin-icon.png', count: 16 },
  { name: 'Hillsborough', region: 'North America', icon: 'https://images.lumacdn.com/discovery/slc-icon.png', count: 8 },
  { name: 'Tokyo', region: 'Asia & Pacific', icon: 'https://images.lumacdn.com/discovery/vegas-icon.png', count: 32 },
  { name: 'Singapore', region: 'Asia & Pacific', icon: 'https://images.lumacdn.com/discovery/miami-icon.png', count: 24 },
  { name: 'Berlin', region: 'Europe', icon: 'https://images.lumacdn.com/discovery/calgary-icon.png', count: 22 },
  { name: 'Paris', region: 'Europe', icon: 'https://images.lumacdn.com/discovery/montreal-icon.png', count: 30 },
];

export class CategoryService {
  async getCategories() {
    try {
      const dbCategories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
      if (dbCategories && dbCategories.length > 0) {
        return dbCategories.map((c: Category) => ({
          name: c.name,
          slug: c.slug,
          icon: c.icon,
          count: c.count || '0',
        }));
      }
    } catch (e) {
      // Fallback if DB table not yet seeded
    }

    const events = await prisma.event.findMany({
      select: { category: true },
    });

    const categoryMap = new Map<string, number>();
    for (const evt of events) {
      if (Array.isArray(evt.category)) {
        for (const cat of evt.category) {
          const clean = cat.replace(/^#/, '').trim();
          categoryMap.set(clean, (categoryMap.get(clean) || 0) + 1);
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        }
      }
    }

    const categories = Object.entries(CATEGORY_METADATA).map(([name, meta]) => ({
      name,
      icon: meta.icon,
      count: categoryMap.get(name) || meta.countFallback,
    }));

    return categories;
  }

  async getCities() {
    try {
      const dbCities = await prisma.city.findMany({
        orderBy: { count: 'desc' },
      });
      if (dbCities && dbCities.length > 0) {
        return dbCities.map((c: City) => ({
          name: c.name,
          slug: c.slug,
          region: c.continent,
          continent: c.continent,
          icon: c.icon,
          count: c.count,
          tint: c.tint,
        }));
      }
    } catch (e) {
      // Fallback
    }

    return CITY_METADATA;
  }
}

export const categoryService = new CategoryService();

