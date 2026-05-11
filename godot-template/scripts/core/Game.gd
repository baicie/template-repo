extends Node

var card_library := CardLibrary.new()
var enemy_library := EnemyLibrary.new()
var run_state := RunState.new()

func _ready() -> void:
	card_library.load_from_file()
	enemy_library.load_from_file()
	run_state.setup_starting_deck(card_library)
	Events.emit_log("Game initialized")

func new_run() -> void:
	run_state = RunState.new()
	run_state.setup_starting_deck(card_library)
