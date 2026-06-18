use serde::Serialize;
use utoipa::ToSchema;

use crate::modules::recommendation::dtos::response::Timestamp;

#[derive(Serialize, ToSchema)]
pub struct CpuDto {
    id: String,
    brand: String,
    r#gen: String,
    family: String,
    series: String,
    cores: i32,
    threads: i32,
    base_clock: f32,
    max_clock: f32,
    cache: i32,
    socket: String,
    graphics: bool,
    oc: bool,
    recommended_power: i32,
    avg_price: f32,
    #[schema(value_type = String, format = DateTime)]
    release_date: Timestamp,
    img: Option<Vec<u8>>,
    #[schema(value_type = String, format = DateTime)]
    created_at: Timestamp,
    #[schema(value_type = Option<String>, format = DateTime)]
    updated_at: Option<Timestamp>,
}

impl CpuDto {
    pub fn new(
        id: String,
        brand: String,
        r#gen: String,
        family: String,
        series: String,
        cores: i32,
        threads: i32,
        base_clock: f32,
        max_clock: f32,
        cache: i32,
        socket: String,
        graphics: bool,
        oc: bool,
        recommended_power: i32,
        avg_price: f32,
        release_date: Timestamp,
        img: Option<Vec<u8>>,
        created_at: Timestamp,
        updated_at: Option<Timestamp>,
    ) -> Self {
        Self {
            id,
            brand,
            r#gen,
            family,
            series,
            cores,
            threads,
            base_clock,
            max_clock,
            cache,
            socket,
            graphics,
            oc,
            recommended_power,
            avg_price,
            release_date,
            img,
            created_at,
            updated_at,
        }
    }
}
