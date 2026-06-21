export type CpuDto = {
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
  updated_at?: string | null;
};

export type GpuDto = {
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
  updated_at?: string | null;
};

export type MotherBoardDto = {
  id: string;
  brand: string;
  series: string;
  socket: string;
  ddr: string;
  memory_slots: number;
  max_ram: number;
  max_ram_frequency_mhz: number;
  m2_slots: number;
  pci_express_x16: number;
  vrm: number;
  avg_price: number;
  score: number;
  img?: number[] | null;
  created_at: string;
  updated_at?: string | null;
};

export type PowerSourceDto = {
  id: string;
  brand: string;
  series: string;
  power_amount: number;
  ranking: string;
  score: number;
  eighty_plus_cert: boolean;
  avg_price: number;
  img?: number[] | null;
  created_at: string;
  updated_at?: string | null;
};

export type RamMemoryDto = {
  id: string;
  brand: string;
  ddr: string;
  memory_amount: number;
  avg_price: number;
  frequency_mhz: number;
  series: string;
  img?: number[] | null;
  created_at: string;
  updated_at?: string | null;
};

export type SsdDto = {
  id: string;
  brand: string;
  series: string;
  amount: number;
  type: string;
  reading: number;
  writing: number;
  avg_price: number;
  score: number;
  img?: number[] | null;
  created_at: string;
  updated_at?: string | null;
};

export type PcResponseDto = {
  cpu: CpuDto;
  gpu: GpuDto;
  ram_memory: RamMemoryDto;
  mother_board: MotherBoardDto;
  power_source: PowerSourceDto;
  ssd: SsdDto;
};

export type RecommendationQueryParams = {
  games: string[];
  maxPrice: number;
  resolution: number;
  computerPerformance: string;
};
