'use client';

import { AMBER } from '../../utils/accents';
import { Reveal } from '../reveal';

// TODO: replace with the real Buy Me a Coffee page.
const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/your-username';

const AMBER_TEXT =
  'bg-[linear-gradient(170deg,#b45309_8%,#d97706_50%,#92400e_100%)] bg-clip-text text-transparent dark:bg-[linear-gradient(170deg,#fde68a_8%,#f5b04a_46%,#c2771c_72%,#fde68a_100%)]';

export function BuyMeACoffee() {
  return (
    <section className="relative w-full overflow-hidden border-t border-foreground/15">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 60% at 85% 100%, rgba(${AMBER.rgb},0.10), transparent 70%)`,
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 md:py-32">
        <div className="relative md:pl-14">
          <span
            aria-hidden
            className="absolute top-1 left-0 hidden size-2.25 border border-amber-500/50 bg-amber-500/10 md:block"
          />

          <Reveal>
            <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Support
            </p>
            <h2 className="max-w-[20ch] font-sans text-3xl leading-[1.12] font-semibold tracking-[-0.015em] text-foreground md:text-[2.6rem]">
              Like the project?{' '}
              <span className={AMBER_TEXT}>Buy us a coffee.</span>
            </h2>
            <p className="mt-6 max-w-[52ch] font-sans text-[15px] leading-relaxed text-muted-foreground">
              Build a Computer is free and open source. If it helped you pick
              your next PC, a coffee keeps three students going.
            </p>

            <a
              href={BUY_ME_A_COFFEE_URL}
              target="_blank"
              rel="noreferrer"
              className="group mt-10 inline-flex items-center gap-3 rounded-full bg-amber-400 px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950 transition-[background-color,transform] duration-300 hover:scale-[1.02] hover:bg-amber-300 active:scale-[0.98]"
            >
              <span aria-hidden className="text-base leading-none">
                ☕
              </span>
              Buy us a coffee
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              >
                ↗
              </span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
