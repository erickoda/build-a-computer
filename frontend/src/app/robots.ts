import { SITE_URL } from '@/src/utils/seo';
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/users', '/benchmarks/create'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
