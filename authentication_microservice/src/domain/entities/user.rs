use uuid::Uuid;

use crate::domain::value_objects::{
    email::Email, hashed_password::HashedPassword, role::Role, status::Status, username::Username,
};

/// Entidade principal que representa um usuário no sistema.
///
/// Agrupa os Objetos de Valor já validados, garantindo que o usuário
/// em memória sempre possua um estado consistente e seguro.
#[derive(Clone, Debug)]
pub struct UserEntity {
    id: Uuid,
    username: Username,
    email: Email,
    password: HashedPassword,
    role: Role,
    status: Status,
}

impl UserEntity {
    /// Instancia um novo usuário recém-cadastrado.
    ///
    /// Gera automaticamente um novo `Uuid` e define o status padrão como [`Status::Active`].
    pub fn new(username: Username, email: Email, password: HashedPassword, role: Role) -> Self {
        Self {
            id: Uuid::new_v4(),
            username,
            email,
            password,
            role,
            status: Status::Active,
        }
    }

    /// Restaura um usuário existente.
    ///
    /// Diferente dos construtores `new`, este método **não** gera um novo `Uuid`,
    /// preservando a identidade exata do registro carregado.
    pub fn restore(
        id: Uuid,
        username: Username,
        email: Email,
        password: HashedPassword,
        role: Role,
        status: Status,
    ) -> Self {
        Self {
            id,
            username,
            email,
            password,
            role,
            status,
        }
    }

    /// Retorna uma referência ao nome de usuário.
    pub fn get_username(&self) -> &Username {
        &self.username
    }

    /// Retorna uma referência ao e-mail.
    pub fn get_email(&self) -> &Email {
        &self.email
    }

    /// Retorna uma referência à senha "hasheada".
    pub fn get_password(&self) -> &HashedPassword {
        &self.password
    }

    /// Retorna uma cópia do identificador único (UUID).
    pub fn get_id(&self) -> Uuid {
        self.id
    }

    /// Retorna uma referência ao cargo/nível de acesso.
    pub fn get_role(&self) -> &Role {
        &self.role
    }

    /// Retorna uma referência ao status de atividade.
    pub fn get_status(&self) -> &Status {
        &self.status
    }
}
