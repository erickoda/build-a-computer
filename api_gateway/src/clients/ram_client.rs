use tonic::transport::Channel;

use crate::{
    benchmark_grpc, clients::metadata::with_auth_metadata, errors::AppError,
    security::token::AuthenticatedUser,
};

/// Wrapper para o cliente gRPC do `RAMService` do microsserviço de benchmark.
#[derive(Clone)]
pub struct RamClientWrapper {
    inner_client: benchmark_grpc::ram_service_client::RamServiceClient<Channel>,
}

impl RamClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: benchmark_grpc::ram_service_client::RamServiceClient::new(channel),
        }
    }

    /// Cria uma nova memória RAM no catálogo do microsserviço de benchmark.
    pub async fn create_ram(
        &self,
        payload: benchmark_grpc::CreateRamRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::RamResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.create_ram(grpc_request).await?.into_inner())
    }

    /// Busca uma memória RAM específica pelo seu ID.
    pub async fn get_ram(&self, id: String) -> Result<benchmark_grpc::RamResponse, AppError> {
        let payload = benchmark_grpc::GetRamRequest { id };

        let mut client = self.inner_client.clone();

        Ok(client.get_ram(payload).await?.into_inner())
    }

    /// Lista todas as memórias RAM cadastradas.
    pub async fn list_rams(&self) -> Result<benchmark_grpc::ListRamResponse, AppError> {
        let payload = benchmark_grpc::ListRamRequest {};

        let mut client = self.inner_client.clone();

        Ok(client.list_ra_ms(payload).await?.into_inner())
    }

    /// Remove uma memória RAM do catálogo com base no seu ID.
    pub async fn delete_ram(
        &self,
        id: String,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::DeleteRamResponse, AppError> {
        let payload = benchmark_grpc::DeleteRamRequest { id };

        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.delete_ram(grpc_request).await?.into_inner())
    }
}
