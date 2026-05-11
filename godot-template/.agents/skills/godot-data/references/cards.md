# Card Data Reference

## Card JSON Structure

```json
{
  "id": "zhan_yao_dao",
  "name": "斩妖刀",
  "desc": "造成 6 点伤害。",
  "cost": 1,
  "type": "attack",
  "rarity": "starter",
  "target": "enemy",
  "effects": [
    {
      "type": "damage",
      "value": 6
    }
  ],
  "upgrade": {
    "name": "斩妖刀+",
    "desc": "造成 9 点伤害。",
    "cost": 1,
    "effects": [
      {
        "type": "damage",
        "value": 9
      }
    ]
  }
}
```

## Fields

| Field     | Type     | Required | Description                          |
| --------- | -------- | -------- | ------------------------------------ |
| `id`      | string   | Yes      | Unique identifier (snake_case)       |
| `name`    | string   | Yes      | Display name (Chinese)               |
| `desc`    | string   | Yes      | Card description                     |
| `cost`    | integer  | Yes      | Energy cost (>= 0)                  |
| `type`    | string   | Yes      | `attack`, `skill`, `power`          |
| `rarity`  | string   | Yes      | `starter`, `common`, `uncommon`, `rare` |
| `target`  | string   | Yes      | `enemy`, `self`, `all_enemies`, `random_enemy` |
| `effects` | array    | Yes      | List of effect objects              |
| `upgrade` | object   | No       | Upgraded version when card is forged |

## Effect Types

| Effect Type                      | Fields                                               | Description                            |
| -------------------------------- | ---------------------------------------------------- | -------------------------------------- |
| `damage`                         | `value`                                              | Deal damage to target                  |
| `block`                         | `value`                                              | Grant block to player                  |
| `draw`                          | `value`                                              | Draw cards from deck                   |
| `gain_energy`                   | `value`                                              | Gain energy this turn                  |
| `heal`                         | `value`                                              | Heal player HP                         |
| `apply_enemy_status`            | `status`, `value`                                     | Apply status to target enemy           |
| `apply_all_enemy_status`        | `status`, `value`                                    | Apply status to all enemies            |
| `gain_player_status`            | `status`, `value`                                    | Apply status to player                 |
| `remove_player_status`          | `status`, `value`                                    | Remove status from player              |
| `if_enemy_has_status_damage_bonus` | `status`, `value`, `bonus`                          | Extra damage if enemy has status       |
| `if_player_status_draw`         | `status`, `value`                                    | Draw cards if player has status         |
| `per_player_status_damage`      | `status`, `value`                                    | Damage scales with player status       |

## Card Types

| Type   | Description                                    |
| ------ | ---------------------------------------------- |
| `attack` | Deals damage, triggers enemy counterattack    |
| `skill`  | Non-attack effects (block, status, etc.)      |
| `power`  | Persistent buffs (future: not yet implemented) |

## Card Rarities

| Rarity   | Description                                          |
| -------- | ---------------------------------------------------- |
| `starter`  | Starting deck, always available                     |
| `common`   | General pool, ~40% of cards                        |
| `uncommon` | Stronger effects, ~35% of cards                   |
| `rare`     | Powerful effects, ~25% of cards                    |

## Card Targets

| Target            | Description                                    |
| ----------------- | ---------------------------------------------- |
| `enemy`           | Single enemy (player selects)                  |
| `self`            | Player only                                    |
| `all_enemies`     | Every enemy                                    |
| `random_enemy`    | One random enemy                               |

## Status Strings

Player statuses: `guoyun`, `yaoshi`, `weak`, `vulnerable`, `strength`
Enemy statuses: `zhenya`, `burn`, `block`

## Adding a New Card

1. Add JSON entry to `resources/data/cards.json`
2. Validate: `python -m pytest tools/validate_json.py -v`
3. Run `godot --headless --import`
4. Test in-game
