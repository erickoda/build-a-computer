use std::fmt::Display;

use crate::domain::value_objects::{
    hashed_password::HashedPassword, plain_password::PlainPassword,
};

/// Porta (Trait) para o serviço de hash e verificação de senhas.
#[cfg_attr(test, mockall::automock)]
pub trait PasswordHasher: Send + Sync {
    /// Transforma uma senha validada em texto plano em um hash seguro.
    fn hash_password(
        &self,
        plain_password: PlainPassword,
    ) -> Result<HashedPassword, PasswordHasherError>;

    /// Verifica se uma senha em texto plano corresponde a um hash previamente gerado.
    ///
    /// Retorna `Ok(true)` se a senha for válida, `Ok(false)` se estiver incorreta,
    /// ou um `PasswordHasherError` caso ocorra uma falha no algoritmo de verificação.
    fn verify_password(
        &self,
        hashed_password: &str,
        unencrypted_password: &str,
    ) -> Result<bool, PasswordHasherError>;
}

/// Representa as falhas que podem ocorrer na camada de criptografia.
pub enum PasswordHasherError {
    /// Ocorre quando o algoritmo falha ao gerar ou processar o hash.
    HashingFailed,
}

impl Display for PasswordHasherError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::HashingFailed => write!(f, "Failed to hash password"),
        }
    }
}
