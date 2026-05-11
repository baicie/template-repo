class_name CardData

var id: String
var name: String
var desc: String
var cost: int
var type: String
var rarity: String
var target: String
var effects: Array
var upgrade: Dictionary

static func from_dict(raw: Dictionary) -> CardData:
	var data := CardData.new()
	data.id = raw.get("id", "")
	data.name = raw.get("name", "")
	data.desc = raw.get("desc", "")
	data.cost = int(raw.get("cost", 0))
	data.type = raw.get("type", "skill")
	data.rarity = raw.get("rarity", "common")
	data.target = raw.get("target", Constants.TARGET_SELF)
	data.effects = raw.get("effects", [])
	data.upgrade = raw.get("upgrade", {})
	return data

func get_name(upgraded: bool = false) -> String:
	return upgrade.get("name", name) if upgraded else name

func get_desc(upgraded: bool = false) -> String:
	return upgrade.get("desc", desc) if upgraded else desc

func get_cost(upgraded: bool = false) -> int:
	return int(upgrade.get("cost", cost)) if upgraded else cost

func get_effects(upgraded: bool = false) -> Array:
	return upgrade.get("effects", effects) if upgraded else effects
