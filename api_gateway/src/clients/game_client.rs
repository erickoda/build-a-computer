use tonic::transport::Channel;

use crate::{
    benchmark_grpc, clients::metadata::with_auth_metadata, errors::AppError,
    security::token::AuthenticatedUser,
};

/// Wrapper para o cliente gRPC do `GameService` do microsserviço de benchmark.
#[derive(Clone)]
pub struct GameClientWrapper {
    inner_client: benchmark_grpc::game_service_client::GameServiceClient<Channel>,
}

impl GameClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: benchmark_grpc::game_service_client::GameServiceClient::new(channel),
        }
    }

    /// Cria um novo jogo no catálogo do microsserviço de benchmark.
    pub async fn create_game(
        &self,
        payload: benchmark_grpc::CreateGameRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::GameResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.create_game(grpc_request).await?.into_inner())
    }

    /// Busca um jogo específico pelo seu ID.
    pub async fn get_game(&self, id: String) -> Result<benchmark_grpc::GameResponse, AppError> {
        let payload = benchmark_grpc::GetGameRequest { id };

        let mut client = self.inner_client.clone();

        Ok(client.get_game(payload).await?.into_inner())
    }

    /// Lista todos os jogos cadastrados.
    pub async fn list_games(&self) -> Result<benchmark_grpc::ListGameResponse, AppError> {
        let payload = benchmark_grpc::ListGameRequest {};

        let mut client = self.inner_client.clone();

        Ok(client.list_games(payload).await?.into_inner())
    }

    /// Remove um jogo do catálogo com base no seu ID.
    pub async fn delete_game(
        &self,
        id: String,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::DeleteGameResponse, AppError> {
        let payload = benchmark_grpc::DeleteGameRequest { id };

        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.delete_game(grpc_request).await?.into_inner())
    }
}
