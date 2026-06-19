'use client';

import Link from 'next/link';
import { MoteField } from './mote-field';

export function LandingPage() {
  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-background">
      {/* Ambient base gradient — gives the motes a dark field to glow against,
          and a faint vignette so the corners stay calm. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(120,108,80,0.10), transparent 60%), linear-gradient(180deg, rgba(10,10,12,0.02), rgba(10,10,12,0.06))',
        }}
      />
      <MoteField />

      {/* Left: Build a Computer */}
      <Link
        href={''}
        type="button"
        className="group relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-8 transition-colors hover:backdrop-blur-[3px] active:bg-muted/10"
      >
        <div
          className={[
            'flex flex-col items-center gap-3 px-3 py-10 text-center rounded-lg',
            'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'group-hover:border-white/8 group-hover:bg-white/5',
            'group-hover:backdrop-blur-[20px]',
            'group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(212,175,110,0.25)]',
          ].join(' ')}
        >
          <h1 className="text-5xl font-black tracking-tight text-foreground">
            BUILD A
            <br />
            COMPUTER
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Find the right components for your gaming needs.
          </p>
        </div>
        {/*<div
          className={[
            'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground',
            'border border-white/15 bg-white/10 backdrop-blur-md backdrop-saturate-150',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_8px_rgba(0,0,0,0.08)]',
            'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'group-hover:border-white/30 group-hover:bg-white/20',
            'group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(212,175,110,0.25)]',
          ].join(' ')}
        >
          Enter <ArrowRightIcon className="size-3.5 ml-1" />
        </div>*/}
      </Link>

      {/* Divider */}
      <div className="relative z-10 w-px bg-border" />

      {/* Right: Search Benchmarks */}
      <Link
        href={'/benchmarks'}
        type="button"
        className="group relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-8 transition-colors hover:backdrop-blur-[3px] active:bg-muted/20"
      >
        <div
          className={[
            'flex flex-col items-center gap-3 px-3 py-10 text-center rounded-lg',
            'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'group-hover:border-white/8 group-hover:bg-white/5',
            'group-hover:backdrop-blur-[20px]',
            'group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(212,175,110,0.25)]',
          ].join(' ')}
        >
          <h1 className="text-5xl font-black tracking-tight text-foreground">
            SEARCH
            <br />
            BENCHMARKS
          </h1>
          <p className="text-sm text-muted-foreground max-w-xs">
            Compare performance across hardware configurations and games.
          </p>
        </div>
        {/*<div
          className={[
            'inline-flex h-9 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground',
            'border border-white/15 bg-white/10 backdrop-blur-md backdrop-saturate-150',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_1px_8px_rgba(0,0,0,0.08)]',
            'transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'group-hover:border-white/30 group-hover:bg-white/20',
            'group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(206,212,222,0.3)]',
          ].join(' ')}
        >
          Enter <ArrowRightIcon className="size-3.5 ml-1" />
        </div>*/}
      </Link>
    </div>
  );
}
