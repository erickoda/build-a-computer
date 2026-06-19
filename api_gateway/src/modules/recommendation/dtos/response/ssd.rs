use serde::Serialize;
use utoipa::ToSchema;

use crate::modules::recommendation::dtos::response::Timestamp;

#[derive(Serialize, ToSchema)]
pub struct SsdDto {
    id: String,
    brand: String,
    series: String,
    amount: i32,
    r#type: String,
    reading: i32,
    writing: i32,
    avg_price: f32,
    score: i32,
    img: Option<Vec<u8>>,
    #[schema(value_type = String, format = DateTime)]
    created_at: Timestamp,
    #[schema(value_type = Option<String>, format = DateTime)]
    updated_at: Option<Timestamp>,
}

impl SsdDto {
    pub fn new(
        id: String,
        brand: String,
        series: String,
        amount: i32,
        r#type: String,
        reading: i32,
        writing: i32,
        avg_price: f32,
        score: i32,
        img: Option<Vec<u8>>,
        created_at: Timestamp,
        updated_at: Option<Timestamp>,
    ) -> Self {
        Self {
            id,
            brand,
            series,
            amount,
            r#type,
            reading,
            writing,
            avg_price,
            score,
            img,
            created_at,
            updated_at,
        }
    }
}
