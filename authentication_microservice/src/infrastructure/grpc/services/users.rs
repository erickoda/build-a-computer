use std::str::FromStr;

use tonic::{Request, Response, Status};
use uuid::Uuid;

use crate::{
    domain::value_objects::role::Role,
    infrastructure::{AppUserUseCase, grpc::interceptors::UserContext},
    users_grpc::{
        CreateUserRequest, Empty, ListOfUsers, UpdateUserRequest, User, UserId, users_server::Users,
    },
};

/// Handler para os endpoints gRPC de Usuários.
///
/// Atua como um Adaptador Primário (Primary/Driving Adapter). Ele recebe as
/// requisições da rede via [`tonic`], converte os payloads gRPC para os Comandos
/// da camada de Aplicação e repassa a execução para o Caso de Uso.
pub struct UsersService {
    user_use_case: AppUserUseCase,
}

impl UsersService {
    /// Instancia o serviço gRPC injetando o Caso de Uso de Usuário.
    pub fn new(user_use_case: AppUserUseCase) -> Self {
        Self { user_use_case }
    }
}

#[tonic::async_trait]
impl Users for UsersService {
    /// Cria um novo usuário no sistema.
    ///
    /// # Autorização
    /// Requer que o chamador possua o cargo de [`Role::Admin`].
    async fn create_user(
        &self,
        request: Request<CreateUserRequest>,
    ) -> Result<Response<User>, Status> {
        let user_ctx = request.extensions().get::<UserContext>().unwrap().clone();

        if user_ctx.user_role != Role::Admin {
            return Err(Status::permission_denied(
                "User does not have access to this route!",
            ));
        }

        Ok(Response::from(User::from(
            self.user_use_case
                .create_user(request.into_inner().into())
                .await?,
        )))
    }

    /// Busca os detalhes de um usuário específico pelo seu ID (UUID).
    async fn get_user(&self, request: Request<UserId>) -> Result<Response<User>, Status> {
        Ok(Response::from(User::from(
            self.user_use_case
                .get_user(
                    Uuid::parse_str(&request.into_inner().id)
                        .map_err(|_| Status::invalid_argument("Invalid id type"))?,
                )
                .await?,
        )))
    }

    /// Retorna uma lista com todos os usuários ativos do sistema.
    async fn get_users(&self, _: Request<Empty>) -> Result<Response<ListOfUsers>, Status> {
        Ok(Response::from(ListOfUsers::from(
            self.user_use_case.get_users().await?,
        )))
    }

    /// Remove (Soft Delete) um usuário do sistema.
    async fn delete_user(&self, request: Request<UserId>) -> Result<Response<Empty>, Status> {
        let user_ctx = request.extensions().get::<UserContext>().unwrap().clone();

        let id = Uuid::from_str(&request.into_inner().id)
            .map_err(|_| Status::invalid_argument("Invalid id"))?;

        self.user_use_case
            .delete_user(id, user_ctx.user_id, user_ctx.user_role)
            .await?;

        Ok(Response::new(Empty {}))
    }

    /// Atualiza as informações de um usuário existente.
    async fn update_user(
        &self,
        request: Request<UpdateUserRequest>,
    ) -> Result<Response<Empty>, Status> {
        let user_ctx = request.extensions().get::<UserContext>().unwrap().clone();

        self.user_use_case
            .update_user(
                request.into_inner().try_into()?,
                user_ctx.user_id,
                user_ctx.user_role,
            )
            .await?;

        Ok(Response::new(Empty {}))
    }
}
