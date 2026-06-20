import { Button, Separator, Slider } from '@heroui/react';
import { useMemo } from 'react';
import type { BenchmarkResponseDto, GameResponseDto } from '../../types/dtos';
import { CheckRow } from './check-row';
import { FilterSection } from './filter-section';
import { SubSection } from './sub-section';
import { DEFAULT_FILTERS, deriveFilterOptions, FPS_FLOOR, type Filters } from './filter-types';

export { DEFAULT_FILTERS, FPS_FLOOR } from './filter-types';
export type { Filters } from './filter-types';

type FilterPanelProps = {
  benchmarks: BenchmarkResponseDto[];
  games: GameResponseDto[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
};

export function FilterPanel({
  benchmarks,
  games,
  filters,
  onChange,
  resultCount,
}: FilterPanelProps) {
  const filterOptions = useMemo(
    () => deriveFilterOptions(benchmarks, games),
    [benchmarks, games],
  );

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
          <Button variant="ghost" size="sm" onPress={reset} className="h-7 text-xs">
            Clear
          </Button>
        )}
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
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
                minValue={FPS_FLOOR}
                maxValue={filterOptions.maxAvgFps}
                step={5}
                value={[filters.minAvgFps]}
                onChange={(value) =>
                  onChange({
                    ...filters,
                    minAvgFps: Array.isArray(value) ? value[0] : value,
                  })
                }
              >
                <Slider.Track>
                  <Slider.Fill />
                  <Slider.Thumb />
                </Slider.Track>
              </Slider>
            </div>
          </FilterSection>
        </div>
      </div>
    </div>
  );
}
