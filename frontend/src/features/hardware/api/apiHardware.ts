import api, { ApiResult } from '@/src/services/api';
import {
  CpuResponseDto,
  CreateCpuRequestDto,
  CreateGpuRequestDto,
  CreateMotherBoardRequestDto,
  CreatePsuRequestDto,
  CreateRamRequestDto,
  CreateSsdRequestDto,
  GpuResponseDto,
  MotherBoardResponseDto,
  PsuResponseDto,
  RamResponseDto,
  SsdResponseDto,
} from '../types/dtos';

export type HardwareResourceApi<TResponse, TCreate> = {
  list: () => Promise<ApiResult<TResponse[]>>;
  create: (dto: TCreate) => Promise<ApiResult<TResponse>>;
  remove: (id: string) => Promise<ApiResult<void>>;
};

function createHardwareResourceApi<TResponse, TCreate>(
  path: string,
): HardwareResourceApi<TResponse, TCreate> {
  return {
    list: () => api<TResponse[], void>(path, { method: 'GET' }),
    create: (dto: TCreate) => api<TResponse, TCreate>(path, { method: 'POST', payload: dto }),
    remove: (id: string) => api<void, void>(`${path}/${id}`, { method: 'DELETE' }),
  };
}

export const apiCpu = createHardwareResourceApi<CpuResponseDto, CreateCpuRequestDto>('hardware/cpus');
export const apiGpu = createHardwareResourceApi<GpuResponseDto, CreateGpuRequestDto>('hardware/gpus');
export const apiRam = createHardwareResourceApi<RamResponseDto, CreateRamRequestDto>('hardware/rams');
export const apiMotherboard = createHardwareResourceApi<MotherBoardResponseDto, CreateMotherBoardRequestDto>('hardware/motherboards');
export const apiPsu = createHardwareResourceApi<PsuResponseDto, CreatePsuRequestDto>('hardware/psus');
export const apiSsd = createHardwareResourceApi<SsdResponseDto, CreateSsdRequestDto>('hardware/ssds');
