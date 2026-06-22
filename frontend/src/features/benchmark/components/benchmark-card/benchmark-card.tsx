import { cn } from '@/src/utils/utils';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { Chip, Modal } from '@heroui/react';
import { useEffect, useState } from 'react';
import type { BenchmarkResponseDto } from '../../types/dtos';
import {
  brandGradient,
  fpsColorStyle,
  LIST_GRID_COLS,
  resolutionLabel,
  systemPrice,
} from './format';
import { HardwareDetail } from './hardware-detail';

export { LIST_GRID_COLS, systemPrice } from './format';

// Mirrors Tailwind's `sm` breakpoint (640px). The mobile detail modal must
// never be considered "open" at sm and above — relying on `sm:hidden`
// alone isn't enough if the modal content portals outside the element
// that class is applied to, so we gate `isOpen` itself on viewport width.
const MOBILE_BREAKPOINT_QUERY = '(max-width: 639px)';

function useIsMobileViewport() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT_QUERY);
    setIsMobile(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}

type BenchmarkCardProps = {
  benchmark: BenchmarkResponseDto;
  gameName: string;
  view?: 'grid' | 'list';
  expanded?: boolean;
  onToggle?: () => void;
  canDelete?: boolean;
  isDeleting?: boolean;
  onDelete?: () => void;
};

export function BenchmarkCard({
  benchmark: b,
  gameName,
  view = 'grid',
  expanded = false,
  onToggle,
  canDelete,
  isDeleting,
  onDelete,
}: BenchmarkCardProps) {
  const { gpu, cpu, ram } = b;
  const totalPrice = systemPrice(b);
  const isMobile = useIsMobileViewport();

  const hardwareDetail = (
    <HardwareDetail
      gpu={gpu}
      cpu={cpu}
      ram={ram}
      canDelete={canDelete}
      isDeleting={isDeleting}
      onDelete={onDelete}
    />
  );

  // ── Mobile popup ─────────────────────────────────────────────────────────
  // Below sm, the same `expanded` state that drives the desktop inline
  // expand instead opens a centered modal with the hardware detail, closed
  // via an explicit X (Modal.CloseTrigger) rather than collapsing back into
  // the row/card. `expanded`/`onToggle` stay the single source of truth —
  // the modal's open state is controlled directly from them, so there's no
  // separate piece of state to keep in sync, and the card that triggered it
  // (the row or grid card below) still renders normally underneath.
  const mobileDetailModal = (
    <div onClick={(e) => e.stopPropagation()}>
      <Modal>
        <Modal.Backdrop
          isOpen={expanded && isMobile}
          onOpenChange={(open) => {
            if (!open) onToggle?.();
          }}
        >
          <Modal.Container placement="auto">
            <Modal.Dialog className="max-h-[85vh] w-full overflow-y-auto rounded-b-none rounded-t-2xl sm:rounded-2xl">
              {/* Modal.CloseTrigger renders its own default close icon/button;
                  position it top-right via className rather than supplying
                  custom children, since that's the documented API. */}
              <Modal.CloseTrigger className="absolute right-3 top-3 z-10 rounded-full bg-muted/80 p-1.5 backdrop-blur-sm" />
              <Modal.Header className="pr-10">
                <Modal.Heading className="truncate text-sm font-medium">
                  {gameName}
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body className="p-0">{hardwareDetail}</Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );

  // ── List row ──────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="flex flex-col">
        {/* Horizontal scroll wrapper — on narrow screens the fixed-column grid
            scrolls rather than wrapping or overflowing the page. */}
        <div className="overflow-x-auto">
          <article
            onClick={onToggle}
            className={cn(
              'group grid items-center overflow-hidden border bg-card text-card-foreground transition-colors hover:border-foreground/20 cursor-pointer select-none',
              // min-width ensures the grid never collapses on very narrow viewports
              'min-w-[700px]',
              // On mobile the panel below never opens (a Modal takes over
              // instead), so the row's bottom border/radius stays intact
              // regardless of `expanded` below sm.
              expanded
                ? 'sm:rounded-t-lg sm:border-b-0 rounded-lg'
                : 'rounded-lg',
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
        </div>

        {/* Expanded detail — desktop only (sm+). On mobile the modal above
            takes over instead, so this panel is hidden below sm rather than
            also rendering collapsed-but-present. */}
        <div
          className="hidden overflow-hidden rounded-b-lg border border-t-0 transition-all duration-300 ease-in-out sm:block"
          style={{
            maxHeight: expanded ? '800px' : '0px',
            opacity: expanded ? 1 : 0,
            borderColor: expanded ? undefined : 'transparent',
          }}
        >
          {hardwareDetail}
        </div>

        {mobileDetailModal}
      </div>
    );
  }

  // ── Grid card ─────────────────────────────────────────────────────────────
  return (
    <article
      onClick={onToggle}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground transition-all cursor-pointer select-none hover:border-foreground/20',
        // Desktop only: expanding spans the full grid row side-by-side.
        // On mobile the card itself never changes shape — the modal above
        // handles the expanded view instead.
        expanded && 'sm:col-span-full sm:flex-row sm:items-stretch',
      )}
    >
      {/* Summary (always visible) */}
      <div
        className={cn(
          'flex flex-col',
          // Desktop expanded: fixed sidebar width with a right border divider.
          expanded ? 'w-full sm:w-72 sm:shrink-0 sm:border-r' : 'flex-1',
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

      {/* Expanded hardware detail panel — desktop only (sm+), renders to
          the right in a scrollable flex-1 panel. On mobile the modal above
          takes over instead. */}
      {expanded && (
        <div className="hidden flex-1 overflow-auto sm:block sm:animate-in sm:fade-in sm:slide-in-from-right-4 sm:duration-300">
          {hardwareDetail}
        </div>
      )}

      {mobileDetailModal}
    </article>
  );
}
