---
name: godot-export
description: Godot export and pipeline. Use when configuring export_presets.cfg, setting up export profiles (Linux/X11, Web), understanding release workflow, managing builds/ output directory, or modifying release.yml. Covers export presets, build targets, Godot CLI export commands, and release automation.
license: MIT
---

# Export & Pipeline

This project exports to **Linux/X11** (native binary) and **Web** (HTML5). Export configuration lives in `export_presets.cfg`.

## When to Use

- Configuring export profiles
- Understanding build output locations
- Modifying release workflow
- Setting up new export targets
- Running Godot CLI export commands

## Loading Files

**Consider loading this reference file:**

- [ ] [references/export.md](references/export.md) - export_presets.cfg structure, export commands, build directory layout, release workflow

**DO NOT load this file unless you're working on export configuration.**

## Export Profiles

| Profile         | Output Path                          | Purpose                |
| --------------- | ------------------------------------ | ---------------------- |
| `Linux/X11`     | `builds/linux/zhenyaosi.x86_64`      | Native Linux release   |
| `Web`           | `builds/web/index.html`             | Browser (HTML5)        |

## Quick Commands

### Export Linux Binary

```bash
godot --headless --export-release "Linux/X11" builds/linux/zhenyaosi.x86_64
```

### Export Web

```bash
godot --headless --export-release "Web" builds/web/index.html
```

### Headless Import Check

```bash
godot --headless --import
```

## Cross-Skill References

- **Testing exports** → Use `godot-testing` skill for smoke test and CI pipeline
- **Data validation** → Use `godot-data` skill for JSON data validation
- **GDScript development** → Use `gdscript` skill for script patterns
