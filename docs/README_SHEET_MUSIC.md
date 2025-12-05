# Sheet Music Auto-Generation

Automatically generate professional sheet music notation for your melodies using ABC notation and abcjs.

## Quick Start

Add `data-show-sheet-music="true"` to enable sheet music display:

```html
<div id="piano-widget" data-piano-auto-init
     data-show-sheet-music="true"
     data-melodies='[{"path": "/assets/motifs/my-song.json", "label": "Play"}]'>
</div>
```

## Complete Example

```markdown
<link rel="stylesheet" href="/piano-keyboard.css">

<div id="my-piano" data-piano-auto-init
     data-show-sheet-music="true"
     data-melodies='[
       {"path": "/assets/motifs/hedwigs-theme.json", "label": "Hedwig&#39;s Theme"},
       {"path": "/assets/motifs/castle-in-the-sky.json", "label": "Castle in the Sky"}
     ]'>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6/dist/abcjs-basic-min.js"></script>
<script src="/abc-sheet-music.js"></script>
<script src="/piano-keyboard.js"></script>
```

## Required Scripts (in order)

1. **Tone.js** - Audio playback
2. **abcjs** - Sheet music rendering (~100KB from CDN)
3. **abc-sheet-music.js** - Converts your JSON to ABC notation
4. **piano-keyboard.js** - Piano keyboard widget

## How It Works

1. Your melody JSON contains notes in standard format: `"C4"`, `"D#5"`, `"B4"`, etc.
2. `abc-sheet-music.js` converts these to ABC notation format
3. abcjs renders the ABC notation as beautiful SVG sheet music
4. Sheet music appears automatically above each play button

## Your Melody Format

No changes needed to your existing JSON files:

```json
{
  "title": "My Song",
  "key": "C Major",
  "timeSignature": "4/4",
  "notes": ["C4", "D4", "E4", "F4", "G4"],
  "durations": ["4n", "4n", "4n", "4n", "2n"]
}
```

## Supported Features

### Notes
- All natural notes: C, D, E, F, G, A, B
- Sharps: C#, D#, F#, G#, A#
- Flats: Db, Eb, Gb, Ab, Bb
- Octaves 2-7
- Rests: use `"rest"` as note value

### Durations
- Whole notes: `"1n"`
- Half notes: `"2n"`, `"2n."` (dotted)
- Quarter notes: `"4n"`, `"4n."` (dotted)
- Eighth notes: `"8n"`, `"8n."` (dotted)
- Sixteenth notes: `"16n"`, `"16n."` (dotted)

## Test Files

- **[test-abc-sheet.html](test-abc-sheet.html)** - Demo with your actual melodies
- **[test-octaves.html](test-octaves.html)** - Octave mapping verification

## Why abcjs?

✅ **Industry standard** - Used worldwide for music notation on the web
✅ **Professional quality** - Publication-ready sheet music
✅ **Mature & reliable** - 10+ years of development
✅ **Efficient** - Better than writing custom rendering
✅ **Well-documented** - Easy to customize if needed

## Octave Mapping Reference

ABC notation uses this octave system:

| Scientific Pitch | ABC Notation | Example |
|------------------|--------------|---------|
| C6-B6 | c' d' e' f' g' a' b' | High octave |
| C5-B5 | c d e f g a b | Lowercase |
| C4-B4 | C D E F G A B | Middle C octave (uppercase) |
| C3-B3 | C, D, E, F, G, A, B, | Low octave |
| C2-B2 | C,, D,, E,, etc. | Very low |

The converter in `abc-sheet-music.js` handles this automatically!
