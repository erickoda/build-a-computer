use serde::Serialize;

use crate::modules::recommendation::dtos::response::Timestamp;

#[derive(Serialize)]
pub struct PowerSourceDto {
    id: String,
    brand: String,
    series: String,
    power_amount: i32,
    ranking: String,
    score: i32,
    eighty_plus_cert: bool,
    avg_price: f32,
    img: Option<Vec<u8>>,
    created_at: Timestamp,
    updated_at: Option<Timestamp>,
}

impl PowerSourceDto {
    pub fn new(
        id: String,
        brand: String,
        series: String,
        power_amount: i32,
        ranking: String,
        score: i32,
        eighty_plus_cert: bool,
        avg_price: f32,
        img: Option<Vec<u8>>,
        created_at: Timestamp,
        updated_at: Option<Timestamp>,
    ) -> Self {
        Self {
            id,
            brand,
            series,
            power_amount,
            ranking,
            score,
            eighty_plus_cert,
            avg_price,
            img,
            created_at,
            updated_at,
        }
    }
}
