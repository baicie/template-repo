---
name: godot-testing
description: Testing and CI for this project. Use when running Python validation tests (pytest), modifying validate_json.py, configuring GitHub Actions workflows, adding test cases, or running the Godot headless import check. Covers JSON Schema validation, Python unit tests, CI pipeline (validate.yml), and the smoke test.
license: MIT
---

# Testing & CI

This project uses Python/Pytest for data validation and GitHub Actions for CI automation.

## When to Use

- Running data validation tests
- Adding new test cases for cards or enemies
- Modifying the CI pipeline
- Adding Python unit tests
- Understanding the CI workflow

## Loading Files

**Consider loading these reference files based on your task:**

- [ ] [references/python-tests.md](references/python-tests.md) - Python test patterns, validate_json.py structure, fixture usage
- [ ] [references/ci.md](references/ci.md) - GitHub Actions workflow breakdown, each job's purpose

**DO NOT load all files at once.** Load only what's relevant to your current task.

## Quick Start

### Run Validation Tests

```bash
cd tools
python -m pytest validate_json.py -v
```

### Run Specific Test

```bash
python -m pytest validate_json.py -v -k "test_card_zhan_yao_dao"
```

### Validate Specific File

```bash
python tools/validate_json.py \
    --cards resources/data/cards.json \
    --enemies resources/data/enemies.json
```

### Godot Headless Import

```bash
godot --headless --import
```

### Export Smoke Test

```bash
godot --headless --export-release "Linux/X11" builds/linux/zhenyaosi.x86_64
```

## CI Pipeline (validate.yml)

| Job             | Purpose                                      |
| --------------- | -------------------------------------------- |
| `validate-json` | Run Python/Pytest validation on JSON data    |
| `python-tests`  | Run Python unit tests (pytest)               |
| `godot-import`  | Godot headless import check                  |
| `export-smoke`  | Export PCK to verify build pipeline works    |

## Cross-Skill References

- **Adding cards/enemies** → Use `godot-data` skill for JSON format
- **GDScript development** → Use `gdscript` skill for code patterns
- **Export configuration** → Use `godot-export` skill for export_presets.cfg
