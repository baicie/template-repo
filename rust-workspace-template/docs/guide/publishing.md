# Publishing

## Publishing to crates.io

### Preparation

1. Update version in `Cargo.toml`
2. Run `cargo xtask check` to ensure everything passes
3. Review `CHANGELOG.md` for accuracy

### Dry Run

Always test first:

```bash
cargo publish --manifest-path crates/your-crate/Cargo.toml --dry-run
```

### Actual Publish

```bash
cargo publish --manifest-path crates/your-crate/Cargo.toml
```

## Workspace Publishing

When publishing a workspace, each crate must be published separately. Publish order matters:

1. **utils** (no internal dependencies)
2. **config** (no internal dependencies)
3. **macros** (no internal dependencies)
4. **core** (depends on utils)
5. **cli** (depends on core, config)

## Versioning

- Use [Semantic Versioning](https://semver.org/)
- Update `CHANGELOG.md` for each release
- Tag commits with `v*.*.*` format

## Authentication

```bash
# From crates.io account settings
export CARGO_REGISTRY_TOKEN=your_token

# Or use cargo login to store it
cargo login
```

## Automation

The GitHub **Publish crates** workflow handles authentication securely via repository secrets.
