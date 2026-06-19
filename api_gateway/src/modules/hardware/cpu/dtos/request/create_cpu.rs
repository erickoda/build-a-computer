use serde::Deserialize;
use utoipa::ToSchema;

use crate::modules::hardware::cpu::dtos::Timestamp;

#[derive(Deserialize, ToSchema)]
pub struct CreateCpuRequestDto {
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
}

impl CreateCpuRequestDto {
    pub fn brand(&self) -> &str {
        &self.brand
    }

    pub fn generation(&self) -> &str {
        &self.r#gen
    }

    pub fn family(&self) -> &str {
        &self.family
    }

    pub fn series(&self) -> &str {
        &self.series
    }

    pub fn cores(&self) -> i32 {
        self.cores
    }

    pub fn threads(&self) -> i32 {
        self.threads
    }

    pub fn base_clock(&self) -> f32 {
        self.base_clock
    }

    pub fn max_clock(&self) -> f32 {
        self.max_clock
    }

    pub fn cache(&self) -> i32 {
        self.cache
    }

    pub fn socket(&self) -> &str {
        &self.socket
    }

    pub fn graphics(&self) -> bool {
        self.graphics
    }

    pub fn oc(&self) -> bool {
        self.oc
    }

    pub fn recommended_power(&self) -> i32 {
        self.recommended_power
    }

    pub fn avg_price(&self) -> f32 {
        self.avg_price
    }

    pub fn release_date(&self) -> Timestamp {
        self.release_date
    }

    pub fn img(&self) -> Option<Vec<u8>> {
        self.img.clone()
    }
}
