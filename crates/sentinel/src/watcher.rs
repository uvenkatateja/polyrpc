//! File Watcher - Real-time Python file monitoring
//!
//! Uses the `notify` crate to watch for file changes and trigger
//! type regeneration in <50ms.

use crate::config::Config;
use crate::generator;
use crate::parser;
use anyhow::Result;
use colored::Colorize;
use notify::RecursiveMode;
use notify_debouncer_mini::new_debouncer;
use std::sync::mpsc::channel;
use std::time::{Duration, Instant};

/// Start watching Python files and regenerating TypeScript definitions
pub async fn watch(config: Config) -> Result<()> {
    // Initial generation
    regenerate(&config)?;
    
    // Set up file watcher with debouncing
    let (tx, rx) = channel();
    
    // 50ms debounce - fast enough to feel instant, slow enough to batch rapid saves
    let mut debouncer = new_debouncer(Duration::from_millis(50), tx)?;
    
    debouncer.watcher().watch(
        &config.python.source_dir,
        RecursiveMode::Recursive,
    )?;
    
    println!(
        "{} Watching for changes... (Ctrl+C to stop)",
        "→".blue()
    );
    
    // Event loop
    loop {
        match rx.recv() {
            Ok(Ok(events)) => {
                // Filter for Python file changes
                let python_changes: Vec<_> = events
                    .iter()
                    .filter(|e| {
                        e.path
                            .extension()
                            .map_or(false, |ext| ext == "py")
                    })
                    .collect();
                
                if !python_changes.is_empty() {
                    // Show which files changed
                    for event in &python_changes {
                        let relative_path = event
                            .path
                            .strip_prefix(&config.python.source_dir)
                            .unwrap_or(&event.path);
                        println!(
                            "{} {}",
                            "⚡".bright_yellow(),
                            relative_path.display().to_string().cyan()
                        );
                    }
                    
                    // Regenerate types
                    match regenerate(&config) {
                        Ok(duration) => {
                            println!(
                                "{} Types updated in {}",
                                "✓".green(),
                                format!("{}ms", duration.as_millis()).bright_yellow()
                            );
                        }
                        Err(e) => {
                            eprintln!("{} {}", "✗".red(), e);
                        }
                    }
                }
            }
            Ok(Err(error)) => {
                eprintln!("{} Watch error: {}", "✗".red(), error);
            }
            Err(e) => {
                eprintln!("{} Channel error: {}", "✗".red(), e);
                break;
            }
        }
    }
    
    Ok(())
}

/// Regenerate TypeScript definitions from Python source
fn regenerate(config: &Config) -> Result<Duration> {
    let start = Instant::now();
    
    // Parse all Python files
    let types = parser::parse_directory(&config.python.source_dir)?;
    
    // Generate and write TypeScript client
    generator::write_definitions(
        &config.typescript.output_file,
        &types,
        &config.api.base_url,
    )?;
    
    let duration = start.elapsed();
    
    // Log stats
    let model_count = types.models.len();
    let enum_count = types.enums.len();
    let route_count = types.routes.len();
    
    if model_count > 0 || enum_count > 0 || route_count > 0 {
        println!(
            "   {} models, {} enums, {} routes → {}",
            model_count.to_string().bright_cyan(),
            enum_count.to_string().bright_cyan(),
            route_count.to_string().bright_cyan(),
            config.typescript.output_file.display().to_string().green()
        );
    }
    
    Ok(duration)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;
    use tempfile::tempdir;

    #[test]
    fn test_regenerate() {
        let temp = tempdir().unwrap();
        let python_dir = temp.path().join("backend");
        let ts_file = temp.path().join("frontend/polyrpc.ts");
        
        fs::create_dir_all(&python_dir).unwrap();
        
        // Create a test Python file
        fs::write(
            python_dir.join("models.py"),
            r#"
from pydantic import BaseModel

class User(BaseModel):
    name: str
    email: str
"#,
        )
        .unwrap();
        
        let config = Config {
            python: crate::config::PythonConfig {
                source_dir: python_dir,
                include: vec!["**/*.py".to_string()],
                exclude: vec![],
            },
            typescript: crate::config::TypeScriptConfig {
                output_file: ts_file.clone(),
                generate_client: true,
            },
            api: crate::config::ApiConfig {
                base_url: "http://localhost:8000".to_string(),
                prefix: String::new(),
            },
        };
        
        let duration = regenerate(&config).unwrap();
        assert!(duration.as_millis() < 500); // Should be reasonably fast
        
        let content = fs::read_to_string(&ts_file).unwrap();
        assert!(content.contains("interface User"));
        assert!(content.contains("name: string"));
        assert!(content.contains("BASE_URL"));
    }
}
