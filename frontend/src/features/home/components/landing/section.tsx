'use client';

import type { ReactNode } from 'react';
import { BLUE, type Accent } from '../../utils/accents';
import { Reveal } from '../reveal';

const SECTION_COUNT = 3;

export function Section({
  id,
  index,
  eyebrow,
  title,
  description,
  accent = BLUE,
  children,
}: {
  id?: string;
  index: number;
  eyebrow: string;
  title: string;
  description?: string;
  accent?: Accent;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="relative w-full scroll-mt-0 border-t border-foreground/15"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-[5fr_7fr] lg:gap-[8%]">
        <Reveal className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <span className="flex justify-between font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>
              {String(index).padStart(2, '0')} /{' '}
              {String(SECTION_COUNT).padStart(2, '0')}
            </span>
            <span className={accent.text}>{eyebrow}</span>
          </span>
          <h2 className="font-sans text-4xl font-normal leading-[0.95] tracking-tighter text-foreground sm:text-6xl">
            {title}
          </h2>
          {description && (
            <p className="max-w-md font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
        </Reveal>
        <div>{children}</div>
      </div>
    </section>
  );
}
