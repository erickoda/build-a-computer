use crate::{
    clients::{
        auth_client::AuthClientWrapper, channel::create_channel,
        recommendation_client::RecommendationClientWrapper, users_client::UsersClientWrapper,
    },
    config::AppConfig,
    middleware::tracing::tracing_layer,
    modules::{
        auth::{routes::auth_routes, swagger::AuthApi},
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

    let jwt_validator = JwtValidator::new(app_configure.jwt_secret);
    let token_validator: Arc<dyn TokenValidator> = Arc::new(jwt_validator);

    let state = AppState {
        user_client,
        auth_client,
        recommendation_client,
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

    let app = Router::new()
        .nest("/api/v1/users", user_routes())
        .nest("/api/v1/auth", auth_routes())
        .nest("/api/v1/recommendation", recommendation_routes())
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
