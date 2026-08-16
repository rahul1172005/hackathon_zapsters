import type { MetadataRoute } from 'next';
import { SITE_URL } from './seo';
import { MOCK_HACKATHONS, MOCK_TEAMS } from '@/lib/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/explore', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/hackathons', changeFrequency: 'daily', priority: 0.9 },
    { path: '/leaderboard', changeFrequency: 'daily', priority: 0.8 },
    { path: '/teams', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/organizations', changeFrequency: 'weekly', priority: 0.6 },
    { path: '/dashboard', changeFrequency: 'monthly', priority: 0.5 },
  ] as const;

  const hackathonRoutes = MOCK_HACKATHONS.map((hackathon) => ({
    url: `${SITE_URL}/hackathons/${hackathon.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const teamRoutes = MOCK_TEAMS.map((team) => ({
    url: `${SITE_URL}/teams/${team.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...hackathonRoutes,
    ...teamRoutes,
  ];
}
