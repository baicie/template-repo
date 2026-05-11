#!/usr/bin/env python3
from pathlib import Path
import json, sys

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "resources" / "data"
required = ["cards.json", "enemies.json"]
errors = []

for name in required:
    path = DATA / name
    if not path.exists():
        errors.append(f"missing {path}")
        continue
    try:
        json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        errors.append(f"invalid json {path}: {exc}")

cards = json.loads((DATA / "cards.json").read_text(encoding="utf-8"))["cards"]
ids = [c["id"] for c in cards]
if len(ids) != len(set(ids)):
    errors.append("duplicate card id")

if errors:
    print("\n".join(errors))
    sys.exit(1)
print("JSON validation passed")
