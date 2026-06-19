/// Representa as falhas de validação que podem ocorrer ao instanciar os
/// Value Objects relacionados a um usuário.
#[derive(Debug)]
pub enum UserEntityError {
    /// Ocorre quando o nome de usuário não atende às regras de negócio
    InvalidUsername(String),

    /// Ocorre quando o endereço de e-mail fornecido não possui um formato válido.
    InvalidEmail(String),

    /// Ocorre quando a senha não atende aos requisitos de complexidade
    InvalidPassword(String),
}

impl UserEntityError {
    /// Extrai a mensagem de erro descritiva embutida na variante do enum.
    pub fn get_text(&self) -> &str {
        match self {
            Self::InvalidUsername(error_message) => error_message.as_str(),
            Self::InvalidEmail(error_message) => error_message.as_str(),
            Self::InvalidPassword(error_message) => error_message.as_str(),
        }
    }
}
