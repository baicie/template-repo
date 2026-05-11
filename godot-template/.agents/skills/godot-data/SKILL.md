---
name: godot-data
description: Data-driven design for this project. Use when adding or modifying cards, enemies, game config, JSON data files, or JSON Schema. Covers card effects (damage, block, draw, energy, status, conditional), enemy definitions (intents, moves, regions), data validation schema, and Python validation scripts.
license: MIT
---

# Godot Data-Driven Design

This project separates game content (cards, enemies, config) from game logic (GDScript). All content lives in JSON files validated by JSON Schema and Python scripts.

## When to Use

- Adding new cards or modifying existing cards
- Adding new enemies or modifying enemy AI
- Changing game configuration values
- Validating data files
- Understanding the data schema

## Loading Files

**Consider loading these reference files based on your task:**

- [ ] [references/cards.md](references/cards.md) - card structure, effect types, upgrade format, JSON schema
- [ ] [references/enemies.md](references/enemies.md) - enemy structure, intent system, region progression, JSON schema

**DO NOT load all files at once.** Load only what's relevant to your current task.

## Key Data Files

| File                             | Purpose                              |
| -------------------------------- | ------------------------------------ |
| `resources/data/cards.json`      | All card definitions (40+ cards)     |
| `resources/data/enemies.json`    | All enemy definitions (15 enemies)    |
| `configs/game.json`              | Game-wide configuration               |
| `schemas/cards.schema.json`      | JSON Schema for card validation      |
| `schemas/enemies.schema.json`    | JSON Schema for enemy validation     |
| `tools/validate_json.py`         | Python validation script (Pytest)     |

## Card Effect Types

| Effect Type                  | Description                          |
| ---------------------------- | ------------------------------------ |
| `damage`                     | Deal damage to target                |
| `block`                      | Grant block (defense) to player      |
| `draw`                       | Draw cards from deck                 |
| `gain_energy`                | Gain energy this turn                |
| `heal`                       | Heal player HP                       |
| `apply_enemy_status`         | Apply status to one enemy            |
| `apply_all_enemy_status`     | Apply status to all enemies          |
| `gain_player_status`         | Apply status to player              |
| `remove_player_status`       | Remove status from player           |
| `if_enemy_has_status_damage_bonus` | Conditional damage bonus      |
| `if_player_status_draw`      | Draw cards based on player status   |
| `per_player_status_damage`   | Scale damage by player status       |

## Status System

Player statuses: `guoyun`, `yaoshi`, `weak`, `vulnerable`, `strength`
Enemy statuses: `zhenya`, `burn`, `block`

## Card Rarities

`starter` → `common` → `uncommon` → `rare` (progressive)

## Validation

Always run validation after modifying data:

```bash
cd tools
python -m pytest validate_json.py -v
```

Or via GitHub Actions (runs on every push):
```bash
python tools/validate_json.py --cards resources/data/cards.json --enemies resources/data/enemies.json
```

## Cross-Skill References

- **Writing GDScript game logic** → Use `gdscript` skill for class patterns
- **Battle system logic** → Use `godot-battle` skill for effect execution
- **Running tests** → Use `godot-testing` skill for Python/Pytest setup
- **Exporting game** → Use `godot-export` skill for build targets
