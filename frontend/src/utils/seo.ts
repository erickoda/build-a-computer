import type { Metadata } from 'next';

export const SITE_URL = 'https://buildacomputer.online';
export const SITE_NAME = 'Build a Computer';

// Next.js replaces `openGraph` wholesale when a page sets its own, so every
// page spreads these to keep og:type and og:site_name.
export const baseOpenGraph: NonNullable<Metadata['openGraph']> = {
  type: 'website',
  siteName: SITE_NAME,
  locale: 'en',
};
