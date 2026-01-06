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
            
            // Resolve paths relative to config file location
            let config_dir = config.parent().unwrap_or(std::path::Path::new("."));
            let source_dir = config_dir.join(&cfg.python.source_dir);
            let output_file = config_dir.join(&cfg.typescript.output_file);
            
            println!(
                "{} Watching {} → {}",
                "👁".bright_yellow(),
                source_dir.display().to_string().cyan(),
                output_file.display().to_string().green()
            );
            
            // Create a new config with resolved paths
            let resolved_cfg = config::Config {
                python: config::PythonConfig {
                    source_dir,
                    include: cfg.python.include,
                    exclude: cfg.python.exclude,
                },
                typescript: config::TypeScriptConfig {
                    output_file,
                    generate_client: cfg.typescript.generate_client,
                },
                api: cfg.api,
            };
            
            watcher::watch(resolved_cfg).await?;
        }
        Commands::Generate { config } => {
            let cfg = config::load_config(&config)?;
            
            // Resolve paths relative to config file location
            let config_dir = config.parent().unwrap_or(std::path::Path::new("."));
            let source_dir = config_dir.join(&cfg.python.source_dir);
            let output_file = config_dir.join(&cfg.typescript.output_file);
            
            let types = parser::parse_directory(&source_dir)?;
            generator::write_definitions(
                &output_file,
                &types,
                &cfg.api.base_url,
            )?;
            println!(
                "{} Generated {} models, {} enums, {} routes",
                "✓".green(),
                types.models.len().to_string().bright_yellow(),
                types.enums.len().to_string().bright_yellow(),
                types.routes.len().to_string().bright_yellow()
            );
        }
    }

    Ok(())
}
