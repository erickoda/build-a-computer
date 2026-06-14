use crate::domain::value_objects::email::Email;

/// Porta (Trait) para o serviço de envio de e-mails.
#[cfg_attr(test, mockall::automock)]
pub trait EmailSender: Send + Sync {
    /// Envia uma senha de uso único (OTP) para o endereço de e-mail especificado.
    ///
    /// # Erro
    ///
    /// * Trata exceções retornando um `EmailSenderError`
    fn send_otp(
        &self,
        to: &Email,
        otp: &str,
    ) -> impl std::future::Future<Output = Result<(), EmailSenderError>> + Send;
}

/// Representa as falhas que podem ocorrer na camada de infraestrutura de envio de e-mail.
#[derive(Debug)]
pub enum EmailSenderError {
    /// Falha ao estabelecer conexão com o provedor de e-mail (ex.: SMTP offline).
    ConnectionError(String),

    /// Falha ao montar a estrutura da mensagem (ex.: corpo do e-mail inválido).
    BuildError(String),

    /// Conexão estabelecida, mas o provedor rejeitou o envio da mensagem.
    SendError(String),
}
