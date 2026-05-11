class_name CardLibrary

var cards: Dictionary = {}

func load_from_file(path: String = "res://resources/data/cards.json") -> void:
	cards.clear()
	var raw = DataLoader.load_json(path)
	if raw == null:
		return
	for item in raw.get("cards", []):
		var card := CardData.from_dict(item)
		cards[card.id] = card

func get_card(id: String) -> CardData:
	if not cards.has(id):
		push_error("Card not found: " + id)
		return null
	return cards[id]

func get_all_cards() -> Array:
	return cards.values()

func get_reward_cards(count: int = 3) -> Array[CardData]:
	var result: Array[CardData] = []
	var all_cards := get_all_cards()
	all_cards.shuffle()
	for card in all_cards:
		if result.size() >= count:
			break
		if card.rarity != "starter":
			result.append(card)
	return result
