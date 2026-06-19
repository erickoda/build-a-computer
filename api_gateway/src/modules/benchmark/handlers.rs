use axum::{
    Json,
    extract::{Path, Query, State},
    http::StatusCode,
};
use serde::Deserialize;
use utoipa::IntoParams;

use crate::{
    AppState,
    errors::AppError,
    modules::benchmark::dtos::{
        request::{create_benchmark::CreateBenchmarkRequestDto, filters::BenchmarkFiltersRequestDto},
        response::benchmark::BenchmarkDto,
    },
    security::token::AuthenticatedUser,
};

#[derive(Deserialize, IntoParams)]
pub struct TitleQuery {
    title: String,
}

/// Cria um novo benchmark no microsserviço.
#[utoipa::path(
    post,
    path = "/api/v1/benchmarks",
    request_body = CreateBenchmarkRequestDto,
    responses(
        (status = 201, description = "Benchmark criado com sucesso", body = BenchmarkDto),
        (status = 400, description = "Requisição inválida", body = AppError),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Benchmarks"
)]
pub async fn create_benchmark(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Json(dto): Json<CreateBenchmarkRequestDto>,
) -> Result<(StatusCode, Json<BenchmarkDto>), AppError> {
    let grpc_response = app_state
        .benchmark_client
        .create_benchmark(dto.into(), &user)
        .await?;

    Ok((StatusCode::CREATED, Json(grpc_response.into())))
}

/// Busca um benchmark específico pelo seu ID.
#[utoipa::path(
    get,
    path = "/api/v1/benchmarks/{id}",
    params(("id" = String, Path, description = "Identificador único do benchmark")),
    responses(
        (status = 200, description = "Benchmark encontrado com sucesso", body = BenchmarkDto),
        (status = 404, description = "Benchmark não encontrado", body = AppError)
    ),
    tag = "Benchmarks"
)]
pub async fn get_benchmark(
    State(app_state): State<AppState>,
    Path(id): Path<String>,
) -> Result<(StatusCode, Json<BenchmarkDto>), AppError> {
    let grpc_response = app_state.benchmark_client.get_benchmark(id).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Lista todos os benchmarks cadastrados.
#[utoipa::path(
    get,
    path = "/api/v1/benchmarks",
    responses(
        (status = 200, description = "Lista de benchmarks recuperada com sucesso", body = [BenchmarkDto])
    ),
    tag = "Benchmarks"
)]
pub async fn list_benchmarks(
    State(app_state): State<AppState>,
) -> Result<(StatusCode, Json<Vec<BenchmarkDto>>), AppError> {
    let grpc_response = app_state.benchmark_client.list_benchmarks().await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Remove um benchmark do sistema com base no seu ID.
#[utoipa::path(
    delete,
    path = "/api/v1/benchmarks/{id}",
    params(("id" = String, Path, description = "Identificador único do benchmark")),
    responses(
        (status = 204, description = "Benchmark removido com sucesso"),
        (status = 401, description = "Acesso negado: Token ausente ou inválido", body = AppError),
        (status = 404, description = "Benchmark não encontrado", body = AppError)
    ),
    security(
        ("bearer_auth" = [])
    ),
    tag = "Benchmarks"
)]
pub async fn delete_benchmark(
    State(app_state): State<AppState>,
    user: AuthenticatedUser,
    Path(id): Path<String>,
) -> Result<StatusCode, AppError> {
    app_state.benchmark_client.delete_benchmark(id, &user).await?;

    Ok(StatusCode::NO_CONTENT)
}

/// Busca benchmarks aplicando filtros opcionais de hardware/jogo/usuário.
#[utoipa::path(
    post,
    path = "/api/v1/benchmarks/filter",
    request_body = BenchmarkFiltersRequestDto,
    responses(
        (status = 200, description = "Benchmarks filtrados com sucesso", body = [BenchmarkDto])
    ),
    tag = "Benchmarks"
)]
pub async fn filter_benchmarks(
    State(app_state): State<AppState>,
    Json(dto): Json<BenchmarkFiltersRequestDto>,
) -> Result<(StatusCode, Json<Vec<BenchmarkDto>>), AppError> {
    let grpc_response = app_state.benchmark_client.get_with_filters(dto.into()).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Busca todos os benchmarks pertencentes a um usuário específico.
#[utoipa::path(
    get,
    path = "/api/v1/benchmarks/users/{user_id}",
    params(("user_id" = String, Path, description = "Identificador único do usuário")),
    responses(
        (status = 200, description = "Benchmarks do usuário recuperados com sucesso", body = [BenchmarkDto])
    ),
    tag = "Benchmarks"
)]
pub async fn get_benchmarks_of_user(
    State(app_state): State<AppState>,
    Path(user_id): Path<String>,
) -> Result<(StatusCode, Json<Vec<BenchmarkDto>>), AppError> {
    let grpc_response = app_state.benchmark_client.get_of_an_user(user_id).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}

/// Busca benchmarks cujo título corresponda ao informado.
#[utoipa::path(
    get,
    path = "/api/v1/benchmarks/search",
    params(TitleQuery),
    responses(
        (status = 200, description = "Benchmarks encontrados com sucesso", body = [BenchmarkDto])
    ),
    tag = "Benchmarks"
)]
pub async fn list_benchmarks_by_title(
    State(app_state): State<AppState>,
    Query(query): Query<TitleQuery>,
) -> Result<(StatusCode, Json<Vec<BenchmarkDto>>), AppError> {
    let grpc_response = app_state.benchmark_client.list_by_title(query.title).await?;

    Ok((StatusCode::OK, Json(grpc_response.into())))
}
