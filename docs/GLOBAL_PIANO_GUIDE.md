# Global Floating Piano - Simple Guide

## What Is It?

One scrollable piano at the bottom of your page. All melody buttons play on this piano. Minimal markdown needed!

## Quick Setup

### 1. Include the files (once per page):

```html
<link rel="stylesheet" href="/global-piano.css">

<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6/dist/abcjs-basic-min.js"></script>
<script src="/abc-sheet-music.js"></script>
<script src="/global-piano.js"></script>
```

### 2. Add melody buttons in your markdown:

```html
<button class="melody-button" onclick="playGlobalMelody('/assets/motifs/my-song.json')">
  🎵 My Song
</button>
```

That's it! The floating piano appears automatically.

## Features

✅ **One Piano**: Single scrollable piano at bottom (C2-C8 range)
✅ **Auto-binds Keyboard**: A-L for white, W-E-R-T-Y-U-I-O-P for black
✅ **Live Sheet Music**: See your last 12 played notes
✅ **Scrollable**: Access full range without page overflow
✅ **Minimal MD**: Just add buttons with onclick

## Complete Example

```markdown
# My Melodies

<link rel="stylesheet" href="/global-piano.css">

## Harry Potter

<button class="melody-button" onclick="playGlobalMelody('/assets/motifs/hedwigs-theme.json')">
  🎵 Hedwig's Theme
</button>

## Ghibli

<button class="melody-button" onclick="playGlobalMelody('/assets/motifs/castle-in-the-sky.json')">
  🎵 Castle in the Sky
</button>

<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6/dist/abcjs-basic-min.js"></script>
<script src="/abc-sheet-music.js"></script>
<script src="/global-piano.js"></script>
```

## Optional: Show Sheet Music Previews

Add this to display static sheet music above buttons:

```html
<div class="melody-sheet-preview" id="my-sheet"></div>

<script>
window.addEventListener('DOMContentLoaded', () => {
  loadAndGenerateABCSheetMusic(
    '/assets/motifs/my-song.json',
    'my-sheet',
    { scale: 0.7, staffwidth: 500 }
  );
});
</script>
```

## How Users Interact

1. **Click buttons** - Plays melody on the floating piano
2. **Press keyboard keys** - A-L = white keys, W-E-R-T-Y-U-I-O-P = black keys
3. **Scroll piano** - Access more keys (bindings update automatically)
4. **Click piano keys** - Play individual notes
5. **Watch green box** - See your recently played notes as sheet music

## Keyboard Binding (Dynamic)

The keyboard always binds to the **visible/leftmost keys** in the scroll view:

- Scroll to C4 → A plays C4
- Scroll to G4 → A plays G4
- Scroll to C5 → A plays C5

Bindings update 200ms after you stop scrolling.

## Styling

Customize the piano appearance:

```css
/* Change piano background */
#global-piano-floating {
  background: #f0f0f0;
}

/* Change key highlight color */
#global-piano-keys .white-key.active {
  background: #ff5722;
}

/* Adjust button style */
.melody-button {
  background: #9c27b0;
  border-radius: 20px;
}
```

## No Multiple Pianos Needed!

Old way (complex):
- Multiple piano instances
- Manage which is active
- Data attributes everywhere
- Confusion

New way (simple):
- One piano, always there
- Just add buttons
- Everything works together
- Clean markdown

## Your Melody JSON (Unchanged)

```json
{
  "title": "My Song",
  "key": "C Major",
  "timeSignature": "4/4",
  "notes": ["C4", "D4", "E4", "F4", "G4"],
  "durations": ["4n", "4n", "4n", "4n", "2n"]
}
```

## Files You Need

1. **global-piano.js** (~6KB) - The piano logic
2. **global-piano.css** (~3KB) - Piano styling
3. **abc-sheet-music.js** (~2KB) - JSON → ABC converter
4. **abcjs** (~100KB from CDN) - Sheet music rendering
5. **Tone.js** (~200KB from CDN) - Audio playback

Total custom code: ~11KB!

## Browser Support

✅ Chrome/Edge/Firefox/Safari
✅ Mobile browsers
✅ Touch and mouse support
✅ Keyboard shortcuts (desktop only)
