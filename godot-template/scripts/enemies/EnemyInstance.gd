class_name EnemyInstance

var data: EnemyData
var hp: int
var block: int
var statuses: Dictionary = {}
var current_move: Dictionary = {}
var next_move: Dictionary = {}

func _init(enemy_data: EnemyData) -> void:
	data = enemy_data
	hp = data.max_hp
	block = data.block

func is_dead() -> bool:
	return hp <= 0

func take_damage(amount: int) -> int:
	var remain := max(0, amount)
	if block > 0:
		var blocked = min(block, remain)
		block -= blocked
		remain -= blocked
	if remain > 0:
		hp = max(0, hp - remain)
	return remain

func gain_block(amount: int) -> void:
	block += max(0, amount)

func get_status(id: String) -> int:
	return int(statuses.get(id, 0))

func add_status(id: String, amount: int) -> void:
	if id.is_empty() or amount == 0:
		return
	statuses[id] = max(0, get_status(id) + amount)
	if statuses[id] <= 0:
		statuses.erase(id)

func remove_status(id: String, amount: int) -> void:
	add_status(id, -amount)
