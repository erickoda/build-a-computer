use serde::Serialize;

use crate::modules::recommendation::dtos::response::Timestamp;

#[derive(Serialize)]
pub struct RamMemoryDto {
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
}

impl RamMemoryDto {
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
