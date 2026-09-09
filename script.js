/**
 * CURLING PUZZLES — CONNECTIONS GAME ENGINE
 * Architecture:
 * - Deterministic Calendar Scheduling (Baseline: 8 Sept 2026 = Day 0)
 * - 2D Curling Stone Collision Physics on Ambient Ice Canvas (Fixed Timestep 1/60s)
 * - Cached Procedural Granite & Gooseneck Handle Sprites (Red & Yellow Teams)
 * - Synthetic Web Audio SFX (Zero External Dependencies)
 * - Versioned LocalStorage State Persistence
 * - Strict Future Content Privacy
 */

(function () {
  "use strict";

  /* ==========================================================================
     1. CONSTANTS & CONFIGURATION
     ========================================================================== */
  const STORAGE_KEY = "curling_connections_player_state_v2";
  const STORAGE_VERSION = 2;
  const ANCHOR_DATE_UTC = Date.UTC(2026, 8, 8); // Sept 8, 2026 UTC = Day 0
  const MAX_MISTAKES = 4;

  /* ==========================================================================
     2. SYNTHETIC AUDIO ENGINE (Web Audio API)
     ========================================================================== */
  class SoundController {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    play(type) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        if (this.ctx.state === "suspended") {
          this.ctx.resume();
        }

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        switch (type) {
          case "tap":
            // Crisp stone click
            osc.type = "sine";
            osc.frequency.setValueAtTime(560, now);
            osc.frequency.exponentialRampToValueAtTime(840, now + 0.04);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
            break;

          case "deselect":
            // Soft stone slide back
            osc.type = "sine";
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(290, now + 0.05);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
            osc.start(now);
            osc.stop(now + 0.06);
            break;

          case "solve":
            // Harmonious curling 4-note chime
            [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
              const subOsc = this.ctx.createOscillator();
              const subGain = this.ctx.createGain();
              subOsc.connect(subGain);
              subGain.connect(this.ctx.destination);
              subOsc.frequency.setValueAtTime(freq, now + idx * 0.06);
              subGain.gain.setValueAtTime(0.12, now + idx * 0.06);
              subGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.35);
              subOsc.start(now + idx * 0.06);
              subOsc.stop(now + idx * 0.06 + 0.36);
            });
            break;

          case "mistake":
            // Low double bump
            osc.type = "triangle";
            osc.frequency.setValueAtTime(170, now);
            osc.frequency.setValueAtTime(135, now + 0.08);
            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
            osc.start(now);
            osc.stop(now + 0.23);
            break;

          case "win":
            // Celebratory fanfare
            [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, idx) => {
              const subOsc = this.ctx.createOscillator();
              const subGain = this.ctx.createGain();
              subOsc.connect(subGain);
              subGain.connect(this.ctx.destination);
              subOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
              subGain.gain.setValueAtTime(0.15, now + idx * 0.08);
              subGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
              subOsc.start(now + idx * 0.08);
              subOsc.stop(now + idx * 0.08 + 0.62);
            });
            break;
        }
      } catch (err) {
        // Safe silence on autoplay policy restriction
      }
    }
  }

  /* ==========================================================================
     3. 2D BACKGROUND CURLING STONE PHYSICS WITH SPRITE CACHING
     ========================================================================== */
  class BackgroundPhysics {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas.getContext("2d");
      this.stones = [];
      this.animId = null;
      this.activeGame = false;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Fixed timestep accumulator
      this.lastTime = performance.now();
      this.fixedStep = 1 / 60;
      this.accumulator = 0;

      // High-speed entry event timer
      this.nextAggressiveTime = performance.now() + 25000 + Math.random() * 15000;

      // Offscreen Cached Sprites for Granite Rocks
      this.sprites = { red: null, yellow: null };
      this.spriteBaseRadius = 40;
      this.buildStoneSprites();

      this.init();
    }

    buildStoneSprites() {
      ["red", "yellow"].forEach(team => {
        const r = this.spriteBaseRadius;
        const size = (r + 10) * 2;
        const c = document.createElement("canvas");
        c.width = size;
        c.height = size;
        const ctx = c.getContext("2d");
        const cx = size / 2;
        const cy = size / 2;

        // 1. Soft Ice Contact Ground Shadow
        ctx.beginPath();
        ctx.ellipse(cx, cy + 3, r * 0.98, r * 0.90, 0, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 47, 74, 0.18)";
        ctx.filter = "blur(3px)";
        ctx.fill();
        ctx.filter = "none";

        // 2. Base Granite Body (Ailsa Craig Blue-Grey)
        const graniteGrad = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.25, r * 0.1, cx, cy, r);
        graniteGrad.addColorStop(0, "#7a8a99");
        graniteGrad.addColorStop(0.5, "#4e5d6c");
        graniteGrad.addColorStop(0.85, "#334150");
        graniteGrad.addColorStop(1, "#1e293b");

        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = graniteGrad;
        ctx.fill();

        // 3. Granite Micro-speckling (Procedural Quartz & Hornblende flecks)
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r - 1, 0, Math.PI * 2);
        ctx.clip();
        for (let i = 0; i < 90; i++) {
          const angle = (i * 137.5) * (Math.PI / 180);
          const dist = Math.sqrt(i / 90) * (r - 2);
          const px = cx + Math.cos(angle) * dist;
          const py = cy + Math.sin(angle) * dist;
          ctx.fillStyle = i % 2 === 0 ? "rgba(255, 255, 255, 0.15)" : "rgba(15, 23, 42, 0.35)";
          ctx.fillRect(px, py, 1.2, 1.2);
        }
        ctx.restore();

        // 4. Striking Band & Outer Bevel
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = "rgba(16, 47, 74, 0.4)";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
        ctx.stroke();

        // Inner Top Plane Bevel
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.68, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(51, 65, 80, 0.75)";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.stroke();

        // 5. Gooseneck Handle with Fastener Studs
        // Handle Shadow on granite
        ctx.beginPath();
        ctx.roundRect(cx - r * 0.38, cy - r * 0.12 + 2, r * 0.76, r * 0.28, 5);
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
        ctx.fill();

        // Handle Studs
        ctx.beginPath();
        ctx.arc(cx - r * 0.28, cy, 3, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.28, cy, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#94a3b8";
        ctx.fill();

        // Handle Main Body
        ctx.beginPath();
        ctx.roundRect(cx - r * 0.36, cy - r * 0.13, r * 0.72, r * 0.26, 4);
        if (team === "red") {
          const hGrad = ctx.createLinearGradient(cx, cy - r * 0.13, cx, cy + r * 0.13);
          hGrad.addColorStop(0, "#ee6865");
          hGrad.addColorStop(0.5, "#d63b3b");
          hGrad.addColorStop(1, "#b92e34");
          ctx.fillStyle = hGrad;
        } else {
          const hGrad = ctx.createLinearGradient(cx, cy - r * 0.13, cx, cy + r * 0.13);
          hGrad.addColorStop(0, "#ffe698");
          hGrad.addColorStop(0.5, "#f0c647");
          hGrad.addColorStop(1, "#d8aa32");
          ctx.fillStyle = hGrad;
        }
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.stroke();

        this.sprites[team] = c;
      });
    }

    init() {
      this.resize();
      window.addEventListener("resize", () => this.resize(), { passive: true });
      this.spawnStones();
      if (!this.reducedMotion) {
        this.loop();
      } else {
        this.drawStaticFrame();
      }
    }

    resize() {
      this.width = this.canvas.width = window.innerWidth;
      this.height = this.canvas.height = window.innerHeight;
    }

    spawnStones() {
      this.stones = [];
      const count = this.activeGame ? 3 : Math.min(6, Math.max(4, Math.floor(this.width / 180)));
      const teams = ["red", "yellow"];

      for (let i = 0; i < count; i++) {
        const radius = Math.min(30, Math.max(20, this.width * 0.032));
        let x = Math.random() * (this.width - radius * 4) + radius * 2;
        let y = Math.random() * (this.height - radius * 4) + radius * 2;

        // Ensure clean non-overlapping initial placement
        for (let j = 0; j < this.stones.length; j++) {
          const dx = x - this.stones[j].x;
          const dy = y - this.stones[j].y;
          if (Math.hypot(dx, dy) < radius + this.stones[j].radius + 8) {
            x = Math.random() * (this.width - radius * 4) + radius * 2;
            y = Math.random() * (this.height - radius * 4) + radius * 2;
            j = -1;
          }
        }

        const angle = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 0.35; // Gentle curling ice glide

        this.stones.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius,
          mass: radius * radius,
          team: teams[i % 2],
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.004,
          isAggressive: false
        });
      }
    }

    setActiveGameMode(isActive) {
      this.activeGame = isActive;
      this.spawnStones();
    }

    spawnAggressiveRock() {
      if (this.activeGame || this.stones.length >= 8) return;
      const radius = Math.min(30, Math.max(20, this.width * 0.032));
      const fromLeft = Math.random() > 0.5;
      const x = fromLeft ? -radius : this.width + radius;
      const y = Math.random() * (this.height * 0.6) + this.height * 0.2;
      const targetX = this.width * (0.3 + Math.random() * 0.4);
      const targetY = this.height * (0.3 + Math.random() * 0.4);
      const angle = Math.atan2(targetY - y, targetX - x);
      const speed = 2.4 + Math.random() * 1.2;

      this.stones.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius,
        mass: radius * radius * 1.2,
        team: Math.random() > 0.5 ? "red" : "yellow",
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.02,
        isAggressive: true
      });
    }

    stepSimulation() {
      // 1. Position update & wall boundaries with restitution
      for (let i = 0; i < this.stones.length; i++) {
        const s = this.stones[i];
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.vRot;

        // Ice Friction Damping
        s.vx *= 0.9988;
        s.vy *= 0.9988;
        s.vRot *= 0.996;

        // Maintain calm baseline motion
        const curSpeed = Math.hypot(s.vx, s.vy);
        if (curSpeed < 0.12 && !s.isAggressive) {
          const a = Math.random() * Math.PI * 2;
          s.vx = Math.cos(a) * 0.22;
          s.vy = Math.sin(a) * 0.22;
        }

        // Boundary bounce with slight damping
        if (s.x - s.radius < 0) {
          s.x = s.radius;
          s.vx = Math.abs(s.vx) * 0.85;
        } else if (s.x + s.radius > this.width) {
          s.x = this.width - s.radius;
          s.vx = -Math.abs(s.vx) * 0.85;
        }

        if (s.y - s.radius < 0) {
          s.y = s.radius;
          s.vy = Math.abs(s.vy) * 0.85;
        } else if (s.y + s.radius > this.height) {
          s.y = this.height - s.radius;
          s.vy = -Math.abs(s.vy) * 0.85;
        }
      }

      // 2. Pairwise Circle-Circle Collision Detection & Resolution
      for (let i = 0; i < this.stones.length; i++) {
        for (let j = i + 1; j < this.stones.length; j++) {
          const s1 = this.stones[i];
          const s2 = this.stones[j];

          const dx = s2.x - s1.x;
          const dy = s2.y - s1.y;
          const dist = Math.hypot(dx, dy);
          const minDist = s1.radius + s2.radius;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;

            // Anti-sticking positional correction
            const overlap = (minDist - dist) * 0.5;
            s1.x -= nx * overlap;
            s1.y -= ny * overlap;
            s2.x += nx * overlap;
            s2.y += ny * overlap;

            // Relative velocities along collision normal
            const kx = s1.vx - s2.vx;
            const ky = s1.vy - s2.vy;
            const p = 2 * (nx * kx + ny * ky) / (s1.mass + s2.mass);

            // Curling Stone Restitution
            const restitution = 0.82;

            s1.vx -= p * s2.mass * nx * restitution;
            s1.vy -= p * s2.mass * ny * restitution;
            s2.vx += p * s1.mass * nx * restitution;
            s2.vy += p * s1.mass * ny * restitution;

            // Rotation transfer
            s1.vRot += (Math.random() - 0.5) * 0.006;
            s2.vRot += (Math.random() - 0.5) * 0.006;

            if (s1.isAggressive || s2.isAggressive) {
              s1.isAggressive = false;
              s2.isAggressive = false;
            }
          }
        }
      }
    }

    render() {
      this.ctx.clearRect(0, 0, this.width, this.height);

      // Render Soft Curling House Rink Rings
      const cx = this.width * 0.5;
      const cy = this.height * 0.32;
      const ringScale = Math.min(this.width, this.height) * 0.36;

      this.ctx.save();
      this.ctx.globalAlpha = 0.08;

      // 12-Foot Outer Blue Ring
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, ringScale, 0, Math.PI * 2);
      this.ctx.fillStyle = "#1d4ed8";
      this.ctx.fill();

      // 8-Foot White Ring
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, ringScale * 0.66, 0, Math.PI * 2);
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fill();

      // 4-Foot Red Ring
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, ringScale * 0.33, 0, Math.PI * 2);
      this.ctx.fillStyle = "#d63b3b";
      this.ctx.fill();

      // Center Button
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, ringScale * 0.1, 0, Math.PI * 2);
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fill();

      // Rink Crosshairs (Tee Line & Centre Line)
      this.ctx.strokeStyle = "rgba(16, 47, 74, 0.4)";
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - ringScale * 1.2);
      this.ctx.lineTo(cx, cy + ringScale * 1.2);
      this.ctx.moveTo(cx - ringScale * 1.2, cy);
      this.ctx.lineTo(cx + ringScale * 1.2, cy);
      this.ctx.stroke();

      this.ctx.restore();

      // Render Cached Curling Stones
      for (let i = 0; i < this.stones.length; i++) {
        const s = this.stones[i];
        const sprite = this.sprites[s.team];
        if (!sprite) continue;

        const renderRadius = s.radius + 10;
        this.ctx.save();
        this.ctx.translate(s.x, s.y);
        this.ctx.rotate(s.rotation);
        this.ctx.drawImage(
          sprite,
          -renderRadius,
          -renderRadius,
          renderRadius * 2,
          renderRadius * 2
        );
        this.ctx.restore();
      }
    }

    loop() {
      const now = performance.now();
      const elapsed = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;
      this.accumulator += elapsed;

      // High-speed delivery event check
      if (now > this.nextAggressiveTime) {
        this.spawnAggressiveRock();
        this.nextAggressiveTime = now + 30000 + Math.random() * 20000;
      }

      // Fixed Timestep Simulation Loop
      while (this.accumulator >= this.fixedStep) {
        this.stepSimulation();
        this.accumulator -= this.fixedStep;
      }

      this.render();
      this.animId = requestAnimationFrame(() => this.loop());
    }

    drawStaticFrame() {
      this.render();
    }
  }

  /* ==========================================================================
     4. DETERMINISTIC DAILY SCHEDULER & CONTINUITY
     ========================================================================== */
  class DailyScheduler {
    static getTodayIndex() {
      const now = new Date();
      const userMidnightUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
      const diffDays = Math.floor((userMidnightUTC - ANCHOR_DATE_UTC) / (1000 * 60 * 60 * 24));
      // Prior to Sept 8, 2026, defaults to Day 0 for seamless verification and testing
      return Math.max(0, diffDays);
    }

    static getPuzzleForIndex(index) {
      const puzzles = window.CURLING_CONNECTIONS_PUZZLES || [];
      if (!puzzles.length) return null;
      // Deterministic stable sequence assignment with safe wraparound
      const sequenceIndex = index % puzzles.length;
      return puzzles[sequenceIndex];
    }

    static getReleasedPuzzles(currentDayIndex) {
      const puzzles = window.CURLING_CONNECTIONS_PUZZLES || [];
      // Vault displays strictly PAST released archives (sequence < currentDayIndex)
      // Day 0: Vault is empty. Day 1: Vault contains Day 0.
      return puzzles.filter(p => p.sequence < currentDayIndex);
    }

    static formatPuzzleDate(releaseDateStr, sequence) {
      if (!releaseDateStr) return `Day ${sequence}`;
      const [y, m, d] = releaseDateStr.split("-").map(Number);
      const dateObj = new Date(Date.UTC(y, m - 1, d));
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC"
      });
    }
  }

  /* ==========================================================================
     5. VERSIONED STORAGE CONTROLLER
     ========================================================================== */
  class StorageManager {
    static load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return StorageManager.getDefault();
        const parsed = JSON.parse(raw);
        if (parsed && parsed.version === STORAGE_VERSION) {
          return parsed;
        }
        return StorageManager.getDefault();
      } catch (err) {
        return StorageManager.getDefault();
      }
    }

    static save(data) {
      try {
        data.version = STORAGE_VERSION;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (err) {
        // Gracefully handle storage quota or private browsing limits
      }
    }

    static getDefault() {
      return {
        version: STORAGE_VERSION,
        soundEnabled: true,
        stats: {
          played: 0,
          won: 0,
          currentStreak: 0,
          maxStreak: 0
        },
        puzzleProgress: {} // [puzzleId]: { solvedGroupIndices: [], mistakesRemaining: 4, completed: false, won: false, guessHistory: [] }
      };
    }
  }

  /* ==========================================================================
     6. MAIN CONNECTIONS APPLICATION ENGINE
     ========================================================================== */
  class CurlingConnectionsApp {
    constructor() {
      this.sound = new SoundController();
      this.physics = new BackgroundPhysics("curling-bg-canvas");
      this.state = StorageManager.load();
      this.sound.enabled = this.state.soundEnabled ?? true;

      this.currentDayIndex = DailyScheduler.getTodayIndex();
      this.activePuzzle = null;
      this.selectedWords = [];
      this.solvedCategoryIndices = [];
      this.remainingWords = [];
      this.mistakesRemaining = MAX_MISTAKES;
      this.isGameOver = false;
      this.guessHistory = [];

      this.initDom();
      this.bindEvents();
      this.renderMenu();
    }

    initDom() {
      // Screens
      this.screenMenu = document.getElementById("screen-menu");
      this.screenGame = document.getElementById("screen-game");
      this.screenVault = document.getElementById("screen-vault");

      // Menu Elements
      this.btnPlayToday = document.getElementById("btn-play-today");
      this.btnPlayTodayText = document.getElementById("btn-play-today-text");
      this.todayDayLabel = document.getElementById("today-day-label");
      this.todayStatusText = document.getElementById("today-status-text");
      this.todayPuzzleTitle = document.getElementById("today-puzzle-title");
      this.vaultCountLabel = document.getElementById("vault-count-label");

      this.btnOpenVault = document.getElementById("btn-open-vault");
      this.btnToggleSound = document.getElementById("btn-toggle-sound");
      this.soundStateText = document.getElementById("sound-state-text");
      this.soundIconOn = this.btnToggleSound.querySelector(".sound-icon-on");
      this.soundIconOff = this.btnToggleSound.querySelector(".sound-icon-off");

      this.btnOpenHelp = document.getElementById("btn-open-help");
      this.btnOpenStats = document.getElementById("btn-open-stats");

      // Game Screen Elements
      this.btnGameBack = document.getElementById("btn-game-back");
      this.btnGameHelp = document.getElementById("btn-game-help");
      this.gameDateBadge = document.getElementById("game-date-badge");
      this.gameTitleText = document.getElementById("game-title-text");
      this.toastMessage = document.getElementById("toast-message");
      this.solvedContainer = document.getElementById("solved-groups-container");
      this.gridContainer = document.getElementById("connections-grid");
      this.mistakeStonesWrap = document.getElementById("mistake-stones-wrap");

      this.btnShuffle = document.getElementById("btn-shuffle");
      this.btnDeselectAll = document.getElementById("btn-deselect-all");
      this.btnSubmit = document.getElementById("btn-submit");

      // Vault Screen Elements
      this.btnVaultBack = document.getElementById("btn-vault-back");
      this.vaultList = document.getElementById("vault-list");

      // Modals
      this.modalHelp = document.getElementById("modal-help");
      this.btnCloseHelp = document.getElementById("btn-close-help");
      this.btnDismissHelp = document.getElementById("btn-dismiss-help");

      this.modalStats = document.getElementById("modal-stats");
      this.btnCloseStats = document.getElementById("btn-close-stats");
      this.btnDismissStats = document.getElementById("btn-dismiss-stats");
      this.statPlayed = document.getElementById("stat-played");
      this.statWinRate = document.getElementById("stat-win-rate");
      this.statCurrentStreak = document.getElementById("stat-current-streak");
      this.statMaxStreak = document.getElementById("stat-max-streak");

      this.modalResult = document.getElementById("modal-result");
      this.btnCloseResult = document.getElementById("btn-close-result");
      this.btnResultMenu = document.getElementById("btn-result-menu");
      this.btnShareResult = document.getElementById("btn-share-result");
      this.resultOutcomeMsg = document.getElementById("result-outcome-msg");
      this.resultEmojiGrid = document.getElementById("result-emoji-grid");
      this.resultMistakesUsed = document.getElementById("result-mistakes-used");

      this.updateSoundUi();
    }

    bindEvents() {
      // Menu Actions
      this.btnPlayToday.addEventListener("click", () => {
        const todayPuzzle = DailyScheduler.getPuzzleForIndex(this.currentDayIndex);
        this.loadPuzzle(todayPuzzle, true);
      });

      this.btnOpenVault.addEventListener("click", () => this.showScreen("vault"));
      this.btnVaultBack.addEventListener("click", () => this.showScreen("menu"));

      // Game Actions
      this.btnGameBack.addEventListener("click", () => {
        this.saveCurrentPuzzleState();
        this.renderMenu();
        this.showScreen("menu");
      });

      this.btnGameHelp.addEventListener("click", () => this.openModal(this.modalHelp));
      this.btnOpenHelp.addEventListener("click", () => this.openModal(this.modalHelp));
      this.btnCloseHelp.addEventListener("click", () => this.closeModal(this.modalHelp));
      this.btnDismissHelp.addEventListener("click", () => this.closeModal(this.modalHelp));

      this.btnOpenStats.addEventListener("click", () => this.openStatsModal());
      this.btnCloseStats.addEventListener("click", () => this.closeModal(this.modalStats));
      this.btnDismissStats.addEventListener("click", () => this.closeModal(this.modalStats));

      this.btnToggleSound.addEventListener("click", () => {
        const enabled = this.sound.toggle();
        this.state.soundEnabled = enabled;
        StorageManager.save(this.state);
        this.updateSoundUi();
        if (enabled) this.sound.play("tap");
      });

      this.btnShuffle.addEventListener("click", () => this.shuffleRemaining());
      this.btnDeselectAll.addEventListener("click", () => this.deselectAll());
      this.btnSubmit.addEventListener("click", () => this.submitGuess());

      // Result Modal Actions
      this.btnCloseResult.addEventListener("click", () => this.closeModal(this.modalResult));
      this.btnResultMenu.addEventListener("click", () => {
        this.closeModal(this.modalResult);
        this.renderMenu();
        this.showScreen("menu");
      });
      this.btnShareResult.addEventListener("click", () => this.shareResult());

      // Modal Background Dismissal & Keyboard ESC
      [this.modalHelp, this.modalStats, this.modalResult].forEach(modal => {
        modal.addEventListener("click", (e) => {
          if (e.target === modal) this.closeModal(modal);
        });
      });

      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          [this.modalHelp, this.modalStats, this.modalResult].forEach(m => this.closeModal(m));
        }
      });

      // Midnight Rollover Monitoring
      document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
          const freshDay = DailyScheduler.getTodayIndex();
          if (freshDay !== this.currentDayIndex) {
            this.currentDayIndex = freshDay;
            this.renderMenu();
          }
        }
      });
    }

    updateSoundUi() {
      if (this.sound.enabled) {
        this.soundStateText.textContent = "Sound: ON";
        this.soundIconOn.classList.remove("sound-icon-hidden");
        this.soundIconOff.classList.add("sound-icon-hidden");
        this.btnToggleSound.setAttribute("aria-pressed", "true");
      } else {
        this.soundStateText.textContent = "Sound: OFF";
        this.soundIconOn.classList.add("sound-icon-hidden");
        this.soundIconOff.classList.remove("sound-icon-hidden");
        this.btnToggleSound.setAttribute("aria-pressed", "false");
      }
    }

    showScreen(name) {
      [this.screenMenu, this.screenGame, this.screenVault].forEach(s => s.classList.remove("screen-active"));
      if (name === "menu") {
        this.screenMenu.classList.add("screen-active");
        this.physics.setActiveGameMode(false);
      } else if (name === "game") {
        this.screenGame.classList.add("screen-active");
        this.physics.setActiveGameMode(true);
      } else if (name === "vault") {
        this.screenVault.classList.add("screen-active");
        this.physics.setActiveGameMode(false);
        this.renderVault();
      }
    }

    openModal(modal) {
      modal.removeAttribute("hidden");
    }

    closeModal(modal) {
      modal.setAttribute("hidden", "");
    }

    renderMenu() {
      const todayPuzzle = DailyScheduler.getPuzzleForIndex(this.currentDayIndex);
      if (!todayPuzzle) return;

      const progress = this.state.puzzleProgress[todayPuzzle.id];
      const isCompleted = progress && progress.completed;
      const inProgress = progress && !progress.completed && (progress.solvedGroupIndices.length > 0 || progress.mistakesRemaining < MAX_MISTAKES);

      this.todayDayLabel.textContent = `Day ${todayPuzzle.sequence}`;
      this.todayPuzzleTitle.textContent = todayPuzzle.title;

      if (isCompleted) {
        this.todayStatusText.textContent = progress.won ? "Solved" : "Completed";
        this.todayStatusText.style.color = "#15803d";
        this.btnPlayTodayText.textContent = "Review Board";
      } else if (inProgress) {
        this.todayStatusText.textContent = "In Progress";
        this.todayStatusText.style.color = "var(--ink-secondary)";
        this.btnPlayTodayText.textContent = "Continue";
      } else {
        this.todayStatusText.textContent = "Unplayed";
        this.todayStatusText.style.color = "var(--ink-muted)";
        this.btnPlayTodayText.textContent = "Play";
      }

      const released = DailyScheduler.getReleasedPuzzles(this.currentDayIndex);
      this.vaultCountLabel.textContent = `${released.length} Released Archive${released.length === 1 ? "" : "s"}`;
    }

    renderVault() {
      this.vaultList.innerHTML = "";
      const released = DailyScheduler.getReleasedPuzzles(this.currentDayIndex);

      if (!released.length) {
        const emptyMsg = document.createElement("p");
        emptyMsg.style.textAlign = "center";
        emptyMsg.style.padding = "32px 20px";
        emptyMsg.style.color = "var(--ink-muted)";
        emptyMsg.style.fontWeight = "600";
        emptyMsg.textContent = "Vault opens on Day 1 once today's inaugural puzzle is archived.";
        this.vaultList.appendChild(emptyMsg);
        return;
      }

      // Reverse chronological order for past archives
      [...released].reverse().forEach(p => {
        const progress = this.state.puzzleProgress[p.id];
        const isSolved = progress && progress.completed && progress.won;
        const isCompleted = progress && progress.completed;

        const card = document.createElement("article");
        card.className = "vault-card glass-panel-secondary";
        card.tabIndex = 0;
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `${p.title}, ${DailyScheduler.formatPuzzleDate(p.releaseDate, p.sequence)}`);

        card.innerHTML = `
          <div class="vault-card-left">
            <span class="vault-card-title">${p.title}</span>
            <span class="vault-card-date">${DailyScheduler.formatPuzzleDate(p.releaseDate, p.sequence)} • ${p.curriculumCategory}</span>
          </div>
          <span class="vault-card-status ${isSolved ? "status-solved" : "status-unsolved"}">
            ${isSolved ? "Solved" : (isCompleted ? "Ended" : "Play")}
          </span>
        `;

        const openHandler = () => this.loadPuzzle(p, false);
        card.addEventListener("click", openHandler);
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openHandler();
          }
        });

        this.vaultList.appendChild(card);
      });
    }

    loadPuzzle(puzzle, isToday) {
      if (!puzzle) return;
      this.activePuzzle = puzzle;
      this.selectedWords = [];
      this.guessHistory = [];

      this.gameDateBadge.textContent = isToday ? "Today" : `Vault • Day ${puzzle.sequence}`;
      this.gameTitleText.textContent = puzzle.title;

      const saved = this.state.puzzleProgress[puzzle.id];
      if (saved) {
        this.solvedCategoryIndices = [...saved.solvedGroupIndices];
        this.mistakesRemaining = saved.mistakesRemaining;
        this.isGameOver = saved.completed;
        this.guessHistory = saved.guessHistory || [];
      } else {
        this.solvedCategoryIndices = [];
        this.mistakesRemaining = MAX_MISTAKES;
        this.isGameOver = false;
        this.guessHistory = [];
      }

      // Build remaining words list
      this.remainingWords = [];
      this.activePuzzle.groups.forEach((grp, idx) => {
        if (!this.solvedCategoryIndices.includes(idx)) {
          grp.items.forEach(word => this.remainingWords.push(word));
        }
      });

      this.shuffleArray(this.remainingWords);
      this.renderSolvedRows();
      this.renderTiles();
      this.renderMistakesUi();
      this.updateControlsState();
      this.showScreen("game");
    }

    renderSolvedRows() {
      this.solvedContainer.innerHTML = "";
      this.solvedCategoryIndices.forEach(idx => {
        const grp = this.activePuzzle.groups[idx];
        const row = document.createElement("div");
        row.className = `solved-group-row tier-${grp.level}`;
        row.innerHTML = `
          <div class="solved-group-name">${grp.category}</div>
          <div class="solved-group-words">${grp.items.join(", ")}</div>
        `;
        this.solvedContainer.appendChild(row);
      });
    }

    renderTiles() {
      this.gridContainer.innerHTML = "";
      this.remainingWords.forEach(word => {
        const tile = document.createElement("button");
        tile.type = "button";
        tile.className = "word-tile";
        if (this.selectedWords.includes(word)) {
          tile.classList.add("selected");
          tile.setAttribute("aria-pressed", "true");
        } else {
          tile.setAttribute("aria-pressed", "false");
        }

        tile.textContent = word;
        tile.addEventListener("click", () => this.toggleTile(word));
        this.gridContainer.appendChild(tile);
      });
    }

    renderMistakesUi() {
      const indicators = this.mistakeStonesWrap.querySelectorAll(".stone-indicator");
      indicators.forEach((indicator, idx) => {
        if (idx < this.mistakesRemaining) {
          indicator.classList.add("active");
        } else {
          indicator.classList.remove("active");
        }
      });
    }

    toggleTile(word) {
      if (this.isGameOver) return;

      const idx = this.selectedWords.indexOf(word);
      if (idx > -1) {
        this.selectedWords.splice(idx, 1);
        this.sound.play("deselect");
      } else {
        if (this.selectedWords.length >= 4) return;
        this.selectedWords.push(word);
        this.sound.play("tap");
      }

      this.renderTiles();
      this.updateControlsState();
    }

    updateControlsState() {
      const count = this.selectedWords.length;
      this.btnDeselectAll.disabled = count === 0 || this.isGameOver;
      this.btnSubmit.disabled = count !== 4 || this.isGameOver;
    }

    deselectAll() {
      if (this.selectedWords.length === 0) return;
      this.selectedWords = [];
      this.sound.play("deselect");
      this.renderTiles();
      this.updateControlsState();
    }

    shuffleRemaining() {
      if (this.remainingWords.length <= 1) return;
      this.sound.play("tap");
      this.shuffleArray(this.remainingWords);
      this.renderTiles();
    }

    showToast(message) {
      this.toastMessage.textContent = message;
      this.toastMessage.classList.add("toast-visible");
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.toastMessage.classList.remove("toast-visible");
      }, 2400);
    }

    submitGuess() {
      if (this.selectedWords.length !== 4 || this.isGameOver) return;

      // Duplicate guess check
      const sortedCurrentGuess = [...this.selectedWords].sort().join("|");
      const alreadyGuessed = this.guessHistory.some(g => [...g].sort().join("|") === sortedCurrentGuess);
      if (alreadyGuessed) {
        this.showToast("Already guessed!");
        this.shakeSelectedTiles();
        return;
      }

      this.guessHistory.push([...this.selectedWords]);

      // Category matching
      let matchedCategoryIndex = -1;
      let highestOverlap = 0;

      for (let i = 0; i < this.activePuzzle.groups.length; i++) {
        if (this.solvedCategoryIndices.includes(i)) continue;
        const grp = this.activePuzzle.groups[i];
        const matchCount = this.selectedWords.filter(w => grp.items.includes(w)).length;
        if (matchCount === 4) {
          matchedCategoryIndex = i;
          break;
        }
        if (matchCount > highestOverlap) {
          highestOverlap = matchCount;
        }
      }

      if (matchedCategoryIndex > -1) {
        // Solved a category
        this.sound.play("solve");
        this.solvedCategoryIndices.push(matchedCategoryIndex);
        const solvedGroup = this.activePuzzle.groups[matchedCategoryIndex];

        // Remove words from active grid
        this.remainingWords = this.remainingWords.filter(w => !solvedGroup.items.includes(w));
        this.selectedWords = [];

        this.renderSolvedRows();
        this.renderTiles();
        this.updateControlsState();

        if (this.solvedCategoryIndices.length === 4) {
          this.endGame(true);
        } else {
          this.saveCurrentPuzzleState();
        }
      } else {
        // Mistake made
        this.sound.play("mistake");
        this.mistakesRemaining = Math.max(0, this.mistakesRemaining - 1);
        this.renderMistakesUi();
        this.shakeSelectedTiles();

        if (highestOverlap === 3) {
          this.showToast("One away...");
        }

        if (this.mistakesRemaining === 0) {
          this.endGame(false);
        } else {
          this.saveCurrentPuzzleState();
        }
      }
    }

    shakeSelectedTiles() {
      const tileEls = this.gridContainer.querySelectorAll(".word-tile.selected");
      tileEls.forEach(el => {
        el.classList.add("shake");
        setTimeout(() => el.classList.remove("shake"), 450);
      });
    }

    endGame(won) {
      this.isGameOver = true;
      this.updateControlsState();

      if (!won) {
        // Reveal remaining categories cleanly
        this.activePuzzle.groups.forEach((grp, idx) => {
          if (!this.solvedCategoryIndices.includes(idx)) {
            this.solvedCategoryIndices.push(idx);
          }
        });
        this.remainingWords = [];
        this.renderSolvedRows();
        this.renderTiles();
      } else {
        this.sound.play("win");
      }

      // Update Player Statistics on first resolution
      const priorState = this.state.puzzleProgress[this.activePuzzle.id];
      const wasAlreadyCompleted = priorState && priorState.completed;

      if (!wasAlreadyCompleted) {
        this.state.stats.played += 1;
        if (won) {
          this.state.stats.won += 1;
          this.state.stats.currentStreak += 1;
          if (this.state.stats.currentStreak > this.state.stats.maxStreak) {
            this.state.stats.maxStreak = this.state.stats.currentStreak;
          }
        } else {
          this.state.stats.currentStreak = 0;
        }
      }

      this.saveCurrentPuzzleState(won);
      setTimeout(() => this.showResultModal(won), 650);
    }

    saveCurrentPuzzleState(won = null) {
      if (!this.activePuzzle) return;
      const priorCompleted = this.state.puzzleProgress[this.activePuzzle.id]?.completed || false;
      const priorWon = this.state.puzzleProgress[this.activePuzzle.id]?.won || false;

      this.state.puzzleProgress[this.activePuzzle.id] = {
        solvedGroupIndices: this.solvedCategoryIndices,
        mistakesRemaining: this.mistakesRemaining,
        completed: this.isGameOver || priorCompleted,
        won: won !== null ? won : priorWon,
        guessHistory: this.guessHistory
      };
      StorageManager.save(this.state);
    }

    showResultModal(won) {
      this.resultOutcomeMsg.textContent = won ? "Shot of the Day! All Categories Solved." : "Good Effort! End of Attempts.";
      this.resultMistakesUsed.textContent = `Mistakes used: ${MAX_MISTAKES - this.mistakesRemaining} of ${MAX_MISTAKES}`;

      // Build Result Visual Grid
      this.resultEmojiGrid.innerHTML = "";
      const tierEmoji = {
        1: "🟨", // Gold handle
        2: "🟦", // Outer blue ring
        3: "🟥", // Inner red ring
        4: "🟪"  // Scottish granite purple
      };

      this.guessHistory.forEach(guess => {
        const row = document.createElement("div");
        const squares = guess.map(word => {
          for (let i = 0; i < this.activePuzzle.groups.length; i++) {
            if (this.activePuzzle.groups[i].items.includes(word)) {
              return tierEmoji[this.activePuzzle.groups[i].level] || "🟦";
            }
          }
          return "⬜";
        }).join(" ");
        row.textContent = squares;
        this.resultEmojiGrid.appendChild(row);
      });

      this.openModal(this.modalResult);
    }

    shareResult() {
      const tierEmoji = { 1: "🟨", 2: "🟦", 3: "🟥", 4: "🟪" };
      let text = `Curling Connections\n${this.activePuzzle.title}\n`;

      this.guessHistory.forEach(guess => {
        const rowStr = guess.map(word => {
          for (let i = 0; i < this.activePuzzle.groups.length; i++) {
            if (this.activePuzzle.groups[i].items.includes(word)) {
              return tierEmoji[this.activePuzzle.groups[i].level] || "🟦";
            }
          }
          return "⬜";
        }).join("");
        text += rowStr + "\n";
      });

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast("Result copied to clipboard!");
        }).catch(() => {
          this.showToast("Could not copy result.");
        });
      }
    }

    openStatsModal() {
      const s = this.state.stats;
      this.statPlayed.textContent = s.played;
      const rate = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;
      this.statWinRate.textContent = `${rate}%`;
      this.statCurrentStreak.textContent = s.currentStreak;
      this.statMaxStreak.textContent = s.maxStreak;
      this.openModal(this.modalStats);
    }

    shuffleArray(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  }

  // Launch once DOM is ready
  document.addEventListener("DOMContentLoaded", () => {
    window.curlingConnectionsApp = new CurlingConnectionsApp();
  });
})();