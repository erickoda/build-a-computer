'use client';

import {
  CanvasLayer,
  CanvasLayerDriver,
  eraseLayer,
} from './canvas-layer-driver';

// ─── Mote field ───────────────────────────────────────────────────────────────
// Soft points of light drifting in slow gold/silver swirls. Pure canvas2D,
// no dependencies.
//
// This is now a CanvasLayer (setup + draw) consumed by CanvasLayerDriver,
// rather than owning its own canvas/rAF loop — see canvas-layer-driver.tsx
// for why: running this stacked with another field (e.g. MilkyWayField) on
// separate canvases/loops duplicates resize/visibility/dpr bookkeeping and
// drops frame-lock between the two animations. Sharing one driver fixes both.
//
// Performance notes (unchanged from the standalone version):
//   - Glows are pre-rendered once into small offscreen sprite canvases (one
//     per color x size-bucket), then drawn per-frame with drawImage —
//     avoids constructing a radial gradient per mote per frame.
//   - No allocations inside the per-mote draw loop: sprite lookup is a
//     small array index.
//   - The animation loop (now owned by the driver) stops on tab-hidden.

type Mote = {
  angle: number;
  radius: number;
  baseRadius: number;
  speed: number;
  drift: number;
  driftPhase: number;
  size: number;
  hue: 'gold' | 'silver';
  opacity: number;
  twinklePhase: number;
  twinkleSpeed: number;
  centerXDeviation: number;
  centerYDeviation: number;
  spriteIndex: number;
};

const GOLD = { r: 212, g: 175, b: 110 };
const SILVER = { r: 206, g: 212, b: 222 };

const SIZE_BUCKETS = 6;
const MIN_SIZE = 0.6;
const MAX_SIZE = 2.4;

type Sprite = {
  canvas: OffscreenCanvas | HTMLCanvasElement;
  glowRadius: number;
};

type MoteState = {
  motes: Mote[];
  sprites: Sprite[];
  centerX: number;
  centerY: number;
  t: number;
};

function bucketSize(t: number): number {
  return MIN_SIZE + (MAX_SIZE - MIN_SIZE) * t;
}

function makeSprite(hue: 'gold' | 'silver', size: number, dpr: number): Sprite {
  const c = hue === 'gold' ? GOLD : SILVER;
  const glowRadius = size * 5;
  const padding = 1;
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

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius);
  gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 1)`);
  gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
  ctx.fillStyle = gradient as unknown as string;
  ctx.beginPath();
  ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, 1)`;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2);
  ctx.fill();

  return { canvas, glowRadius };
}

function buildSpriteSheet(dpr: number): Sprite[] {
  const sprites: Sprite[] = [];
  for (const hue of ['gold', 'silver'] as const) {
    for (let i = 0; i < SIZE_BUCKETS; i++) {
      const t = i / Math.max(SIZE_BUCKETS - 1, 1);
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

// Sprite sheets only depend on dpr, not on canvas size — cache per dpr value
// across setup() calls (which fire on every resize) so resizing doesn't
// rebuild sprites unnecessarily. In practice dpr is constant for a session,
// so this is effectively a one-time build.
const spriteCache = new Map<number, Sprite[]>();

function getSpritesFor(dpr: number): Sprite[] {
  let sprites = spriteCache.get(dpr);
  if (!sprites) {
    sprites = buildSpriteSheet(dpr);
    spriteCache.set(dpr, sprites);
  }
  return sprites;
}

export const moteLayer: CanvasLayer<MoteState> = {
  setup(_ctx, size, dpr) {
    const density = (size.width * size.height) / 2200;
    const count = Math.max(60, Math.min(420, Math.round(density)));

    return {
      motes: makeMotes(count, size.width, size.height),
      sprites: getSpritesFor(dpr),
      centerX: size.width / 2,
      centerY: size.height / 2,
      t: 0,
    };
  },

  draw(ctx, state, _size, _elapsed, reduceMotion) {
    // This layer does NOT clear/repaint its own region itself — it only
    // draws motes additively. That's safe in two cases:
    //   1. Stacked, on top of a layer that already repainted the whole
    //      canvas this frame (e.g. milkyWayLayer's fade-to-black), which
    //      incidentally clears whatever this layer drew last frame too.
    //   2. Given a viewport (e.g. side-by-side via SplitFieldBackground),
    //      in which case the driver clears this layer's own region before
    //      calling draw, since this layer doesn't declare paintsOwnBase.
    //      See CanvasLayer.paintsOwnBase in canvas-layer-driver.tsx.
    // Without one of those two, motes would accumulate frame over frame
    // with nothing ever erasing the previous frame's draws.
    state.t += 1;

    for (let i = 0; i < state.motes.length; i++) {
      const m = state.motes[i];

      if (!reduceMotion) {
        m.angle += m.speed;
        m.radius =
          m.baseRadius + Math.sin(state.t * m.drift + m.driftPhase) * 40;
      }

      const x =
        state.centerX + m.centerXDeviation + Math.cos(m.angle) * m.radius;
      const y =
        state.centerY +
        m.centerYDeviation +
        Math.sin(m.angle) * m.radius * 0.62;

      const twinkle = reduceMotion
        ? 1
        : 0.6 + 0.4 * Math.sin(state.t * m.twinkleSpeed + m.twinklePhase);
      const alpha = m.opacity * twinkle;

      const sprite = state.sprites[m.spriteIndex];
      const glowRadius = sprite.glowRadius;

      ctx.globalAlpha = Math.min(alpha, 1);
      ctx.drawImage(
        sprite.canvas as CanvasImageSource,
        x - glowRadius,
        y - glowRadius,
        glowRadius * 2,
        glowRadius * 2,
      );
    }

    ctx.globalAlpha = 1;
  },
};

// ─── Standalone usage ─────────────────────────────────────────────────────────
// Kept for any page that wants *only* the mote field with no other layers.
// Mounts the shared driver with a clear-step layer plus the mote layer,
// since there's no opaque base layer underneath to paint over old frames.

const clearLayer: CanvasLayer<null> = {
  setup() {
    return null;
  },
  draw(ctx, _state, size) {
    ctx.clearRect(0, 0, size.width, size.height);
  },
};

const STANDALONE_LAYERS = [eraseLayer(clearLayer), eraseLayer(moteLayer)];

export function MoteField() {
  return <CanvasLayerDriver layers={STANDALONE_LAYERS} />;
}
