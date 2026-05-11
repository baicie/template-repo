class_name EffectResolver

static func resolve(effect: Dictionary, state: BattleState, source_card: CardInstance, target) -> void:
	var type := effect.get("type", "")
	var value := int(effect.get("value", 0))
	match type:
		"damage":
			_apply_damage(value, state, target)
		"block":
			state.gain_block(value)
		"draw":
			state.draw_cards(value)
		"gain_energy":
			state.gain_energy(value)
		"heal":
			state.run_state.heal(value)
		"lose_hp":
			state.run_state.take_damage(value)
		"gain_player_status":
			state.add_player_status(effect.get("status", ""), value)
		"remove_player_status":
			state.remove_player_status(effect.get("status", ""), value)
		"apply_enemy_status":
			if target != null:
				target.add_status(effect.get("status", ""), value)
		"apply_all_enemy_status":
			for enemy in state.get_alive_enemies():
				enemy.add_status(effect.get("status", ""), value)
		"damage_all":
			for enemy in state.get_alive_enemies():
				_apply_damage(value, state, enemy)
		"damage_random":
			var alive := state.get_alive_enemies()
			if not alive.is_empty():
				_apply_damage(value, state, alive.pick_random())
		"if_enemy_has_status_damage_bonus":
			var base := value
			if target != null and target.get_status(effect.get("required_status", "")) > 0:
				base += int(effect.get("bonus", 0))
			_apply_damage(base, state, target)
		"if_player_status_draw":
			if state.get_player_status(effect.get("status", "")) >= int(effect.get("min", 1)):
				state.draw_cards(int(effect.get("draw", 1)))
		"per_player_status_damage":
			var status_amount := state.get_player_status(effect.get("status", ""))
			_apply_damage(value + status_amount * int(effect.get("per", 0)), state, target)
		_:
			push_warning("Unknown effect type: " + type)

static func _apply_damage(base: int, state: BattleState, target) -> void:
	if target == null:
		return
	var damage := DamageCalculator.calc_player_damage(base, state, target)
	target.take_damage(damage)
