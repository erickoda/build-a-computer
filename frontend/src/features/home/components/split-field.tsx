'use client';

import {
  CanvasLayer,
  CanvasLayerDriver,
  LayerViewport,
  PositionedLayer,
} from '@/src/components/canvas-layer-driver';
import { useEffect, useState } from 'react';

// ─── SplitFieldBackground ─────────────────────────────────────────────────────
//
// Renders two field layers side-by-side — left half / right half of the
// container — on ONE shared canvas with ONE shared animation loop, each
// genuinely centered within its own half rather than clipped from a
// full-width render.
//
// Usage:
//   <SplitFieldBackground left={moteLayer} right={milkyWayLayer} />
//
// Why this replaces a DOM-clipping approach (two <canvas> elements, each
// full width, cropped with overflow-hidden):
//   1. Correctness — a field given a "full viewport width" canvas centers
//      itself at that *full* width's midpoint. Clip away one half and the
//      visible half is centered on the *container's* center line, not on
//      its own half's center line — the simulation looks pushed against the
//      divider with dead space toward the outer edge. Giving each layer a
//      viewport equal to its own half-width means it centers correctly
//      within that half, because the driver passes the layer a `size` equal
//      to the viewport's own dimensions (see canvas-layer-driver.tsx).
//   2. Performance — two <canvas> elements means two backing stores for the
//      browser to composite, and (if each field still owns its own
//      component) two independent rAF loops with no frame-lock between
//      them. This component instead passes both layers directly into one
//      CanvasLayerDriver with two non-overlapping viewports: one canvas,
//      one loop, both halves always advance using the same elapsed time.
//
// Props:
//   left       — Layer (e.g. moteLayer, milkyWayLayer) to run in the left half
//   right      — Layer to run in the right half
//   divider    — Optional: show a faint centre divider line (default: true)
//   className  — Optional: extra classes on the root wrapper

type SplitFieldBackgroundProps = {
  left: CanvasLayer<unknown>;
  right: CanvasLayer<unknown>;
  divider?: boolean;
  className?: string;
};

export function SplitFieldBackground({
  left,
  right,
  divider = true,
  className = '',
}: SplitFieldBackgroundProps) {
  // The driver computes viewports in CSS pixels at setup/resize time
  // internally, but it needs *us* to tell it where the split is — and the
  // split point depends on the container's actual rendered size, which we
  // don't know until after mount. We track just the container width here
  // (not full simulation state) and rebuild the two viewport rects when it
  // changes; the driver's own resize handling still does all the heavy
  // lifting (canvas backing store, dpr, per-layer setup).
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const [layers, setLayers] = useState<PositionedLayer[] | null>(null);

  useEffect(() => {
    if (!containerRef) return;

    function computeLayers() {
      const width = containerRef!.clientWidth;
      const height = containerRef!.clientHeight;

      // Below the `sm` breakpoint the page itself stacks its two halves
      // vertically (see home.tsx's `flex-col sm:flex-row`) — split the
      // shared canvas the same way so each field still centers within the
      // half of the screen it's actually rendered behind.
      const isStacked = width < 640;

      const leftViewport: LayerViewport = isStacked
        ? { x: 0, y: 0, width, height: height / 2 }
        : { x: 0, y: 0, width: width / 2, height };
      const rightViewport: LayerViewport = isStacked
        ? { x: 0, y: height / 2, width, height: height - height / 2 }
        : { x: width / 2, y: 0, width: width - width / 2, height };

      setLayers([
        { layer: left, viewport: leftViewport },
        { layer: right, viewport: rightViewport },
      ]);
    }

    computeLayers();

    // ResizeObserver rather than a window resize listener: this component
    // may be placed in a container that resizes independently of the
    // window (e.g. a panel, a modal), and CanvasLayerDriver's own internal
    // resize listener only re-reads its canvas parent's clientWidth, which
    // is this same container — so both stay in sync either way, but this
    // covers container-only resizes too.
    const observer = new ResizeObserver(computeLayers);
    observer.observe(containerRef);

    return () => observer.disconnect();
    // `left`/`right` are expected to be stable layer objects (module-level
    // exports like moteLayer/milkyWayLayer) — see CanvasLayerDriver's own
    // note about why its `layers` prop must be stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef]);

  return (
    <div
      ref={setContainerRef}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {layers && <CanvasLayerDriver layers={layers} />}

      {/*{divider && (
        // bg-foreground/10 rather than a hardcoded white/10: this tracks
        // whatever the active theme's foreground color is, so the divider
        // stays visible against both the dark galaxy backdrop and the
        // light/cream one, instead of nearly disappearing in light mode.
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-foreground/10" />
      )}*/}
    </div>
  );
}
