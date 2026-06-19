'use client';

import { useEffect, useRef } from 'react';

// ─── Mote field ───────────────────────────────────────────────────────────────
// A small canvas animation: soft points of light drifting in slow gold/silver
// swirls. Pure canvas2D, no dependencies. Respects prefers-reduced-motion by
// rendering a single static frame instead of animating.

type Mote = {
  // Polar position around a slowly-shifting center, plus per-mote radius
  // noise so the swirl reads as organic rather than a perfect spiral.
  angle: number;
  radius: number;
  baseRadius: number;
  speed: number; // angular velocity
  drift: number; // radial breathing speed
  driftPhase: number;
  size: number;
  hue: 'gold' | 'silver';
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
  centerXDeviation: number;
  centerYDeviation: number;
};

const GOLD = { r: 212, g: 175, b: 110 };
const SILVER = { r: 206, g: 212, b: 222 };

function makeMotes(count: number, width: number, height: number): Mote[] {
  const motes: Mote[] = [];
  const maxRadius = Math.hypot(width, height) * 0.6;

  for (let i = 0; i < count; i++) {
    const baseRadius = Math.pow(Math.random(), 0.6) * maxRadius;
    motes.push({
      angle: Math.random() * Math.PI * 2,
      radius: baseRadius,
      baseRadius,
      speed:
        (Math.random() * 0.0006 + 0.00015) * (Math.random() < 0.5 ? 1 : -1),
      drift: Math.random() * 0.008 + 0.002,
      driftPhase: Math.random() * Math.PI * 2,
      size: Math.random() * 1.8 + 0.6,
      hue: Math.random() < 0.55 ? 'gold' : 'silver',
      opacity: Math.random() * 0.5 + 0.25,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.002 + 0.0008,
      centerXDeviation: 1 + Math.random(),
      centerYDeviation: 0.62 + Math.random(),
    });
  }
  return motes;
}

export function MoteField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let motes: Mote[] = [];
    let centerX = 0;
    let centerY = 0;
    let rafId = 0;
    let t = 0;

    function resize() {
      const parent = canvas!.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      centerX = width / 2;
      centerY = height / 2;

      const density = (width * height) / 2200;
      const count = Math.max(60, Math.min(420, Math.round(density)));
      motes = makeMotes(count, width, height);
    }

    function drawFrame() {
      ctx!.clearRect(0, 0, width, height);

      for (const m of motes) {
        if (!reduceMotion) {
          m.angle += m.speed;
          m.radius = m.baseRadius + Math.sin(t * m.drift + m.driftPhase) * 40;
        }

        const x = centerX + m.centerXDeviation + Math.cos(m.angle) * m.radius;
        const y =
          centerY + m.centerXDeviation + Math.sin(m.angle) * m.radius * 0.62; // slight ellipse for depth

        const twinkle = reduceMotion
          ? 1
          : 0.6 + 0.4 * Math.sin(t * m.twinkleSpeed + m.twinklePhase);
        const alpha = m.opacity * twinkle;
        const c = m.hue === 'gold' ? GOLD : SILVER;

        const glowRadius = m.size * 5;
        const gradient = ctx!.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);

        ctx!.fillStyle = gradient;
        ctx!.beginPath();
        ctx!.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx!.fill();

        // Bright core
        ctx!.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${Math.min(alpha * 1.6, 0.9)})`;
        ctx!.beginPath();
        ctx!.arc(x, y, m.size * 0.5, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    function loop() {
      t += 1;
      drawFrame();
      if (!reduceMotion) {
        rafId = requestAnimationFrame(loop);
      }
    }

    resize();
    loop();

    const handleResize = () => {
      cancelAnimationFrame(rafId);
      resize();
      if (reduceMotion) {
        drawFrame();
      } else {
        loop();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
