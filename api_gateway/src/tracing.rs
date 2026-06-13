use tracing_subscriber::{EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};

/// Carrega a configuração de tracing da aplicação
///
/// É responsável por rastrear as requisições recebidas e
/// suas respectivas respostas, facilitando a depuração de erros
/// em produção ou durante o desenvolvimento.
pub fn init_telemetry() {
    let env_filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    tracing_subscriber::registry()
        .with(env_filter)
        .with(tracing_subscriber::fmt::layer().pretty())
        .init();
}
