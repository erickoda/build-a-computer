use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct CreateBenchmarkRequestDto {
    title: String,
    resolution: i32,
    graphics_quality: String,
    cpu_id: String,
    gpu_id: String,
    ram_id: String,
    avg_fps: i32,
    min_fps: i32,
    max_fps: i32,
    game_id: String,
    user_id: String,
    score: Option<i32>,
}

impl CreateBenchmarkRequestDto {
    pub fn title(&self) -> &str {
        &self.title
    }

    pub fn resolution(&self) -> i32 {
        self.resolution
    }

    pub fn graphics_quality(&self) -> &str {
        &self.graphics_quality
    }

    pub fn cpu_id(&self) -> &str {
        &self.cpu_id
    }

    pub fn gpu_id(&self) -> &str {
        &self.gpu_id
    }

    pub fn ram_id(&self) -> &str {
        &self.ram_id
    }

    pub fn avg_fps(&self) -> i32 {
        self.avg_fps
    }

    pub fn min_fps(&self) -> i32 {
        self.min_fps
    }

    pub fn max_fps(&self) -> i32 {
        self.max_fps
    }

    pub fn game_id(&self) -> &str {
        &self.game_id
    }

    pub fn user_id(&self) -> &str {
        &self.user_id
    }

    pub fn score(&self) -> Option<i32> {
        self.score
    }
}
