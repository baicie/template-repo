class_name DataLoader

static func load_json(path: String) -> Variant:
	if not FileAccess.file_exists(path):
		push_error("JSON file not found: " + path)
		return null
	var file := FileAccess.open(path, FileAccess.READ)
	var text := file.get_as_text()
	file.close()
	var json := JSON.new()
	var err := json.parse(text)
	if err != OK:
		push_error("JSON parse error: %s line %s: %s" % [path, json.get_error_line(), json.get_error_message()])
		return null
	return json.data
