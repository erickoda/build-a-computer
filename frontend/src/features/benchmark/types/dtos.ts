// ─── Hardware response DTOs (mirrors api_gateway hardware DTOs) ──────────────

export type CpuResponseDto = {
  id: string;
  brand: string;
  gen: string;
  family: string;
  series: string;
  cores: number;
  threads: number;
  base_clock: number;
  max_clock: number;
  cache: number;
  socket: string;
  graphics: boolean;
  oc: boolean;
  recommended_power: number;
  avg_price: number;
  release_date: string;
  img?: number[] | null;
  created_at: string;
  updated_at?: string;
};

export type GpuResponseDto = {
  id: string;
  brand: string;
  family: string;
  series: string;
  memory_amount: number;
  memory_gen: string;
  cores: number;
  pci_express: number;
  recommended_power: number;
  avg_price: number;
  release_date: string;
  img?: number[] | null;
  created_at: string;
  updated_at?: string;
};

export type RamResponseDto = {
  id: string;
  brand: string;
  ddr: string;
  memory_amount: number;
  avg_price: number;
  frequency_mhz: number;
  series: string;
  img?: number[] | null;
  created_at: string;
  updated_at?: string;
};

// ─── Game ─────────────────────────────────────────────────────────────────────

export type GameResponseDto = {
  id: string;
  name: string;
  img?: number[] | null;
  necessary_disk: number;
  created_at: string;
  updated_at?: string;
};

export type UpdateGameRequestDto = {
  name: string;
  img?: number[] | null;
  necessary_disk: number;
};

// ─── Benchmark ────────────────────────────────────────────────────────────────

export type CreateBenchmarkRequestDto = {
  title: string;
  resolution: number;
  graphics_quality: string;
  cpu_id: string;
  gpu_id: string;
  ram_id: string;
  avg_fps: number;
  min_fps: number;
  max_fps: number;
  game_id: string;
  user_id: string;
  score?: number;
};

export type BenchmarkFiltersRequestDto = {
  cpu_id?: string[];
  gpu_id?: string[];
  ram_id?: string[];
  game_id?: string[];
  user_id?: string[];
};

export type BenchmarkResponseDto = {
  id: string;
  title: string;
  resolution: number;
  graphics_quality: string;
  cpu: CpuResponseDto;
  gpu: GpuResponseDto;
  ram: RamResponseDto;
  avg_fps: number;
  min_fps: number;
  max_fps: number;
  game_id: string;
  user_id: string;
  score?: number;
  created_at: string;
  updated_at?: string;
};

// ─── Fixed UI options ─────────────────────────────────────────────────────────

export const graphicsQualities = ['Low', 'Medium', 'High', 'Ultra'] as const;
export const resolutions = [1080, 1440, 2160] as const;
