'use client';

import { eraseLayer } from '@/src/components/canvas-layer-driver';
import { milkyWayLayer } from '@/src/components/milky-way-field';
import { moteLayer } from '@/src/components/mote-field';
import Link from 'next/link';
import { SplitFieldBackground } from './split-field';

export function LandingPage() {
  return (
    <div className="relative flex h-screen min-h-screen w-full flex-col overflow-hidden bg-background sm:flex-row">
      {/* Ambient base gradient — gives the motes a dark field to glow against,
          and a faint vignette so the corners stay calm. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(120,108,80,0.10), transparent 60%), linear-gradient(180deg, rgba(10,10,12,0.02), rgba(10,10,12,0.06))',
        }}
      />

      <SplitFieldBackground
        right={eraseLayer(moteLayer)}
        left={eraseLayer(milkyWayLayer)}
      />

      {/* Left: Build a Computer */}
      <Link
        href={'/build-pc'}
        type="button"
        className="group relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-4 sm:px-8 transition-colors hover:backdrop-blur-[3px] active:bg-muted/10"
      >
        <div
          className={[
            'flex flex-col items-center gap-3 px-3 py-8 sm:py-10 text-center rounded-lg',
            'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'group-hover:border-black/8 group-hover:bg-white/75 dark:group-hover:border-white/8 dark:group-hover:bg-black/75',
            'group-hover:backdrop-blur-[50px]',
            'group-hover:shadow-[inset_0_1px_0_rgba(0,0,0,0.06),0_2px_16px_rgba(110,175,212,0.30)]',
            'dark:group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(110,175,212,0.25)]',
            ,
          ].join(' ')}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            BUILD A
            <br />
            COMPUTER
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Find the right components for your gaming needs.
          </p>
        </div>
      </Link>

      <div
        className="relative z-15 pointer-events-none h-px w-full sm:h-full sm:w-20"
        style={{
          background: 'light-dark(#eae9e8f0, #040404f0)',
          filter: 'blur(20px)',
        }}
      />

      {/* Right: Search Benchmarks */}
      <Link
        href={'/benchmarks'}
        type="button"
        className="group relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-4 sm:px-8 transition-colors hover:backdrop-blur-[3px] active:bg-muted/20"
      >
        <div
          className={[
            'flex flex-col items-center gap-3 px-3 py-8 sm:py-10 text-center rounded-lg',
            'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'group-hover:border-black/8 group-hover:bg-white/75 dark:group-hover:border-white/8 dark:group-hover:bg-black/75',
            'group-hover:backdrop-blur-[50px]',
            'group-hover:shadow-[inset_0_1px_0_rgba(0,0,0,0.06),0_2px_16px_rgba(212,175,110,0.30)]',
            'dark:group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(212,175,110,0.25)]',
            ,
          ].join(' ')}
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground">
            SEARCH
            <br />
            BENCHMARKS
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Compare performance across hardware configurations and games.
          </p>
        </div>
      </Link>
    </div>
  );
}
