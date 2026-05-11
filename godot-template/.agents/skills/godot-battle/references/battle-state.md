# Battle State Reference

## BattleState Class

Core state manager for a single battle encounter.

```gdscript
class_name BattleState
extends Node

var run_state: RunState
var draw_pile: Array[CardInstance] = []
var hand: Array[CardInstance] = []
var discard_pile: Array[CardInstance] = []
var exhaust_pile: Array[CardInstance] = []
var enemies: Array[EnemyInstance] = []
var energy := 3
var max_energy := 3
var turn := 1
var player_block := 0
var player_status := {
    Constants.STATUS_GUOYUN: 0,
    Constants.STATUS_YAOSHI: 0,
    Constants.STATUS_WEAK: 0,
    Constants.STATUS_VULNERABLE: 0,
    Constants.STATUS_STRENGTH: 0,
}
```

## Card Pile System

```
┌─────────────┐    draw     ┌─────────┐    discard   ┌─────────────────┐
│  Draw Pile   │ ─────────> │  Hand   │ ───────────> │  Discard Pile   │
│  (shuffled)  │             │         │              │                 │
└─────────────┘             └─────────┘              └─────────────────┘
       │                                                         │
       │              reshuffle (when empty)                     │
       └─────────────────────────────────────────────────────────┘

┌─────────────────┐
│  Exhaust Pile   │
│  (removed from   │
│   game)          │
└─────────────────┘
```

## Setup

```gdscript
func setup(run: RunState, enemy_list: Array[EnemyInstance]) -> void:
    run_state = run
    enemies = enemy_list
    draw_pile.clear(); hand.clear(); discard_pile.clear(); exhaust_pile.clear()
    for card in run.deck:
        draw_pile.append(card.clone())
    draw_pile.shuffle()
    energy = max_energy
    turn = 1
    player_block = 0
    for key in player_status.keys():
        player_status[key] = 0
```

## Draw / Discard Flow

```gdscript
func draw_cards(count: int) -> void:
    for i in range(count):
        if draw_pile.is_empty():
            reshuffle_discard()
        if draw_pile.is_empty():
            return
        hand.append(draw_pile.pop_back())
    Events.hand_changed.emit()

func reshuffle_discard() -> void:
    if discard_pile.is_empty():
        return
    draw_pile = discard_pile.duplicate()
    discard_pile.clear()
    draw_pile.shuffle()

func discard_hand() -> void:
    while not hand.is_empty():
        discard_pile.append(hand.pop_back())
    Events.hand_changed.emit()

func discard_card(card: CardInstance) -> void:
    hand.erase(card)
    discard_pile.append(card)
    Events.hand_changed.emit()

func exhaust_card(card: CardInstance) -> void:
    hand.erase(card)
    exhaust_pile.append(card)
    Events.hand_changed.emit()
```

## Energy System

```gdscript
func gain_energy(amount: int) -> void:
    energy += amount

func spend_energy(amount: int) -> bool:
    if energy < amount:
        return false
    energy -= amount
    return true
```

## Block System

```gdscript
func gain_block(amount: int) -> void:
    player_block += max(0, amount)

func take_player_damage(amount: int) -> int:
    var remain := max(0, amount)
    if player_block > 0:
        var blocked = min(player_block, remain)
        player_block -= blocked
        remain -= blocked
    if remain > 0:
        return run_state.take_damage(remain)
    return 0
```

## Status Management

```gdscript
func get_player_status(id: String) -> int:
    return int(player_status.get(id, 0))

func add_player_status(id: String, amount: int) -> void:
    if id.is_empty() or amount == 0:
        return
    player_status[id] = max(0, get_player_status(id) + amount)

func remove_player_status(id: String, amount: int) -> void:
    add_player_status(id, -amount)
```

## End Conditions

```gdscript
func get_alive_enemies() -> Array[EnemyInstance]:
    var result: Array[EnemyInstance] = []
    for enemy in enemies:
        if enemy != null and not enemy.is_dead():
            result.append(enemy)
    return result

func is_victory() -> bool:
    return get_alive_enemies().is_empty()

func is_defeat() -> bool:
    return run_state.hp <= 0
```
