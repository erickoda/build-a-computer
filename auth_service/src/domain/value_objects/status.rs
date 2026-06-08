use serde::{Deserialize, Serialize};

#[derive(PartialEq, Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Status {
    Active,
    Inactive,
    Banned,
}
