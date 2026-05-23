use actix_web::{App, HttpServer, web};
use clap::Parser;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};

use auth_service::{
    application::use_cases::{auth_service::AuthService, user_service::UserService},
    config::AppConfig,
    infrastructure::{
        cli::{
            commands::{Cli, Commands},
            execute::create_admin,
        },
        persistence::sqlx_user_repository::SqlxUserRepository,
        security::{argo2_cryptography::Argo2Hasher, jwt_generator::JwtGenerator},
        web::routes::configure_routes,
    },
};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let config: AppConfig = AppConfig::from_env();
    let cli = Cli::parse();

    let pool: Pool<Postgres> = PgPoolOptions::new()
        .max_connections(1)
        .connect(&config.database_url)
        .await
        .expect("Failed to connect to DATABASE_URL");

    let sqlx_repository: SqlxUserRepository = SqlxUserRepository::new(pool);

    let password_hasher: Argo2Hasher = Argo2Hasher {};

    let user_service: UserService<SqlxUserRepository, Argo2Hasher> =
        UserService::new(sqlx_repository.clone(), password_hasher.clone());

    match &cli.command {
        Some(Commands::CreateAdmin { username, email }) => {
            create_admin(user_service, username, email).await;

            Ok(())
        }

        Some(Commands::Serve) | None => {
            let jwt_generator = JwtGenerator::new(config.jwt_secret, config.jwt_expiration);
            let jwt_generator_data: web::Data<JwtGenerator> = web::Data::new(jwt_generator.clone());

            let user_service_data: web::Data<UserService<SqlxUserRepository, Argo2Hasher>> =
                web::Data::new(user_service);

            let auth_service: AuthService<SqlxUserRepository, JwtGenerator, Argo2Hasher> =
                AuthService::new(sqlx_repository.clone(), jwt_generator, password_hasher);
            let auth_service_data: web::Data<
                AuthService<SqlxUserRepository, JwtGenerator, Argo2Hasher>,
            > = web::Data::new(auth_service);

            println!("Server running in {}:{}", config.host, config.port);

            HttpServer::new(move || {
                App::new()
                    .app_data(jwt_generator_data.clone())
                    .app_data(user_service_data.clone())
                    .app_data(auth_service_data.clone())
                    .configure(configure_routes)
            })
            .bind((config.host, config.port))?
            .run()
            .await
        }
    }
}
