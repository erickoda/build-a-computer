use crate::{
    auth_grpc::auth_client::AuthClient,
    config::AppConfig,
    modules::{auth::routes::auth_routes, users::routes::user_routes},
    security::{jwt_adapter::JwtValidator, token::TokenValidator},
    users_grpc::users_client::UsersClient,
};
use axum::{extract::FromRef, Router};
use std::sync::Arc;
use tonic::transport::Channel;

pub mod auth_grpc {
    tonic::include_proto!("auth");
}
pub mod users_grpc {
    tonic::include_proto!("user");
}
mod clients;
mod config;
mod errors;
mod extractor;
mod modules;
mod security;

#[derive(Clone)]
pub struct AppState {
    user_client: UsersClient<Channel>,
    auth_client: AuthClient<Channel>,
    token_validator: Arc<dyn TokenValidator>,
}

impl FromRef<AppState> for Arc<dyn TokenValidator> {
    fn from_ref(app_state: &AppState) -> Self {
        app_state.token_validator.clone()
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let app_configure = AppConfig::from_env();

    let user_channel = Channel::from_shared(app_configure.auth_microservice_url)?
        .connect()
        .await?;
    let user_client = UsersClient::new(user_channel);

    let auth_channel = Channel::from_shared(app_configure.users_microservice_url)?
        .connect()
        .await?;
    let auth_client = AuthClient::new(auth_channel);

    let jwt_validator = JwtValidator::new(app_configure.jwt_secret);

    let state = AppState {
        user_client,
        auth_client,
        token_validator: Arc::new(jwt_validator),
    };

    let app = Router::new()
        .nest("/api/v1/users", user_routes())
        .nest("/api/v1/authenticate", auth_routes())
        .with_state(state);

    let addr = format!("{}:{}", app_configure.host, app_configure.port);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    println!("Running API Gateway in Port: 0.0.0.0:3000");

    axum::serve(listener, app).await.unwrap();

    Ok(())
}
