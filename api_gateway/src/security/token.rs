use crate::errors::AppError;

pub struct AuthenticatedUser {
    pub id: String,
    pub role: String,
}

pub trait TokenValidator: Send + Sync {
    fn validate(&self, token: &str) -> Result<AuthenticatedUser, AppError>;
}
