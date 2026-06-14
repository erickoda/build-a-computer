use std::str::FromStr;

use uuid::Uuid;

use crate::{
    application::commands::{create_user::CreateUserCommand, update_user::UpdateUserCommand},
    domain::{
        entities::user::UserEntity,
        value_objects::{role::Role as DomainUserRole, status::Status as DomainUserStatus},
    },
    users_grpc::{self, User},
};

/// Converte o payload gRPC de criação de usuário para o Comando interno.
impl Into<CreateUserCommand> for users_grpc::CreateUserRequest {
    fn into(self) -> CreateUserCommand {
        CreateUserCommand::new(
            self.clone().username,
            self.clone().email,
            self.clone().password,
            self.role().into(),
        )
    }
}

/// Mapeia o Enum de Role do gRPC para o Objeto de Valor da camada de Domínio.
impl Into<DomainUserRole> for users_grpc::Role {
    fn into(self) -> DomainUserRole {
        match self {
            users_grpc::Role::Admin => DomainUserRole::Admin,
            users_grpc::Role::Common => DomainUserRole::Common,
            users_grpc::Role::Supervisor => DomainUserRole::Supervisor,
        }
    }
}

/// Mapeia o Enum de Status do gRPC para o Objeto de Valor da camada de Domínio.
impl Into<DomainUserStatus> for users_grpc::Status {
    fn into(self) -> DomainUserStatus {
        match self {
            users_grpc::Status::Active => DomainUserStatus::Active,
            users_grpc::Status::Inactive => DomainUserStatus::Inactive,
            users_grpc::Status::Banned => DomainUserStatus::Banned,
        }
    }
}

/// Converte a Entidade de Domínio [`UserEntity`] para o DTO de resposta do gRPC ([`User`]).
impl From<UserEntity> for users_grpc::User {
    fn from(user_entity: UserEntity) -> Self {
        Self {
            id: user_entity.get_id().to_string(),
            username: user_entity.get_username().into(),
            email: user_entity.get_email().into(),
            role: users_grpc::Role::from(user_entity.get_role()).into(),
            status: users_grpc::Status::from(user_entity.get_status()).into(),
        }
    }
}

/// Mapeia o Value Object de Status (Domínio) para o Enum correspondente do gRPC.
impl From<&DomainUserStatus> for users_grpc::Status {
    fn from(application_user_status: &DomainUserStatus) -> Self {
        match application_user_status {
            DomainUserStatus::Active => Self::Active,
            DomainUserStatus::Inactive => Self::Inactive,
            DomainUserStatus::Banned => Self::Banned,
        }
    }
}

/// Mapeia o Value Object Role (Domínio) para o Enum correspondente do gRPC.
impl From<&DomainUserRole> for users_grpc::Role {
    fn from(application_user_role: &DomainUserRole) -> Self {
        match application_user_role {
            DomainUserRole::Admin => Self::Admin,
            DomainUserRole::Supervisor => Self::Supervisor,
            DomainUserRole::Common => Self::Common,
        }
    }
}

/// Empacota um vetor de entidades do domínio na estrutura [`ListOfUsers`] esperada pelo gRPC.
impl From<Vec<UserEntity>> for users_grpc::ListOfUsers {
    fn from(users_entity: Vec<UserEntity>) -> Self {
        Self {
            users: users_entity
                .iter()
                .map(|user| User {
                    id: user.get_id().to_string(),
                    username: user.get_username().into(),
                    email: user.get_email().into(),
                    role: users_grpc::Role::from(user.get_role()).into(),
                    status: users_grpc::Status::from(user.get_status()).into(),
                })
                .collect::<Vec<User>>(),
        }
    }
}

/// Tenta converter a requisição de atualização gRPC no Comando interno.
///
/// Implementa [`TryInto`] pois precisa validar e realizar o parsing
/// seguro da string do UUID enviada pela rede. Em caso de falha,
/// já devolve um Status formatado do [`tonic`].
impl TryInto<UpdateUserCommand> for users_grpc::UpdateUserRequest {
    type Error = tonic::Status;

    fn try_into(self) -> Result<UpdateUserCommand, Self::Error> {
        let id =
            Uuid::from_str(&self.id).map_err(|_| Self::Error::invalid_argument("Invalid id"))?;

        let role = self
            .role
            .and_then(|r| users_grpc::Role::try_from(r).ok())
            .map(Into::into);

        let status = self
            .status
            .and_then(|s| users_grpc::Status::try_from(s).ok())
            .map(Into::into);

        Ok(UpdateUserCommand::new(
            id,
            self.username,
            self.email,
            self.password,
            role,
            status,
        ))
    }
}
