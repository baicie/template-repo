# CI Pipeline Reference

## validate.yml Overview

Located at `.github/workflows/validate.yml`. Runs on every push and pull request.

## Jobs Breakdown

### Job 1: validate-json

```yaml
validate-json:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: '3.11'
    - name: Install dependencies
      run: pip install pytest jsonschema
    - name: Validate JSON data
      run: |
        python -m pytest tools/validate_json.py -v
```

**Purpose**: Validates card and enemy JSON against JSON Schema using Pytest.

### Job 2: python-tests

```yaml
python-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v5
      with:
        python-version: '3.11'
    - name: Install test dependencies
      run: pip install pytest
    - name: Run Python unit tests
      run: python -m pytest tests/ -v
```

**Purpose**: Runs Python unit tests in the `tests/` directory.

### Job 3: godot-import

```yaml
godot-import:
  runs-on: ubuntu-latest
  container:
    image: barichello/godot-ci:4.2
  steps:
    - uses: actions/checkout@v4
    - name: Headless import
      run: godot --headless --import
```

**Purpose**: Godot headless import check ensures all resources load without errors.

### Job 4: export-smoke

```yaml
export-smoke:
  runs-on: ubuntu-latest
  container:
    image: barichello/godot-ci:4.2
  needs: [godot-import]
  steps:
    - uses: actions/checkout@v4
    - name: Export Linux binary
      run: |
        godot --headless --export-release "Linux/X11" builds/linux/zhenyaosi.x86_64
        ls -la builds/linux/
```

**Purpose**: Smoke test that exports the game to verify the build pipeline works.

## GitHub Actions Tips

- `barichello/godot-ci` Docker image includes Godot 4.x headless + tools
- Jobs run in parallel unless `needs:` is specified
- `ubuntu-latest` works for Python-only jobs
- Use `with: fetch-depth: 0` for git operations

## release.yml (Release Workflow)

Located at `.github/workflows/release.yml`. Triggered on git tags matching `v*`.

```yaml
on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ubuntu-latest
    container:
      image: barichello/godot-ci:4.2
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Get version
        run: echo "VERSION=${GITHUB_REF#refs/tags/v}" >> $GITHUB_ENV
      - name: Export Linux
        run: godot --headless --export-release "Linux/X11" builds/linux/zhenyaosi.x86_64
      - name: Export Web
        run: godot --headless --export-release "Web" builds/web/index.html
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          files: builds/linux/* builds/web/*
```

## Running CI Locally

```bash
# Install act for local GitHub Actions testing
# brew install act

# Run workflow locally (requires Docker)
act -W .github/workflows/validate.yml
```
