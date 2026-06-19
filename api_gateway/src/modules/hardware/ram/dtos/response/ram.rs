use serde::Serialize;
use utoipa::ToSchema;

use crate::modules::hardware::ram::dtos::Timestamp;

#[derive(Serialize, ToSchema)]
pub struct RamDto {
    id: String,
    brand: String,
    ddr: String,
    memory_amount: i32,
    avg_price: f32,
    frequency_mhz: i32,
    series: String,
    img: Option<Vec<u8>>,
    #[schema(value_type = String, format = DateTime)]
    created_at: Timestamp,
    #[schema(value_type = Option<String>, format = DateTime)]
    updated_at: Option<Timestamp>,
}

impl RamDto {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        id: String,
        brand: String,
        ddr: String,
        memory_amount: i32,
        avg_price: f32,
        frequency_mhz: i32,
        series: String,
        img: Option<Vec<u8>>,
        created_at: Timestamp,
        updated_at: Option<Timestamp>,
    ) -> Self {
        Self {
            id,
            brand,
            ddr,
            memory_amount,
            avg_price,
            frequency_mhz,
            series,
            img,
            created_at,
            updated_at,
        }
    }
}
