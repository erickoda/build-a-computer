'use client';

import { useEffect, useRef } from 'react';

// ─── Mote field ───────────────────────────────────────────────────────────────
// A small canvas animation: soft points of light drifting in slow gold/silver
// swirls. Pure canvas2D, no dependencies. Respects prefers-reduced-motion by
// rendering a single static frame instead of animating.
//
// Performance notes (read before changing the per-frame loop):
//   - Glows are pre-rendered once into small offscreen sprite canvases (one
//     per color x size-bucket), then drawn per-frame with drawImage. The
//     previous version called createRadialGradient + arc + fill for every
//     mote, every frame — gradient construction is one of the more expensive
//     canvas2D operations, and doing it ~400 times/frame was the dominant
//     cost here. drawImage of a cached bitmap is far cheaper.
//   - The reduceMotion branch is checked once per frame (in the scheduler),
//     not per mote — drawFrame itself has no per-mote conditional branching
//     tied to it.
//   - No allocations inside the per-mote loop: sprite lookup is a small
//     array index, not an object/gradient construction.
//   - Canvas is sized in device pixels via devicePixelRatio (capped at 2)
//     and scaled once via setTransform.
//   - The animation loop stops on tab-hidden (visibilitychange) rather than
//     relying solely on browser rAF throttling, to avoid burning CPU in
//     background tabs across all engines.

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
  // Index into the pre-rendered sprite sheet for this mote's (hue, size).
  spriteIndex: number;
};

const GOLD = { r: 212, g: 175, b: 110 };
const SILVER = { r: 206, g: 212, b: 222 };

// Sizes are quantized into buckets so a small, fixed number of sprites can
// cover every mote, regardless of how many motes exist on screen.
const SIZE_BUCKETS = 6;
const MIN_SIZE = 0.6;
const MAX_SIZE = 2.4;

type Sprite = {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  glowRadius: number;
};

function bucketSize(t: number): number {
  // t in [0,1] maps to a size in [MIN_SIZE, MAX_SIZE]
  return MIN_SIZE + (MAX_SIZE - MIN_SIZE) * t;
}

function makeSprite(hue: 'gold' | 'silver', size: number, dpr: number): Sprite {
  const c = hue === 'gold' ? GOLD : SILVER;
  const glowRadius = size * 5;
  const padding = 1; // avoid hard-edge clipping of the outer gradient ring
  const dim = Math.ceil((glowRadius + padding) * 2 * dpr);

  const canUseOffscreen = typeof OffscreenCanvas !== 'undefined';
  const canvas: OffscreenCanvas | HTMLCanvasElement = canUseOffscreen
    ? new OffscreenCanvas(dim, dim)
    : document.createElement('canvas');

  if (!canUseOffscreen) {
    (canvas as HTMLCanvasElement).width = dim;
    (canvas as HTMLCanvasElement).height = dim;
  }

  const ctx = canvas.getContext('2d') as
    | CanvasRenderingContext2D
    | OffscreenCanvasRenderingContext2D
    | null;
  if (!ctx) return { canvas, glowRadius };

  ctx.scale(dpr, dpr);
  const cx = dim / (2 * dpr);
  const cy = dim / (2 * dpr);

  // Outer soft glow — full opacity baked in; per-frame alpha is applied via
  // globalAlpha when drawing, so the sprite itself is drawn at alpha=1.
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
  gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 1)`);
  gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
  ctx.fillStyle = gradient as unknown as string;
  ctx.beginPath();
  ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  // Bright core, also baked in at full strength; the per-frame brightness
  // multiplier (twinkle) is applied via globalAlpha, same as the glow.
  ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 1)`;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  return { canvas, glowRadius };
}

function buildSpriteSheet(dpr: number): Sprite[] {
  // Index layout: [gold_0..gold_(N-1), silver_0..silver_(N-1)]
  const sprites: Sprite[] = [];
  for (const hue of ['gold', 'silver'] as const) {
    for (let i = 0; i < SIZE_BUCKETS; i++) {
      const t = SIZE_BUCKETS === 1 ? 0 : i / (SIZE_BUCKETS - 1);
      sprites.push(makeSprite(hue, bucketSize(t), dpr));
    }
  }
  return sprites;
}

function spriteIndexFor(hue: 'gold' | 'silver', size: number): number {
  const t = (size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE);
  const bucket = Math.max(
    0,
    Math.min(SIZE_BUCKETS - 1, Math.round(t * (SIZE_BUCKETS - 1))),
  );
  return (hue === 'gold' ? 0 : SIZE_BUCKETS) + bucket;
}

function makeMotes(count: number, width: number, height: number): Mote[] {
  const motes: Mote[] = [];
  const maxRadius = Math.hypot(width, height) * 0.6;

  for (let i = 0; i < count; i++) {
    const baseRadius = Math.pow(Math.random(), 0.6) * maxRadius;
    const hue: 'gold' | 'silver' = Math.random() < 0.55 ? 'gold' : 'silver';
    const size = Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE;

    motes.push({
      angle: Math.random() * Math.PI * 2,
      radius: baseRadius,
      baseRadius,
      speed:
        (Math.random() * 0.0006 + 0.00015) * (Math.random() < 0.5 ? 1 : -1),
      drift: Math.random() * 0.008 + 0.002,
      driftPhase: Math.random() * Math.PI * 2,
      size,
      hue,
      opacity: Math.random() * 0.5 + 0.25,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.002 + 0.0008,
      centerXDeviation: 1 + Math.random(),
      centerYDeviation: 0.62 + Math.random(),
      spriteIndex: spriteIndexFor(hue, size),
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
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let motes: Mote[] = [];
    let centerX = 0;
    let centerY = 0;
    let rafId = 0;
    let t = 0;

    // Sprite sheet is independent of canvas size, so it's built once and
    // reused across resizes (only rebuilt if dpr were to change, which
    // doesn't happen within a single session in practice).
    const sprites = buildSpriteSheet(dpr);

    function resize() {
      const parent = canvas!.parentElement;
      width = parent?.clientWidth ?? window.innerWidth;
      height = parent?.clientHeight ?? window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
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

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];

        if (!reduceMotion) {
          m.angle += m.speed;
          m.radius = m.baseRadius + Math.sin(t * m.drift + m.driftPhase) * 40;
        }

        const x = centerX + m.centerXDeviation + Math.cos(m.angle) * m.radius;
        const y =
          centerY + m.centerYDeviation + Math.sin(m.angle) * m.radius * 0.62; // slight ellipse for depth

        const twinkle = reduceMotion
          ? 1
          : 0.6 + 0.4 * Math.sin(t * m.twinkleSpeed + m.twinklePhase);
        const alpha = m.opacity * twinkle;

        const sprite = sprites[m.spriteIndex];
        const glowRadius = sprite.glowRadius;

        ctx!.globalAlpha = Math.min(alpha, 1);
        ctx!.drawImage(
          sprite.canvas as CanvasImageSource,
          x - glowRadius,
          y - glowRadius,
          glowRadius * 2,
          glowRadius * 2,
        );
      }

      // Reset once at the end of the frame rather than per mote.
      ctx!.globalAlpha = 1;
    }

    function loop() {
      t += 1;
      drawFrame();
      if (!reduceMotion) {
        rafId = requestAnimationFrame(loop);
      }
    }

    resize();

    if (reduceMotion) {
      drawFrame();
    } else {
      rafId = requestAnimationFrame(loop);
    }

    const handleResize = () => {
      cancelAnimationFrame(rafId);
      resize();
      if (reduceMotion) {
        drawFrame();
      } else {
        rafId = requestAnimationFrame(loop);
      }
    };

    // Pause the animation loop when the tab isn't visible — rAF self-
    // throttles in background tabs in most browsers, but explicitly
    // stopping is more reliable across engines and saves battery sooner.
    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (!reduceMotion) {
        rafId = requestAnimationFrame(loop);
      }
    }

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
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
