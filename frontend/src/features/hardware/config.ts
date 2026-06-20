import {
  apiCpu,
  apiGpu,
  apiMotherboard,
  apiPsu,
  apiRam,
  apiSsd,
  HardwareResourceApi,
} from './api/apiHardware';
import {
  CpuResponseDto,
  CreateCpuRequestDto,
  CreateGpuRequestDto,
  CreateMotherBoardRequestDto,
  CreatePsuRequestDto,
  CreateRamRequestDto,
  CreateSsdRequestDto,
  GpuResponseDto,
  HardwareKind,
  MotherBoardResponseDto,
  PsuResponseDto,
  psuRankings,
  RamResponseDto,
  SsdResponseDto,
  ssdTypes,
} from './types/dtos';
import { ColumnConfig, FieldConfig } from './types/fieldConfig';

export type HardwareResourceConfig<TResponse, TCreate> = {
  key: HardwareKind;
  label: string;
  api: HardwareResourceApi<TResponse, TCreate>;
  fields: FieldConfig[];
  columns: ColumnConfig<TResponse>[];
  searchableColumns: (keyof TResponse)[];
};

const money = (value: number) => `$${value.toLocaleString()}`;

export const cpuResource: HardwareResourceConfig<CpuResponseDto, CreateCpuRequestDto> = {
  key: 'cpu',
  label: 'CPU',
  api: apiCpu,
  searchableColumns: ['brand', 'family', 'series', 'socket'],
  columns: [
    { key: 'brand', label: 'Brand', render: (c) => c.brand },
    { key: 'model', label: 'Model', render: (c) => `${c.family} ${c.series}` },
    { key: 'cores', label: 'Cores/Threads', render: (c) => `${c.cores}/${c.threads}` },
    { key: 'clock', label: 'Clock', render: (c) => `${c.base_clock}-${c.max_clock} GHz` },
    { key: 'socket', label: 'Socket', render: (c) => c.socket },
    { key: 'avg_price', label: 'Avg Price', render: (c) => money(c.avg_price) },
  ],
  fields: [
    { name: 'brand', label: 'Brand', kind: 'text', required: true },
    { name: 'gen', label: 'Generation', kind: 'text', required: true },
    { name: 'family', label: 'Family', kind: 'text', required: true },
    { name: 'series', label: 'Series', kind: 'text', required: true },
    { name: 'cores', label: 'Cores', kind: 'integer', required: true },
    { name: 'threads', label: 'Threads', kind: 'integer', required: true },
    { name: 'base_clock', label: 'Base Clock (GHz)', kind: 'number', required: true },
    { name: 'max_clock', label: 'Max Clock (GHz)', kind: 'number', required: true },
    { name: 'cache', label: 'Cache (MB)', kind: 'integer', required: true },
    { name: 'socket', label: 'Socket', kind: 'text', required: true },
    { name: 'graphics', label: 'Integrated Graphics', kind: 'boolean' },
    { name: 'oc', label: 'Overclockable', kind: 'boolean' },
    { name: 'recommended_power', label: 'Recommended Power (W)', kind: 'integer', required: true },
    { name: 'avg_price', label: 'Avg Price ($)', kind: 'number', required: true },
    { name: 'release_date', label: 'Release Date', kind: 'date', required: true },
  ],
};

export const gpuResource: HardwareResourceConfig<GpuResponseDto, CreateGpuRequestDto> = {
  key: 'gpu',
  label: 'GPU',
  api: apiGpu,
  searchableColumns: ['brand', 'family', 'series'],
  columns: [
    { key: 'brand', label: 'Brand', render: (g) => g.brand },
    { key: 'model', label: 'Model', render: (g) => `${g.family} ${g.series}` },
    { key: 'memory', label: 'Memory', render: (g) => `${g.memory_amount}GB ${g.memory_gen}` },
    { key: 'cores', label: 'Cores', render: (g) => g.cores.toLocaleString() },
    { key: 'power', label: 'TDP', render: (g) => `${g.recommended_power}W` },
    { key: 'avg_price', label: 'Avg Price', render: (g) => money(g.avg_price) },
  ],
  fields: [
    { name: 'brand', label: 'Brand', kind: 'text', required: true },
    { name: 'family', label: 'Family', kind: 'text', required: true },
    { name: 'series', label: 'Series', kind: 'text', required: true },
    { name: 'memory_amount', label: 'Memory (GB)', kind: 'integer', required: true },
    { name: 'memory_gen', label: 'Memory Generation', kind: 'text', required: true },
    { name: 'cores', label: 'Cores', kind: 'integer', required: true },
    { name: 'pci_express', label: 'PCIe Generation', kind: 'integer', required: true },
    { name: 'recommended_power', label: 'Recommended Power (W)', kind: 'integer', required: true },
    { name: 'avg_price', label: 'Avg Price ($)', kind: 'number', required: true },
    { name: 'release_date', label: 'Release Date', kind: 'date', required: true },
  ],
};

export const ramResource: HardwareResourceConfig<RamResponseDto, CreateRamRequestDto> = {
  key: 'ram',
  label: 'RAM',
  api: apiRam,
  searchableColumns: ['brand', 'series', 'ddr'],
  columns: [
    { key: 'brand', label: 'Brand', render: (r) => r.brand },
    { key: 'series', label: 'Series', render: (r) => r.series },
    { key: 'capacity', label: 'Capacity', render: (r) => `${r.memory_amount}GB ${r.ddr}` },
    { key: 'frequency_mhz', label: 'Frequency', render: (r) => `${r.frequency_mhz} MHz` },
    { key: 'avg_price', label: 'Avg Price', render: (r) => money(r.avg_price) },
  ],
  fields: [
    { name: 'brand', label: 'Brand', kind: 'text', required: true },
    { name: 'series', label: 'Series', kind: 'text', required: true },
    { name: 'ddr', label: 'DDR Type', kind: 'text', required: true },
    { name: 'memory_amount', label: 'Capacity (GB)', kind: 'integer', required: true },
    { name: 'frequency_mhz', label: 'Frequency (MHz)', kind: 'integer', required: true },
    { name: 'avg_price', label: 'Avg Price ($)', kind: 'number', required: true },
  ],
};

export const motherboardResource: HardwareResourceConfig<MotherBoardResponseDto, CreateMotherBoardRequestDto> = {
  key: 'motherboard',
  label: 'Motherboard',
  api: apiMotherboard,
  searchableColumns: ['brand', 'series', 'socket'],
  columns: [
    { key: 'brand', label: 'Brand', render: (m) => m.brand },
    { key: 'series', label: 'Series', render: (m) => m.series },
    { key: 'socket', label: 'Socket', render: (m) => m.socket },
    { key: 'ram', label: 'RAM Support', render: (m) => `${m.ddr} · ${m.memory_slots} slots · up to ${m.max_ram}GB` },
    { key: 'avg_price', label: 'Avg Price', render: (m) => money(m.avg_price) },
  ],
  fields: [
    { name: 'brand', label: 'Brand', kind: 'text', required: true },
    { name: 'series', label: 'Series', kind: 'text', required: true },
    { name: 'socket', label: 'Socket', kind: 'text', required: true },
    { name: 'ddr', label: 'DDR Type', kind: 'text', required: true },
    { name: 'memory_slots', label: 'Memory Slots', kind: 'integer', required: true },
    { name: 'max_ram', label: 'Max RAM (GB)', kind: 'integer', required: true },
    { name: 'max_ram_frequency_mhz', label: 'Max RAM Frequency (MHz)', kind: 'number', required: true },
    { name: 'm2_slots', label: 'M.2 Slots', kind: 'integer', required: true },
    { name: 'pci_express_x16', label: 'PCIe x16 Slots', kind: 'integer', required: true },
    { name: 'vrm', label: 'VRM', kind: 'integer', required: true },
    { name: 'avg_price', label: 'Avg Price ($)', kind: 'number', required: true },
    { name: 'score', label: 'Score', kind: 'integer', required: true },
  ],
};

export const psuResource: HardwareResourceConfig<PsuResponseDto, CreatePsuRequestDto> = {
  key: 'psu',
  label: 'PSU',
  api: apiPsu,
  searchableColumns: ['brand', 'series', 'ranking'],
  columns: [
    { key: 'brand', label: 'Brand', render: (p) => p.brand },
    { key: 'series', label: 'Series', render: (p) => p.series },
    { key: 'power_amount', label: 'Power', render: (p) => `${p.power_amount}W` },
    { key: 'ranking', label: 'Ranking', render: (p) => `80+ ${p.ranking}` },
    { key: 'avg_price', label: 'Avg Price', render: (p) => money(p.avg_price) },
  ],
  fields: [
    { name: 'brand', label: 'Brand', kind: 'text', required: true },
    { name: 'series', label: 'Series', kind: 'text', required: true },
    { name: 'power_amount', label: 'Power (W)', kind: 'integer', required: true },
    { name: 'ranking', label: '80+ Ranking', kind: 'select', options: psuRankings, required: true },
    { name: 'eighty_plus_cert', label: '80+ Certified', kind: 'boolean' },
    { name: 'avg_price', label: 'Avg Price ($)', kind: 'number', required: true },
    { name: 'score', label: 'Score', kind: 'integer', required: true },
  ],
};

export const ssdResource: HardwareResourceConfig<SsdResponseDto, CreateSsdRequestDto> = {
  key: 'ssd',
  label: 'SSD',
  api: apiSsd,
  searchableColumns: ['brand', 'series', 'type'],
  columns: [
    { key: 'brand', label: 'Brand', render: (s) => s.brand },
    { key: 'series', label: 'Series', render: (s) => s.series },
    { key: 'amount', label: 'Capacity', render: (s) => `${s.amount}GB` },
    { key: 'type', label: 'Type', render: (s) => s.type },
    { key: 'speed', label: 'Read/Write', render: (s) => `${s.reading}/${s.writing} MB/s` },
    { key: 'avg_price', label: 'Avg Price', render: (s) => money(s.avg_price) },
  ],
  fields: [
    { name: 'brand', label: 'Brand', kind: 'text', required: true },
    { name: 'series', label: 'Series', kind: 'text', required: true },
    { name: 'amount', label: 'Capacity (GB)', kind: 'integer', required: true },
    { name: 'type', label: 'Type', kind: 'select', options: ssdTypes, required: true },
    { name: 'reading', label: 'Read Speed (MB/s)', kind: 'integer', required: true },
    { name: 'writing', label: 'Write Speed (MB/s)', kind: 'integer', required: true },
    { name: 'avg_price', label: 'Avg Price ($)', kind: 'number', required: true },
    { name: 'score', label: 'Score', kind: 'integer', required: true },
  ],
};

export const hardwareResources = [
  cpuResource,
  gpuResource,
  ramResource,
  motherboardResource,
  psuResource,
  ssdResource,
];
