# Agent Guide — Rust Workspace Template

Welcome. This is a production-ready Rust workspace template for CLI/library projects.

## Project Structure

```
crates/cli       → Binary: CLI entrypoint (clap)
crates/core      → Library: business logic + domain types
crates/config    → Library: configuration loading (TOML/JSON)
crates/utils     → Library: shared utilities (leaf, no internal deps)
crates/macros    → Proc-macro: optional procedural macros
xtask            → Binary: development automation
tests/           → Integration tests
benches/         → Criterion benchmarks
```

**Dependency graph:**
```
cli → core, config
core → utils
config → (none)
macros → (none)
```

## Key Commands

| Command | What it does |
|---------|-------------|
| `make check` | fmt + clippy + test (alias: `cargo xtask check`) |
| `cargo test --all` | Run all workspace tests |
| `cargo doc --no-deps` | Build documentation |
| `cargo deny check` | Dependency audit |
| `cargo audit` | Security vulnerability scan |
| `cargo machete` | Detect unused dependencies |

**Never commit code that fails `make check`.**

## Code Conventions

### Style
- Run `cargo fmt` before committing
- Clippy lints are enforced (`cargo clippy -D warnings`)
- Follow idiomatic Rust: prefer `Result` over `Option` for fallible operations, use `thiserror` for error types, `anyhow` for application errors

### Dependencies
- All versions live in `[workspace.dependencies]` at root `Cargo.toml`
- Individual crate `Cargo.toml` files use `.workspace = true` — **never hardcode versions**
- Adding a new dependency: add it to `[workspace.dependencies]` first, then use in crate manifests
- MSRV is `1.80` — check new dependencies for MSRV impact

### Crate Types
- Library crates: public API should be minimal; internals `pub(crate)` or private
- Binary crates: parse args with `clap`, delegate to library crates
- Keep business logic in library crates, not in `cli`

### Testing
- Unit tests: `#[cfg(test)] mod tests` co-located in `src/`
- Integration tests: `tests/integration.rs` at workspace root
- Doctests: `/// # Examples` in `src/lib.rs` doc comments
- Run `cargo xtask test` before marking a feature complete

### Error Handling
- Use `thiserror` for library error types (structured, `?`-friendly)
- Use `anyhow` for binary/application errors
- Avoid `panic!` in library code; prefer returning `Result`
- `unsafe` blocks must be isolated, documented, and tested

## CI/CD

Tests run on **Ubuntu, Windows, and macOS** (see `.github/workflows/ci.yml`). Security scans run weekly. Multi-platform binary releases on tag push.

## Documentation

- Public API documentation should be written in doc comments (`///`)
- Architecture decisions should be documented in `docs/`
- Run `cargo doc --no-deps` to build docs locally

## Before Starting Work

1. Read `CONTRIBUTING.md` for contribution guidelines
2. Run `cargo xtask check` to confirm the workspace builds cleanly
3. Understand the crate dependency graph before adding cross-crate dependencies

## Skills

This project includes skills for common agent workflows. Use them by invoking the slash command:

| Skill | When to use |
|-------|------------|
| `/setup-rust` | Configure the agent for this workspace (run once) |
| `/tdd` | Test-driven development with red-green-refactor |
| `/diagnose` | Debug compilation errors, panics, or incorrect output |
| `/zoom-out` | Get a high-level overview of the codebase |
| `/improve-codebase-architecture` | Find architectural refactoring opportunities |
| `/grill-me` | Stress-test a plan before implementing |
| `/caveman` | Ultra-compressed communication mode |
| `/rust-async-patterns` | Tokio async patterns, channels, graceful shutdown |
| `/rust-best-practices` | Idiomatic Rust: borrowing, errors, clippy, generics |
| `/rust-security` | cargo-audit, cargo-deny, RUSTSEC, fuzzing, Miri |
| `/tdd-rust` | Red-green-refactor with real fixtures, insta snapshots |
