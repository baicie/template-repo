class_name EnemyData

var id: String
var name: String
var max_hp: int
var block: int
var region: int
var moves: Array

static func from_dict(raw: Dictionary) -> EnemyData:
	var data := EnemyData.new()
	data.id = raw.get("id", "")
	data.name = raw.get("name", "")
	data.max_hp = int(raw.get("max_hp", 1))
	data.block = int(raw.get("block", 0))
	data.region = int(raw.get("region", 1))
	data.moves = raw.get("moves", [])
	return data
