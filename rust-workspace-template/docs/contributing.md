# Contributing

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/your-repo.git`
3. Add the upstream remote: `git remote add upstream https://github.com/your-org/your-repo.git`
4. Create a feature branch: `git checkout -b feat/your-feature`

## Development Setup

```bash
# Install Rust (MSRV: 1.80)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install optional tools
cargo install cargo-deny cargo-audit cargo-machete cargo-llvm-cov git-cliff

# Verify setup
cargo xtask check
```

## Code Standards

Before submitting a PR, ensure:

- [ ] `cargo xtask check` passes
- [ ] `cargo fmt` has been run
- [ ] No new clippy warnings introduced
- [ ] Tests pass: `cargo test --workspace`
- [ ] Docs build: `cargo doc --workspace --no-deps`

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(core): add new configuration option
fix(cli): handle missing config file gracefully
docs: update contributing guide
refactor(utils): simplify string helper functions
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new functionality
3. Ensure CI passes on all platforms
4. Request review from maintainers
5. Address feedback promptly

## Branch Protection

- `main` is a protected branch
- Direct pushes are forbidden
- All PRs require review and passing CI

## Questions?

Open an issue on GitHub for bugs, feature requests, or questions.
