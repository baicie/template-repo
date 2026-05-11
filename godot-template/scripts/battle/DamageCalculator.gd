class_name DamageCalculator

static func calc_player_damage(base: int, state: BattleState, target: EnemyInstance) -> int:
	var result := base + state.get_player_status(Constants.STATUS_STRENGTH) * 2
	if state.get_player_status(Constants.STATUS_WEAK) > 0:
		result = int(floor(result * 0.75))
	if target != null and target.get_status(Constants.STATUS_VULNERABLE) > 0:
		result = int(floor(result * 1.5))
	return max(0, result)

static func calc_enemy_damage(base: int, enemy: EnemyInstance, state: BattleState) -> int:
	var result := base + enemy.get_status(Constants.STATUS_STRENGTH) * 2
	if enemy.get_status(Constants.STATUS_WEAK) > 0:
		result = int(floor(result * 0.75))
	if enemy.get_status(Constants.STATUS_ZHENYA) > 0:
		result = int(floor(result * 0.75))
	if state.get_player_status(Constants.STATUS_VULNERABLE) > 0:
		result = int(floor(result * 1.5))
	return max(0, result)
