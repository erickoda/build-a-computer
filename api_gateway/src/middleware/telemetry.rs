use std::time::Duration;

use axum::{extract::Request, http::Response};
use tower_http::{
    classify::{ServerErrorsAsFailures, SharedClassifier},
    trace::{MakeSpan, OnRequest, OnResponse, TraceLayer},
};
use tracing::{Span, info, info_span};

use crate::security::jwt_adapter::TokenClaims;

#[derive(Clone)]
pub struct GatewayMakeSpan;

impl<B> MakeSpan<B> for GatewayMakeSpan {
    fn make_span(&mut self, request: &axum::http::Request<B>) -> tracing::Span {
        let user_sub = request
            .extensions()
            .get::<TokenClaims>()
            .map(|claims| claims.sub.clone())
            .unwrap_or_else(|| "anonymous".to_string());

        info_span!("REQUEST", method = %request.method(), uri = %request.uri(), version = ?request.version(), user_sub = %user_sub)
    }
}

#[derive(Clone)]
pub struct GatewayOnRequest;

impl<B> OnRequest<B> for GatewayOnRequest {
    fn on_request(&mut self, _request: &Request<B>, _: &Span) {
        info!("Started processing request...");
    }
}

#[derive(Clone)]
pub struct GatewayOnResponse;

impl<B> OnResponse<B> for GatewayOnResponse {
    fn on_response(self, response: &Response<B>, latency: Duration, _: &Span) {
        info!(
            status = response.status().as_u16(),
            latency_ms = latency.as_millis(),
            "Finished processing request"
        )
    }
}

pub fn tracing_layer() -> TraceLayer<
    SharedClassifier<ServerErrorsAsFailures>,
    GatewayMakeSpan,
    GatewayOnRequest,
    GatewayOnResponse,
> {
    TraceLayer::new_for_http()
        .make_span_with(GatewayMakeSpan)
        .on_request(GatewayOnRequest)
        .on_response(GatewayOnResponse)
}
