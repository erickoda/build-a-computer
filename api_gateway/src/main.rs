use crate::{
    auth_grpc::auth_client::AuthClient,
    modules::{auth::routes::auth_routes, users::routes::user_routes},
    users_grpc::users_client::UsersClient,
};
use axum::Router;
use tonic::transport::Channel;

pub mod auth_grpc {
    tonic::include_proto!("auth");
}
pub mod users_grpc {
    tonic::include_proto!("user");
}
mod config;
mod errors;
mod extractor;
mod modules;

#[derive(Clone)]
pub struct AppState {
    user_client: UsersClient<Channel>,
    auth_client: AuthClient<Channel>,
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let user_channel = Channel::from_static("http://127.0.0.1:50051")
        .connect()
        .await?;
    let user_client = UsersClient::new(user_channel);

    let auth_channel = Channel::from_static("http://127.0.0.1:50051")
        .connect()
        .await?;
    let auth_client = AuthClient::new(auth_channel);

    let state = AppState {
        user_client,
        auth_client,
    };

    let app = Router::new()
        .nest("/api/v1/users", user_routes())
        .nest("/api/v1/authenticate", auth_routes())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    println!("Running API Gateway in Port: 0.0.0.0:3000");

    axum::serve(listener, app).await.unwrap();

    Ok(())
}
