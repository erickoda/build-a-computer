use jsonwebtoken::{DecodingKey, Validation, decode, errors::ErrorKind};
use serde::Deserialize;

use crate::{
    errors::AppError,
    security::token::{AuthenticatedUser, TokenValidator},
};

/// Representa os dados (claims) contidos no payload do JWT.
#[derive(Debug, Deserialize)]
pub struct TokenClaims {
    /// ID (Subject) do usuário.
    pub sub: String,
    /// Cargo do usuário no sistema.
    pub role: String,
}

/// Validador de tokens JWT utilizando um segredo simétrico.
pub struct JwtValidator {
    /// Segredo JWT
    jwt_secret: String,
}

impl JwtValidator {
    /// Instancia um novo validador com a chave secreta fornecida.
    pub fn new(jwt_secret: String) -> Self {
        Self { jwt_secret }
    }
}

impl TokenValidator for JwtValidator {
    /// Decodifica e valida a assinatura de um token JWT.
    ///
    /// # Erros
    ///
    /// * Retorna `AppError::Unauthorized` se o token estiver expirado, inválido ou mal assinado.
    /// * Retorna `AppError::InternalError` em caso de falhas inesperadas na decodificação.
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
