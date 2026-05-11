class_name StatusManager

static func apply_player_end_turn(state: BattleState) -> void:
	var yaoshi := state.get_player_status(Constants.STATUS_YAOSHI)
	if yaoshi >= 3:
		var loss := int(floor(yaoshi / 3.0))
		state.run_state.take_damage(loss)
		tick_down_player_status(state, Constants.STATUS_WEAK)
		tick_down_player_status(state, Constants.STATUS_VULNERABLE)

static func apply_enemy_start_turn(enemy: EnemyInstance) -> void:
	var burn := enemy.get_status(Constants.STATUS_BURN)
	if burn > 0:
		enemy.take_damage(burn)
		enemy.remove_status(Constants.STATUS_BURN, 1)

static func apply_enemy_end_turn(enemy: EnemyInstance) -> void:
	tick_down_enemy_status(enemy, Constants.STATUS_WEAK)
	tick_down_enemy_status(enemy, Constants.STATUS_VULNERABLE)
	tick_down_enemy_status(enemy, Constants.STATUS_ZHENYA)

static func tick_down_player_status(state: BattleState, id: String) -> void:
	if state.get_player_status(id) > 0:
		state.remove_player_status(id, 1)

static func tick_down_enemy_status(enemy: EnemyInstance, id: String) -> void:
	if enemy.get_status(id) > 0:
		enemy.remove_status(id, 1)
