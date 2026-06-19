use chrono::{DateTime, Utc};
use prost_types::Timestamp as ProstTimestamp;

use crate::{
    benchmark_grpc,
    modules::benchmark::dtos::{
        request::{create_benchmark::CreateBenchmarkRequestDto, filters::BenchmarkFiltersRequestDto},
        response::benchmark::BenchmarkDto,
    },
};

fn from_prost_timestamp(ts: ProstTimestamp) -> DateTime<Utc> {
    DateTime::from_timestamp(ts.seconds, ts.nanos.max(0) as u32).unwrap_or_default()
}

impl From<CreateBenchmarkRequestDto> for benchmark_grpc::CreateBenchmarkRequest {
    fn from(dto: CreateBenchmarkRequestDto) -> Self {
        Self {
            title: dto.title().to_string(),
            resolution: dto.resolution(),
            graphics_quality: dto.graphics_quality().to_string(),
            cpu_id: dto.cpu_id().to_string(),
            gpu_id: dto.gpu_id().to_string(),
            ram_id: dto.ram_id().to_string(),
            avg_fps: dto.avg_fps(),
            min_fps: dto.min_fps(),
            max_fps: dto.max_fps(),
            game_id: dto.game_id().to_string(),
            user_id: dto.user_id().to_string(),
            score: dto.score(),
        }
    }
}

impl From<BenchmarkFiltersRequestDto> for benchmark_grpc::GetBenchmarkWithFilters {
    fn from(dto: BenchmarkFiltersRequestDto) -> Self {
        Self {
            cpu_id: dto.cpu_id(),
            gpu_id: dto.gpu_id(),
            ram_id: dto.ram_id(),
            game_id: dto.game_id(),
            user_id: dto.user_id(),
        }
    }
}

impl From<benchmark_grpc::BenchmarkResponse> for BenchmarkDto {
    fn from(benchmark: benchmark_grpc::BenchmarkResponse) -> Self {
        Self::new(
            benchmark.id,
            benchmark.title,
            benchmark.resolution,
            benchmark.graphics_quality,
            benchmark.cpu.unwrap_or_default().into(),
            benchmark.gpu.unwrap_or_default().into(),
            benchmark.ram.unwrap_or_default().into(),
            benchmark.avg_fps,
            benchmark.min_fps,
            benchmark.max_fps,
            benchmark.game_id,
            benchmark.user_id,
            benchmark.score,
            benchmark
                .created_at
                .map(from_prost_timestamp)
                .unwrap_or_default(),
            benchmark.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<benchmark_grpc::ListBenchmarkResponse> for Vec<BenchmarkDto> {
    fn from(list: benchmark_grpc::ListBenchmarkResponse) -> Self {
        list.benchmark.into_iter().map(BenchmarkDto::from).collect()
    }
}
