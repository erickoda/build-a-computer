use std::sync::LazyLock;

use regex::Regex;

use crate::domain::errors::UserEntityError;

/// Value Object que representa uma senha não criptografada.
///
/// Encapsula uma [`String`], garantindo que qualquer instância [`PlainPassword`]
/// na aplicação obedeça regras importantes de validação de senha.
#[derive(Debug, PartialEq, Clone)]
pub struct PlainPassword(String);

static SPECIAL_CHAR_REGEX: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"[^a-zA-Z0-9]").unwrap());

/// Tenta validar e instanciar um `PlainPassword` a partir de uma `String` bruta.
///
/// # Regras de Validação
///
/// Para ser considerada uma senha válida, deve atender aos seguintes critérios:
/// * Tamanho mínimo de **8 caracteres**.
/// * Tamanho máximo de **24 caracteres**.
/// * Conter **pelo menos um caractere especial** (qualquer caractere que não seja alfanumérico).
/// * Conter **pelo menos um caractere maiúsculo**
///
/// # Erros
///
/// Retorna [`UserEntityError::InvalidPassword`] se qualquer uma das regras de
/// validação acima for violada, informando, atráves de uma mensage descritiva,
/// qual regra falhou.
impl TryFrom<String> for PlainPassword {
    type Error = UserEntityError;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        if value.len() < 8 {
            return Err(UserEntityError::InvalidPassword(
                "Invalid Password Size! Password must have at least 8 characters!!!".to_string(),
            ));
        }

        if value.len() > 24 {
            return Err(UserEntityError::InvalidPassword(
                "Invalid Password Size! Password must have at most 24 characters!!!".to_string(),
            ));
        }

        if !SPECIAL_CHAR_REGEX.is_match(&value) {
            return Err(UserEntityError::InvalidPassword(
                "Invalid Password Format! Password must have at least 1 special character"
                    .to_string(),
            ));
        }

        if !value.chars().any(|char| char.is_uppercase()) {
            return Err(UserEntityError::InvalidPassword(
                "Invalid Password Format! Password must have at least 1 uppercase character"
                    .to_string(),
            ));
        }

        Ok(Self(value))
    }
}

impl PlainPassword {
    /// Retorna uma referência em formato de string slice (`&str`) para a senha validada.
    pub fn as_str(&self) -> &str {
        &self.0
    }
}
