use auth_service::{
    application::use_cases::{auth::AuthUseCase, user::UserUseCase},
    auth_grpc::auth_server::AuthServer,
    config::AppConfig,
    infrastructure::{
        email::gmail_sender::GmailSender,
        grpc::{
            interceptors::auth_interceptor,
            services::{auth::AuthService, users::UsersService},
        },
        otp::in_memory::InMemoryOtpStore,
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
    let config: AppConfig = AppConfig::from_env();

    let pool: Pool<Postgres> = PgPoolOptions::new()
        .max_connections(64)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to DATABASE_URL");

    let sqlx_repository: SqlxUserRepository = SqlxUserRepository::new(pool);

    let password_hasher: Argo2Hasher = Argo2Hasher {};

    let jwt_generator: JwtGenerator = JwtGenerator::new(config.jwt_secret, config.jwt_expiration);

    let otp_store: InMemoryOtpStore = InMemoryOtpStore::new();

    let email_sender: GmailSender = GmailSender::new(config.smtp_username, config.smtp_password)
        .expect("Failed to configure Gmail Sender credentials");

    let user_use_case: UserUseCase<SqlxUserRepository, Argo2Hasher> =
        UserUseCase::new(sqlx_repository.clone(), password_hasher.clone());

    let auth_use_case: AuthUseCase<
        SqlxUserRepository,
        JwtGenerator,
        Argo2Hasher,
        GmailSender,
        InMemoryOtpStore,
    > = AuthUseCase::new(
        sqlx_repository.clone(),
        jwt_generator,
        password_hasher,
        email_sender,
        otp_store,
    );

    let user_service: UsersService = UsersService::new(user_use_case);
    let auth_service: AuthService = AuthService::new(auth_use_case);

    let addr: SocketAddr = format!("{}:{}", config.host, config.port).parse()?;

    println!("Running gRPC Auth Microservice in {}", addr);

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
