/**
 * ABC Notation Sheet Music Generator
 * Uses abcjs library for professional sheet music rendering
 */
(function() {
  // Convert Tone.js note format to ABC notation
  function convertNoteToABC(note) {
    if (note === 'rest') return 'z';

    const match = note.match(/^([A-G])(#|b)?(\d+)$/);
    if (!match) return 'C';

    const noteName = match[1];
    const accidental = match[2] === '#' ? '^' : (match[2] === 'b' ? '_' : '');
    const octave = parseInt(match[3]);

    // ABC notation octave mapping:
    // C4-B4 = C D E F G A B (uppercase, middle C octave)
    // C5-B5 = c d e f g a b (lowercase)
    // C6-B6 = c' d' e' f' g' a' b' (lowercase with ')
    // C3-B3 = C, D, E, F, G, A, B, (uppercase with ,)
    let abcNote;
    if (octave === 6) {
      abcNote = noteName.toLowerCase() + "'";
    } else if (octave === 5) {
      abcNote = noteName.toLowerCase();
    } else if (octave === 4) {
      abcNote = noteName.toUpperCase();
    } else if (octave === 3) {
      abcNote = noteName.toUpperCase() + ',';
    } else if (octave === 2) {
      abcNote = noteName.toUpperCase() + ',,';
    } else {
      abcNote = noteName.toUpperCase(); // default to octave 4
    }

    return accidental + abcNote;
  }

  // Convert Tone.js duration to ABC notation length
  function convertDurationToABC(duration) {
    const durationMap = {
      '1n': '4',    // whole note = 4 quarter notes
      '2n': '2',    // half note = 2 quarter notes
      '2n.': '3',   // dotted half = 3 quarter notes
      '4n': '',     // quarter note (default, no number needed)
      '4n.': '3/2', // dotted quarter = 1.5 quarter notes
      '8n': '/2',   // eighth note = 0.5 quarter notes
      '8n.': '3/4', // dotted eighth = 0.75 quarter notes
      '16n': '/4',  // sixteenth = 0.25 quarter notes
      '16n.': '3/8' // dotted sixteenth = 0.375 quarter notes
    };
    return durationMap[duration] || '';
  }

  // Convert melody JSON to ABC notation
  function melodyToABC(melody) {
    const { title, key, timeSignature, notes, durations } = melody;

    // Start ABC notation
    let abc = '';
    abc += 'X:1\n';  // Reference number
    if (title) abc += `T:${title}\n`;
    if (key) {
      // Extract just the key note (e.g., "C Major" -> "C", "A Minor" -> "Am")
      const keyMatch = key.match(/^([A-G]#?b?)\s*(Major|Minor)?/i);
      if (keyMatch) {
        const keyNote = keyMatch[1];
        const keyMode = keyMatch[2];
        abc += `K:${keyNote}${keyMode && keyMode.toLowerCase() === 'minor' ? 'm' : ''}\n`;
      } else {
        abc += 'K:C\n';
      }
    } else {
      abc += 'K:C\n';  // Default to C major
    }
    if (timeSignature) abc += `M:${timeSignature}\n`;
    abc += 'L:1/4\n';  // Default note length is quarter note

    // Convert notes to ABC notation
    abc += '|';  // Start measure
    for (let i = 0; i < notes.length; i++) {
      const abcNote = convertNoteToABC(notes[i]);
      const abcDuration = convertDurationToABC(durations[i] || '4n');
      abc += abcNote + abcDuration + ' ';
    }
    abc += '|\n';  // End measure

    return abc;
  }

  // Generate sheet music using abcjs
  function generateABCSheetMusic(melody, containerId, options = {}) {
    if (typeof ABCJS === 'undefined') {
      console.error('abcjs library not loaded! Include: https://cdn.jsdelivr.net/npm/abcjs@6/dist/abcjs-basic-min.js');
      return;
    }

    const abc = melodyToABC(melody);
    const container = document.getElementById(containerId);

    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    // Render with abcjs
    ABCJS.renderAbc(container, abc, {
      responsive: 'resize',
      scale: options.scale || 0.8,
      staffwidth: options.staffwidth || 500,
      paddingtop: 0,
      paddingbottom: 0,
      paddingleft: 0,
      paddingright: 0
    });
  }

  // Load melody from JSON and generate sheet music
  async function loadAndGenerateABCSheetMusic(melodyPath, containerId, options = {}) {
    try {
      const response = await fetch(melodyPath);
      const melody = await response.json();
      generateABCSheetMusic(melody, containerId, options);
    } catch (error) {
      console.error('Error loading melody:', error);
    }
  }

  // Export functions
  window.generateABCSheetMusic = generateABCSheetMusic;
  window.loadAndGenerateABCSheetMusic = loadAndGenerateABCSheetMusic;
  window.melodyToABC = melodyToABC;
})();
