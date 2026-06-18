use serde::Serialize;

use crate::modules::recommendation::dtos::response::{
    cpu::CpuDto, gpu::GpuDto, mother_board::MotherBoardDto, power_source::PowerSourceDto,
    ram_memmory::RamMemoryDto, ssd::SsdDto,
};

#[derive(Serialize)]
pub struct Pc {
    cpu: CpuDto,
    gpu: GpuDto,
    ram_memory: RamMemoryDto,
    mother_board: MotherBoardDto,
    power_source: PowerSourceDto,
    ssd: SsdDto,
}

impl Pc {
    pub fn new(
        cpu: CpuDto,
        gpu: GpuDto,
        ram_memory: RamMemoryDto,
        mother_board: MotherBoardDto,
        power_source: PowerSourceDto,
        ssd: SsdDto,
    ) -> Self {
        Self {
            cpu,
            gpu,
            ram_memory,
            mother_board,
            power_source,
            ssd,
        }
    }
}
