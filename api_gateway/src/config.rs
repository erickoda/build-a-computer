use std::env;

#[derive(Clone)]
pub struct AppConfig {
    pub jwt_secret: String,
    pub host: String,
    pub auth_microservice_url: String,
    pub users_microservice_url: String,
    pub port: u16,
}

impl AppConfig {
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
        }
    }
}
