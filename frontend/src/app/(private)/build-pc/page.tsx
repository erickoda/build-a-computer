'use client';

import { BuildPcPage } from '@/src/features/build-pc/components/build-pc-page';
import { useRouter } from 'next/navigation';

const Build = () => {
  const router = useRouter();
  return <BuildPcPage onBack={() => router.back()} />;
};

export default Build;
