use utoipa::OpenApi;

use crate::modules::hardware::gpu::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_gpu,
        handlers::get_gpu,
        handlers::list_gpus,
        handlers::update_gpu,
        handlers::delete_gpu
    ),
    components(schemas(
        dtos::request::create_gpu::CreateGpuRequestDto,
        dtos::request::update_gpu::UpdateGpuRequestDto,
        dtos::response::gpu::GpuDto,
    ))
)]
pub struct GpuApi;
