'use client';

import {
  benchmarks,
  cpus,
  games,
  gpus,
  graphicsQualities,
  rams,
  resolutions,
} from '@/src/utils/benchmarks';
import { ChevronDownIcon } from '@heroicons/react/16/solid';
import { useState } from 'react';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './ui/collapsible';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';

// ─── Filter shape ─────────────────────────────────────────────────────────────

export type Filters = {
  // Hardware
  gpuVendors: string[];
  gpuSeries: string[];
  gpuMemoryGen: string[];
  cpuVendors: string[];
  cpuFamily: string[];
  cpuSocket: string[];
  ramDdr: string[];
  ramBrand: string[];
  // Games
  games: string[];
  // Quality / resolution
  graphicsQualities: string[];
  resolutions: number[];
  // FPS range
  minAvgFps: number;
};

export const FPS_FLOOR = 0;

// ─── Dynamic option derivation ────────────────────────────────────────────────
// Values that actually appear in the benchmark dataset are surfaced as options.

function uniqueFrom<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

const activeGpuIds = uniqueFrom(benchmarks.map((b) => b.gpu_id));
const activeCpuIds = uniqueFrom(benchmarks.map((b) => b.cpu_id));
const activeRamIds = uniqueFrom(benchmarks.map((b) => b.ram_id));
const activeGameIds = uniqueFrom(benchmarks.map((b) => b.game_id));

export const filterOptions = {
  gpuVendors: uniqueFrom(
    activeGpuIds.map((id) => gpus[id]?.brand).filter(Boolean),
  ),
  gpuSeries: uniqueFrom(
    activeGpuIds.map((id) => gpus[id]?.series).filter(Boolean),
  ),
  gpuMemoryGen: uniqueFrom(
    activeGpuIds.map((id) => gpus[id]?.memory_gen).filter(Boolean),
  ),
  cpuVendors: uniqueFrom(
    activeCpuIds.map((id) => cpus[id]?.brand).filter(Boolean),
  ),
  cpuFamily: uniqueFrom(
    activeCpuIds.map((id) => cpus[id]?.family).filter(Boolean),
  ),
  cpuSocket: uniqueFrom(
    activeCpuIds.map((id) => cpus[id]?.socket).filter(Boolean),
  ),
  ramDdr: uniqueFrom(activeRamIds.map((id) => rams[id]?.ddr).filter(Boolean)),
  ramBrand: uniqueFrom(
    activeRamIds.map((id) => rams[id]?.brand).filter(Boolean),
  ),
  games: activeGameIds.map((id) => ({ id, name: games[id]?.name ?? id })),
  graphicsQualities: graphicsQualities.filter((q) =>
    benchmarks.some((b) => b.graphics_quality === q),
  ),
  resolutions: resolutions.filter((r) =>
    benchmarks.some((b) => b.resolution === r),
  ),
  maxAvgFps: Math.max(...benchmarks.map((b) => b.avg_fps)),
};

export const DEFAULT_FILTERS: Filters = {
  gpuVendors: [],
  gpuSeries: [],
  gpuMemoryGen: [],
  cpuVendors: [],
  cpuFamily: [],
  cpuSocket: [],
  ramDdr: [],
  ramBrand: [],
  games: [],
  graphicsQualities: [],
  resolutions: [],
  minAvgFps: FPS_FLOOR,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

type FilterSectionProps = {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function FilterSection({
  title,
  count,
  children,
  defaultOpen = true,
}: FilterSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-lg border"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left">
        <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
          {count ? (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
              {count}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon
          className={`size-4 shrink-0 text-muted-foreground transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-t px-3 py-3">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

// A nested, collapsible sub-group (e.g. GPU inside Hardware)
type SubSectionProps = {
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

function SubSection({
  title,
  count,
  children,
  defaultOpen = false,
}: SubSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-1 py-1.5 text-left">
        <span className="flex items-center gap-1.5 text-xs font-medium text-foreground">
          {title}
          {count ? (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
              {count}
            </span>
          ) : null}
        </span>
        <ChevronDownIcon
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${
            open ? 'rotate-180' : ''
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="ml-2 flex flex-col gap-2.5 border-l pl-3 pt-1.5 pb-0.5">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

type CheckRowProps = {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
};

function CheckRow({ id, label, checked, onCheckedChange }: CheckRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <Label htmlFor={id} className="text-sm font-normal">
        {label}
      </Label>
    </div>
  );
}

// ─── Main FilterPanel ─────────────────────────────────────────────────────────

type FilterPanelProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
};

export function FilterPanel({
  filters,
  onChange,
  resultCount,
}: FilterPanelProps) {
  function toggle<K extends keyof Filters>(
    key: K,
    value: Filters[K] extends (infer V)[] ? V : never,
  ) {
    const current = filters[key] as unknown[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  }

  function reset() {
    onChange({ ...DEFAULT_FILTERS });
  }

  const gpuCount =
    filters.gpuVendors.length +
    filters.gpuSeries.length +
    filters.gpuMemoryGen.length;
  const cpuCount =
    filters.cpuVendors.length +
    filters.cpuFamily.length +
    filters.cpuSocket.length;
  const ramCount = filters.ramDdr.length + filters.ramBrand.length;
  const hardwareCount = gpuCount + cpuCount + ramCount;

  const hasActiveFilters =
    hardwareCount > 0 ||
    filters.games.length > 0 ||
    filters.graphicsQualities.length > 0 ||
    filters.resolutions.length > 0 ||
    filters.minAvgFps > FPS_FLOOR;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 px-4 py-4">
        <div>
          <h2 className="text-sm font-semibold">Filters</h2>
          <p className="text-xs text-muted-foreground">{resultCount} results</p>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            className="h-7 text-xs"
          >
            Clear
          </Button>
        )}
      </div>
      <Separator />
      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-4">
          {/* ── Hardware ─────────────────────────────────────── */}
          <FilterSection
            title="Hardware"
            count={hardwareCount || undefined}
            defaultOpen={true}
          >
            <div className="flex flex-col gap-1">
              <SubSection
                title="GPU"
                count={gpuCount || undefined}
                defaultOpen={true}
              >
                {filterOptions.gpuVendors.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Vendor
                    </p>
                    {filterOptions.gpuVendors.map((v) => (
                      <CheckRow
                        key={v}
                        id={`gpu-vendor-${v}`}
                        label={v}
                        checked={filters.gpuVendors.includes(v)}
                        onCheckedChange={() => toggle('gpuVendors', v)}
                      />
                    ))}
                  </div>
                )}
                {filterOptions.gpuSeries.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Model
                    </p>
                    {filterOptions.gpuSeries.map((s) => (
                      <CheckRow
                        key={s}
                        id={`gpu-series-${s}`}
                        label={s}
                        checked={filters.gpuSeries.includes(s)}
                        onCheckedChange={() => toggle('gpuSeries', s)}
                      />
                    ))}
                  </div>
                )}
                {filterOptions.gpuMemoryGen.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Memory
                    </p>
                    {filterOptions.gpuMemoryGen.map((m) => (
                      <CheckRow
                        key={m}
                        id={`gpu-mem-${m}`}
                        label={m}
                        checked={filters.gpuMemoryGen.includes(m)}
                        onCheckedChange={() => toggle('gpuMemoryGen', m)}
                      />
                    ))}
                  </div>
                )}
              </SubSection>

              <SubSection title="CPU" count={cpuCount || undefined}>
                {filterOptions.cpuVendors.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Vendor
                    </p>
                    {filterOptions.cpuVendors.map((v) => (
                      <CheckRow
                        key={v}
                        id={`cpu-vendor-${v}`}
                        label={v}
                        checked={filters.cpuVendors.includes(v)}
                        onCheckedChange={() => toggle('cpuVendors', v)}
                      />
                    ))}
                  </div>
                )}
                {filterOptions.cpuFamily.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Family
                    </p>
                    {filterOptions.cpuFamily.map((f) => (
                      <CheckRow
                        key={f}
                        id={`cpu-family-${f}`}
                        label={f}
                        checked={filters.cpuFamily.includes(f)}
                        onCheckedChange={() => toggle('cpuFamily', f)}
                      />
                    ))}
                  </div>
                )}
                {filterOptions.cpuSocket.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Socket
                    </p>
                    {filterOptions.cpuSocket.map((s) => (
                      <CheckRow
                        key={s}
                        id={`cpu-socket-${s}`}
                        label={s}
                        checked={filters.cpuSocket.includes(s)}
                        onCheckedChange={() => toggle('cpuSocket', s)}
                      />
                    ))}
                  </div>
                )}
              </SubSection>

              <SubSection title="RAM" count={ramCount || undefined}>
                {filterOptions.ramDdr.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Generation
                    </p>
                    {filterOptions.ramDdr.map((d) => (
                      <CheckRow
                        key={d}
                        id={`ram-ddr-${d}`}
                        label={d}
                        checked={filters.ramDdr.includes(d)}
                        onCheckedChange={() => toggle('ramDdr', d)}
                      />
                    ))}
                  </div>
                )}
                {filterOptions.ramBrand.length > 0 && (
                  <div className="flex flex-col gap-2 pt-1">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Brand
                    </p>
                    {filterOptions.ramBrand.map((b) => (
                      <CheckRow
                        key={b}
                        id={`ram-brand-${b}`}
                        label={b}
                        checked={filters.ramBrand.includes(b)}
                        onCheckedChange={() => toggle('ramBrand', b)}
                      />
                    ))}
                  </div>
                )}
              </SubSection>
            </div>
          </FilterSection>

          {/* ── Games ────────────────────────────────────────── */}
          <FilterSection
            title="Games"
            count={filters.games.length || undefined}
          >
            <div className="flex flex-col gap-3">
              {filterOptions.games.map(({ id, name }) => (
                <CheckRow
                  key={id}
                  id={`game-${id}`}
                  label={name}
                  checked={filters.games.includes(id)}
                  onCheckedChange={() => toggle('games', id)}
                />
              ))}
            </div>
          </FilterSection>

          {/* ── Resolution ───────────────────────────────────── */}
          <FilterSection
            title="Resolution"
            count={filters.resolutions.length || undefined}
          >
            <div className="flex flex-col gap-3">
              {filterOptions.resolutions.map((r) => (
                <CheckRow
                  key={r}
                  id={`res-${r}`}
                  label={
                    r === 2160 ? '4K (2160p)' : r === 1440 ? '1440p' : '1080p'
                  }
                  checked={filters.resolutions.includes(r)}
                  onCheckedChange={() => toggle('resolutions', r)}
                />
              ))}
            </div>
          </FilterSection>

          {/* ── Quality ──────────────────────────────────────── */}
          <FilterSection
            title="Quality"
            count={filters.graphicsQualities.length || undefined}
          >
            <div className="flex flex-col gap-3">
              {filterOptions.graphicsQualities.map((q) => (
                <CheckRow
                  key={q}
                  id={`quality-${q}`}
                  label={q}
                  checked={filters.graphicsQualities.includes(q)}
                  onCheckedChange={() => toggle('graphicsQualities', q)}
                />
              ))}
            </div>
          </FilterSection>

          {/* ── Min Avg FPS ──────────────────────────────────── */}
          <FilterSection
            title="Min Avg FPS"
            count={filters.minAvgFps > FPS_FLOOR ? 1 : 0}
          >
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">At least</span>
                <span className="text-sm font-medium tabular-nums">
                  {filters.minAvgFps} FPS
                </span>
              </div>
              <Slider
                min={FPS_FLOOR}
                max={filterOptions.maxAvgFps}
                step={5}
                value={filters.minAvgFps}
                onValueChange={(value) =>
                  onChange({ ...filters, minAvgFps: value })
                }
              />
            </div>
          </FilterSection>
        </div>
      </ScrollArea>
    </div>
  );
}
