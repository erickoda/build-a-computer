use tonic::transport::Channel;

use crate::{
    benchmark_grpc, clients::metadata::with_auth_metadata, errors::AppError,
    security::token::AuthenticatedUser,
};

/// Wrapper para o cliente gRPC do `BenchmarkService`.
///
/// Mantém o canal de comunicação persistente com o microsserviço de benchmark.
#[derive(Clone)]
pub struct BenchmarkClientWrapper {
    inner_client: benchmark_grpc::benchmark_service_client::BenchmarkServiceClient<Channel>,
}

impl BenchmarkClientWrapper {
    /// Inicializa um novo wrapper utilizando um `Channel` existente.
    pub fn new(channel: Channel) -> Self {
        Self {
            inner_client:
                benchmark_grpc::benchmark_service_client::BenchmarkServiceClient::new(channel),
        }
    }

    /// Cria um novo benchmark no microsserviço.
    pub async fn create_benchmark(
        &self,
        payload: benchmark_grpc::CreateBenchmarkRequest,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::BenchmarkResponse, AppError> {
        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.create_benchmark(grpc_request).await?.into_inner())
    }

    /// Busca um benchmark específico pelo seu ID.
    pub async fn get_benchmark(
        &self,
        id: String,
    ) -> Result<benchmark_grpc::BenchmarkResponse, AppError> {
        let payload = benchmark_grpc::GetBenchmarkRequest { id };

        let mut client = self.inner_client.clone();

        Ok(client.get_benchmark(payload).await?.into_inner())
    }

    /// Lista todos os benchmarks cadastrados.
    pub async fn list_benchmarks(
        &self,
    ) -> Result<benchmark_grpc::ListBenchmarkResponse, AppError> {
        let payload = benchmark_grpc::ListBenchmarkRequest {};

        let mut client = self.inner_client.clone();

        Ok(client.list_benchmarks(payload).await?.into_inner())
    }

    /// Remove um benchmark do sistema com base no seu ID.
    pub async fn delete_benchmark(
        &self,
        id: String,
        authenticated_user: &AuthenticatedUser,
    ) -> Result<benchmark_grpc::DeleteBenchmarkResponse, AppError> {
        let payload = benchmark_grpc::DeleteBenchmarkRequest { id };

        let grpc_request = with_auth_metadata(payload, authenticated_user)?;

        let mut client = self.inner_client.clone();

        Ok(client.delete_benchmark(grpc_request).await?.into_inner())
    }

    /// Busca benchmarks aplicando filtros opcionais de hardware/jogo/usuário.
    pub async fn get_with_filters(
        &self,
        payload: benchmark_grpc::GetBenchmarkWithFilters,
    ) -> Result<benchmark_grpc::ListBenchmarkResponse, AppError> {
        let mut client = self.inner_client.clone();

        Ok(client.get_with_filters(payload).await?.into_inner())
    }

    /// Busca todos os benchmarks pertencentes a um usuário específico.
    pub async fn get_of_an_user(
        &self,
        user_id: String,
    ) -> Result<benchmark_grpc::ListBenchmarkResponse, AppError> {
        let payload = benchmark_grpc::GetBenchmarksOfAnUser { user_id };

        let mut client = self.inner_client.clone();

        Ok(client.get_of_an_user(payload).await?.into_inner())
    }

    /// Busca benchmarks cujo título corresponda ao informado.
    pub async fn list_by_title(
        &self,
        title: String,
    ) -> Result<benchmark_grpc::ListBenchmarkResponse, AppError> {
        let payload = benchmark_grpc::ListBenchmarksByTitleRequest { title };

        let mut client = self.inner_client.clone();

        Ok(client.list_by_title(payload).await?.into_inner())
    }
}
