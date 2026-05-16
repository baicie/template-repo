# Release

## GitHub Release

Push a tag to trigger the release workflow:

```bash
git tag v0.1.0
git push origin v0.1.0
```

The workflow:

1. Runs CI checks (fmt, clippy, test, doc)
2. Builds multi-platform binaries (Linux, macOS, Windows)
3. Creates a GitHub Release with attached artifacts

## Publishing to crates.io

### Prerequisites

Set `CARGO_REGISTRY_TOKEN` in GitHub repository secrets (or locally):

```bash
# Local token (from crates.io account settings)
export CARGO_REGISTRY_TOKEN=your-token-here
```

### Dry Run

First, test the publish process without actually publishing:

```bash
cargo publish --manifest-path crates/your-crate/Cargo.toml --dry-run
```

### Publishing Order

Publish crates following dependency topology — publish leaf crates first:

```
utils → config → core → cli → macros
```

### GitHub Workflow

Use the **Publish crates** workflow (manually triggered):

1. Run with `dry_run = true` first
2. Verify all steps succeed
3. Run again with `dry_run = false`
4. Confirm each crate publishes successfully before proceeding to dependents

## Changelog

Use [git-cliff](https://github.com/orf/git-cliff) for automated changelog generation:

```bash
git-cliff --config cliff.toml --repository https://github.com/your-org/your-repo
```
