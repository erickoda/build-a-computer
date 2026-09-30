import BenchmarksPage from "@/src/features/benchmark/components/benchmarks-page";
import { baseOpenGraph } from "@/src/utils/seo";
import type { Metadata } from "next";

const description =
  "Search real gaming benchmarks and compare FPS across CPUs, GPUs, resolutions and graphics settings before you choose your next PC build.";

export const metadata: Metadata = {
  title: "Gaming Benchmarks",
  description,
  alternates: { canonical: "/benchmarks" },
  openGraph: { ...baseOpenGraph, url: "/benchmarks", title: "Gaming Benchmarks | Build a Computer", description },
  twitter: { title: "Gaming Benchmarks | Build a Computer", description },
};

const Benchmarks = () => {
  return (
  <BenchmarksPage />
  )
}

export default Benchmarks
