class_name CardExecutor

static func can_play(card: CardInstance, state: BattleState, target = null) -> bool:
	if card == null or state.energy < card.get_cost():
		return false
	if card.get_target() == Constants.TARGET_ENEMY and target == null:
		return false
	return true

static func play(card: CardInstance, state: BattleState, target = null) -> bool:
	if not can_play(card, state, target):
		return false
	state.spend_energy(card.get_cost())
	for effect in card.get_effects():
		EffectResolver.resolve(effect, state, card, target)
	state.discard_card(card)
	Events.card_played.emit(card)
	Events.state_changed.emit()
	return true
