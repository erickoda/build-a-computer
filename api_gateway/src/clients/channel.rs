use std::time::Duration;
use tonic::transport::{Channel, Endpoint};

use crate::errors::AppError;

// TODO: Add tls config
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
