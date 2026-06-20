use tonic::transport::Channel;

use crate::{
    benchmark_grpc, clients::metadata::with_auth_metadata, errors::AppError,
    security::token::AuthenticatedUser,
};

/// Wrapper para o cliente gRPC do `SSDService` do microsserviço de benchmark.
#[derive(Clone)]
pub struct SsdClientWrapper {
    inner_client: benchmark_grpc::ssd_service_client::SsdServiceClient<Channel>,
}

impl SsdClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: benchmark_grpc::ssd_service_client::SsdServiceClient::new(channel),
        }
    }

    /// Cria um novo SSD no catálogo do microsserviço de benchmark.
    pub async fn create_ssd(
        &self,
        payload: benchmark_grpc::CreateSsdRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::SsdResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.create_ssd(grpc_request).await?.into_inner())
    }

    /// Busca um SSD específico pelo seu ID.
    pub async fn get_ssd(&self, id: String) -> Result<benchmark_grpc::SsdResponse, AppError> {
        let payload = benchmark_grpc::GetSsdRequest { id };

        let mut client = self.inner_client.clone();

        Ok(client.get_ssd(payload).await?.into_inner())
    }

    /// Lista todos os SSDs cadastrados.
    pub async fn list_ssds(&self) -> Result<benchmark_grpc::ListSsdResponse, AppError> {
        let payload = benchmark_grpc::ListSsdRequest {};

        let mut client = self.inner_client.clone();

        Ok(client.list_ss_ds(payload).await?.into_inner())
    }

    /// Remove um SSD do catálogo com base no seu ID.
    pub async fn delete_ssd(
        &self,
        id: String,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::DeleteSsdResponse, AppError> {
        let payload = benchmark_grpc::DeleteSsdRequest { id };

        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.delete_ssd(grpc_request).await?.into_inner())
    }
}
