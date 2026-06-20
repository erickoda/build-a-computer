use chrono::{DateTime, Utc};
use prost_types::Timestamp as ProstTimestamp;

use crate::{
    benchmark_grpc,
    modules::hardware::ram::dtos::request::{create_ram::CreateRamRequestDto, update_ram::UpdateRamRequestDto},
};

use super::dtos::response::ram::RamDto;

fn from_prost_timestamp(ts: ProstTimestamp) -> DateTime<Utc> {
    DateTime::from_timestamp(ts.seconds, ts.nanos.max(0) as u32).unwrap_or_default()
}

impl From<CreateRamRequestDto> for benchmark_grpc::CreateRamRequest {
    fn from(dto: CreateRamRequestDto) -> Self {
        Self {
            brand: dto.brand().to_string(),
            ddr: dto.ddr().to_string(),
            memory_amount: dto.memory_amount(),
            avg_price: dto.avg_price(),
            frequency_mhz: dto.frequency_mhz(),
            series: dto.series().to_string(),
            img: dto.img(),
        }
    }
}

pub fn update_ram_request(id: String, dto: UpdateRamRequestDto) -> benchmark_grpc::UpdateRamRequest {
    benchmark_grpc::UpdateRamRequest {
        id,
        brand: dto.brand().to_string(),
        ddr: dto.ddr().to_string(),
        memory_amount: dto.memory_amount(),
        avg_price: dto.avg_price(),
        frequency_mhz: dto.frequency_mhz(),
        series: dto.series().to_string(),
        img: dto.img(),
    }
}

impl From<benchmark_grpc::RamResponse> for RamDto {
    fn from(ram: benchmark_grpc::RamResponse) -> Self {
        Self::new(
            ram.id,
            ram.brand,
            ram.ddr,
            ram.memory_amount,
            ram.avg_price,
            ram.frequency_mhz,
            ram.series,
            ram.img,
            ram.created_at.map(from_prost_timestamp).unwrap_or_default(),
            ram.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<benchmark_grpc::ListRamResponse> for Vec<RamDto> {
    fn from(list: benchmark_grpc::ListRamResponse) -> Self {
        list.ram.into_iter().map(RamDto::from).collect()
    }
}
