use tonic::transport::Channel;

use crate::{
    benchmark_grpc, clients::metadata::with_auth_metadata, errors::AppError,
    security::token::AuthenticatedUser,
};

/// Wrapper para o cliente gRPC do `CPUService` do microsserviço de benchmark.
#[derive(Clone)]
pub struct CpuClientWrapper {
    inner_client: benchmark_grpc::cpu_service_client::CpuServiceClient<Channel>,
}

impl CpuClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: benchmark_grpc::cpu_service_client::CpuServiceClient::new(channel),
        }
    }

    /// Cria uma nova CPU no catálogo do microsserviço de benchmark.
    pub async fn create_cpu(
        &self,
        payload: benchmark_grpc::CreateCpuRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::CpuResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.create_cpu(grpc_request).await?.into_inner())
    }

    /// Busca uma CPU específica pelo seu ID.
    pub async fn get_cpu(&self, id: String) -> Result<benchmark_grpc::CpuResponse, AppError> {
        let payload = benchmark_grpc::GetCpuRequest { id };

        let mut client = self.inner_client.clone();

        Ok(client.get_cpu(payload).await?.into_inner())
    }

    /// Lista todas as CPUs cadastradas.
    pub async fn list_cpus(&self) -> Result<benchmark_grpc::ListCpuResponse, AppError> {
        let payload = benchmark_grpc::ListCpuRequest {};

        let mut client = self.inner_client.clone();

        Ok(client.list_cp_us(payload).await?.into_inner())
    }

    /// Atualiza uma CPU existente no catálogo do microsserviço de benchmark.
    pub async fn update_cpu(
        &self,
        payload: benchmark_grpc::UpdateCpuRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::CpuResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.update_cpu(grpc_request).await?.into_inner())
    }

    /// Remove uma CPU do catálogo com base no seu ID.
    pub async fn delete_cpu(
        &self,
        id: String,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::DeleteCpuResponse, AppError> {
        let payload = benchmark_grpc::DeleteCpuRequest { id };

        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.delete_cpu(grpc_request).await?.into_inner())
    }
}
