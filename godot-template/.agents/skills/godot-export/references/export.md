# Export Configuration Reference

## export_presets.cfg

Located at `godot-template/export_presets.cfg`. This file defines all export profiles for the project.

## Structure

```ini
[preset.0]

name="Linux/X11"
platform="Linux/X11"
runnable=true
custom_features=""
export_filter="all_resources"
include_filter=""
exclude_filter=""
export_path="builds/linux/zhenyaosi.x86_64"
encryption_include_filters=""
encryption_exclude_filters=""
encrypt_pck=false
encrypt_directory=false

[preset.0.options]

vram_texture_compression/for_desktop=true
vram_texture_compression/for_mobile=false
```

## Key Preset Options

| Preset         | Export Path                        | Runnable | Platform       |
| -------------- | ---------------------------------- | -------- | -------------- |
| `Linux/X11`    | `builds/linux/zhenyaosi.x86_64`   | Yes      | Linux desktop  |
| `Web`          | `builds/web/index.html`           | Yes      | HTML5/WebGL    |

## Build Directory Structure

```
godot-template/
├── builds/
│   ├── linux/
│   │   └── zhenyaosi.x86_64        # Linux executable
│   └── web/
│       ├── index.html              # Web entry point
│       ├── index.js                # JavaScript loader
│       └── index.pck              # Packaged resources
```

## Godot CLI Export Commands

### Export Linux Binary

```bash
godot --headless --export-release "Linux/X11" builds/linux/zhenyaosi.x86_64
```

### Export Web (HTML5)

```bash
godot --headless --export-release "Web" builds/web/index.html
```

### Headless Import (resource validation)

```bash
godot --headless --import
```

### Export with Verbose Output

```bash
godot --headless --export-release "Linux/X11" builds/linux/zhenyaosi.x86_64 --verbose
```

## Adding a New Export Profile

1. Open Godot editor → Project → Export
2. Select a template (e.g., "Windows", "macOS", "Android")
3. Configure export path in `export_presets.cfg`
4. Add to GitHub Actions `release.yml` if needed

## Web Export Notes

- Web export uses WebGL (HTML5 export template)
- The web build outputs: `index.html`, `index.js`, `index.pck`, and supporting files
- Serve over HTTPS for audio support (browser security)
- The game needs ~50-100MB RAM in browser

## Linux Binary Notes

- The `.x86_64` binary is a standalone executable
- Requires no runtime installation
- Data files are embedded in the PCK file alongside the binary
