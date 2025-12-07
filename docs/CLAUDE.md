# Melody Piano System - Project Overview

## What This Is

A markdown-centric interactive piano system that lets you embed playable melodies and a virtual piano keyboard directly in markdown files using custom HTML tags.

## Core Features

- **Custom Melody Tags**: Embed playable melodies with optional sheet music previews
- **Global Floating Piano**: Single scrollable piano keyboard at bottom of page (C2-C8 range)
- **Dynamic Keyboard Bindings**: A-L for white keys, W-E-R-T-Y-U-I-O-P for black keys
- **Live Sheet Music**: Shows your last 12 played notes in real-time
- **Auto-generated ABC Notation**: Converts melody JSON to standard music notation

## Usage

### In Your Markdown

```html
<link rel="stylesheet" href="/global-piano.css">

<!-- Add melodies with play buttons -->
<melody path="/assets/motifs/hedwigs-theme.json" label="🎵 Hedwig's Theme" sheet></melody>
<melody path="/assets/motifs/castle-in-the-sky.json" label="🎵 Castle in the Sky"></melody>

<!-- Add global piano (only once per page) -->
<global-piano height="200" start="E4"></global-piano>

<!-- Required scripts -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6/dist/abcjs-basic-min.js"></script>
<script src="/abc-sheet-music.js"></script>
<script src="/melody-tags.js"></script>
```

### Melody Tag Attributes

| Attribute | Required | Description |
|-----------|----------|-------------|
| `path` | Yes | Path to melody JSON file |
| `label` | No | Button text (default: "Play") |
| `sheet` | No | Show sheet music preview above button |

### Global Piano Tag Attributes

| Attribute | Required | Default | Description |
|-----------|----------|---------|-------------|
| `height` | No | 180 | Piano height in pixels |
| `start` | No | C4 | Initial scroll position and keyboard binding focus |

## Melody File Formats

### JSON Format (.json)

```json
{
  "title": "Hedwig's Theme",
  "key": "E Minor",
  "timeSignature": "3/8",
  "notes": ["E5", "A5", "C6", "B5", "A5", "E6", "D6", "B5"],
  "durations": ["4n", "8n", "8n", "8n", "4n", "2n", "4n", "2n"]
}
```

### Simple Text Format (.txt)

**Format:**
- Line 1: Key signature (e.g., "C Major", "E Minor")
- Line 2: Time signature (e.g., "4/4", "3/8")
- Line 3+: One note per line in format `NOTE:DURATION`

**Example (Twinkle Twinkle):**
```
C Major
4/4
C4:4n
C4:4n
G4:4n
G4:4n
A4:4n
A4:4n
G4:2n
F4:4n
F4:4n
E4:4n
E4:4n
D4:4n
D4:4n
C4:2n
```

**Duration Format (Tone.js):**
- `4n` = quarter note
- `8n` = eighth note
- `2n` = half note
- `1n` = whole note
- `4n.` = dotted quarter note (add `.` for dotted)
- `rest` = rest/silence (e.g., `rest:4n` for quarter rest)

## Key Files

### melody-tags.js (~6KB)
Main JavaScript file that:
- Processes custom `<melody>` and `<global-piano>` tags
- Creates floating piano keyboard
- Handles audio synthesis (Tone.js)
- Manages keyboard bindings dynamically based on scroll position
- Generates live sheet music display

**Key Functions:**
- `createMelodyButton()` - Converts `<melody>` tags to play buttons
- `createGlobalPiano()` - Creates the floating piano interface
- `updateKeyboardBindings()` - Updates keyboard shortcuts to visible keys
- `playNote()` / `stopNote()` - Audio playback
- `updateLiveSheet()` - Updates live sheet music display

### abc-sheet-music.js (~2KB)
Converts melody JSON to ABC notation for sheet music rendering.

**ABC Octave Mapping:**
- C4-B4 = `C D E F G A B` (uppercase)
- C5-B5 = `c d e f g a b` (lowercase)
- C6-B6 = `c' d' e' f' g' a' b'` (lowercase with apostrophe)

### global-piano.css (~3KB)
Styling for:
- Floating piano container (fixed to bottom, z-index 1000)
- Piano keys (40px white keys, 28px black keys)
- Live sheet music display (green box)
- Melody buttons
- Controls and toggle buttons

## How It Works

1. **Page Load**: `melody-tags.js` scans for custom tags
2. **Melody Tags**: Converted to styled buttons with optional sheet music
3. **Piano Creation**: Generates full C2-C8 keyboard, scrolls to `start` position
4. **Keyboard Bindings**: Maps A-L and W-E-R-T-Y-U-I-O-P to fully visible keys
5. **Dynamic Updates**: Bindings update 200ms after scrolling stops
6. **Live Feedback**: Last 12 notes displayed as sheet music in green box

## Piano Features

- **Full Range**: Always C2-C8 (7 octaves)
- **Scrollable**: 200px left margin, 600px right margin for keyboard access to all keys
- **Smart Bindings**: Only fully visible keys get keyboard shortcuts
- **Toggle View**: Hide/show piano with 👁️ button
- **Clear Notes**: 🗑️ button clears live sheet music
- **Page Padding**: Auto-adjusts body padding so piano doesn't hide content

## Audio Synthesis

Uses Tone.js PolySynth with:
- Triangle wave oscillator
- 0.6 sustain for longer tone
- 2.5s release for smooth fade
- +2dB volume for stronger sound

## Browser Support

- Chrome/Edge/Firefox/Safari
- Mobile browsers
- Touch and mouse support
- Keyboard shortcuts (desktop only)

## Dependencies

- **Tone.js** (CDN): Audio synthesis and playback
- **abcjs** (CDN): Sheet music rendering from ABC notation

## Total Custom Code

~11KB (melody-tags.js + abc-sheet-music.js + global-piano.css)

## Example Files

- `melodies.md` - Example usage with Harry Potter and Ghibli themes
- `MELODY_TAGS_GUIDE.md` - Detailed tag usage guide
- `GLOBAL_PIANO_GUIDE.md` - Piano system documentation

## Technical Notes

- Piano uses CSS absolute positioning for key layout
- Keyboard bindings filter by `scrollLeft` and viewport width
- Live sheet auto-generates using `generateABCSheetMusic()`
- Body padding prevents piano from hiding page content
- Single global piano instance shared by all melody buttons
