import type { ReactNode } from 'react';

// ─── SplitFieldBackground ─────────────────────────────────────────────────────
//
// Renders two ambient field components side-by-side, each clipped to half
// the viewport, without touching their internal code.
//
// Usage:
//   <SplitFieldBackground left={<MoteField />} right={<MilkyWayField />} />
//
// How it works:
//   Each field is wrapped in an absolutely-positioned container that covers
//   only its half of the screen (left: 0→50%, right: 50%→100%) with
//   overflow-hidden. The field inside still renders at full viewport width —
//   the clip just hides the half that would overlap the other field.
//
//   The right-side container shifts the field left by 50vw with a negative
//   margin so that the *right* half of <MilkyWayField /> is visible, not the
//   left half repeated.
//
// Props:
//   left       — Component to show on the left half
//   right      — Component to show on the right half
//   divider    — Optional: show a faint centre divider line (default: true)
//   className  — Optional: extra classes on the root wrapper

type SplitFieldBackgroundProps = {
  left: ReactNode;
  right: ReactNode;
  divider?: boolean;
  className?: string;
};

export function SplitFieldBackground({
  left,
  right,
  divider = true,
  className = '',
}: SplitFieldBackgroundProps) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* ── Left half — shows the left 50vw of <left> ── */}
      <div className="absolute inset-y-0 left-0 w-1/2 overflow-hidden">
        {/* Field renders at full width; left half is naturally visible */}
        <div className="absolute inset-0 w-screen">{left}</div>
      </div>

      {/* ── Right half — shows the right 50vw of <right> ── */}
      <div className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
        {/* Shift the field left by 50vw so its right half aligns with this container */}
        <div className="absolute inset-0 w-screen -translate-x-1/2">
          {right}
        </div>
      </div>

      {/* ── Optional centre divider ── */}
      {divider && (
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-white/10" />
      )}
    </div>
  );
}
