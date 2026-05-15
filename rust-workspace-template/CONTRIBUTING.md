# Contributing

## Requirements

- Rust stable
- `rustfmt`
- `clippy`

Recommended:

```bash
cargo install cargo-deny cargo-audit cargo-machete cargo-llvm-cov git-cliff
```

## Before opening a PR

```bash
cargo xtask check
cargo xtask security
```

## Commit style

Conventional Commits are recommended:

```txt
feat: add new command
fix: handle empty config path
docs: update usage
chore: update dependencies
```
