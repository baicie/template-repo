# Project Structure

## Crate Overview

| Crate | Type | Purpose |
|-------|------|---------|
| `crates/cli` | Binary | CLI entrypoint using `clap`, parses args and delegates to libraries |
| `crates/core` | Library | Business logic and domain types |
| `crates/config` | Library | Configuration loading from TOML/JSON files |
| `crates/utils` | Library | Shared helpers, no internal dependencies |
| `crates/macros` | Proc-macro | Optional procedural macros |
| `xtask` | Binary | Development automation (fmt, lint, check, etc.) |

## Dependency Graph

```
cli → core, config
core → utils
config → (none)
utils → (none)
macros → (none)
```

Keep dependencies flowing inward. Avoid circular dependencies.

## Key Files

- `Cargo.toml` — Workspace configuration with shared `[workspace.dependencies]`
- `rust-toolchain.toml` — Rust toolchain pinned version
- `xtask/src/main.rs` — Development automation entrypoint
- `.cargo/config.toml` — Cargo configuration (build scripts, etc.)
- `.vscode/settings.json` — Editor configuration

## Adding a New Crate

```bash
cargo new crates/new-crate --lib
```

Then add it to the workspace:

1. Add `"crates/new-crate"` to `members` in root `Cargo.toml`
2. Add dependency entry to `[workspace.dependencies]`
3. Reference it in other crates via workspace path

## File Naming Conventions

- Rust source files: `snake_case.rs`
- Test directories: `tests/` at crate root
- Benchmark directories: `benches/` at workspace root
- Examples: `examples/` at workspace root
