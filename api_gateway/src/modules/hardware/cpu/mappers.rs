use chrono::{DateTime, Utc};
use prost_types::Timestamp as ProstTimestamp;

use crate::{benchmark_grpc, modules::hardware::cpu::dtos::request::create_cpu::CreateCpuRequestDto};

use super::dtos::response::cpu::CpuDto;

fn from_prost_timestamp(ts: ProstTimestamp) -> DateTime<Utc> {
    DateTime::from_timestamp(ts.seconds, ts.nanos.max(0) as u32).unwrap_or_default()
}

fn to_prost_timestamp(ts: DateTime<Utc>) -> ProstTimestamp {
    ProstTimestamp {
        seconds: ts.timestamp(),
        nanos: ts.timestamp_subsec_nanos() as i32,
    }
}

impl From<CreateCpuRequestDto> for benchmark_grpc::CreateCpuRequest {
    fn from(dto: CreateCpuRequestDto) -> Self {
        Self {
            brand: dto.brand().to_string(),
            r#gen: dto.generation().to_string(),
            family: dto.family().to_string(),
            series: dto.series().to_string(),
            cores: dto.cores(),
            threads: dto.threads(),
            base_clock: dto.base_clock(),
            max_clock: dto.max_clock(),
            cache: dto.cache(),
            socket: dto.socket().to_string(),
            graphics: dto.graphics(),
            oc: dto.oc(),
            recommended_power: dto.recommended_power(),
            avg_price: dto.avg_price(),
            release_date: Some(to_prost_timestamp(dto.release_date())),
            img: dto.img(),
        }
    }
}

impl From<benchmark_grpc::CpuResponse> for CpuDto {
    fn from(cpu: benchmark_grpc::CpuResponse) -> Self {
        Self::new(
            cpu.id,
            cpu.brand,
            cpu.r#gen,
            cpu.family,
            cpu.series,
            cpu.cores,
            cpu.threads,
            cpu.base_clock,
            cpu.max_clock,
            cpu.cache,
            cpu.socket,
            cpu.graphics,
            cpu.oc,
            cpu.recommended_power,
            cpu.avg_price,
            cpu.release_date
                .map(from_prost_timestamp)
                .unwrap_or_default(),
            cpu.img,
            cpu.created_at.map(from_prost_timestamp).unwrap_or_default(),
            cpu.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<benchmark_grpc::ListCpuResponse> for Vec<CpuDto> {
    fn from(list: benchmark_grpc::ListCpuResponse) -> Self {
        list.cpu.into_iter().map(CpuDto::from).collect()
    }
}
