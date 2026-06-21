use serde::Deserialize;
use utoipa::ToSchema;

#[derive(Deserialize, ToSchema)]
pub struct UpdatePsuRequestDto {
    brand: String,
    series: String,
    power_amount: i32,
    ranking: String,
    score: i32,
    eighty_plus_cert: bool,
    avg_price: f32,
    img: Option<Vec<u8>>,
}

impl UpdatePsuRequestDto {
    pub fn brand(&self) -> &str {
        &self.brand
    }

    pub fn series(&self) -> &str {
        &self.series
    }

    pub fn power_amount(&self) -> i32 {
        self.power_amount
    }

    pub fn ranking(&self) -> &str {
        &self.ranking
    }

    pub fn score(&self) -> i32 {
        self.score
    }

    pub fn eighty_plus_cert(&self) -> bool {
        self.eighty_plus_cert
    }

    pub fn avg_price(&self) -> f32 {
        self.avg_price
    }

    pub fn img(&self) -> Option<Vec<u8>> {
        self.img.clone()
    }
}
