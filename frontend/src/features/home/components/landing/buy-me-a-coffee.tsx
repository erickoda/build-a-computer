'use client';

import { AMBER } from '../../utils/accents';
import { Reveal } from '../reveal';

// TODO: replace with the real Buy Me a Coffee page.
const BUY_ME_A_COFFEE_URL = 'https://buymeacoffee.com/your-username';

const RECEIPT = [
  { item: 'Hosting & database', note: 'kept online' },
  { item: 'Benchmark hardware', note: 'more runs' },
  { item: 'Three students', note: 'kept awake' },
];

export function BuyMeACoffee() {
  return (
    <section className="relative w-full border-t border-foreground/15">
      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-6 py-16 text-center sm:px-10 md:py-20">
        <Reveal className="flex flex-col items-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Support
          </p>
          <h2 className="mt-5 max-w-[20ch] font-sans text-3xl font-black leading-[0.95] tracking-tight text-balance text-foreground sm:text-5xl">
            Like the project? Buy us a coffee.
          </h2>
          <p className="mt-5 max-w-[46ch] font-sans text-[15px] leading-relaxed text-muted-foreground">
            Build a Computer is free and open source. If it helped you pick your
            next PC, a coffee keeps three students going.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-10 w-full max-w-sm">
          {/* Receipt card: zig-zag bottom edge cut with a mask. */}
          <div
            className="relative bg-foreground/4 px-7 pt-7 pb-10 text-left font-mono text-xs shadow-[0_30px_60px_-30px_rgba(0,0,0,0.5)] ring-1 ring-foreground/10 backdrop-blur-xl"
            style={{
              maskImage:
                'linear-gradient(black, black), conic-gradient(from -45deg at 50% 100%, black 90deg, transparent 0)',
              maskSize: '100% calc(100% - 8px), 16px 8px',
              maskPosition: 'top, bottom',
              maskRepeat: 'no-repeat, repeat-x',
              WebkitMaskImage:
                'linear-gradient(black, black), conic-gradient(from -45deg at 50% 100%, black 90deg, transparent 0)',
              WebkitMaskSize: '100% calc(100% - 8px), 16px 8px',
              WebkitMaskPosition: 'top, bottom',
              WebkitMaskRepeat: 'no-repeat, repeat-x',
            }}
          >
            <div className="flex items-baseline justify-between uppercase tracking-[0.14em] text-muted-foreground">
              <span>Order #001</span>
              <span>BAC</span>
            </div>

            <div className="my-5 border-t border-dashed border-foreground/20" />

            <ul className="flex flex-col gap-3">
              {RECEIPT.map((line) => (
                <li key={line.item} className="flex items-baseline gap-2">
                  <span className="text-foreground">{line.item}</span>
                  <span
                    aria-hidden
                    className="flex-1 translate-y-[-3px] border-b border-dotted border-foreground/25"
                  />
                  <span className="text-muted-foreground">{line.note}</span>
                </li>
              ))}
            </ul>

            <div className="my-5 border-t border-dashed border-foreground/20" />

            <div className="flex items-baseline justify-between uppercase tracking-[0.14em]">
              <span className="text-muted-foreground">Total</span>
              <span className={`text-base font-semibold ${AMBER.text}`}>
                1 × ☕
              </span>
            </div>

            <a
              href={BUY_ME_A_COFFEE_URL}
              target="_blank"
              rel="noreferrer"
              className="group mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-amber-400 px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-950 transition-[background-color,transform,box-shadow] duration-300 hover:scale-[1.02] hover:bg-amber-300 hover:shadow-[0_0_32px_rgba(236,168,56,0.45)] active:scale-[0.98]"
            >
              Buy us a coffee
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              >
                ↗
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
