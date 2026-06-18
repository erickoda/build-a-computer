use serde::Deserialize;

#[derive(Deserialize)]
pub struct BuildPCRequestDto {
    games: Vec<String>,
    max_price: f32,
    resolution: i32,
    computer_performance: String,
}

impl BuildPCRequestDto {
    pub fn get_games(&self) -> &Vec<String> {
        &self.games
    }

    pub fn get_max_price(&self) -> f32 {
        self.max_price
    }

    pub fn get_resolution(&self) -> i32 {
        self.resolution
    }

    pub fn get_computer_perfomance(&self) -> &str {
        &self.computer_performance
    }
}
