'use client';

import {
  ChartBarIcon,
  CpuChipIcon,
  PuzzlePieceIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, CSSProperties, SVGProps } from 'react';
import { AMBER, BLUE, type Accent } from '../../utils/accents';
import { Reveal } from '../reveal';

const FEATURES: {
  title: string;
  description: string;
  accent: Accent;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
  {
    title: 'Backed by measured FPS',
    description:
      'Recommendations come from recorded benchmark runs — average, minimum and maximum FPS — not from spec sheets or guesswork.',
    accent: BLUE,
    icon: ChartBarIcon,
  },
  {
    title: 'Compatibility built in',
    description:
      'Socket, memory generation and power budget are checked for you, so every part in a build works with the others.',
    accent: BLUE,
    icon: PuzzlePieceIcon,
  },
  {
    title: 'Community benchmarks',
    description:
      'Signed-in users can submit their own runs. Every new benchmark makes the next recommendation more accurate.',
    accent: AMBER,
    icon: UsersIcon,
  },
  {
    title: 'Open hardware catalog',
    description:
      'Browse the CPUs, GPUs, boards, memory, storage and power supplies behind each build, along with the supported games.',
    accent: AMBER,
    icon: CpuChipIcon,
  },
];

export function Features() {
  return (
    <section className="relative w-full border-t border-foreground/15">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-10 sm:py-28">
        <Reveal className="flex flex-col items-center gap-6 text-center">
          <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
            [ Why use it ]
          </span>
          <h2 className="font-sans text-4xl font-extrabold leading-[0.95] tracking-tight text-balance text-foreground sm:text-6xl">
            Built on data, not hype.
          </h2>
        </Reveal>

        <ul className="mt-14 grid gap-4 sm:mt-20 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <li
              key={feature.title}
              style={{ '--accent': feature.accent.rgb } as CSSProperties}
            >
              <Reveal delay={(i % 2) * 100} className="h-full">
                <article className="group relative flex h-full flex-col gap-5 overflow-hidden rounded-[14px] border border-foreground/10 bg-linear-135 from-foreground/7 to-foreground/2 p-6 backdrop-blur-xl backdrop-saturate-150 transition-[border-color,background-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:border-foreground/25 sm:p-8">
                  {/* Accent glow in the badge's corner, on hover. */}
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                    style={{
                      background:
                        'radial-gradient(ellipse 55% 70% at 0% 0%, rgba(var(--accent),0.14), transparent 70%)',
                    }}
                  />

                  <span
                    aria-hidden
                    className="relative flex size-12 items-center justify-center rounded-full border border-foreground/15 text-muted-foreground transition-colors duration-300 group-hover:border-foreground/30 group-hover:text-[rgb(var(--accent))]"
                  >
                    <feature.icon className="size-5" />
                  </span>

                  <div className="relative flex flex-col gap-2">
                    <h3 className="font-sans text-lg font-bold text-foreground transition-colors duration-300 group-hover:text-[rgb(var(--accent))]">
                      {feature.title}
                    </h3>
                    <p className="font-mono text-[13px] leading-relaxed font-light text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
