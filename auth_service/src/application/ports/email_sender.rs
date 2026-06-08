use crate::domain::value_objects::email::Email;

#[cfg_attr(test, mockall::automock)]
pub trait EmailSender: Send + Sync {
    fn send_otp(
        &self,
        to: &Email,
        otp: &str,
    ) -> impl std::future::Future<Output = Result<(), EmailSenderError>> + Send;
}

#[derive(Debug)]
pub enum EmailSenderError {
    ConnectionError(String),
    BuildError(String),
    SendError(String),
}
