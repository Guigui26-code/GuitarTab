const STORAGE_KEY = 'guitartab-v1';
const CHORDS_KEY = 'guitartab-chords-v1';

const TEMPLATE = `e|--------------------------------|
B|--------------------------------|
G|--------------------------------|
D|--------------------------------|
A|--------------------------------|
E|--------------------------------|`;

const TECHS = [
  ['h', 'Hammer-on'],
  ['p', 'Pull-off'],
  ['b', 'Bend'],
  ['/', 'Slide ↑'],
  ['\\', 'Slide ↓'],
  ['x', 'Mute'],
  ['~', 'Vibrato'],
  ['T', 'Tap'],
  ['()', 'Ghost note']
];

let tabs = [];
let editId = null;
let savedChords = [];

let fretDots = {};
let currentFretOffset = 0;
let fingerCounter = 1;

const STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];
const FRET_ROWS = 5;

const SVG_W = 200;
const SVG_H = 190;
const LEFT = 40;
const TOP = 40;
const RIGHT = SVG_W - 20;
const BOTTOM = SVG_H - 20;
const COL_W = (RIGHT - LEFT) / (STRINGS.length - 1);
const ROW_H = (BOTTOM - TOP) / FRET_ROWS;


// ─────────────────────────────────────
// STORAGE
// ─────────────────────────────────────

function loadData() {
  try {
    tabs = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    tabs = [];
  }

  try {
    savedChords = JSON.parse(localStorage.getItem(CHORDS_KEY)) || [];
  } catch {
    savedChords = [];
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tabs));
}

function saveChordsData() {
  localStorage.setItem(CHORDS_KEY, JSON.stringify(savedChords));
}


// ─────────────────────────────────────
// EDITOR
// ─────────────────────────────────────

function showEditor() {
  document.getElementById('list-view').style.display = 'none';
  document.getElementById('editor-view').style.display = 'flex';

  document.getElementById('title-input').classList.remove('invalid');

  resetSaveBtn();
  stopPlayback();
  renderSavedChords();
}

function openNewEditor() {
  editId = null;

  document.getElementById('title-input').value = '';
  document.getElementById('tab-textarea').value = TEMPLATE;

  showEditor();
}

function openExistingTab(id) {
  loadData();

  const tab = tabs.find(t => t.id === id);

  if (!tab) return;

  editId = id;

  document.getElementById('title-input').value = tab.title;
  document.getElementById('tab-textarea').value = tab.content;

  showEditor();
}

function goBackEditor() {
  stopPlayback();

  document.getElementById('editor-view').style.display = 'none';
  document.getElementById('list-view').style.display = 'block';

  // Recharge les données afin que tabs.js voie les sauvegardes
  window.location.reload();
}


// ─────────────────────────────────────
// SAVE
// ─────────────────────────────────────

function onTitleInput() {
  const value = document.getElementById('title-input').value.trim();

  document
    .getElementById('title-input')
    .classList.toggle('invalid', !value);

  document.getElementById('save-btn').disabled = !value;
}

function resetSaveBtn() {
  const btn = document.getElementById('save-btn');

  btn.textContent = '💾 Sauvegarder';
  btn.classList.remove('saved');

  btn.disabled =
    !document.getElementById('title-input').value.trim();
}

function saveTab() {
  const title = document.getElementById('title-input').value.trim();
  const content = document.getElementById('tab-textarea').value;

  if (!title) {
    document.getElementById('title-input').classList.add('invalid');
    return;
  }

  loadData();

  const now = Date.now();

  if (editId) {
    tabs = tabs.map(t =>
      t.id === editId
        ? {
            ...t,
            title,
            content,
            updatedAt: now
          }
        : t
    );
  } else {
    const newTab = {
      id: `tab-${now}`,
      title,
      content,
      createdAt: now,
      updatedAt: now
    };

    tabs = [newTab, ...tabs];
    editId = newTab.id;
  }

  saveData();

  const btn = document.getElementById('save-btn');

  btn.textContent = '✓ Sauvegardé !';
  btn.classList.add('saved');

  setTimeout(resetSaveBtn, 2000);
}


// ─────────────────────────────────────
// INSERTION / TECHNIQUES
// ─────────────────────────────────────

function insertAtCursor(text) {
  const textarea = document.getElementById('tab-textarea');

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  textarea.value =
    textarea.value.slice(0, start) +
    text +
    textarea.value.slice(end);

  textarea.focus();

  textarea.selectionStart =
    textarea.selectionEnd =
      start + text.length;
}

function buildChips() {
  const container = document.getElementById('chips-container');

  container.innerHTML = '';

  TECHS.forEach(([label, description]) => {
    const btn = document.createElement('button');

    btn.className = 'chip';
    btn.title = description;
    btn.textContent = label;

    btn.addEventListener('click', () => {
      insertAtCursor(label);
    });

    container.appendChild(btn);
  });
}


// ─────────────────────────────────────
// ACCORDS — FRETTBOARD
// ─────────────────────────────────────

function renderFretboard() {
  const svg = document.getElementById('fretboard-svg');

  if (!svg) return;

  svg.innerHTML = '';

  const offset =
    parseInt(document.getElementById('fret-offset').value) || 0;

  currentFretOffset = offset;

  // Fond
  const bg = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'rect'
  );

  bg.setAttribute('x', 0);
  bg.setAttribute('y', 0);
  bg.setAttribute('width', SVG_W);
  bg.setAttribute('height', SVG_H);
  bg.setAttribute('fill', '#161616');

  svg.appendChild(bg);


  // Nut
  if (offset === 0) {
    const nut = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );

    nut.setAttribute('x', LEFT - 3);
    nut.setAttribute('y', TOP - 3);
    nut.setAttribute('width', RIGHT - LEFT + 6);
    nut.setAttribute('height', 5);
    nut.setAttribute('fill', '#e8a020');

    svg.appendChild(nut);
  }


  // Frettes
  for (let r = 0; r <= FRET_ROWS; r++) {
    const line = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );

    const y = TOP + r * ROW_H;

    line.setAttribute('x1', LEFT);
    line.setAttribute('y1', y);
    line.setAttribute('x2', RIGHT);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', '#555');
    line.setAttribute('stroke-width', r === 0 ? 2 : 1);

    svg.appendChild(line);
  }


  // Numéros de cases
  for (let r = 0; r < FRET_ROWS; r++) {
    const text = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );

    text.setAttribute('x', RIGHT + 8);
    text.setAttribute('y', TOP + r * ROW_H + ROW_H * 0.65);
    text.setAttribute('fill', '#888');
    text.setAttribute('font-size', '10');
    text.textContent = offset + r + 1;

    svg.appendChild(text);
  }


  // Cordes
  STRINGS.forEach((stringName, i) => {
    const x = LEFT + i * COL_W;

    const line = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );

    line.setAttribute('x1', x);
    line.setAttribute('y1', TOP);
    line.setAttribute('x2', x);
    line.setAttribute('y2', BOTTOM);
    line.setAttribute('stroke', '#aaa');
    line.setAttribute('stroke-width', i < 3 ? 1 : 1.5);

    svg.appendChild(line);

    const label = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'text'
    );

    label.setAttribute('x', x);
    label.setAttribute('y', 24);
    label.setAttribute('fill', '#e8a020');
    label.setAttribute('font-size', '12');
    label.setAttribute('text-anchor', 'middle');
    label.textContent = stringName;

    svg.appendChild(label);
  });


  // États open / mute
  STRINGS.forEach((stringName, i) => {
    const data = fretDots[i];

    if (!data || data.fret === 0) {
      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );

      text.setAttribute('x', LEFT + i * COL_W);
      text.setAttribute('y', TOP - 12);
      text.setAttribute('fill', '#f0ece6');
      text.setAttribute('font-size', '15');
      text.setAttribute('text-anchor', 'middle');

      text.textContent =
        data && data.muted ? '✕' : '○';

      svg.appendChild(text);
    }
  });


  // Doigts
  Object.entries(fretDots).forEach(([index, data]) => {
    if (!data || data.fret <= 0) return;

    const i = parseInt(index);
    const row = data.fret - offset - 1;

    if (row < 0 || row >= FRET_ROWS) return;

    const x = LEFT + i * COL_W;
    const y = TOP + row * ROW_H + ROW_H / 2;

    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );

    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', 9);
    circle.setAttribute('fill', '#e8a020');

    svg.appendChild(circle);

    if (data.finger) {
      const number = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );

      number.setAttribute('x', x);
      number.setAttribute('y', y + 4);
      number.setAttribute('fill', '#000');
      number.setAttribute('font-size', '10');
      number.setAttribute('font-weight', 'bold');
      number.setAttribute('text-anchor', 'middle');
      number.textContent = data.finger;

      svg.appendChild(number);
    }
  });


  // Zones de clic
  STRINGS.forEach((_, i) => {
    const x = LEFT + i * COL_W;

    for (let row = 0; row < FRET_ROWS; row++) {
      const rect = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      );

      rect.setAttribute('x', x - COL_W / 2);
      rect.setAttribute('y', TOP + row * ROW_H);
      rect.setAttribute('width', COL_W);
      rect.setAttribute('height', ROW_H);
      rect.setAttribute('fill', 'transparent');

      rect.addEventListener('click', () => {
        const fret = offset + row + 1;
        const finger = nextFinger();

        if (!finger) return;

        fretDots[i] = {
          fret,
          finger,
          muted: false
        };

        renderFretboard();
      });

      rect.addEventListener('contextmenu', e => {
        e.preventDefault();

        fretDots[i] = {
          fret: 0,
          muted: false
        };

        renderFretboard();
      });

      rect.addEventListener('dblclick', e => {
        e.preventDefault();

        fretDots[i] = {
          fret: 0,
          muted: true
        };

        renderFretboard();
      });

      svg.appendChild(rect);
    }
  });


  // Clic sur les cordes ouvertes / muettes
  STRINGS.forEach((_, i) => {
    const x = LEFT + i * COL_W;

    const rect = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'rect'
    );

    rect.setAttribute('x', x - COL_W / 2);
    rect.setAttribute('y', 0);
    rect.setAttribute('width', COL_W);
    rect.setAttribute('height', TOP);
    rect.setAttribute('fill', 'transparent');

    rect.addEventListener('click', () => {
      fretDots[i] = {
        fret: 0,
        muted: false
      };

      renderFretboard();
    });

    rect.addEventListener('dblclick', () => {
      fretDots[i] = {
        fret: 0,
        muted: true
      };

      renderFretboard();
    });

    svg.appendChild(rect);
  });
}


function nextFinger() {
  const used = Object.values(fretDots)
    .filter(d => d && d.fret > 0)
    .map(d => d.finger)
    .filter(Boolean);

  for (let n = 1; n <= 4; n++) {
    if (!used.includes(n)) return n;
  }

  return null;
}

function clearFretboard() {
  fretDots = {};
  fingerCounter = 1;
  renderFretboard();
}


// ─────────────────────────────────────
// ACCORDS SAUVEGARDÉS
// ─────────────────────────────────────

function addChordToSaved() {
  const name =
    document.getElementById('chord-name').value.trim();

  if (!name) {
    document.getElementById('chord-name').focus();
    return;
  }

  const svg = document.getElementById('fretboard-svg');

  const miniSvg = svg.cloneNode(true);

  miniSvg.setAttribute('width', '80');
  miniSvg.setAttribute('height', '76');
  miniSvg.setAttribute(
    'viewBox',
    `0 0 ${SVG_W} ${SVG_H}`
  );

  const chord = {
    id: `chord-${Date.now()}`,
    name,
    dots: { ...fretDots },
    offset:
      parseInt(
        document.getElementById('fret-offset').value
      ) || 0,
    miniSvgHTML: miniSvg.outerHTML
  };

  savedChords.unshift(chord);

  saveChordsData();
  renderSavedChords();

  clearFretboard();

  document.getElementById('chord-name').value = '';
}

function renderSavedChords() {
  const list =
    document.getElementById('saved-chords-list');

  if (!list) return;

  list.innerHTML = '';

  savedChords.forEach(chord => {
    const item = document.createElement('div');

    item.className = 'saved-chord-item';

    const mini = document.createElement('div');

    mini.className = 'saved-chord-mini';
    mini.innerHTML = chord.miniSvgHTML || '';

    const info = document.createElement('div');

    info.className = 'saved-chord-info';

    const name = document.createElement('div');

    name.className = 'saved-chord-name';
    name.textContent = chord.name;

    info.appendChild(name);

    const del = document.createElement('button');

    del.className = 'saved-chord-del';
    del.textContent = '×';
    del.title = 'Supprimer';

    del.addEventListener('click', e => {
      e.stopPropagation();

      savedChords =
        savedChords.filter(c => c.id !== chord.id);

      saveChordsData();
      renderSavedChords();
    });

    item.append(mini, info, del);

    item.addEventListener('click', () => {
      fretDots = { ...chord.dots };

      document.getElementById('fret-offset').value =
        chord.offset;

      document.getElementById('chord-name').value =
        chord.name;

      renderFretboard();
    });

    list.appendChild(item);
  });
}


// ─────────────────────────────────────
// PLAYBACK
// ─────────────────────────────────────

let audioCtx = null;
let playInterval = null;
let isPlaying = false;
let currentBeat = 0;

function getAudioCtx() {
  if (!audioCtx) {
    audioCtx =
      new (
        window.AudioContext ||
        window.webkitAudioContext
      )();
  }

  return audioCtx;
}

const TUNINGS = {
  standard: [329.63, 246.94, 196.00, 146.83, 110.00, 82.41],
  dropD: [329.63, 246.94, 196.00, 146.83, 110.00, 73.42],
  openG: [293.66, 246.94, 196.00, 146.83, 98.00, 73.42],
  dadgad: [293.66, 220.00, 196.00, 146.83, 110.00, 73.42],
  halfDown: [311.13, 233.08, 185.00, 138.59, 103.83, 77.78]
};

function playNote(freq, duration, vol) {
  const ctx = getAudioCtx();

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.value = freq;
  osc.type = 'triangle';

  gain.gain.setValueAtTime(
    vol * 0.4,
    ctx.currentTime
  );

  gain.gain.exponentialRampToValueAtTime(
    0.001,
    ctx.currentTime + duration
  );

  osc.start();
  osc.stop(ctx.currentTime + duration);
}


function parseTablature() {
  const content =
    document.getElementById('tab-textarea').value;

  const tuning =
    TUNINGS[
      document.getElementById('tuning-select').value
    ] || TUNINGS.standard;

  const lines = content.split('\n');

  const result = [];

  for (let i = 0; i < lines.length - 5; i++) {
    const block = lines.slice(i, i + 6);

    if (!/^[eEBGDAd]\|/.test(block[0])) {
      continue;
    }

    if (!block.every(line => /^[eEBGDAd]\|/.test(line))) {
      continue;
    }

    const data = block.map(line =>
      line.slice(2)
    );

    const maxLen =
      Math.max(...data.map(line => line.length));

    for (let col = 0; col < maxLen; col++) {
      const notes = [];

      for (let string = 0; string < 6; string++) {
        const char = data[string][col];

        if (char && /\d/.test(char)) {
          let number = char;

          if (
            col + 1 < data[string].length &&
            /\d/.test(data[string][col + 1])
          ) {
            number += data[string][col + 1];
          }

          const fret = parseInt(number);

          if (!isNaN(fret)) {
            const freq =
              tuning[string] *
              Math.pow(2, fret / 12);

            notes.push(freq);
          }
        }
      }

      if (notes.length > 0) {
        result.push(notes);
      }
    }

    i += 5;
  }

  return result;
}


function startPlayback() {
  const bpm =
    parseInt(
      document.getElementById('bpm-input').value
    ) || 120;

  const volume =
    parseFloat(
      document.getElementById('vol-slider').value
    ) || 0.7;

  const notes = parseTablature();

  if (!notes.length) {
    document.getElementById('play-status').textContent =
      'Aucune note trouvée';

    return;
  }

  const ctx = getAudioCtx();

  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  isPlaying = true;
  currentBeat = 0;

  document.getElementById('play-btn').textContent = '⏸';

  const interval =
    60000 / bpm;

  playInterval = setInterval(() => {
    if (currentBeat >= notes.length) {
      stopPlayback();
      return;
    }

    const chord = notes[currentBeat];

    chord.forEach(freq => {
      playNote(
        freq,
        Math.max(0.08, interval / 1000 * 0.8),
        volume
      );
    });

    document.getElementById('play-status').textContent =
      `Mesure ${currentBeat + 1} / ${notes.length}`;

    currentBeat++;
  }, interval);

  // Première note immédiatement
  const firstChord = notes[0];

  firstChord.forEach(freq => {
    playNote(
      freq,
      Math.max(0.08, interval / 1000 * 0.8),
      volume
    );
  });

  currentBeat = 1;
}


function stopPlayback() {
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }

  isPlaying = false;
  currentBeat = 0;

  const playBtn =
    document.getElementById('play-btn');

  if (playBtn) {
    playBtn.textContent = '▶';
  }

  const status =
    document.getElementById('play-status');

  if (status) {
    status.textContent = '—';
  }
}


// ─────────────────────────────────────
// EXPORT TXT
// ─────────────────────────────────────

function exportTXT() {
  const title =
    document.getElementById('title-input')
      .value.trim() || 'partition';

  const content =
    document.getElementById('tab-textarea').value;

  const blob =
    new Blob([content], {
      type: 'text/plain'
    });

  const a =
    document.createElement('a');

  a.href =
    URL.createObjectURL(blob);

  a.download =
    title.replace(/[^a-z0-9]/gi, '_') +
    '.txt';

  a.click();

  URL.revokeObjectURL(a.href);
}


// ─────────────────────────────────────
// EXPORT PNG
// ─────────────────────────────────────

function exportPNG() {
  const title =
    document.getElementById('title-input')
      .value.trim() || 'partition';

  const content =
    document.getElementById('tab-textarea').value;

  const lines = content.split('\n');

  const canvas =
    document.createElement('canvas');

  const scale = 2;
  const lineH = 28;
  const padX = 36;
  const padY = 50;
  const footerH = 50;

  const maxLen =
    Math.max(
      ...lines.map(l => l.length),
      title.length + 5,
      30
    );

  const W =
    Math.max(
      maxLen * 10 + padX * 2,
      600
    );

  const H =
    lines.length * lineH +
    padY +
    footerH +
    20;

  canvas.width = W * scale;
  canvas.height = H * scale;

  const ctx = canvas.getContext('2d');

  ctx.scale(scale, scale);

  ctx.fillStyle = '#0c0c0c';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#e8a020';
  ctx.font =
    'bold 22px "Bebas Neue", serif';

  ctx.fillText(
    '🎸 ' + title,
    padX,
    36
  );

  ctx.fillStyle = '#444';

  ctx.fillRect(
    padX,
    44,
    W - padX * 2,
    1
  );

  ctx.font =
    '13px "JetBrains Mono", "Courier New", monospace';

  ctx.fillStyle = '#f0ece6';

  lines.forEach((line, i) => {
    ctx.fillText(
      line,
      padX,
      padY + 14 + i * lineH
    );
  });

  ctx.fillStyle = '#444';

  ctx.fillRect(
    padX,
    H - footerH,
    W - padX * 2,
    1
  );

  ctx.font =
    '10px "Outfit", sans-serif';

  ctx.fillStyle = '#555';

  ctx.fillText(
    'Créé avec 🎸 GuitarTab',
    padX,
    H - footerH + 18
  );

  ctx.fillText(
    new Date().toLocaleDateString('fr-FR'),
    W - padX - 60,
    H - footerH + 18
  );

  canvas.toBlob(blob => {
    const a =
      document.createElement('a');

    a.href =
      URL.createObjectURL(blob);

    a.download =
      title.replace(/[^a-z0-9]/gi, '_') +
      '.png';

    a.click();

    URL.revokeObjectURL(a.href);
  });
}


// ─────────────────────────────────────
// INITIALISATION
// ─────────────────────────────────────

function initEditor() {
  loadData();
  buildChips();
  renderSavedChords();

  document
    .getElementById('new-btn')
    ?.addEventListener('click', openNewEditor);

  document
    .getElementById('back-btn')
    ?.addEventListener('click', goBackEditor);

  document
    .getElementById('save-btn')
    ?.addEventListener('click', saveTab);

  document
    .getElementById('title-input')
    ?.addEventListener('input', onTitleInput);

  document
    .getElementById('template-btn')
    ?.addEventListener('click', () => {
      insertAtCursor('\n\n' + TEMPLATE);
    });


  // Playback
  document
    .getElementById('play-btn')
    ?.addEventListener('click', () => {
      if (isPlaying) {
        stopPlayback();
      } else {
        startPlayback();
      }
    });

  document
    .getElementById('stop-btn')
    ?.addEventListener('click', stopPlayback);


  // Export
  document
    .getElementById('export-png-btn')
    ?.addEventListener('click', exportPNG);

  document
    .getElementById('export-txt-btn')
    ?.addEventListener('click', exportTXT);


  // Chord panel
  document
    .getElementById('toggle-chord-panel')
    ?.addEventListener('click', () => {
      const panel =
        document.getElementById('chord-panel');

      const visible =
        panel.style.display !== 'none';

      panel.style.display =
        visible ? 'none' : 'flex';

      if (!visible) {
        renderFretboard();
        renderSavedChords();
      }
    });

  document
    .getElementById('close-chord-panel')
    ?.addEventListener('click', () => {
      document.getElementById('chord-panel').style.display =
        'none';
    });

  document
    .getElementById('fret-offset')
    ?.addEventListener('change', renderFretboard);

  document
    .getElementById('add-chord-btn')
    ?.addEventListener('click', addChordToSaved);

  document
    .getElementById('clear-chord-btn')
    ?.addEventListener('click', clearFretboard);
}

export {
  initEditor,
  openExistingTab
};
