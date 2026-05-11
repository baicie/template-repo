extends Node

signal battle_started
signal battle_ended(victory: bool)
signal hand_changed
signal state_changed
signal log_message(message: String)
signal card_played(card)
signal enemy_died(enemy)

func emit_log(message: String) -> void:
	log_message.emit(message)
