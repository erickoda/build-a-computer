import type { BenchmarkResponseDto, GameResponseDto } from '../../types/dtos';

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

// ─── Dynamic option derivation ────────────────────────────────────────────────
// Values that actually appear in the fetched benchmarks are surfaced as options.

function uniqueFrom<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

export function deriveFilterOptions(
  benchmarks: BenchmarkResponseDto[],
  games: GameResponseDto[],
) {
  const gameNameById = new Map(games.map((g) => [g.id, g.name]));

  return {
    gpuVendors: uniqueFrom(benchmarks.map((b) => b.gpu?.brand).filter((v): v is string => Boolean(v))),
    gpuSeries: uniqueFrom(benchmarks.map((b) => b.gpu?.series).filter((v): v is string => Boolean(v))),
    gpuMemoryGen: uniqueFrom(benchmarks.map((b) => b.gpu?.memory_gen).filter((v): v is string => Boolean(v))),
    cpuVendors: uniqueFrom(benchmarks.map((b) => b.cpu?.brand).filter((v): v is string => Boolean(v))),
    cpuFamily: uniqueFrom(benchmarks.map((b) => b.cpu?.family).filter((v): v is string => Boolean(v))),
    cpuSocket: uniqueFrom(benchmarks.map((b) => b.cpu?.socket).filter((v): v is string => Boolean(v))),
    ramDdr: uniqueFrom(benchmarks.map((b) => b.ram?.ddr).filter((v): v is string => Boolean(v))),
    ramBrand: uniqueFrom(benchmarks.map((b) => b.ram?.brand).filter((v): v is string => Boolean(v))),
    games: uniqueFrom(benchmarks.map((b) => b.game_id)).map((id) => ({
      id,
      name: gameNameById.get(id) ?? id,
    })),
    graphicsQualities: uniqueFrom(benchmarks.map((b) => b.graphics_quality)),
    resolutions: uniqueFrom(benchmarks.map((b) => b.resolution)).sort((a, b) => a - b),
    maxAvgFps: benchmarks.length > 0 ? Math.max(...benchmarks.map((b) => b.avg_fps)) : 0,
  };
}
