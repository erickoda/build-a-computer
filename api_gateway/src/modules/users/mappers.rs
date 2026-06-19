use crate::{
    errors::AppError,
    modules::users::dtos::{response::user::UserDto, user_role::UserRole, user_status::UserStatus},
    users_grpc,
};

/// Converte o enum `UserStatus` para o formato esperado pelo gRPC.
impl From<UserStatus> for users_grpc::Status {
    fn from(user_status: UserStatus) -> Self {
        match user_status {
            UserStatus::Active => Self::Active,
            UserStatus::Inactive => Self::Inactive,
            UserStatus::Banned => Self::Banned,
        }
    }
}

/// Converte o enum `UserRole` para o formato esperado pelo gRPC.
impl From<UserRole> for users_grpc::Role {
    fn from(user_role: UserRole) -> Self {
        match user_role {
            UserRole::Admin => Self::Admin,
            UserRole::Supervisor => Self::Supervisor,
            UserRole::Common => Self::Common,
        }
    }
}

/// Converte o status vindo do gRPC de volta para o enum `UserStatus`.
impl From<users_grpc::Status> for UserStatus {
    fn from(users_grpc_status: users_grpc::Status) -> Self {
        match users_grpc_status {
            users_grpc::Status::Active => Self::Active,
            users_grpc::Status::Inactive => Self::Inactive,
            users_grpc::Status::Banned => Self::Banned,
        }
    }
}

/// Converte o cargo/role vindo do gRPC de volta para o enum `UserRole`.
impl From<users_grpc::Role> for UserRole {
    fn from(users_grpc_role: users_grpc::Role) -> Self {
        match users_grpc_role {
            users_grpc::Role::Admin => Self::Admin,
            users_grpc::Role::Supervisor => Self::Supervisor,
            users_grpc::Role::Common => Self::Common,
        }
    }
}

/// Tenta converter uma entidade de usuário bruta do gRPC para o DTO de resposta final.
///
/// # Erros
///
/// Retorna [`AppError::InternalError`] caso a conversão dos enums `role` ou `status`
/// ou o `id` falhe (por exemplo, se o microsserviço enviar um valor inteiro desconhecido).
impl TryFrom<users_grpc::User> for UserDto {
    type Error = AppError;

    fn try_from(user_grpc: users_grpc::User) -> Result<UserDto, AppError> {
        Ok(UserDto::new(
            uuid::Uuid::parse_str(&user_grpc.id)
                .map_err(|_| AppError::InternalError("Internal conversion error".to_string()))?,
            user_grpc.username,
            user_grpc.email,
            UserRole::from(
                users_grpc::Role::try_from(user_grpc.role).map_err(|_| {
                    AppError::InternalError("Internal conversion error".to_string())
                })?,
            ),
            UserStatus::from(
                users_grpc::Status::try_from(user_grpc.status).map_err(|_| {
                    AppError::InternalError("Internal conversion error".to_string())
                })?,
            ),
        ))
    }
}

/// Tenta converter uma lista inteira de usuários do gRPC para um vetor de DTOs.
///
/// Percorre todos os usuários e aplica a conversão de `UserDto` em cada um.
/// Caso qualquer usuário da lista falhe na conversão, o processo é abortado
/// e o erro é propagado.
impl TryFrom<users_grpc::ListOfUsers> for Vec<UserDto> {
    type Error = AppError;

    fn try_from(
        users_grpc_list_of_users: users_grpc::ListOfUsers,
    ) -> Result<Vec<UserDto>, Self::Error> {
        users_grpc_list_of_users
            .users
            .into_iter()
            .map(UserDto::try_from)
            .collect::<Result<Vec<UserDto>, Self::Error>>()
    }
}
