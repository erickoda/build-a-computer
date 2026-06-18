use std::env;

/// Configuração global da aplicação carregada a partir do ambiente.
#[derive(Clone)]
pub struct AppConfig {
    /// Segredo para assinatura e validação de tokens JWT. (Obrigatório)
    pub jwt_secret: String,

    /// Host onde o servidor será exposto. Padrão: `"0.0.0.0"`.
    pub host: String,

    /// URL do microsserviço de autenticação. Padrão: `"http://127.0.0.1:50051"`.
    pub auth_microservice_url: String,

    /// URL do microsserviço de usuários. Padrão: `"http://127.0.0.1:50051"`.
    pub users_microservice_url: String,

    /// URL do microsserviço de recomendação. Padrão: `"http://127.0.0.1:50052"`.
    pub recommendation_microservice_url: String,

    /// Porta de escuta do servidor HTTP. Padrão: `3000`.
    pub port: u16,
}

impl AppConfig {
    /// Inicializa `AppConfig` a partir do arquivo `.env` e variáveis de ambiente.
    ///
    /// # Panics
    ///
    /// Dá pânico se `JWT_SECRET` estiver ausente ou se `PORT` não for um número `u16` válido.
    pub fn from_env() -> Self {
        dotenvy::dotenv().ok();

        Self {
            jwt_secret: env::var("JWT_SECRET").expect("JWT_SECRET not defined"),
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "3000".to_string())
                .parse()
                .expect("INVALID TYPE FOR PORT"),
            auth_microservice_url: env::var("AUTH_MICROSERVICE_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:50051".to_string()),
            users_microservice_url: env::var("USERS_MICROSERVICE_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:50051".to_string()),
            recommendation_microservice_url: env::var("RECOMMENDATION_MICROSERVICE_URL")
                .unwrap_or_else(|_| "http://127.0.0.1:50052".to_string()),
        }
    }
}
