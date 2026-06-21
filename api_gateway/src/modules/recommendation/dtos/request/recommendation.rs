use serde::Deserialize;
use utoipa::IntoParams;

/// Estrutura que representa os dados de entrada para solicitar uma recomendação de PC.
///
/// Recebida via query string; `games` chega como uma lista de IDs separados por vírgula
/// (ex: `games=id-1,id-2`) pois `serde_urlencoded` não suporta `Vec<String>` nativamente.
#[derive(Deserialize, IntoParams)]
pub struct RecommendationRequestDto {
    /// Lista de jogos que o usuário deseja rodar, separados por vírgula.
    games: String,
    /// Preço máximo que o usuário está disposto a pagar.
    max_price: f32,
    /// Resolução alvo (ex: 1080, 1440, 2160).
    resolution: i32,
    /// Nível de performance desejado.
    computer_performance: String,
}

impl RecommendationRequestDto {
    /// Retorna a lista de jogos solicitados, separando o campo por vírgulas.
    pub fn get_games(&self) -> Vec<String> {
        self.games
            .split(',')
            .map(str::trim)
            .filter(|game| !game.is_empty())
            .map(String::from)
            .collect()
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
