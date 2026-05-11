# GDScript Patterns

## Typed Variables

```gdscript
var draw_pile: Array[CardInstance] = []
var hand: Array[CardInstance] = []
var discard_pile: Array[CardInstance] = []
var exhaust_pile: Array[CardInstance] = []
var enemies: Array[EnemyInstance] = []
var energy := 3
var max_energy := 3
var turn := 1
var player_block := 0

# Typed dictionary
var player_status := {
    Constants.STATUS_GUOYUN: 0,
    Constants.STATUS_YAOSHI: 0,
    Constants.STATUS_WEAK: 0,
    Constants.STATUS_VULNERABLE: 0,
    Constants.STATUS_STRENGTH: 0,
}
```

## @export Annotations

```gdscript
@export var battle_controller: BattleController
@export var effect_resolver: EffectResolver
```

## Signal Usage (EventBus)

```gdscript
# scripts/core/EventBus.gd
class_name EventBus
extends Node

signal hand_changed
signal battle_started
signal enemy_died(enemy: EnemyInstance)
signal turn_started(turn: int)

var _instance: EventBus

func _get_or_create_singleton() -> EventBus:
    if _instance == null:
        _instance = EventBus.new()
    return _instance

static func get_instance() -> EventBus:
    return _get_or_create_singleton()
```

```gdscript
# Emit
Events.hand_changed.emit()

# Emit with data
Events.enemy_died.emit(enemy)

# Connect
Events.hand_changed.connect(_on_hand_changed)
func _on_hand_changed() -> void:
    pass
```

## Initialization Pattern

```gdscript
func setup(run: RunState, enemy_list: Array[EnemyInstance]) -> void:
    run_state = run
    enemies = enemy_list
    draw_pile.clear()
    hand.clear()
    discard_pile.clear()
    exhaust_pile.clear()
    for card in run.deck:
        draw_pile.append(card.clone())
    draw_pile.shuffle()
    energy = max_energy
    turn = 1
    player_block = 0
```

## Array Operations

```gdscript
# Pop from back
hand.append(draw_pile.pop_back())

# Check empty
if draw_pile.is_empty():
    return

# Shuffle
draw_pile.shuffle()

# Iterate
for enemy in enemies:
    if enemy != null and not enemy.is_dead():
        result.append(enemy)

# Clear multiple
draw_pile.clear(); hand.clear(); discard_pile.clear(); exhaust_pile.clear()
```

## Boolean Returns

```gdscript
func spend_energy(amount: int) -> bool:
    if energy < amount:
        return false
    energy -= amount
    return true

func is_victory() -> bool:
    return get_alive_enemies().is_empty()

func is_defeat() -> bool:
    return run_state.hp <= 0
```

## Guard Clauses

```gdscript
func add_player_status(id: String, amount: int) -> void:
    if id.is_empty() or amount == 0:
        return
    player_status[id] = max(0, get_player_status(id) + amount)
```
