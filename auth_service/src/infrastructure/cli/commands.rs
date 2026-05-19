use clap::{Parser, Subcommand};

#[derive(Parser)]
#[command(version, about, long_about = None)]
pub struct Cli {
    #[command(subcommand)]
    pub command: Option<Commands>,
}

#[derive(Subcommand)]
pub enum Commands {
    Serve,
    CreateAdmin {
        #[arg(short, long)]
        username: String,

        #[arg(short, long)]
        email: String,
    },
}
