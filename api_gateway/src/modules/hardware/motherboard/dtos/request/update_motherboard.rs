use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct UpdateMotherBoardRequestDto {
    brand: String,
    series: String,
    socket: String,
    ddr: String,
    memory_slots: i32,
    max_ram: i32,
    max_ram_frequency_mhz: f32,
    m2_slots: i32,
    pci_express_x16: i32,
    vrm: i32,
    avg_price: f32,
    score: i32,
    img: Option<Vec<u8>>,
}

impl UpdateMotherBoardRequestDto {
    pub fn brand(&self) -> &str {
        &self.brand
    }

    pub fn series(&self) -> &str {
        &self.series
    }

    pub fn socket(&self) -> &str {
        &self.socket
    }

    pub fn ddr(&self) -> &str {
        &self.ddr
    }

    pub fn memory_slots(&self) -> i32 {
        self.memory_slots
    }

    pub fn max_ram(&self) -> i32 {
        self.max_ram
    }

    pub fn max_ram_frequency_mhz(&self) -> f32 {
        self.max_ram_frequency_mhz
    }

    pub fn m2_slots(&self) -> i32 {
        self.m2_slots
    }

    pub fn pci_express_x16(&self) -> i32 {
        self.pci_express_x16
    }

    pub fn vrm(&self) -> i32 {
        self.vrm
    }

    pub fn avg_price(&self) -> f32 {
        self.avg_price
    }

    pub fn score(&self) -> i32 {
        self.score
    }

    pub fn img(&self) -> Option<Vec<u8>> {
        self.img.clone()
    }
}
