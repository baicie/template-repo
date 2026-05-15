# Release

## GitHub Release

```bash
git tag v0.1.0
git push origin v0.1.0
```

## crates.io

1. Set `CARGO_REGISTRY_TOKEN`.
2. Run the `Publish crates` workflow.
3. First run with `dry_run = true`.
4. Run again with `dry_run = false`.

Publish order should follow dependency topology.
