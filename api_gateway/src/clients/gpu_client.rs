use tonic::transport::Channel;

use crate::{
    benchmark_grpc, clients::metadata::with_auth_metadata, errors::AppError,
    security::token::AuthenticatedUser,
};

/// Wrapper para o cliente gRPC do `GPUService` do microsserviço de benchmark.
#[derive(Clone)]
pub struct GpuClientWrapper {
    inner_client: benchmark_grpc::gpu_service_client::GpuServiceClient<Channel>,
}

impl GpuClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: benchmark_grpc::gpu_service_client::GpuServiceClient::new(channel),
        }
    }

    /// Cria uma nova GPU no catálogo do microsserviço de benchmark.
    pub async fn create_gpu(
        &self,
        payload: benchmark_grpc::CreateGpuRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::GpuResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.create_gpu(grpc_request).await?.into_inner())
    }

    /// Busca uma GPU específica pelo seu ID.
    pub async fn get_gpu(&self, id: String) -> Result<benchmark_grpc::GpuResponse, AppError> {
        let payload = benchmark_grpc::GetGpuRequest { id };

        let mut client = self.inner_client.clone();

        Ok(client.get_gpu(payload).await?.into_inner())
    }

    /// Lista todas as GPUs cadastradas.
    pub async fn list_gpus(&self) -> Result<benchmark_grpc::ListGpuResponse, AppError> {
        let payload = benchmark_grpc::ListGpuRequest {};

        let mut client = self.inner_client.clone();

        Ok(client.list_gp_us(payload).await?.into_inner())
    }

    /// Atualiza uma GPU existente no catálogo do microsserviço de benchmark.
    pub async fn update_gpu(
        &self,
        payload: benchmark_grpc::UpdateGpuRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::GpuResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.update_gpu(grpc_request).await?.into_inner())
    }

    /// Remove uma GPU do catálogo com base no seu ID.
    pub async fn delete_gpu(
        &self,
        id: String,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::DeleteGpuResponse, AppError> {
        let payload = benchmark_grpc::DeleteGpuRequest { id };

        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.delete_gpu(grpc_request).await?.into_inner())
    }
}
