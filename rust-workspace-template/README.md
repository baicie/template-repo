# Rust Workspace Template

A production-ready Rust workspace template for multi-crate CLI/library projects.

## Features

- Multi-crate Cargo workspace
- CLI + core + config + utils + optional proc-macro crate
- `rustfmt`, `clippy`, tests, docs
- `xtask` development commands
- GitHub Actions CI on Linux, macOS, and Windows
- Security checks with `cargo-deny`, `cargo-audit`, and `cargo-machete`
- Coverage with `cargo llvm-cov`
- GitHub Release with multi-platform binaries
- Manual crates.io publishing workflow
- Dependabot, issue templates, PR template
- VSCode recommended settings

## Layout

```txt
crates/
  cli/       # binary crate
  core/      # core business logic
  config/    # config loading
  utils/     # shared helpers
  macros/    # optional proc-macro crate
xtask/       # repo automation commands
```

## Quick start

```bash
cargo build --workspace
cargo test --workspace
cargo run -p your-cli -- hello Zeus
```

## Development commands

```bash
cargo xtask check
cargo xtask fmt
cargo xtask lint
cargo xtask test
cargo xtask doc
cargo xtask security
```

Install optional tools:

```bash
cargo install cargo-deny cargo-audit cargo-machete cargo-llvm-cov git-cliff
```

## Rename checklist

Replace these placeholders:

- `your`
- `your-cli`
- `your-core`
- `your-config`
- `your-utils`
- `your-macros`
- `your-org/your-repo`
- author metadata in root `Cargo.toml`

## Release

Create and push a tag:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The release workflow builds multi-platform binaries and creates a GitHub Release.

## Publish crates

Set `CARGO_REGISTRY_TOKEN` in GitHub repository secrets, then run the `Publish crates` workflow manually.

Default mode is dry-run. Disable `dry_run` when ready.
