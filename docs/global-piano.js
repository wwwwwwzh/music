/**
 * Global Floating Piano - Single scrollable piano at bottom of page
 */
(function() {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 1 }
  }).toDestination();

  const keyboardMap = {};
  const activeKeys = new Set();
  const allKeyElements = {};
  const recentNotes = [];
  const maxRecentNotes = 12;

  // Generate full piano range (C2-C7)
  function generateFullRange() {
    const notes = [];
    const octaves = [2, 3, 4, 5, 6, 7];
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackNotes = ['C#', 'D#', null, 'F#', 'G#', 'A#', null]; // null where no black key

    octaves.forEach(octave => {
      whiteNotes.forEach((note, idx) => {
        notes.push({ note: `${note}${octave}`, type: 'white', octave });
        if (blackNotes[idx]) {
          notes.push({ note: `${blackNotes[idx]}${octave}`, type: 'black', octave });
        }
      });
    });
    notes.push({ note: 'C8', type: 'white', octave: 8 }); // Add final C

    return notes;
  }

  // Play note
  function playNote(note) {
    if (activeKeys.has(note)) return;
    activeKeys.add(note);
    synth.triggerAttack(note);

    if (allKeyElements[note]) {
      allKeyElements[note].classList.add('active');
    }

    addToRecentNotes(note);
  }

  // Stop note
  function stopNote(note) {
    activeKeys.delete(note);
    synth.triggerRelease(note);

    if (allKeyElements[note]) {
      allKeyElements[note].classList.remove('active');
    }
  }

  // Add to recent notes and update live sheet
  function addToRecentNotes(note) {
    recentNotes.push(note);
    if (recentNotes.length > maxRecentNotes) {
      recentNotes.shift();
    }
    updateLiveSheet();
  }

  // Update live sheet music
  function updateLiveSheet() {
    const liveSheet = document.getElementById('global-piano-live-sheet');
    if (!liveSheet || !window.generateABCSheetMusic || recentNotes.length === 0) return;

    const melody = {
      notes: recentNotes.slice(),
      durations: recentNotes.map(() => '4n')
    };

    liveSheet.innerHTML = '';
    window.generateABCSheetMusic(melody, 'global-piano-live-sheet', {
      scale: 0.65,
      staffwidth: 600
    });
  }

  // Update keyboard bindings based on visible keys
  function updateKeyboardBindings() {
    const pianoContainer = document.getElementById('global-piano-keys');
    if (!pianoContainer) return;

    const whiteKeyBindings = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
    const blackKeyBindings = ['w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];

    // Clear existing bindings
    Object.keys(keyboardMap).forEach(k => delete keyboardMap[k]);

    // Get visible white and black keys
    const whiteKeys = Array.from(pianoContainer.querySelectorAll('.white-key'));
    const blackKeys = Array.from(pianoContainer.querySelectorAll('.black-key'));

    // Bind white keys
    whiteKeys.slice(0, whiteKeyBindings.length).forEach((keyEl, idx) => {
      const note = keyEl.dataset.note;
      const binding = whiteKeyBindings[idx];
      keyboardMap[binding] = note;

      // Update label
      const label = keyEl.querySelector('.key-label');
      if (label) label.textContent = binding.toUpperCase();
    });

    // Bind black keys
    blackKeys.slice(0, blackKeyBindings.length).forEach((keyEl, idx) => {
      const note = keyEl.dataset.note;
      const binding = blackKeyBindings[idx];
      keyboardMap[binding] = note;

      // Update label
      const label = keyEl.querySelector('.key-label');
      if (label) label.textContent = binding.toUpperCase();
    });
  }

  // Keyboard event handlers
  function handleKeyDown(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    const key = event.key.toLowerCase();
    if (keyboardMap[key] && !event.repeat) {
      event.preventDefault();
      playNote(keyboardMap[key]);
    }
  }

  function handleKeyUp(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    const key = event.key.toLowerCase();
    if (keyboardMap[key]) {
      event.preventDefault();
      stopNote(keyboardMap[key]);
    }
  }

  // Create global piano
  function createGlobalPiano() {
    // Create floating container
    const floatingPiano = document.createElement('div');
    floatingPiano.id = 'global-piano-floating';
    floatingPiano.innerHTML = `
      <div id="global-piano-live-sheet"></div>
      <div id="global-piano-controls">
        <button id="clear-notes-btn" title="Clear played notes">🗑️</button>
      </div>
      <div id="global-piano-scroll-container">
        <div id="global-piano-keys"></div>
      </div>
    `;
    document.body.appendChild(floatingPiano);

    const keysContainer = document.getElementById('global-piano-keys');
    const fullRange = generateFullRange();

    // Track white key position for black key placement
    let whiteKeyCount = 0;

    fullRange.forEach(({ note, type }) => {
      const keyEl = document.createElement('div');
      keyEl.className = type === 'white' ? 'white-key' : 'black-key';
      keyEl.dataset.note = note;

      const label = document.createElement('span');
      label.className = 'key-label';
      keyEl.appendChild(label);

      keyEl.addEventListener('mousedown', () => playNote(note));
      keyEl.addEventListener('mouseup', () => stopNote(note));
      keyEl.addEventListener('mouseleave', () => stopNote(note));
      keyEl.addEventListener('dragstart', (e) => e.preventDefault());

      if (type === 'white') {
        keyEl.style.left = `${whiteKeyCount * 40}px`;
        whiteKeyCount++;
      } else {
        // Position black key between white keys
        keyEl.style.left = `${(whiteKeyCount * 40) - 14}px`;
      }

      keysContainer.appendChild(keyEl);
      allKeyElements[note] = keyEl;
    });

    // Set container width
    keysContainer.style.width = `${whiteKeyCount * 40}px`;

    // Scroll to middle C (C4)
    const c4Key = keysContainer.querySelector('[data-note="C4"]');
    if (c4Key) {
      setTimeout(() => {
        c4Key.scrollIntoView({ inline: 'center', behavior: 'smooth' });
        updateKeyboardBindings();
      }, 100);
    }

    // Update bindings on scroll
    const scrollContainer = document.getElementById('global-piano-scroll-container');
    scrollContainer.addEventListener('scroll', () => {
      clearTimeout(scrollContainer.scrollTimeout);
      scrollContainer.scrollTimeout = setTimeout(updateKeyboardBindings, 200);
    });

    // Clear button
    document.getElementById('clear-notes-btn').addEventListener('click', () => {
      recentNotes.length = 0;
      updateLiveSheet();
    });

    // Add keyboard listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
  }

  // Play melody function (accessible globally)
  window.playGlobalMelody = async function(melodyPath) {
    try {
      const response = await fetch(melodyPath);
      const melody = await response.json();

      // Play sequence
      for (let i = 0; i < melody.notes.length; i++) {
        const note = melody.notes[i];
        const duration = melody.durations[i];

        if (note !== 'rest') {
          synth.triggerAttackRelease(note, duration);
          if (allKeyElements[note]) {
            allKeyElements[note].classList.add('active');
          }
          addToRecentNotes(note);
        }

        await new Promise(resolve => setTimeout(resolve, Tone.Time(duration).toMilliseconds()));

        if (note !== 'rest' && allKeyElements[note]) {
          allKeyElements[note].classList.remove('active');
        }
      }
    } catch (error) {
      console.error('Error playing melody:', error);
    }
  };

  // Initialize on page load
  document.addEventListener('DOMContentLoaded', createGlobalPiano);
})();
