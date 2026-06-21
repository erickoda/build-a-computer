import type { BenchmarkResponseDto, CpuResponseDto, GpuResponseDto } from '../../types/dtos';

// ─── Shared column layout for list view ──────────────────────────────────────

export const LIST_GRID_COLS =
  'minmax(160px,1fr) 56px 72px 16px 60px 60px 60px 120px 110px 80px 70px 80px';
//  Game              Res  Qual  —   Avg  Min  Max  GPU    CPU   RAM  Score Price

export function resolutionLabel(r: number) {
  if (r >= 2160) return '4K';
  if (r >= 1440) return '1440p';
  return '1080p';
}

export function systemPrice(benchmark: BenchmarkResponseDto): number {
  return (
    (benchmark.gpu?.avg_price ?? 0) +
    (benchmark.cpu?.avg_price ?? 0) +
    (benchmark.ram?.avg_price ?? 0)
  );
}

// ─── Brand color mapping ──────────────────────────────────────────────────────
// Intel → blue, AMD → red, NVIDIA → green. Anything else falls back to a
// neutral gray so the gradient stays subtle rather than breaking.

const BRAND_RGB: Record<string, string> = {
  INTEL: '45, 70, 125', // blue-600
  AMD: '150, 59, 59', // red-600
  NVIDIA: '46, 128, 76', // green-600
};

const NEUTRAL_RGB = '120, 120, 128';

function brandRgb(brand: string | undefined): string {
  if (!brand) return NEUTRAL_RGB;
  return BRAND_RGB[brand.toUpperCase()] ?? NEUTRAL_RGB;
}

/**
 * Builds a subtle, desaturated side-to-side gradient: GPU brand color bleeds
 * in from the left, CPU brand color bleeds in from the right, fading to
 * transparent toward the middle so the card's own background shows through.
 */
export function brandGradient(gpu?: GpuResponseDto, cpu?: CpuResponseDto): React.CSSProperties {
  const left = brandRgb(gpu?.brand);
  const right = brandRgb(cpu?.brand);

  return {
    backgroundImage: `linear-gradient(to right, rgba(${left}, 0.16) 0%, rgba(${left}, 0.05) 30%, transparent 50%, rgba(${right}, 0.05) 70%, rgba(${right}, 0.16) 100%)`,
  };
}

// ─── FPS color mapping ────────────────────────────────────────────────────────
// <30 → red, <60 → orange, ≥60 → green. Muted/desaturated tones so the
// numbers stay legible and on-brand rather than reading as a stoplight.

const FPS_RGB = {
  low: '185, 89, 89', // muted red
  mid: '191, 130, 71', // muted orange
  high: '85, 145, 102', // muted green
};

function fpsRgb(fps: number): string {
  if (fps < 30) return FPS_RGB.low;
  if (fps < 60) return FPS_RGB.mid;
  return FPS_RGB.high;
}

export function fpsColorStyle(fps: number): React.CSSProperties {
  return { color: `rgb(${fpsRgb(fps)})` };
}
