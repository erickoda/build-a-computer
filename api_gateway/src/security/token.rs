use crate::errors::AppError;

/// Representa as informações relevantes de um usuário
/// autenticado no sistema
pub struct AuthenticatedUser {
    /// ID do usuário.
    pub id: String,
    /// Cargo do usuário no sistema.
    pub role: String,
}

/// Define o contrato genérico para validação de tokens.
///
/// Exige `Send + Sync` para que as implementações possam ser
/// compartilhadas com segurança entre múltiplas threads do servidor.
/// `Send` garante a possibilidade de mover uma instância dessa trait
/// para outra Thread, enquanto `Sync` permite o compartilhamento de
/// uma referência destra trait entre múltiplas Threads
pub trait TokenValidator: Send + Sync {
    /// Valida um dado token em formato de string.
    ///
    /// # Erros
    ///
    /// Retorna um [`AppError`] caso o token seja inválido, esteja
    /// expirado ou falhe na verificação de assinatura.
    fn validate(&self, token: &str) -> Result<AuthenticatedUser, AppError>;
}
