use tonic::transport::Channel;

use crate::{
    benchmark_grpc, clients::metadata::with_auth_metadata, errors::AppError,
    security::token::AuthenticatedUser,
};

/// Wrapper para o cliente gRPC do `MotherBoardService` do microsserviço de benchmark.
#[derive(Clone)]
pub struct MotherBoardClientWrapper {
    inner_client: benchmark_grpc::mother_board_service_client::MotherBoardServiceClient<Channel>,
}

impl MotherBoardClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client:
                benchmark_grpc::mother_board_service_client::MotherBoardServiceClient::new(
                    channel,
                ),
        }
    }

    /// Cria uma nova placa-mãe no catálogo do microsserviço de benchmark.
    pub async fn create_motherboard(
        &self,
        payload: benchmark_grpc::CreateMotherBoardRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::MotherBoardResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.create_mother_board(grpc_request).await?.into_inner())
    }

    /// Busca uma placa-mãe específica pelo seu ID.
    pub async fn get_motherboard(
        &self,
        id: String,
    ) -> Result<benchmark_grpc::MotherBoardResponse, AppError> {
        let payload = benchmark_grpc::GetMotherBoardRequest { id };

        let mut client = self.inner_client.clone();

        Ok(client.get_mother_board(payload).await?.into_inner())
    }

    /// Lista todas as placas-mãe cadastradas.
    pub async fn list_motherboards(
        &self,
    ) -> Result<benchmark_grpc::ListMotherBoardResponse, AppError> {
        let payload = benchmark_grpc::ListMotherBoardRequest {};

        let mut client = self.inner_client.clone();

        Ok(client.list_mother_boards(payload).await?.into_inner())
    }

    /// Atualiza uma placa-mãe existente no catálogo do microsserviço de benchmark.
    pub async fn update_motherboard(
        &self,
        payload: benchmark_grpc::UpdateMotherBoardRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::MotherBoardResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.update_mother_board(grpc_request).await?.into_inner())
    }

    /// Remove uma placa-mãe do catálogo com base no seu ID.
    pub async fn delete_motherboard(
        &self,
        id: String,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::DeleteMotherBoardResponse, AppError> {
        let payload = benchmark_grpc::DeleteMotherBoardRequest { id };

        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.delete_mother_board(grpc_request).await?.into_inner())
    }
}
