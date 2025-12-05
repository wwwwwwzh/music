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

  // Global keyboard map for keyboard shortcuts
  const keyboardMap = {};
  const activeKeys = new Set();
  const allKeyElements = {}; // Store all piano key elements globally
  const recentNotes = []; // Track recently played notes
  const maxRecentNotes = 8; // Show last 8 notes

  // Piano instance management
  const allPianos = []; // Store all piano instances
  let activePianoIndex = 0; // Index of currently active piano

  // Update global keyboard map from active piano
  function updateActiveKeyboardMap() {
    // Clear current mappings
    Object.keys(keyboardMap).forEach(k => delete keyboardMap[k]);

    // Copy mappings from active piano
    if (allPianos[activePianoIndex]) {
      Object.assign(keyboardMap, allPianos[activePianoIndex].keyboardMap);
    }
  }

  // Update visual indicators for all pianos
  function updatePianoIndicators() {
    allPianos.forEach((piano, index) => {
      if (piano.selectorButton) {
        if (index === activePianoIndex) {
          piano.selectorButton.classList.add('active');
        } else {
          piano.selectorButton.classList.remove('active');
        }
      }
    });
  }

  // Play a single note with visual feedback
  function playNote(note) {
    if (activeKeys.has(note)) return; // Prevent repeated triggers
    activeKeys.add(note);
    synth.triggerAttack(note);

    // Add visual feedback to all pianos
    if (allKeyElements[note]) {
      allKeyElements[note].forEach(el => el.classList.add('active'));
    }

    // Add to recent notes
    addToRecentNotes(note);
  }

  // Stop a note
  function stopNote(note) {
    activeKeys.delete(note);
    synth.triggerRelease(note);

    // Remove visual feedback from all pianos
    if (allKeyElements[note]) {
      allKeyElements[note].forEach(el => el.classList.remove('active'));
    }
  }

  // Add note to recent notes and update live sheet music
  function addToRecentNotes(note) {
    recentNotes.push(note);
    if (recentNotes.length > maxRecentNotes) {
      recentNotes.shift();
    }
    updateLiveSheetMusic();
  }

  // Update live sheet music display
  function updateLiveSheetMusic() {
    const liveSheetContainers = document.querySelectorAll('.live-sheet-music');
    if (liveSheetContainers.length === 0 || !window.generateABCSheetMusic) return;

    const melody = {
      notes: recentNotes.slice(),
      durations: recentNotes.map(() => '4n')
    };

    liveSheetContainers.forEach(container => {
      container.innerHTML = '';
      if (recentNotes.length > 0) {
        window.generateABCSheetMusic(melody, container.id, {
          scale: 0.6,
          staffwidth: 300
        });
      }
    });
  }

  // Play a sequence of notes
  async function playSequence(notes, durations, keyElements = {}, cancelToken = { cancelled: false }) {
    for (let i = 0; i < notes.length; i++) {
      if (cancelToken.cancelled) {
        // Clear any active key highlights
        Object.values(keyElements).forEach(el => el.classList.remove('active'));
        break;
      }

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

    // Available keyboard keys for binding
    const whiteKeyBindings = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
    const blackKeyBindings = ['w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];

    const filteredWhiteKeys = whiteKeys.filter(key => {
      const idx = noteIndex(key.note);
      return idx >= startIdx && idx <= endIdx;
    }).map((key, index) => ({
      ...key,
      position: index,
      key: whiteKeyBindings[index] || null // Dynamically assign keyboard binding
    }));

    const filteredBlackKeys = blackKeys.filter(key => {
      const idx = noteIndex(key.note);
      return idx >= startIdx && idx <= endIdx;
    }).map((key, index) => {
      // Find the white key immediately to the left of this black key
      const keyIdx = noteIndex(key.note);
      let newPosition = -1;

      for (let i = 0; i < filteredWhiteKeys.length; i++) {
        const whiteIdx = noteIndex(filteredWhiteKeys[i].note);
        if (whiteIdx < keyIdx) {
          newPosition = i;
        } else {
          break;
        }
      }

      return {
        ...key,
        position: newPosition,
        key: blackKeyBindings[index] || null // Dynamically assign keyboard binding
      };
    });

    // Register this piano instance
    const pianoIndex = allPianos.length;
    const pianoInstance = {
      containerId: containerId,
      keyboardMap: {},
      filteredWhiteKeys: filteredWhiteKeys,
      filteredBlackKeys: filteredBlackKeys
    };
    allPianos.push(pianoInstance);

    // Function to set this piano as active
    function setActivePiano() {
      if (activePianoIndex !== pianoIndex) {
        activePianoIndex = pianoIndex;
        updateActiveKeyboardMap();
        updatePianoIndicators();
      }
    }

    // Local keyElements for this piano instance
    const keyElements = {};

    // Local wrapper functions for visual feedback (now also tracks clicks and sets active)
    function playNoteWithFeedback(note) {
      setActivePiano(); // Make this piano active when played
      playNote(note); // This already adds to recent notes and highlights all pianos
    }

    function stopNoteWithFeedback(note) {
      stopNote(note); // This already removes highlights from all pianos
    }

    // Create live sheet music display if option is enabled
    if (options.showLiveSheet && window.generateABCSheetMusic) {
      const liveSheetContainer = document.createElement('div');
      liveSheetContainer.className = 'live-sheet-music';
      liveSheetContainer.id = `${containerId}-live-sheet`;

      const liveSheetTitle = document.createElement('div');
      liveSheetTitle.className = 'live-sheet-title';
      liveSheetTitle.textContent = 'Your Notes:';
      liveSheetContainer.appendChild(liveSheetTitle);

      container.appendChild(liveSheetContainer);
    }

    // Create piano selector indicator
    const selectorButton = document.createElement('button');
    selectorButton.className = 'piano-selector-button';
    selectorButton.textContent = '⌨️';
    selectorButton.title = 'Click to control this piano with keyboard';
    selectorButton.onclick = () => setActivePiano();
    container.appendChild(selectorButton);

    // Store selector button reference
    pianoInstance.selectorButton = selectorButton;

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

      keyEl.addEventListener('mousedown', () => playNoteWithFeedback(key.note));
      keyEl.addEventListener('mouseup', () => stopNoteWithFeedback(key.note));
      keyEl.addEventListener('mouseleave', () => stopNoteWithFeedback(key.note));

      // Prevent drag selection
      keyEl.addEventListener('dragstart', (e) => e.preventDefault());

      keyboardContainer.appendChild(keyEl);
      keyElements[key.note] = keyEl;

      // Register globally for cross-piano highlighting
      if (!allKeyElements[key.note]) {
        allKeyElements[key.note] = [];
      }
      allKeyElements[key.note].push(keyEl);

      // Store in piano instance keyboard map
      if (key.key) {
        pianoInstance.keyboardMap[key.key] = key.note;
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
        playNoteWithFeedback(key.note);
      });
      keyEl.addEventListener('mouseup', () => stopNoteWithFeedback(key.note));
      keyEl.addEventListener('mouseleave', () => stopNoteWithFeedback(key.note));

      // Prevent drag selection
      keyEl.addEventListener('dragstart', (e) => e.preventDefault());

      keyboardContainer.appendChild(keyEl);
      keyElements[key.note] = keyEl;

      // Register globally for cross-piano highlighting
      if (!allKeyElements[key.note]) {
        allKeyElements[key.note] = [];
      }
      allKeyElements[key.note].push(keyEl);

      // Store in piano instance keyboard map
      if (key.key) {
        pianoInstance.keyboardMap[key.key] = key.note;
      }
    });

    // Set this as active piano if it's the first one or if explicitly requested
    if (pianoIndex === 0 || options.setActive) {
      setActivePiano();
    }

    // Add keyboard event listeners (only once globally)
    if (pianoIndex === 0) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
    }

    // Track currently playing melody
    let currentCancelToken = null;
    let currentButton = null;

    // Local melody functions with this piano's keyElements
    async function loadAndPlayMelodyLocal(jsonPath, button) {
      try {
        // If clicking the same button, cancel the melody
        if (currentButton === button && currentCancelToken) {
          currentCancelToken.cancelled = true;
          currentButton.classList.remove('playing');
          currentButton = null;
          currentCancelToken = null;
          return;
        }

        // Cancel any currently playing melody
        if (currentCancelToken) {
          currentCancelToken.cancelled = true;
          if (currentButton) {
            currentButton.classList.remove('playing');
          }
        }

        // Create new cancel token
        currentCancelToken = { cancelled: false };
        currentButton = button;
        button.classList.add('playing');

        const response = await fetch(jsonPath);
        const melody = await response.json();
        await playSequence(melody.notes, melody.durations, keyElements, currentCancelToken);

        // Clean up after melody finishes (if not cancelled)
        if (!currentCancelToken.cancelled) {
          button.classList.remove('playing');
          currentButton = null;
          currentCancelToken = null;
        }
      } catch (error) {
        console.error('Error loading melody:', error);
        if (button) button.classList.remove('playing');
        currentButton = null;
        currentCancelToken = null;
      }
    }

    async function playScaleLocal(button) {
      // If clicking the same button, cancel the scale
      if (currentButton === button && currentCancelToken) {
        currentCancelToken.cancelled = true;
        currentButton.classList.remove('playing');
        currentButton = null;
        currentCancelToken = null;
        return;
      }

      // Cancel any currently playing melody
      if (currentCancelToken) {
        currentCancelToken.cancelled = true;
        if (currentButton) {
          currentButton.classList.remove('playing');
        }
      }

      // Create new cancel token
      currentCancelToken = { cancelled: false };
      currentButton = button;
      button.classList.add('playing');

      const scaleNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
      const scaleDurations = Array(8).fill('8n');
      await playSequence(scaleNotes, scaleDurations, keyElements, currentCancelToken);

      // Clean up after scale finishes (if not cancelled)
      if (!currentCancelToken.cancelled) {
        button.classList.remove('playing');
        currentButton = null;
        currentCancelToken = null;
      }
    }

    // Create control buttons if melodies are provided
    if (options.melodies && options.melodies.length > 0) {
      // Create sheet music containers if showSheetMusic option is true
      if (options.showSheetMusic && window.loadAndGenerateABCSheetMusic) {
        options.melodies.forEach((melody, index) => {
          const sheetContainer = document.createElement('div');
          sheetContainer.className = 'sheet-music-preview';
          sheetContainer.id = `${containerId}-sheet-${index}`;
          container.appendChild(sheetContainer);

          // Load and display sheet music using ABC notation
          window.loadAndGenerateABCSheetMusic(melody.path, sheetContainer.id, {
            scale: 0.7,
            staffwidth: 450
          });
        });
      }

      const controls = document.createElement('div');
      controls.className = 'controls';

      options.melodies.forEach(melody => {
        const button = document.createElement('button');
        button.className = 'play-button';
        button.textContent = melody.label || melody.path;
        button.onclick = () => loadAndPlayMelodyLocal(melody.path, button);
        controls.appendChild(button);
      });

      // Add play scale button
      const scaleButton = document.createElement('button');
      scaleButton.className = 'play-button';
      scaleButton.textContent = 'Play C Major Scale';
      scaleButton.onclick = () => playScaleLocal(scaleButton);
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
      const showSheetMusicAttr = container.getAttribute('data-show-sheet-music');
      const showLiveSheetAttr = container.getAttribute('data-show-live-sheet');

      const options = {};
      if (melodiesAttr) options.melodies = JSON.parse(melodiesAttr);
      if (heightAttr) options.height = parseInt(heightAttr);
      if (startAttr) options.start = startAttr;
      if (endAttr) options.end = endAttr;
      if (showSheetMusicAttr === 'true') options.showSheetMusic = true;
      if (showLiveSheetAttr === 'true') options.showLiveSheet = true;

      initPiano(container.id, options);
    });
  });
})();