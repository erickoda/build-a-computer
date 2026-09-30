import { SITE_URL } from '@/src/utils/seo';
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return ['/', '/build-pc', '/benchmarks', '/hardware', '/games'].map(
    (path) => ({
      url: `${SITE_URL}${path}`,
      changeFrequency: 'weekly',
      priority: path === '/' ? 1 : 0.8,
    }),
  );
}
