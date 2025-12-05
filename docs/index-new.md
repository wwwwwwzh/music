# Piano Melodies

<link rel="stylesheet" href="/global-piano.css">

## Harry Potter Themes

<button class="melody-button" onclick="playGlobalMelody('/assets/motifs/hedwigs-theme.json')">🎵 Hedwig's Theme</button>
<button class="melody-button" onclick="playGlobalMelody('/assets/motifs/leaving-hogwartz.json')">🎵 Leaving Hogwarts</button>

<div class="melody-sheet-preview" id="hedwig-sheet"></div>

## Studio Ghibli

<button class="melody-button" onclick="playGlobalMelody('/assets/motifs/castle-in-the-sky.json')">🎵 Castle in the Sky</button>

<div class="melody-sheet-preview" id="castle-sheet"></div>

---

**How to use:**
- Click buttons above to play melodies
- Use your keyboard: A-L for white keys, W-E-R-T-Y-U-I-O-P for black keys
- Scroll the piano at the bottom to access all keys
- Watch the green box show your recently played notes!

<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs@6/dist/abcjs-basic-min.js"></script>
<script src="/abc-sheet-music.js"></script>
<script src="/global-piano.js"></script>

<script>
// Optional: Show sheet music previews
window.addEventListener('DOMContentLoaded', () => {
  if (window.loadAndGenerateABCSheetMusic) {
    loadAndGenerateABCSheetMusic('/assets/motifs/hedwigs-theme.json', 'hedwig-sheet', { scale: 0.7, staffwidth: 500 });
    loadAndGenerateABCSheetMusic('/assets/motifs/castle-in-the-sky.json', 'castle-sheet', { scale: 0.7, staffwidth: 500 });
  }
});
</script>
