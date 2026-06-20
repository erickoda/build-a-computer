use utoipa::OpenApi;

use crate::modules::benchmark::{dtos, handlers};

#[derive(OpenApi)]
#[openapi(
    paths(
        handlers::create_benchmark,
        handlers::get_benchmark,
        handlers::list_benchmarks,
        handlers::delete_benchmark,
        handlers::filter_benchmarks,
        handlers::get_benchmarks_of_user,
        handlers::list_benchmarks_by_title
    ),
    components(schemas(
        dtos::request::create_benchmark::CreateBenchmarkRequestDto,
        dtos::request::filters::BenchmarkFiltersRequestDto,
        dtos::response::benchmark::BenchmarkDto,
    ))
)]
pub struct BenchmarkApi;
