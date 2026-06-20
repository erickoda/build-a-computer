'use client';

import { useEffect, useRef } from 'react';

// ─── Galaxy field ─────────────────────────────────────────────────────────────
// A top-down view of a spiral galaxy: a dense bright core and a handful of
// logarithmic spiral arms, each populated by particles that orbit the center
// and leave a short tapering trail along their direction of travel.
//
// Performance notes (read before changing the per-frame loop):
//   - No per-particle history arrays. Trails are an illusion created by
//     painting a translucent black rectangle over the whole canvas each
//     frame before drawing new particle positions — same trick used for
//     comet/star-field shaders. This makes trail cost O(1) instead of
//     O(particles × trail length).
//   - Each particle's path is a closed-form function of time (angle + radius
//     from fixed per-particle constants), so advancing it is a few
//     multiplications — no physics integration, no per-frame allocation.
//   - Particles are drawn as a short stroked line (head -> just-behind-head)
//     with a gradient stroke for the taper, rather than many overlapping
//     circles, keeping draw calls low even at high particle counts.
//   - Canvas is sized in device pixels via devicePixelRatio (capped at 2) and
//     scaled once via setTransform, avoiding per-draw scale math.
//   - Respects prefers-reduced-motion: renders one static frame and stops.

type Particle = {
  armIndex: number;
  baseRadius: number; // distance from center at t=0, in px (pre-resize-scaled)
  baseAngle: number; // angle offset along the arm at t=0
  angularSpeed: number; // radians/ms, inner particles orbit faster (Keplerian-ish falloff)
  size: number; // stroke width at the head
  brightness: number; // 0..1 overall opacity multiplier
  hueMix: number; // 0..1, blends between core-white and arm-blue
  wobble: number; // small per-particle phase for subtle radius breathing
  wobblePhase: number;
};

const ARM_COUNT = 4;
const ARM_TIGHTNESS = 0.28; // smaller = tighter spiral winding
const CORE_FRACTION = 0.12; // fraction of particles treated as the dense core

const CORE_COLOR = { r: 255, g: 244, b: 222 }; // warm white core
const ARM_COLOR = { r: 158, g: 190, b: 255 }; // cool blue-white arm stars

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function makeParticles(count: number, maxRadius: number): Particle[] {
  const particles: Particle[] = [];
  const coreCount = Math.round(count * CORE_FRACTION);

  for (let i = 0; i < count; i++) {
    const isCore = i < coreCount;

    // Radius distribution: core particles cluster near center; arm particles
    // spread out with a sqrt bias so density falls off naturally outward.
    const radius = isCore
      ? Math.random() * maxRadius * 0.12
      : maxRadius * (0.1 + 0.9 * Math.sqrt(Math.random()));

    const armIndex = Math.floor(Math.random() * ARM_COUNT);
    const armBase = (armIndex / ARM_COUNT) * Math.PI * 2;

    // Logarithmic spiral: angle offset grows with ln(radius). Particles
    // within an arm get a small random scatter so the arm has thickness
    // rather than being a perfect 1px curve.
    const scatter = (Math.random() - 0.5) * 0.55;
    const spiralOffset = Math.log(radius + 1) / ARM_TIGHTNESS;
    const baseAngle = armBase + spiralOffset + scatter;

    // Inner particles orbit faster than outer ones (rough differential
    // rotation, purely for visual plausibility — not real Keplerian math).
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

export function MilkyWayField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let centerX = 0;
    let centerY = 0;
    let maxRadius = 0;
    let rafId = 0;
    let lastTime = 0;

    // Reused scratch object to avoid per-frame allocation in the hot loop.
    const head = { x: 0, y: 0 };
    const tail = { x: 0, y: 0 };

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
      maxRadius = Math.hypot(width, height) * 0.42;

      // Density target tuned for canvas2D line-strokes: this stays smooth
      // well past 1500 particles on a mid-range laptop GPU/CPU.
      const density = (width * height) / 5000;
      const count = Math.max(250, Math.min(1600, Math.round(density)));
      particles = makeParticles(count, maxRadius);

      // Opaque black base so the very first fade-rect has something to
      // blend against (otherwise the first frame would show old page
      // content for a flash on transparent canvases).
      ctx!.fillStyle = '#05050a';
      ctx!.fillRect(0, 0, width, height);
    }

    function drawFrame(elapsed: number) {
      // Fade previous frame toward black instead of a hard clear — this is
      // what produces the tapering trail behind each particle for free.
      ctx!.fillStyle = 'rgba(5, 5, 10, 0.16)';
      ctx!.fillRect(0, 0, width, height);

      ctx!.lineCap = 'round';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const angle = p.baseAngle + p.angularSpeed * elapsed;
        const radius =
          p.baseRadius + Math.sin(elapsed * 0.00025 + p.wobblePhase) * p.wobble;

        // Slight ellipse (y *= 0.55) sells the "viewed from above but with
        // a touch of tilt" read, which looks less flat than a perfect circle.
        head.x = centerX + Math.cos(angle) * radius;
        head.y = centerY + Math.sin(angle) * radius * 0.55;

        // Tail point: same particle, a hair earlier in time, i.e. slightly
        // behind it along its own orbit. Cheap to compute, no history needed.
        const trailAngle = angle - p.angularSpeed * 90;
        tail.x = centerX + Math.cos(trailAngle) * radius;
        tail.y = centerY + Math.sin(trailAngle) * radius * 0.55;

        const c = {
          r: lerp(CORE_COLOR.r, ARM_COLOR.r, p.hueMix),
          g: lerp(CORE_COLOR.g, ARM_COLOR.g, p.hueMix),
          b: lerp(CORE_COLOR.b, ARM_COLOR.b, p.hueMix),
        };

        const twinkle = reduceMotion
          ? 1
          : 0.75 + 0.25 * Math.sin(elapsed * 0.002 + p.wobblePhase * 3);
        const alpha = p.brightness * twinkle;

        const gradient = ctx!.createLinearGradient(
          tail.x,
          tail.y,
          head.x,
          head.y,
        );
        gradient.addColorStop(0, `rgba(${c.r}, ${c.g}, ${c.b}, 0)`);
        gradient.addColorStop(1, `rgba(${c.r}, ${c.g}, ${c.b}, ${alpha})`);

        ctx!.strokeStyle = gradient;
        ctx!.lineWidth = p.size;
        ctx!.beginPath();
        ctx!.moveTo(tail.x, tail.y);
        ctx!.lineTo(head.x, head.y);
        ctx!.stroke();

        // Bright point at the head for particles near the core — a small
        // touch that makes the center read as dense and luminous.
        if (p.brightness > 0.7) {
          ctx!.fillStyle = `rgba(${c.r}, ${c.g}, ${c.b}, ${Math.min(alpha * 1.3, 1)})`;
          ctx!.beginPath();
          ctx!.arc(head.x, head.y, p.size * 0.6, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function loop(now: number) {
      if (!lastTime) lastTime = now;
      drawFrame(now);
      lastTime = now;
      rafId = requestAnimationFrame(loop);
    }

    resize();

    if (reduceMotion) {
      drawFrame(0);
    } else {
      rafId = requestAnimationFrame(loop);
    }

    function handleResize() {
      cancelAnimationFrame(rafId);
      resize();
      if (reduceMotion) {
        drawFrame(0);
      } else {
        rafId = requestAnimationFrame(loop);
      }
    }

    // Pause the animation loop when the tab isn't visible — avoids burning
    // CPU/battery in background tabs, which a raw rAF loop wouldn't do on
    // its own (rAF self-throttles in background tabs in most browsers, but
    // explicitly stopping is more reliable across engines).
    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else if (!reduceMotion) {
        lastTime = 0;
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
