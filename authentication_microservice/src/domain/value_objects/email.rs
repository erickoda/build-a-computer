use std::sync::LazyLock;

use regex::Regex;

use crate::domain::errors::UserEntityError;

/// Um value object que representa um endereço de e-mail válido.
///
/// Encapsula uma [`String`], garantindo que qualquer instância [`Email`]
/// na aplicação obedeça às regras de um e-mail válido.
#[derive(Debug, PartialEq, Clone)]
pub struct Email(String);

/// Encapsula o Regex dentro do [`LazyLock`].
///
/// Esta estrutura garante que o Regex seja inicializado apenas uma vez
/// por runtime, melhorando a eficiencia do sistema.
static EMAIL_REGEX: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"^[a-zA-Z0-9_%+-]+(\.[a-zA-Z0-9_%+-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$",
    )
    .expect("Regex of email failed.")
});

impl TryFrom<String> for Email {
    type Error = UserEntityError;

    /// Tenta instanciar um Email a partir de uma String.
    ///
    /// # Erros
    ///
    /// * Retorna um [`UserEntityError::InvalidEmail`] caso a String fornecida
    ///   não tenha um formato de e-mail válido.
    fn try_from(value: String) -> Result<Self, Self::Error> {
        if EMAIL_REGEX.is_match(&value) {
            return Ok(Self(value));
        }

        Err(UserEntityError::InvalidEmail("Invalid Email".to_string()))
    }
}

impl From<&Email> for String {
    /// Extrai uma cópia da `String` interna a partir de uma referência do `Email`.
    fn from(email: &Email) -> Self {
        email.clone().0
    }
}

/// Extrai a `String` interna consumindo a instância do `Email`.
impl From<Email> for String {
    fn from(email: Email) -> Self {
        email.clone().0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    const VALID_EMAILS: &[&str] = &[
        "erick@gmail.com",
        "lorenz.azeitona@usp.com.br",
        "zoega.cali@gomez.com",
        "coringa10@joker.br",
        "erick9._%+-@gmail.com",
    ];

    const INVALID_EMAILS: &[&str] = &[
        "address",
        "@domain.com",
        "username@",
        "username.com",
        "username1@@some.com",
        "user@name1@some.com",
        "user name@domain.com",
        "username@domain com",
        "username@domain..com",
        "user..name@domain.com",
        "username.@domain.com",
        ".username@domain.com",
    ];

    #[test]
    fn try_from_string_success() {
        for &email_str in VALID_EMAILS {
            let email = Email::try_from(email_str.to_string());

            assert!(
                email.is_ok(),
                "Expected valid email to pass, but it failed: '{}'",
                email_str
            );
        }
    }

    #[test]
    fn get_email_returns_correct_string() {
        for &email_str in VALID_EMAILS {
            let email: &Email =
                &Email::try_from(email_str.to_string()).expect("Should be a valid email");
            let result: String = email.into();

            assert_eq!(
                result, email_str,
                "The returned string did not match the input for: '{}'",
                email_str
            );
        }
    }

    #[test]
    fn try_from_string_fails_for_invalid_emails() {
        for &email_str in INVALID_EMAILS {
            let email = Email::try_from(email_str.to_string());

            assert!(
                email.is_err(),
                "Expected invalid email to fail, but it passed: '{}'",
                email_str
            );
        }
    }
}
