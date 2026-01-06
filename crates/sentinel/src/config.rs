//! Configuration management for PolyRPC

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub python: PythonConfig,
    pub typescript: TypeScriptConfig,
    #[serde(default)]
    pub api: ApiConfig,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PythonConfig {
    /// Directory containing Python source files
    pub source_dir: PathBuf,
    /// File patterns to include (glob)
    #[serde(default = "default_include")]
    pub include: Vec<String>,
    /// File patterns to exclude (glob)
    #[serde(default = "default_exclude")]
    pub exclude: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TypeScriptConfig {
    /// Output file for generated TypeScript definitions
    pub output_file: PathBuf,
    /// Whether to generate runtime client code
    #[serde(default = "default_true")]
    pub generate_client: bool,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct ApiConfig {
    /// Base URL for API calls (used in generated client)
    #[serde(default = "default_base_url")]
    pub base_url: String,
    /// Prefix for API routes
    #[serde(default)]
    pub prefix: String,
}

fn default_include() -> Vec<String> {
    vec!["**/*.py".to_string()]
}

fn default_exclude() -> Vec<String> {
    vec![
        "**/__pycache__/**".to_string(),
        "**/venv/**".to_string(),
        "**/.venv/**".to_string(),
        "**/test_*.py".to_string(),
    ]
}

fn default_base_url() -> String {
    "/api".to_string()
}

fn default_true() -> bool {
    true
}

/// Create a default config file
pub fn init_config() -> Result<()> {
    let config = Config {
        python: PythonConfig {
            source_dir: PathBuf::from("backend"),
            include: default_include(),
            exclude: default_exclude(),
        },
        typescript: TypeScriptConfig {
            output_file: PathBuf::from("frontend/src/polyrpc.d.ts"),
            generate_client: true,
        },
        api: ApiConfig {
            base_url: "/api".to_string(),
            prefix: String::new(),
        },
    };

    let toml_str = toml::to_string_pretty(&config)?;
    fs::write("polyrpc.toml", toml_str)?;
    Ok(())
}

/// Load config from file
pub fn load_config(path: &Path) -> Result<Config> {
    let content = fs::read_to_string(path)
        .with_context(|| format!("Failed to read config file: {}", path.display()))?;
    
    let config: Config = toml::from_str(&content)
        .with_context(|| "Failed to parse config file")?;
    
    Ok(config)
}
