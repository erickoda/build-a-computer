use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde_json::json;
use tonic::Status;

/// Representa os erros globais que a aplicação pode assumir.
///
/// Estra estrutura centraliza o tratamento de erros da aplicação,
/// lidando com eventuais erros advindos da comunicação com os microsserviços
/// gRPC externos e transformando-os em mensagens HTTP. Além disso,
/// trata possíveis erros que tenha origem no próprio Gateway.
#[derive(Debug)]
pub enum AppError {
    /// Representa erros originários de uma comunicação gRPC.
    Grpc(Status),

    /// Representa erros internos arbitrários do API Gateway.
    InternalError(String),

    /// Representa erro de acesso não autorizado por usuário
    /// que tenta acessar uma rota que não possui acesso.
    Unauthorized(String),
}

/// Permite a conversão automática de erros gRPC para o formato do Gateway.
///
/// Graças a esta implementação, é possível utilizar o operador `?` diretamente
/// nas chamadas do cliente `tonic` para realizar a conversão automática de erro.
impl From<Status> for AppError {
    fn from(grpc_status: Status) -> Self {
        Self::Grpc(grpc_status)
    }
}

/// Define como o erro será formatado em texto para o usuário ou para os logs.
///
/// O comportamento é alterado com base na variante do enum, extraindo a
/// mensagem legível do `Status` do gRPC ou repassando as strings internas do Gateway.
impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            AppError::Grpc(status) => write!(f, "gRPC error: {}", status.message()),
            AppError::InternalError(msg) => write!(f, "Internal server error: {}", msg),
            AppError::Unauthorized(msg) => write!(f, "Unauthorized request: {}", msg),
        }
    }
}

/// Expande o erro para se adequar à biblioteca padrão do Rust (`std::error::Error`).
///
/// Esta implementação é crucial para compatibilidade com ecossistemas de terceiros,
/// como as bibliotecas de telemetry presentes neste projeto. Ela expõe a "causa raiz"
/// (source) de um erro em cadeia.
impl std::error::Error for AppError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            AppError::Grpc(status) => Some(status),
            AppError::InternalError(_) => None,
            AppError::Unauthorized(_) => None,
        }
    }
}

/// Permite a conversão automática de erros do App para o formato de resposta HTTP.
///
/// Graças a esta implementação, é possível utilizar o operador `?` diretamente
/// nas chamadas do cliente `tonic` para efetuar a conversão automática de erros
/// do App, ou provindos da comunicação gRPC, para erros HTTP.
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
