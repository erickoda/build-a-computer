import type {
  CpuResponseDto,
  GpuResponseDto,
  RamResponseDto,
} from '@/src/features/benchmark/types/dtos';

export type { CpuResponseDto, GpuResponseDto, RamResponseDto };

export type MotherBoardResponseDto = {
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
  updated_at?: string;
};

export type PsuResponseDto = {
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
  updated_at?: string;
};

export type SsdResponseDto = {
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
  updated_at?: string;
};

export type CreateCpuRequestDto = {
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
};

export type CreateGpuRequestDto = {
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
};

export type CreateRamRequestDto = {
  brand: string;
  ddr: string;
  memory_amount: number;
  avg_price: number;
  frequency_mhz: number;
  series: string;
};

export type CreateMotherBoardRequestDto = {
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
};

export type CreatePsuRequestDto = {
  brand: string;
  series: string;
  power_amount: number;
  ranking: string;
  score: number;
  eighty_plus_cert: boolean;
  avg_price: number;
};

export type CreateSsdRequestDto = {
  brand: string;
  series: string;
  amount: number;
  type: string;
  reading: number;
  writing: number;
  avg_price: number;
  score: number;
};

export const psuRankings = ['white', 'bronze', 'silver', 'gold', 'platinum', 'titanium'] as const;
export const ssdTypes = ['SATA', 'M2 SATA', 'M2 NVMe'] as const;

export type HardwareKind = 'cpu' | 'gpu' | 'ram' | 'motherboard' | 'psu' | 'ssd';
