# Macros Crate

Proc-macro crate — `crates/macros`.

## Overview

Optional procedural macros for the workspace. This crate has **no runtime dependencies**.

## Available Macros

### `#[derive(MyMacro)]`

```rust
use your_macros::MyMacro;

#[derive(MyMacro)]
pub struct MyStruct {
    field: String,
}
```

## Feature Flags

| Feature | Description |
|---------|-------------|
| `default` | All macros available |

## Guidelines

- Keep proc-macro crates small and focused
- Place complex logic in a separate library crate
- Write tests for the generated output
- Document the input syntax and output invariants
