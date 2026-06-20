use serde::Serialize;
use utoipa::ToSchema;

use crate::modules::{
    benchmark::dtos::Timestamp,
    hardware::{cpu::dtos::response::cpu::CpuDto, gpu::dtos::response::gpu::GpuDto, ram::dtos::response::ram::RamDto},
};

#[derive(Serialize, ToSchema)]
pub struct BenchmarkDto {
    id: String,
    title: String,
    resolution: i32,
    graphics_quality: String,
    cpu: CpuDto,
    gpu: GpuDto,
    ram: RamDto,
    avg_fps: i32,
    min_fps: i32,
    max_fps: i32,
    game_id: String,
    user_id: String,
    score: Option<i32>,
    #[schema(value_type = String, format = DateTime)]
    created_at: Timestamp,
    #[schema(value_type = Option<String>, format = DateTime)]
    updated_at: Option<Timestamp>,
}

impl BenchmarkDto {
    #[allow(clippy::too_many_arguments)]
    pub fn new(
        id: String,
        title: String,
        resolution: i32,
        graphics_quality: String,
        cpu: CpuDto,
        gpu: GpuDto,
        ram: RamDto,
        avg_fps: i32,
        min_fps: i32,
        max_fps: i32,
        game_id: String,
        user_id: String,
        score: Option<i32>,
        created_at: Timestamp,
        updated_at: Option<Timestamp>,
    ) -> Self {
        Self {
            id,
            title,
            resolution,
            graphics_quality,
            cpu,
            gpu,
            ram,
            avg_fps,
            min_fps,
            max_fps,
            game_id,
            user_id,
            score,
            created_at,
            updated_at,
        }
    }
}
