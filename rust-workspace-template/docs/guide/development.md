# Development

## Development Commands

Use the `xtask` pattern for consistent, checked development commands:

```bash
cargo xtask check   # fmt + clippy + test (alias: make check)
cargo xtask fmt     # Format all code
cargo xtask lint    # Run clippy with strict warnings
cargo xtask test    # Run all workspace tests
cargo xtask doc     # Build documentation
cargo xtask security # Run cargo-deny and cargo-audit
```

> Never commit code that fails `cargo xtask check`.

## Manual Commands

```bash
cargo fmt --all
cargo clippy --workspace --all-targets --all-features -- -D warnings
cargo test --workspace --all-features
cargo doc --workspace --all-features --no-deps
cargo deny check
cargo audit
cargo machete
```

## Code Conventions

### Style

- Run `cargo fmt` before committing
- Clippy lints are enforced (`cargo clippy -D warnings`)
- Follow idiomatic Rust patterns

### Error Handling

- Use `thiserror` for library error types
- Use `anyhow` for binary/application errors
- Avoid `panic!` in library code; prefer returning `Result`

### Testing

- Unit tests: `#[cfg(test)] mod tests` co-located in `src/`
- Integration tests: `tests/integration.rs` at workspace root
- Doctests: `/// # Examples` in `src/lib.rs` doc comments

## Adding Dependencies

All versions live in `[workspace.dependencies]` in root `Cargo.toml`:

```toml
[workspace.dependencies]
my-dep = "1.0"
```

Individual crate `Cargo.toml` files use `.workspace = true` — never hardcode versions.

## MSRV Policy

MSRV (Minimum Supported Rust Version) is `1.80`. Check new dependencies for MSRV impact before adding them.
