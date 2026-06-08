use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;
use tonic::Status;

#[derive(Debug)]
pub enum AppError {
    Grpc(Status),
    InternalError(String),
    Unauthorized(String),
}

impl From<Status> for AppError {
    fn from(grpc_status: Status) -> Self {
        Self::Grpc(grpc_status)
    }
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Grpc(status) => write!(f, "gRPC error: {}", status.message()),
            AppError::InternalError(msg) => write!(f, "Internal server error: {}", msg),
            AppError::Unauthorized(msg) => write!(f, "Unauthorized request: {}", msg),
        }
    }
}

impl std::error::Error for AppError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            AppError::Grpc(status) => Some(status),
            AppError::InternalError(_) => None,
            AppError::Unauthorized(_) => None,
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status_code, error_message) = match self {
            AppError::Grpc(status) => {
                let http_code = match status.code() {
                    tonic::Code::Ok => StatusCode::OK,
                    tonic::Code::Cancelled => StatusCode::REQUEST_TIMEOUT,
                    tonic::Code::Unknown => StatusCode::INTERNAL_SERVER_ERROR,
                    tonic::Code::InvalidArgument => StatusCode::BAD_REQUEST,
                    tonic::Code::DeadlineExceeded => StatusCode::GATEWAY_TIMEOUT,
                    tonic::Code::NotFound => StatusCode::NOT_FOUND,
                    tonic::Code::AlreadyExists => StatusCode::CONFLICT,
                    tonic::Code::PermissionDenied => StatusCode::FORBIDDEN,
                    tonic::Code::ResourceExhausted => StatusCode::TOO_MANY_REQUESTS,
                    tonic::Code::FailedPrecondition => StatusCode::PRECONDITION_FAILED,
                    tonic::Code::Aborted => StatusCode::CONFLICT,
                    tonic::Code::OutOfRange => StatusCode::BAD_REQUEST,
                    tonic::Code::Unimplemented => StatusCode::NOT_IMPLEMENTED,
                    tonic::Code::Internal => StatusCode::INTERNAL_SERVER_ERROR,
                    tonic::Code::Unavailable => StatusCode::SERVICE_UNAVAILABLE,
                    tonic::Code::DataLoss => StatusCode::INTERNAL_SERVER_ERROR,
                    tonic::Code::Unauthenticated => StatusCode::UNAUTHORIZED,
                };
                (http_code, status.message().to_string())
            }
            AppError::InternalError(error_msg) => (StatusCode::INTERNAL_SERVER_ERROR, error_msg),
            AppError::Unauthorized(error_msg) => (StatusCode::UNAUTHORIZED, error_msg),
        };

        let body = Json(json!({
            "error": {
                "message": error_message,
                "status": status_code.as_u16()
            }
        }));

        (status_code, body).into_response()
    }
}
