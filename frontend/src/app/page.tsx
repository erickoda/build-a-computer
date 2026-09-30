import { LandingPage } from '@/src/features/home/components/home';
import { baseOpenGraph, SITE_URL } from '@/src/utils/seo';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { ...baseOpenGraph, url: '/', title: 'Build a Computer' },
  twitter: { title: 'Build a Computer' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Build a Computer',
      url: SITE_URL,
      logo: `${SITE_URL}/icon.svg`,
      sameAs: ['https://github.com/erickoda/build-a-computer'],
      member: [
        { '@type': 'Person', name: 'Erick Oda Coulter', url: 'https://github.com/erickoda' },
        { '@type': 'Person', name: 'Lorenzo Vicentin', url: 'https://github.com/iLorenzz' },
        { '@type': 'Person', name: 'Raphael Z. Cali', url: 'https://github.com/dino460' },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: 'Build a Computer',
      url: SITE_URL,
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
    {
      '@type': 'WebApplication',
      name: 'Build a Computer',
      url: `${SITE_URL}/build-pc`,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      description:
        'Get a complete, compatible gaming PC build from the games you play, your resolution, graphics quality and budget, backed by real benchmark data.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },
  ],
};

const Home = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      <LandingPage />
    </>
  );
};

export default Home;
