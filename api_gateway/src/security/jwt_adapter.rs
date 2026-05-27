use jsonwebtoken::{DecodingKey, Validation, decode, errors::ErrorKind};
use serde::Deserialize;

use crate::{
    errors::AppError,
    security::token::{AuthenticatedUser, TokenValidator},
};

#[derive(Debug, Deserialize)]
struct TokenClaims {
    pub sub: String,
    pub role: String,
}

pub struct JwtValidator {
    jwt_secret: String,
}

impl JwtValidator {
    pub fn new(jwt_secret: String) -> Self {
        Self { jwt_secret }
    }
}

impl TokenValidator for JwtValidator {
    fn validate(&self, token: &str) -> Result<AuthenticatedUser, AppError> {
        let token_data = decode::<TokenClaims>(
            token,
            &DecodingKey::from_secret(self.jwt_secret.as_ref()),
            &Validation::default(),
        )
        .map_err(|err| match err.kind() {
            ErrorKind::ExpiredSignature => {
                AppError::Unauthorized("Token expirado. Faça login novamente.".into())
            }
            ErrorKind::InvalidToken | ErrorKind::InvalidSignature => {
                AppError::Unauthorized("Token inválido ou assinatura incorreta.".into())
            }
            _ => AppError::InternalError("Erro interno ao processar a autenticação.".into()),
        })?;

        Ok(AuthenticatedUser {
            id: token_data.claims.sub,
            role: token_data.claims.role,
        })
    }
}
