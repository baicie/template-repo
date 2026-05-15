# Rust Workspace Setup

Project-level configuration that the other Rust skills consume.

## What This Does

This skill configures the agent for Rust-first development in this workspace. Run once per project before using any other Rust skill.

## Configuration Steps

### 1. Detect Toolchain

Run `rustc --version && cargo --version` and note:
- MSRV (Minimum Supported Rust Version) — currently `1.80`
- Latest stable version
- Whether `rustup` is available for toolchain switching

### 2. Detect xtask Commands

Read `xtask/src/main.rs` and build a command index:

| Command | Equivalent To |
|---------|--------------|
| `cargo xtask check` | `cargo fmt && cargo clippy && cargo test` |
| `cargo xtask fmt` | `cargo fmt` |
| `cargo xtask lint` | `cargo clippy -D warnings` |
| `cargo xtask test` | `cargo test --all` |
| `cargo xtask doc` | `cargo doc --no-deps` |
| `cargo xtask security` | `cargo deny check` + `cargo audit` + `cargo machete` |

Prefer `cargo xtask check` over individual commands unless doing targeted work.

### 3. Identify Workspace Members

Parse root `Cargo.toml` `[workspace.members]` and confirm crate types:

```toml
# Binary crates (have main.rs)
- crates/cli (your-cli)

# Library crates
- crates/core (your-core)
- crates/config (your-config)
- crates/utils (your-utils)
- crates/macros (your-macros)

# Automation
- xtask
```

### 4. Map Dependencies

Read each crate's `Cargo.toml` to understand the dependency graph. The hierarchy is:

```
cli → core, config
core → utils
config → (none)
utils → (none)
macros → (none)
```

### 5. Identify Config Files

| File | Purpose |
|------|---------|
| `rustfmt.toml` | Code formatting rules |
| `clippy.toml` | Clippy lint configuration |
| `deny.toml` | cargo-deny dependency audit config |
| `cliff.toml` | git-cliff changelog generation |
| `.cargo/config.toml` | Build configuration, xtask alias |

### 6. Issue Tracker Setup

Ask the user which issue tracker they use (GitHub Issues, Linear, local, or none). Configure `/triage` labels accordingly.

### 7. Security & Release Workflows

Note the CI workflow path: `.github/workflows/ci.yml`. Tests run on Ubuntu, Windows, and macOS. Security scans run weekly via `security.yml`.

## Notes

- This is a **workspace template**. The user will rename crates. If they ask to rename `your-cli`, update `Cargo.toml` members, crate names, and `[[bin]]` entries.
- MSRV is `1.80` — do not introduce dependencies requiring a higher version without warning.
- All workspace members share versions via `[workspace.package]` — do not hardcode versions in individual crate `Cargo.toml` files.
