use serde::Serialize;
use utoipa::ToSchema;

use crate::modules::hardware::motherboard::dtos::Timestamp;

#[derive(Serialize, ToSchema)]
pub struct MotherBoardDto {
    id: String,
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
    #[schema(value_type = String, format = DateTime)]
    created_at: Timestamp,
    #[schema(value_type = Option<String>, format = DateTime)]
    updated_at: Option<Timestamp>,
}

impl MotherBoardDto {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        id: String,
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
        created_at: Timestamp,
        updated_at: Option<Timestamp>,
    ) -> Self {
        Self {
            id,
            brand,
            series,
            socket,
            ddr,
            memory_slots,
            max_ram,
            max_ram_frequency_mhz,
            m2_slots,
            pci_express_x16,
            vrm,
            avg_price,
            score,
            img,
            created_at,
            updated_at,
        }
    }
}
