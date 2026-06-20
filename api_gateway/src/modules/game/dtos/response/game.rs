use serde::Serialize;
use utoipa::ToSchema;

use crate::modules::game::dtos::Timestamp;

#[derive(Serialize, ToSchema)]
pub struct GameDto {
    id: String,
    name: String,
    img: Option<Vec<u8>>,
    necessary_disk: i32,
    #[schema(value_type = String, format = DateTime)]
    created_at: Timestamp,
    #[schema(value_type = Option<String>, format = DateTime)]
    updated_at: Option<Timestamp>,
}

impl GameDto {
    pub fn new(
        id: String,
        name: String,
        img: Option<Vec<u8>>,
        necessary_disk: i32,
        created_at: Timestamp,
        updated_at: Option<Timestamp>,
    ) -> Self {
        Self {
            id,
            name,
            img,
            necessary_disk,
            created_at,
            updated_at,
        }
    }
}
