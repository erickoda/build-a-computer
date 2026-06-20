use utoipa::OpenApi;

use crate::modules::hardware::gpu::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_gpu,
        handlers::get_gpu,
        handlers::list_gpus,
        handlers::delete_gpu
    ),
    components(schemas(
        dtos::request::create_gpu::CreateGpuRequestDto,
        dtos::response::gpu::GpuDto,
    ))
)]
pub struct GpuApi;
