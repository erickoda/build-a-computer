use std::time::Duration;
use tonic::transport::{Channel, Endpoint};

use crate::errors::AppError;

/// Função genérica para a criação de um canal de comunicaça
/// persistente com um microsserviço gRPC.
///
/// Abstração da inicialização de um gRPC para prover serviços
/// consistentes e iguais entre todos os canais do gateway, como
/// timeout, limite de concorrência e keepalive.
///
/// # Erros
///
/// * Retorna [`AppError`] se a string da URL for mal formada.
/// * Retorna [`AppError`] se a conexão com o microsserviço falhar.
pub async fn create_channel(url: String) -> Result<Channel, AppError> {
    let endpoint = Endpoint::from_shared(url.clone())
        .map_err(|e| AppError::InternalError(format!("Invalid gRPC URL {}: {}", url, e)))?
        .timeout(Duration::from_secs(5))
        .concurrency_limit(256)
        .tcp_keepalive(Some(Duration::from_secs(60)));

    let channel = endpoint
        .connect()
        .await
        .map_err(|_| AppError::InternalError(format!("Failed to connect into gRPC: {}", url)))?;

    Ok(channel)
}
