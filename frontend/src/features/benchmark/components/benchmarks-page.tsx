'use client';

import { useCurrentUserId } from '@/src/hooks/use-current-user-id';
import { useRole } from '@/src/hooks/use-role';
import { ChevronUpIcon, FunnelIcon, PlusIcon } from '@heroicons/react/16/solid';
import { toast } from '@heroui/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { MoteField } from '../../../components/mote-field';
import useDeleteBenchmark from '../hooks/deleteBenchmark';
import useFetchBenchmarks from '../hooks/fetchBenchmarks';
import useFetchGames from '../hooks/fetchGames';
import type { BenchmarkResponseDto } from '../types/dtos';
import { systemPrice } from './benchmark-card/format';
import { BenchmarkResults } from './benchmark-list/benchmark-results';
import {
  type Density,
  ListToolbar,
  type SortKey,
} from './benchmark-list/list-toolbar';
import {
  DEFAULT_FILTERS,
  FilterPanel,
  type Filters,
} from './filters/filter-panel';
import { ResizableHandle } from './layout/resizable-handle';
import { ResizablePanel } from './layout/resizable-panel';
import { ResizablePanelGroup } from './layout/resizable-panel-group';

const BenchmarksPage = () => {
  const {
    benchmarks,
    isLoading: isLoadingBenchmarks,
    error: errorBenchmarks,
    fetchBenchmarks,
  } = useFetchBenchmarks();
  const { games, fetchGames } = useFetchGames();
  const {
    isLoading: isDeleting,
    error: errorDelete,
    deleteBenchmarkRequest,
  } = useDeleteBenchmark();

  const role = useRole();
  const currentUserId = useCurrentUserId();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('avg-fps-desc');
  const [density, setDensity] = useState<Density>('comfortable');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Mobile-only: controls whether the filter panel is visible
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetchBenchmarks();
    fetchGames();
  }, [fetchBenchmarks, fetchGames]);

  function canDelete(b: BenchmarkResponseDto) {
    return (
      role === 'admin' || role === 'supervisor' || b.user_id === currentUserId
    );
  }

  async function handleDelete(id: string) {
    const isSuccess = await deleteBenchmarkRequest(id);

    if (isSuccess) {
      toast.success('Benchmark deleted successfully!');
      setSelectedId((prev) => (prev === id ? null : prev));
      await fetchBenchmarks();
    } else {
      toast.danger('Failed to delete benchmark', {
        description: errorDelete?.message || 'Please try again later.',
      });
    }
  }

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
      if (filters.ramDdr.length && (!ram || !filters.ramDdr.includes(ram.ddr)))
        return false;
      if (
        filters.ramBrand.length &&
        (!ram || !filters.ramBrand.includes(ram.brand))
      )
        return false;
      if (filters.games.length && !filters.games.includes(b.game_id))
        return false;
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
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(120,108,80,0.10), transparent 60%), linear-gradient(180deg, rgba(10,10,12,0.02), rgba(10,10,12,0.06))',
        }}
      />
      <MoteField />

      {/* ── Mobile layout (< sm) ───────────────────────────────────────────────
          Stacked: toolbar → collapsible filters → scrollable results.
          The ResizablePanelGroup is hidden on mobile; this simpler structure
          takes over so we don't fight the panel dragging logic on touch. */}
      <div className="flex h-screen flex-col sm:hidden">
        {/* Toolbar with an extra "Filters" toggle button */}
        <div className="shrink-0 border-b">
          <ListToolbar
            sort={sort}
            onSortChange={setSort}
            density={density}
            onDensityChange={setDensity}
          />
          {/* Filters toggle row */}
          <button
            type="button"
            onClick={() => setFiltersOpen((o) => !o)}
            className="flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium border-t"
          >
            <span className="flex items-center gap-2">
              <FunnelIcon className="size-4 text-muted-foreground" />
              Filters
              {/* Active filter count badge */}
              {filtered.length !== benchmarks.length && (
                <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">
                  {benchmarks.length - filtered.length} hidden
                </span>
              )}
            </span>
            <ChevronUpIcon
              className={`size-4 text-muted-foreground transition-transform duration-200 ${filtersOpen ? '' : 'rotate-180'}`}
            />
          </button>
        </div>

        {/* Collapsible filter panel — slides open/closed */}
        <div
          className={`shrink-0 overflow-hidden border-b transition-all duration-300 ease-in-out ${
            filtersOpen ? 'max-h-[60vh] overflow-y-auto' : 'max-h-0'
          }`}
        >
          <FilterPanel
            benchmarks={benchmarks}
            games={games}
            filters={filters}
            onChange={(f) => {
              setFilters(f);
              setFiltersOpen(false);
            }}
            resultCount={filtered.length}
          />
        </div>

        {/* Results — scrollable, takes remaining height */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <BenchmarkResults
            isLoading={isLoadingBenchmarks}
            error={errorBenchmarks}
            benchmarks={filtered}
            density={density}
            gameName={gameName}
            selectedId={selectedId}
            onToggleSelected={toggleSelected}
            canDelete={canDelete}
            isDeleting={isDeleting}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {/* ── Desktop layout (≥ sm) ──────────────────────────────────────────────
          Unchanged resizable side-by-side panel layout. */}
      <ResizablePanelGroup
        direction="horizontal"
        className="hidden h-screen w-full items-stretch backdrop-blur-[10px] sm:flex"
      >
        <ResizablePanel defaultSize={22} minsize={16}>
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
            <ListToolbar
              sort={sort}
              onSortChange={setSort}
              density={density}
              onDensityChange={setDensity}
            />

            <div className="flex-1 overflow-y-auto p-6">
              <BenchmarkResults
                isLoading={isLoadingBenchmarks}
                error={errorBenchmarks}
                benchmarks={filtered}
                density={density}
                gameName={gameName}
                selectedId={selectedId}
                onToggleSelected={toggleSelected}
                canDelete={canDelete}
                isDeleting={isDeleting}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <Link
        href="/benchmarks/create"
        className={[
          'fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 px-5 py-3 rounded-lg',
          'transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]',
          'border-black/8 bg-white dark:border-white/8 dark:bg-black',
          'backdrop-blur-[50px]',
          'shadow-[inset_0_1px_0_rgba(0,0,0,0.06),0_2px_16px_rgba(100,100,100,0.18)]',
          'dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_2px_16px_rgba(212,175,175,0.25)]',
          'hover:border-black/25 hover:bg-white/40',
          'dark:hover:border-white/25 dark:hover:bg-black/40',
          'hover:shadow-[inset_0_1px_0_rgba(0,0,0,0.10),0_2px_16px_rgba(100,100,100,0.30)]',
          'dark:hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_2px_16px_rgba(212,175,175,0.35)]',
        ].join(' ')}
      >
        <PlusIcon className="size-4" />
        Add Benchmark
      </Link>
    </>
  );
};

export default BenchmarksPage;
