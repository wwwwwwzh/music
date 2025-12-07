/**
 * Markdown-centric melody system with custom tags
 * Usage: <melody path="/assets/motifs/song.json" sheet></melody>
 *        <global-piano height="180" start="C3" end="C6"></global-piano>
 */
(function() {
  // Create stronger, longer-lasting piano tone
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
      type: 'triangle'
    },
    envelope: {
      attack: 0.005,
      decay: 0.3,
      sustain: 0.6,  // Higher sustain for longer tone
      release: 2.5   // Longer release for sustained sound
    },
    volume: 2  // Louder
  }).toDestination();

  let globalPiano = null;
  const keyboardMap = {};
  const activeKeys = new Set();
  const allKeyElements = {};
  const recentNotes = [];
  const maxRecentNotes = 12;
  let currentMelodyPlaying = null; // Track currently playing melody
  let stopMelodyFlag = false; // Flag to stop melody playback

  // Parse note index for sorting
  function noteIndex(noteStr) {
    const match = noteStr.match(/^([A-G]#?)(\d+)$/);
    if (!match) return -1;
    const noteOrder = { 'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11 };
    return parseInt(match[2]) * 12 + noteOrder[match[1]];
  }

  // Generate piano keys in range
  function generateKeysInRange(startNote, endNote) {
    const allNotes = [];
    const octaves = [2, 3, 4, 5, 6, 7, 8];
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackNotes = ['C#', 'D#', null, 'F#', 'G#', 'A#', null];

    octaves.forEach(octave => {
      whiteNotes.forEach((note, idx) => {
        allNotes.push({ note: `${note}${octave}`, type: 'white' });
        if (blackNotes[idx]) {
          allNotes.push({ note: `${blackNotes[idx]}${octave}`, type: 'black' });
        }
      });
    });

    const startIdx = noteIndex(startNote);
    const endIdx = noteIndex(endNote);

    return allNotes.filter(({ note }) => {
      const idx = noteIndex(note);
      return idx >= startIdx && idx <= endIdx;
    });
  }

  // Play note
  function playNote(note) {
    if (activeKeys.has(note)) return;
    activeKeys.add(note);
    synth.triggerAttack(note);
    if (allKeyElements[note]) allKeyElements[note].classList.add('active');
    addToRecentNotes(note);
  }

  function stopNote(note) {
    activeKeys.delete(note);
    synth.triggerRelease(note);
    if (allKeyElements[note]) allKeyElements[note].classList.remove('active');
  }

  function addToRecentNotes(note) {
    recentNotes.push(note);
    if (recentNotes.length > maxRecentNotes) recentNotes.shift();
    updateLiveSheet();
  }

  function updateLiveSheet() {
    if (!globalPiano || !globalPiano.liveSheetContainer) return;
    const container = globalPiano.liveSheetContainer;

    if (recentNotes.length === 0) {
      container.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">Play some notes!</div>';
      return;
    }

    if (window.generateABCSheetMusic) {
      const melody = {
        notes: recentNotes.slice(),
        durations: recentNotes.map(() => '4n')
      };
      container.innerHTML = '';
      window.generateABCSheetMusic(melody, container.id, { scale: 0.65, staffwidth: 600 });
    }
  }

  function updateKeyboardBindings() {
    if (!globalPiano) return;

    const whiteKeyBindings = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'"];
    const blackKeyBindings = ['w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'];

    Object.keys(keyboardMap).forEach(k => delete keyboardMap[k]);

    const keysContainer = globalPiano.keysContainer;
    const scrollContainer = document.querySelector('#global-piano-scroll-container');
    const scrollLeft = scrollContainer.scrollLeft;
    const viewportWidth = scrollContainer.clientWidth;

    // Find keys that are visible in the viewport
    const allWhiteKeys = Array.from(keysContainer.querySelectorAll('.white-key'));
    const allBlackKeys = Array.from(keysContainer.querySelectorAll('.black-key'));

    // Filter to fully visible keys (not partially cut off) based on scroll position
    const visibleWhiteKeys = allWhiteKeys.filter(keyEl => {
      const keyLeft = parseFloat(keyEl.style.left);
      const keyRight = keyLeft + 40; // White key width
      // Key must be FULLY visible (both left and right edges inside viewport)
      return keyLeft >= scrollLeft && keyRight <= scrollLeft + viewportWidth;
    });

    const visibleBlackKeys = allBlackKeys.filter(keyEl => {
      const keyLeft = parseFloat(keyEl.style.left);
      const keyRight = keyLeft + 28; // Black key width
      // Key must be FULLY visible (both left and right edges inside viewport)
      return keyLeft >= scrollLeft && keyRight <= scrollLeft + viewportWidth;
    });

    // Clear all labels first
    allWhiteKeys.forEach(keyEl => {
      const label = keyEl.querySelector('.key-label');
      if (label) label.textContent = '';
    });
    allBlackKeys.forEach(keyEl => {
      const label = keyEl.querySelector('.key-label');
      if (label) label.textContent = '';
    });

    // Bind to visible keys
    visibleWhiteKeys.slice(0, whiteKeyBindings.length).forEach((keyEl, idx) => {
      const note = keyEl.dataset.note;
      keyboardMap[whiteKeyBindings[idx]] = note;
      const label = keyEl.querySelector('.key-label');
      if (label) label.textContent = whiteKeyBindings[idx].toUpperCase();
    });

    visibleBlackKeys.slice(0, blackKeyBindings.length).forEach((keyEl, idx) => {
      const note = keyEl.dataset.note;
      keyboardMap[blackKeyBindings[idx]] = note;
      const label = keyEl.querySelector('.key-label');
      if (label) label.textContent = blackKeyBindings[idx].toUpperCase();
    });
  }

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

  // Create global piano from tag
  function createGlobalPiano(element) {
    const height = parseInt(element.getAttribute('height')) || 180;
    const startNote = element.getAttribute('start') || 'C4';

    const container = document.createElement('div');
    container.id = 'global-piano-floating';
    container.innerHTML = `
      <div id="global-piano-live-sheet"></div>
      <div id="global-piano-controls">
        <button id="clear-notes-btn" title="Clear played notes">🗑️</button>
        <button id="toggle-piano-btn" title="Hide/Show Piano">👁️</button>
        <span style="margin-left: 10px; font-size: 12px; color: #666;">Use keyboard: A-L (white) W-E-R-T-Y-U-I-O-P (black)</span>
      </div>
      <div id="global-piano-scroll-container" style="height: ${height}px;">
        <div id="global-piano-keys"></div>
      </div>
    `;

    document.body.appendChild(container);

    // Add bottom padding to body so content doesn't get hidden behind piano
    const pianoHeight = height + 120; // height + live sheet + controls
    document.body.style.paddingBottom = `${pianoHeight}px`;

    const keysContainer = container.querySelector('#global-piano-keys');
    const liveSheetContainer = container.querySelector('#global-piano-live-sheet');
    liveSheetContainer.id = 'global-piano-live-sheet-' + Date.now();

    // Always generate full range C2-C8
    const keys = generateKeysInRange('C2', 'C8');
    let whiteKeyCount = 0;

    keys.forEach(({ note, type }) => {
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
        keyEl.style.left = `${(whiteKeyCount * 40) - 14}px`;
      }

      keysContainer.appendChild(keyEl);
      allKeyElements[note] = keyEl;
    });

    keysContainer.style.width = `${whiteKeyCount * 40}px`;
    keysContainer.style.height = `${height - 20}px`;
    keysContainer.style.paddingLeft = '200px'; // Add left padding so you can scroll before start key
    keysContainer.style.marginRight = '600px'; // Add more right padding so keyboard can reach rightmost keys

    // Scroll to starting note
    const startKey = keysContainer.querySelector(`[data-note="${startNote}"]`);
    const scrollContainer = container.querySelector('#global-piano-scroll-container');

    if (startKey) {
      setTimeout(() => {
        // Scroll so start key is at the LEFT edge of viewport (leftmost visible key)
        const keyLeft = parseFloat(startKey.style.left);
        scrollContainer.scrollLeft = keyLeft; // Don't add padding - we want raw position
        updateKeyboardBindings();
      }, 100);
    }

    // Add scroll listener for dynamic bindings
    scrollContainer.addEventListener('scroll', () => {
      clearTimeout(scrollContainer.scrollTimeout);
      scrollContainer.scrollTimeout = setTimeout(updateKeyboardBindings, 200);
    });

    container.querySelector('#clear-notes-btn').addEventListener('click', () => {
      recentNotes.length = 0;
      updateLiveSheet();
    });

    const toggleBtn = container.querySelector('#toggle-piano-btn');
    toggleBtn.addEventListener('click', () => {
      const scrollContainer = container.querySelector('#global-piano-scroll-container');
      if (scrollContainer.style.display === 'none') {
        // Show piano
        scrollContainer.style.display = 'block';
        toggleBtn.textContent = '👁️';
        toggleBtn.title = 'Hide Piano';
        document.body.style.paddingBottom = `${pianoHeight}px`;
      } else {
        // Hide piano
        scrollContainer.style.display = 'none';
        toggleBtn.textContent = '👁️‍🗨️';
        toggleBtn.title = 'Show Piano';
        document.body.style.paddingBottom = '120px'; // Just controls + live sheet
      }
    });

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    globalPiano = { container, keysContainer, liveSheetContainer };
    element.style.display = 'none'; // Hide the tag itself
  }

  // Parse simple text format melody file
  async function parseTextMelody(text) {
    const lines = text.trim().split('\n').map(line => line.trim()).filter(line => line);

    if (lines.length < 2) {
      throw new Error('Text melody must have at least key and time signature');
    }

    const key = lines[0];
    const timeSignature = lines[1];
    const notes = [];
    const durations = [];

    // Parse note lines (format: "A4:4n" or "rest:4n")
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(':');

      if (parts.length !== 2) {
        console.warn(`Skipping invalid line: ${line}`);
        continue;
      }

      const note = parts[0].trim();
      const duration = parts[1].trim();

      notes.push(note);
      durations.push(duration);
    }

    return {
      key,
      timeSignature,
      notes,
      durations
    };
  }

  // Load melody from path (supports .json and .txt)
  async function loadMelody(path) {
    const response = await fetch(path);

    if (path.endsWith('.txt')) {
      const text = await response.text();
      return parseTextMelody(text);
    } else {
      return await response.json();
    }
  }

  // Create melody button from tag
  async function createMelodyButton(element) {
    const path = element.getAttribute('path');
    const showSheet = element.hasAttribute('sheet');
    const label = element.getAttribute('label') || element.textContent || 'Play';

    if (!path) {
      console.error('Melody tag missing path attribute');
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'melody-wrapper';

    // Show sheet music if requested
    if (showSheet && window.loadAndGenerateABCSheetMusic) {
      const sheetDiv = document.createElement('div');
      sheetDiv.className = 'melody-sheet-preview';
      sheetDiv.id = 'melody-sheet-' + Math.random().toString(36).substr(2, 9);
      wrapper.appendChild(sheetDiv);

      // Load sheet music
      setTimeout(() => {
        window.loadAndGenerateABCSheetMusic(path, sheetDiv.id, {
          scale: 0.7,
          staffwidth: 500
        });
      }, 100);
    }

    // Create button
    const button = document.createElement('button');
    button.className = 'melody-button';
    button.textContent = label;
    button.onclick = async () => {
      // If this button is already playing, stop it
      if (currentMelodyPlaying === button) {
        stopMelodyFlag = true;
        currentMelodyPlaying = null;
        button.style.opacity = '1';
        return;
      }

      // Stop any currently playing melody
      if (currentMelodyPlaying) {
        stopMelodyFlag = true;
        currentMelodyPlaying.style.opacity = '1';
        // Wait a bit for the previous melody to stop
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Start playing this melody
      currentMelodyPlaying = button;
      stopMelodyFlag = false;
      button.style.opacity = '0.6';

      try {
        const melody = await loadMelody(path);

        for (let i = 0; i < melody.notes.length; i++) {
          // Check if we should stop (this button was stopped by another)
          if (stopMelodyFlag || currentMelodyPlaying !== button) {
            break;
          }

          const note = melody.notes[i];
          const duration = melody.durations[i];

          if (note !== 'rest') {
            synth.triggerAttackRelease(note, duration);
            if (allKeyElements[note]) allKeyElements[note].classList.add('active');
            addToRecentNotes(note);
          }

          await new Promise(resolve => setTimeout(resolve, Tone.Time(duration).toMilliseconds()));

          if (note !== 'rest' && allKeyElements[note]) {
            allKeyElements[note].classList.remove('active');
          }
        }

        // Finished playing (or stopped)
        if (currentMelodyPlaying === button) {
          currentMelodyPlaying = null;
          button.style.opacity = '1';
        }
      } catch (error) {
        console.error('Error playing melody:', error);
        if (currentMelodyPlaying === button) {
          currentMelodyPlaying = null;
          button.style.opacity = '1';
        }
      }
    };

    wrapper.appendChild(button);
    element.replaceWith(wrapper);
  }

  // Initialize all custom tags
  function initializeTags() {
    // Initialize global piano
    const pianotags = document.querySelectorAll('global-piano');
    if (pianotags.length > 0) {
      createGlobalPiano(pianotags[0]); // Only use first instance
    }

    // Initialize melody tags
    document.querySelectorAll('melody').forEach(createMelodyButton);
  }

  // Run on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTags);
  } else {
    initializeTags();
  }
})();
