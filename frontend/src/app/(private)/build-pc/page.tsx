import { BuildPcPage } from '@/src/features/build-pc/components/build-pc-page';
import { baseOpenGraph } from '@/src/utils/seo';
import type { Metadata } from 'next';

const description =
  'Pick your games, resolution, graphics quality and budget, and get a complete, compatible gaming PC build backed by real benchmark data.';

export const metadata: Metadata = {
  title: 'PC Build Configurator',
  description,
  alternates: { canonical: '/build-pc' },
  openGraph: {
    ...baseOpenGraph,
    url: '/build-pc',
    title: 'PC Build Configurator | Build a Computer',
    description,
  },
  twitter: { title: 'PC Build Configurator | Build a Computer', description },
};

const Build = () => {
  return <BuildPcPage />;
};

export default Build;
