use utoipa::OpenApi;

use crate::modules::hardware::psu::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_psu,
        handlers::get_psu,
        handlers::list_psus,
        handlers::update_psu,
        handlers::delete_psu
    ),
    components(schemas(
        dtos::request::create_psu::CreatePsuRequestDto,
        dtos::request::update_psu::UpdatePsuRequestDto,
        dtos::response::psu::PsuDto,
    ))
)]
pub struct PsuApi;
