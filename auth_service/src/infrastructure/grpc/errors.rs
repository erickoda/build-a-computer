use tonic::Status;

use crate::application::errors::{AuthServiceError, UserUseCaseError};

impl From<AuthServiceError> for Status {
    fn from(auth_service_error: AuthServiceError) -> Self {
        match auth_service_error {
            AuthServiceError::InternalError(error) => Self::internal(error),
            AuthServiceError::InvalidCredentials => Self::unauthenticated("Invalid Credentials"),
        }
    }
}

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
