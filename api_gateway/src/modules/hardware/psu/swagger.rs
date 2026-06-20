use utoipa::OpenApi;

use crate::modules::hardware::psu::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_psu,
        handlers::get_psu,
        handlers::list_psus,
        handlers::delete_psu
    ),
    components(schemas(
        dtos::request::create_psu::CreatePsuRequestDto,
        dtos::response::psu::PsuDto,
    ))
)]
pub struct PsuApi;
