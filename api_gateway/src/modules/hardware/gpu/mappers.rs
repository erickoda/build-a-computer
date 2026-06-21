use chrono::{DateTime, Utc};
use prost_types::Timestamp as ProstTimestamp;

use crate::{
    benchmark_grpc,
    modules::hardware::gpu::dtos::request::{create_gpu::CreateGpuRequestDto, update_gpu::UpdateGpuRequestDto},
};

use super::dtos::response::gpu::GpuDto;

fn from_prost_timestamp(ts: ProstTimestamp) -> DateTime<Utc> {
    DateTime::from_timestamp(ts.seconds, ts.nanos.max(0) as u32).unwrap_or_default()
}

fn to_prost_timestamp(ts: DateTime<Utc>) -> ProstTimestamp {
    ProstTimestamp {
        seconds: ts.timestamp(),
        nanos: ts.timestamp_subsec_nanos() as i32,
    }
}

impl From<CreateGpuRequestDto> for benchmark_grpc::CreateGpuRequest {
    fn from(dto: CreateGpuRequestDto) -> Self {
        Self {
            brand: dto.brand().to_string(),
            family: dto.family().to_string(),
            series: dto.series().to_string(),
            memory_amount: dto.memory_amount(),
            memory_gen: dto.memory_gen().to_string(),
            cores: dto.cores(),
            pci_express: dto.pci_express(),
            recommended_power: dto.recommended_power(),
            avg_price: dto.avg_price(),
            release_date: Some(to_prost_timestamp(dto.release_date())),
            img: dto.img(),
        }
    }
}

pub fn update_gpu_request(id: String, dto: UpdateGpuRequestDto) -> benchmark_grpc::UpdateGpuRequest {
    benchmark_grpc::UpdateGpuRequest {
        id,
        brand: dto.brand().to_string(),
        family: dto.family().to_string(),
        series: dto.series().to_string(),
        memory_amount: dto.memory_amount(),
        memory_gen: dto.memory_gen().to_string(),
        cores: dto.cores(),
        pci_express: dto.pci_express(),
        recommended_power: dto.recommended_power(),
        avg_price: dto.avg_price(),
        release_date: Some(to_prost_timestamp(dto.release_date())),
        img: dto.img(),
    }
}

impl From<benchmark_grpc::GpuResponse> for GpuDto {
    fn from(gpu: benchmark_grpc::GpuResponse) -> Self {
        Self::new(
            gpu.id,
            gpu.brand,
            gpu.family,
            gpu.series,
            gpu.memory_amount,
            gpu.memory_gen,
            gpu.cores,
            gpu.pci_express,
            gpu.recommended_power,
            gpu.avg_price,
            gpu.release_date
                .map(from_prost_timestamp)
                .unwrap_or_default(),
            gpu.img,
            gpu.created_at.map(from_prost_timestamp).unwrap_or_default(),
            gpu.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<benchmark_grpc::ListGpuResponse> for Vec<GpuDto> {
    fn from(list: benchmark_grpc::ListGpuResponse) -> Self {
        list.gpu.into_iter().map(GpuDto::from).collect()
    }
}
