//! PolyRPC Sentinel - Real-time Python to TypeScript type generator
//!
//! This is the core binary that watches Python files and generates
//! TypeScript definitions in real-time.

mod config;
mod parser;
mod generator;
mod watcher;

use anyhow::Result;
use clap::{Parser, Subcommand};
use colored::Colorize;
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "polyrpc")]
#[command(about = "The invisible bridge between Python and TypeScript", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize PolyRPC in current directory
    Init,
    /// Watch Python files and generate TypeScript types
    Watch {
        /// Path to config file
        #[arg(short, long, default_value = "polyrpc.toml")]
        config: PathBuf,
    },
    /// Generate types once (no watch)
    Generate {
        #[arg(short, long, default_value = "polyrpc.toml")]
        config: PathBuf,
    },
}

#[tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();

    println!(
        "{} {}",
        "⚡".bright_yellow(),
        "PolyRPC Sentinel".bright_cyan().bold()
    );

    match cli.command {
        Commands::Init => {
            config::init_config()?;
            println!("{} Created polyrpc.toml", "✓".green());
            println!("{} Run `polyrpc watch` to start", "→".blue());
        }
        Commands::Watch { config } => {
            let cfg = config::load_config(&config)?;
            println!(
                "{} Watching {} → {}",
                "👁".bright_yellow(),
                cfg.python.source_dir.display().to_string().cyan(),
                cfg.typescript.output_file.display().to_string().green()
            );
            watcher::watch(cfg).await?;
        }
        Commands::Generate { config } => {
            let cfg = config::load_config(&config)?;
            let types = parser::parse_directory(&cfg.python.source_dir)?;
            generator::write_definitions(&cfg.typescript.output_file, &types)?;
            println!(
                "{} Generated {} models, {} routes",
                "✓".green(),
                types.models.len().to_string().bright_yellow(),
                types.routes.len().to_string().bright_yellow()
            );
        }
    }

    Ok(())
}
