use chrono::{DateTime, Utc};
use prost_types::Timestamp as ProstTimestamp;

use crate::{
    benchmark_grpc, modules::hardware::ssd::dtos::request::create_ssd::CreateSsdRequestDto,
};

use super::dtos::response::ssd::SsdDto;

fn from_prost_timestamp(ts: ProstTimestamp) -> DateTime<Utc> {
    DateTime::from_timestamp(ts.seconds, ts.nanos.max(0) as u32).unwrap_or_default()
}

impl From<CreateSsdRequestDto> for benchmark_grpc::CreateSsdRequest {
    fn from(dto: CreateSsdRequestDto) -> Self {
        Self {
            brand: dto.brand().to_string(),
            series: dto.series().to_string(),
            amount: dto.amount(),
            r#type: dto.ssd_type().to_string(),
            reading: dto.reading(),
            writing: dto.writing(),
            avg_price: dto.avg_price(),
            score: dto.score(),
            img: dto.img(),
        }
    }
}

impl From<benchmark_grpc::SsdResponse> for SsdDto {
    fn from(ssd: benchmark_grpc::SsdResponse) -> Self {
        Self::new(
            ssd.id,
            ssd.brand,
            ssd.series,
            ssd.amount,
            ssd.r#type,
            ssd.reading,
            ssd.writing,
            ssd.avg_price,
            ssd.score,
            ssd.img,
            ssd.created_at.map(from_prost_timestamp).unwrap_or_default(),
            ssd.updated_at.map(from_prost_timestamp),
        )
    }
}

impl From<benchmark_grpc::ListSsdResponse> for Vec<SsdDto> {
    fn from(list: benchmark_grpc::ListSsdResponse) -> Self {
        list.ssd.into_iter().map(SsdDto::from).collect()
    }
}
