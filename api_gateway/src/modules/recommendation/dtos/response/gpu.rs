use serde::Serialize;

use crate::modules::recommendation::dtos::response::Timestamp;

#[derive(Serialize)]
pub struct GpuDto {
    id: String,
    brand: String,
    family: String,
    series: String,
    memory_amount: i32,
    memory_gen: String,
    cores: i32,
    pci_express: i32,
    recommended_power: i32,
    avg_price: f32,
    release_date: Timestamp,
    img: Option<Vec<u8>>,
    created_at: Timestamp,
    updated_at: Option<Timestamp>,
}

impl GpuDto {
    pub fn new(
        id: String,
        brand: String,
        family: String,
        series: String,
        memory_amount: i32,
        memory_gen: String,
        cores: i32,
        pci_express: i32,
        recommended_power: i32,
        avg_price: f32,
        release_date: Timestamp,
        img: Option<Vec<u8>>,
        created_at: Timestamp,
        updated_at: Option<Timestamp>,
    ) -> Self {
        Self {
            id,
            brand,
            family,
            series,
            memory_amount,
            memory_gen,
            cores,
            pci_express,
            recommended_power,
            avg_price,
            release_date,
            img,
            created_at,
            updated_at,
        }
    }
}
