use axum::{
    extract::{FromRef, FromRequestParts},
    http::request::Parts,
};
use std::sync::Arc;

use crate::{
    errors::AppError,
    security::token::{AuthenticatedUser, TokenValidator},
};

/// Implementa um `Extractor` que visa extrair informações do usuário
/// autenticado para o Axum.
///
/// Qualquer handler do Axum pode simplesmente pedir por um argumento
/// do tipo `AuthenticatedUser`. O Axum chamará esta função automaticamente
/// antes de executar a rota, garantindo a segurança da rota.
impl<S> FromRequestParts<S> for AuthenticatedUser
where
    S: Send + Sync,
    Arc<dyn TokenValidator>: FromRef<S>,
{
    type Rejection = AppError;

    /// Intercepta os cabeçalhos da requisição, extrai e valida o token Bearer.
    ///
    /// # Erros
    ///
    /// Esta função rejeitará a requisição (abortando a chamada ao handler) repassando
    /// um `AppError` caso:
    /// * O header `Authorization` não seja enviado.
    /// * O formato do header `Authorization` não comece com o prefixo `"Bearer "`.
    /// * O token fornecido seja inválido de acordo com as regras do `TokenValidator`
    ///   injetado no estado da aplicação.
    async fn from_request_parts(parts: &mut Parts, state: &S) -> Result<Self, Self::Rejection> {
        let auth_header = parts
            .headers
            .get("Authorization")
            .and_then(|h| h.to_str().ok())
            .filter(|h| h.starts_with("Bearer "))
            .ok_or_else(|| AppError::Unauthorized("Token ausente ou inválido".into()))?;

        let token = auth_header.trim_start_matches("Bearer ");

        // Recupera a dependência de validação do estado global de forma segura
        let validator = Arc::<dyn TokenValidator>::from_ref(state);

        // Retorna o usuário validado ou o erro caso a validação falhe
        validator.validate(token)
    }
}
