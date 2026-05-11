class_name EnemyAI

static func choose_next_move(enemy: EnemyInstance) -> void:
	if enemy.data.moves.is_empty():
		enemy.next_move = {}
		return
	var total := 0
	for move in enemy.data.moves:
		total += int(move.get("weight", 1))
	var roll := randi_range(1, max(1, total))
	var cursor := 0
	for move in enemy.data.moves:
		cursor += int(move.get("weight", 1))
		if roll <= cursor:
			enemy.next_move = move
			return
	enemy.next_move = enemy.data.moves[0]

static func commit_next_move(enemy: EnemyInstance) -> void:
	enemy.current_move = enemy.next_move
	choose_next_move(enemy)

static func execute_move(enemy: EnemyInstance, state: BattleState) -> void:
	if enemy.is_dead():
		return
	var move := enemy.current_move
	var intent := move.get("intent", "")
	match intent:
		Constants.INTENT_ATTACK:
			_enemy_attack(enemy, state, int(move.get("damage", 0)), int(move.get("hits", 1)))
		Constants.INTENT_DEFEND:
			enemy.gain_block(int(move.get("block", 0)))
		Constants.INTENT_DEBUFF:
			_apply_effects_to_player(move.get("effects", []), state)
		Constants.INTENT_ATTACK_DEBUFF:
			_enemy_attack(enemy, state, int(move.get("damage", 0)), int(move.get("hits", 1)))
			_apply_effects_to_player(move.get("effects", []), state)
		_:
			push_warning("Unknown enemy intent: " + intent)

static func _enemy_attack(enemy: EnemyInstance, state: BattleState, base_damage: int, hits: int = 1) -> void:
	for i in range(max(1, hits)):
		var damage := DamageCalculator.calc_enemy_damage(base_damage, enemy, state)
		state.take_player_damage(damage)

static func _apply_effects_to_player(effects: Array, state: BattleState) -> void:
	for effect in effects:
		match effect.get("type", ""):
			"gain_player_status":
				state.add_player_status(effect.get("status", ""), int(effect.get("value", 0)))
			"lose_hp":
				state.run_state.take_damage(int(effect.get("value", 0)))
			_:
				push_warning("Unknown enemy effect: " + effect.get("type", ""))
