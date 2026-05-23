use crate::application::errors::{AuthServiceError, UserUseCaseError};

impl From<UserUseCaseError> for actix_web::Error {
    fn from(user_service_errors: UserUseCaseError) -> Self {
        match user_service_errors {
            UserUseCaseError::ValidationError(error) => actix_web::error::ErrorBadRequest(error),
            UserUseCaseError::Conflict(error) => actix_web::error::ErrorConflict(error),
            UserUseCaseError::InternalError(error) => {
                actix_web::error::ErrorInternalServerError(error)
            }
            UserUseCaseError::NotFound => {
                actix_web::error::ErrorNotFound(UserUseCaseError::NotFound.to_string())
            }
            UserUseCaseError::Forbidden => {
                actix_web::error::ErrorForbidden(UserUseCaseError::Forbidden.to_string())
            }
        }
    }
}

impl From<AuthServiceError> for actix_web::Error {
    fn from(auth_service_errors: AuthServiceError) -> Self {
        match auth_service_errors {
            AuthServiceError::InvalidCredentials => {
                actix_web::error::ErrorUnauthorized("Invalid Credentials")
            }
            AuthServiceError::InternalError(err) => actix_web::error::ErrorInternalServerError(err),
        }
    }
}
