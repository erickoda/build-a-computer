use crate::{
    clients::{
        auth_client::AuthClientWrapper, benchmark_client::BenchmarkClientWrapper,
        channel::create_channel, cpu_client::CpuClientWrapper, game_client::GameClientWrapper,
        gpu_client::GpuClientWrapper, motherboard_client::MotherBoardClientWrapper,
        psu_client::PsuClientWrapper, ram_client::RamClientWrapper,
        recommendation_client::RecommendationClientWrapper, ssd_client::SsdClientWrapper,
        users_client::UsersClientWrapper,
    },
    config::AppConfig,
    middleware::tracing::tracing_layer,
    modules::{
        auth::{routes::auth_routes, swagger::AuthApi},
        benchmark::{routes::benchmark_routes, swagger::BenchmarkApi},
        game::{routes::game_routes, swagger::GameApi},
        hardware::{
            cpu::{routes::cpu_routes, swagger::CpuApi},
            gpu::{routes::gpu_routes, swagger::GpuApi},
            motherboard::{routes::motherboard_routes, swagger::MotherBoardApi},
            psu::{routes::psu_routes, swagger::PsuApi},
            ram::{routes::ram_routes, swagger::RamApi},
            ssd::{routes::ssd_routes, swagger::SsdApi},
        },
        recommendation::{routes::recommendation_routes, swagger::RecommendationApi},
        users::{routes::user_routes, swagger::UsersApi},
    },
    security::{jwt_adapter::JwtValidator, token::TokenValidator},
    swagger::ApiDoc,
};
use axum::{
    Router,
    extract::FromRef,
    http::{
        HeaderValue,
        header::{AUTHORIZATION, CONTENT_TYPE},
    },
};
use std::sync::Arc;
use tower_http::cors::{Any, CorsLayer};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;

pub mod auth_grpc {
    tonic::include_proto!("auth");
}
pub mod users_grpc {
    tonic::include_proto!("user");
}
pub mod recommendation_grpc {
    tonic::include_proto!("recommendation.v1");
}
pub mod benchmark_grpc {
    tonic::include_proto!("pkg.protos.v1");
}
mod clients;
mod config;
mod errors;
mod extractor;
mod middleware;
mod modules;
mod security;
mod swagger;
mod tracing_config;

/// Estado global do app compartilhado e injetado nas rotas do Axum.
///
/// Mantém as instâncias dos clientes gRPC para comunicação persistente
/// com os microsserviços e o validador de JWT para autenticação.
#[derive(Clone)]
pub struct AppState {
    user_client: UsersClientWrapper,
    auth_client: AuthClientWrapper,
    recommendation_client: RecommendationClientWrapper,
    benchmark_client: BenchmarkClientWrapper,
    game_client: GameClientWrapper,
    cpu_client: CpuClientWrapper,
    gpu_client: GpuClientWrapper,
    ram_client: RamClientWrapper,
    motherboard_client: MotherBoardClientWrapper,
    psu_client: PsuClientWrapper,
    ssd_client: SsdClientWrapper,
    token_validator: Arc<dyn TokenValidator>,
}

/// Permite que o Axum extraia automaticamente o `TokenValidator` a partir do `AppState`.
///
/// Útil para injetar a validação de token de forma limpa nos handlers das rotas protegidas.
impl FromRef<AppState> for Arc<dyn TokenValidator> {
    fn from_ref(app_state: &AppState) -> Self {
        app_state.token_validator.clone()
    }
}

/// Função principal que orquestra a inicialização e execução do Gateway.
///
/// # Erros
///
/// Retorna um erro se houver falha ao estabelecer os canais gRPC com os
/// microsserviços ou se o servidor TCP não conseguir se vincular à porta
/// especificada na configuração.
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    tracing_config::init_tracing();

    let app_configure = AppConfig::from_env();

    let user_channel = create_channel(app_configure.users_microservice_url).await?;
    let user_client = UsersClientWrapper::new(user_channel);

    let auth_channel = create_channel(app_configure.auth_microservice_url).await?;
    let auth_client = AuthClientWrapper::new(auth_channel);

    let recommendation_channel =
        create_channel(app_configure.recommendation_microservice_url).await?;
    let recommendation_client = RecommendationClientWrapper::new(recommendation_channel);

    let benchmark_channel = create_channel(app_configure.benchmark_microservice_url).await?;
    let benchmark_client = BenchmarkClientWrapper::new(benchmark_channel.clone());
    let game_client = GameClientWrapper::new(benchmark_channel.clone());
    let cpu_client = CpuClientWrapper::new(benchmark_channel.clone());
    let gpu_client = GpuClientWrapper::new(benchmark_channel.clone());
    let ram_client = RamClientWrapper::new(benchmark_channel.clone());
    let motherboard_client = MotherBoardClientWrapper::new(benchmark_channel.clone());
    let psu_client = PsuClientWrapper::new(benchmark_channel.clone());
    let ssd_client = SsdClientWrapper::new(benchmark_channel);

    let jwt_validator = JwtValidator::new(app_configure.jwt_secret);
    let token_validator: Arc<dyn TokenValidator> = Arc::new(jwt_validator);

    let state = AppState {
        user_client,
        auth_client,
        recommendation_client,
        benchmark_client,
        game_client,
        cpu_client,
        gpu_client,
        ram_client,
        motherboard_client,
        psu_client,
        ssd_client,
        token_validator: token_validator.clone(),
    };

    let cors_layer = CorsLayer::new()
        .allow_methods(Any)
        .allow_origin("*".parse::<HeaderValue>().unwrap())
        .allow_headers([AUTHORIZATION, CONTENT_TYPE]);

    let mut openapi = ApiDoc::openapi();

    openapi.merge(AuthApi::openapi());
    openapi.merge(UsersApi::openapi());
    openapi.merge(RecommendationApi::openapi());
    openapi.merge(BenchmarkApi::openapi());
    openapi.merge(GameApi::openapi());
    openapi.merge(CpuApi::openapi());
    openapi.merge(GpuApi::openapi());
    openapi.merge(RamApi::openapi());
    openapi.merge(MotherBoardApi::openapi());
    openapi.merge(PsuApi::openapi());
    openapi.merge(SsdApi::openapi());

    let app = Router::new()
        .nest("/api/v1/users", user_routes())
        .nest("/api/v1/auth", auth_routes())
        .nest("/api/v1/recommendation", recommendation_routes())
        .nest("/api/v1/benchmarks", benchmark_routes())
        .nest("/api/v1/games", game_routes())
        .nest("/api/v1/hardware/cpus", cpu_routes())
        .nest("/api/v1/hardware/gpus", gpu_routes())
        .nest("/api/v1/hardware/rams", ram_routes())
        .nest("/api/v1/hardware/motherboards", motherboard_routes())
        .nest("/api/v1/hardware/psus", psu_routes())
        .nest("/api/v1/hardware/ssds", ssd_routes())
        .layer(tracing_layer(token_validator))
        .layer(cors_layer)
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", openapi))
        .with_state(state);

    let addr = format!("{}:{}", app_configure.host, app_configure.port);
    let listener = tokio::net::TcpListener::bind(addr.clone()).await?;

    tracing::info!("Running API Gateway in address: {}", addr);

    axum::serve(listener, app).await?;

    Ok(())
}
