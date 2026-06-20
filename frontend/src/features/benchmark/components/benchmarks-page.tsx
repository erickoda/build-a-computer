'use client';

import {
  ArrowLeftIcon,
  Bars3Icon,
  PlusIcon,
  Squares2X2Icon,
} from '@heroicons/react/16/solid';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { MoteField } from '../../home/components/mote-field';
import useFetchBenchmarks from '../hooks/fetchBenchmarks';
import useFetchGames from '../hooks/fetchGames';
import { BenchmarkResponseDto } from '../types/dtos';
import { DEFAULT_FILTERS, FilterPanel, type Filters } from './filter-panel';
import { BenchmarkCard, LIST_GRID_COLS, systemPrice } from './product-card';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from './ui/resizable';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';

type SortKey =
  | 'avg-fps-desc'
  | 'min-fps-desc'
  | 'max-fps-desc'
  | 'price-asc'
  | 'price-desc';

const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'avg-fps-desc', label: 'Avg FPS: High to Low' },
  { value: 'min-fps-desc', label: 'Min FPS: High to Low' },
  { value: 'max-fps-desc', label: 'Max FPS: High to Low' },
  { value: 'price-asc', label: 'System Price: Low to High' },
  { value: 'price-desc', label: 'System Price: High to Low' },
];

const BenchmarksPage = () => {
  const { benchmarks, isLoading: isLoadingBenchmarks, error: errorBenchmarks, fetchBenchmarks } = useFetchBenchmarks();
  const { games, fetchGames } = useFetchGames();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('avg-fps-desc');
  const [density, setDensity] = useState<'comfortable' | 'compact'>(
    'comfortable',
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBenchmarks();
    fetchGames();
  }, [fetchBenchmarks, fetchGames]);

  const gameNameById = useMemo(
    () => new Map(games.map((g) => [g.id, g.name])),
    [games],
  );

  function toggleSelected(id: string) {
    setSelectedId((prev) => (prev === id ? null : id));
  }

  const filtered = useMemo(() => {
    const result = benchmarks.filter((b) => {
      const gpu = b.gpu;
      const cpu = b.cpu;
      const ram = b.ram;

      // GPU filters
      if (
        filters.gpuVendors.length &&
        (!gpu || !filters.gpuVendors.includes(gpu.brand))
      )
        return false;
      if (
        filters.gpuSeries.length &&
        (!gpu || !filters.gpuSeries.includes(gpu.series))
      )
        return false;
      if (
        filters.gpuMemoryGen.length &&
        (!gpu || !filters.gpuMemoryGen.includes(gpu.memory_gen))
      )
        return false;

      // CPU filters
      if (
        filters.cpuVendors.length &&
        (!cpu || !filters.cpuVendors.includes(cpu.brand))
      )
        return false;
      if (
        filters.cpuFamily.length &&
        (!cpu || !filters.cpuFamily.includes(cpu.family))
      )
        return false;
      if (
        filters.cpuSocket.length &&
        (!cpu || !filters.cpuSocket.includes(cpu.socket))
      )
        return false;

      // RAM filters
      if (filters.ramDdr.length && (!ram || !filters.ramDdr.includes(ram.ddr)))
        return false;
      if (
        filters.ramBrand.length &&
        (!ram || !filters.ramBrand.includes(ram.brand))
      )
        return false;

      // Game filters
      if (filters.games.length && !filters.games.includes(b.game_id))
        return false;

      // Quality / resolution
      if (
        filters.graphicsQualities.length &&
        !filters.graphicsQualities.includes(b.graphics_quality)
      )
        return false;
      if (
        filters.resolutions.length &&
        !filters.resolutions.includes(b.resolution)
      )
        return false;

      // Min avg FPS
      if (b.avg_fps < filters.minAvgFps) return false;

      return true;
    });

    switch (sort) {
      case 'avg-fps-desc':
        result.sort((a, b) => b.avg_fps - a.avg_fps);
        break;
      case 'min-fps-desc':
        result.sort((a, b) => b.min_fps - a.min_fps);
        break;
      case 'max-fps-desc':
        result.sort((a, b) => b.max_fps - a.max_fps);
        break;
      case 'price-asc':
        result.sort((a, b) => systemPrice(a) - systemPrice(b));
        break;
      case 'price-desc':
        result.sort((a, b) => systemPrice(b) - systemPrice(a));
        break;
    }

    return result;
  }, [benchmarks, filters, sort]);

  function gameName(b: BenchmarkResponseDto) {
    return gameNameById.get(b.game_id) ?? b.game_id;
  }

  return (
    <>
      {/* Ambient base gradient — gives the motes a dark field to glow against,
      		and a faint vignette so the corners stay calm. */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(120,108,80,0.10), transparent 60%), linear-gradient(180deg, rgba(10,10,12,0.02), rgba(10,10,12,0.06))',
        }}
      />
      <MoteField />
      <ResizablePanelGroup
        direction="horizontal"
        className="h-screen w-full items-stretch backdrop-blur-[10px]"
      >
        <ResizablePanel defaultSize={22} minsize={16}>
          <Link
            href="/"
            className="top-15 left-6 z-20 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeftIcon className="size-4" />
            Back
          </Link>
          <FilterPanel
            benchmarks={benchmarks}
            games={games}
            filters={filters}
            onChange={setFilters}
            resultCount={filtered.length}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={78} minsize={40}>
          <div className="flex h-full flex-col">
            <header className="flex flex-wrap items-center justify-between gap-4 border-b px-6 py-4">
              <div>
                <h1 className="text-lg font-semibold">Benchmarks</h1>
                <p className="text-sm text-muted-foreground">
                  Drag the divider to resize the filters.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="sort" className="sr-only">
                  Sort by
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ToggleGroup
                  type="single"
                  value={density}
                  onValueChange={(v) =>
                    v && setDensity(v as 'comfortable' | 'compact')
                  }
                  variant="outline"
                  size="sm"
                >
                  <ToggleGroupItem
                    value="comfortable"
                    aria-label="Comfortable grid"
                  >
                    <Squares2X2Icon className="size-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="compact" aria-label="Compact grid">
                    <Bars3Icon className="size-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingBenchmarks ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium text-muted-foreground">
                    Loading benchmarks…
                  </p>
                </div>
              ) : errorBenchmarks ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium">
                    Failed to load benchmarks
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {errorBenchmarks.message}
                  </p>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm font-medium">
                    No benchmarks match your filters
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting or clearing your filters.
                  </p>
                </div>
              ) : density === 'compact' ? (
                <div className="flex flex-col gap-0">
                  {/* Sticky list header */}
                  <div
                    className="sticky top-0 z-10 grid border-b border-t bg-muted/80 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-muted-foreground rounded-t-lg overflow-hidden"
                    style={{ gridTemplateColumns: LIST_GRID_COLS }}
                  >
                    <div className="px-3 py-2">Game</div>
                    <div className="px-2 py-2 text-center">Res</div>
                    <div className="px-2 py-2 text-center">Quality</div>
                    <div className="py-2" />
                    <div className="px-2 py-2 text-center">Avg</div>
                    <div className="px-2 py-2 text-center">Min</div>
                    <div className="px-2 py-2 text-center">Max</div>
                    <div className="px-3 py-2">GPU</div>
                    <div className="px-3 py-2">CPU</div>
                    <div className="px-3 py-2">RAM</div>
                    <div className="px-2 py-2 text-center">Score</div>
                    <div className="px-3 py-2 text-right">Price</div>
                  </div>
                  {/* Rows */}
                  <div className="flex flex-col gap-1 pt-1">
                    {filtered.map((benchmark) => (
                      <BenchmarkCard
                        key={benchmark.id}
                        benchmark={benchmark}
                        gameName={gameName(benchmark)}
                        view="list"
                        expanded={selectedId === benchmark.id}
                        onToggle={() => toggleSelected(benchmark.id)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                  {filtered.map((benchmark) => (
                    <BenchmarkCard
                      key={benchmark.id}
                      benchmark={benchmark}
                      gameName={gameName(benchmark)}
                      view="grid"
                      expanded={selectedId === benchmark.id}
                      onToggle={() => toggleSelected(benchmark.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Link
        href="/benchmarks/create"
        className="fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <PlusIcon className="size-4" />
        Add Benchmark
      </Link>
    </>
  );
};

export default BenchmarksPage;
