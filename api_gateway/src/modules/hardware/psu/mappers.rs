use chrono::{DateTime, Utc};
use prost_types::Timestamp as ProstTimestamp;

use crate::{
    benchmark_grpc,
    modules::hardware::psu::dtos::request::{create_psu::CreatePsuRequestDto, update_psu::UpdatePsuRequestDto},
};

use super::dtos::response::psu::PsuDto;

fn from_prost_timestamp(ts: ProstTimestamp) -> DateTime<Utc> {
    DateTime::from_timestamp(ts.seconds, ts.nanos.max(0) as u32).unwrap_or_default()
}

impl From<CreatePsuRequestDto> for benchmark_grpc::CreatePsuRequest {
    fn from(dto: CreatePsuRequestDto) -> Self {
        Self {
            brand: dto.brand().to_string(),
            series: dto.series().to_string(),
            power_amount: dto.power_amount(),
            ranking: dto.ranking().to_string(),
            score: dto.score(),
            eighty_plus_cert: dto.eighty_plus_cert(),
            avg_price: dto.avg_price(),
            img: dto.img(),
        }
    }
}

pub fn update_psu_request(id: String, dto: UpdatePsuRequestDto) -> benchmark_grpc::UpdatePsuRequest {
    benchmark_grpc::UpdatePsuRequest {
        id,
        brand: dto.brand().to_string(),
        series: dto.series().to_string(),
        power_amount: dto.power_amount(),
        ranking: dto.ranking().to_string(),
        score: dto.score(),
        eighty_plus_cert: dto.eighty_plus_cert(),
        avg_price: dto.avg_price(),
        img: dto.img(),
    }
}

impl From<benchmark_grpc::PsuResponse> for PsuDto {
    fn from(psu: benchmark_grpc::PsuResponse) -> Self {
        Self::new(
            psu.id,
            psu.brand,
            psu.series,
            psu.power_amount,
            psu.ranking,
            psu.score,
            psu.eighty_plus_cert,
            psu.avg_price,
            psu.img,
            psu.created_at.map(from_prost_timestamp).unwrap_or_default(),
            psu.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<benchmark_grpc::ListPsuResponse> for Vec<PsuDto> {
    fn from(list: benchmark_grpc::ListPsuResponse) -> Self {
        list.psu.into_iter().map(PsuDto::from).collect()
    }
}
