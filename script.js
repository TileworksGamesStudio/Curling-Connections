(function () {
  'use strict';

  // Config & Constants
  const STORAGE_KEY = 'connections_save_v1';
  const MAX_MISTAKES = 4;
  const LEVEL_EMOJIS = { 1: '🟨', 2: '🟩', 3: '🟦', 4: '🟪' };
  const HOME_PLACEHOLDER_URL = 'https://tileworksgamesstudio.github.io/Curling-Menu/'; // Replace with supplied main-page URL

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
  let lastCardTapTime = 0;

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
    statMaxStreak: document.getElementById('stat-max-streak')
  };

  // CSV Parser with quote support
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
    } catch (e) {
      // Fallback cleanly on parse error or private browsing restrictions
    }
    return {
      version: 1,
      stats: { played: 0, won: 0, streak: 0, maxStreak: 0 },
      games: {}
    };
  }

  function saveStorage(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      // Storage quota or restriction failure handled gracefully
    }
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
    Object.keys(screens).forEach(key => {
      screens[key].classList.toggle('hidden', key !== name);
    });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function showModal(modal) {
    modal.classList.remove('hidden');
  }

  function closeModal(modal) {
    modal.classList.add('hidden');
  }

  let toastTimer = null;
  function showToast(msg) {
    dom.toast.textContent = msg;
    dom.toast.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => dom.toast.classList.add('hidden'), 2000);
  }

  // Gameplay Setup
  function startPuzzle(puzzle, isArchive) {
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
      tile.style.touchAction = 'manipulation';
      if (selectedWords.includes(word)) tile.classList.add('selected');
      if (isComplete) tile.disabled = true;
      tile.textContent = word;
      tile.setAttribute('aria-pressed', selectedWords.includes(word) ? 'true' : 'false');

      // Responsive touch handling for immediate single-tap on mobile
      let startX = 0;
      let startY = 0;
      let isMoved = false;

      const handleSelection = (e) => {
        if (isComplete) return;
        const now = Date.now();
        if (now - lastCardTapTime < 350) return;
        lastCardTapTime = now;
        toggleSelect(word);
      };

      tile.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch') {
          startX = e.clientX;
          startY = e.clientY;
          isMoved = false;
        }
      });

      tile.addEventListener('pointermove', (e) => {
        if (e.pointerType === 'touch') {
          if (Math.hypot(e.clientX - startX, e.clientY - startY) > 10) {
            isMoved = true;
          }
        }
      });

      tile.addEventListener('pointerup', (e) => {
        if (e.pointerType === 'touch') {
          if (!isMoved) {
            e.preventDefault();
            handleSelection(e);
          }
        }
      });

      tile.addEventListener('pointercancel', () => {
        isMoved = true;
      });

      tile.addEventListener('click', (e) => {
        handleSelection(e);
      });

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
    const idx = selectedWords.indexOf(word);
    if (idx > -1) {
      selectedWords.splice(idx, 1);
    } else {
      if (selectedWords.length >= 4) return;
      selectedWords.push(word);
    }

    // Update tile state in-place to avoid tearing down active touch targets
    const tiles = dom.grid.querySelectorAll('.tile');
    tiles.forEach(tile => {
      const isSel = selectedWords.includes(tile.textContent);
      tile.classList.toggle('selected', isSel);
      tile.setAttribute('aria-pressed', isSel ? 'true' : 'false');
    });

    updateControls();
  }

  function deselectAll() {
    selectedWords = [];
    const tiles = dom.grid.querySelectorAll('.tile');
    tiles.forEach(tile => {
      tile.classList.remove('selected');
      tile.setAttribute('aria-pressed', 'false');
    });
    updateControls();
  }

  function shuffleTiles() {
    shuffleArray(unsolvedWords);
    renderBoard();
  }

  function submitGuess() {
    if (selectedWords.length !== 4 || isComplete) return;

    const guessKey = [...selectedWords].sort().join('|');
    const alreadyGuessed = guessHistory.some(g => [...g].sort().join('|') === guessKey);
    if (alreadyGuessed) {
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
      mistakesRemaining--;

      const isOneAway = activePuzzle.categories.some(cat => {
        if (solvedCategories.includes(cat)) return false;
        return selectedWords.filter(w => cat.items.includes(w)).length === 3;
      });
      if (isOneAway) showToast('One away...');

      const domTiles = dom.grid.querySelectorAll('.tile.selected');
      domTiles.forEach(t => t.classList.add('shake'));
      setTimeout(() => domTiles.forEach(t => t.classList.remove('shake')), 360);

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
    saveActiveGame();
    renderBoard();
    updateControls();
    updateMenuStatus();
    setTimeout(showResultModal, 600);
  }

  function showResultModal() {
    dom.resultMsg.textContent = isWon ? 'Great job! Puzzle Solved.' : 'Revealed. Better luck next time!';
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
    const wordLevelMap = {};
    activePuzzle.categories.forEach(cat => {
      cat.items.forEach(item => { wordLevelMap[item] = cat.level; });
    });

    const lines = guessHistory.map(guess =>
      guess.map(w => LEVEL_EMOJIS[wordLevelMap[w]] || '⬜').join('')
    );

    const shareText = `Connections\nPuzzle: ${activePuzzle.date}\n${lines.join('\n')}`;

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

  // Vault Archive (Section 5: Daily puzzle excluded from historical archive)
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

  // Initialization & Event Binding
  async function init() {
    dom.btnHome.setAttribute('href', HOME_PLACEHOLDER_URL);

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
    // Universal Navigation Actions
    dom.btnPlayToday.addEventListener('click', () => startPuzzle(todayPuzzle, false));

    dom.btnOpenVault.addEventListener('click', () => {
      renderVault();
      showScreen('vault');
    });

    // Return to Menu from gameplay and vault
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