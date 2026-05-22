use serde::Serialize;
use utoipa::ToSchema;

#[derive(Clone, Copy, Debug, Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Active,
    Inactive,
    Banned,
}
