use utoipa::OpenApi;

use crate::modules::hardware::ram::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_ram,
        handlers::get_ram,
        handlers::list_rams,
        handlers::update_ram,
        handlers::delete_ram
    ),
    components(schemas(
        dtos::request::create_ram::CreateRamRequestDto,
        dtos::request::update_ram::UpdateRamRequestDto,
        dtos::response::ram::RamDto,
    ))
)]
pub struct RamApi;
