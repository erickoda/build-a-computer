use tonic::transport::Channel;

use crate::{
    errors::AppError,
    recommendation_grpc::{self, builder_service_client::BuilderServiceClient},
};

/// Wrapper para o cliente gRPC de recomendação.
///
/// Mantém o canal de comunicação persistente com o microsserviço.
#[derive(Clone)]
pub struct RecommendationClientWrapper {
    inner_client: BuilderServiceClient<Channel>,
}

impl RecommendationClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client: BuilderServiceClient::new(channel),
        }
    }

    pub async fn recommned(
        &self,
        games: Vec<String>,
        max_price: f32,
        resolution: i32,
        computer_performance: String,
    ) -> Result<recommendation_grpc::BuildPcResponse, AppError> {
        let grpc_payload = recommendation_grpc::BuildPcRequest {
            games,
            max_price,
            resolution,
            computer_performance,
        };

        let mut client = self.inner_client.clone();

        Ok(client.build_pc(grpc_payload).await?.into_inner())
    }
}
