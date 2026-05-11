class_name RandomService

var rng := RandomNumberGenerator.new()

func _init(seed_value: int = 0) -> void:
	if seed_value == 0:
		rng.randomize()
	else:
		rng.seed = seed_value

func set_seed_value(seed_value: int) -> void:
	rng.seed = seed_value

func rand_int(min_value: int, max_value: int) -> int:
	return rng.randi_range(min_value, max_value)

func pick_one(arr: Array):
	if arr.is_empty():
		return null
	return arr[rand_int(0, arr.size() - 1)]

func weighted_pick(items: Array) -> Dictionary:
	if items.is_empty():
		return {}
	var total := 0
	for item in items:
		total += int(item.get("weight", 1))
	var roll := rand_int(1, max(1, total))
	var cursor := 0
	for item in items:
		cursor += int(item.get("weight", 1))
		if roll <= cursor:
			return item
	return items[0]
