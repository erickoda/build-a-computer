use axum::{
    extract::{FromRef, FromRequestParts},
    http::request::Parts,
};
use std::sync::Arc;

use crate::{
    errors::AppError,
    security::token::{AuthenticatedUser, TokenValidator},
};

impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
    Arc<dyn TokenValidator>: FromRef<S>,
{
    type Rejection = AppError;

    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|h| h.to_str().ok())
            .filter(|h| h.starts_with("Bearer "))
            .ok_or_else(|| AppError::Unauthorized("Token ausente ou inválido".into()))?;

        let token = auth_header.trim_start_matches("Bearer ");

        let validator = Arc::<dyn TokenValidator>::from_ref(state);

        validator.validate(token)
    }
}
