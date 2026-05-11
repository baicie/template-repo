---
name: godot-battle
description: Battle system for this project. Use when modifying card execution, enemy AI, turn management, damage calculation, status effects, battle state, or win/lose conditions. Covers BattleController, TurnManager, CardExecutor, EffectResolver, DamageCalculator, StatusManager, EnemyAI, and the EventBus signal flow.
license: MIT
---

# Battle System

This is a Slay-the-Spire-style turn-based card battle system built in Godot 4.x GDScript. The battle is driven by data (JSON cards) executed through a layered architecture.

## When to Use

- Modifying how cards are played
- Changing enemy AI behavior
- Adding new status effects or damage types
- Adjusting turn flow or energy system
- Changing win/lose conditions

## Loading Files

**Consider loading these reference files based on your task:**

- [ ] [references/battle-state.md](references/battle-state.md) - battle state management, card piles, draw/discard/exhaust flow, energy system
- [ ] [references/effects.md](references/effects.md) - effect resolution pipeline, damage calculation, status application, conditional effects

**DO NOT load all files at once.** Load only what's relevant to your current task.

## Architecture Overview

```
BattleController (orchestrator)
├── TurnManager (turn flow, start/end)
├── BattleState (piles, energy, HP, status)
├── CardExecutor (plays a card, spends energy)
├── EffectResolver (resolves each effect in a card)
├── DamageCalculator (damage = base * modifiers)
├── StatusManager (status tick, decay)
└── EnemyAI (intent selection, weighted moves)
```

## Key Signal Flow

```gdscript
# Events (EventBus autoload)
Events.battle_started
Events.turn_started(turn: int)
Events.card_played(card: CardInstance)
Events.enemy_died(enemy: EnemyInstance)
Events.battle_ended(victory: bool)
```

## Turn Sequence

1. **Turn Start**: Block decays → Status ticks → Draw cards
2. **Player Phase**: Play cards (costs energy), end turn
3. **Turn End**: Status decays → Enemy actions execute
4. **Check End**: Victory (all enemies dead) or Defeat (HP ≤ 0)

## Damage Calculation Order

```
base_damage → vulnerable_multiplier → weak_multiplier → strength_bonus → zhenya_reduction
```

## Cross-Skill References

- **Adding cards** → Use `godot-data` skill for card JSON format and effect types
- **GDScript patterns** → Use `gdscript` skill for class structure and signal patterns
- **Testing battle logic** → Use `godot-testing` skill for Python/Pytest validation
