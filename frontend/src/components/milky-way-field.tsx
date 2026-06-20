'use client';

import {
  CanvasLayer,
  CanvasLayerDriver,
  eraseLayer,
} from './canvas-layer-driver';

// ─── Galaxy field ─────────────────────────────────────────────────────────────
// A top-down view of a spiral galaxy: a dense bright core and a handful of
// logarithmic spiral arms, each populated by particles that orbit the center
// and leave a short tapering trail along their direction of travel.
//
// This is now a CanvasLayer (setup + draw) consumed by CanvasLayerDriver —
// see canvas-layer-driver.tsx for why (single shared canvas + rAF loop when
// running alongside other layers like MoteField, instead of each field
// owning its own canvas/loop and drifting out of frame-lock with the other).
//
// Performance notes (unchanged from the standalone version):
//   - No per-particle history arrays. Trails are an illusion created by
//     painting a translucent black rectangle over the whole canvas each
//     frame before drawing new particle positions.
//   - Each particle's path is a closed-form function of time, so advancing
//     it is a few multiplications — no physics integration, no per-frame
//     allocation (head/tail scratch points are reused across particles).
//   - Particles are drawn as a short stroked line with a gradient stroke
//     for the taper, rather than many overlapping circles.

type Particle = {
  armIndex: number;
  baseRadius: number;
  baseAngle: number;
  angularSpeed: number;
  size: number;
  brightness: number;
  hueMix: number;
  wobble: number;
  wobblePhase: number;
};

const ARM_COUNT = 4;
const ARM_TIGHTNESS = 0.28;
const CORE_FRACTION = 0.12;

const CORE_COLOR = { r: 255, g: 244, b: 222 };
const ARM_COLOR = { r: 158, g: 190, b: 255 };

type GalaxyState = {
  particles: Particle[];
  centerX: number;
  centerY: number;
  maxRadius: number;
  // Reused scratch objects to avoid per-frame allocation in the hot loop.
  head: { x: number; y: number };
  tail: { x: number; y: number };
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function makeParticles(count: number, maxRadius: number): Particle[] {
  const particles: Particle[] = [];
  const coreCount = Math.round(count * CORE_FRACTION);

  for (let i = 0; i < count; i++) {
    const isCore = i < coreCount;

    const radius = isCore
      ? Math.random() * maxRadius * 0.12
      : maxRadius * (0.1 + 0.9 * Math.sqrt(Math.random()));

    const armIndex = Math.floor(Math.random() * ARM_COUNT);
    const armBase = (armIndex / ARM_COUNT) * Math.PI * 2;

    const scatter = (Math.random() - 0.5) * 0.55;
    const spiralOffset = Math.log(radius + 1) / ARM_TIGHTNESS;
    const baseAngle = armBase + spiralOffset + scatter;

    const speedFalloff = 1 / Math.pow(radius / (maxRadius * 0.3) + 1, 0.7);
    const direction = Math.random() < 0.5 ? 1 : -1;
    const angularSpeed =
      direction * speedFalloff * 0.00009 * (isCore ? 1.6 : 1);

    particles.push({
      armIndex,
      baseRadius: radius,
      baseAngle,
      angularSpeed,
      size: isCore ? Math.random() * 1.4 + 0.8 : Math.random() * 1.1 + 0.4,
      brightness: isCore
        ? Math.random() * 0.4 + 0.6
        : Math.random() * 0.55 + 0.25,
      hueMix: isCore ? Math.random() * 0.3 : Math.random() * 0.7 + 0.3,
      wobble: Math.random() * 6 + 2,
      wobblePhase: Math.random() * Math.PI * 2,
    });
  }

  return particles;
}

export const milkyWayLayer: CanvasLayer<GalaxyState> = {
  setup(ctx, size) {
    const centerX = size.width / 2;
    const centerY = size.height / 2;
    const maxRadius = Math.hypot(size.width, size.height) * 0.42;

    const density = (size.width * size.height) / 2600;
    const count = Math.max(250, Math.min(1600, Math.round(density)));

    // This layer paints its own opaque base, since it's designed to sit at
    // the bottom of the stack — establishes a dark backdrop other layers
    // (e.g. MoteField) can render on top of.
    ctx.fillStyle = '#05050a';
    ctx.fillRect(0, 0, size.width, size.height);

    return {
      particles: makeParticles(count, maxRadius),
      centerX,
      centerY,
      maxRadius,
      head: { x: 0, y: 0 },
      tail: { x: 0, y: 0 },
    };
  },

  draw(ctx, state, size, elapsed, reduceMotion) {
    // Fade previous frame toward black instead of a hard clear — this
    // produces the tapering trail behind each particle. Note: this fade
    // also dims anything drawn by an earlier layer in the stack, so if
    // another opaque/background layer is meant to sit *under* this one,
    // put this layer first, not after it.
    ctx.fillStyle = 'rgba(5, 5, 10, 0.16)';
    ctx.fillRect(0, 0, size.width, size.height);

    ctx.lineCap = 'round';

    const { head, tail } = state;

    for (let i = 0; i < state.particles.length; i++) {
      const p = state.particles[i];

      const angle = p.baseAngle + p.angularSpeed * elapsed;
      const radius =
        p.baseRadius + Math.sin(elapsed * 0.00025 + p.wobblePhase) * p.wobble;

      head.x = state.centerX + Math.cos(angle) * radius;
      head.y = state.centerY + Math.sin(angle) * radius * 0.55;

      const trailAngle = angle - p.angularSpeed * 90;
      tail.x = state.centerX + Math.cos(trailAngle) * radius;
      tail.y = state.centerY + Math.sin(trailAngle) * radius * 0.55;

      const c = {
        r: lerp(CORE_COLOR.r, ARM_COLOR.r, p.hueMix),
        g: lerp(CORE_COLOR.g, ARM_COLOR.g, p.hueMix),
        b: lerp(CORE_COLOR.b, ARM_COLOR.b, p.hueMix),
      };

      const twinkle = reduceMotion
        ? 1
        : 0.75 + 0.25 * Math.sin(elapsed * 0.002 + p.wobblePhase * 3);
      const alpha = p.brightness * twinkle;

      const gradient = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
      gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
      gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(tail.x, tail.y);
      ctx.lineTo(head.x, head.y);
      ctx.stroke();

      if (p.brightness > 0.7) {
        ctx.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${Math.min(alpha * 1.3, 1)})`;
        ctx.beginPath();
        ctx.arc(head.x, head.y, p.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  },
};

// ─── Standalone usage ─────────────────────────────────────────────────────────
// Kept for any page that wants *only* the galaxy field with no other layers.

const STANDALONE_LAYERS = [eraseLayer(milkyWayLayer)];

export function MilkyWayField() {
  return <CanvasLayerDriver layers={STANDALONE_LAYERS} />;
}
