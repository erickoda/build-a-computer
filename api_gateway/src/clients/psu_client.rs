use tonic::transport::Channel;

use crate::{
    benchmark_grpc, clients::metadata::with_auth_metadata, errors::AppError,
    security::token::AuthenticatedUser,
};

/// Wrapper para o cliente gRPC do `PSUService` do microsserviço de benchmark.
#[derive(Clone)]
pub struct PsuClientWrapper {
    inner_client: benchmark_grpc::psu_service_client::PsuServiceClient<Channel>,
}

impl PsuClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: benchmark_grpc::psu_service_client::PsuServiceClient::new(channel),
        }
    }

    /// Cria uma nova fonte de alimentação no catálogo do microsserviço de benchmark.
    pub async fn create_psu(
        &self,
        payload: benchmark_grpc::CreatePsuRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::PsuResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.create_psu(grpc_request).await?.into_inner())
    }

    /// Busca uma fonte de alimentação específica pelo seu ID.
    pub async fn get_psu(&self, id: String) -> Result<benchmark_grpc::PsuResponse, AppError> {
        let payload = benchmark_grpc::GetPsuRequest { id };

        let mut client = self.inner_client.clone();

        Ok(client.get_psu(payload).await?.into_inner())
    }

    /// Lista todas as fontes de alimentação cadastradas.
    pub async fn list_psus(&self) -> Result<benchmark_grpc::ListPsuResponse, AppError> {
        let payload = benchmark_grpc::ListPsuRequest {};

        let mut client = self.inner_client.clone();

        Ok(client.list_ps_us(payload).await?.into_inner())
    }

    /// Atualiza uma fonte de alimentação existente no catálogo do microsserviço de benchmark.
    pub async fn update_psu(
        &self,
        payload: benchmark_grpc::UpdatePsuRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::PsuResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.update_psu(grpc_request).await?.into_inner())
    }

    /// Remove uma fonte de alimentação do catálogo com base no seu ID.
    pub async fn delete_psu(
        &self,
        id: String,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::DeletePsuResponse, AppError> {
        let payload = benchmark_grpc::DeletePsuRequest { id };

        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.delete_psu(grpc_request).await?.into_inner())
    }
}
