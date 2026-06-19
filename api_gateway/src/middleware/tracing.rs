use std::{sync::Arc, time::Duration};

use axum::{extract::Request, http::Response};
use tower_http::{
    classify::{ServerErrorsAsFailures, SharedClassifier},
    trace::{MakeSpan, OnRequest, OnResponse, TraceLayer},
};
use tracing::{Span, info, info_span};

use crate::security::token::TokenValidator;

/// Construtor de "Spans" de log para requisições recebidas.
#[derive(Clone)]
pub struct GatewayMakeSpan {
    validator: Arc<dyn TokenValidator>,
}

impl GatewayMakeSpan {
    pub fn new(validator: Arc<dyn TokenValidator>) -> Self {
        Self { validator }
    }
}

/// Esta estrutura intercepta a requisição no momento em que ela chega.
/// Como o `TraceLayer` envolve o roteador inteiro, ele roda antes de
/// qualquer extractor do Axum (incluindo o que valida o JWT), então o
/// span precisa decodificar o token Bearer diretamente para registrar
/// qual usuário está realizando a chamada. Se o header estiver ausente
/// ou o token for inválido, registra como `"anonymous"`.
impl<B> MakeSpan<B> for GatewayMakeSpan {
    fn make_span(&mut self, request: &axum::http::Request<B>) -> tracing::Span {
        let user_sub = request
            .headers()
            .get("Authorization")
            .and_then(|h| h.to_str().ok())
            .and_then(|h| h.strip_prefix("Bearer "))
            .and_then(|token| self.validator.validate(token).ok())
            .map(|user| user.id)
            .unwrap_or_else(|| "anonymous".to_string());

        info_span!("REQUEST", method = %request.method(), uri = %request.uri(), version = ?request.version(), user_sub = %user_sub)
    }
}

/// Gatilho disparado no início do processamento de uma requisição.
#[derive(Clone)]
pub struct GatewayOnRequest;

/// Simplesmente registra a aplicação começou a processar a requisição
/// HTTP dentro do Span recém-criado.
impl<B> OnRequest<B> for GatewayOnRequest {
    fn on_request(&mut self, _request: &Request<B>, _: &Span) {
        info!("Started processing request...");
    }
}

/// Gatilho disparado após a resposta ser gerada pela aplicação.
#[derive(Clone)]
pub struct GatewayOnResponse;

/// Registra a conclusão da requisição, registrando o status code
/// final da resposta e o tempo total de processamento (latência)
/// em milissegundos.
impl<B> OnResponse<B> for GatewayOnResponse {
    fn on_response(self, response: &Response<B>, latency: Duration, _: &Span) {
        info!(
            status = response.status().as_u16(),
            latency_ms = latency.as_millis(),
            "Finished processing request"
        )
    }
}

/// Constrói a `Layer` de tracing configurada para o Axum.
///
/// Retorna um middleware unindo todas as personalizações criadas.
pub fn tracing_layer(
    validator: Arc<dyn TokenValidator>,
) -> TraceLayer<SharedClassifier<ServerErrorsAsFailures>, GatewayMakeSpan, GatewayOnRequest, GatewayOnResponse>
{
    TraceLayer::new_for_http()
        .make_span_with(GatewayMakeSpan::new(validator))
        .on_request(GatewayOnRequest)
        .on_response(GatewayOnResponse)
}
