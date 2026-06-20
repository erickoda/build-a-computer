'use client';

import { useCurrentUserId } from '@/src/hooks/use-current-user-id';
import { useRole } from '@/src/hooks/use-role';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/16/solid';
import { toast } from '@heroui/react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { MoteField } from '../../home/components/mote-field';
import useDeleteBenchmark from '../hooks/deleteBenchmark';
import useFetchBenchmarks from '../hooks/fetchBenchmarks';
import useFetchGames from '../hooks/fetchGames';
import type { BenchmarkResponseDto } from '../types/dtos';
import { systemPrice } from './benchmark-card/format';
import { BenchmarkResults } from './benchmark-list/benchmark-results';
import { type Density, ListToolbar, type SortKey } from './benchmark-list/list-toolbar';
import { DEFAULT_FILTERS, FilterPanel, type Filters } from './filters/filter-panel';
import { ResizableHandle } from './layout/resizable-handle';
import { ResizablePanel } from './layout/resizable-panel';
import { ResizablePanelGroup } from './layout/resizable-panel-group';

const BenchmarksPage = () => {
  const { benchmarks, isLoading: isLoadingBenchmarks, error: errorBenchmarks, fetchBenchmarks } = useFetchBenchmarks();
  const { games, fetchGames } = useFetchGames();
  const { isLoading: isDeleting, error: errorDelete, deleteBenchmarkRequest } = useDeleteBenchmark();

  const role = useRole();
  const currentUserId = useCurrentUserId();

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>('avg-fps-desc');
  const [density, setDensity] = useState<Density>('comfortable');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchBenchmarks();
    fetchGames();
  }, [fetchBenchmarks, fetchGames]);

  function canDelete(b: BenchmarkResponseDto) {
    return role === 'admin' || role === 'supervisor' || b.user_id === currentUserId;
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
        className="fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-105 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <PlusIcon className="size-4" />
        Add Benchmark
      </Link>
    </>
  );
};

export default BenchmarksPage;
