'use client';

import type { BenchmarkResponseDto, CpuResponseDto, GpuResponseDto, RamResponseDto } from '../types/dtos';
import { cn } from '@/src/utils/utils';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { Badge } from './ui/badge';

// ─── Shared column layout for list view ──────────────────────────────────────

export const LIST_GRID_COLS =
  'minmax(160px,1fr) 56px 72px 16px 60px 60px 60px 120px 110px 80px 70px 80px';
//  Game              Res  Qual  —   Avg  Min  Max  GPU    CPU   RAM  Score Price

// ─── Helpers ─────────────────────────────────────────────────────────────────

function resolutionLabel(r: number) {
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
function brandGradient(gpu?: GpuResponseDto, cpu?: CpuResponseDto): React.CSSProperties {
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

function fpsColorStyle(fps: number): React.CSSProperties {
  return { color: `rgb(${fpsRgb(fps)})` };
}

// ─── Spec row helper ──────────────────────────────────────────────────────────

function Spec({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="shrink-0 text-[11px] text-muted-foreground">
        {label}
      </span>
      <span className="text-right text-[11px] font-medium tabular-nums">
        {value}
      </span>
    </div>
  );
}

function HwSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      {children}
    </div>
  );
}

// ─── Full hardware detail panel ───────────────────────────────────────────────

function HardwareDetail({
  gpu,
  cpu,
  ram,
}: {
  gpu?: GpuResponseDto;
  cpu?: CpuResponseDto;
  ram?: RamResponseDto;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 p-4 pt-3 border-t bg-muted/10">
      {/* GPU */}
      {gpu && (
        <HwSection title="GPU">
          <Spec label="Brand" value={gpu.brand} />
          <Spec label="Family" value={gpu.family} />
          <Spec label="Series" value={gpu.series} />
          <Spec
            label="VRAM"
            value={`${gpu.memory_amount} GB ${gpu.memory_gen}`}
          />
          <Spec label="Shader cores" value={gpu.cores.toLocaleString()} />
          <Spec label="PCIe" value={`Gen ${gpu.pci_express}`} />
          <Spec label="TDP" value={`${gpu.recommended_power} W`} />
          <Spec
            label="Avg price"
            value={`$${gpu.avg_price.toLocaleString()}`}
          />
        </HwSection>
      )}

      {/* CPU */}
      {cpu && (
        <HwSection title="CPU">
          <Spec label="Brand" value={cpu.brand} />
          <Spec label="Generation" value={cpu.gen} />
          <Spec label="Family" value={cpu.family} />
          <Spec label="Series" value={cpu.series} />
          <Spec
            label="Cores / Threads"
            value={`${cpu.cores} / ${cpu.threads}`}
          />
          <Spec label="Base clock" value={`${cpu.base_clock} GHz`} />
          <Spec label="Max clock" value={`${cpu.max_clock} GHz`} />
          <Spec label="Cache" value={`${cpu.cache} MB`} />
          <Spec label="Socket" value={cpu.socket} />
          <Spec label="iGPU" value={cpu.graphics ? 'Yes' : 'No'} />
          <Spec label="Overclockable" value={cpu.oc ? 'Yes' : 'No'} />
          <Spec label="TDP" value={`${cpu.recommended_power} W`} />
          <Spec
            label="Avg price"
            value={`$${cpu.avg_price.toLocaleString()}`}
          />
        </HwSection>
      )}

      {/* RAM */}
      {ram && (
        <HwSection title="RAM">
          <Spec label="Brand" value={ram.brand} />
          <Spec label="Series" value={ram.series} />
          <Spec label="Type" value={ram.ddr} />
          <Spec label="Capacity" value={`${ram.memory_amount} GB`} />
          <Spec label="Frequency" value={`${ram.frequency_mhz} MHz`} />
          <Spec
            label="Avg price"
            value={`$${ram.avg_price.toLocaleString()}`}
          />
        </HwSection>
      )}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type BenchmarkCardProps = {
  benchmark: BenchmarkResponseDto;
  gameName: string;
  view?: 'grid' | 'list';
  expanded?: boolean;
  onToggle?: () => void;
};

// ─── BenchmarkCard ────────────────────────────────────────────────────────────

export function BenchmarkCard({
  benchmark: b,
  gameName,
  view = 'grid',
  expanded = false,
  onToggle,
}: BenchmarkCardProps) {
  const { gpu, cpu, ram } = b;
  const totalPrice = systemPrice(b);

  // ── List row ──────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="flex flex-col">
        <article
          onClick={onToggle}
          className={cn(
            'group grid items-center overflow-hidden border bg-card text-card-foreground transition-colors hover:border-foreground/20 cursor-pointer select-none',
            expanded ? 'rounded-t-lg border-b-0' : 'rounded-lg',
          )}
          style={{
            gridTemplateColumns: LIST_GRID_COLS,
            ...brandGradient(gpu, cpu),
          }}
        >
          {/* Game */}
          <div className="flex min-w-0 items-center gap-2 border-r px-3 py-2.5 h-full">
            <ChevronDownIcon
              className={cn(
                'size-3.5 shrink-0 text-muted-foreground transition-transform duration-200',
                expanded && 'rotate-180',
              )}
            />
            <p className="truncate text-sm font-medium">{gameName}</p>
          </div>
          {/* Resolution */}
          <div className="flex items-center justify-center border-r px-2 py-2.5 h-full">
            <Badge variant="outline" className="text-[10px]">
              {resolutionLabel(b.resolution)}
            </Badge>
          </div>
          {/* Quality */}
          <div className="flex items-center justify-center border-r px-2 py-2.5 h-full">
            <Badge variant="secondary" className="text-[10px]">
              {b.graphics_quality}
            </Badge>
          </div>
          {/* Divider spacer */}
          <div className="h-full border-r" />
          {/* Avg FPS */}
          <div className="flex items-center justify-center border-r px-2 py-2.5 h-full">
            <span
              className="text-sm font-bold tabular-nums"
              style={fpsColorStyle(b.avg_fps)}
            >
              {b.avg_fps}
            </span>
          </div>
          {/* Min FPS */}
          <div className="flex items-center justify-center border-r px-2 py-2.5 h-full">
            <span
              className="text-sm tabular-nums"
              style={fpsColorStyle(b.min_fps)}
            >
              {b.min_fps}
            </span>
          </div>
          {/* Max FPS */}
          <div className="flex items-center justify-center border-r px-2 py-2.5 h-full">
            <span
              className="text-sm tabular-nums"
              style={fpsColorStyle(b.max_fps)}
            >
              {b.max_fps}
            </span>
          </div>
          {/* GPU */}
          <div className="flex items-center border-r px-3 py-2.5 h-full min-w-0">
            <span className="truncate text-xs font-medium">
              {gpu ? `${gpu.brand} ${gpu.series}` : '—'}
            </span>
          </div>
          {/* CPU */}
          <div className="flex items-center border-r px-3 py-2.5 h-full min-w-0">
            <span className="truncate text-xs font-medium">
              {cpu ? `${cpu.brand} ${cpu.series}` : '—'}
            </span>
          </div>
          {/* RAM */}
          <div className="flex items-center border-r px-3 py-2.5 h-full min-w-0">
            <span className="truncate text-xs font-medium">
              {ram ? `${ram.memory_amount}GB ${ram.ddr}` : '—'}
            </span>
          </div>
          {/* Score */}
          <div className="flex items-center justify-center border-r px-2 py-2.5 h-full">
            {b.score != null ? (
              <span className="text-sm font-semibold tabular-nums">
                {b.score}
                <span className="text-xs font-normal text-muted-foreground">
                  /10
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
          {/* System price */}
          <div className="flex items-center justify-end px-3 py-2.5 h-full">
            <span className="text-xs font-medium tabular-nums">
              {totalPrice > 0 ? `~$${totalPrice.toLocaleString()}` : '—'}
            </span>
          </div>
        </article>

        {/* Expanded detail — animates open/closed via max-height */}
        <div
          className="overflow-hidden rounded-b-lg border border-t-0 transition-all duration-300 ease-in-out"
          style={{
            maxHeight: expanded ? '600px' : '0px',
            opacity: expanded ? 1 : 0,
            borderColor: expanded ? undefined : 'transparent',
          }}
        >
          <HardwareDetail gpu={gpu} cpu={cpu} ram={ram} />
        </div>
      </div>
    );
  }

  // ── Grid card ─────────────────────────────────────────────────────────────
  return (
    <article
      onClick={onToggle}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground transition-all cursor-pointer select-none hover:border-foreground/20',
        expanded && 'col-span-full flex-row items-stretch',
      )}
    >
      {/* Summary (always visible) */}
      <div
        className={cn(
          'flex flex-col',
          expanded ? 'w-72 shrink-0 border-r' : 'flex-1',
        )}
        style={brandGradient(gpu, cpu)}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between gap-2 border-b bg-muted/20 px-4 py-2.5">
          <p className="truncate text-sm font-medium">{gameName}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            <Badge variant="outline">{resolutionLabel(b.resolution)}</Badge>
            <Badge variant="secondary">{b.graphics_quality}</Badge>
            <ChevronDownIcon
              className={cn(
                'size-3.5 text-muted-foreground transition-transform duration-200',
                expanded && 'rotate-180',
              )}
            />
          </div>
        </div>

        {/* FPS block */}
        <div className="flex items-stretch divide-x border-b">
          <div className="flex flex-1 flex-col items-center py-3">
            <span
              className="text-xl font-bold tabular-nums"
              style={fpsColorStyle(b.avg_fps)}
            >
              {b.avg_fps}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Avg FPS
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center py-3">
            <span
              className="text-base font-semibold tabular-nums"
              style={fpsColorStyle(b.min_fps)}
            >
              {b.min_fps}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Min
            </span>
          </div>
          <div className="flex flex-1 flex-col items-center py-3">
            <span
              className="text-base font-semibold tabular-nums"
              style={fpsColorStyle(b.max_fps)}
            >
              {b.max_fps}
            </span>
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Max
            </span>
          </div>
        </div>

        {/* Hardware summary */}
        <div className="flex flex-col gap-1.5 p-4 text-xs">
          {gpu && (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-muted-foreground">GPU</span>
              <span className="truncate text-right font-medium">
                {gpu.brand} {gpu.family} {gpu.series}
              </span>
            </div>
          )}
          {cpu && (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-muted-foreground">CPU</span>
              <span className="truncate text-right font-medium">
                {cpu.brand} {cpu.family} {cpu.series}
              </span>
            </div>
          )}
          {ram && (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-muted-foreground">RAM</span>
              <span className="truncate text-right font-medium">
                {ram.brand} {ram.memory_amount}GB {ram.ddr} {ram.frequency_mhz}
                MHz
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t px-4 py-2.5">
          {b.score != null ? (
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold tabular-nums">
                {b.score}
              </span>
              <span className="text-xs text-muted-foreground">/ 10</span>
            </div>
          ) : (
            <span />
          )}
          {totalPrice > 0 && (
            <span className="text-xs text-muted-foreground">
              ~
              <span className="font-medium text-foreground">
                ${totalPrice.toLocaleString()}
              </span>
            </span>
          )}
        </div>
      </div>

      {/* Expanded hardware detail panel — right side when in grid mode */}
      {expanded && (
        <div className="flex-1 overflow-auto animate-in fade-in slide-in-from-right-4 duration-300">
          <HardwareDetail gpu={gpu} cpu={cpu} ram={ram} />
        </div>
      )}
    </article>
  );
}
