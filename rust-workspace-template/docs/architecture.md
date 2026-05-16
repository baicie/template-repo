# Architecture

## Design Principles

This template follows core Rust idioms:

- **Dependency inversion**: libraries have no knowledge of the binary
- **Minimal public API**: `pub(crate)` for internals, keep public surface small
- **No circular dependencies**: acyclic graph enforced by Cargo
- **Testable design**: business logic in library crates, CLI is a thin wrapper

## Crate Responsibilities

### `crates/cli`

Binary crate. Entry point for the command-line interface.

- Parses arguments using `clap`
- Delegates to library crates
- Handles application-level error reporting with `anyhow`

**Public API**: only `main()`, everything else is internal.

### `crates/core`

Library crate. Contains business logic and domain types.

- All fallible operations return `Result<T, Error>`
- Error types defined with `thiserror`
- Exposes clean public API for `cli` to consume

### `crates/config`

Library crate. Configuration loading.

- Reads TOML/JSON configuration files
- Validates configuration at startup
- Provides typed configuration structs

### `crates/utils`

Library crate. Shared utilities.

- Zero internal dependencies (pure helpers)
- Reusable across any crate
- No external dependencies beyond the Rust standard library

### `crates/macros`

Proc-macro crate. Optional.

- Contains `#[proc_macro]` definitions
- Zero runtime dependencies

## Dependency Graph

```
cli ──► core ──► utils
  │
  └─► config
```

## Error Handling Strategy

| Crate type | Error crate | When to use |
|------------|-------------|-------------|
| Library | `thiserror` | Define structured error types with `#[derive(Error)]` |
| Binary | `anyhow` | Context-rich error reporting for user-facing output |

### Example Library Error

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum CoreError {
    #[error("invalid input: {0}")]
    InvalidInput(String),
    #[error("resource not found: {0}")]
    NotFound(String),
}
```

### Example Binary Error

```rust
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let config = Config::load().context("failed to load config")?;
    // ...
}
```

## Unsafe Code Policy

`unsafe` blocks are **forbidden** by `#[forbid(unsafe_code)]` in the workspace lints. All memory safety is enforced at compile time.

If you must use `unsafe` for FFI or performance:

1. Isolate it in a dedicated module
2. Document safety invariants
3. Add `#[allow(unsafe_code)]` with a comment explaining why
4. Add tests that validate the safety invariants
