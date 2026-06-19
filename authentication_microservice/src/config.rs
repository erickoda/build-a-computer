use std::env;

/// Centraliza todas as configurações e segredos necessários para rodar o microsserviço.
///
/// Atua como a única fonte de verdade para as definições de infraestrutura,
/// garantindo que as credenciais de banco de dados, JWT e SMTP sejam mapeadas
/// de forma tipada e segura.
pub struct AppConfig {
    pub database_url: String,
    pub jwt_secret: String,
    pub jwt_expiration: u64,
    pub host: String,
    pub port: u16,
    pub smtp_username: String,
    pub smtp_password: String,
}

impl AppConfig {
    /// Carrega e valida as variáveis de ambiente na inicialização.
    ///
    /// Tenta ler automaticamente um arquivo `.env` (para desenvolvimento local) e em
    /// seguida extrai os valores diretamente do sistema operacional (para produção).
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        Self {
            database_url: env::var("DATABASE_URL").expect("DATABASE_URL not defined"),
            jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET not defined"),
            jwt_expiration: env::var("JWT_EXPIRATION")
                .expect("JWT_EXPIRATION not defined")
                .parse()
                .expect("INVALID TYPE FOR JWT_EXPIRATION"),
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "50051".to_string())
                .parse()
                .expect("INVALID TYPE FOR PORT"),
            smtp_username: env::var("SMTP_USERNAME").expect("SMTP_USERNAME not defined"),
            smtp_password: env::var("SMTP_PASSWORD").expect("SMTP_PASSWORD not defined"),
        }
    }
}
