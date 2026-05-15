# Architecture

## Crates

- `your-cli`: command line entrypoint
- `your-core`: core business logic
- `your-config`: configuration loading
- `your-utils`: shared utilities
- `your-macros`: optional procedural macros

## Dependency direction

```txt
cli -> core, config
core -> utils
config -> none
utils -> none
macros -> none
```

Keep dependencies flowing inward and avoid circular design.
