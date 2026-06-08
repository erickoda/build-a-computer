use crate::domain::value_objects::email::Email;

#[cfg_attr(test, mockall::automock)]
pub trait OtpStore: Send + Sync {
    fn store_otp(
        &self,
        email: &Email,
        otp: &str,
    ) -> impl std::future::Future<Output = Result<(), OtpStoreError>> + Send;

    fn get_otp(
        &self,
        email: &Email,
    ) -> impl std::future::Future<Output = Result<Option<String>, OtpStoreError>> + Send;

    fn delete_otp(
        &self,
        email: &Email,
    ) -> impl std::future::Future<Output = Result<(), OtpStoreError>> + Send;
}

#[derive(Debug)]
pub enum OtpStoreError {
    ConnectionError(String),
    StorageError(String),
}
