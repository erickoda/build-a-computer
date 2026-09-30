'use client';

import { Reveal } from '../reveal';

const AUTHORS = [
  {
    name: 'Erick Oda Coulter',
    focus: 'Gateway, authentication & frontend',
    github: 'erickoda',
  },
  {
    name: 'Lorenzo Vicentin',
    focus: 'Recommendation engine & benchmarks',
    github: 'iLorenzz',
  },
  {
    name: 'Raphael Z. Cali',
    focus: 'Frontend & benchmarks',
    github: 'dino460',
  },
];

function initials(name: string) {
  const parts = name.split(' ');
  return `${parts[0][0]}${parts[parts.length - 1][0]}`;
}

const CHROME_TEXT =
  'bg-[linear-gradient(170deg,#2b2f36_8%,#5d636c_46%,#8a9099_72%,#2b2f36_100%)] bg-clip-text text-transparent dark:bg-[linear-gradient(170deg,#f4f5f7_8%,#aeb4bd_46%,#6b7079_72%,#f4f5f7_100%)]';

export function Authors() {
  return (
    <section className="relative w-full border-t border-foreground/15">
      <div className="mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 md:py-32">
        <div className="relative md:pl-14">
          <span
            aria-hidden
            className="absolute top-1 left-0 hidden size-2.25 border border-foreground/30 bg-foreground/5 md:block"
          />

          <Reveal>
            <p className="mb-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              Authors
            </p>
            <h2 className="max-w-[24ch] font-sans text-3xl leading-[1.12] font-semibold tracking-[-0.015em] text-foreground md:text-[2.6rem]">
              Made by <span className={CHROME_TEXT}>three students.</span>
            </h2>
            <p className="mt-6 max-w-[52ch] font-sans text-[15px] leading-relaxed text-muted-foreground">
              Built as the final project for the Distributed Systems course at
              the University of São Paulo.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <ul className="mt-12 grid gap-px border-y border-foreground/15 bg-foreground/15 md:grid-cols-3">
              {AUTHORS.map((author) => (
                <li key={author.name} className="bg-background">
                  <a
                    href={`https://github.com/${author.github}`}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative flex h-full flex-col justify-between p-8 transition-colors duration-300 hover:bg-foreground/3 md:p-10"
                  >
                    <div>
                      <div className="flex items-baseline justify-between">
                        <span
                          aria-hidden
                          className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground"
                        >
                          {initials(author.name)}
                        </span>
                        <span
                          aria-hidden
                          className="font-mono text-[13px] text-muted-foreground transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-foreground"
                        >
                          →
                        </span>
                      </div>
                      <h3 className="mt-6 font-sans text-2xl font-semibold tracking-[-0.015em] text-foreground">
                        {author.name}
                      </h3>
                      <p className="mt-4 max-w-[36ch] font-sans text-[15px] leading-relaxed text-muted-foreground">
                        {author.focus}
                      </p>
                    </div>
                    <p className="mt-10 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground transition-colors group-hover:text-foreground">
                      @{author.github}
                    </p>

                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-linear-to-r from-foreground/20 via-foreground to-foreground/20 transition-transform duration-500 ease-out group-hover:scale-x-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
