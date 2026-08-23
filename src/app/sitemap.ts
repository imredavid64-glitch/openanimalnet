import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { sampleAnimals } from '@/data/sample/animals';

const STATIC_ROUTES = [
  '/',
  '/about',
  '/acoustics',
  '/ai',
  '/animal',
  '/api',
  '/api/playground',
  '/assistance',
  '/careers',
  '/challenge',
  '/community',
  '/compare',
  '/conservation',
  '/contact',
  '/dashboard',
  '/data',
  '/data-quality',
  '/data/behavioral',
  '/data/biological',
  '/data/ecological',
  '/data/export',
  '/data/health',
  '/data/population',
  '/docs',
  '/gallery',
  '/habitat',
  '/impact',
  '/interact',
  '/laws',
  '/live-feed',
  '/livestock',
  '/methodology',
  '/migration',
  '/monitor',
  '/monitor/coverage',
  '/partners',
  '/privacy',
  '/reserves',
  '/reunite',
  '/safari',
  '/sources',
  '/terms',
  '/tracker',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...STATIC_ROUTES.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: route === '/' ? 1 : 0.7,
    })),
    ...sampleAnimals.map((animal) => ({
      url: `${SITE_URL}/animal/${animal.id}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
