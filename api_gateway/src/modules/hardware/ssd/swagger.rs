use utoipa::OpenApi;

use crate::modules::hardware::ssd::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_ssd,
        handlers::get_ssd,
        handlers::list_ssds,
        handlers::update_ssd,
        handlers::delete_ssd
    ),
    components(schemas(
        dtos::request::create_ssd::CreateSsdRequestDto,
        dtos::request::update_ssd::UpdateSsdRequestDto,
        dtos::response::ssd::SsdDto,
    ))
)]
pub struct SsdApi;
