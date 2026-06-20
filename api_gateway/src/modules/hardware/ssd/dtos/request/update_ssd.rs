use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct UpdateSsdRequestDto {
    brand: String,
    series: String,
    amount: i32,
    r#type: String,
    reading: i32,
    writing: i32,
    avg_price: f32,
    score: i32,
    img: Option<Vec<u8>>,
}

impl UpdateSsdRequestDto {
    pub fn brand(&self) -> &str {
        &self.brand
    }

    pub fn series(&self) -> &str {
        &self.series
    }

    pub fn amount(&self) -> i32 {
        self.amount
    }

    pub fn ssd_type(&self) -> &str {
        &self.r#type
    }

    pub fn reading(&self) -> i32 {
        self.reading
    }

    pub fn writing(&self) -> i32 {
        self.writing
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
