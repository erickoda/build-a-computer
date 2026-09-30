'use client';

import { Reveal } from '../reveal';
import { Row } from './row';
import { Section } from './section';

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
    <Section
      id="how-it-works"
      index={1}
      eyebrow="How it works"
      title="Four answers. One build."
      description="Tell us what you play and how you want it to look. We work out the hardware from real benchmark data."
    >
      <ol className="border-b border-foreground/15">
        {STEPS.map((step, i) => (
          <li key={step.title}>
            <Reveal delay={i * 80}>
              <Row
                marker={
                  <span className="transition-colors duration-500 group-hover:text-sky-600 dark:group-hover:text-sky-300">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                }
              >
                <h3 className="text-lg text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </Row>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
