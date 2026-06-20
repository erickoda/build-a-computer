use utoipa::OpenApi;

use crate::modules::hardware::motherboard::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_motherboard,
        handlers::get_motherboard,
        handlers::list_motherboards,
        handlers::update_motherboard,
        handlers::delete_motherboard
    ),
    components(schemas(
        dtos::request::create_motherboard::CreateMotherBoardRequestDto,
        dtos::request::update_motherboard::UpdateMotherBoardRequestDto,
        dtos::response::motherboard::MotherBoardDto,
    ))
)]
pub struct MotherBoardApi;
