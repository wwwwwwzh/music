(function() {
  // Initialize Tone.js synth
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: {
      attack: 0.005,
      decay: 0.1,
      sustain: 0.3,
      release: 1
    }
  }).toDestination();

  // Piano keys configuration (2 octaves starting from C4)
  const whiteKeys = [
    { note: 'C4', position: 0, key: 'a' },
    { note: 'D4', position: 1, key: 's' },
    { note: 'E4', position: 2, key: 'd' },
    { note: 'F4', position: 3, key: 'f' },
    { note: 'G4', position: 4, key: 'g' },
    { note: 'A4', position: 5, key: 'h' },
    { note: 'B4', position: 6, key: 'j' },
    { note: 'C5', position: 7, key: 'k' },
    { note: 'D5', position: 8, key: 'l' },
    { note: 'E5', position: 9, key: ';' },
    { note: 'F5', position: 10 },
    { note: 'G5', position: 11 },
    { note: 'A5', position: 12 },
    { note: 'B5', position: 13 }
  ];

  const blackKeys = [
    { note: 'C#4', position: 0, key: 'w' },
    { note: 'D#4', position: 1, key: 'e' },
    { note: 'F#4', position: 3, key: 't' },
    { note: 'G#4', position: 4, key: 'y' },
    { note: 'A#4', position: 5, key: 'u' },
    { note: 'C#5', position: 7, key: 'o' },
    { note: 'D#5', position: 8, key: 'p' },
    { note: 'F#5', position: 10 },
    { note: 'G#5', position: 11 },
    { note: 'A#5', position: 12 }
  ];

  // Store key elements for visual feedback
  const keyElements = {};
  const keyboardMap = {};
  const activeKeys = new Set();

  // Play a single note with visual feedback
  function playNote(note) {
    if (activeKeys.has(note)) return; // Prevent repeated triggers
    activeKeys.add(note);
    synth.triggerAttack(note);
    if (keyElements[note]) {
      keyElements[note].classList.add('active');
    }
  }

  // Stop a note
  function stopNote(note) {
    activeKeys.delete(note);
    synth.triggerRelease(note);
    if (keyElements[note]) {
      keyElements[note].classList.remove('active');
    }
  }

  // Play a sequence of notes
  async function playSequence(notes, durations) {
    const buttons = document.querySelectorAll('.play-button');
    buttons.forEach(btn => btn.disabled = true);

    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      const duration = durations[i];
      
      if (note !== 'rest') {
        synth.triggerAttackRelease(note, duration);
        if (keyElements[note]) {
          keyElements[note].classList.add('active');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, Tone.Time(duration).toMilliseconds()));
      
      if (note !== 'rest' && keyElements[note]) {
        keyElements[note].classList.remove('active');
      }
    }

    buttons.forEach(btn => btn.disabled = false);
  }

  // Play a scale function
  function playScale() {
    const scaleNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
    const scaleDurations = Array(8).fill('8n');
    playSequence(scaleNotes, scaleDurations);
  }

  // Load and play melody from JSON file
  async function loadAndPlayMelody(jsonPath) {
    try {
      const response = await fetch(jsonPath);
      const melody = await response.json();
      playSequence(melody.notes, melody.durations);
    } catch (error) {
      console.error('Error loading melody:', error);
    }
  }

  // Keyboard event handlers
  function handleKeyDown(event) {
    // Ignore if typing in an input field
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    if (keyboardMap[key] && !event.repeat) {
      event.preventDefault();
      playNote(keyboardMap[key]);
    }
  }

  function handleKeyUp(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    if (keyboardMap[key]) {
      event.preventDefault();
      stopNote(keyboardMap[key]);
    }
  }

  // Helper function to parse note (e.g., "C4" -> { note: "C", octave: 4 })
  function parseNote(noteStr) {
    const match = noteStr.match(/^([A-G]#?)(\d+)$/);
    if (!match) return null;
    return { note: match[1], octave: parseInt(match[2]) };
  }

  // Helper function to compare notes
  function noteIndex(noteStr) {
    const parsed = parseNote(noteStr);
    if (!parsed) return -1;
    const noteOrder = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
    return parsed.octave * 12 + noteOrder[parsed.note];
  }

  // Initialize piano keyboard
  function initPiano(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container ${containerId} not found`);
      return;
    }

    // Get options with defaults
    const height = options.height || 150; // Default height for white keys
    const startNote = options.start || 'C4';
    const endNote = options.end || 'B5';

    // Filter keys based on range
    const startIdx = noteIndex(startNote);
    const endIdx = noteIndex(endNote);

    const filteredWhiteKeys = whiteKeys.filter(key => {
      const idx = noteIndex(key.note);
      return idx >= startIdx && idx <= endIdx;
    }).map((key, index) => ({ ...key, position: index }));

    const filteredBlackKeys = blackKeys.filter(key => {
      const idx = noteIndex(key.note);
      return idx >= startIdx && idx <= endIdx;
    }).map(key => {
      // Recalculate position based on filtered white keys
      const whiteKeyIndex = filteredWhiteKeys.findIndex(wk => {
        const wIdx = noteIndex(wk.note);
        const bIdx = noteIndex(key.note);
        return bIdx > wIdx && (filteredWhiteKeys.findIndex(w => noteIndex(w.note) > bIdx) === -1 ||
                                noteIndex(filteredWhiteKeys[filteredWhiteKeys.findIndex(w => noteIndex(w.note) > wIdx) + 1]?.note || 'Z9') > bIdx);
      });
      return { ...key, position: whiteKeyIndex };
    });

    const keyboardContainer = document.createElement('div');
    keyboardContainer.className = 'keyboard-container';
    keyboardContainer.style.setProperty('--key-height', `${height}px`);
    container.appendChild(keyboardContainer);

    // Create white keys
    filteredWhiteKeys.forEach(key => {
      const keyEl = document.createElement('div');
      keyEl.className = 'white-key';
      keyEl.dataset.note = key.note;
      
      // Add keyboard key label
      if (key.key) {
        const label = document.createElement('span');
        label.textContent = key.key.toUpperCase();
        keyEl.appendChild(label);
      }
      
      keyEl.addEventListener('mousedown', () => playNote(key.note));
      keyEl.addEventListener('mouseup', () => stopNote(key.note));
      keyEl.addEventListener('mouseleave', () => stopNote(key.note));
      
      // Prevent drag selection
      keyEl.addEventListener('dragstart', (e) => e.preventDefault());
      
      keyboardContainer.appendChild(keyEl);
      keyElements[key.note] = keyEl;
      
      // Map keyboard key to note
      if (key.key) {
        keyboardMap[key.key] = key.note;
      }
    });

    // Create black keys with improved positioning
    filteredBlackKeys.forEach(key => {
      const keyEl = document.createElement('div');
      keyEl.className = 'black-key';
      keyEl.dataset.note = key.note;
      
      // Improved positioning: center black keys between white keys
      // Position relative to the white key on the left
      const leftOffset = (key.position * 40) + 40 - 14; // 40px white key width, 28px black key width
      keyEl.style.left = `${leftOffset}px`;
      
      // Add keyboard key label
      if (key.key) {
        const label = document.createElement('span');
        label.textContent = key.key.toUpperCase();
        keyEl.appendChild(label);
      }
      
      keyEl.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        playNote(key.note);
      });
      keyEl.addEventListener('mouseup', () => stopNote(key.note));
      keyEl.addEventListener('mouseleave', () => stopNote(key.note));
      
      // Prevent drag selection
      keyEl.addEventListener('dragstart', (e) => e.preventDefault());
      
      keyboardContainer.appendChild(keyEl);
      keyElements[key.note] = keyEl;
      
      // Map keyboard key to note
      if (key.key) {
        keyboardMap[key.key] = key.note;
      }
    });

    // Add keyboard event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Create control buttons if melodies are provided
    if (options.melodies && options.melodies.length > 0) {
      const controls = document.createElement('div');
      controls.className = 'controls';
      
      options.melodies.forEach(melody => {
        const button = document.createElement('button');
        button.className = 'play-button';
        button.textContent = melody.label || melody.path;
        button.onclick = () => loadAndPlayMelody(melody.path);
        controls.appendChild(button);
      });
      
      // Add play scale button
      const scaleButton = document.createElement('button');
      scaleButton.className = 'play-button';
      scaleButton.textContent = 'Play C Major Scale';
      scaleButton.onclick = playScale;
      controls.appendChild(scaleButton);
      
      container.appendChild(controls);
    }

    // Add keyboard hint
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.textContent = 'Play with keyboard: A-L keys for white notes, Q-P keys for black notes';
    container.appendChild(hint);
  }

  // Expose global functions
  window.initPiano = initPiano;
  window.loadAndPlayMelody = loadAndPlayMelody;
  window.playPianoNote = playNote;
  window.playSequence = playSequence;
  window.playScale = playScale;

  // Auto-initialize if data-auto-init attribute is present
  document.addEventListener('DOMContentLoaded', function() {
    const autoInitContainers = document.querySelectorAll('[data-piano-auto-init]');
    autoInitContainers.forEach(container => {
      const melodiesAttr = container.getAttribute('data-melodies');
      const heightAttr = container.getAttribute('data-height');
      const startAttr = container.getAttribute('data-start');
      const endAttr = container.getAttribute('data-end');

      const options = {};
      if (melodiesAttr) options.melodies = JSON.parse(melodiesAttr);
      if (heightAttr) options.height = parseInt(heightAttr);
      if (startAttr) options.start = startAttr;
      if (endAttr) options.end = endAttr;

      initPiano(container.id, options);
    });
  });
})();