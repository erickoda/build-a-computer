use clap::{Parser, Subcommand};

/// Interface de Linha de Comando (CLI) do microsserviço de autenticação.
///
/// Permite executar tarefas administrativas locais injetando comandos diretamente
/// na aplicação via terminal.
///
/// # Exemplos
///
/// Rodando via `cargo` para fazer o bootstrap do primeiro administrador:
///
/// ```bash
/// cargo run -- create-admin --username admin_master --email admin@empresa.com
/// ```
///
/// Rodando o binário compilado utilizando as opções curtas (`-u` e `-e`):
///
/// ```bash
/// ./authentication_microservice create-admin -u super_user -e super@mail.com
/// ```
#[derive(Parser)]
#[command(version, about, long_about = None)]
pub struct Cli {
    /// O subcomando a ser executado.
    #[command(subcommand)]
    pub command: Option<Commands>,
}

/// Define os subcomandos disponíveis na CLI.
#[derive(Subcommand)]
pub enum Commands {
    /// Cria um novo usuário com privilégios de Administrador (`Role::Admin`).
    ///
    /// Útil para fazer a inicialização do sistema e garantir o primeiro acesso
    /// administrativo.
    CreateAdmin {
        /// O nome de usuário do novo administrador.
        #[arg(short, long)]
        username: String,

        /// O e-mail de contato e login do novo administrador.
        #[arg(short, long)]
        email: String,
    },
}
