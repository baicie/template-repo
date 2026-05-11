extends Control
class_name BattleController

@onready var log_label: RichTextLabel = %LogLabel
@onready var player_label: Label = %PlayerLabel
@onready var enemy_box: VBoxContainer = %EnemyBox
@onready var hand_box: HBoxContainer = %HandBox
@onready var end_turn_button: Button = %EndTurnButton

var battle_state := BattleState.new()
var selected_enemy: EnemyInstance = null
var enemy_buttons: Dictionary = {}

func _ready() -> void:
	end_turn_button.pressed.connect(end_turn)
	Events.state_changed.connect(refresh)
	Events.hand_changed.connect(refresh_hand)
	start_test_battle()

func start_test_battle() -> void:
	var enemies: Array[EnemyInstance] = [Game.enemy_library.create_enemy("e_epiao")]
	battle_state.setup(Game.run_state, enemies)
	TurnManager.start_battle(battle_state)
	selected_enemy = battle_state.get_alive_enemies()[0]
	Events.battle_started.emit()
	refresh()

func play_card(card: CardInstance) -> void:
	var target = selected_enemy if card.get_target() == Constants.TARGET_ENEMY else null
	if not CardExecutor.play(card, battle_state, target):
		_log("不能打出：%s" % card.get_name())
		return
	_check_end()
	refresh()

func end_turn() -> void:
	TurnManager.end_player_turn(battle_state)
	_check_end()
	refresh()

func _check_end() -> void:
	if battle_state.is_victory():
		_log("胜利")
		Events.battle_ended.emit(true)
	elif battle_state.is_defeat():
		_log("失败")
		Events.battle_ended.emit(false)

func refresh() -> void:
	player_label.text = "HP %s/%s | 格挡 %s | 能量 %s | 回合 %s | 国运 %s | 妖蚀 %s" % [
		battle_state.run_state.hp,
		battle_state.run_state.max_hp,
		battle_state.player_block,
		battle_state.energy,
		battle_state.turn,
		battle_state.get_player_status(Constants.STATUS_GUOYUN),
		battle_state.get_player_status(Constants.STATUS_YAOSHI),
	]
	refresh_enemies()
	refresh_hand()

func refresh_enemies() -> void:
	for child in enemy_box.get_children():
		child.queue_free()
	enemy_buttons.clear()
	for enemy in battle_state.enemies:
		var btn := Button.new()
		btn.text = "%s HP %s/%s 格挡 %s 意图:%s" % [enemy.data.name, enemy.hp, enemy.data.max_hp, enemy.block, enemy.current_move.get("name", "")]
		btn.disabled = enemy.is_dead()
		btn.pressed.connect(func(): selected_enemy = enemy; refresh_enemies())
		if enemy == selected_enemy:
			btn.text = "▶ " + btn.text
		enemy_box.add_child(btn)
		enemy_buttons[enemy] = btn

func refresh_hand() -> void:
	for child in hand_box.get_children():
		child.queue_free()
	for card in battle_state.hand:
		var btn := Button.new()
		btn.custom_minimum_size = Vector2(150, 100)
		btn.text = "%s\n费:%s\n%s" % [card.get_name(), card.get_cost(), card.get_desc()]
		btn.pressed.connect(func(c = card): play_card(c))
		hand_box.add_child(btn)

func _log(message: String) -> void:
	log_label.append_text(message + "\n")
	Events.emit_log(message)
