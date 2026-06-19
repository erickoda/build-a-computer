use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct CreateRamRequestDto {
    brand: String,
    ddr: String,
    memory_amount: i32,
    avg_price: f32,
    frequency_mhz: i32,
    series: String,
    img: Option<Vec<u8>>,
}

impl CreateRamRequestDto {
    pub fn brand(&self) -> &str {
        &self.brand
    }

    pub fn ddr(&self) -> &str {
        &self.ddr
    }

    pub fn memory_amount(&self) -> i32 {
        self.memory_amount
    }

    pub fn avg_price(&self) -> f32 {
        self.avg_price
    }

    pub fn frequency_mhz(&self) -> i32 {
        self.frequency_mhz
    }

    pub fn series(&self) -> &str {
        &self.series
    }

    pub fn img(&self) -> Option<Vec<u8>> {
        self.img.clone()
    }
}
