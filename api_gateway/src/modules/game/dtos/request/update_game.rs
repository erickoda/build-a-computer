use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct UpdateGameRequestDto {
    name: String,
    img: Option<Vec<u8>>,
    necessary_disk: i32,
}

impl UpdateGameRequestDto {
    pub fn name(&self) -> &str {
        &self.name
    }

    pub fn img(&self) -> Option<Vec<u8>> {
        self.img.clone()
    }

    pub fn necessary_disk(&self) -> i32 {
        self.necessary_disk
    }
}
