use axum::{extract::FromRequestParts, http::request::Parts};
use jsonwebtoken::{decode, errors::ErrorKind, DecodingKey, Validation};
use serde::Deserialize;
use tonic::{metadata::MetadataValue, Request as TonicRequest};

use crate::errors::AppError;

#[derive(Debug, Deserialize)]
pub struct TokenClaims {
    pub sub: String,
    pub role: String,
}

pub struct AuthenticatedUser {
    pub id: String,
    pub role: String,
}

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|h| h.to_str().ok())
            .filter(|h| h.starts_with("Bearer "))
            .ok_or_else(|| AppError::Unauthorized("Token ausente ou inválido".into()))?;

        let token = auth_header.trim_start_matches("Bearer ");

        let token_data = decode::<TokenClaims>(
            token,
            &DecodingKey::from_secret("sua_chave_secreta".as_ref()),
            &Validation::default(),
        )
        .map_err(|err| match err.kind() {
            ErrorKind::ExpiredSignature => {
                AppError::Unauthorized("Token expirado. Faça login novamente.".into())
            }
            ErrorKind::InvalidToken | ErrorKind::InvalidSignature => {
                AppError::Unauthorized("Token inválido ou assinatura incorreta.".into())
            }
            _ => AppError::IntenalError("Erro interno ao processar a autenticação.".into()),
        })?;

        Ok(AuthenticatedUser {
            id: token_data.claims.sub,
            role: token_data.claims.role,
        })
    }
}

pub fn with_auth_metadata<T>(
    payload: T,
    user: &AuthenticatedUser,
) -> Result<TonicRequest<T>, AppError> {
    let mut request = TonicRequest::new(payload);

    let role_meta = MetadataValue::try_from(&user.role)
        .map_err(|_| AppError::IntenalError("Erro ao formatar metadados".into()))?;

    request.metadata_mut().insert("x-user-role", role_meta);

    Ok(request)
}
