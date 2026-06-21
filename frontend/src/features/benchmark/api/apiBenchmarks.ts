import api, { ApiResult } from "@/src/services/api";
import { BenchmarkFiltersRequestDto, BenchmarkResponseDto, CreateBenchmarkRequestDto } from "../types/dtos";

const apiBenchmarks = {
  createBenchmark: async (dto: CreateBenchmarkRequestDto): Promise<ApiResult<BenchmarkResponseDto>> => api<BenchmarkResponseDto, CreateBenchmarkRequestDto>("benchmarks", {
    method: 'POST',
    payload: dto
  }),

  getBenchmark: async (id: string): Promise<ApiResult<BenchmarkResponseDto>> => api<BenchmarkResponseDto, void>(`benchmarks/${id}`, {
    method: 'GET'
  }),

  getBenchmarks: async (): Promise<ApiResult<BenchmarkResponseDto[]>> => api<BenchmarkResponseDto[], void>(`benchmarks`, {
    method: 'GET'
  }),

  deleteBenchmark: async (id: string): Promise<ApiResult<void>> => api<void, void>(`benchmarks/${id}`, {
    method: 'DELETE'
  }),

  filterBenchmarks: async (dto: BenchmarkFiltersRequestDto): Promise<ApiResult<BenchmarkResponseDto[]>> => api<BenchmarkResponseDto[], BenchmarkFiltersRequestDto>("benchmarks/filter", {
    method: 'POST',
    payload: dto
  }),
};

export default apiBenchmarks;
