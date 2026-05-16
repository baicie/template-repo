# Config Crate

Library crate — `crates/config`.

## Overview

Handles loading and validating configuration from TOML/JSON files.

## Usage

```rust
use your_config::{Config, ConfigError};

fn main() -> Result<(), ConfigError> {
    let config = Config::from_file("config.toml")?;
    println!("{:?}", config);
    Ok(())
}
```

## Config File Format

```toml
[app]
name = "my-app"
log_level = "info"

[app.database]
host = "localhost"
port = 5432
```

## Validation

Configuration is validated at load time. Invalid configuration returns a `ConfigError` with a descriptive message.
