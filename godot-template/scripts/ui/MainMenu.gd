extends Control

func _ready() -> void:
	%StartButton.pressed.connect(func(): get_tree().change_scene_to_file("res://scenes/battle/BattleScene.tscn"))
	%QuitButton.pressed.connect(func(): get_tree().quit())
