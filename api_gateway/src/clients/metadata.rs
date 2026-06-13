use tonic::{Request as TonicRequest, metadata::MetadataValue};

use crate::{errors::AppError, security::token::AuthenticatedUser};

/// Transforma um payload genérico em uma requisição gRPC [`TonicRequest`] com metadados de autenticação.
///
/// Esta função intercepta o payload destinado ao microsserviço e injeta no cabeçalho
/// (metadata) da requisição o ID (`x-user-id`) e o cargo (`x-user-role`) do usuário.
///
/// # Erros
///
/// Retorna [`AppError::InternalError`] caso as strings contidas em `user.id` ou
/// `user.role` tenham formatos inválidos que impeçam a sua conversão para
/// `MetadataValue`.
pub fn with_auth_metadata<T>(
    payload: T,
    user: &AuthenticatedUser,
) -> Result<TonicRequest<T>, AppError> {
    let mut request = TonicRequest::new(payload);

    let id_meta = MetadataValue::try_from(&user.id)
        .map_err(|_| AppError::InternalError("Failed to format metadata".into()))?;

    let role_meta = MetadataValue::try_from(&user.role)
        .map_err(|_| AppError::InternalError("Failed to format metadata".into()))?;

    request.metadata_mut().insert("x-user-id", id_meta);
    request.metadata_mut().insert("x-user-role", role_meta);

    Ok(request)
}
