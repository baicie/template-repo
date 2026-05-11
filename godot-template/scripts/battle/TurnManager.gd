class_name TurnManager

static func start_battle(state: BattleState) -> void:
	for enemy in state.enemies:
		EnemyAI.choose_next_move(enemy)
		EnemyAI.commit_next_move(enemy)
	start_player_turn(state)

static func start_player_turn(state: BattleState) -> void:
	state.energy = state.max_energy
	state.player_block = 0
	for enemy in state.get_alive_enemies():
		StatusManager.apply_enemy_start_turn(enemy)
	state.draw_cards(5)
	Events.state_changed.emit()

static func end_player_turn(state: BattleState) -> void:
	state.discard_hand()
	StatusManager.apply_player_end_turn(state)
	if state.is_defeat() or state.is_victory():
		Events.state_changed.emit()
		return
	start_enemy_turn(state)

static func start_enemy_turn(state: BattleState) -> void:
	for enemy in state.get_alive_enemies():
		EnemyAI.execute_move(enemy, state)
		StatusManager.apply_enemy_end_turn(enemy)
		if state.is_defeat():
			Events.state_changed.emit()
			return
	for enemy in state.get_alive_enemies():
		EnemyAI.commit_next_move(enemy)
	state.turn += 1
	start_player_turn(state)
