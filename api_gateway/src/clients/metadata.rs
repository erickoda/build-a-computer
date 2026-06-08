use tonic::{metadata::MetadataValue, Request as TonicRequest};

use crate::{errors::AppError, security::token::AuthenticatedUser};

pub fn with_auth_metadata<T>(
    payload: T,
    user: &AuthenticatedUser,
) -> Result<TonicRequest<T>, AppError> {
    let mut request = TonicRequest::new(payload);

    let id_meta = MetadataValue::try_from(&user.id)
        .map_err(|_| AppError::InternalError("Erro ao formatar metadados".into()))?;

    let role_meta = MetadataValue::try_from(&user.role)
        .map_err(|_| AppError::InternalError("Erro ao formatar metadados".into()))?;

    request.metadata_mut().insert("x-user-id", id_meta);
    request.metadata_mut().insert("x-user-role", role_meta);

    Ok(request)
}
