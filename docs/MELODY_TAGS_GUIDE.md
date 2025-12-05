# Melody Tags - Markdown-Centric Piano System

## Pure Markdown Approach

Just use custom HTML tags in your markdown. No JavaScript, no onclick handlers, no complexity!

## Quick Start

### 1. Add scripts (once at the end):

```html
<link rel="stylesheet" href="/global-piano.css">

<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6/dist/abcjs-basic-min.js"></script>
<script src="/abc-sheet-music.js"></script>
<script src="/melody-tags.js"></script>
```

### 2. Add melodies anywhere:

```html
<melody path="/assets/motifs/my-song.json" label="🎵 My Song" sheet></melody>
```

### 3. Add global piano (once):

```html
<global-piano height="200" start="C3" end="C7"></global-piano>
```

That's it!

## The `<melody>` Tag

### Basic Usage

```html
<melody path="/assets/motifs/song.json"></melody>
```

Creates a play button for the melody.

### With Label

```html
<melody path="/assets/motifs/song.json" label="🎵 My Song"></melody>
```

Custom button text (supports emojis!).

### With Sheet Music Preview

```html
<melody path="/assets/motifs/song.json" label="Play Song" sheet></melody>
```

Shows static sheet music above the button.

### All Options

```html
<melody
  path="/assets/motifs/song.json"    <!-- Required: path to JSON -->
  label="🎵 Play Song"                <!-- Optional: button text -->
  sheet                               <!-- Optional: show sheet music preview -->
></melody>
```

## The `<global-piano>` Tag

### Basic Usage

```html
<global-piano></global-piano>
```

Default: height=180px, range C3-C7

### Custom Height

```html
<global-piano height="250"></global-piano>
```

### Custom Range

```html
<global-piano start="G3" end="F6"></global-piano>
```

### All Options

```html
<global-piano
  height="200"      <!-- Optional: piano height in pixels (default: 180) -->
  start="C3"        <!-- Optional: starting note (default: C3) -->
  end="C7"          <!-- Optional: ending note (default: C7) -->
></global-piano>
```

## Complete Example

```markdown
# My Music Collection

<link rel="stylesheet" href="/global-piano.css">

## Classical

<melody path="/assets/motifs/beethoven.json" label="🎼 Beethoven" sheet></melody>
<melody path="/assets/motifs/mozart.json" label="🎼 Mozart"></melody>

## Movie Themes

<melody path="/assets/motifs/hedwigs-theme.json" label="🎵 Hedwig's Theme" sheet></melody>
<melody path="/assets/motifs/castle-in-the-sky.json" label="🎵 Castle in the Sky"></melody>

## Original Compositions

<melody path="/assets/motifs/my-song.json" label="🎹 My Original Song" sheet></melody>

---

<global-piano height="220" start="C3" end="B6"></global-piano>

<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6/dist/abcjs-basic-min.js"></script>
<script src="/abc-sheet-music.js"></script>
<script src="/melody-tags.js"></script>
```

## How It Works

1. **Page loads** → melody-tags.js finds all `<melody>` and `<global-piano>` tags
2. **Melody tags** → Converted to styled buttons (+ sheet music if requested)
3. **Piano tag** → Creates floating piano at bottom with your specified range
4. **Click button** → Plays melody on the global piano
5. **Press keys** → Play individual notes (A-L, W-E-R-T-Y-U-I-O-P)
6. **Scroll piano** → Access more keys, bindings update automatically

## Features

✅ **Pure Markdown** - Just use tags, no JavaScript needed
✅ **Auto Sheet Music** - Add `sheet` attribute to show notation
✅ **Customizable Piano** - Set height and key range
✅ **One Piano** - Everything plays on the same floating piano
✅ **Dynamic Bindings** - Keyboard shortcuts adapt to scroll position
✅ **Live Feedback** - See your recent notes in the green box

## Keyboard Bindings

Always maps to **leftmost visible keys** in scroll view:

- **White keys**: A, S, D, F, G, H, J, K, L, ;, '
- **Black keys**: W, E, R, T, Y, U, I, O, P, [, ]

Scroll the piano → bindings update after 200ms

## Styling

### Custom Button Colors

```css
.melody-button {
  background: #9c27b0;
  color: white;
  border-radius: 20px;
  font-size: 16px;
}
```

### Custom Piano Appearance

```css
#global-piano-floating {
  background: linear-gradient(to bottom, #fff, #f5f5f5);
}

#global-piano-keys .white-key.active {
  background: #ff5722;
}
```

### Custom Sheet Preview

```css
.melody-sheet-preview {
  background: #e3f2fd;
  border: 2px solid #2196f3;
}
```

## Tag Attributes Reference

### `<melody>` Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `path` | string | Yes | - | Path to melody JSON file |
| `label` | string | No | "Play" | Button text |
| `sheet` | boolean | No | false | Show sheet music preview |

### `<global-piano>` Attributes

| Attribute | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `height` | number | No | 180 | Piano height in pixels |
| `start` | string | No | "C3" | Starting note |
| `end` | string | No | "C7" | Ending note |

## Your Melody JSON Format

No changes from before:

```json
{
  "title": "My Song",
  "key": "C Major",
  "timeSignature": "4/4",
  "notes": ["C4", "D4", "E4", "F4", "G4"],
  "durations": ["4n", "4n", "4n", "4n", "2n"]
}
```

## Why This Approach?

**Before (Complex):**
```html
<div id="piano" data-piano-auto-init data-show-sheet-music="true"
     data-melodies='[{"path": "song.json", "label": "Play Song"}]'></div>
```

**Now (Simple):**
```html
<melody path="song.json" label="Play Song" sheet></melody>
<global-piano></global-piano>
```

Clean, readable, markdown-friendly! ✨

## Files Needed

1. **melody-tags.js** (~6KB) - Tag processing and piano logic
2. **global-piano.css** (~3KB) - Styling
3. **abc-sheet-music.js** (~2KB) - JSON to ABC converter
4. **abcjs** (CDN) - Sheet music rendering
5. **Tone.js** (CDN) - Audio playback

Total custom code: **~11KB**
