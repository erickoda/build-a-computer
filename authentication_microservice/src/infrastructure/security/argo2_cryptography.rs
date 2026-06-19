use argon2::{
    Argon2, PasswordHash, PasswordHasher as Argo2PasswordHasher, PasswordVerifier,
    password_hash::{SaltString, rand_core::OsRng},
};
use tracing::instrument;

use crate::{
    application::ports::password_hasher::{PasswordHasher, PasswordHasherError},
    domain::value_objects::{hashed_password::HashedPassword, plain_password::PlainPassword},
};

/// Adaptador de infraestrutura para hash de senhas utilizando o algoritmo Argon2. Implementa
/// a porta [`PasswordHasher`].
#[derive(Clone)]
pub struct Argo2Hasher {}

impl PasswordHasher for Argo2Hasher {
    /// Gera um hash seguro a partir de uma senha em texto plano.
    ///
    /// Este método gera automaticamente um "Salt" criptograficamente seguro e aleatório
    /// para cada senha usando `OsRng`.
    #[instrument(name = "argo2_hash_password", skip(self, plain_password), err)]
    fn hash_password(
        &self,
        plain_password: PlainPassword,
    ) -> Result<HashedPassword, PasswordHasherError> {
        let password = plain_password.as_str().as_bytes();
        let salt: SaltString = SaltString::generate(&mut OsRng);

        let argon2 = Argon2::default();
        let password_hash = argon2
            .hash_password(password, &salt)
            .map_err(|_| PasswordHasherError::HashingFailed)?
            .to_string();

        Ok(HashedPassword::from_hash(password_hash))
    }

    /// Verifica se uma senha em texto plano corresponde a um hash do Argon2.
    ///
    /// Extrai o salt e os parâmetros de custo originais diretamente da string
    /// do hash armazenado para realizar a comparação. Dados sensíveis não são logados.
    #[instrument(
        name = "argo2_verify_password",
        skip(self, hashed_password, unencrypted_password),
        err
    )]
    fn verify_password(
        &self,
        hashed_password: &str,
        unencrypted_password: &str,
    ) -> Result<bool, PasswordHasherError> {
        let parsed_hash =
            PasswordHash::new(hashed_password).map_err(|_| PasswordHasherError::HashingFailed)?;

        Ok(Argon2::default()
            .verify_password(unencrypted_password.as_bytes(), &parsed_hash)
            .is_ok())
    }
}
