use serde::Deserialize;
use utoipa::ToSchema;

/// Estrutura que representa os dados de entrada para solicitar uma recomendação de PC.
#[derive(Deserialize, ToSchema)]
pub struct RecommendationRequestDto {
    /// Lista de jogos que o usuário deseja rodar.
    games: Vec<String>,
    /// Preço máximo que o usuário está disposto a pagar.
    max_price: f32,
    /// Resolução alvo (ex: 1080, 1440, 2160).
    resolution: i32,
    /// Nível de performance desejado.
    computer_performance: String,
}

impl RecommendationRequestDto {
    /// Retorna uma referência à lista de jogos solicitados.
    pub fn get_games(&self) -> &Vec<String> {
        &self.games
    }

    /// Retorna o preço máximo definido para a configuração.
    pub fn get_max_price(&self) -> f32 {
        self.max_price
    }

    /// Retorna a resolução de tela alvo.
    pub fn get_resolution(&self) -> i32 {
        self.resolution
    }

    /// Retorna uma fatia de string (`&str`) com a performance computacional desejada.
    pub fn get_computer_performance(&self) -> &str {
        &self.computer_performance
    }
}
