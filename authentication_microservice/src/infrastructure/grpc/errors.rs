use tonic::Status;

use crate::application::errors::{AuthServiceError, UserUseCaseError};

/// Converte os erros do fluxo de Autenticação em Status do gRPC.
///
/// Mapeia falhas de login genéricas para [`Status::unauthenticated`] (equivalente ao HTTP 401)
/// e falhas do servidor para [`Self::internal`] (HTTP 500).
impl From<AuthServiceError> for Status {
    fn from(auth_service_error: AuthServiceError) -> Self {
        match auth_service_error {
            AuthServiceError::InternalError(error) => Self::internal(error),
            AuthServiceError::InvalidCredentials => Self::unauthenticated("Invalid Credentials"),
        }
    }
}

/// Converte os erros do fluxo de Gerenciamento de Usuários em Status do gRPC.
///
/// Faz o roteamento semântico detalhado:
/// * [`UserUseCaseError::NotFound`] -> [`Status::not_found`]
/// * [`UserUseCaseError::Forbidden`] -> [`Status::permission_denied`]
/// * [`UserUseCaseError::Conflict`] -> [`Status::already_exists`]
/// * [`UserUseCaseError::ValidationError`] -> [`Status::invalid_argument`]
/// * [`UserUseCaseError::InternalError`] -> [`Status::internal`]
impl From<UserUseCaseError> for Status {
    fn from(user_service_error: UserUseCaseError) -> Self {
        match user_service_error {
            UserUseCaseError::NotFound => Self::not_found("User not found!"),
            UserUseCaseError::Forbidden => {
                Self::permission_denied("User does not have access to this route!")
            }
            UserUseCaseError::Conflict(err) => Self::already_exists(err),
            UserUseCaseError::InternalError(err) => Self::internal(err),
            UserUseCaseError::ValidationError(err) => Self::invalid_argument(err),
        }
    }
}
