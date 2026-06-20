'use client';

import { MilkyWayField } from '@/src/components/milky-way-field';
import Link from 'next/link';
import { MoteField } from '../../../components/mote-field';
import { SplitFieldBackground } from './split-field';

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

      <SplitFieldBackground right={<MoteField />} left={<MilkyWayField />} />

      {/* Left: Build a Computer */}
      <Link
        href={'/build-pc'}
        type="button"
        className="group relative z-10 flex-1 flex flex-col items-center justify-center gap-6 px-8 transition-colors hover:backdrop-blur-[3px] active:bg-muted/10"
      >
        <div
          className={[
            'flex flex-col items-center gap-3 px-3 py-10 text-center rounded-lg',
            'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
            'group-hover:border-white/8 group-hover:bg-black/75',
            'group-hover:backdrop-blur-[50px]',
            'group-hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(110,175,212,0.25)]',
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
      </Link>

      {/* Divider */}
      {/*<div className="relative z-10 w-px bg-border" />*/}
      {/*<div
        className="relative z-15 h-full pointer-events-none"
        style={{
          width: 40,
          // transition: 'left 600ms cubic-bezier(0.4,0,0.2,1)',
          background: '#040404ff',
          // background:
          //   'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.65) 45%, rgba(0,0,0,0.65) 55%, transparent 100%)',
          filter: 'blur(10px)',
        }}
      />*/}

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
            'group-hover:border-white/8 group-hover:bg-black/75',
            'group-hover:backdrop-blur-[50px]',
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
      </Link>
    </div>
  );
}
