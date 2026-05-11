class_name CardInstance

var data: CardData
var upgraded := false
var uuid := ""

func _init(card_data: CardData) -> void:
	data = card_data
	uuid = "%s_%s" % [Time.get_ticks_usec(), randi()]

func upgrade() -> void:
	upgraded = true

func get_id() -> String:
	return data.id

func get_name() -> String:
	return data.get_name(upgraded)

func get_desc() -> String:
	return data.get_desc(upgraded)

func get_cost() -> int:
	return data.get_cost(upgraded)

func get_effects() -> Array:
	return data.get_effects(upgraded)

func get_target() -> String:
	return data.target

func clone() -> CardInstance:
	var copied := CardInstance.new(data)
	copied.upgraded = upgraded
	return copied
