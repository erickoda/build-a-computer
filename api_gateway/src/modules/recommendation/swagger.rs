use utoipa::OpenApi;

use crate::modules::recommendation::{dtos, handlers};

/// Estrutura geradora do OpenAPI para o escopo de recomendações de hardware.
///
/// Consolida os endpoints de requisição e mapeia todos os componentes de hardware
/// (CPU, GPU, Placa-Mãe, Fonte, RAM, SSD) retornados na configuração do PC.
#[derive(OpenApi)]
#[openapi(
    paths(handlers::get_recommendation),
    components(schemas(
        dtos::request::recommendation::RecommendationRequestDto,
        dtos::response::pc::Pc,
        dtos::response::cpu::CpuDto,
        dtos::response::gpu::GpuDto,
        dtos::response::mother_board::MotherBoardDto,
        dtos::response::power_source::PowerSourceDto,
        dtos::response::ram_memmory::RamMemoryDto,
        dtos::response::ssd::SsdDto
    ))
)]
pub struct RecommendationApi;
