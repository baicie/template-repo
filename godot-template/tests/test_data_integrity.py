from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]

def test_cards_unique_ids():
    cards = json.loads((ROOT / "resources/data/cards.json").read_text(encoding="utf-8"))["cards"]
    ids = [c["id"] for c in cards]
    assert len(ids) == len(set(ids))

def test_enemies_have_moves():
    enemies = json.loads((ROOT / "resources/data/enemies.json").read_text(encoding="utf-8"))["enemies"]
    assert all(e.get("moves") for e in enemies)
