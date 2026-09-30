'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AMBER,
  BLUE,
  DOT_GRID,
  DOT_GRID_FADE,
  type Accent,
} from '../utils/accents';
import { BenchmarkChartScene } from './benchmark-chart-scene';
import { LandingSections } from './landing/landing-sections';
import { PcModelScene } from './pc-model-scene';

// Fades all four edges of the bleeding canvas. The model sits inside the
// middle ~60%, so only the glow falloff is touched.
const EDGE_FADE =
  'linear-gradient(to right, transparent, black 18%, black 82%, transparent), linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)';

export function LandingPage() {
  return (
    <main className="relative w-full bg-background">
      <Hero />
      <LandingSections />
    </main>
  );
}

function Hero() {
  return (
    <section
      className={[
        'relative flex h-screen min-h-screen w-full flex-col overflow-hidden bg-background sm:flex-row',
        '[&:has(>a:hover)>a:not(:hover)]:opacity-55',
      ].join(' ')}
    >

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 text-foreground/10"
        style={{
          backgroundImage: DOT_GRID,
          backgroundSize: '22px 22px',
          maskImage: DOT_GRID_FADE,
          WebkitMaskImage: DOT_GRID_FADE,
        }}
      />

      <Panel
        href="/build-pc"
        index="01"
        label="Configurator"
        title={['BUILD A', 'COMPUTER']}
        description="Find the right components for your gaming needs."
        cta="Start building"
        accent={BLUE}
        scene={<PcModelScene />}
      />

      <Divider />

      <Panel
        href="/benchmarks"
        index="02"
        label="Benchmarks"
        title={['SEARCH', 'BENCHMARKS']}
        description="Compare performance across hardware configurations and games."
        cta="Explore data"
        accent={AMBER}
        scene={<BenchmarkChartScene />}
      />

      <ScrollCue />
    </section>
  );
}

type PanelProps = {
  href: string;
  index: string;
  label: string;
  title: [string, string];
  description: string;
  cta: string;
  accent: Accent;
  scene: ReactNode;
};

function Panel({
  href,
  index,
  label,
  title,
  description,
  cta,
  accent,
  scene,
}: PanelProps) {
  return (
    <Link
      href={href}
      className="group relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 py-6 outline-none transition-opacity duration-700 sm:gap-8 sm:px-10 sm:py-16"
    >
      {/* Accent glow behind the model; blooms on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 transition-opacity duration-1000 group-hover:opacity-100 group-focus-visible:opacity-100"
        style={{
          background: `radial-gradient(ellipse 55% 45% at 50% 42%, rgba(${accent.rgb},0.16), transparent 70%)`,
        }}
      />

      {/* Model — sized to a shared square so both sides carry equal weight. */}
      <div
        aria-hidden
        className="pointer-events-none relative min-h-0 w-full sm:aspect-square max-w-104 flex-1 opacity-80 transition-[opacity,transform] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:opacity-100 sm:max-h-104 sm:flex-none"
      >
        {/* The canvas bleeds past the box so glows have room to fall off,
            and the mask fades whatever reaches its edge. The scenes widen
            their fit margin by the same factor to keep the model size. */}
        <div
          className="absolute inset-[-30%]"
          style={{
            maskImage: EDGE_FADE,
            WebkitMaskImage: EDGE_FADE,
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
        >
          {scene}
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-3 text-center">
        <span
          className={`flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] ${accent.text}`}
        >
          <span
            className="size-1.5 rounded-full"
            style={{
              background: `rgb(${accent.rgb})`,
              boxShadow: `0 0 8px rgba(${accent.rgb},0.9)`,
            }}
          />
          {index} — {label}
        </span>

        <h1 className="text-3xl font-black leading-[0.95] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          {title[0]}
          <br />
          {title[1]}
        </h1>

        <p className="hidden max-w-xs text-sm text-muted-foreground sm:block">
          {description}
        </p>

        <span
          className={[
            'mt-1 inline-flex items-center gap-2 rounded-full border border-foreground/15 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-foreground/80',
            'transition-all duration-500 group-hover:bg-foreground/5 group-hover:text-foreground',
            'group-focus-visible:ring-2 group-focus-visible:ring-foreground/40',
            accent.border,
          ].join(' ')}
        >
          {cta}
          <span
            aria-hidden
            className="transition-transform duration-500 group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

function Divider() {
  return (
    <div
      aria-hidden
      className="pointer-events-none relative z-20 flex items-center justify-center"
    >
      <div className="absolute h-px w-2/3 bg-linear-to-r from-transparent via-foreground/15 to-transparent sm:h-2/3 sm:w-px sm:bg-linear-to-b" />
      <span className="relative rounded-full border border-foreground/15 bg-background px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
        or
      </span>
    </div>
  );
}

function ScrollCue() {
  return (
    <div className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 sm:bottom-6">
      <a
        href="#how-it-works"
        className="flex flex-col items-center gap-1 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
      >
        <span className="hidden sm:block">Learn more</span>
        <span aria-hidden className="motion-safe:animate-bounce">
          ↓
        </span>
        <span className="sr-only sm:hidden">Learn more</span>
      </a>
    </div>
  );
}
