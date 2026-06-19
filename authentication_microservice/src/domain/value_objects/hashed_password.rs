/// Um value object que representa uma senha criptografada.
#[derive(Debug, PartialEq, Clone)]
pub struct HashedPassword(String);

impl HashedPassword {
    /// Instancia um [`HashedPassword`] a partir de uma [`String`]
    pub fn from_hash(hashed_password: String) -> Self {
        Self(hashed_password)
    }

    /// Extrai uma referência da [`String`] interna a partir de uma referência de [`HashedPassword`].
    pub fn as_str(&self) -> &str {
        &self.0
    }
}
