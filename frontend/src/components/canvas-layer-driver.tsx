'use client';

import { useEffect, useRef } from 'react';

// ─── Shared canvas driver ─────────────────────────────────────────────────────
// Runs one or more "layers" (e.g. MoteField, MilkyWayField) on a single
// shared <canvas>, with a single requestAnimationFrame loop, single resize
// listener, and single visibilitychange listener.
//
// Why this exists: each field previously owned its own canvas + rAF loop.
// Stacking two of them meant two independent loops (no frame-lock between
// them — one can drift relative to the other under load), two canvas
// backing stores for the browser to composite, and duplicated resize/
// visibility/dpr bookkeeping. Merging them into one driver removes all of
// that duplication and guarantees every layer advances using the exact same
// elapsed time and dpr in a given frame.
//
// A "layer" is just two functions:
//   - setup(ctx, size, dpr) -> state   called once, and again on every resize
//   - draw(ctx, state, size, elapsed)  called once per frame, in array order
//
// Draw order = array order, so earlier layers render underneath later ones
// (e.g. put a galaxy backdrop layer before a foreground mote layer).

export type LayerSize = { width: number; height: number };

/** A region of the shared canvas, in CSS pixels, a layer is confined to. */
export type LayerViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CanvasLayer<State> = {
  setup: (ctx: CanvasRenderingContext2D, size: LayerSize, dpr: number) => State;
  draw: (
    ctx: CanvasRenderingContext2D,
    state: State,
    size: LayerSize,
    elapsed: number,
    reduceMotion: boolean,
  ) => void;
  /**
   * Set this when the layer itself clears or fully repaints its own region
   * every frame (e.g. milkyWayLayer's per-frame fade-to-black fillRect
   * covers its entire size). For layers that draw additively without
   * clearing first (e.g. moteLayer, designed to be stacked *on top of* a
   * layer that already repainted the shared canvas), leave this false/unset
   * so the driver clears that layer's own region before calling its draw —
   * otherwise every frame's draws accumulate forever, which is wrong the
   * moment nothing else is guaranteed to have painted over this layer's
   * region first (e.g. running it alone, or side-by-side in its own
   * viewport with nothing sharing that space).
   *
   * This lives on the layer itself (not on a per-position wrapper) because
   * it's an intrinsic property of how that layer draws, independent of
   * where or alongside what it's placed — milkyWayLayer paints its own
   * base whether it's on the left, the right, or the only layer on screen.
   */
  paintsOwnBase?: boolean;
};

/**
 * Pairs a layer with an optional viewport — the region of the shared canvas
 * it should be confined to and centered within. Without a viewport, a layer
 * gets the full canvas (today's stacked-overlay behavior). With one, the
 * driver clips drawing to that rect and gives the layer a `size` equal to
 * the *viewport's* dimensions, not the full canvas — so a layer's existing
 * "center in size.width/2, size.height/2" logic just works, confined to its
 * slice, with no changes needed inside the layer itself.
 *
 * This is the mechanism behind side-by-side composition (see
 * split-field-background.tsx): two layers, two non-overlapping viewports,
 * one canvas, one loop — rather than two components each rendering a full-
 * width simulation behind a DOM clip (which centers both simulations on the
 * *whole* viewport, not on their own half, and still runs two independent
 * rAF loops under the hood).
 */
export type PositionedLayer = {
  layer: CanvasLayer<unknown>;
  viewport?: LayerViewport;
};

/**
 * Type-erases a concrete CanvasLayer<T> into CanvasLayer<unknown> so layers
 * with different internal state shapes can sit in the same array passed to
 * CanvasLayerDriver. Safe because the driver only ever calls a layer's
 * `draw` with the exact `state` that same layer's `setup` produced — the
 * erasure never lets one layer's draw see another layer's state.
 */
export function eraseLayer<State>(
  layer: CanvasLayer<State>,
): CanvasLayer<unknown> {
  return layer as unknown as CanvasLayer<unknown>;
}

// Existential wrapper so layers with different State types can share one
// array without leaking `any` into the public API.
type BoundLayer = {
  state: unknown;
  layer: CanvasLayer<unknown>;
  viewport?: LayerViewport;
  // The LayerSize this layer's setup/draw should see — equals the viewport's
  // dimensions when one is set, otherwise the full canvas size.
  effectiveSize: LayerSize;
};

type CanvasLayerDriverProps = {
  /**
   * Either a flat list of layers (each gets the full canvas — today's
   * stacked-overlay usage), or a list of { layer, viewport } pairs for
   * partitioned regions (e.g. side-by-side).
   */
  layers: CanvasLayer<unknown>[] | PositionedLayer[];
  className?: string;
};

function isPositionedLayerArray(
  layers: CanvasLayer<unknown>[] | PositionedLayer[],
): layers is PositionedLayer[] {
  return layers.length > 0 && 'layer' in layers[0];
}

export function CanvasLayerDriver({
  layers,
  className,
}: CanvasLayerDriverProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // alpha:true since layers may want to composite onto page content
    // behind the canvas; layers that want an opaque base paint one
    // themselves (see milky-way layer).
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let size: LayerSize = { width: 0, height: 0 };
    let bound: BoundLayer[] = [];
    let rafId = 0;
    let lastTime = 0;

    // Normalize the two accepted shapes into one internal form.
    const positioned: PositionedLayer[] = isPositionedLayerArray(layers)
      ? layers
      : layers.map((layer) => ({ layer }));

    function resize() {
      const parent = canvas!.parentElement;
      const width = parent?.clientWidth ?? window.innerWidth;
      const height = parent?.clientHeight ?? window.innerHeight;
      size = { width, height };

      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Re-run setup for every layer with the new size — each layer is
      // responsible for rebuilding whatever depends on canvas dimensions
      // (particle counts, sprite sheets that don't depend on size can just
      // cache internally and skip rework, see mote layer).
      //
      // A layer with a viewport gets that viewport's own width/height as
      // its `size`, not the full canvas — so its internal centering logic
      // (size.width/2, size.height/2) centers within its own slice.
      bound = positioned.map(({ layer, viewport }) => {
        const effectiveSize: LayerSize = viewport
          ? { width: viewport.width, height: viewport.height }
          : size;
        return {
          layer,
          viewport,
          effectiveSize,
          state: layer.setup(ctx!, effectiveSize, dpr),
        };
      });
    }

    function drawFrame(elapsed: number) {
      for (let i = 0; i < bound.length; i++) {
        const { layer, state, viewport, effectiveSize } = bound[i];

        if (viewport) {
          // Clip to the viewport rect and translate so the layer's own
          // (0,0)-relative drawing lands at the right spot on the shared
          // canvas, without the layer needing any awareness of where it
          // sits. save/restore scopes the clip + transform to just this
          // layer's draw call.
          ctx!.save();
          ctx!.beginPath();
          ctx!.rect(viewport.x, viewport.y, viewport.width, viewport.height);
          ctx!.clip();
          ctx!.translate(viewport.x, viewport.y);

          // A layer that doesn't paint its own opaque/full-region base each
          // frame (e.g. moteLayer, which only draws additively) needs its
          // own region cleared first — see CanvasLayer.paintsOwnBase.
          if (!layer.paintsOwnBase) {
            ctx!.clearRect(0, 0, effectiveSize.width, effectiveSize.height);
          }

          layer.draw(ctx!, state, effectiveSize, elapsed, reduceMotion);
          ctx!.restore();
        } else {
          // No viewport (today's full-canvas stacked usage): unchanged
          // behavior — a layer without a viewport is expected to either
          // paint its own base (first in the stack) or rely on an earlier
          // layer in the array having already done so.
          layer.draw(ctx!, state, effectiveSize, elapsed, reduceMotion);
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

    // Single visibility listener for every layer combined — stops the one
    // shared loop rather than each layer stopping its own.
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
    // `layers` is expected to be a stable array (defined at module scope or
    // memoized by the caller) — see usage in mote-field.tsx /
    // milky-way-field.tsx. Re-running setup on every render would rebuild
    // sprite sheets and particle arrays for no reason.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={
        className ?? 'pointer-events-none absolute inset-0 h-full w-full'
      }
    />
  );
}
