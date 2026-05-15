use anyhow::Result;
use clap::{Parser, Subcommand};
use tracing_subscriber::{fmt, EnvFilter};

#[derive(Debug, Parser)]
#[command(name = "your")]
#[command(version, about = "A production-ready Rust workspace template.")]
struct Cli {
    #[arg(long, global = true, env = "YOUR_LOG", default_value = "info")]
    log: String,

    #[command(subcommand)]
    command: Command,
}

#[derive(Debug, Subcommand)]
enum Command {
    /// Print a greeting from the core crate.
    Hello {
        #[arg(default_value = "world")]
        name: String,
    },

    /// Print resolved application configuration.
    Config,
}

fn init_tracing(level: &str) {
    let filter = EnvFilter::try_new(level).unwrap_or_else(|_| EnvFilter::new("info"));
    fmt().with_env_filter(filter).init();
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    init_tracing(&cli.log);

    match cli.command {
        Command::Hello { name } => {
            println!("{}", your_core::hello(&name));
        }
        Command::Config => {
            let config = your_config::AppConfig::load()?;
            println!("{}", config.to_json()?);
        }
    }

    Ok(())
}
