# Utils Crate

Library crate — `crates/utils`.

## Overview

Shared utility functions and helpers. This crate has **no internal dependencies** — only the Rust standard library and optional external crates gated behind features.

## Features

| Feature | Description |
|---------|-------------|
| `default` | Standard utilities |

## Common Utilities

### String Helpers

```rust
use your_utils::str;

let trimmed = str::trim_whitespace(s);
let slug = str::to_slug("Hello World");
```

### Collection Helpers

```rust
use your_utils::collection;

let unique: Vec<_> = collection::dedup(original);
let grouped = collection::group_by(items, |item| &item.category);
```

## Design Guidelines

- No dependency on other workspace crates
- Pure functions with no side effects
- Well-documented with examples
- Exhaustive test coverage
