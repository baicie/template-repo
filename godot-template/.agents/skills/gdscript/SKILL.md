---
name: godot-gdscript
description: Godot 4.x GDScript development. Use when writing GDScript code for this project - class structure, signals, autoloads, scene composition, typed variables, enums, @export annotations, state machines, JSON data loading, Godot 4.2 API, and the project's coding conventions. Also use when modifying scripts/battle/, scripts/cards/, scripts/core/, scripts/enemies/, or scripts/ui/ directories.
license: MIT
---

# GDScript — Godot 4.x

Project uses Godot 4.2 with typed GDScript (`extends`, `@export`, `class_name`).

## When to Use

- Writing new GDScript classes
- Modifying existing scripts in `scripts/` or `scenes/`
- Adding signals, autoloads, or state machines
- Working with typed variables and API
- Understanding the existing class structure

## Loading Files

**Consider loading these reference files based on your task:**

- [ ] [references/naming.md](references/naming.md) - naming conventions, file/class naming
- [ ] [references/patterns.md](references/patterns.md) - signal usage, autoloads, @export, typed arrays, state patterns
- [ ] [references/godot-api.md](references/godot-api.md) - common Godot 4.x API patterns (signals, Node traversal, `_ready`, `_process`, etc.)

**DO NOT load all files at once.** Load only what's relevant to your current task.

## Quick Examples

### Class Definition

```gdscript
class_name CardExecutor
extends Node

@export var battle_controller: BattleController
@export var effect_resolver: EffectResolver
```

### Typed Variables & Arrays

```gdscript
var draw_pile: Array[CardInstance] = []
var enemies: Array[EnemyInstance] = []
var run_state: RunState

func get_alive_enemies() -> Array[EnemyInstance]:
    var result: Array[EnemyInstance] = []
    for enemy in enemies:
        if enemy != null and not enemy.is_dead():
            result.append(enemy)
    return result
```

### Signals (EventBus pattern)

```gdscript
# In scripts/core/EventBus.gd
signal hand_changed
signal battle_started
signal enemy_died(enemy: EnemyInstance)
signal turn_started(turn: int)

# Emit
Events.hand_changed.emit()

# Connect
Events.hand_changed.connect(_on_hand_changed)
```

### Constant definitions

```gdscript
class_name Constants

const STATUS_BLOCK := "block"
const STATUS_GUOYUN := "guoyun"
const STATUS_YAOSHI := "yaoshi"
const STATUS_ZHENYA := "zhenya"
const STATUS_BURN := "burn"
const STATUS_WEAK := "weak"
const STATUS_VULNERABLE := "vulnerable"
const STATUS_STRENGTH := "strength"

const TARGET_ENEMY := "enemy"
const TARGET_SELF := "self"
const TARGET_ALL_ENEMIES := "all_enemies"

const INTENT_ATTACK := "attack"
const INTENT_DEFEND := "defend"
const INTENT_DEBUFF := "debuff"
```

### Autoloads

Project autoloads: `EventBus` as `Events`, `Game` as `Game` (see `project.godot`).

## Reference Files

| Task                         | File                                |
| ---------------------------- | ---------------------------------- |
| Naming conventions           | [references/naming.md](references/naming.md) |
| Patterns (signals, exports)   | [references/patterns.md](references/patterns.md) |
| Godot 4.x API patterns       | [references/godot-api.md](references/godot-api.md) |

## Cross-Skill References

- **Adding new cards/enemies** → Use `godot-data` skill for JSON schema and data format
- **Battle logic changes** → Use `godot-battle` skill for battle state and effect patterns
- **Testing data validation** → Use `godot-testing` skill for Python/Pytest validation
- **Exporting for Linux/Web** → Use `godot-export` skill for export configuration
