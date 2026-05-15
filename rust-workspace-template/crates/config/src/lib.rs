//! Application configuration.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::{env, fs, path::PathBuf};

/// Runtime configuration.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct AppConfig {
    /// Application name.
    pub name: String,
    /// Whether debug behavior is enabled.
    pub debug: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            name: "your".to_string(),
            debug: false,
        }
    }
}

impl AppConfig {
    /// Loads config from `YOUR_CONFIG` if set, otherwise returns defaults.
    pub fn load() -> Result<Self> {
        let Some(path) = env::var_os("YOUR_CONFIG").map(PathBuf::from) else {
            return Ok(Self::default());
        };

        let source = fs::read_to_string(&path)
            .with_context(|| format!("failed to read config file {}", path.display()))?;

        toml::from_str(&source)
            .with_context(|| format!("failed to parse config file {}", path.display()))
    }

    /// Serializes config to pretty JSON.
    pub fn to_json(&self) -> Result<String> {
        serde_json::to_string_pretty(self).context("failed to serialize config")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_config_is_stable() {
        assert_eq!(
            AppConfig::default(),
            AppConfig {
                name: "your".to_string(),
                debug: false
            }
        );
    }
}
