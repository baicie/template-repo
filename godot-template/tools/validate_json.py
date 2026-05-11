#!/usr/bin/env python3
"""卡牌与敌人 JSON 数据验证脚本，支持 pytest 运行。"""
from __future__ import annotations

from pathlib import Path
from typing import Any

import json
import jsonschema
import pytest

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "resources" / "data"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def cards_data() -> dict[str, Any]:
    path = DATA / "cards.json"
    assert path.exists(), f"Missing: {path}"
    return json.loads(path.read_text(encoding="utf-8"))


@pytest.fixture
def enemies_data() -> dict[str, Any]:
    path = DATA / "enemies.json"
    assert path.exists(), f"Missing: {path}"
    return json.loads(path.read_text(encoding="utf-8"))


@pytest.fixture
def cards_schema() -> dict[str, Any]:
    path = ROOT / "schemas" / "cards.schema.json"
    assert path.exists(), f"Missing: {path}"
    return json.loads(path.read_text(encoding="utf-8"))


@pytest.fixture
def enemies_schema() -> dict[str, Any]:
    path = ROOT / "schemas" / "enemies.schema.json"
    assert path.exists(), f"Missing: {path}"
    return json.loads(path.read_text(encoding="utf-8"))


# ---------------------------------------------------------------------------
# JSON 语法基础校验
# ---------------------------------------------------------------------------


def test_cards_json_valid(cards_data: dict[str, Any]) -> None:
    """cards.json 必须是有效的 JSON。"""
    assert isinstance(cards_data, dict), "cards.json must be a JSON object"
    assert "cards" in cards_data, "cards.json must have 'cards' key"


def test_enemies_json_valid(enemies_data: dict[str, Any]) -> None:
    """enemies.json 必须是有效的 JSON。"""
    assert isinstance(enemies_data, dict), "enemies.json must be a JSON object"
    assert "enemies" in enemies_data, "enemies.json must have 'enemies' key"


# ---------------------------------------------------------------------------
# Schema 校验
# ---------------------------------------------------------------------------


def test_cards_schema_validation(cards_data: dict[str, Any], cards_schema: dict[str, Any]) -> None:
    """所有卡牌必须符合 cards.schema.json。"""
    errors = []
    for card in cards_data.get("cards", []):
        try:
            jsonschema.validate(card, cards_schema)
        except jsonschema.ValidationError as exc:
            errors.append(f"Card '{card.get('id', '?')}' error: {exc.message}")
    assert not errors, "\n".join(errors)


def test_enemies_schema_validation(enemies_data: dict[str, Any], enemies_schema: dict[str, Any]) -> None:
    """所有敌人必须符合 enemies.schema.json。"""
    errors = []
    for enemy in enemies_data.get("enemies", []):
        try:
            jsonschema.validate(enemy, enemies_schema)
        except jsonschema.ValidationError as exc:
            errors.append(f"Enemy '{enemy.get('id', '?')}' error: {exc.message}")
    assert not errors, "\n".join(errors)


# ---------------------------------------------------------------------------
# 业务逻辑校验
# ---------------------------------------------------------------------------


def test_card_ids_unique(cards_data: dict[str, Any]) -> None:
    """卡牌 ID 不得重复。"""
    cards = cards_data.get("cards", [])
    ids = [c["id"] for c in cards if "id" in c]
    duplicates = [i for i in set(ids) if ids.count(i) > 1]
    assert not duplicates, f"Duplicate card IDs: {duplicates}"


def test_enemy_ids_unique(enemies_data: dict[str, Any]) -> None:
    """敌人 ID 不得重复。"""
    enemies = enemies_data.get("enemies", [])
    ids = [e["id"] for e in enemies if "id" in e]
    duplicates = [i for i in set(ids) if ids.count(i) > 1]
    assert not duplicates, f"Duplicate enemy IDs: {duplicates}"


def test_card_cost_non_negative(cards_data: dict[str, Any]) -> None:
    """卡牌能量消耗必须 >= 0。"""
    for card in cards_data.get("cards", []):
        assert card.get("cost", -1) >= 0, f"Card '{card.get('id')}' cost must be >= 0"


def test_enemy_hp_positive(enemies_data: dict[str, Any]) -> None:
    """敌人 HP 必须 > 0。"""
    for enemy in enemies_data.get("enemies", []):
        assert enemy.get("max_hp", 0) > 0, f"Enemy '{enemy.get('id')}' max_hp must be > 0"


def test_enemy_region_valid(enemies_data: dict[str, Any]) -> None:
    """敌人 region 必须在 1-3 范围内。"""
    for enemy in enemies_data.get("enemies", []):
        region = enemy.get("region", 0)
        assert 1 <= region <= 3, f"Enemy '{enemy.get('id')}' region must be 1-3, got {region}"


def test_card_targets_valid(cards_data: dict[str, Any]) -> None:
    """卡牌 target 必须是有效值。"""
    valid_targets = {"enemy", "self", "all_enemies", "random_enemy"}
    for card in cards_data.get("cards", []):
        target = card.get("target", "")
        assert target in valid_targets, f"Card '{card.get('id')}' has invalid target: '{target}'"


def test_card_types_valid(cards_data: dict[str, Any]) -> None:
    """卡牌 type 必须是有效值。"""
    valid_types = {"attack", "skill", "power"}
    for card in cards_data.get("cards", []):
        card_type = card.get("type", "")
        assert card_type in valid_types, f"Card '{card.get('id')}' has invalid type: '{card_type}'"


def test_card_rarity_valid(cards_data: dict[str, Any]) -> None:
    """卡牌 rarity 必须是有效值。"""
    valid_rarities = {"starter", "common", "uncommon", "rare"}
    for card in cards_data.get("cards", []):
        rarity = card.get("rarity", "")
        assert rarity in valid_rarities, f"Card '{card.get('id')}' has invalid rarity: '{rarity}'"


def test_enemy_moves_not_empty(enemies_data: dict[str, Any]) -> None:
    """敌人必须有至少一个 move。"""
    for enemy in enemies_data.get("enemies", []):
        moves = enemy.get("moves", [])
        assert len(moves) > 0, f"Enemy '{enemy.get('id')}' must have at least one move"


def test_enemy_move_intents_valid(enemies_data: dict[str, Any]) -> None:
    """敌人 move 的 intent 必须是有效值。"""
    valid_intents = {"attack", "defend", "debuff", "attack_debuff", "special"}
    for enemy in enemies_data.get("enemies", []):
        for move in enemy.get("moves", []):
            intent = move.get("intent", "")
            assert intent in valid_intents, (
                f"Enemy '{enemy.get('id')}' move has invalid intent: '{intent}'"
            )


def test_enemy_move_weights_positive(enemies_data: dict[str, Any]) -> None:
    """敌人 move 的 weight 必须 > 0。"""
    for enemy in enemies_data.get("enemies", []):
        for move in enemy.get("moves", []):
            weight = move.get("weight", 0)
            assert weight > 0, f"Enemy '{enemy.get('id')}' move weight must be > 0, got {weight}"


def test_card_effects_not_empty(cards_data: dict[str, Any]) -> None:
    """卡牌必须有至少一个 effect。"""
    for card in cards_data.get("cards", []):
        effects = card.get("effects", [])
        assert len(effects) > 0, f"Card '{card.get('id')}' must have at least one effect"


def test_starter_cards_exist(cards_data: dict[str, Any]) -> None:
    """至少要有 starter 稀有度的卡牌（初始牌组需要）。"""
    cards = cards_data.get("cards", [])
    starter_cards = [c for c in cards if c.get("rarity") == "starter"]
    assert len(starter_cards) >= 3, "Need at least 3 starter cards for the initial deck"
