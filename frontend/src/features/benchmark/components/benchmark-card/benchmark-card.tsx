import { cn } from '@/src/utils/utils';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { Chip } from '@heroui/react';
import type { BenchmarkResponseDto } from '../../types/dtos';
import { HardwareDetail } from './hardware-detail';
import {
  brandGradient,
  fpsColorStyle,
  LIST_GRID_COLS,
  resolutionLabel,
  systemPrice,
} from './format';

export { LIST_GRID_COLS, systemPrice } from './format';

type BenchmarkCardProps = {
  benchmark: BenchmarkResponseDto;
  gameName: string;
  view?: 'grid' | 'list';
  expanded?: boolean;
  onToggle?: () => void;
};

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
            <Chip variant="secondary" size="sm" className="text-[10px]">
              <Chip.Label>{resolutionLabel(b.resolution)}</Chip.Label>
            </Chip>
          </div>
          {/* Quality */}
          <div className="flex items-center justify-center border-r px-2 py-2.5 h-full">
            <Chip variant="soft" size="sm" className="text-[10px]">
              <Chip.Label>{b.graphics_quality}</Chip.Label>
            </Chip>
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
            <Chip variant="secondary" size="sm">
              <Chip.Label>{resolutionLabel(b.resolution)}</Chip.Label>
            </Chip>
            <Chip variant="soft" size="sm">
              <Chip.Label>{b.graphics_quality}</Chip.Label>
            </Chip>
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
