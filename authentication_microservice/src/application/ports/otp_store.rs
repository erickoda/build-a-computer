use crate::domain::value_objects::email::Email;

/// Porta (Interface) para o armazenamento de senhas de uso único (OTPs).
#[cfg_attr(test, mockall::automock)]
pub trait OtpStore: Send + Sync {
    /// Armazena um novo código OTP vinculado a um endereço de e-mail.
    fn store_otp(
        &self,
        email: &Email,
        otp: &str,
    ) -> impl std::future::Future<Output = Result<(), OtpStoreError>> + Send;

    /// Busca o código OTP atualmente válido associado ao e-mail informado.
    ///
    /// Retorna `Ok(None)` caso o OTP não exista ou já tenha expirado.
    fn get_otp(
        &self,
        email: &Email,
    ) -> impl std::future::Future<Output = Result<Option<String>, OtpStoreError>> + Send;

    /// Remove o OTP associado ao e-mail.
    ///
    /// Deve ser chamado imediatamente após a validação bem-sucedida do código
    /// para evitar reutilização.
    fn delete_otp(
        &self,
        email: &Email,
    ) -> impl std::future::Future<Output = Result<(), OtpStoreError>> + Send;
}

/// Representa as falhas que podem ocorrer na camada infraestrutura de armazenamento de OTPs.
#[derive(Debug)]
pub enum OtpStoreError {
    /// Falha de rede ou conexão com o serviço de cache.
    ConnectionError(String),

    /// Falha interna ao tentar ler, gravar ou deletar os dados no armazenamento.
    StorageError(String),
}
