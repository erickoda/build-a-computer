use std::str::FromStr;

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Serialize, Deserialize, Debug, PartialEq, Clone, Copy, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    Admin,
    Supervisor,
    Common,
}

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
