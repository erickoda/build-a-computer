use auth_service::{
    application::use_cases::{auth_service::AuthService, user_service::UserService},
    auth_grpc::auth_server::AuthServer,
    config::AppConfig,
    infrastructure::{
        grpc::{
            interceptors::auth_interceptor,
            services::{auth::AuthService as GRPCAuthService, users::UsersService},
        },
        persistence::sqlx_user_repository::SqlxUserRepository,
        security::{argo2_cryptography::Argo2Hasher, jwt_generator::JwtGenerator},
    },
    users_grpc::users_server::UsersServer,
};
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};
use std::net::SocketAddr;
use tonic::transport::Server;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("Initializing Users Microservice...");

    let config: AppConfig = AppConfig::from_env();

    let pool: Pool<Postgres> = PgPoolOptions::new()
        .max_connections(1)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to DATABASE_URL");

    let sqlx_repository: SqlxUserRepository = SqlxUserRepository::new(pool);

    let password_hasher: Argo2Hasher = Argo2Hasher {};

    let jwt_generator = JwtGenerator::new(config.jwt_secret, config.jwt_expiration);

    let user_use_case: UserService<SqlxUserRepository, Argo2Hasher> =
        UserService::new(sqlx_repository.clone(), password_hasher.clone());

    let auth_use_case: AuthService<SqlxUserRepository, JwtGenerator, Argo2Hasher> =
        AuthService::new(sqlx_repository.clone(), jwt_generator, password_hasher);

    let user_service = UsersService::new(user_use_case);
    let auth_service = GRPCAuthService::new(auth_use_case);

    let addr: SocketAddr = "0.0.0.0:50051".parse()?;

    Server::builder()
        .add_service(AuthServer::new(auth_service))
        .add_service(UsersServer::with_interceptor(
            user_service,
            auth_interceptor,
        ))
        .serve(addr)
        .await?;

    Ok(())
}
