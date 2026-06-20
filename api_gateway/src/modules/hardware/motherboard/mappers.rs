use chrono::{DateTime, Utc};
use prost_types::Timestamp as ProstTimestamp;

use crate::{
    benchmark_grpc,
    modules::hardware::motherboard::dtos::request::create_motherboard::CreateMotherBoardRequestDto,
};

use super::dtos::response::motherboard::MotherBoardDto;

fn from_prost_timestamp(ts: ProstTimestamp) -> DateTime<Utc> {
    DateTime::from_timestamp(ts.seconds, ts.nanos.max(0) as u32).unwrap_or_default()
}

impl From<CreateMotherBoardRequestDto> for benchmark_grpc::CreateMotherBoardRequest {
    fn from(dto: CreateMotherBoardRequestDto) -> Self {
        Self {
            brand: dto.brand().to_string(),
            series: dto.series().to_string(),
            socket: dto.socket().to_string(),
            ddr: dto.ddr().to_string(),
            memory_slots: dto.memory_slots(),
            max_ram: dto.max_ram(),
            max_ram_frequency_mhz: dto.max_ram_frequency_mhz(),
            m2_slots: dto.m2_slots(),
            pci_express_x16: dto.pci_express_x16(),
            vrm: dto.vrm(),
            avg_price: dto.avg_price(),
            score: dto.score(),
            img: dto.img(),
        }
    }
}

impl From<benchmark_grpc::MotherBoardResponse> for MotherBoardDto {
    fn from(mb: benchmark_grpc::MotherBoardResponse) -> Self {
        Self::new(
            mb.id,
            mb.brand,
            mb.series,
            mb.socket,
            mb.ddr,
            mb.memory_slots,
            mb.max_ram,
            mb.max_ram_frequency_mhz,
            mb.m2_slots,
            mb.pci_express_x16,
            mb.vrm,
            mb.avg_price,
            mb.score,
            mb.img,
            mb.created_at.map(from_prost_timestamp).unwrap_or_default(),
            mb.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<benchmark_grpc::ListMotherBoardResponse> for Vec<MotherBoardDto> {
    fn from(list: benchmark_grpc::ListMotherBoardResponse) -> Self {
        list.motherboard.into_iter().map(MotherBoardDto::from).collect()
    }
}
