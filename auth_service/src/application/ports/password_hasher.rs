use crate::domain::value_objects::{
    hashed_password::HashedPassword, plain_password::PlainPassword,
};

#[cfg_attr(test, mockall::automock)]
pub trait PasswordHasher {
    fn hash_password(
        &self,
        plain_password: PlainPassword,
    ) -> Result<HashedPassword, PasswordHasherError>;
    fn verify_password(
        &self,
        hashed_password: &str,
        unencrypted_password: &str,
    ) -> Result<bool, PasswordHasherError>;
}

pub enum PasswordHasherError {
    HashingFailed,
}
