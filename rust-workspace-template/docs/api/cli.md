# CLI Crate

Binary crate — `crates/cli`.

## Overview

Entry point for the command-line interface. Parses user input using `clap` and delegates to library crates.

## Quick Start

```bash
cargo run -p your-cli -- --help
```

## Usage

```text
$ your-cli --help
your-cli [OPTIONS] <COMMAND>

Commands:
  run      Run the application
  config   Manage configuration
  help     Print this message or the help of the given subcommand(s)

Options:
  -v, --verbose...  Increase verbosity (-v, -vv, -vvv)
  -h, --help        Print help
  -V, --version     Print version
```

## Error Handling

Uses `anyhow::Result<()>` for application-level errors. All errors are reported with rich context via `.context()`.
