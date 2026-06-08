use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(PartialEq, Clone, Copy, Debug, Serialize, Deserialize, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum UserStatus {
    Active,
    Inactive,
    Banned,
}
