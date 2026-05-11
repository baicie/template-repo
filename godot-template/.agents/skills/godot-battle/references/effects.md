# Effect Resolution Reference

## Effect Resolution Pipeline

When a card is played, `CardExecutor` iterates through each effect in the card's `effects` array and delegates to `EffectResolver`.

```
Card played
  └─ CardExecutor.play_card(card)
       └─ For each effect in card.effects:
            └─ EffectResolver.resolve(effect, target)
                 └─ Effect-specific logic
```

## Effect Types & Resolution

### Damage

```gdscript
func resolve_damage(effect: Dictionary, target: EnemyInstance) -> void:
    var base_damage = effect.get("value", 0)
    var final_damage = DamageCalculator.calculate(
        base_damage,
        target,
        battle_state
    )
    target.take_damage(final_damage)
```

### Block

```gdscript
func resolve_block(effect: Dictionary) -> void:
    var amount = effect.get("value", 0)
    battle_state.gain_block(amount)
```

### Draw Cards

```gdscript
func resolve_draw(effect: Dictionary) -> void:
    var count = effect.get("value", 0)
    battle_state.draw_cards(count)
```

### Gain Energy

```gdscript
func resolve_gain_energy(effect: Dictionary) -> void:
    var amount = effect.get("value", 0)
    battle_state.gain_energy(amount)
```

### Apply Enemy Status

```gdscript
func resolve_apply_enemy_status(effect: Dictionary, target: EnemyInstance) -> void:
    var status = effect.get("status", "")
    var value = effect.get("value", 0)
    target.add_status(status, value)
```

### Apply All Enemy Status

```gdscript
func resolve_apply_all_enemy_status(effect: Dictionary) -> void:
    var status = effect.get("status", "")
    var value = effect.get("value", 0)
    for enemy in battle_state.get_alive_enemies():
        enemy.add_status(status, value)
```

### Gain Player Status

```gdscript
func resolve_gain_player_status(effect: Dictionary) -> void:
    var status = effect.get("status", "")
    var value = effect.get("value", 0)
    battle_state.add_player_status(status, value)
```

### Remove Player Status

```gdscript
func resolve_remove_player_status(effect: Dictionary) -> void:
    var status = effect.get("status", "")
    var value = effect.get("value", 0)
    battle_state.remove_player_status(status, value)
```

### Conditional Damage (if_enemy_has_status)

```gdscript
func resolve_if_enemy_has_status(effect: Dictionary, target: EnemyInstance) -> void:
    var status = effect.get("status", "")
    if target.has_status(status):
        var bonus = effect.get("bonus", 0)
        var base = effect.get("value", 0)
        var final_damage = DamageCalculator.calculate(base + bonus, target, battle_state)
        target.take_damage(final_damage)
```

### Per-Status Scaling (per_player_status)

```gdscript
func resolve_per_player_status(effect: Dictionary, target: EnemyInstance) -> void:
    var status = effect.get("status", "")
    var multiplier = effect.get("value", 0)
    var stacks = battle_state.get_player_status(status)
    var base_damage = effect.get("base_value", 0)
    var total_damage = base_damage + (stacks * multiplier)
    var final_damage = DamageCalculator.calculate(total_damage, target, battle_state)
    target.take_damage(final_damage)
```

## Damage Calculation

`DamageCalculator.calculate(base, enemy, battle_state)` applies modifiers in order:

```
final_damage = base
  × vulnerable_multiplier (if enemy has vulnerable: ×1.5)
  × weak_multiplier (if enemy has weak: ×0.75)
  + strength_bonus (+ strength × 2)
  − zhenya_reduction (−25% if enemy has zhenya)
```

## Status Tick (at turn start / turn end)

| Status   | Tick Timing | Effect                           |
| -------- | ----------- | -------------------------------- |
| `burn`   | Enemy turn start | Deal damage to enemy           |
| `yaoshi` | Player turn start | Lose HP if stacks >= 3      |
| `zhenya` | Always active | Reduce enemy damage dealt by 25% |
| `weak`   | Enemy attacks    | Reduce damage by 25%           |
| `vulnerable` | Always active | Increase damage taken by 50%  |

## Conditional Effect Flow

```gdscript
# Example: "if enemy has weak, deal bonus damage"
func apply_effects(card: CardInstance, target: EnemyInstance) -> void:
    for effect in card.data.effects:
        var effect_type = effect.get("type", "")
        match effect_type:
            "damage":
                resolve_damage(effect, target)
            "if_enemy_has_status_damage_bonus":
                resolve_if_enemy_has_status(effect, target)
            "per_player_status_damage":
                resolve_per_player_status(effect, target)
            _:
                pass  # Unknown effect type - log warning
```
