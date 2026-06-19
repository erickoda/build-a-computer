use utoipa::OpenApi;

use crate::modules::hardware::ssd::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_ssd,
        handlers::get_ssd,
        handlers::list_ssds,
        handlers::delete_ssd
    ),
    components(schemas(
        dtos::request::create_ssd::CreateSsdRequestDto,
        dtos::response::ssd::SsdDto,
    ))
)]
pub struct SsdApi;
