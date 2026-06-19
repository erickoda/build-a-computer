use serde::Deserialize;
use utoipa::ToSchema;

use crate::modules::hardware::gpu::dtos::Timestamp;

#[derive(Deserialize, ToSchema)]
pub struct CreateGpuRequestDto {
    brand: String,
    family: String,
    series: String,
    memory_amount: i32,
    memory_gen: String,
    cores: i32,
    pci_express: i32,
    recommended_power: i32,
    avg_price: f32,
    #[schema(value_type = String, format = DateTime)]
    release_date: Timestamp,
    img: Option<Vec<u8>>,
}

impl CreateGpuRequestDto {
    pub fn brand(&self) -> &str {
        &self.brand
    }

    pub fn family(&self) -> &str {
        &self.family
    }

    pub fn series(&self) -> &str {
        &self.series
    }

    pub fn memory_amount(&self) -> i32 {
        self.memory_amount
    }

    pub fn memory_gen(&self) -> &str {
        &self.memory_gen
    }

    pub fn cores(&self) -> i32 {
        self.cores
    }

    pub fn pci_express(&self) -> i32 {
        self.pci_express
    }

    pub fn recommended_power(&self) -> i32 {
        self.recommended_power
    }

    pub fn avg_price(&self) -> f32 {
        self.avg_price
    }

    pub fn release_date(&self) -> Timestamp {
        self.release_date
    }

    pub fn img(&self) -> Option<Vec<u8>> {
        self.img.clone()
    }
}
