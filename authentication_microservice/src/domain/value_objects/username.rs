use crate::domain::errors::UserEntityError;

/// Representa o nome de usuário (Value Object).
///
/// Encapsula a string fornecida no cadastro, garantindo que o nome
/// respeite o limite de armazenamento do banco de dados.
#[derive(Debug, PartialEq, Clone)]
pub struct Username(String);

/// Tenta validar e instanciar um `Username` a partir de uma `String` bruta.
///
/// # Regras de Validação
///
/// O nome de usuário pode possuir no máximo **255 caracteres**.
///
/// # Erros
///
/// Retorna [`UserEntityError::InvalidUsername`] caso a string não respeite a regra
/// de validação acima.
impl TryFrom<String> for Username {
    type Error = UserEntityError;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        if value.len() > 255 {
            return Err(UserEntityError::InvalidUsername(
                "User must have at most 255 characters".to_string(),
            ));
        }

        Ok(Self(value))
    }
}

/// Extrai uma cópia da `String` interna a partir de uma referência de `Username`.
impl From<&Username> for String {
    fn from(username: &Username) -> Self {
        username.clone().0
    }
}

#[cfg(test)]
mod test {
    use super::*;

    const VALID_USERNAMES: [&str; 3] = ["Lorenzo", "Erick", "Raphael"];

    #[test]
    pub fn test_try_from_string_for_username_success() {
        for username_str in VALID_USERNAMES {
            let username = Username::try_from(username_str.to_string());

            assert!(
                username.is_ok(),
                "Expected username to pass! Failed username: {}",
                username_str
            );
        }
    }

    #[test]
    pub fn test_into_string() {
        for username_str in VALID_USERNAMES {
            let username = &Username::try_from(username_str.to_string()).unwrap();
            let result: String = username.into();

            assert_eq!(
                result, username_str,
                "Expected username to pass! Failed username: {}",
                username_str
            );
        }
    }

    #[test]
    pub fn test_try_from_string_for_username_fail_too_long() {
        let long_username_str = "a".repeat(101);
        let username = Username::try_from(long_username_str);

        assert!(
            username.is_err(),
            "Expected username creation to fail due to being too long!"
        );

        assert_eq!(
            username.unwrap_err().get_text(),
            "User must have at most 255 characters",
            "Expected specific error message for too long username"
        );
    }
}
