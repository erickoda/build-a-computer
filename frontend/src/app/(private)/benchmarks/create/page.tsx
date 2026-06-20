'use client';

import { CreateBenchmarkPage } from '@/src/features/benchmark/components/create-benchmarks-page';
import { useRouter } from 'next/navigation';

const CreateBenchmarks = () => {
  const router = useRouter();
  return <CreateBenchmarkPage onBack={() => router.push('/benchmarks')} />;
};

export default CreateBenchmarks;
