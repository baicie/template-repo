# Development

## Common commands

```bash
cargo xtask check
cargo xtask fmt
cargo xtask lint
cargo xtask test
cargo xtask security
```

## Adding a crate

```bash
cargo new crates/new-crate --lib
```

Then add it to root `Cargo.toml` workspace members and workspace dependencies.
