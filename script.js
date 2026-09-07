(function () {
  'use strict';

  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    playTap() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
      } catch (e) {}
    }

    playDeselect() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.035);
        gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.035);
      } catch (e) {}
    }

    playShuffle() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.07);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1400;
        filter.Q.value = 1.8;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        noise.start();
      } catch (e) {}
    }

    playError() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(130, this.ctx.currentTime);
        osc.frequency.setValueAtTime(95, this.ctx.currentTime + 0.09);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
      } catch (e) {}
    }

    playSuccess() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.06);
          gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + idx * 0.06);
          osc.stop(this.ctx.currentTime + idx * 0.06 + 0.2);
        });
      } catch (e) {}
    }

    playWin() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const fanfare = [523.25, 659.25, 783.99, 1046.50];
        fanfare.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.09);
          gain.gain.setValueAtTime(0.22, this.ctx.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.09 + 0.4);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + idx * 0.09);
          osc.stop(this.ctx.currentTime + idx * 0.09 + 0.4);
        });
      } catch (e) {}
    }
  }

  const sfx = new SoundFX();

  const unlockAudio = () => {
    sfx.init();
    window.removeEventListener('pointerdown', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('pointerdown', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });

  const EPOCH_DATE = new Date('2026-09-07T00:00:00');
  const now = new Date();
  const diffDays = Math.floor((now - EPOCH_DATE) / (1000 * 60 * 60 * 24));
  const TODAY_INDEX = Math.max(0, diffDays);

  function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const TODAY_STR = getTodayString();

  const PUZZLE_SETS = [
    {
      id: "puzzle-1",
      number: 1,
      name: "Puzzle #1",
      categories: [
        {
          title: "ICE SURFACE MARKINGS",
          level: 0,
          words: ["BUTTON", "HACK", "HOUSE", "TEE"]
        },
        {
          title: "SHOT TYPES",
          level: 1,
          words: ["DRAW", "GUARD", "PEEL", "TAKEOUT"]
        },
        {
          title: "SKIP CALLS",
          level: 2,
          words: ["CLEAN", "HARD", "HURRY", "WHOA"]
        },
        {
          title: "THINGS WITH HANDLES",
          level: 3,
          words: ["CUP", "DOOR", "STONE", "SUITCASE"]
        }
      ]
    },
    {
      id: "puzzle-2",
      number: 2,
      name: "Puzzle #2",
      categories: [
        {
          title: "POSITIONS ON A TEAM",
          level: 0,
          words: ["LEAD", "SECOND", "SKIP", "VICE"]
        },
        {
          title: "THINGS YOU CAN 'BREAK'",
          level: 1,
          words: ["BROOM", "ICE", "RECORD", "TIE"]
        },
        {
          title: "GAME SITUATIONS",
          level: 2,
          words: ["BLANK", "END", "HAMMER", "STEAL"]
        },
        {
          title: "DELIVERY & FOOTWEAR GEAR",
          level: 3,
          words: ["GRIPPER", "HOG", "SLIDER", "STABILIZER"]
        }
      ]
    },
    {
      id: "puzzle-3",
      number: 3,
      name: "Puzzle #3",
      categories: [
        {
          title: "LINES ON A CURLING SHEET",
          level: 0,
          words: ["BACK", "CENTER", "HOG", "TEE"]
        },
        {
          title: "TYPES OF SHOT WEIGHT",
          level: 1,
          words: ["BUMPER", "CONTROL", "HACK", "HEAVY"]
        },
        {
          title: "HOW A STONE MOVES",
          level: 2,
          words: ["BITE", "CURL", "FALL", "FINISH"]
        },
        {
          title: "CANADIAN CURLING CHAMPIONS",
          level: 3,
          words: ["FERBEY", "GUSHUE", "HOWARD", "JONES"]
        }
      ]
    },
    {
      id: "puzzle-4",
      number: 4,
      name: "Puzzle #4",
      categories: [
        {
          title: "PARTS OF A CURLING STONE",
          level: 0,
          words: ["BAND", "BOLT", "CUP", "HANDLE"]
        },
        {
          title: "ACTIONS WHEN SWEEPING",
          level: 1,
          words: ["BRUSH", "BUFF", "CARVE", "POLISH"]
        },
        {
          title: "WORDS BEFORE 'SHEET'",
          level: 2,
          words: ["BALANCE", "BED", "CHEAT", "ICE"]
        },
        {
          title: "WINTER OLYMPIC SLIDING SPORTS",
          level: 3,
          words: ["BOBSLEIGH", "CURLING", "LUGE", "SKELETON"]
        }
      ]
    },
    {
      id: "puzzle-5",
      number: 5,
      name: "Puzzle #5",
      categories: [
        {
          title: "DIRECTIONS OF ROTATION",
          level: 0,
          words: ["CLOCKWISE", "COUNTER", "IN-TURN", "OUT-TURN"]
        },
        {
          title: "THINGS THAT SLIDE ON ICE",
          level: 1,
          words: ["CURLER", "PENGUIN", "PUCK", "SLED"]
        },
        {
          title: "TOURNAMENT FORMATS",
          level: 2,
          words: ["KNOCKOUT", "PAGE", "ROUND-ROBIN", "SKINS"]
        },
        {
          title: "CANADIAN ICONS",
          level: 3,
          words: ["BEAVER", "LOONIE", "MAPLE", "MOOSE"]
        }
      ]
    },
    {
      id: "puzzle-6",
      number: 6,
      name: "Puzzle #6",
      categories: [
        {
          title: "SHEET MAINTENANCE TOOLS",
          level: 0,
          words: ["MOP", "PEBBLER", "SCRAPER", "SWEEPER"]
        },
        {
          title: "TACTICAL SHOTS",
          level: 1,
          words: ["CHIP", "FREEZE", "RAISE", "WICK"]
        },
        {
          title: "WORDS MEANING 'ACCURATE'",
          level: 2,
          words: ["DEAD", "EXACT", "ON-LINE", "TRUE"]
        },
        {
          title: "POPULAR CLUBHOUSE DRINKS",
          level: 3,
          words: ["ALE", "CIDER", "COFFEE", "LAGER"]
        }
      ]
    },
    {
      id: "puzzle-7",
      number: 7,
      name: "Puzzle #7",
      categories: [
        {
          title: "PARTS OF A BROOM",
          level: 0,
          words: ["HEAD", "PAD", "PIVOT", "SHAFT"]
        },
        {
          title: "THINGS THAT CAN BE SPUN",
          level: 1,
          words: ["COIN", "RECORD", "STONE", "YARN"]
        },
        {
          title: "UNITS OF TIME",
          level: 2,
          words: ["CLOCK", "HOUR", "SECOND", "TICK"]
        },
        {
          title: "CANADIAN PROVINCES",
          level: 3,
          words: ["ALBERTA", "MANITOBA", "ONTARIO", "QUEBEC"]
        }
      ]
    }
  ];

  const ADDITIONAL_PUZZLES = [
    [['DELIVERY TERMS', ['BACKSWING', 'RELEASE', 'SLIDE', 'FOLLOW-THROUGH'], 0], ['SHOT WEIGHTS', ['DRAW', 'CONTROL', 'HEAVY', 'TAKEOUT'], 1], ['THINGS WITH A BAND', ['STONE', 'RING', 'MARCH', 'WEDDING'], 2], ['WORDS AFTER ICE', ['MAKER', 'TIME', 'HOUSE', 'BREAK'], 3]],
    [['ICE-MAKER ACTIONS', ['PEBBLE', 'NIP', 'SCRAPE', 'FLOOD'], 0], ['SHEET CONDITIONS', ['SPEED', 'CURL', 'FROST', 'HUMIDITY'], 1], ['THINGS THAT CAN BE FRESH', ['ICE', 'START', 'POWDER', 'PAINT'], 2], ['CLUBHOUSE ORDERS', ['ALE', 'COFFEE', 'CIDER', 'TEA'], 3]],
    [['CONTACT SHOTS', ['WICK', 'CAROM', 'CHIP', 'RAISE'], 0], ['WAYS TO PROTECT A STONE', ['GUARD', 'COVER', 'FREEZE', 'BURIED'], 1], ['WORDS BEFORE OFF', ['TAKE', 'SPIN', 'SHOW', 'SIGN'], 2], ['THINGS THAT ROLL', ['STONE', 'DICE', 'BARREL', 'TIDE'], 3]],
    [['TEAM POSITIONS', ['LEAD', 'SECOND', 'VICE', 'SKIP'], 0], ['THINGS A SKIP CALLS', ['LINE', 'WEIGHT', 'HARD', 'WHOA'], 1], ['KINDS OF SUPPORT', ['BACK', 'SIDE', 'MORAL', 'TECHNICAL'], 2], ['WORDS AFTER TEAM', ['MATE', 'WORK', 'SPORT', 'BUILDING'], 3]],
    [['SCORING RESULTS', ['BLANK', 'STEAL', 'FORCE', 'DEUCE'], 0], ['TOURNAMENT STAGES', ['ROUND', 'PLAYOFF', 'SEMI', 'FINAL'], 1], ['THINGS WITH A CROWN', ['KING', 'QUEEN', 'TOOTH', 'CHAMPION'], 2], ['WORDS BEFORE ROBIN', ['BATMAN', 'RED', 'PET', 'HOOD'], 3]],
    [['RULES OFFICIALS MAY CHECK', ['HOG', 'BURN', 'MEASURE', 'LINE'], 0], ['PROTECTED AREAS', ['ZONE', 'HOUSE', 'FORT', 'PARK'], 1], ['WORDS AFTER FREE', ['GUARD', 'THROW', 'FALL', 'STYLE'], 2], ['THINGS THAT CAN BE DEAD', ['HEAT', 'CENTER', 'LINE', 'SERIOUS'], 3]],
    [['MIXED DOUBLES TERMS', ['POWER', 'PRE-PLACED', 'FIVE', 'EIGHT'], 0], ['CURLING FORMATS', ['JUNIOR', 'WHEELCHAIR', 'SINGLES', 'TEAM'], 1], ['THINGS WITH A HAMMER', ['NAIL', 'THOR', 'MCFLY', 'CLOCK'], 2], ['WORDS AFTER EXTRA', ['END', 'POINT', 'LARGE', 'CREDIT'], 3]],
    [['HOUSE TARGETS', ['BUTTON', 'FOUR', 'EIGHT', 'TWELVE'], 0], ['GUARD LOCATIONS', ['CENTER', 'CORNER', 'TOP', 'LONG'], 1], ['THINGS THAT CAN BE OPEN', ['HOUSE', 'ICE', 'END', 'SECRET'], 2], ['WORDS BEFORE POINT', ['MATCH', 'TURNING', 'VIEW', 'COUNTER'], 3]],
    [['CURLING HISTORY', ['SCOTLAND', 'AILSA', 'LOCH', 'BONSPIEL'], 0], ['CANADIAN SYMBOLS', ['MAPLE', 'MOOSE', 'LOONIE', 'BEAVER'], 1], ['WORDS AFTER CLUB', ['HOUSE', 'SANDWICH', 'SODA', 'NIGHT'], 2], ['THINGS THAT CAN BE SPIRITED', ['HORSE', 'AWAY', 'TEAM', 'DRINK'], 3]],
    [['BROOM PARTS', ['HEAD', 'PAD', 'SHAFT', 'GRIP'], 0], ['FOOTWEAR FEATURES', ['SLIDER', 'GRIPPER', 'SOLE', 'LACE'], 1], ['THINGS THAT CAN BE TAPPED', ['BACK', 'SCREEN', 'KEG', 'BUTTON'], 2], ['WORDS AFTER SHOE', ['BOX', 'HORN', 'STRING', 'LEATHER'], 3]],
    [['ADVANCED SHOTS', ['DOUBLE', 'TRIPLE', 'PEEL', 'PROMOTE'], 0], ['STONE MOVEMENT', ['ROLL', 'CARRY', 'FINISH', 'FALL'], 1], ['THINGS THAT CAN BE ANGLED', ['RAISE', 'BRUSH', 'MIRROR', 'PARKING'], 2], ['WORDS BEFORE ROLL', ['ROCK', 'CREDIT', 'JELLY', 'DRUM'], 3]],
    [['ICE SCIENCE', ['FRICTION', 'TEMPERATURE', 'HUMIDITY', 'GRAVITY'], 0], ['THINGS THAT MELT', ['PEBBLE', 'SNOW', 'BUTTER', 'MOMENT'], 1], ['WORDS AFTER RUNNING', ['BAND', 'BACK', 'MATE', 'WATER'], 2], ['THINGS THAT CAN BE POLISHED', ['STONE', 'SHOE', 'IMAGE', 'REPUTATION'], 3]],
    [['SHOT PLANNING', ['LINE', 'WEIGHT', 'ANGLE', 'TARGET'], 0], ['WAYS TO SCORE', ['DRAW', 'STEAL', 'FORCE', 'TAKE'], 1], ['THINGS THAT CAN BE BLANK', ['END', 'PAGE', 'CHECKET', 'EXPRESSION'], 2], ['WORDS BEFORE BOARD', ['SCORE', 'DIVE', 'IRON', 'SOUND'], 3]],
    [['CURLING ETIQUETTE', ['HANDSHAKE', 'HONESTY', 'RESPECT', 'CONCEDE'], 0], ['POST-GAME TRADITIONS', ['BROOMSTACKING', 'SOCIAL', 'DRINK', 'RECAP'], 1], ['THINGS THAT CAN BE GOOD', ['CURLING', 'SPORT', 'LINE', 'MORNING'], 2], ['WORDS AFTER SPIRIT', ['OF', 'LEVEL', 'ANIMAL', 'WEEK'], 3]],
    [['STONE ANATOMY', ['HANDLE', 'BOLT', 'CUP', 'BAND'], 0], ['GRANITE SOURCES', ['AILSA', 'QUARRY', 'ISLAND', 'ROCK'], 1], ['THINGS THAT CAN BE RUNNING', ['LATE', 'WILD', 'COMMENTARY', 'MATE'], 2], ['WORDS BEFORE STONE', ['CURSING', 'MILE', 'ROLLING', 'KEY'], 3]],
    [['SHOT CALLS', ['HURRY', 'WHOA', 'CLEAN', 'HARD'], 0], ['WAYS TO MOVE A STONE', ['HIT', 'RAISE', 'WICK', 'DRAW'], 1], ['THINGS THAT CAN BE HARD', ['SWEEP', 'ROCK', 'STOP', 'COPY'], 2], ['WORDS AFTER BACK', ['LINE', 'SWING', 'STOP', 'YARD'], 3]],
    [['SHEET MARKINGS', ['HOG', 'TEE', 'CENTER', 'BACK'], 0], ['SCORING AREAS', ['BUTTON', 'FOUR', 'EIGHT', 'TWELVE'], 1], ['THINGS WITH A LINE', ['CREDIT', 'FINISH', 'PICKUP', 'DEAD'], 2], ['WORDS BEFORE SIDE', ['BOARD', 'WALK', 'KICK', 'INSIDE'], 3]],
    [['ICE-MAKER TOOLS', ['NIPPER', 'SCRAPER', 'MOP', 'PEBBLER'], 0], ['ICE TEXTURES', ['PEBBLE', 'FROST', 'SHEEN', 'RIPPLE'], 1], ['THINGS THAT CAN BE SMOOTH', ['ICE', 'TALK', 'JAZZ', 'OPERATOR'], 2], ['WORDS AFTER SURFACE', ['AREA', 'TENSION', 'LEVEL', 'MOUNT'], 3]],
    [['TACTICAL COVER', ['GUARD', 'SCREEN', 'SHIELD', 'BLOCK'], 0], ['OPENING SHOTS', ['DRAW', 'PEEL', 'TICK', 'RAISE'], 1], ['THINGS THAT CAN BE CENTERED', ['STONE', 'TEXT', 'COURT', 'ATTENTION'], 2], ['WORDS BEFORE SHOT', ['FOOT', 'MOON', 'SLAP', 'CALL'], 3]],
    [['CURLING COMPETITION', ['MATCH', 'END', 'SCORE', 'ROUND'], 0], ['CHAMPIONSHIP PRIZES', ['BROOM', 'CUP', 'MEDAL', 'TROPHY'], 1], ['THINGS WITH A LEAD', ['TEAM', 'PENCIL', 'STORY', 'HORSE'], 2], ['WORDS AFTER PLAY', ['OFF', 'BOOK', 'GROUND', 'CALL'], 3]],
    [['DELIVERY BALANCE', ['HACK', 'SLIDE', 'STABILIZER', 'GRIPPER'], 0], ['RELEASE DETAILS', ['HANDLE', 'ROTATION', 'LINE', 'TIMING'], 1], ['THINGS THAT CAN BE CLEAN', ['ICE', 'SWEEP', 'SLATE', 'RECORD'], 2], ['WORDS BEFORE POWER', ['PLAY', 'NAP', 'CUP', 'HOUSE'], 3]],
    [['ADVANCED POSITIONING', ['PORT', 'BITE', 'ANGLE', 'RAISE'], 0], ['STONE FINISHES', ['ROLL', 'FREEZE', 'DRAW', 'PEEL'], 1], ['THINGS THAT CAN BE WICKED', ['SHOT', 'SMART', 'WITCH', 'WEATHER'], 2], ['WORDS AFTER POINT', ['FOUR', 'VIEW', 'BREAK', 'COUNTER'], 3]],
    [['CURLING ROLES', ['SKIP', 'LEAD', 'SECOND', 'VICE'], 0], ['PEOPLE WHO CALL', ['COACH', 'REFEREE', 'ANNOUNCER', 'JUDGE'], 1], ['THINGS THAT CAN BE VICE', ['PRESIDENT', 'SQUAD', 'VERSA', 'LORD'], 2], ['WORDS BEFORE HOUSE', ['CLUB', 'FULL', 'OPEN', 'POWER'], 3]],
    [['GAME-DAY CLOCK', ['END', 'TIME', 'SHOT', 'SPLIT'], 0], ['WAYS TO WIN', ['STEAL', 'SCORE', 'FORCE', 'OUTPLAY'], 1], ['THINGS THAT CAN BE EXTRA', ['LARGE', 'CREDIT', 'TERRESTRIAL', 'SPECIAL'], 2], ['WORDS AFTER MATCH', ['POINT', 'PLAY', 'BOOK', 'BOX'], 3]],
    [['CURLING WORDPLAY', ['BUTTON', 'HAMMER', 'GUARD', 'HOUSE'], 0], ['THINGS THAT CAN BE DRAWN', ['STONE', 'CARD', 'BATH', 'CONCLUSION'], 1], ['WORDS BEFORE ROCK', ['PUNK', 'BED', 'PAPER', 'CURLING'], 2], ['THINGS THAT CAN BE SWEPT', ['ICE', 'FLOOR', 'HAIR', 'EVIDENCE'], 3]],
    [['MASTER STRATEGY', ['ADAPT', 'READ', 'PLAN', 'EXECUTE'], 0], ['RISK LEVELS', ['SAFE', 'BOLD', 'HIGH', 'CALCULATED'], 1], ['THINGS THAT CAN BE PRECISION', ['SHOT', 'DRIVING', 'SURGERY', 'TOOLS'], 2], ['WORDS AFTER CURLING', ['STONE', 'IRON', 'CLUB', 'BROOM'], 3]]
  ].map((groups, index) => ({
    id: `puzzle-${index + 8}`,
    number: index + 8,
    name: `Puzzle #${index + 8}`,
    categories: groups.map(([title, words, level]) => ({ title, words, level }))
  }));

  PUZZLE_SETS.push(...ADDITIONAL_PUZZLES);

  const STORAGE_KEY = "button_curl_state_v3";

  function getDefaultState() {
    return {
      solvedPuzzles: {},
      inProgress: {},
      stats: {
        played: 0,
        wins: 0,
        currentStreak: 0,
        maxStreak: 0,
        lastDailyDate: null,
        distribution: { 4: 0, 3: 0, 2: 0, 1: 0 }
      },
      settings: {
        soundEnabled: true
      }
    };
  }

  function loadGameState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultState();
      const parsed = JSON.parse(raw);
      return {
        solvedPuzzles: parsed.solvedPuzzles || {},
        inProgress: parsed.inProgress || {},
        stats: Object.assign(getDefaultState().stats, parsed.stats || {}),
        settings: Object.assign(getDefaultState().settings, parsed.settings || {})
      };
    } catch (e) {
      return getDefaultState();
    }
  }

  function saveGameState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  let AppState = loadGameState();
  sfx.enabled = AppState.settings.soundEnabled;

  let activePuzzle = null;
  let activeSelectedWords = [];
  let remainingTiles = [];
  let mistakesRemaining = 4;
  let solvedCategories = [];
  let guessedWordCombos = [];
  let guessHistory = [];

  const screens = {
    menu: document.getElementById('view-menu'),
    game: document.getElementById('view-game'),
    vault: document.getElementById('view-vault'),
    instructions: document.getElementById('view-instructions')
  };

  const btnHome = document.getElementById('btn-home');
  const btnSound = document.getElementById('btn-sound-toggle');
  const soundIcon = document.getElementById('sound-icon');
  const btnStatsToggle = document.getElementById('btn-stats-toggle');
  const currentBadge = document.getElementById('current-screen-badge');

  const btnMenuDaily = document.getElementById('menu-btn-daily');
  const dailyDrawMeta = document.getElementById('daily-draw-meta');
  const dailyStatusPill = document.getElementById('daily-status-pill');
  const btnMenuVault = document.getElementById('menu-btn-vault');
  const vaultCountBadge = document.getElementById('vault-count-badge');
  const btnMenuInstructions = document.getElementById('menu-btn-instructions');
  const btnCloseInstructions = document.getElementById('btn-close-instructions');

  const puzzleGrid = document.getElementById('puzzle-grid');
  const completedRack = document.getElementById('completed-categories');
  const mistakesRack = document.getElementById('mistakes-counter');
  const puzzleLabel = document.getElementById('puzzle-label');
  const statusIndicator = document.getElementById('status-indicator');

  const btnShuffle = document.getElementById('btn-shuffle');
  const btnDeselect = document.getElementById('btn-deselect');
  const btnSubmit = document.getElementById('btn-submit');
  const toastBanner = document.getElementById('toast-banner');

  const vaultList = document.getElementById('vault-list');

  const statsModal = document.getElementById('stats-modal');
  const btnCloseStats = document.getElementById('btn-close-stats');
  const btnStatsReturn = document.getElementById('btn-stats-return');
  const statPlayed = document.getElementById('stat-played');
  const statWinRate = document.getElementById('stat-win-rate');
  const statCurrentStreak = document.getElementById('stat-current-streak');
  const statMaxStreak = document.getElementById('stat-max-streak');
  const distBarsRack = document.getElementById('dist-bars-rack');

  const gameModal = document.getElementById('game-modal');
  const modalBanner = document.getElementById('modal-banner');
  const modalTitle = document.getElementById('modal-title');
  const modalSub = document.getElementById('modal-sub');
  const shareGridPreview = document.getElementById('share-grid-preview');
  const btnShareResult = document.getElementById('btn-share-result');
  const btnModalStats = document.getElementById('btn-modal-stats');
  const btnModalExit = document.getElementById('btn-modal-exit');

  function switchScreen(screenName, badgeText) {
    Object.keys(screens).forEach(key => {
      screens[key].classList.toggle('active', key === screenName);
    });
    currentBadge.textContent = badgeText;
    
    if (screenName === 'menu') {
      btnHome.classList.add('hidden');
    } else {
      btnHome.classList.remove('hidden');
    }
  }

  function updateSoundUI() {
    soundIcon.innerHTML = sfx.enabled
      ? `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>`
      : `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>`;
  }

  function getDailyPuzzle() {
    const idx = TODAY_INDEX % PUZZLE_SETS.length;
    return PUZZLE_SETS[idx] || PUZZLE_SETS[0];
  }

  function updateMenuMeta() {
    const daily = getDailyPuzzle();
    if (daily) {
      dailyDrawMeta.textContent = `${daily.name} • Daily Challenge`;
      const isDone = !!AppState.solvedPuzzles[daily.id];
      const inProgress = AppState.inProgress[daily.id];

      if (isDone) {
        dailyStatusPill.textContent = "COMPLETED";
        dailyStatusPill.style.background = "#86efac";
        dailyStatusPill.style.color = "#0c1824";
      } else if (inProgress && inProgress.remainingTiles && inProgress.remainingTiles.length < 16) {
        dailyStatusPill.textContent = "IN PROGRESS";
        dailyStatusPill.style.background = "#bae6fd";
        dailyStatusPill.style.color = "#0c1824";
      } else {
        dailyStatusPill.textContent = "PLAY";
        dailyStatusPill.style.background = "";
        dailyStatusPill.style.color = "";
      }
    }

    vaultCountBadge.textContent = `${Math.max(0, daily.number - 1)} PUZZLES`;
  }

  function renderVaultList() {
    vaultList.innerHTML = '';
    const daily = getDailyPuzzle();

    PUZZLE_SETS.filter(p => p.number < daily.number).forEach(p => {
      const record = AppState.solvedPuzzles[p.id];
      const inProgress = AppState.inProgress[p.id];
      const isToday = p.id === daily.id;
      const card = document.createElement('div');
      card.className = 'vault-card';
      card.setAttribute('role', 'listitem');
      card.tabIndex = 0;

      let statusClass = 'status-unplayed';
      let statusText = 'UNPLAYED';

      if (record) {
        statusClass = record.won ? 'status-won' : 'status-loss';
        statusText = record.won ? `SOLVED (${record.mistakesRemaining} LEFT)` : 'MISSED';
      } else if (inProgress && inProgress.remainingTiles && inProgress.remainingTiles.length < 16) {
        statusClass = 'status-progress';
        statusText = 'IN PROGRESS';
      } else if (isToday) {
        statusClass = 'status-today';
        statusText = "TODAY";
      }

      card.innerHTML = `
        <div class="vault-card-info">
          <h3>${p.name}</h3>
          <span>4 Categories • 16 Words</span>
        </div>
        <div class="vault-card-status ${statusClass}">
          ${statusText}
        </div>
      `;

      const startAction = () => {
        sfx.playTap();
        startPuzzle(p);
      };

      card.addEventListener('click', startAction);
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          startAction();
        }
      });

      vaultList.appendChild(card);
    });
  }

  function startPuzzle(puzzle) {
    activePuzzle = puzzle;
    activeSelectedWords = [];
    guessHistory = [];
    guessedWordCombos = [];
    completedRack.innerHTML = '';
    puzzleGrid.innerHTML = '';
    mistakesRemaining = 4;
    updateMistakesUI();

    puzzleLabel.textContent = puzzle.name.toUpperCase();
    statusIndicator.textContent = "SELECT 4 WORDS";
    btnSubmit.disabled = true;

    if (AppState.solvedPuzzles[puzzle.id]) {
      const record = AppState.solvedPuzzles[puzzle.id];
      puzzle.categories.forEach(cat => renderSolvedCategoryBanner(cat));
      remainingTiles = [];
      renderGrid();
      showToast("Puzzle completed");
      setTimeout(() => openGameOverModal(record.won), 300);
      switchScreen('game', 'COMPLETED');
      return;
    }

    const savedProgress = AppState.inProgress[puzzle.id];
    if (savedProgress && savedProgress.remainingTiles && savedProgress.remainingTiles.length > 0) {
      remainingTiles = savedProgress.remainingTiles;
      activeSelectedWords = savedProgress.selectedWords || [];
      mistakesRemaining = savedProgress.mistakesRemaining ?? 4;
      solvedCategories = savedProgress.solvedCategories || [];
      guessedWordCombos = savedProgress.guessedWordCombos || [];
      guessHistory = savedProgress.guessHistory || [];

      solvedCategories.forEach(cat => renderSolvedCategoryBanner(cat));
      updateMistakesUI();
      renderGrid();
      switchScreen('game', puzzle.id === getDailyPuzzle().id ? 'DAILY PUZZLE' : 'ARCHIVE');
      return;
    }

    const allWords = [];
    puzzle.categories.forEach(cat => {
      cat.words.forEach(w => {
        allWords.push({
          word: w.trim().toUpperCase(),
          categoryLevel: cat.level,
          categoryTitle: cat.title
        });
      });
    });

    remainingTiles = shuffleArray(allWords);
    solvedCategories = [];

    saveInProgressState();
    renderGrid();
    switchScreen('game', puzzle.id === getDailyPuzzle().id ? 'DAILY PUZZLE' : 'ARCHIVE');
  }

  function saveInProgressState() {
    if (!activePuzzle || AppState.solvedPuzzles[activePuzzle.id]) return;
    AppState.inProgress[activePuzzle.id] = {
      selectedWords: activeSelectedWords,
      remainingTiles: remainingTiles,
      mistakesRemaining: mistakesRemaining,
      solvedCategories: solvedCategories,
      guessedWordCombos: guessedWordCombos,
      guessHistory: guessHistory
    };
    saveGameState(AppState);
  }

  function clearInProgressState(puzzleId) {
    if (AppState.inProgress[puzzleId]) {
      delete AppState.inProgress[puzzleId];
      saveGameState(AppState);
    }
  }

  function renderGrid() {
    puzzleGrid.innerHTML = '';
    remainingTiles.forEach(item => {
      const tile = document.createElement('button');
      tile.type = 'button';
      tile.className = 'word-tile';
      tile.setAttribute('role', 'button');
      tile.setAttribute('aria-label', item.word);
      tile.textContent = item.word;
      tile.dataset.word = item.word;

      const isSelected = activeSelectedWords.includes(item.word);
      tile.classList.toggle('selected', isSelected);
      tile.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      tile.addEventListener('click', () => handleTileClick(item.word, tile));
      puzzleGrid.appendChild(tile);
    });

    btnSubmit.disabled = activeSelectedWords.length !== 4;
    updateStatusText();
  }

  function updateStatusText() {
    if (activeSelectedWords.length === 0) {
      statusIndicator.textContent = "SELECT 4 WORDS";
    } else if (activeSelectedWords.length === 4) {
      statusIndicator.textContent = "READY TO CHECK";
    } else {
      statusIndicator.textContent = `${activeSelectedWords.length}/4 SELECTED`;
    }
  }

  function handleTileClick(word, tileEl) {
    const idx = activeSelectedWords.indexOf(word);
    if (idx > -1) {
      activeSelectedWords.splice(idx, 1);
      tileEl.classList.remove('selected');
      tileEl.setAttribute('aria-pressed', 'false');
      sfx.playDeselect();
    } else {
      if (activeSelectedWords.length >= 4) {
        sfx.playError();
        showToast("Maximum 4 words selected");
        return;
      }
      activeSelectedWords.push(word);
      tileEl.classList.add('selected');
      tileEl.setAttribute('aria-pressed', 'true');
      sfx.playTap();
    }

    btnSubmit.disabled = activeSelectedWords.length !== 4;
    updateStatusText();
    saveInProgressState();
  }

  function handleDeselectAll() {
    if (activeSelectedWords.length === 0) return;
    activeSelectedWords = [];
    sfx.playDeselect();
    renderGrid();
    saveInProgressState();
  }

  function handleShuffle() {
    sfx.playShuffle();
    remainingTiles = shuffleArray(remainingTiles);
    renderGrid();
    saveInProgressState();
  }

  function getWordCategoryLevel(word) {
    if (!activePuzzle) return 0;
    for (const cat of activePuzzle.categories) {
      const match = cat.words.some(w => w.trim().toUpperCase() === word);
      if (match) return cat.level;
    }
    return 0;
  }

  function handleSubmit() {
    if (activeSelectedWords.length !== 4) return;

    const currentGuessSorted = [...activeSelectedWords].sort().join('|');
    if (guessedWordCombos.includes(currentGuessSorted)) {
      sfx.playError();
      triggerGridShake();
      showToast("Already guessed!");
      return;
    }
    guessedWordCombos.push(currentGuessSorted);

    const guessLevels = activeSelectedWords.map(w => getWordCategoryLevel(w));
    guessHistory.push(guessLevels);

    let matchedCategory = null;
    for (const cat of activePuzzle.categories) {
      const catWordSet = new Set(cat.words.map(w => w.trim().toUpperCase()));
      const isMatch = activeSelectedWords.every(w => catWordSet.has(w));
      if (isMatch) {
        matchedCategory = cat;
        break;
      }
    }

    if (matchedCategory) {
      sfx.playSuccess();
      solvedCategories.push(matchedCategory);

      remainingTiles = remainingTiles.filter(t => !activeSelectedWords.includes(t.word));
      activeSelectedWords = [];

      renderSolvedCategoryBanner(matchedCategory);
      renderGrid();
      saveInProgressState();

      if (remainingTiles.length === 0) {
        setTimeout(() => handleGameEnd(true), 450);
      }
    } else {
      let isOneAway = false;
      for (const cat of activePuzzle.categories) {
        const catWordSet = new Set(cat.words.map(w => w.trim().toUpperCase()));
        const matchCount = activeSelectedWords.filter(w => catWordSet.has(w)).length;
        if (matchCount === 3) {
          isOneAway = true;
          break;
        }
      }

      sfx.playError();
      triggerGridShake();

      mistakesRemaining--;
      updateMistakesUI();
      saveInProgressState();

      if (isOneAway) {
        showToast("One away...");
      } else {
        showToast("Incorrect guess");
      }

      if (mistakesRemaining <= 0) {
        setTimeout(() => handleGameOverLoss(), 500);
      }
    }
  }

  function renderSolvedCategoryBanner(category) {
    const banner = document.createElement('div');
    banner.className = `solved-banner lvl-${category.level}`;
    banner.innerHTML = `
      <div class="solved-group-title">${category.title}</div>
      <div class="solved-words">${category.words.join(' • ')}</div>
    `;
    completedRack.appendChild(banner);
  }

  function updateMistakesUI() {
    const stones = mistakesRack.querySelectorAll('.stone-life');
    stones.forEach((st, idx) => {
      if (idx < mistakesRemaining) {
        st.classList.add('active');
        st.classList.remove('burnt');
      } else {
        st.classList.remove('active');
        st.classList.add('burnt');
      }
    });
    mistakesRack.setAttribute('aria-label', `${mistakesRemaining} mistakes remaining`);
  }

  function triggerGridShake() {
    const tiles = puzzleGrid.querySelectorAll('.word-tile.selected');
    tiles.forEach(t => t.classList.add('shake'));
    setTimeout(() => {
      tiles.forEach(t => t.classList.remove('shake'));
    }, 420);
  }

  function handleGameOverLoss() {
    showToast("Out of guesses! Revealing solutions.");
    activePuzzle.categories.forEach(cat => {
      const alreadySolved = solvedCategories.some(sc => sc.title === cat.title);
      if (!alreadySolved) {
        renderSolvedCategoryBanner(cat);
      }
    });
    remainingTiles = [];
    renderGrid();
    handleGameEnd(false);
  }

  function handleGameEnd(won) {
    if (won) {
      sfx.playWin();
    }

    const isDaily = activePuzzle.id === getDailyPuzzle().id;

    AppState.solvedPuzzles[activePuzzle.id] = {
      won: won,
      mistakesRemaining: mistakesRemaining,
      history: guessHistory,
      completedAt: TODAY_STR
    };

    updateCareerStats(won, mistakesRemaining, isDaily);
    clearInProgressState(activePuzzle.id);
    updateMenuMeta();

    setTimeout(() => openGameOverModal(won), 450);
  }

  function updateCareerStats(won, stonesLeft, isDaily) {
    const s = AppState.stats;
    s.played++;
    if (won) {
      s.wins++;
      if (isDaily) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

        if (s.lastDailyDate === yStr) {
          s.currentStreak++;
        } else if (s.lastDailyDate === TODAY_STR) {
        } else {
          s.currentStreak = 1;
        }

        if (s.currentStreak > s.maxStreak) {
          s.maxStreak = s.currentStreak;
        }
        s.lastDailyDate = TODAY_STR;
      }
      if (stonesLeft >= 1 && stonesLeft <= 4) {
        s.distribution[stonesLeft] = (s.distribution[stonesLeft] || 0) + 1;
      }
    } else {
      if (isDaily) {
        s.currentStreak = 0;
        s.lastDailyDate = TODAY_STR;
      }
    }
    saveGameState(AppState);
  }

  function openGameOverModal(won) {
    modalBanner.textContent = won ? "VICTORY" : "GAME OVER";
    modalTitle.textContent = won ? "PUZZLE SOLVED!" : "OUT OF GUESSES";
    modalSub.textContent = won
      ? "You found all four categories."
      : "Here are the category solutions for this puzzle.";

    shareGridPreview.innerHTML = '';
    const levelColors = ['#facc15', '#86efac', '#7dd3fc', '#d8b4fe'];
    const history = AppState.solvedPuzzles[activePuzzle.id]?.history || guessHistory;

    history.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'share-grid-row';
      row.forEach(lvl => {
        const block = document.createElement('div');
        block.className = 'share-block';
        block.style.backgroundColor = levelColors[lvl] || '#94a3b8';
        rowEl.appendChild(block);
      });
      shareGridPreview.appendChild(rowEl);
    });

    gameModal.classList.remove('hidden');
  }

  function generateShareText() {
    const puzzleTitle = activePuzzle ? activePuzzle.name : "Word Connections";
    const history = AppState.solvedPuzzles[activePuzzle.id]?.history || guessHistory;
    const emojiMap = ['🟨', '🟩', '🟦', '🟪'];
    
    let text = `BUTTON CURL 🍁\n${puzzleTitle}\n`;
    history.forEach(row => {
      text += row.map(lvl => emojiMap[lvl] || '⬜').join('') + '\n';
    });
    return text.trim();
  }

  function renderStatsModal() {
    const s = AppState.stats;
    statPlayed.textContent = s.played;
    statWinRate.textContent = s.played > 0 ? `${Math.round((s.wins / s.played) * 100)}%` : '0%';
    statCurrentStreak.textContent = s.currentStreak;
    statMaxStreak.textContent = s.maxStreak;

    distBarsRack.innerHTML = '';
    const maxVal = Math.max(...Object.values(s.distribution), 1);

    [4, 3, 2, 1].forEach(mistakes => {
      const count = s.distribution[mistakes] || 0;
      const pct = Math.max(Math.round((count / maxVal) * 100), 12);

      const row = document.createElement('div');
      row.className = 'dist-row';
      row.innerHTML = `
        <span class="dist-stone-count">${mistakes} Left</span>
        <div class="dist-bar-track">
          <div class="dist-bar-fill" style="width: ${count > 0 ? pct : 12}%">${count}</div>
        </div>
      `;
      distBarsRack.appendChild(row);
    });

    statsModal.classList.remove('hidden');
  }

  function showToast(msg) {
    toastBanner.textContent = msg;
    toastBanner.classList.add('visible');
    setTimeout(() => {
      toastBanner.classList.remove('visible');
    }, 2000);
  }

  function shuffleArray(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  btnMenuDaily.addEventListener('click', () => {
    sfx.playTap();
    const daily = getDailyPuzzle();
    if (daily) {
      startPuzzle(daily);
    }
  });

  btnMenuVault.addEventListener('click', () => {
    sfx.playTap();
    renderVaultList();
    switchScreen('vault', 'ARCHIVE');
  });

  btnMenuInstructions.addEventListener('click', () => {
    sfx.playTap();
    switchScreen('instructions', 'HOW TO PLAY');
  });

  btnCloseInstructions.addEventListener('click', () => {
    sfx.playTap();
    switchScreen('menu', 'DAILY PUZZLE');
  });

  btnHome.addEventListener('click', () => {
    sfx.playTap();
    updateMenuMeta();
    switchScreen('menu', 'DAILY PUZZLE');
  });

  btnShuffle.addEventListener('click', handleShuffle);
  btnDeselect.addEventListener('click', handleDeselectAll);
  btnSubmit.addEventListener('click', handleSubmit);

  btnSound.addEventListener('click', () => {
    sfx.enabled = !sfx.enabled;
    AppState.settings.soundEnabled = sfx.enabled;
    saveGameState(AppState);
    updateSoundUI();
    if (sfx.enabled) sfx.playTap();
  });

  btnStatsToggle.addEventListener('click', () => {
    sfx.playTap();
    renderStatsModal();
  });

  btnCloseStats.addEventListener('click', () => {
    sfx.playTap();
    statsModal.classList.add('hidden');
  });

  btnStatsReturn.addEventListener('click', () => {
    sfx.playTap();
    statsModal.classList.add('hidden');
  });

  statsModal.addEventListener('click', (e) => {
    if (e.target === statsModal) {
      sfx.playTap();
      statsModal.classList.add('hidden');
    }
  });

  btnModalStats.addEventListener('click', () => {
    sfx.playTap();
    gameModal.classList.add('hidden');
    renderStatsModal();
  });

  btnShareResult.addEventListener('click', () => {
    sfx.playTap();
    const text = generateShareText();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast("Scorecard copied to clipboard!");
      }).catch(() => {
        fallbackCopyText(text);
      });
    } else {
      fallbackCopyText(text);
    }
  });

  function fallbackCopyText(text) {
    try {
      const tempArea = document.createElement('textarea');
      tempArea.value = text;
      tempArea.style.position = 'fixed';
      tempArea.style.top = '-9999px';
      tempArea.style.left = '-9999px';
      document.body.appendChild(tempArea);
      tempArea.select();
      document.execCommand('copy');
      document.body.removeChild(tempArea);
      showToast("Scorecard copied to clipboard!");
    } catch (err) {
      showToast("Sharing not supported on this device");
    }
  }

  btnModalExit.addEventListener('click', () => {
    sfx.playTap();
    gameModal.classList.add('hidden');
    updateMenuMeta();
    switchScreen('menu', 'DAILY PUZZLE');
  });

  gameModal.addEventListener('click', (e) => {
    if (e.target === gameModal) {
      sfx.playTap();
      gameModal.classList.add('hidden');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'Escape') {
      if (!statsModal.classList.contains('hidden')) {
        statsModal.classList.add('hidden');
        return;
      }
      if (!gameModal.classList.contains('hidden')) {
        gameModal.classList.add('hidden');
        return;
      }
      handleDeselectAll();
    } else if (e.key === 'Backspace') {
      if (screens.game.classList.contains('active')) {
        handleDeselectAll();
      }
    } else if (e.key === 'Enter') {
      if (screens.game.classList.contains('active') && !btnSubmit.disabled) {
        handleSubmit();
      }
    }
  });

  function init() {
    updateSoundUI();
    updateMenuMeta();
    switchScreen('menu', 'DAILY PUZZLE');
  }

  init();
})();