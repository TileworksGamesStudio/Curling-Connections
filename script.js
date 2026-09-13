(function () {
  'use strict';

  // Config & Constants
  const STORAGE_KEY = 'connections_save_v1';
  const MAX_MISTAKES = 4;
  const LEVEL_EMOJIS = { 1: '🟨', 2: '🟩', 3: '🟦', 4: '🟥' };
  const HOME_PLACEHOLDER_URL = 'https://tileworksgamesstudio.github.io/Curling-Menu/';

  // Runtime State
  let puzzles = [];
  let todayPuzzle = null;
  let activePuzzle = null;
  let isArchiveMode = false;

  let unsolvedWords = [];
  let selectedWords = [];
  let solvedCategories = [];
  let mistakesRemaining = MAX_MISTAKES;
  let guessHistory = [];
  let isComplete = false;
  let isWon = false;

  // DOM Elements
  const screens = {
    menu: document.getElementById('screen-menu'),
    game: document.getElementById('screen-game'),
    vault: document.getElementById('screen-vault')
  };

  const dom = {
    toast: document.getElementById('toast'),
    menuDate: document.getElementById('menu-date'),
    menuStatus: document.getElementById('menu-status'),
    btnPlayToday: document.getElementById('btn-play-today'),
    btnOpenVault: document.getElementById('btn-open-vault'),
    btnHome: document.getElementById('btn-home'),
    btnGameBack: document.getElementById('btn-game-back'),
    btnVaultBack: document.getElementById('btn-vault-back'),
    gamePuzzleTitle: document.getElementById('game-puzzle-title'),
    solvedStack: document.getElementById('solved-stack'),
    grid: document.getElementById('grid'),
    mistakeDots: document.getElementById('mistake-dots'),
    btnShuffle: document.getElementById('btn-shuffle'),
    btnDeselect: document.getElementById('btn-deselect'),
    btnSubmit: document.getElementById('btn-submit'),
    vaultList: document.getElementById('vault-list'),
    modalHelp: document.getElementById('modal-help'),
    modalStats: document.getElementById('modal-stats'),
    modalResult: document.getElementById('modal-result'),
    btnHelp: document.getElementById('btn-help'),
    btnStats: document.getElementById('btn-stats'),
    btnShare: document.getElementById('btn-share'),
    btnResultMenu: document.getElementById('btn-result-menu'),
    resultMsg: document.getElementById('result-msg'),
    resultGrid: document.getElementById('result-grid'),
    statPlayed: document.getElementById('stat-played'),
    statWinPct: document.getElementById('stat-win-pct'),
    statStreak: document.getElementById('stat-streak'),
    statMaxStreak: document.getElementById('stat-max-streak'),
    ambientLayer: document.getElementById('ambient-curling-layer'),
    btnSoundToggle: document.getElementById('btn-sound-toggle')
  };

  // =========================================================================
  // LUXURY WEB AUDIO SOUND SYSTEM (Subtle, Safe, Synthesized)
  // =========================================================================
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      try {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioClass();
      } catch (e) {
        soundEnabled = false;
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
  }

  function playUiSound(type) {
    if (!soundEnabled || !audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') {
        audioCtx.resume().catch(() => {});
      }
      const now = audioCtx.currentTime;

      if (type === 'tick') {
        // High crisp contact tick (Stone touch)
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.025);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.025);
      } else if (type === 'stone-tap') {
        // Muted curling stone impact
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.07);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'nav') {
        // Ice glide frequency shimmer
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'success') {
        // Two-tone bell harmonic chime
        [523.25, 659.25].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          gain.gain.setValueAtTime(0.09, now + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.28);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.28);
        });
      } else if (type === 'error') {
        // Muted low warning bump
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.linearRampToValueAtTime(95, now + 0.15);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'win') {
        // 3-note victory championship flourish
        [440, 554.37, 659.25].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.12, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.4);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.4);
        });
      }
    } catch (e) {
      // Fail silently without disrupting user interaction
    }
  }

  // =========================================================================
  // 12 DISTINCT CURLING ICONS + AUTHORITATIVE MAPLE LEAF SYSTEM
  // =========================================================================
  const CURLING_ICONS = [
    // 1. Curling Stone
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="50" cy="65" rx="38" ry="22"/><ellipse cx="50" cy="58" rx="28" ry="14"/><path d="M42 50 V34 H64 V44"/></svg>',
    // 2. Curling House / Rings
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="4"><circle cx="50" cy="50" r="44"/><circle cx="50" cy="50" r="30"/><circle cx="50" cy="50" r="16"/><circle cx="50" cy="50" r="5" fill="currentColor"/><line x1="50" y1="2" x2="50" y2="98" stroke-width="2"/><line x1="2" y1="50" x2="98" y2="50" stroke-width="2"/></svg>',
    // 3. Curling Broom
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><line x1="82" y1="18" x2="36" y2="68"/><rect x="18" y="66" width="30" height="14" rx="3" transform="rotate(-35 33 73)" fill="currentColor"/></svg>',
    // 4. Brush Head
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><rect x="15" y="32" width="70" height="36" rx="8"/><line x1="28" y1="32" x2="28" y2="68"/><line x1="50" y1="32" x2="50" y2="68"/><line x1="72" y1="32" x2="72" y2="68"/><circle cx="50" cy="22" r="6"/></svg>',
    // 5. Hack
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round"><rect x="22" y="35" width="22" height="38" rx="3"/><rect x="56" y="35" width="22" height="38" rx="3"/><line x1="22" y1="46" x2="44" y2="46"/><line x1="56" y1="46" x2="78" y2="46"/><line x1="12" y1="78" x2="88" y2="78" stroke-width="6"/></svg>',
    // 6. Curling Stone Handle
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 68 V45 C22 36 28 32 38 32 H62 C72 32 78 36 78 45 V54"/></svg>',
    // 7. Hog Line
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="8"><line x1="10" y1="50" x2="90" y2="50"/><line x1="25" y1="35" x2="25" y2="65" stroke-width="4"/><line x1="75" y1="35" x2="75" y2="65" stroke-width="4"/></svg>',
    // 8. Back Line
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><line x1="8" y1="50" x2="92" y2="50" stroke-dasharray="8 6"/><circle cx="50" cy="50" r="12"/></svg>',
    // 9. Centre Line
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><line x1="50" y1="6" x2="50" y2="94"/><line x1="30" y1="50" x2="70" y2="50" stroke-width="3"/></svg>',
    // 10. Curling Pebble Motif
    '<svg viewBox="0 0 100 100" fill="currentColor"><circle cx="28" cy="30" r="6"/><circle cx="70" cy="24" r="8"/><circle cx="48" cy="52" r="7"/><circle cx="26" cy="74" r="5"/><circle cx="76" cy="68" r="9"/></svg>',
    // 11. Scoreboard / End Marker
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5"><rect x="18" y="20" width="64" height="60" rx="4"/><line x1="18" y1="42" x2="82" y2="42"/><line x1="50" y1="20" x2="50" y2="80"/></svg>',
    // 12. Skip / Throwing Delivery Silhouette
    '<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="68" cy="30" r="9" fill="currentColor"/><path d="M62 42 L46 54 L20 60"/><path d="M46 54 L52 74 L78 74"/><circle cx="20" cy="68" r="7" fill="currentColor"/></svg>'
  ];

  // Mandatory Authoritative Maple Leaf SVG Renderer (Derived from Section 65.6)
  function renderAuthoritativeMapleLeaf() {
    return `<svg viewBox="0 0 298.72 341.12" aria-hidden="true" focusable="false"><use href="#authoritative-maple-leaf" /></svg>`;
  }

  function spawnAmbientMotif() {
    if (!dom.ambientLayer) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Keep active element count strictly controlled
    if (dom.ambientLayer.childElementCount > 18) return;

    const el = document.createElement('div');
    el.className = 'floating-motif';

    // 3 Perceived Depth Tiers: Distant, Middle, Near
    const depthRoll = Math.random();
    let depthClass = 'motif-depth-mid';
    let baseSize = 34;
    let opacity = 0.28;
    let duration = 24 + Math.random() * 12;

    if (depthRoll < 0.38) {
      depthClass = 'motif-depth-distant';
      baseSize = 22 + Math.random() * 8;
      opacity = 0.12 + Math.random() * 0.12;
      duration = 32 + Math.random() * 14;
    } else if (depthRoll > 0.78) {
      depthClass = 'motif-depth-near';
      baseSize = 42 + Math.random() * 14;
      opacity = 0.38 + Math.random() * 0.18;
      duration = 18 + Math.random() * 8;
    }

    el.classList.add(depthClass);

    // Pick between the 12 curling icons (80% chance) and the authoritative maple leaf (20% chance)
    const isMapleLeaf = Math.random() < 0.26;
    if (isMapleLeaf) {
      el.innerHTML = renderAuthoritativeMapleLeaf();
    } else {
      const iconIdx = Math.floor(Math.random() * CURLING_ICONS.length);
      el.innerHTML = CURLING_ICONS[iconIdx];
      // Distribute sports colour accents: Dark Navy, Canadian Red, Yellow
      const colorRoll = Math.random();
      if (colorRoll < 0.5) {
        el.style.color = '#0B2138';
      } else if (colorRoll < 0.8) {
        el.style.color = '#D71920';
      } else {
        el.style.color = '#FFC400';
      }
    }

    const startLeft = Math.random() * 94; // % viewport width
    const driftX = (Math.random() - 0.5) * 70; // px drift
    const driftRot = (Math.random() - 0.5) * 90; // deg rotation

    el.style.left = `${startLeft}%`;
    el.style.width = `${baseSize}px`;
    el.style.height = `${baseSize}px`;
    el.style.setProperty('--item-opacity', opacity);
    el.style.setProperty('--drift-x', `${driftX}px`);
    el.style.setProperty('--drift-rot', `${driftRot}deg`);
    el.style.animationDuration = `${duration}s`;

    dom.ambientLayer.appendChild(el);

    setTimeout(() => {
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, duration * 1000);
  }

  function startAmbientAtmosphere() {
    // Initial gentle dispersal
    for (let i = 0; i < 7; i++) {
      setTimeout(spawnAmbientMotif, i * 450);
    }
    setInterval(spawnAmbientMotif, 2200);
  }

  // =========================================================================
  // CSV PARSER & DATA SYSTEM (Protected Logic)
  // =========================================================================
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            cell += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          cell += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ',') {
          row.push(cell.trim());
          cell = '';
        } else if (c === '\n' || c === '\r') {
          row.push(cell.trim());
          if (row.some(val => val !== '')) rows.push(row);
          row = [];
          cell = '';
          if (c === '\r' && text[i + 1] === '\n') i++;
        } else {
          cell += c;
        }
      }
    }
    if (cell || row.length > 0) {
      row.push(cell.trim());
      if (row.some(val => val !== '')) rows.push(row);
    }
    return rows;
  }

  function loadPuzzleData(csvRows) {
    if (!Array.isArray(csvRows) || csvRows.length < 2) return [];
    const list = [];

    for (let i = 1; i < csvRows.length; i++) {
      const r = csvRows[i];
      if (r.length < 9) continue;

      const date = r[0];
      const categories = [];

      for (let c = 0; c < 4; c++) {
        const catName = r[1 + c * 2];
        const rawWords = r[2 + c * 2];
        if (!catName || !rawWords) continue;

        const items = rawWords.split(/[,;]/).map(w => w.trim()).filter(w => w.length > 0);
        if (items.length === 4) {
          categories.push({
            name: catName,
            level: c + 1,
            items: items
          });
        }
      }

      if (categories.length === 4) {
        list.push({ date, categories });
      }
    }

    return list.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Robust Defensive Storage
  function loadStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.stats && parsed.games) {
          return parsed;
        }
      }
    } catch (e) {}
    return {
      version: 1,
      stats: { played: 0, won: 0, streak: 0, maxStreak: 0 },
      games: {}
    };
  }

  function saveStorage(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function getSavedGame(date) {
    const store = loadStorage();
    return store.games[date] || null;
  }

  function saveActiveGame() {
    if (!activePuzzle) return;
    const store = loadStorage();
    const existing = store.games[activePuzzle.date] || {};

    store.games[activePuzzle.date] = {
      solvedLevels: solvedCategories.map(c => c.level),
      unsolvedWords: [...unsolvedWords],
      mistakesRemaining: mistakesRemaining,
      guessHistory: [...guessHistory],
      isComplete: isComplete,
      isWon: isWon,
      recorded: existing.recorded || false
    };

    if (isComplete && !existing.recorded && !isArchiveMode) {
      store.stats.played++;
      if (isWon) {
        store.stats.won++;
        store.stats.streak++;
        if (store.stats.streak > store.stats.maxStreak) {
          store.stats.maxStreak = store.stats.streak;
        }
      } else {
        store.stats.streak = 0;
      }
      store.games[activePuzzle.date].recorded = true;
    }

    saveStorage(store);
  }

  // Navigation & Screens
  function showScreen(name) {
    playUiSound('nav');
    Object.keys(screens).forEach(key => {
      screens[key].classList.toggle('hidden', key !== name);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function showModal(modal) {
    playUiSound('nav');
    modal.classList.remove('hidden');
  }

  function closeModal(modal) {
    playUiSound('tick');
    modal.classList.add('hidden');
  }

  let toastTimer = null;
  function showToast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.add('hidden'), 2200);
  }

  // Gameplay Setup
  function startPuzzle(puzzle, isArchive) {
    playUiSound('stone-tap');
    activePuzzle = puzzle;
    isArchiveMode = isArchive;
    dom.gamePuzzleTitle.textContent = isArchive ? `Vault: ${puzzle.date}` : `Daily: ${puzzle.date}`;

    selectedWords = [];
    const saved = getSavedGame(puzzle.date);

    if (saved) {
      solvedCategories = (saved.solvedLevels || []).map(lvl => puzzle.categories.find(c => c.level === lvl)).filter(Boolean);
      unsolvedWords = Array.isArray(saved.unsolvedWords) ? saved.unsolvedWords : [];
      mistakesRemaining = typeof saved.mistakesRemaining === 'number' ? saved.mistakesRemaining : MAX_MISTAKES;
      guessHistory = Array.isArray(saved.guessHistory) ? saved.guessHistory : [];
      isComplete = Boolean(saved.isComplete);
      isWon = Boolean(saved.isWon);
    } else {
      solvedCategories = [];
      mistakesRemaining = MAX_MISTAKES;
      guessHistory = [];
      isComplete = false;
      isWon = false;

      const all = [];
      puzzle.categories.forEach(cat => cat.items.forEach(item => all.push(item)));
      shuffleArray(all);
      unsolvedWords = all;
    }

    renderBoard();
    updateControls();
    showScreen('game');
  }

  // Board Rendering
  function renderBoard() {
    // Solved category banners
    dom.solvedStack.innerHTML = '';
    solvedCategories.forEach(cat => {
      const banner = document.createElement('div');
      banner.className = `solved-banner cat-${cat.level}`;
      banner.innerHTML = `
        <span class="solved-level-tag">Level ${cat.level}</span>
        <span class="solved-name">${escapeHTML(cat.name)}</span>
        <span class="solved-items">${cat.items.map(escapeHTML).join(', ')}</span>
      `;
      dom.solvedStack.appendChild(banner);
    });

    // Unsolved words grid
    dom.grid.innerHTML = '';
    unsolvedWords.forEach(word => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'tile';
      if (selectedWords.includes(word)) tile.classList.add('selected');
      if (isComplete) tile.disabled = true;
      tile.textContent = word;
      tile.setAttribute('aria-pressed', selectedWords.includes(word) ? 'true' : 'false');
      tile.addEventListener('click', () => toggleSelect(word));
      dom.grid.appendChild(tile);
    });

    // Mistake dots
    const dots = dom.mistakeDots.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      dot.classList.toggle('filled', idx < mistakesRemaining);
    });
    dom.mistakeDots.setAttribute('aria-label', `${mistakesRemaining} mistakes remaining`);
  }

  function updateControls() {
    const count = selectedWords.length;
    dom.btnSubmit.disabled = count !== 4 || isComplete;
    dom.btnDeselect.disabled = count === 0 || isComplete;
    dom.btnShuffle.disabled = unsolvedWords.length <= 1 || isComplete;
  }

  function toggleSelect(word) {
    if (isComplete) return;
    initAudio();
    playUiSound('tick');

    const idx = selectedWords.indexOf(word);
    if (idx > -1) {
      selectedWords.splice(idx, 1);
    } else {
      if (selectedWords.length >= 4) return;
      selectedWords.push(word);
    }
    renderBoard();
    updateControls();
  }

  function deselectAll() {
    playUiSound('tick');
    selectedWords = [];
    renderBoard();
    updateControls();
  }

  function shuffleTiles() {
    playUiSound('stone-tap');
    shuffleArray(unsolvedWords);
    renderBoard();
  }

  function submitGuess() {
    if (selectedWords.length !== 4 || isComplete) return;
    initAudio();

    const guessKey = [...selectedWords].sort().join('|');
    const alreadyGuessed = guessHistory.some(g => [...g].sort().join('|') === guessKey);
    if (alreadyGuessed) {
      playUiSound('error');
      showToast('Already guessed');
      return;
    }

    guessHistory.push([...selectedWords]);

    // Check if guess matches any unsolved category
    let matchedCat = null;
    for (const cat of activePuzzle.categories) {
      if (solvedCategories.includes(cat)) continue;
      const count = selectedWords.filter(w => cat.items.includes(w)).length;
      if (count === 4) {
        matchedCat = cat;
        break;
      }
    }

    if (matchedCat) {
      playUiSound('success');
      solvedCategories.push(matchedCat);
      unsolvedWords = unsolvedWords.filter(w => !matchedCat.items.includes(w));
      selectedWords = [];

      // If 3 categories are solved, auto-complete the 4th
      if (solvedCategories.length === 3) {
        const lastCat = activePuzzle.categories.find(c => !solvedCategories.includes(c));
        if (lastCat) {
          solvedCategories.push(lastCat);
          unsolvedWords = [];
        }
      }

      if (solvedCategories.length === 4) {
        isComplete = true;
        isWon = true;
        finishGame();
      } else {
        saveActiveGame();
        renderBoard();
        updateControls();
      }
    } else {
      playUiSound('error');
      mistakesRemaining--;

      const isOneAway = activePuzzle.categories.some(cat => {
        if (solvedCategories.includes(cat)) return false;
        return selectedWords.filter(w => cat.items.includes(w)).length === 3;
      });
      if (isOneAway) showToast('One away...');

      const domTiles = dom.grid.querySelectorAll('.tile.selected');
      domTiles.forEach(t => t.classList.add('shake'));
      setTimeout(() => domTiles.forEach(t => t.classList.remove('shake')), 380);

      if (mistakesRemaining <= 0) {
        isComplete = true;
        isWon = false;
        setTimeout(() => {
          solvedCategories = [...activePuzzle.categories];
          unsolvedWords = [];
          selectedWords = [];
          finishGame();
        }, 500);
      } else {
        saveActiveGame();
        renderBoard();
        updateControls();
      }
    }
  }

  function finishGame() {
    if (isWon) {
      playUiSound('win');
    }
    saveActiveGame();
    renderBoard();
    updateControls();
    updateMenuStatus();
    setTimeout(showResultModal, 650);
  }

  function showResultModal() {
    dom.resultMsg.textContent = isWon ? 'Great job! Match Complete.' : 'Revealed. Better luck next end!';
    dom.resultGrid.innerHTML = '';

    const wordLevelMap = {};
    activePuzzle.categories.forEach(cat => {
      cat.items.forEach(item => { wordLevelMap[item] = cat.level; });
    });

    guessHistory.forEach(guess => {
      const line = guess.map(w => LEVEL_EMOJIS[wordLevelMap[w]] || '⬜').join('');
      const row = document.createElement('div');
      row.textContent = line;
      dom.resultGrid.appendChild(row);
    });

    showModal(dom.modalResult);
  }

  function shareResult() {
    playUiSound('stone-tap');
    const wordLevelMap = {};
    activePuzzle.categories.forEach(cat => {
      cat.items.forEach(item => { wordLevelMap[item] = cat.level; });
    });

    const lines = guessHistory.map(guess =>
      guess.map(w => LEVEL_EMOJIS[wordLevelMap[w]] || '⬜').join('')
    );

    const shareText = `Connections — Canadian Curling Edition\nPuzzle: ${activePuzzle.date}\n${lines.join('\n')}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText).then(() => showToast('Copied to clipboard'));
    } else {
      showToast('Copied to clipboard');
    }
  }

  // Views & UI Updates
  function updateMenuStatus() {
    if (!todayPuzzle) return;
    dom.menuDate.textContent = todayPuzzle.date;
    const saved = getSavedGame(todayPuzzle.date);

    if (!saved) {
      dom.menuStatus.textContent = 'Ready to play';
      dom.btnPlayToday.textContent = 'Play Daily';
    } else if (saved.isComplete) {
      dom.menuStatus.textContent = saved.isWon ? 'Solved' : 'Revealed';
      dom.btnPlayToday.textContent = 'View Board';
    } else {
      const solvedCount = (saved.solvedLevels || []).length;
      dom.menuStatus.textContent = `In Progress (${solvedCount}/4 Solved)`;
      dom.btnPlayToday.textContent = 'Continue Daily';
    }
  }

  function renderVault() {
    dom.vaultList.innerHTML = '';
    const archivePuzzles = puzzles.filter(p => p.date <= todayPuzzle.date && p.date !== todayPuzzle.date);

    if (archivePuzzles.length === 0) {
      dom.vaultList.innerHTML = '<p class="vault-lead">No previous puzzles currently in the Vault.</p>';
      return;
    }

    archivePuzzles.slice().reverse().forEach(p => {
      const item = document.createElement('div');
      item.className = 'vault-item';
      item.setAttribute('role', 'listitem');
      item.tabIndex = 0;

      const saved = getSavedGame(p.date);
      let badge = '<span class="badge badge-unplayed">Unplayed</span>';
      if (saved && saved.isComplete) {
        badge = saved.isWon
          ? '<span class="badge badge-won">Solved</span>'
          : '<span class="badge badge-lost">Revealed</span>';
      }

      item.innerHTML = `<span>${escapeHTML(p.date)}</span>${badge}`;
      const playHandler = () => startPuzzle(p, true);
      item.addEventListener('click', playHandler);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          playHandler();
        }
      });
      dom.vaultList.appendChild(item);
    });
  }

  function renderStats() {
    const store = loadStorage();
    const stats = store.stats;
    dom.statPlayed.textContent = stats.played;
    dom.statWinPct.textContent = stats.played > 0 ? `${Math.round((stats.won / stats.played) * 100)}%` : '0%';
    dom.statStreak.textContent = stats.streak;
    dom.statMaxStreak.textContent = stats.maxStreak;
  }

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Sound Toggle Control
  function toggleSound() {
    soundEnabled = !soundEnabled;
    if (dom.btnSoundToggle) {
      dom.btnSoundToggle.querySelector('.sound-icon').textContent = soundEnabled ? '🔊' : '🔇';
      dom.btnSoundToggle.setAttribute('aria-label', soundEnabled ? 'Mute UI Audio' : 'Unmute UI Audio');
    }
    if (soundEnabled) {
      initAudio();
      playUiSound('tick');
    }
  }

  // Initialization & Event Binding
  async function init() {
    dom.btnHome.setAttribute('href', HOME_PLACEHOLDER_URL);

    // One-time interaction hook to safely unlock Web Audio
    const unlockAudio = () => {
      initAudio();
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    startAmbientAtmosphere();

    try {
      const res = await fetch('puzzles.csv', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to load CSV');
      const csvText = await res.text();
      puzzles = loadPuzzleData(parseCSV(csvText));
    } catch (e) {
      dom.menuDate.textContent = 'Unavailable';
      dom.menuStatus.textContent = 'Failed to load puzzle data.';
      dom.btnPlayToday.disabled = true;
      return;
    }

    if (puzzles.length === 0) {
      dom.menuDate.textContent = 'Unavailable';
      dom.menuStatus.textContent = 'No valid puzzles found.';
      dom.btnPlayToday.disabled = true;
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const pastOrToday = puzzles.filter(p => p.date <= todayStr);

    todayPuzzle = puzzles.find(p => p.date === todayStr);
    if (!todayPuzzle) {
      todayPuzzle = pastOrToday.length > 0 ? pastOrToday[pastOrToday.length - 1] : puzzles[0];
    }

    updateMenuStatus();
    bindEvents();
    showScreen('menu');
  }

  function bindEvents() {
    // Audio toggle
    if (dom.btnSoundToggle) {
      dom.btnSoundToggle.addEventListener('click', toggleSound);
    }

    // Universal Navigation Actions
    dom.btnPlayToday.addEventListener('click', () => startPuzzle(todayPuzzle, false));

    dom.btnOpenVault.addEventListener('click', () => {
      renderVault();
      showScreen('vault');
    });

    // Return to Menu
    dom.btnGameBack.addEventListener('click', () => {
      updateMenuStatus();
      showScreen('menu');
    });

    dom.btnVaultBack.addEventListener('click', () => {
      updateMenuStatus();
      showScreen('menu');
    });

    dom.btnResultMenu.addEventListener('click', () => {
      closeModal(dom.modalResult);
      updateMenuStatus();
      showScreen('menu');
    });

    // In-game controls
    dom.btnShuffle.addEventListener('click', shuffleTiles);
    dom.btnDeselect.addEventListener('click', deselectAll);
    dom.btnSubmit.addEventListener('click', submitGuess);

    // Utilities & Modals
    dom.btnHelp.addEventListener('click', () => showModal(dom.modalHelp));
    dom.btnStats.addEventListener('click', () => {
      renderStats();
      showModal(dom.modalStats);
    });

    dom.btnShare.addEventListener('click', shareResult);

    document.querySelectorAll('[data-close]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-close');
        const m = document.getElementById(id);
        if (m) closeModal(m);
      });
    });

    document.querySelectorAll('.modal-backdrop').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();