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

pub struct UsersService {
    user_use_case: AppUserUseCase,
}

impl UsersService {
    pub fn new(user_use_case: AppUserUseCase) -> Self {
        Self { user_use_case }
    }
}

#[tonic::async_trait]
impl Users for UsersService {
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

    async fn get_users(&self, _: Request<Empty>) -> Result<Response<ListOfUsers>, Status> {
        Ok(Response::from(ListOfUsers::from(
            self.user_use_case.get_users().await?,
        )))
    }

    async fn delete_user(&self, request: Request<UserId>) -> Result<Response<Empty>, Status> {
        let user_ctx = request.extensions().get::<UserContext>().unwrap().clone();

        let id = Uuid::from_str(&request.into_inner().id)
            .map_err(|_| Status::invalid_argument("Invalid id"))?;

        self.user_use_case
            .delete_user(id, user_ctx.user_id, user_ctx.user_role)
            .await?;

        Ok(Response::new(Empty {}))
    }

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
