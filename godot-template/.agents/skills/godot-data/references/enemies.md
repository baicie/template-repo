# Enemy Data Reference

## Enemy JSON Structure

```json
{
  "id": "e_piao",
  "name": "饿殍",
  "hp": 28,
  "region": 1,
  "moves": [
    {
      "intent": "attack",
      "weight": 4,
      "damage": 6
    },
    {
      "intent": "defend",
      "weight": 2,
      "block": 5
    }
  ]
}
```

## Fields

| Field    | Type    | Required | Description                                 |
| -------- | ------- | -------- | ------------------------------------------- |
| `id`     | string  | Yes      | Unique identifier (snake_case)              |
| `name`   | string  | Yes      | Display name (Chinese)                      |
| `hp`     | integer | Yes      | Max HP                                      |
| `region` | integer | Yes      | Difficulty region (1, 2, or 3)              |
| `moves`  | array   | Yes      | List of possible moves with weights         |

## Intent Types

| Intent             | Description                                        |
| ------------------ | -------------------------------------------------- |
| `attack`           | Deal damage to player (include `damage` field)     |
| `defend`          | Gain block (include `block` field)                 |
| `debuff`           | Apply status to player (include `status` + `value`) |
| `attack_debuff`   | Deal damage AND apply status in one move          |
| `special`          | Custom enemy-specific behavior (include `effect`) |

### Intent Examples

```json
// Pure attack
{
  "intent": "attack",
  "weight": 4,
  "damage": 8
}

// Defend
{
  "intent": "defend",
  "weight": 2,
  "block": 8
}

// Debuff
{
  "intent": "debuff",
  "weight": 1,
  "status": "weak",
  "value": 1
}

// Combined attack + debuff
{
  "intent": "attack_debuff",
  "weight": 2,
  "damage": 5,
  "status": "vulnerable",
  "value": 1
}
```

## Regions (Difficulty Progression)

| Region | Enemies                                      | Notes                         |
| ------ | -------------------------------------------- | ----------------------------- |
| 1      | 饿殍, 狐妖, 山贼, 邪道童子, 纸人兵            | Tutorial enemies, ~28-35 HP   |
| 2      | 贪官, 厂卫叛徒, 黑莲教徒, 铁甲尸, 白骨弓手     | Mid-game, ~40-50 HP          |
| 3      | 河伯残魂, 龙脉蛀虫, 百目妖, 无头将军, 天灾化身  | Late-game/Boss, ~60+ HP      |

## AI Move Selection

The `EnemyAI` script selects moves using weighted random selection:

```gdscript
# Higher weight = more likely to be chosen
var total_weight := 0
for move in enemy.moves:
    total_weight += move.weight

var roll := randi() % total_weight
var cumulative := 0
for move in enemy.moves:
    cumulative += move.weight
    if roll < cumulative:
        return move
```

**Design tip**: Keep attack weights higher than defend weights to maintain pressure on the player.

## Enemy Status Effects

| Status  | Applied By        | Effect                                           |
| ------- | ----------------- | ------------------------------------------------ |
| `zhenya` | Player cards      | Enemy deals 25% less damage                     |
| `burn`  | Player cards       | Enemy takes damage at turn start, decays        |
| `block` | Enemy self         | Absorbs damage (not implemented in current cycle) |

## Adding a New Enemy

1. Add JSON entry to `resources/data/enemies.json`
2. Validate: `python -m pytest tools/validate_json.py -v`
3. Run `godot --headless --import`
4. Test in-game (verify HP, damage values, and AI behavior)
