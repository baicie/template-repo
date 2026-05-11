# Python Test Patterns

## validate_json.py Structure

```python
import pytest
import json
import jsonschema

def load_json(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_schema(path: str) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

class TestCards:
    @pytest.fixture
    def cards(self):
        return load_json("resources/data/cards.json")

    @pytest.fixture
    def schema(self):
        return load_schema("schemas/cards.schema.json")

    def test_cards_is_list(self, cards):
        assert isinstance(cards.get("cards"), list)

    def test_card_has_required_fields(self, cards):
        for card in cards["cards"]:
            assert "id" in card
            assert "name" in card
            assert "desc" in card
            assert "cost" in card
            assert "type" in card
            assert "rarity" in card
            assert "target" in card
            assert "effects" in card

    def test_card_validates_against_schema(self, cards, schema):
        for card in cards["cards"]:
            jsonschema.validate(card, schema)

class TestEnemies:
    @pytest.fixture
    def enemies(self):
        return load_json("resources/data/enemies.json")

    @pytest.fixture
    def schema(self):
        return load_schema("schemas/enemies.schema.json")

    def test_enemies_is_list(self, enemies):
        assert isinstance(enemies.get("enemies"), list)

    def test_enemy_has_required_fields(self, enemies):
        for enemy in enemies["enemies"]:
            assert "id" in enemy
            assert "name" in enemy
            assert "hp" in enemy
            assert "region" in enemy
            assert "moves" in enemy

    def test_enemy_hp_positive(self, enemies):
        for enemy in enemies["enemies"]:
            assert enemy["hp"] > 0

    def test_enemy_moves_have_weight(self, enemies):
        for enemy in enemies["enemies"]:
            for move in enemy["moves"]:
                assert "intent" in move
                assert "weight" in move
                assert move["weight"] > 0
```

## Running Tests

```bash
# Run all tests
python -m pytest validate_json.py -v

# Run specific test class
python -m pytest validate_json.py::TestCards -v

# Run specific test
python -m pytest validate_json.py -v -k "test_card_has_required_fields"

# Run with verbose output
python -m pytest validate_json.py -vv

# Run with coverage (if installed)
python -m pytest validate_json.py --cov=.
```

## Fixture Patterns

```python
@pytest.fixture
def card_data():
    """Load a specific card for targeted testing."""
    cards = load_json("resources/data/cards.json")
    for card in cards["cards"]:
        if card["id"] == "zhan_yao_dao":
            return card
    pytest.fail("Card not found")
```

## Parametrized Tests

```python
@pytest.mark.parametrize("card_id,expected_type,expected_rarity", [
    ("zhan_yao_dao", "attack", "starter"),
    ("jin_yi_hu_shen", "skill", "starter"),
    ("tian_jing_chi", "attack", "uncommon"),
])
def test_card_type_and_rarity(cards, card_id, expected_type, expected_rarity):
    card = next((c for c in cards["cards"] if c["id"] == card_id), None)
    assert card is not None
    assert card["type"] == expected_type
    assert card["rarity"] == expected_rarity
```
