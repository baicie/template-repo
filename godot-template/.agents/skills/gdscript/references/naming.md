# GDScript Naming Conventions

## File Naming

- **Scene files**: `PascalCase.tscn` (e.g., `BattleScene.tscn`, `MainMenu.tscn`)
- **Script files**: `PascalCase.gd` (e.g., `BattleController.gd`, `CardExecutor.gd`)
- **Data files**: `snake_case.json` (e.g., `cards.json`, `enemies.json`)
- **Config files**: `snake_case.cfg` or `PascalCase.cfg` (e.g., `export_presets.cfg`)

## Class Naming

- **Classes**: `PascalCase` using `class_name` (e.g., `class_name CardExecutor`)
- **Autoloads**: PascalCase (e.g., `EventBus`, `Game`)
- **Constants**: `SCREAMING_SNAKE_CASE` for true constants, or `snake_case` for namespaced string constants

## Variable Naming

| Variable Type        | Convention     | Example                          |
| ------------------- | -------------- | -------------------------------- |
| Local variables     | `snake_case`   | `var draw_pile: Array[CardInstance]` |
| Member variables    | `snake_case`   | `var player_block := 0`          |
| Constants (local)   | `SCREAMING_SNAKE` | `const MAX_ENERGY := 3`        |
| String constants    | `SCREAMING_SNAKE` | `const STATUS_BLOCK := "block"` |
| Typed arrays        | `snake_case: Array[Type]` | `var enemies: Array[EnemyInstance]` |

## Signal Naming

Signals follow `snake_case` or `verb_noun` pattern:

```gdscript
signal hand_changed
signal battle_started
signal enemy_died(enemy: EnemyInstance)
signal turn_started(turn: int)
```

## Function Naming

```gdscript
func draw_cards(count: int) -> void:
func reshuffle_discard() -> void:
func get_alive_enemies() -> Array[EnemyInstance]:
func is_victory() -> bool:
func take_player_damage(amount: int) -> int:
```

Use `get_` prefix for getters, `is_` for boolean checks, `has_` for existence checks.
