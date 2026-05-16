# Getting Started

## Prerequisites

- **Rust** (latest stable, MSRV: 1.80)
- **cargo** (included with Rust)

Optional tools for full experience:

```bash
cargo install cargo-deny cargo-audit cargo-machete cargo-llvm-cov git-cliff
```

## Quick Start

Clone and build:

```bash
git clone https://github.com/your-org/your-repo.git
cd your-repo
cargo build --workspace
```

Run tests:

```bash
cargo test --workspace
```

Try the CLI:

```bash
cargo run -p your-cli -- hello Zeus
```

## Project Layout

```
crates/
  cli/       # Binary: CLI entrypoint using clap
  core/      # Library: business logic and domain types
  config/    # Library: TOML/JSON configuration loading
  utils/     # Library: shared utilities (no internal deps)
  macros/    # Proc-macro: optional procedural macros
xtask/       # Binary: development automation commands
tests/       # Integration tests
benches/     # Criterion benchmarks
```

## Next Steps

- Read the [Project Structure](/guide/project-structure) guide
- Learn about [Development](/guide/development) commands
- Check out the [API Reference](/api/overview)
