# Godot 4.x API Patterns

## Lifecycle Methods

```gdscript
func _ready() -> void:
    # Called when node enters scene tree
    pass

func _process(delta: float) -> void:
    # Called every frame
    pass

func _physics_process(delta: float) -> void:
    # Called every physics frame (fixed timestep)
    pass
```

## Node Traversal

```gdscript
# Get child by name/type
var controller = get_node("BattleController") as BattleController
var card = get_node_or_null("CardPanel")

# Get parent
var parent_node = get_parent()

# Find in tree
var node = get_tree().get_first_node_in_group("enemies")
```

## Timer

```gdscript
func _ready() -> void:
    $TurnTimer.timeout.connect(_on_turn_timer_timeout)

func start_timer(duration: float) -> void:
    $TurnTimer.start(duration)

func _on_turn_timer_timeout() -> void:
    pass
```

## Input

```gdscript
func _input(event: InputEvent) -> void:
    if event.is_action_pressed("ui_accept"):
        pass
    if event is InputEventKey and event.pressed:
        pass
```

## Scene Loading

```gdscript
# Synchronous
var scene = load("res://scenes/BattleScene.tscn")
var instance = scene.instantiate()
add_child(instance)

# Async
var scene = await load("res://scenes/BattleScene.tscn").completed
```

## JSON Loading

```gdscript
func load_json(path: String) -> Dictionary:
    var file = FileAccess.open(path, FileAccess.READ)
    var json = JSON.new()
    json.parse(file.get_as_text())
    return json.get_data()
```

## String Formatting

```gdscript
var name := "Alice"
var hp := 42
var text := "HP: %d/%d" % [hp, max_hp]  # "HP: 42/100"
var status := "Damage: %+d" % bonus      # "Damage: +5"
```

## Math

```gdscript
var x = clamp(value, 0, 100)
var y = lerp(min_val, max_val, t)
var z = round(value)
var w = floor(value)
```

## Dictionary Operations

```gdscript
var data: Dictionary = {"hp": 100, "max_hp": 100}

# Get with default
var hp = data.get("hp", 100)

# Has key
if data.has("hp"):
    pass

# Keys/values
for key in data.keys():
    pass
```

## Queue vs Array

```gdscript
# draw_pile = queue (LIFO)
draw_pile.pop_back()   # draw
discard_pile.append()  # discard goes to bottom

# Shuffle (Fisher-Yates)
draw_pile.shuffle()

# Duplicate for re-shuffling
draw_pile = discard_pile.duplicate()
```
