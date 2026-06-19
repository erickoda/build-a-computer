use chrono::{DateTime, Utc};

pub mod cpu;
pub mod gpu;
pub mod mother_board;
pub mod pc;
pub mod power_source;
pub mod ram_memmory;
pub mod ssd;

type Timestamp = DateTime<Utc>;
