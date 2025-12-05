<link rel="stylesheet" href="/piano-keyboard.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6/dist/abcjs-basic-min.js"></script>
<script src="/abc-sheet-music.js"></script>
<script src="/piano-keyboard.js"></script>

### Example 1: Piano with sheet music + live note tracking
<div id="piano-keyboard-widget" data-piano-auto-init
     data-show-sheet-music="true"
     data-show-live-sheet="true"
     data-start="G4"
     data-end="F6"
     data-height="150"
     data-melodies='[
  {"path": "/assets/motifs/hedwigs-theme.json", "label": "Play Hedwig&#39;s Theme"},
  {"path": "/assets/motifs/castle-in-the-sky.json", "label": "Play Castle in the Sky"},
  {"path": "/assets/motifs/leaving-hogwartz.json", "label": "Leaving Hogwartz"}
]'></div>


---

## Alternative Usage Examples

### Example 2: Piano Only (No Buttons)
<div id="piano-only"></div>
<script>
  initPiano('piano-only');
</script>

### Example 5: Piano with Limited Key Range
<div id="piano-range" data-piano-auto-init data-start="C4" data-end="C5"></div>

### Example 6: Custom Size and Range via JavaScript
<div id="piano-custom-size"></div>
<script>
  initPiano('piano-custom-size', {
    height: 100,
    start: 'C4',
    end: 'F4',
    melodies: [
      { path: '/assets/motifs/hedwigs-theme.json', label: 'Play Hedwig\'s Theme' }
    ]
  });
</script>


---

## How to Use

- Click individual piano keys to play notes manually
- Click melody buttons to play pre-defined songs
- Songs are loaded from JSON files

## Configuration Options

You can customize the piano using data attributes or JavaScript options:

### Data Attributes (HTML)
- `data-piano-auto-init`: Enable auto-initialization
- `data-height="100"`: Set piano height in pixels (default: 150)
- `data-start="C4"`: Set starting note (default: C4)
- `data-end="C5"`: Set ending note (default: B5)
- `data-melodies='[...]'`: Add melody buttons (JSON array)

### JavaScript Options
```javascript
initPiano('container-id', {
  height: 200,        // Piano height in pixels
  start: 'C4',        // Starting note
  end: 'C5',          // Ending note
  melodies: [         // Optional melody buttons
    { path: 'song.json', label: 'Play Song' }
  ]
});
```

## Creating Your Own Melody JSON

Create a JSON file with this structure:

```json
{
  "title": "My Song",
  "key": "C Major",
  "timeSignature": "4/4",
  "description": "Optional description",
  "notes": ["C4", "D4", "E4", "F4", "G4"],
  "durations": ["4n", "4n", "4n", "4n", "2n"]
}
```

