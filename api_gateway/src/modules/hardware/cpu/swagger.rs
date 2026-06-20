use utoipa::OpenApi;

use crate::modules::hardware::cpu::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_cpu,
        handlers::get_cpu,
        handlers::list_cpus,
        handlers::delete_cpu
    ),
    components(schemas(
        dtos::request::create_cpu::CreateCpuRequestDto,
        dtos::response::cpu::CpuDto,
    ))
)]
pub struct CpuApi;
