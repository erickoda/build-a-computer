use serde::Serialize;

use crate::modules::recommendation::dtos::response::Timestamp;

#[derive(Serialize)]
pub struct MotherBoardDto {
    id: String,
    brand: String,
    series: String,
    socket: String,
    ddr: String,
    memory_slots: i32,
    max_ram: i32,
    max_ram_frequency_mhz: i32,
    m2_slots: i32,
    pci_express_x16: i32,
    vrm: i32,
    avg_price: f32,
    score: i32,
    img: Option<Vec<u8>>,
    created_at: Timestamp,
    updated_at: Option<Timestamp>,
}

impl MotherBoardDto {
    pub fn new(
        id: String,
        brand: String,
        series: String,
        socket: String,
        ddr: String,
        memory_slots: i32,
        max_ram: i32,
        max_ram_frequency_mhz: i32,
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
