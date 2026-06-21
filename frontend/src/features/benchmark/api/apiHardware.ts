import api, { ApiResult } from "@/src/services/api";
import { CpuResponseDto, GpuResponseDto, RamResponseDto } from "../types/dtos";

const apiHardware = {
  getCpus: async (): Promise<ApiResult<CpuResponseDto[]>> => api<CpuResponseDto[], void>("hardware/cpus", {
    method: 'GET'
  }),

  getGpus: async (): Promise<ApiResult<GpuResponseDto[]>> => api<GpuResponseDto[], void>("hardware/gpus", {
    method: 'GET'
  }),

  getRams: async (): Promise<ApiResult<RamResponseDto[]>> => api<RamResponseDto[], void>("hardware/rams", {
    method: 'GET'
  }),
};

export default apiHardware;
