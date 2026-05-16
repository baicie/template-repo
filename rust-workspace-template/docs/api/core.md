# Core Crate

Library crate — `crates/core`.

## Overview

Contains the core business logic and domain types. All fallible operations return `Result<T, CoreError>`.

## Crate Features

| Feature | Description |
|---------|-------------|
| `default` | Standard functionality |
| `serde` | Serialization support |

## Error Types

```rust
#[derive(Error, Debug)]
pub enum CoreError {
    #[error("invalid input: {0}")]
    InvalidInput(String),
    #[error("resource not found: {0}")]
    NotFound(String),
    #[error("operation failed: {0}")]
    OperationFailed(String),
}
```

## Usage

```rust
use your_core::{CoreError, run};

fn main() -> Result<(), CoreError> {
    run()?;
    Ok(())
}
```

## Dependency

Depends on `crates/utils` for shared helper functions.
