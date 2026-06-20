use serde::Serialize;
use utoipa::ToSchema;

use crate::modules::hardware::psu::dtos::Timestamp;

#[derive(Serialize, ToSchema)]
pub struct PsuDto {
    id: String,
    brand: String,
    series: String,
    power_amount: i32,
    ranking: String,
    score: i32,
    eighty_plus_cert: bool,
    avg_price: f32,
    img: Option<Vec<u8>>,
    #[schema(value_type = String, format = DateTime)]
    created_at: Timestamp,
    #[schema(value_type = Option<String>, format = DateTime)]
    updated_at: Option<Timestamp>,
}

impl PsuDto {
    #[allow(clippy::too_many_arguments)]
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
