use std::str::FromStr;

use serde::{Deserialize, Serialize};

/// Representa os níveis de acesso (cargos) de um usuário no sistema.
///
/// Este enum é utilizado para controle de autorização.
#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Copy)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    /// Acesso total ao sistema.
    Admin,
    /// Acesso intermediário.
    Supervisor,
    /// Acesso padrão. Usuário comum com permissões limitadas.
    Common,
}

/// Tenta converter uma string (`&str`) de volta para uma variante do enum `Role`.
///
/// # Erros
///
/// Retorna `Err(())` caso a string fornecida não corresponda a nenhuma das
/// três variantes válidas.
impl FromStr for Role {
    type Err = ();

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s.to_lowercase().as_str() {
            "admin" => Ok(Role::Admin),
            "supervisor" => Ok(Role::Supervisor),
            "common" => Ok(Role::Common),
            _ => Err(()),
        }
    }
}
