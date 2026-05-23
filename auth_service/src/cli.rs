use clap::Parser;
use sqlx::{Pool, Postgres, postgres::PgPoolOptions};

use auth_service::{
    application::use_cases::user::UserUseCase,
    config::AppConfig,
    infrastructure::{
        cli::{
            commands::{Cli, Commands},
            execute::create_admin,
        },
        persistence::sqlx_user_repository::SqlxUserRepository,
        security::argo2_cryptography::Argo2Hasher,
    },
};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let cli = Cli::parse();

    match &cli.command {
        Some(Commands::CreateAdmin { username, email }) => {
            let config: AppConfig = AppConfig::from_env();

            let pool: Pool<Postgres> = PgPoolOptions::new()
                .max_connections(1)
                .connect(&config.database_url)
                .await
                .expect("Failed to connect to DATABASE_URL");

            let sqlx_repository: SqlxUserRepository = SqlxUserRepository::new(pool);

            let password_hasher: Argo2Hasher = Argo2Hasher {};

            let user_service: UserUseCase<SqlxUserRepository, Argo2Hasher> =
                UserUseCase::new(sqlx_repository.clone(), password_hasher.clone());
            create_admin(user_service, username, email).await;

            Ok(())
        }

        None => {
            todo!()
        }
    }
}
