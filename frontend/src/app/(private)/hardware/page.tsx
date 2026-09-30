import HardwarePage from "@/src/features/hardware/components/hardware-page";
import { baseOpenGraph } from "@/src/utils/seo";
import type { Metadata } from "next";

const description =
  "Explore the hardware catalog of CPUs, GPUs and other PC components, with the specs used to build compatible gaming PC recommendations.";

export const metadata: Metadata = {
  title: "Hardware Catalog",
  description,
  alternates: { canonical: "/hardware" },
  openGraph: { ...baseOpenGraph, url: "/hardware", title: "Hardware Catalog | Build a Computer", description },
  twitter: { title: "Hardware Catalog | Build a Computer", description },
};

const Hardware = () => {
  return (
    <HardwarePage />
  )
}

export default Hardware;
