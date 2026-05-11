class_name RunState

var max_hp: int = 70
var hp: int = 70
var gold: int = 99
var floor: int = 1
var seed_value: int = 0
var deck: Array[CardInstance] = []
var relic_ids: Array[String] = []

func setup_starting_deck(card_library: CardLibrary) -> void:
	deck.clear()
	for i in range(5):
		deck.append(CardInstance.new(card_library.get_card("zhan_yao_dao")))
	for i in range(4):
		deck.append(CardInstance.new(card_library.get_card("jin_yi_hu_shen")))
	deck.append(CardInstance.new(card_library.get_card("zhen_yao_fu")))

func take_damage(amount: int) -> int:
	var final_amount = max(0, amount)
	hp = max(0, hp - final_amount)
	return final_amount

func heal(amount: int) -> int:
	var before := hp
	hp = min(max_hp, hp + max(0, amount))
	return hp - before

func to_dict() -> Dictionary:
	return {
		"max_hp": max_hp,
		"hp": hp,
		"gold": gold,
		"floor": floor,
		"seed_value": seed_value,
		"deck": deck.map(func(c): return {"id": c.get_id(), "upgraded": c.upgraded}),
		"relic_ids": relic_ids,
	}
