use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema, Default)]
pub struct BenchmarkFiltersRequestDto {
    #[serde(default)]
    cpu_id: Vec<String>,
    #[serde(default)]
    gpu_id: Vec<String>,
    #[serde(default)]
    ram_id: Vec<String>,
    #[serde(default)]
    game_id: Vec<String>,
    #[serde(default)]
    user_id: Vec<String>,
}

impl BenchmarkFiltersRequestDto {
    pub fn cpu_id(&self) -> Vec<String> {
        self.cpu_id.clone()
    }

    pub fn gpu_id(&self) -> Vec<String> {
        self.gpu_id.clone()
    }

    pub fn ram_id(&self) -> Vec<String> {
        self.ram_id.clone()
    }

    pub fn game_id(&self) -> Vec<String> {
        self.game_id.clone()
    }

    pub fn user_id(&self) -> Vec<String> {
        self.user_id.clone()
    }
}
