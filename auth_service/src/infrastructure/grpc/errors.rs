use tonic::Status;

use crate::application::errors::{AuthServiceError, UserServiceError};

impl From<AuthServiceError> for Status {
    fn from(auth_service_error: AuthServiceError) -> Self {
        match auth_service_error {
            AuthServiceError::InternalError(error) => Self::internal(error),
            AuthServiceError::InvalidCredentials => Self::unauthenticated("Invalid Credentials"),
        }
    }
}

impl From<UserServiceError> for Status {
    fn from(user_service_error: UserServiceError) -> Self {
        match user_service_error {
            UserServiceError::NotFound => Self::not_found("User not found!"),
            UserServiceError::Forbidden => {
                Self::permission_denied("User does not have access to this route!")
            }
            UserServiceError::Conflict(err) => Self::already_exists(err),
            UserServiceError::InternalError(err) => Self::internal(err),
            UserServiceError::ValidationError(err) => Self::invalid_argument(err),
        }
    }
}
