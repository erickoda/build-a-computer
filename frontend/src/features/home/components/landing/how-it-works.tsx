'use client';

import { BLUE } from '../../utils/accents';
import { Reveal } from '../reveal';

const STEPS = [
  {
    title: 'Pick your games',
    description:
      'Choose one or more titles from the catalog. The build is sized for the most demanding one.',
  },
  {
    title: 'Set a resolution',
    description: '1080p, 1440p or 4K — whatever your monitor actually runs.',
  },
  {
    title: 'Choose graphics quality',
    description:
      'Low, Medium, High or Ultra. Each level maps to real benchmark runs at that preset.',
  },
  {
    title: 'Set your budget',
    description:
      'Drag the slider to your price ceiling and get complete builds that fit under it.',
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative w-full scroll-mt-0 border-t border-foreground/15"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-20 sm:px-10 sm:py-28 lg:grid-cols-[5fr_7fr] lg:gap-[8%]">
        <Reveal className="flex flex-col gap-6 lg:sticky lg:top-24 lg:self-start">
          <span className="flex justify-between font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            <span>xx / xx</span>
            <span className={BLUE.text}>How it works</span>
          </span>
          <h2 className="font-sans text-4xl font-normal leading-[0.95] tracking-tighter text-foreground sm:text-6xl">
            Four answers. One build.
          </h2>
          <p className="max-w-md font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
            Tell us what you play and how you want it to look. We work out the
            hardware from real benchmark data.
          </p>
        </Reveal>

        <ol className="border-b border-foreground/15">
          {STEPS.map((step, i) => (
            <li key={step.title}>
              <Reveal delay={i * 80}>
                <div className="group grid grid-cols-[4rem_1fr] items-baseline gap-4 border-t border-foreground/15 py-6 sm:grid-cols-[5rem_1fr]">
                  <span className="font-mono text-xs text-muted-foreground transition-colors duration-500 group-hover:text-sky-600 dark:group-hover:text-sky-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="font-sans">
                    <h3 className="text-lg text-foreground">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
