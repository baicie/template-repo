class_name EnemyLibrary

var enemies: Dictionary = {}

func load_from_file(path: String = "res://resources/data/enemies.json") -> void:
	enemies.clear()
	var raw = DataLoader.load_json(path)
	if raw == null:
		return
	for item in raw.get("enemies", []):
		var enemy := EnemyData.from_dict(item)
		enemies[enemy.id] = enemy

func get_enemy(id: String) -> EnemyData:
	if not enemies.has(id):
		push_error("Enemy not found: " + id)
		return null
	return enemies[id]

func create_enemy(id: String) -> EnemyInstance:
	var data := get_enemy(id)
	return EnemyInstance.new(data) if data != null else null
