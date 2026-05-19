use crate::application::errors::{AuthServiceError, UserServiceError};

impl From<UserServiceError> for actix_web::Error {
    fn from(user_service_errors: UserServiceError) -> Self {
        match user_service_errors {
            UserServiceError::ValidationError(error) => actix_web::error::ErrorBadRequest(error),
            UserServiceError::Conflict(error) => actix_web::error::ErrorConflict(error),
            UserServiceError::InternalError(error) => {
                actix_web::error::ErrorInternalServerError(error)
            }
            UserServiceError::NotFound => actix_web::error::ErrorNotFound("Not Found"),
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
