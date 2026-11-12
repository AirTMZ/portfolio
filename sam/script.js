const canvas = document.getElementById('game-canvas');
let ctx = canvas.getContext('2d');

// UI Elements
const startOverlay = document.getElementById('start-overlay');
const gameoverOverlay = document.getElementById('gameover-overlay');
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const restartBtn = document.getElementById('restart-btn');
const muteBtn = document.getElementById('mute-btn');

const scoreValEl = document.getElementById('score-val');
const highscoreValEl = document.getElementById('highscore-val');
const levelValEl = document.getElementById('level-val');
const timerValEl = document.getElementById('timer-val');
const timerBoxEl = document.getElementById('timer-box');

const finalScoreEl = document.getElementById('final-score');
const finalHighscoreEl = document.getElementById('final-highscore');
const finalLevelEl = document.getElementById('final-level');
const deathTitleEl = document.getElementById('death-title');
const deathReasonEl = document.getElementById('death-reason');

const samCamCard = document.getElementById('sam-cam-card');
const camAlert = document.getElementById('cam-alert');
const camIce = document.getElementById('cam-ice');
const camZzz = document.getElementById('cam-zzz');
const samStateText = document.getElementById('sam-state-text');
const canvasWrapper = document.getElementById('canvas-wrapper');
const camSpriteCanvas = document.getElementById('cam-sprite-canvas');
const startSamCanvas = document.getElementById('start-sam-canvas');
const gameoverSamCanvas = document.getElementById('gameover-sam-canvas');
const cutsceneCanvas = document.getElementById('cutscene-canvas');
const cutsceneShell = document.getElementById('cutscene-shell');
const titleScreen = document.getElementById('title-screen');
const titleAnimCanvas = document.getElementById('title-anim-canvas');
// Title screen: shows on every page load (it's .active in HTML).
// Unskippable — no click / key skips it. It just plays Sam in bed on
// the right (sleeping, then peeking), then auto-dismisses to the hub.
// Once dismissed it stays dismissed — openMainMenu never re-shows it,
// so returning to Main Menu goes straight to the hub, not the title.
let titleScreenDismissed = false;
let titleAnimRaf = null;
const titleAnimStart = performance.now();
const TITLE_ANIM_DURATION = 3600;
function dismissTitleScreen() {
  if (titleScreenDismissed || !titleScreen) return;
  titleScreenDismissed = true;
  if (titleAnimRaf) cancelAnimationFrame(titleAnimRaf);
  titleScreen.classList.add('leaving');
  window.setTimeout(() => {
    titleScreen.classList.remove('active', 'leaving');
    titleScreen.style.display = 'none';
  }, 340);
}
function drawTitleAnimation(now) {
  if (titleScreenDismissed || !titleAnimCanvas) return;
  const t = (now - titleAnimStart) / 1000;
  const c = titleAnimCanvas.getContext('2d');
  const W = titleAnimCanvas.width;
  const H = titleAnimCanvas.height;
  c.clearRect(0, 0, W, H);

  // Floor + soft rug.
  c.fillStyle = '#211d1a';
  c.fillRect(0, 250, W, H - 250);
  c.fillStyle = 'rgba(217, 119, 6, 0.12)';
  c.beginPath();
  c.ellipse(460, 300, 360, 26, 0, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = 'rgba(0, 0, 0, 0.25)';
  c.lineWidth = 1.5;
  c.beginPath();
  c.moveTo(0, 250);
  c.lineTo(W, 250);
  c.stroke();

  // Bed on the right: frame, pillow, duvet.
  c.fillStyle = '#3d362f';
  c.strokeStyle = '#0c0a09';
  c.lineWidth = 2;
  c.beginPath();
  c.roundRect(600, 128, 24, 132, 8);
  c.fill();
  c.stroke();
  c.fillStyle = '#2c2318';
  c.beginPath();
  c.roundRect(600, 168, 280, 92, 10);
  c.fill();
  c.stroke();
  c.fillStyle = '#f3ede2';
  c.strokeStyle = '#a89f91';
  c.beginPath();
  c.roundRect(648, 148, 112, 42, 12);
  c.fill();
  c.stroke();
  c.fillStyle = '#1e293b';
  c.strokeStyle = '#0f172a';
  c.beginPath();
  c.roundRect(600, 200, 280, 60, 10);
  c.fill();
  c.stroke();

  // Sam in bed on the right — same face sprite as in-game.
  // Sleeping, then peeking (one eye open), then back to sleep.
  const samMode = t >= 1.8 && t < 2.8 ? 'WARNING' : 'SLEEPING';
  const samX = 712;
  const samY = 162 + Math.sin(t * 2.4) * 2.5;
  drawGenericSamFace(c, samX, samY, 52, samMode);

  // Snore Zzz rising off Sam while he's asleep (part of the animation).
  if (samMode === 'SLEEPING') {
    c.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      const cycle = (t * 0.55 + i * 0.33) % 1;
      const zx = samX + 58 + i * 7 + Math.sin(t * 3 + i) * 4;
      const zy = samY - 58 - cycle * 52;
      const size = 14 + i * 5 + cycle * 6;
      c.font = `700 ${size}px 'IBM Plex Mono', monospace`;
      c.fillStyle = `rgba(243, 237, 226, ${1 - cycle})`;
      c.fillText(i === 0 ? 'Z' : 'z', zx, zy);
    }
  }

  if (t * 1000 < TITLE_ANIM_DURATION) {
    titleAnimRaf = requestAnimationFrame(drawTitleAnimation);
  } else {
    dismissTitleScreen();
  }
}
if (titleScreen && titleAnimCanvas) {
  // No click / key skip — it just plays, then auto-dismisses.
  titleAnimRaf = requestAnimationFrame(drawTitleAnimation);
}
const cutsceneSkipLabel = document.querySelector('.cutscene-skip-label');

// Map Selector & Unlock Toast UI Elements
const mapBtnBedroom = document.getElementById('map-btn-bedroom');
const mapBtnLounge = document.getElementById('map-btn-lounge');
const mapBtnGarden = document.getElementById('map-btn-garden');
const mapSubBedroom = document.getElementById('map-sub-bedroom');
const mapSubLounge = document.getElementById('map-sub-lounge');
const mapSubGarden = document.getElementById('map-sub-garden');
const randomModeBtn = document.getElementById('random-mode-btn');
const randomModeSub = document.getElementById('random-mode-sub');
const mapUnlockToast = document.getElementById('map-unlock-toast');
const toastMapName = document.getElementById('toast-map-name');
const toastSwitchBtn = document.getElementById('toast-switch-btn');

// Achievement & Start Hub UI Elements
const achListEl = document.getElementById('ach-list');
const achCounterEl = document.getElementById('ach-counter');
const startAchCountEl = document.getElementById('start-ach-count');
const achToastEl = document.getElementById('achievement-toast');
const achToastTitleEl = document.getElementById('ach-toast-title');
const achToastDescEl = document.getElementById('ach-toast-desc');

// Full-Screen Start Screen Hub, Modals, Map Switcher & Wardrobe Elements
const startWalletValEl = document.getElementById('start-wallet-val');
const startBestValEl = document.getElementById('start-best-val');
const sidebarWalletValEl = document.getElementById('sidebar-wallet-val');

const openTutorialBtn = document.getElementById('open-tutorial-btn');
const closeTutorialBtn = document.getElementById('close-tutorial-btn');
const gotItTutorialBtn = document.getElementById('got-it-tutorial-btn');
const tutorialModal = document.getElementById('tutorial-modal');
const tutorialSlideCanvas = document.getElementById('tutorial-slide-canvas');
const tutorialSlideTitle = document.getElementById('tutorial-slide-title');
const tutorialSlideStep = document.getElementById('tutorial-slide-step');
const tutorialDots = document.getElementById('tutorial-dots');
const tutorialPrevBtn = document.getElementById('tutorial-prev-btn');
const tutorialNextBtn = document.getElementById('tutorial-next-btn');

const openAchievementsBtn = document.getElementById('open-achievements-btn');
const closeAchievementsBtn = document.getElementById('close-achievements-btn');
const doneAchievementsBtn = document.getElementById('done-achievements-btn');
const achievementsModal = document.getElementById('achievements-modal');

const openOutfitsBtn = document.getElementById('open-outfits-btn');
const closeOutfitsBtn = document.getElementById('close-outfits-btn');
const doneOutfitsBtn = document.getElementById('done-outfits-btn');
const outfitsModal = document.getElementById('outfits-modal');
const outfitsWalletInlineEl = document.getElementById('outfits-wallet-inline');

const openSettingsBtn = document.getElementById('open-settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const doneSettingsBtn = document.getElementById('done-settings-btn');
const settingsVolumeSlider = document.getElementById('settings-volume-slider');
const settingsVolumeVal = document.getElementById('settings-volume-val');
const settingsMuteBtn = document.getElementById('settings-mute-btn');
const controlsModeDesc = document.getElementById('controls-mode-desc');
const touchControlsEl = document.getElementById('touch-controls');
const joystickZone = document.getElementById('joystick-zone');
const joystickBase = document.getElementById('joystick-base');
const joystickKnob = document.getElementById('joystick-knob');
const touchDropBtn = document.getElementById('touch-drop-btn');
const touchUseBtn = document.getElementById('touch-use-btn');
const touchUseLabel = document.getElementById('touch-use-label');
const touchUseSub = document.getElementById('touch-use-sub');
const menuBtn = document.getElementById('menu-btn');
const gameoverMenuBtn = document.getElementById('gameover-menu-btn');
const hudBar = document.getElementById('hud-bar');
const hudMenuToggle = document.getElementById('hud-menu-toggle');
const hudMenuPanel = document.getElementById('hud-menu-panel');

const startMapBedroom = document.getElementById('start-map-bedroom');
const startMapLounge = document.getElementById('start-map-lounge');
const startMapGarden = document.getElementById('start-map-garden');
const startRandomBtn = document.getElementById('start-random-btn');
const startMapSubBedroom = document.getElementById('start-map-sub-bedroom');
const startMapSubLounge = document.getElementById('start-map-sub-lounge');
const startMapSubGarden = document.getElementById('start-map-sub-garden');
const startRandomSub = document.getElementById('start-random-sub');

const outfitPreviewCanvas = document.getElementById('outfit-preview-canvas');
const outfitPreviewNameEl = document.getElementById('outfit-preview-name');
const outfitDetailTitleEl = document.getElementById('outfit-detail-title');
const outfitDetailDescEl = document.getElementById('outfit-detail-desc');
const outfitStatusNoteEl = document.getElementById('outfit-status-note');
const outfitGridEl = document.getElementById('outfit-grid');
const versionCheatTrigger = document.getElementById('version-cheat-trigger');
const cheatAuthModal = document.getElementById('cheat-auth-modal');
const cheatMenuModal = document.getElementById('cheat-menu-modal');
const cheatAuthForm = document.getElementById('cheat-auth-form');
const cheatPasswordInput = document.getElementById('cheat-password-input');
const cheatAuthError = document.getElementById('cheat-auth-error');
const cheatStatus = document.getElementById('cheat-status');
const cheatOutfitSelect = document.getElementById('cheat-outfit-select');
const closeCheatAuthBtn = document.getElementById('close-cheat-auth-btn');
const closeCheatMenuBtn = document.getElementById('close-cheat-menu-btn');

// ============================================================================
// GENERIC 2D VECTOR SPRITE FOR SAM (Replaces photo portraits everywhere!)
// ============================================================================
function drawGenericSamFace(targetCtx, cx, cy, radius, visualMode) {
  targetCtx.save();
  targetCtx.translate(cx, cy);
  const s = radius / 52;
  targetCtx.scale(s, s);

  // Ears on left & right of head
  targetCtx.fillStyle = visualMode === 'ICED' ? '#bae6fd' : '#fdba74';
  targetCtx.strokeStyle = '#431407';
  targetCtx.lineWidth = 2.5;
  targetCtx.beginPath();
  targetCtx.arc(-48, 0, 10, 0, Math.PI * 2);
  targetCtx.arc(48, 0, 10, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.stroke();

  // Main circular cartoon head
  targetCtx.fillStyle =
    visualMode === 'ICED'
      ? '#7dd3fc'
      : visualMode === 'AWAKE' || visualMode === 'ATTACKING'
      ? '#fca5a5'
      : '#fed7aa';
  targetCtx.strokeStyle = '#431407';
  targetCtx.lineWidth = 3;
  targetCtx.beginPath();
  targetCtx.arc(0, 0, 48, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.stroke();

  // Messy tuft of dark-brown hair across forehead
  targetCtx.fillStyle = '#292524';
  targetCtx.beginPath();
  targetCtx.arc(0, -10, 48, Math.PI * 1.1, Math.PI * 1.9);
  targetCtx.lineTo(28, -22);
  targetCtx.lineTo(14, -30);
  targetCtx.lineTo(2, -20);
  targetCtx.lineTo(-14, -29);
  targetCtx.lineTo(-28, -21);
  targetCtx.closePath();
  targetCtx.fill();

  // Eyes & Eyebrows by state
  if (visualMode === 'AWAKE' || visualMode === 'ATTACKING') {
    // Wide-open bloodshot cartoon eyes staring at you!
    targetCtx.fillStyle = '#ffffff';
    targetCtx.strokeStyle = '#7f1d1d';
    targetCtx.lineWidth = 2.2;
    targetCtx.beginPath();
    targetCtx.arc(-17, -4, 12, 0, Math.PI * 2);
    targetCtx.arc(17, -4, 12, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();

    // Glowing red-rimmed irises & dilated pupils
    targetCtx.fillStyle = '#dc2626';
    targetCtx.beginPath();
    targetCtx.arc(-17, -4, 6.2, 0, Math.PI * 2);
    targetCtx.arc(17, -4, 6.2, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = '#09090b';
    targetCtx.beginPath();
    targetCtx.arc(-17, -4, 3.2, 0, Math.PI * 2);
    targetCtx.arc(17, -4, 3.2, 0, Math.PI * 2);
    targetCtx.fill();

    // Furrowed angry V-eyebrows
    targetCtx.strokeStyle = '#1c1917';
    targetCtx.lineWidth = 4.5;
    targetCtx.lineCap = 'round';
    targetCtx.beginPath();
    targetCtx.moveTo(-30, -19);
    targetCtx.lineTo(-6, -12);
    targetCtx.moveTo(30, -19);
    targetCtx.lineTo(6, -12);
    targetCtx.stroke();

    // Angry shouting mouth with teeth
    targetCtx.fillStyle = '#450a0a';
    targetCtx.beginPath();
    targetCtx.roundRect(-16, 15, 32, 16, 6);
    targetCtx.fill();
    targetCtx.fillStyle = '#ffffff';
    targetCtx.fillRect(-12, 16, 24, 5);
  } else if (visualMode === 'WARNING') {
    // Stirring: one eye squinting open, brow twitching!
    targetCtx.strokeStyle = '#431407';
    targetCtx.lineWidth = 3.2;
    targetCtx.beginPath();
    targetCtx.arc(-17, -3, 9, 0.15 * Math.PI, 0.85 * Math.PI);
    targetCtx.stroke();

    // Right eye peeking half-open
    targetCtx.fillStyle = '#ffffff';
    targetCtx.beginPath();
    targetCtx.ellipse(17, -4, 10, 5.5, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.stroke();
    targetCtx.fillStyle = '#d97706';
    targetCtx.beginPath();
    targetCtx.arc(17, -4, 3.5, 0, Math.PI * 2);
    targetCtx.fill();

    // Grumbling wavy mouth
    targetCtx.beginPath();
    targetCtx.moveTo(-12, 21);
    targetCtx.quadraticCurveTo(0, 16, 12, 21);
    targetCtx.stroke();
  } else if (visualMode === 'KNOCKED_OUT') {
    // Knocked out X-eyes
    targetCtx.strokeStyle = '#431407';
    targetCtx.lineWidth = 3.5;
    [-17, 17].forEach((ex) => {
      targetCtx.beginPath();
      targetCtx.moveTo(ex - 7, -10);
      targetCtx.lineTo(ex + 7, 2);
      targetCtx.moveTo(ex + 7, -10);
      targetCtx.lineTo(ex - 7, 2);
      targetCtx.stroke();
    });
    // Dizzy open oval mouth
    targetCtx.fillStyle = '#431407';
    targetCtx.beginPath();
    targetCtx.ellipse(0, 21, 8, 6, 0, 0, Math.PI * 2);
    targetCtx.fill();
  } else {
    // Peaceful SLEEPING or ICED closed curved eyelids
    targetCtx.strokeStyle = '#431407';
    targetCtx.lineWidth = 3.2;
    targetCtx.lineCap = 'round';
    targetCtx.beginPath();
    targetCtx.arc(-17, -4, 9.5, 0.15 * Math.PI, 0.85 * Math.PI);
    targetCtx.stroke();
    targetCtx.beginPath();
    targetCtx.arc(17, -4, 9.5, 0.15 * Math.PI, 0.85 * Math.PI);
    targetCtx.stroke();

    // Little snoring "o" mouth
    targetCtx.fillStyle = '#7c2d12';
    targetCtx.beginPath();
    targetCtx.arc(0, 21, 5.5, 0, Math.PI * 2);
    targetCtx.fill();
  }

  // Cartoon nose in center
  targetCtx.fillStyle = visualMode === 'ICED' ? '#38bdf8' : '#fb923c';
  targetCtx.beginPath();
  targetCtx.ellipse(0, 6, 5.5, 4.2, 0, 0, Math.PI * 2);
  targetCtx.fill();

  targetCtx.restore();
}

function renderStaticModalSprites() {
  if (startSamCanvas) {
    const sCtx = startSamCanvas.getContext('2d');
    sCtx.fillStyle = '#181512';
    sCtx.fillRect(0, 0, startSamCanvas.width, startSamCanvas.height);
  }
  if (gameoverSamCanvas) {
    const gCtx = gameoverSamCanvas.getContext('2d');
    gCtx.fillStyle = '#291212';
    gCtx.fillRect(0, 0, gameoverSamCanvas.width, gameoverSamCanvas.height);
    drawGenericSamFace(gCtx, 68, 68, 52, 'AWAKE');
  }
}
renderStaticModalSprites();

// ============================================================================
// CHALLENGE ACHIEVEMENTS SYSTEM (10 Objectives + Live Toast Notifications)
// ============================================================================
const ACHIEVEMENTS_KEY = 'dont_wake_sam_achievements_v3';
const SAM_STOPS_KEY = 'dont_wake_sam_stops_v1';
let samStopsCount = parseInt(localStorage.getItem(SAM_STOPS_KEY) || '0', 10);
let samStopsThisGame = 0;
let cleanBatches = 0;
let loungeBatches = 0;
let gardenBatches = 0;
let stinkySortedThisGame = 0;
let roombaRecalls = 0;
let roombaRecallsThisGame = 0;
let loungePerfectBlocksThisGame = 0;
let gardenBirdShook = false;

const ACHIEVEMENTS = [
  { id: 'first_batch', title: '1. Clean Sweep', desc: 'Clear a full batch with at least 21 seconds remaining' },
  { id: 'stink_stopper', title: '2. Biohazard Handler', desc: 'Sort two Stinky Items before either expires in one shift' },
  { id: 'close_call', title: '3. Close Call Master', desc: 'Stop Sam mid-lunge 8 times in one shift' },
  { id: 'sorted_15', title: '4. No-Scratch Shift', desc: 'Sort 20 items in one shift without losing a shield life' },
  { id: 'guitar_5', title: '5. Bedroom Hendrix', desc: 'Ring the guitar 7 times in one shift' },
  { id: 'unlock_lounge', title: '6. Lounge Lizard', desc: 'Clear three Lounge batches without waking Sam' },
  { id: 'unleash_roomba', title: '7. Roomba Wrangler', desc: 'Recall the Roomba to its dock five times' },
  { id: 'unlock_garden', title: '8. Backyard Pro', desc: 'Clear three Backyard batches, shooing every bird that lands on you' },
  { id: 'grandmaster', title: '9. Grandmaster', desc: 'Clear five consecutive batches while keeping at least 18 seconds' },
  { id: 'lounge_perfect', title: '10. Perfect Vacuum', desc: 'Land 10 perfect blocks in a row during the Lounge Roomba phase' }
];

let unlockedAchievements = {};
try {
  const savedAch = JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '{}');
  if (savedAch && typeof savedAch === 'object') {
    unlockedAchievements = savedAch;
  }
} catch (e) {}

let achToastTimer = 0;

function formatCash(val) {
  return `$${Math.floor(val).toLocaleString()}`;
}

function renderAchievementsUI() {
  const count = ACHIEVEMENTS.filter((a) => unlockedAchievements[a.id]).length;
  if (achCounterEl) achCounterEl.textContent = `${count} / ${ACHIEVEMENTS.length}`;
  if (startAchCountEl) startAchCountEl.textContent = `${count}/${ACHIEVEMENTS.length}`;
  if (!achListEl) return;
  achListEl.innerHTML = ACHIEVEMENTS.map((a) => {
    const isDone = Boolean(unlockedAchievements[a.id]);
    return `
      <div class="ach-item ${isDone ? 'unlocked' : ''}">
        <div class="ach-check">${isDone ? '✓' : '•'}</div>
        <div class="ach-info">
          <strong>${a.title}</strong>
          <span>${a.desc}</span>
        </div>
      </div>
    `;
  }).join('');
}

function unlockAchievement(achId) {
  if (unlockedAchievements[achId]) return;
  const ach = ACHIEVEMENTS.find((a) => a.id === achId);
  if (!ach) return;
  unlockedAchievements[achId] = true;
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
  } catch (e) {}
  renderAchievementsUI();
  playSound('levelup');
  if (achToastEl) {
    achToastTitleEl.textContent = ach.title.toUpperCase();
    achToastDescEl.textContent = ach.desc;
    achToastEl.classList.add('visible');
    achToastTimer = 4.8;
  }
}

function recordSamStopped() {
  samStopsCount++;
  samStopsThisGame++;
  try {
    localStorage.setItem(SAM_STOPS_KEY, String(samStopsCount));
  } catch (e) {}
  if (samStopsThisGame >= 8) {
    unlockAchievement('close_call');
  }
}

renderAchievementsUI();

// ============================================================================
// PERSISTENT CASH WALLET & CHARACTER OUTFITS // WARDROBE SYSTEM
// ============================================================================
const HIGHSCORE_KEY = 'dont_wake_sam_highscore_v2';
const WALLET_KEY = 'dont_wake_sam_wallet_v1';
const OWNED_OUTFITS_KEY = 'dont_wake_sam_owned_outfits_v1';
const EQUIPPED_OUTFIT_KEY = 'dont_wake_sam_equipped_outfit_v1';

let highScore = parseInt(localStorage.getItem(HIGHSCORE_KEY) || '0', 10);
let walletCash = parseInt(localStorage.getItem(WALLET_KEY) || '-1', 10);
if (walletCash < 0) {
  walletCash = Math.max(0, highScore);
  try {
    localStorage.setItem(WALLET_KEY, String(walletCash));
  } catch (e) {}
}

const OUTFITS = [
  {
    id: 'default',
    name: 'Classic Hoodie',
    price: 0,
    swatch: '#4f46e5',
    torso: '#4f46e5',
    dark: '#312e81',
    stroke: '#c7d2fe',
    hat: '#1e293b',
    stripe: '#38bdf8',
    desc: 'Standard-issue indigo stealth hoodie with a dark beanie.'
  },
  {
    id: 'ninja',
    name: 'Midnight Ninja',
    price: 750,
    swatch: '#dc2626',
    torso: '#18181b',
    dark: '#09090b',
    stroke: '#ef4444',
    hat: '#09090b',
    stripe: '#dc2626',
    desc: 'Silent shinobi gi with a crimson headband and stealth mask.'
  },
  {
    id: 'hazmat',
    name: 'Bio-Hazard Suit',
    price: 2000,
    swatch: '#eab308',
    torso: '#eab308',
    dark: '#a16207',
    stroke: '#fef08a',
    hat: '#ca8a04',
    stripe: '#38bdf8',
    desc: 'Sealed yellow hazmat suit with cyan visor. Built for stinky socks.'
  },
  {
    id: 'disco',
    name: '70s Disco Roller',
    price: 4500,
    swatch: '#ec4899',
    torso: '#db2777',
    dark: '#831843',
    stroke: '#fbcfe8',
    hat: '#3b0764',
    stripe: '#facc15',
    desc: 'Hot pink & gold sequenced jacket with retro gold shades.'
  },
  {
    id: 'tuxedo',
    name: 'Agent 007 Tux',
    price: 8000,
    swatch: '#0f172a',
    torso: '#0f172a',
    dark: '#f8fafc',
    stroke: '#94a3b8',
    hat: '#1c1917',
    stripe: '#ef4444',
    desc: 'Crisp midnight tuxedo with white dress shirt and red bowtie.'
  },
  {
    id: 'golden',
    name: '24K High Roller',
    price: 12000,
    swatch: '#facc15',
    torso: '#f59e0b',
    dark: '#b45309',
    stroke: '#fef08a',
    hat: '#eab308',
    stripe: '#38bdf8',
    desc: 'Solid 24K gold tracksuit with a royal diamond crown.'
  }
];

let ownedOutfits = { default: true };
try {
  const savedOwned = JSON.parse(localStorage.getItem(OWNED_OUTFITS_KEY) || '{}');
  if (savedOwned && typeof savedOwned === 'object') {
    ownedOutfits = { default: true, ...savedOwned };
  }
} catch (e) {}

let equippedOutfit = localStorage.getItem(EQUIPPED_OUTFIT_KEY) || 'default';
if (!ownedOutfits[equippedOutfit]) equippedOutfit = 'default';
let selectedOutfitId = equippedOutfit;

function getEquippedOutfitObj() {
  return OUTFITS.find((o) => o.id === equippedOutfit) || OUTFITS[0];
}

function drawPlayerOutfitBody(targetCtx, outfit, opts = {}) {
  const stride = opts.stride || 0;
  const armSwing = opts.armSwing || 0;
  const isSlowed = Boolean(opts.isSlowed);
  const isHolding = Boolean(opts.isHolding);
  const facingAngle = opts.facingAngle !== undefined ? opts.facingAngle : -Math.PI / 2;

  const torsoColor = isSlowed ? '#9333ea' : outfit.torso;
  const darkColor = isSlowed ? '#6b21a8' : outfit.dark;
  const strokeColor = isSlowed ? '#f0abfc' : outfit.stroke;

  // Drop shadow under character
  targetCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  targetCtx.beginPath();
  targetCtx.ellipse(0, 15, 20, 10, 0, 0, Math.PI * 2);
  targetCtx.fill();

  // Sneakers / boots striding below torso
  targetCtx.fillStyle = outfit.id === 'golden' ? '#b45309' : '#0f172a';
  targetCtx.strokeStyle = outfit.id === 'golden' ? '#fef08a' : '#cbd5e1';
  targetCtx.lineWidth = 1.5;
  targetCtx.beginPath();
  targetCtx.roundRect(-12, 10 + stride, 9, 10, 4);
  targetCtx.roundRect(3, 10 - stride, 9, 10, 4);
  targetCtx.fill();
  targetCtx.stroke();

  // Rounded Shoulders & Torso
  targetCtx.fillStyle = torsoColor;
  targetCtx.strokeStyle = strokeColor;
  targetCtx.lineWidth = 2.2;
  targetCtx.beginPath();
  targetCtx.roundRect(-18, -5, 36, 21, 10);
  targetCtx.fill();
  targetCtx.stroke();

  // Outfit-specific chest details
  if (outfit.id === 'tuxedo') {
    // Crisp white dress shirt V-front + red bowtie
    targetCtx.fillStyle = '#f8fafc';
    targetCtx.beginPath();
    targetCtx.moveTo(-7, -4);
    targetCtx.lineTo(7, -4);
    targetCtx.lineTo(0, 11);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.fillStyle = '#dc2626';
    targetCtx.beginPath();
    targetCtx.moveTo(-5, 0);
    targetCtx.lineTo(5, 4);
    targetCtx.lineTo(5, 0);
    targetCtx.lineTo(-5, 4);
    targetCtx.closePath();
    targetCtx.fill();
  } else if (outfit.id === 'golden') {
    // Sparkling gold chain with cyan diamond medallion
    targetCtx.strokeStyle = '#fef08a';
    targetCtx.lineWidth = 2;
    targetCtx.beginPath();
    targetCtx.arc(0, 0, 8, 0.15 * Math.PI, 0.85 * Math.PI);
    targetCtx.stroke();
    targetCtx.fillStyle = '#38bdf8';
    targetCtx.beginPath();
    targetCtx.arc(0, 8, 3.2, 0, Math.PI * 2);
    targetCtx.fill();
  } else {
    // Collar & drawstrings / sash
    targetCtx.fillStyle = darkColor;
    targetCtx.beginPath();
    targetCtx.ellipse(0, -3, 11, 5, 0, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.strokeStyle = outfit.stripe;
    targetCtx.lineWidth = 1.5;
    targetCtx.beginPath();
    targetCtx.moveTo(-3.5, 1);
    targetCtx.lineTo(-3.5, 8);
    targetCtx.moveTo(3.5, 1);
    targetCtx.lineTo(3.5, 8);
    targetCtx.stroke();
  }

  // Swinging arms & hands on left and right sides
  const leftHandY = isHolding ? -10 : 3 - armSwing;
  const rightHandY = isHolding ? -10 : 3 + armSwing;
  targetCtx.fillStyle = torsoColor;
  targetCtx.beginPath();
  targetCtx.ellipse(-19, leftHandY, 5, 7, 0.2, 0, Math.PI * 2);
  targetCtx.ellipse(19, rightHandY, 5, 7, -0.2, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.fillStyle = outfit.id === 'hazmat' ? '#38bdf8' : '#fed7aa';
  targetCtx.strokeStyle = '#7c2d12';
  targetCtx.lineWidth = 1.3;
  targetCtx.beginPath();
  targetCtx.arc(-19, leftHandY + 4, 4.2, 0, Math.PI * 2);
  targetCtx.arc(19, rightHandY + 4, 4.2, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.stroke();

  // Character Head
  targetCtx.fillStyle = outfit.id === 'hazmat' ? '#fde047' : '#fed7aa';
  targetCtx.strokeStyle = '#431407';
  targetCtx.lineWidth = 2;
  targetCtx.beginPath();
  targetCtx.arc(0, -8, 12.5, 0, Math.PI * 2);
  targetCtx.fill();
  targetCtx.stroke();

  // Ninja lower face mask
  if (outfit.id === 'ninja') {
    targetCtx.fillStyle = '#09090b';
    targetCtx.beginPath();
    targetCtx.arc(0, -7.5, 12.2, 0.05 * Math.PI, 0.95 * Math.PI);
    targetCtx.fill();
  }

  // Headgear / Beanie / Crown / Hood
  if (outfit.id === 'golden') {
    // 3-point Royal Gold Crown
    targetCtx.fillStyle = '#facc15';
    targetCtx.strokeStyle = '#713f12';
    targetCtx.lineWidth = 1.6;
    targetCtx.beginPath();
    targetCtx.moveTo(-10, -14);
    targetCtx.lineTo(-11, -24);
    targetCtx.lineTo(-4, -18);
    targetCtx.lineTo(0, -25);
    targetCtx.lineTo(4, -18);
    targetCtx.lineTo(11, -24);
    targetCtx.lineTo(10, -14);
    targetCtx.closePath();
    targetCtx.fill();
    targetCtx.stroke();
  } else {
    targetCtx.fillStyle = outfit.hat;
    targetCtx.beginPath();
    targetCtx.arc(0, -10.5, 12.5, Math.PI * 1.08, Math.PI * 1.92);
    targetCtx.quadraticCurveTo(0, -13, -12, -11);
    targetCtx.fill();

    // Headband / beanie fold stripe
    targetCtx.strokeStyle = outfit.stripe;
    targetCtx.lineWidth = outfit.id === 'ninja' ? 3 : 2;
    targetCtx.beginPath();
    targetCtx.moveTo(-11, -13);
    targetCtx.quadraticCurveTo(0, -15.5, 11, -13);
    targetCtx.stroke();
  }

  // Eyes / Visor / Shades
  const lookX = Math.cos(facingAngle) * 3.2;
  const lookY = Math.sin(facingAngle) * 2.5;
  if (outfit.id === 'hazmat') {
    // Glowing Cyan Hazmat Visor Goggles
    targetCtx.fillStyle = '#38bdf8';
    targetCtx.strokeStyle = '#0c4a6e';
    targetCtx.lineWidth = 1.6;
    targetCtx.beginPath();
    targetCtx.roundRect(-9 + lookX * 0.5, -11 + lookY * 0.5, 18, 7.5, 3);
    targetCtx.fill();
    targetCtx.stroke();
  } else if (outfit.id === 'disco') {
    // Retro Gold-Rimmed Sunglasses
    targetCtx.fillStyle = '#09090b';
    targetCtx.strokeStyle = '#facc15';
    targetCtx.lineWidth = 1.6;
    targetCtx.beginPath();
    targetCtx.roundRect(-9.5 + lookX * 0.5, -10.5 + lookY * 0.5, 8.5, 6, 2);
    targetCtx.roundRect(1 + lookX * 0.5, -10.5 + lookY * 0.5, 8.5, 6, 2);
    targetCtx.fill();
    targetCtx.stroke();
  } else {
    targetCtx.fillStyle = '#ffffff';
    targetCtx.beginPath();
    targetCtx.arc(lookX - 4.2, -7 + lookY, 3.4, 0, Math.PI * 2);
    targetCtx.arc(lookX + 4.2, -7 + lookY, 3.4, 0, Math.PI * 2);
    targetCtx.fill();
    targetCtx.fillStyle = '#0f172a';
    targetCtx.beginPath();
    targetCtx.arc(lookX - 4.2, -7 + lookY, 1.8, 0, Math.PI * 2);
    targetCtx.arc(lookX + 4.2, -7 + lookY, 1.8, 0, Math.PI * 2);
    targetCtx.fill();
  }
}

function renderStartCharacterPreview() {
  if (!startSamCanvas) return;
  const sCtx = startSamCanvas.getContext('2d');
  sCtx.fillStyle = '#181512';
  sCtx.fillRect(0, 0, startSamCanvas.width, startSamCanvas.height);
  sCtx.save();
  sCtx.translate(startSamCanvas.width / 2, startSamCanvas.height / 2 + 8);
  sCtx.scale(1.35, 1.35);
  drawPlayerOutfitBody(sCtx, getEquippedOutfitObj(), {
    facingAngle: -Math.PI / 2
  });
  sCtx.restore();
}

function renderOutfitPreview(outfitOverride = null) {
  if (!outfitPreviewCanvas) return;
  const pCtx = outfitPreviewCanvas.getContext('2d');
  pCtx.clearRect(0, 0, outfitPreviewCanvas.width, outfitPreviewCanvas.height);
  const outfit = outfitOverride || OUTFITS.find((o) => o.id === selectedOutfitId) || getEquippedOutfitObj();

  pCtx.save();
  pCtx.translate(60, 62);
  pCtx.scale(1.85, 1.85);
  drawPlayerOutfitBody(pCtx, outfit, { facingAngle: Math.PI / 2 });
  pCtx.restore();

  if (outfitPreviewNameEl) outfitPreviewNameEl.textContent = outfit.name.toUpperCase();
  if (outfitDetailTitleEl) outfitDetailTitleEl.textContent = outfit.name;
  if (outfitDetailDescEl) outfitDetailDescEl.textContent = outfit.desc;
  if (outfitStatusNoteEl) {
    outfitStatusNoteEl.textContent =
      outfit.id === equippedOutfit
        ? '✓ CURRENTLY EQUIPPED'
        : ownedOutfits[outfit.id]
        ? 'PREVIEW — CLICK AGAIN TO EQUIP'
        : walletCash >= outfit.price
        ? `PREVIEW — CLICK AGAIN TO BUY FOR ${formatCash(outfit.price)}`
        : `PREVIEW — NEED ${formatCash(outfit.price - walletCash)} MORE`;
    outfitStatusNoteEl.style.color = outfit.id === equippedOutfit ? '#4ade80' : '';
  }
}

function updateWalletUI() {
  const wStr = formatCash(walletCash);
  const bStr = formatCash(highScore);
  if (startWalletValEl) startWalletValEl.textContent = wStr;
  if (sidebarWalletValEl) sidebarWalletValEl.textContent = wStr;
  if (outfitsWalletInlineEl) outfitsWalletInlineEl.textContent = wStr;
  if (startBestValEl) startBestValEl.textContent = bStr;
  if (highscoreValEl) highscoreValEl.textContent = bStr;
}

function renderWardrobeUI() {
  updateWalletUI();
  renderOutfitPreview();
  if (!outfitGridEl) return;

  outfitGridEl.innerHTML = OUTFITS.map((o) => {
    const isOwned = Boolean(ownedOutfits[o.id]);
    const isEquipped = equippedOutfit === o.id;
    const canAfford = walletCash >= o.price;
    const priceLabel = isEquipped
      ? 'EQUIPPED'
      : isOwned
      ? 'OWNED'
      : formatCash(o.price);
    const isSelected = selectedOutfitId === o.id;
    const btnText = isEquipped
      ? '✓ ACTIVE'
      : isOwned
      ? isSelected
        ? 'CLICK AGAIN TO EQUIP'
        : 'VIEW OUTFIT'
      : canAfford
      ? isSelected
        ? `CONFIRM BUY (${formatCash(o.price)})`
        : 'VIEW OUTFIT'
      : `NEED ${formatCash(o.price)}`;

    return `
      <button class="outfit-card ${isOwned ? 'owned' : ''} ${isEquipped ? 'equipped' : ''} ${isSelected ? 'selected' : ''} ${canAfford ? 'can-afford' : ''}" data-outfit="${o.id}">
        <div class="outfit-card-top">
          <span class="outfit-swatch" style="background:${o.swatch}; border-color:${o.stripe};"></span>
          <span class="outfit-price-tag">${priceLabel}</span>
        </div>
        <div>
          <div class="outfit-card-title">${o.name}</div>
          <div class="outfit-card-sub">${o.desc}</div>
        </div>
        <div class="outfit-action-btn">${btnText}</div>
      </button>
    `;
  }).join('');

  outfitGridEl.querySelectorAll('.outfit-card').forEach((btn) => {
    btn.addEventListener('click', () => {
      initAudio();
      const oid = btn.getAttribute('data-outfit');
      const outfit = OUTFITS.find((x) => x.id === oid);
      if (!outfit) return;

      if (selectedOutfitId !== oid) {
        selectedOutfitId = oid;
        renderWardrobeUI();
        return;
      }

      if (ownedOutfits[oid]) {
        equippedOutfit = oid;
        try {
          localStorage.setItem(EQUIPPED_OUTFIT_KEY, equippedOutfit);
        } catch (e) {}
        playSound('pickup');
        renderWardrobeUI();
      } else if (walletCash >= outfit.price) {
        walletCash -= outfit.price;
        ownedOutfits[oid] = true;
        equippedOutfit = oid;
        try {
          localStorage.setItem(WALLET_KEY, String(walletCash));
          localStorage.setItem(OWNED_OUTFITS_KEY, JSON.stringify(ownedOutfits));
          localStorage.setItem(EQUIPPED_OUTFIT_KEY, equippedOutfit);
        } catch (e) {}
        playSound('deposit');
        renderWardrobeUI();
      } else {
        playSound('slow');
        if (outfitStatusNoteEl) {
          outfitStatusNoteEl.textContent = `NOT ENOUGH CASH! NEED ${formatCash(outfit.price - walletCash)} MORE`;
          outfitStatusNoteEl.style.color = '#f87171';
          setTimeout(() => {
            if (outfitStatusNoteEl) {
              outfitStatusNoteEl.style.color = '#4ade80';
              renderOutfitPreview();
            }
          }, 1800);
        }
      }
    });
  });
  renderStartCharacterPreview();
}
renderWardrobeUI();

// Web Audio Synthesizer for SFX + Sneaky Background Music
let audioCtx = null;
let masterGain = null;
const VOLUME_KEY = 'dont_wake_sam_volume_v1';
const MUTED_KEY = 'dont_wake_sam_muted_v1';
const CONTROLS_MODE_KEY = 'dont_wake_sam_touch_controls_v1';
let masterVolume = 0.8;
try { const s = parseFloat(localStorage.getItem(VOLUME_KEY)); if (!Number.isNaN(s)) masterVolume = Math.max(0, Math.min(1, s)); } catch (e) {}
let isMuted = false;
try { isMuted = localStorage.getItem(MUTED_KEY) === '1'; } catch (e) {}
let touchControlsMode = 'auto';
try { const m = localStorage.getItem(CONTROLS_MODE_KEY); if (m === 'on' || m === 'off' || m === 'auto') touchControlsMode = m; } catch (e) {}
let bgmInterval = null;
let bgmStep = 0;
let cutsceneBgmStep = 0;
// Cutscene ending: -1 = no ending playing, otherwise the index of the
// next closing note to play (see the outro branch in startBackgroundMusic).
let cutsceneOutroStep = -1;
let cutsceneOutroTick = 0;

function initAudio() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audioCtx = new AudioContext();
  }
  if (audioCtx && !masterGain) {
    masterGain = audioCtx.createGain();
    masterGain.gain.value = isMuted ? 0 : masterVolume;
    masterGain.connect(audioCtx.destination);
  }
  if (audioCtx && audioCtx.state === 'suspended') { audioCtx.resume(); }
  applyVolume();
  startBackgroundMusic();
}
function applyVolume() {
  if (masterGain && audioCtx) masterGain.gain.setTargetAtTime(isMuted ? 0 : masterVolume, audioCtx.currentTime, 0.02);
}
function setVolume(v) {
  masterVolume = Math.max(0, Math.min(1, v));
  try { localStorage.setItem(VOLUME_KEY, String(masterVolume)); } catch (e) {}
  if (masterVolume > 0 && isMuted) { isMuted = false; try { localStorage.setItem(MUTED_KEY, '0'); } catch (e) {} }
  applyVolume(); syncSettingsUI();
}
function isTouchDevice() {
  return (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || 'ontouchstart' in window || (navigator && navigator.maxTouchPoints > 0);
}
function shouldShowTouchControls() {
  if (touchControlsMode === 'on') return true;
  if (touchControlsMode === 'off') return false;
  return isTouchDevice();
}
function applyTouchControlsMode() {
  document.body.classList.toggle('touch-controls-on', shouldShowTouchControls());
  updateCompactLayout(); syncSettingsUI(); updateCutsceneSkipLabel(); updateTouchButtons();
}
function updateCompactLayout() {
  const w = window.innerWidth, h = window.innerHeight;
  const isLandscapeShort = w > h && h <= 620;
  document.body.classList.toggle('compact-game', isLandscapeShort);
}
function syncSettingsUI() {
  if (settingsVolumeSlider) settingsVolumeSlider.value = String(Math.round(masterVolume * 100));
  if (settingsVolumeVal) settingsVolumeVal.textContent = isMuted ? 'MUTED' : `${Math.round(masterVolume * 100)}%`;
  const lbl = isMuted ? 'SOUND: OFF' : 'SOUND: ON';
  if (settingsMuteBtn) settingsMuteBtn.textContent = lbl;
  if (muteBtn) muteBtn.textContent = lbl;
  document.querySelectorAll('.controls-mode-btn').forEach((b) => { b.classList.toggle('active', b.dataset.controlsMode === touchControlsMode); });
  if (controlsModeDesc) {
    controlsModeDesc.textContent = touchControlsMode === 'on' ? 'ON: joystick + DROP / USE always show, even on a PC layout.' : touchControlsMode === 'off' ? 'OFF: touch controls never show, even on a tablet.' : 'AUTO: touch controls show on touch devices, hidden on keyboard + mouse.';
  }
}

// Sneaky tiptoe pizzicato background music loop
const bassScale = [130.81, 146.83, 155.56, 174.61, 196.0, 174.61, 155.56, 146.83]; // C minor sneaky walking bass
const leadNotes = [523.25, 0, 622.25, 587.33, 0, 466.16, 523.25, 0, 698.46, 622.25, 0, 587.33, 523.25, 0, 392.0, 0];

// Cutscene music: a different track from the in-game BGM, same synth.
// G-major music-box lullaby — sine + a quiet octave-up shimmer, long decay.
const cutsceneBass = [98.0, 0, 146.83, 98.0, 164.81, 146.83, 98.0, 110.0, 146.83, 130.81, 146.83, 98.0, 98.0, 0, 164.81, 98.0];
const cutsceneMelody = [392.0, 0, 493.88, 587.33, 659.25, 587.33, 493.88, 440.0, 493.88, 523.25, 587.33, 493.88, 392.0, 0, 329.63, 392.0];
// Closing cadence for when a cutscene ends: D -> G -> E -> C. It resolves
// out of the cutscene's G major and lands on C, the game music's home
// key, so the handoff sounds like one piece of music instead of a cut.
const cutsceneOutroNotes = [587.33, 392.0, 329.63, 261.63];

function startBackgroundMusic() {
  if (bgmInterval) return;
  bgmInterval = setInterval(() => {
    if (isMuted || !audioCtx) return;
    const inCutscene = gameState === 'CUTSCENE';
    if (!inCutscene && gameState !== 'PLAYING' && gameState !== 'LEVEL_TRANSITION') return;
    const now = audioCtx.currentTime;

    if (inCutscene) {
      // Cutscenes used to be silent because the BGM loop only played
      // during PLAYING / LEVEL_TRANSITION. This branch plays the
      // cutscene track instead — one note every other 230ms tick, so
      // it breathes at ~460ms per step. When the cutscene ends, the
      // game BGM resumes where it left off (bgmStep is untouched).
      if (cutsceneBgmStep % 2 !== 0) { cutsceneBgmStep++; return; }
      const step = (cutsceneBgmStep / 2) % cutsceneMelody.length;
      const cutBass = cutsceneBass[step];
      if (cutBass > 0) {
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(cutBass, now);
        bassGain.gain.setValueAtTime(0.045, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        bassOsc.connect(bassGain);
        bassGain.connect(masterGain);
        bassOsc.start(now);
        bassOsc.stop(now + 0.36);
      }
      const cutLead = cutsceneMelody[step];
      if (cutLead > 0) {
        [1, 2].forEach((mult) => {
          const leadOsc = audioCtx.createOscillator();
          const leadGain = audioCtx.createGain();
          leadOsc.type = 'sine';
          leadOsc.frequency.setValueAtTime(cutLead * mult, now);
          leadGain.gain.setValueAtTime(mult === 1 ? 0.03 : 0.008, now);
          leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          leadOsc.connect(leadGain);
          leadGain.connect(masterGain);
          leadOsc.start(now);
          leadOsc.stop(now + 0.41);
        });
      }
      cutsceneBgmStep++;
      return;
    }

    // Cutscene ending: when a cutscene ends, its track gets this short
    // closing cadence instead of being chopped off mid-phrase. One note
    // every other tick (~460ms apart, ~1.8s total). Gameplay itself is
    // not delayed — only the game BGM waits until the cadence finishes.
    if (cutsceneOutroStep >= 0) {
      if (cutsceneOutroTick % 2 === 0) {
        const note = cutsceneOutroNotes[cutsceneOutroStep];
        const isFinal = cutsceneOutroStep === cutsceneOutroNotes.length - 1;
        const decay = isFinal ? 0.9 : 0.4;
        [1, 2].forEach((mult) => {
          const leadOsc = audioCtx.createOscillator();
          const leadGain = audioCtx.createGain();
          leadOsc.type = 'sine';
          leadOsc.frequency.setValueAtTime(note * mult, now);
          leadGain.gain.setValueAtTime(mult === 1 ? 0.03 : 0.008, now);
          leadGain.gain.exponentialRampToValueAtTime(0.001, now + decay);
          leadOsc.connect(leadGain);
          leadGain.connect(masterGain);
          leadOsc.start(now);
          leadOsc.stop(now + decay + 0.01);
        });
        if (isFinal) {
          // soft low C under the final note, so it lands
          const bassOsc = audioCtx.createOscillator();
          const bassGain = audioCtx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(130.81, now);
          bassGain.gain.setValueAtTime(0.04, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
          bassOsc.connect(bassGain);
          bassGain.connect(masterGain);
          bassOsc.start(now);
          bassOsc.stop(now + 0.81);
        }
        cutsceneOutroStep++;
        if (cutsceneOutroStep >= cutsceneOutroNotes.length) cutsceneOutroStep = -1;
      }
      cutsceneOutroTick++;
      return;
    }

    // Plucked bass note
    const bassFreq = bassScale[bgmStep % bassScale.length];
    const bassOsc = audioCtx.createOscillator();
    const bassGain = audioCtx.createGain();
    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(bassFreq, now);
    bassGain.gain.setValueAtTime(0.055, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    bassOsc.connect(bassGain);
    bassGain.connect(masterGain);
    bassOsc.start(now);
    bassOsc.stop(now + 0.19);

    // Light tiptoe marimba lead note
    const leadFreq = leadNotes[bgmStep % leadNotes.length];
    if (leadFreq > 0) {
      const leadOsc = audioCtx.createOscillator();
      const leadGain = audioCtx.createGain();
      leadOsc.type = 'sine';
      // Shift pitch slightly if Sam is watching or iced
      const multiplier = sam.iceTimer > 0 ? 1.25 : sam.state === 'AWAKE' ? 0.85 : 1.0;
      leadOsc.frequency.setValueAtTime(leadFreq * multiplier, now);
      leadGain.gain.setValueAtTime(0.035, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      leadOsc.connect(leadGain);
      leadGain.connect(masterGain);
      leadOsc.start(now);
      leadOsc.stop(now + 0.13);
    }

    bgmStep++;
  }, 230);
}

function playSound(type) {
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;

  if (type === 'roomba_reveal') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.8);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 0.18);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 1.2);
  } else if (type === 'alert') {
    [0, 0.14].forEach((offset, index) => {
      const start = now + offset;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(index === 0 ? 175 : 145, start);
      osc.frequency.exponentialRampToValueAtTime(index === 0 ? 82 : 68, start + 0.11);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.2 : 0.11, start + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.16);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(start);
      osc.stop(start + 0.18);
    });
  } else if (type === 'pickup') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.1);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.13);
  } else if (type === 'deposit') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.06);
    osc.frequency.setValueAtTime(783.99, now + 0.13);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.27);
  } else if (type === 'slow') {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.22);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.26);
  } else if (type === 'ice') {
    [783.99, 1046.5, 1318.5].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.05);
      gain.gain.setValueAtTime(0.14, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.31);
    });
  } else if (type === 'awake') {
    [392, 659.25].forEach((frequency, index) => {
      const start = now + index * 0.1;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, start);
      osc.frequency.linearRampToValueAtTime(frequency * 1.08, start + 0.12);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(index === 0 ? 0.085 : 0.07, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.24);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc.start(start);
      osc.stop(start + 0.27);
    });
  } else if (type === 'death') {
    [130, 195, 277, 415].forEach((freq) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.65, now + 0.65);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.7);
    });
  } else if (type === 'levelup') {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.16, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.32);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.33);
    });
  } else if (type === 'guitar_riff') {
    // Classic blues-rock pentatonic guitar riff (E4 - G4 - A4 - Bb4 - B4 - E5 - D5 - B4 - G4 - E4)
    const riff = [
      { f: 329.63, t: 0.0, d: 0.14 },
      { f: 392.00, t: 0.13, d: 0.14 },
      { f: 440.00, t: 0.26, d: 0.12 },
      { f: 466.16, t: 0.37, d: 0.10 },
      { f: 493.88, t: 0.46, d: 0.18 },
      { f: 659.25, t: 0.64, d: 0.20 },
      { f: 587.33, t: 0.84, d: 0.16 },
      { f: 493.88, t: 1.00, d: 0.15 },
      { f: 392.00, t: 1.15, d: 0.15 },
      { f: 329.63, t: 1.30, d: 0.45 }
    ];
    riff.forEach((n) => {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(n.f, now + n.t);
      osc2.frequency.setValueAtTime(n.f * 2, now + n.t); // Octave harmonic

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1850, now + n.t);
      filter.frequency.exponentialRampToValueAtTime(620, now + n.t + n.d);

      gain.gain.setValueAtTime(0.18, now + n.t);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + n.d);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc1.start(now + n.t);
      osc2.start(now + n.t);
      osc1.stop(now + n.t + n.d + 0.02);
      osc2.stop(now + n.t + n.d + 0.02);
    });
  } else if (type === 'bonk') {
    // Wooden stick "BONK!" thwack + cartoon dizzy stars arpeggio
    const thwackOsc = audioCtx.createOscillator();
    const thwackGain = audioCtx.createGain();
    thwackOsc.type = 'triangle';
    thwackOsc.frequency.setValueAtTime(190, now);
    thwackOsc.frequency.exponentialRampToValueAtTime(520, now + 0.045);
    thwackOsc.frequency.exponentialRampToValueAtTime(95, now + 0.14);
    thwackGain.gain.setValueAtTime(0.32, now);
    thwackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
    thwackOsc.connect(thwackGain);
    thwackGain.connect(masterGain);
    thwackOsc.start(now);
    thwackOsc.stop(now + 0.17);

    // Little spinning-stars chime
    [659.25, 783.99, 987.77, 880.0].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.12 + idx * 0.065);
      gain.gain.setValueAtTime(0.12, now + 0.12 + idx * 0.065);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12 + idx * 0.065 + 0.22);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + 0.12 + idx * 0.065);
      osc.stop(now + 0.12 + idx * 0.065 + 0.23);
    });
  } else if (type === 'shield_break') {
    // Electric blue forcefield impact blast + crystalline shatter chimes
    const blastOsc = audioCtx.createOscillator();
    const blastGain = audioCtx.createGain();
    blastOsc.type = 'sawtooth';
    blastOsc.frequency.setValueAtTime(340, now);
    blastOsc.frequency.exponentialRampToValueAtTime(65, now + 0.35);
    blastGain.gain.setValueAtTime(0.28, now);
    blastGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    blastOsc.connect(blastGain);
    blastGain.connect(masterGain);
    blastOsc.start(now);
    blastOsc.stop(now + 0.39);

    [1174.66, 1567.98, 1396.91, 1975.53, 1046.5].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.15, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.22);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.23);
    });
  } else if (type === 'dock_beep') {
    // Pleasant electronic Roomba dock recall chime
    [587.33, 880.0, 1174.66].forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);
      gain.gain.setValueAtTime(0.14, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.21);
    });
  } else if (type === 'bird_flutter') {
    // Quick fluttering wing beats as the bird flies in through the bay window
    [0, 0.08, 0.16, 0.24].forEach((offset) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now + offset);
      osc.frequency.exponentialRampToValueAtTime(180, now + offset + 0.06);
      gain.gain.setValueAtTime(0.11, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.06);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + offset);
      osc.stop(now + offset + 0.065);
    });
  } else if (type === 'squawk') {
    // Loud raspy two-burst bird SQUAWK when shooed away!
    [0, 0.17].forEach((offset, idx) => {
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'square';
      const startFreq = idx === 0 ? 1150 : 1380;
      osc1.frequency.setValueAtTime(startFreq, now + offset);
      osc1.frequency.linearRampToValueAtTime(startFreq * 1.25, now + offset + 0.05);
      osc1.frequency.exponentialRampToValueAtTime(620, now + offset + 0.14);
      osc2.frequency.setValueAtTime(startFreq * 0.74, now + offset);
      osc2.frequency.exponentialRampToValueAtTime(440, now + offset + 0.14);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1250, now + offset);
      filter.Q.setValueAtTime(2.5, now + offset);

      gain.gain.setValueAtTime(0.24, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.15);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);
      osc1.start(now + offset);
      osc2.start(now + offset);
      osc1.stop(now + offset + 0.15);
      osc2.stop(now + offset + 0.15);
    });
  }
}

// Continuous Vacuum Cleaner Sound for the Dramatic Roomba Entrance after Level 5
let vacuumAudioNodes = null;

function startVacuumSound() {
  stopVacuumSound();
  if (isMuted || !audioCtx) return;
  const now = audioCtx.currentTime;

  // 1. Continuous filtered white-noise air suction roar
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  const noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = noiseBuffer;
  noiseNode.loop = true;

  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.setValueAtTime(380, now);
  noiseFilter.frequency.linearRampToValueAtTime(620, now + 1.2);
  noiseFilter.Q.setValueAtTime(1.8, now);

  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.001, now);
  noiseGain.gain.linearRampToValueAtTime(0.025, now + 0.8);

  noiseNode.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(masterGain);

  // 2. Dual vacuum turbine motor hum oscillators (whirring up in pitch)
  const motorOsc1 = audioCtx.createOscillator();
  const motorOsc2 = audioCtx.createOscillator();
  const motorFilter = audioCtx.createBiquadFilter();
  const motorGain = audioCtx.createGain();

  motorOsc1.type = 'sawtooth';
  motorOsc2.type = 'triangle';
  motorOsc1.frequency.setValueAtTime(85, now);
  motorOsc1.frequency.exponentialRampToValueAtTime(148, now + 1.4);
  motorOsc2.frequency.setValueAtTime(170, now);
  motorOsc2.frequency.exponentialRampToValueAtTime(296, now + 1.4);

  motorFilter.type = 'lowpass';
  motorFilter.frequency.setValueAtTime(520, now);

  motorGain.gain.setValueAtTime(0.001, now);
  motorGain.gain.linearRampToValueAtTime(0.022, now + 0.8);

  motorOsc1.connect(motorFilter);
  motorOsc2.connect(motorFilter);
  motorFilter.connect(motorGain);
  motorGain.connect(masterGain);

  noiseNode.start(now);
  motorOsc1.start(now);
  motorOsc2.start(now);

  vacuumAudioNodes = {
    noiseNode,
    noiseGain,
    motorOsc1,
    motorOsc2,
    motorGain
  };
}

function stopVacuumSound() {
  if (!vacuumAudioNodes) return;
  const nodes = vacuumAudioNodes;
  vacuumAudioNodes = null;
  try {
    if (audioCtx) {
      const now = audioCtx.currentTime;
      nodes.noiseGain.gain.cancelScheduledValues(now);
      nodes.motorGain.gain.cancelScheduledValues(now);
      nodes.noiseGain.gain.setValueAtTime(nodes.noiseGain.gain.value || 0.1, now);
      nodes.motorGain.gain.setValueAtTime(nodes.motorGain.gain.value || 0.1, now);
      nodes.noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      nodes.motorGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      nodes.motorOsc1.frequency.exponentialRampToValueAtTime(60, now + 0.25);
      nodes.motorOsc2.frequency.exponentialRampToValueAtTime(120, now + 0.25);
      setTimeout(() => {
        try {
          nodes.noiseNode.stop();
          nodes.motorOsc1.stop();
          nodes.motorOsc2.stop();
        } catch (e) {}
      }, 280);
    }
  } catch (e) {}
}

// ============================================================================
// MULTI-MAP CONFIGURATIONS (1: Bedroom, 2: The Lounge, 3: The Backyard)
// ============================================================================
const LOUNGE_UNLOCK_SCORE = 2000; // $2,500 in Bedroom (20 items @ $50) unlocks The Lounge!
const GARDEN_UNLOCK_SCORE = 3000; // $3,000 in The Lounge (20 items @ $75) unlocks The Backyard!
const UNLOCKED_MAPS_KEY = 'dont_wake_sam_unlocked_maps_v1';

let unlockedMaps = {
  bedroom: true,
  lounge: false,
  garden: false
};
try {
  const savedMaps = JSON.parse(localStorage.getItem(UNLOCKED_MAPS_KEY) || 'null');
  if (savedMaps && typeof savedMaps === 'object') {
    unlockedMaps.lounge = Boolean(savedMaps.lounge);
    unlockedMaps.garden = Boolean(savedMaps.garden);
  }
} catch (e) {}

function saveUnlockedMaps() {
  try {
    localStorage.setItem(UNLOCKED_MAPS_KEY, JSON.stringify(unlockedMaps));
  } catch (e) {}
}

let currentMap = 'bedroom'; // 'bedroom' | 'lounge' | 'garden'
let randomMode = false; // When ON (requires >= 2 unlocked maps), randomly swaps maps every 30-60s!
let randomSwapTimer = 42.0;
let mapSwapBannerTimer = 0;
let mapSwapBannerText = '';
let toastHideTimer = 0;
let pendingToastMap = null;

const MAP_CONFIGS = {
  bedroom: {
    id: 'bedroom',
    name: "SAM'S BEDROOM",
    itemCash: 50,
    hasRoomba: true,
    birdInterval: [12.0, 19.0],
    samHeadPos: { x: 1005, y: 295, radius: 52 },
    dropZones: {
      sock: {
        id: 'sock',
        label: 'Oak Wardrobe',
        itemType: 'sock',
        x: 28,
        y: 195,
        w: 108,
        h: 195,
        dropX: 156,
        dropY: 292,
        color: '#d97706'
      },
      food: {
        id: 'food',
        label: 'Window Bin',
        itemType: 'food',
        x: 400,
        y: 96,
        w: 58,
        h: 62,
        dropX: 429,
        dropY: 178,
        color: '#eab308'
      },
      cable: {
        id: 'cable',
        label: 'Cable Box',
        itemType: 'cable',
        x: 28,
        y: 425,
        w: 112,
        h: 245,
        dropX: 162,
        dropY: 545,
        color: '#38bdf8'
      }
    },
    obstacles: [
      { x: 28, y: 195, w: 108, h: 195 }, // Oak Wardrobe
      { x: 28, y: 425, w: 112, h: 245 }, // White Kallax Cube Unit + Cable Box
      { x: 480, y: 78, w: 200, h: 80 },  // Bay Window Desk
      { x: 400, y: 96, w: 58, h: 62 },   // Bin next to desk
      { x: 705, y: 195, w: 393, h: 410 } // Sam's Bed
    ],
    templates: {
      sock: [
        { name: 'Striped Gym Sock', emoji: '🧦' },
        { name: 'Lost Left Sock', emoji: '🧦' },
        { name: 'Muddy Sock', emoji: '🧦' },
        { name: 'Under-Bed Sock', emoji: '🧦' }
      ],
      food: [
        { name: 'Pizza Slice', emoji: '🍕' },
        { name: 'Burger Wrapper', emoji: '🍔' },
        { name: 'Empty Soda Can', emoji: '🥫' },
        { name: '3 AM Crisp Packet', emoji: '🍟' }
      ],
      cable: [
        { name: 'Phone Charger', emoji: '🔌' },
        { name: 'HDMI Cord', emoji: '🔌' },
        { name: 'Knotted USB-C', emoji: '🔌' },
        { name: 'Extension Lead', emoji: '🔌' }
      ]
    },
    spots: [
      { x: 265, y: 245 },
      { x: 380, y: 250 },
      { x: 505, y: 225 },
      { x: 625, y: 245 },
      { x: 270, y: 365 },
      { x: 395, y: 345 },
      { x: 525, y: 340 },
      { x: 635, y: 360 },
      { x: 280, y: 485 },
      { x: 410, y: 465 },
      { x: 535, y: 455 },
      { x: 640, y: 480 },
      { x: 295, y: 595 },
      { x: 435, y: 585 },
      { x: 575, y: 580 },
      { x: 830, y: 642 },
      { x: 975, y: 642 },
      { x: 340, y: 185 },
      { x: 645, y: 180 }
    ]
  },

  lounge: {
    id: 'lounge',
    name: 'THE LOUNGE',
    itemCash: 75,
    hasRoomba: true,
    birdInterval: [11.0, 17.5],
    samHeadPos: { x: 995, y: 310, radius: 52 },
    dropZones: {
      sock: {
        id: 'sock',
        label: 'Laundry Basket',
        itemType: 'sock',
        x: 28,
        y: 485,
        w: 100,
        h: 165,
        dropX: 152,
        dropY: 565,
        color: '#d97706'
      },
      food: {
        id: 'food',
        label: 'Lounge Bin',
        itemType: 'food',
        x: 68,
        y: 104,
        w: 66,
        h: 66,
        dropX: 118,
        dropY: 192,
        color: '#4ade80'
      },
      cable: {
        id: 'cable',
        label: 'TV Media Unit',
        itemType: 'cable',
        x: 510,
        y: 94,
        w: 255,
        h: 80,
        dropX: 638,
        dropY: 198,
        color: '#38bdf8'
      }
    },
    obstacles: [
      { x: 185, y: 88, w: 265, h: 78 },   // Top-Left Bay Window Sofa
      { x: 28, y: 205, w: 100, h: 245 },  // Left Wall Dark Sofa
      { x: 28, y: 485, w: 100, h: 165 },  // Bottom-Left Laundry Basket
      { x: 68, y: 104, w: 66, h: 66 },    // Top-Left Lounge Bin
      { x: 510, y: 94, w: 255, h: 80 },   // White Kallax TV Media Shelf
      { x: 345, y: 290, w: 310, h: 205 }, // BIG CENTRAL WHITE COFFEE TABLE (Cannot cross — go around it!)
      { x: 830, y: 140, w: 266, h: 460 }  // Right-Side Sofa extended all the way to the top-right edge!
    ],
    templates: {
      sock: [
        { name: 'Couch Cushion Sock', emoji: '🧦' },
        { name: 'Lost Slipper Sock', emoji: '🧦' },
        { name: 'Fuzzy Lounge Sock', emoji: '🧦' },
        { name: 'Under-Sofa Sock', emoji: '🧦' }
      ],
      food: [
        { name: 'Takeaway Pizza Slice', emoji: '🍕' },
        { name: 'Movie Night Popcorn', emoji: '🍿' },
        { name: 'Empty Fizzy Can', emoji: '🥫' },
        { name: 'Crisp Packet', emoji: '🍟' }
      ],
      cable: [
        { name: 'TV Remote & HDMI', emoji: '🔌' },
        { name: 'Console Controller Cord', emoji: '🔌' },
        { name: 'Soundbar Optical Lead', emoji: '🔌' },
        { name: 'Tangled Extension', emoji: '🔌' }
      ]
    },
    // Spacious walkways all around the big central coffee table (x: 345..655, y: 290..495)
    spots: [
      { x: 225, y: 235 },
      { x: 355, y: 230 },
      { x: 500, y: 235 },
      { x: 660, y: 235 },
      { x: 755, y: 245 },
      { x: 210, y: 345 },
      { x: 270, y: 415 },
      { x: 725, y: 350 },
      { x: 765, y: 435 },
      { x: 225, y: 525 },
      { x: 335, y: 555 },
      { x: 495, y: 555 },
      { x: 655, y: 550 },
      { x: 755, y: 555 },
      { x: 310, y: 630 },
      { x: 485, y: 630 },
      { x: 655, y: 630 },
      { x: 875, y: 642 }
    ]
  },

  garden: {
    id: 'garden',
    name: 'THE BACKYARD',
    itemCash: 100,
    hasRoomba: false, // No Roomba outdoors — far more birds instead!
    birdInterval: [3.6, 6.2],
    samHeadPos: { x: 995, y: 305, radius: 52 },
    dropZones: {
      sock: {
        id: 'sock',
        label: 'Clothing Line',
        itemType: 'sock',
        x: 34,
        y: 430,
        w: 106,
        h: 225,
        dropX: 164,
        dropY: 542,
        color: '#38bdf8'
      },
      food: {
        id: 'food',
        label: 'Food Bin',
        itemType: 'food',
        x: 1000,
        y: 96,
        w: 66,
        h: 64,
        dropX: 1033,
        dropY: 184,
        color: '#eab308'
      },
      cable: {
        id: 'cable',
        label: 'Green Bin',
        itemType: 'cable',
        x: 205,
        y: 96,
        w: 66,
        h: 64,
        dropX: 238,
        dropY: 184,
        color: '#22c55e'
      }
    },
    obstacles: [
      { x: 205, y: 96, w: 66, h: 64 },    // Green Garden Wheelie Bin (for Weeds)
      { x: 34, y: 430, w: 106, h: 225 },  // Outdoor Clothing Line (for Clothing)
      { x: 1000, y: 96, w: 66, h: 64 },   // Outdoor Food Bin (for Food)
      { x: 385, y: 96, w: 110, h: 66 },   // Overgrown Garden Bush by fence
      { x: 830, y: 230, w: 258, h: 365 }  // Sam's Garden Patio Sun Lounger
    ],
    templates: {
      sock: [
        { name: 'Damp Hoodie', emoji: '👕' },
        { name: 'Muddy Jeans', emoji: '👖' },
        { name: 'Cotton T-Shirt', emoji: '👕' },
        { name: ' pegged Laundry Shirt', emoji: '👕' }
      ],
      food: [
        { name: 'BBQ Burger', emoji: '🍔' },
        { name: 'Picnic Pizza Slice', emoji: '🍕' },
        { name: 'Half-Eaten Apple', emoji: '🍎' },
        { name: 'Empty Patio Can', emoji: '🥫' }
      ],
      cable: [
        { name: 'Dandelion Weed', emoji: '🌿' },
        { name: 'Prickly Thistle', emoji: '🌿' },
        { name: 'Stinging Nettle', emoji: '🌱' },
        { name: 'Overgrown Crabgrass', emoji: '🌿' }
      ]
    },
    spots: [
      { x: 265, y: 245 },
      { x: 385, y: 240 },
      { x: 525, y: 230 },
      { x: 665, y: 240 },
      { x: 760, y: 255 },
      { x: 255, y: 365 },
      { x: 390, y: 355 },
      { x: 530, y: 355 },
      { x: 665, y: 365 },
      { x: 765, y: 395 },
      { x: 265, y: 485 },
      { x: 405, y: 475 },
      { x: 545, y: 470 },
      { x: 675, y: 485 },
      { x: 295, y: 595 },
      { x: 445, y: 595 },
      { x: 595, y: 590 },
      { x: 745, y: 595 }
    ]
  }
};

let dropZones = MAP_CONFIGS.bedroom.dropZones;
let furnitureObstacles = MAP_CONFIGS.bedroom.obstacles;
let itemTemplates = MAP_CONFIGS.bedroom.templates;
let carpetSpots = MAP_CONFIGS.bedroom.spots;

// Top-left corner Guitar Easter Egg (above the Oak Wardrobe)
// 60s cooldown between riffs — standing on it can no longer spam all 7.
// The green ring is hidden until you step on the guitar, then it stays
// visible showing progress until the cooldown refreshes, at which point
// it is removed again. It is transparent except for the progress arc.
const GUITAR_COOLDOWN_SECONDS = 60;
const guitarEasterEgg = {
  x: 68,
  y: 164,
  radius: 26,
  cooldown: 0,
  cooldownDuration: GUITAR_COOLDOWN_SECONDS,
  playingTimer: 0,
  speedBoostUsed: false,
  riffsThisGame: 0,
  ringVisible: false
};

// Sam's position on the pillow / sofa / sun lounger
const samHead = {
  x: 1005,
  y: 295,
  radius: 52
};

// Game & Progression State (Infinite Arcade Survival Mode!)
let gameState = 'START'; // START | PLAYING | LEVEL_TRANSITION | MAP_TRANSITION | CUTSCENE | KILL_ANIM | SAM_KNOCKBACK | GAMEOVER
let keys = {};
let cutsceneMap = null;
let cutsceneTimer = 0;
let cutsceneStartX = 0;
let cutsceneStartY = 0;
const cutscenesSeenThisSession = new Set();

let score = 0;
let itemsSorted = 0;
let itemSpawnCounter = 0;
const BATCH_TIMER_START = 20.0;
const ITEM_TIME_BONUS = 5.0;
let levelTimer = BATCH_TIMER_START;
const MAX_TIMER_CAP = 30.0;
const QTE_BLOCK_START = 0.38;
const QTE_BLOCK_END = 0.78;
const QTE_PERFECT_START = 0.48;
const QTE_PERFECT_END = 0.70;
// First-lunge tutorial: once per page load, not forever.
// Deliberately in-memory only — no localStorage. Refreshing the page
// reloads the script, resets this flag, and brings the tutorial back,
// so you get reminded again if you've forgotten. Within one page load
// it still only shows on the first lunge.
// When active, Sam lunges slightly slower, STOPS dead when he reaches
// the GOLD perfect window, and stays stopped until you press SPACE
// (or use the stick / ice) — so you can't die during the tutorial, you
// just have to press at the right time. A vignette marks it as the test.
// Only shows if the player actually watched the intro (bedroom)
// cutscene — skipping it means they're not first-time, so no tutorial.
let lungeTutorialSeen = false;
let lungeTutorialActive = false;
let lungeTutorialFrozen = false;
const LUNGE_TUTORIAL_SPEED = 0.85;
let introCutsceneWatched = false;
let transitionTimer = 0;
let pendingMapTransition = null;
let loungeRoombaReleased = false;
let batchRefreshCount = 0;

let nextStickItemThreshold = 15; // Knockout Stick spawns at most once every 15 items sorted (plus random past that)

let unlockedStinky = false; // Unlocks at 8 items sorted (rare expiring stinky sock/pizza items!)
let unlockedHeavy = false; // Unlocks at 12 items sorted
let unlockedStick = false; // Unlocks when first Stick spawns (at 15+ items sorted)
let unlockedRoomba = false; // Unlocks at 15 items sorted (triggers dramatic Roomba entrance!)

// ============================================================================
// ANIMATED CUTSCENES — drawn in code with the game's own characters (no video files)
// ============================================================================
const CS_W = 960;
const CS_H = 540;
const CUTSCENE_DURATIONS = { bedroom: 11, lounge: 10, garden: 10 };
let cutsceneStartTime = 0;

const csClamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const csSeg = (t, a, b) => csClamp((t - a) / (b - a));
const csEase = (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);
const csLerp = (a, b, p) => a + (b - a) * p;

function csFade(c, a) {
  if (a <= 0) return;
  c.fillStyle = `rgba(0,0,0,${csClamp(a)})`;
  c.fillRect(0, 0, CS_W, CS_H);
}

function csText(c, text, x, y, color, size = 34, alpha = 1, shake = 0, t = 0) {
  if (alpha <= 0) return;
  c.save();
  c.globalAlpha = csClamp(alpha);
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.font = `900 ${size}px "IBM Plex Mono", monospace`;
  c.lineWidth = 7;
  c.lineJoin = 'round';
  c.strokeStyle = '#0c0a09';
  const sx = shake ? Math.sin(t * 60) * shake : 0;
  c.strokeText(text, x + sx, y);
  c.fillStyle = color;
  c.fillText(text, x + sx, y);
  c.restore();
}

function csZzz(c, x, y, t) {
  for (let i = 0; i < 3; i++) {
    const p = (t * 0.45 + i / 3) % 1;
    c.save();
    c.globalAlpha = Math.sin(p * Math.PI);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.font = `900 ${22 + i * 7}px "IBM Plex Mono", monospace`;
    c.lineWidth = 5;
    c.strokeStyle = '#0c4a6e';
    c.fillStyle = '#e0f2fe';
    c.strokeText('Z', x + p * 55 + i * 8, y - p * 75);
    c.fillText('Z', x + p * 55 + i * 8, y - p * 75);
    c.restore();
  }
}

function csSteam(c, x, y, t) {
  for (let i = 0; i < 4; i++) {
    const p = (t * 1.6 + i / 4) % 1;
    c.fillStyle = `rgba(255,255,255,${(1 - p) * 0.8})`;
    c.beginPath();
    c.arc(x - 45 + i * 30 + Math.sin(t * 8 + i) * 4, y - p * 60, 7 + p * 12, 0, Math.PI * 2);
    c.fill();
  }
}

function csRR(c, x, y, w, h, r, fill, stroke, lw = 3) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  if (fill) { c.fillStyle = fill; c.fill(); }
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); }
}

// ---- Characters ------------------------------------------------------------
function csPlayer(c, x, y, t, o = {}) {
  const s = o.scale || 2.2;
  const ph = t * (o.cadence || 11);
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  drawPlayerOutfitBody(c, getEquippedOutfitObj(), {
    stride: o.walk ? Math.sin(ph) * 6.5 : 0,
    armSwing: o.walk ? Math.cos(ph) * 5.5 : 0,
    isHolding: Boolean(o.raiseHands),
    facingAngle: o.face !== undefined ? o.face : -Math.PI / 2
  });
  if (o.props !== false) {
    // bucket (left hand)
    c.fillStyle = '#38bdf8';
    c.strokeStyle = '#0c4a6e';
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(-35, 6); c.lineTo(-19, 6); c.lineTo(-22, 22); c.lineTo(-32, 22);
    c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.arc(-27, 6, 8, Math.PI, 0); c.stroke();
    // broom (right hand)
    c.strokeStyle = '#a16207';
    c.lineWidth = 3;
    c.lineCap = 'round';
    c.beginPath(); c.moveTo(25, -32); c.lineTo(25, 20); c.stroke();
    c.fillStyle = '#facc15';
    c.strokeStyle = '#713f12';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(19, 20); c.lineTo(31, 20); c.lineTo(35, 37); c.lineTo(15, 37);
    c.closePath(); c.fill(); c.stroke();
  }
  c.restore();
}

function csSam(c, x, y, t, o = {}) {
  const s = o.scale || 2.2;
  const ph = t * (o.cadence || 9);
  const stride = o.walk ? Math.sin(ph) * 6.5 : 0;
  const arm = o.walk ? Math.cos(ph) * 5.5 : 0;
  c.save();
  c.translate(x, y);
  c.rotate(o.rot || 0);
  c.scale(s * (o.sx || 1), s * (o.sy || 1));
  c.fillStyle = 'rgba(0,0,0,0.3)';
  c.beginPath(); c.ellipse(0, 15, 24, 11, 0, 0, Math.PI * 2); c.fill();
  // slippers
  c.fillStyle = '#7c2d12';
  c.strokeStyle = '#fed7aa';
  c.lineWidth = 1.5;
  c.beginPath();
  c.roundRect(-14, 10 + stride, 11, 11, 4);
  c.roundRect(3, 10 - stride, 11, 11, 4);
  c.fill(); c.stroke();
  // pyjama torso
  c.fillStyle = '#93c5fd';
  c.strokeStyle = '#1e3a8a';
  c.lineWidth = 2.2;
  c.beginPath(); c.roundRect(-21, -5, 42, 23, 11); c.fill(); c.stroke();
  c.strokeStyle = '#60a5fa';
  c.lineWidth = 2;
  [-10, 0, 10].forEach((sx) => { c.beginPath(); c.moveTo(sx, -1); c.lineTo(sx, 15); c.stroke(); });
  // arms + hands
  const lh = o.fists ? -14 : 4 - arm;
  const rh = o.fists ? -14 : 4 + arm;
  c.fillStyle = '#93c5fd';
  c.strokeStyle = '#1e3a8a';
  c.lineWidth = 1.5;
  c.beginPath();
  c.ellipse(-25, lh, 5.5, 8, 0.2, 0, Math.PI * 2);
  c.ellipse(25, rh, 5.5, 8, -0.2, 0, Math.PI * 2);
  c.fill(); c.stroke();
  c.fillStyle = '#fed7aa';
  c.strokeStyle = '#7c2d12';
  c.beginPath();
  c.arc(-25, lh + 5, 4.5, 0, Math.PI * 2);
  c.arc(25, rh + 5, 4.5, 0, Math.PI * 2);
  c.fill(); c.stroke();
  drawGenericSamFace(c, 0, -14, 19, o.mode || 'AWAKE');
  c.restore();
}

// ---- Rooms ------------------------------------------------------------------
function csRoomShell(c, floor, wall) {
  c.fillStyle = '#17120f';
  c.fillRect(0, 0, CS_W, CS_H);
  c.fillStyle = floor;
  c.fillRect(50, 40, 860, 460);
  c.strokeStyle = 'rgba(45,34,25,0.18)';
  c.lineWidth = 2;
  for (let x = 110; x < 910; x += 60) {
    c.beginPath(); c.moveTo(x, 40); c.lineTo(x, 500); c.stroke();
  }
  c.strokeStyle = wall;
  c.lineWidth = 18;
  c.strokeRect(50, 40, 860, 460);
}

function csBedroomRoom(c, switchLit) {
  // LAYOUT — same room as the playable bedroom, same walls, same sides.
  // Playable floor is 28,138-1104,692 on a 1160x720 canvas; this 960x540
  // cutscene floor is 50,40-910,500, so furniture is mapped across, not invented:
  //   wardrobe + Kallax = LEFT wall | desk = TOP wall, under the bay window
  //   bed = RIGHT side | door = BOTTOM wall, left-of-centre | rug = open floor
  csRoomShell(c, '#b7a58d', '#6b5748');
  // bay window on the top wall
  c.fillStyle = '#e7e5e4'; c.fillRect(395, 30, 130, 22);
  c.fillStyle = '#1e3a8a'; c.fillRect(402, 35, 116, 12);
  // desk under the bay window (top wall, horizontal — playable: 480,78)
  csRR(c, 395, 68, 170, 42, 6, '#f8fafc', '#94a3b8');
  // office chair tucked in front of the desk
  c.fillStyle = '#e2e8f0';
  c.beginPath(); c.roundRect(472, 116, 36, 26, 10); c.fill();
  c.strokeStyle = '#94a3b8'; c.lineWidth = 2; c.stroke();
  // wardrobe on the LEFT wall, tall (playable: 28,195, 108x195)
  csRR(c, 58, 88, 92, 168, 6, '#7c4a2d', '#3b2412');
  c.strokeStyle = '#3b2412'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(104, 88); c.lineTo(104, 256); c.stroke();
  // Kallax / cable unit on the LEFT wall, below the wardrobe (playable: 28,425).
  // It starts at y=300 so the light switch sits in the clear wall gap above it.
  csRR(c, 58, 300, 94, 182, 6, '#e5e7eb', '#94a3b8');
  c.strokeStyle = '#94a3b8'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(105, 300); c.lineTo(105, 482); c.stroke();
  [360, 420].forEach((gy) => {
    c.beginPath(); c.moveTo(58, gy); c.lineTo(152, gy); c.stroke();
  });
  // rug on the open floor, left of the bed
  csRR(c, 210, 250, 260, 170, 16, '#9f3a38');
  c.setLineDash([10, 8]);
  csRR(c, 222, 262, 236, 146, 10, null, '#fca5a5', 3);
  c.setLineDash([]);
  // doorway on the BOTTOM wall, left-of-centre (playable door: ~165,692)
  c.fillStyle = '#b7a58d';
  c.fillRect(165, 486, 80, 28);
  c.fillStyle = '#5b3a1e';
  c.fillRect(160, 484, 8, 32);
  c.fillRect(245, 484, 8, 32);
  // light switch on the left wall, in the clear gap between wardrobe and Kallax
  csRR(c, 38, 266, 24, 34, 4, '#f1f5f9', '#64748b', 2);
  c.fillStyle = switchLit ? '#facc15' : '#475569';
  c.fillRect(44, switchLit ? 272 : 284, 12, 11);
  // NOTE: the bed itself is drawn by csBed() — on the RIGHT side.
}

function csBed(c, t, o = {}) {
  // Bed on the RIGHT side, head at the EAST (right) end.
  // Playable bed: 705,195 393x410, black pillows on its RIGHT edge,
  // Sam's head at the east end (1005,295), shoulders/duvet to the west.
  // The old cutscene bed was rotated 90 degrees (tall, centre, head at top).
  const x = 580, y = 150, w = 320, h = 230;
  c.save();
  csRR(c, x - 12, y - 14, w + 24, h + 26, 14, '#5b3a1e', '#2b1a0c', 4);
  csRR(c, x, y, w, h, 10, '#e5e7eb');
  // pillow at the EAST end + headboard strip on the east edge
  csRR(c, x + w - 92, y + 14, 78, h - 28, 20, '#f8fafc', '#94a3b8');
  csRR(c, x + w - 6, y, 12, h, 6, '#5b3a1e', '#2b1a0c', 3);
  if (o.empty) {
    // Sam has got up: rumpled duvet, empty pillow
    c.save();
    c.translate(x + (w - 110) / 2 + 8, y + h / 2);
    c.rotate(-0.08);
    csRR(c, -(w - 110) / 2, -(h - 16) / 2, w - 110, h - 16, 18, '#4f46e5', '#312e81');
    c.restore();
  } else {
    const lift = o.lift || 0;
    // Sam's head on the east pillow (face kept upright so it reads),
    // duvet stretching WEST from him — same head-east layout as in-game.
    c.save();
    c.translate(x + w - 53, y + h / 2 - lift * 22);
    c.rotate(o.rot || 0);
    c.scale(1 + lift * 0.12, 1 + lift * 0.12);
    drawGenericSamFace(c, 0, 0, 34, o.mode || 'SLEEPING');
    c.restore();
    const breathe = o.mode === 'SLEEPING' || !o.mode ? Math.sin(t * 2.2) * 3 : 0;
    csRR(c, x + 8, y + 8 - lift * 14, w - 110, h - 16 + breathe, 18, '#4f46e5', '#312e81');
    c.strokeStyle = '#6366f1';
    c.lineWidth = 3;
    for (let i = 1; i < 4; i++) {
      c.beginPath(); c.moveTo(x + 8 + i * 52, y + 16); c.lineTo(x + 8 + i * 52, y + h - 16); c.stroke();
    }
  }
  c.restore();
}

function csLoungeRoom(c) {
  // LAYOUT — same room as the playable lounge, same walls, same sides.
  // Playable: sofas on THREE sides (top-left bay, left wall, right wall),
  // big central coffee table, TV unit on the top wall. Sam sleeps on the
  // RIGHT sofa. The old cutscene had ONE sofa at the bottom facing a top
  // TV — a different lounge entirely — so it is rebuilt from the real one.
  csRoomShell(c, '#9c8466', '#5a4636');
  // doorway on the BOTTOM wall, left-of-centre — same door as the bedroom
  c.fillStyle = '#9c8466';
  c.fillRect(165, 486, 80, 28);
  c.fillStyle = '#5b3a1e';
  c.fillRect(160, 484, 8, 32);
  c.fillRect(245, 484, 8, 32);
  // sofa 1: TOP-LEFT bay sofa (playable: 185,88, 265x78)
  csRR(c, 175, 58, 212, 62, 12, '#334155', '#0f172a', 3);
  csRR(c, 235, 72, 110, 34, 6, '#64748b');
  csRR(c, 190, 70, 36, 34, 6, '#38bdf8');
  csRR(c, 335, 70, 36, 34, 6, '#f8fafc');
  // sofa 2: LEFT-WALL sofa (playable: 28,205, 100x245)
  csRR(c, 58, 96, 80, 203, 12, '#1e1b24', '#09090b', 3);
  csRR(c, 70, 110, 46, 58, 8, '#cbd5e1');
  csRR(c, 72, 180, 42, 52, 8, '#86efac');
  // laundry basket, bottom-left below the left sofa (playable: 28,485)
  csRR(c, 58, 328, 80, 137, 10, '#d97706', '#78350f', 3);
  csRR(c, 70, 342, 56, 110, 6, '#fef3c7');
  // lounge bin, top-left in front of the bay sofa (playable: 68,104)
  csRR(c, 82, 130, 52, 52, 8, '#475569', '#0f172a', 2);
  c.fillStyle = '#4ade80'; c.fillRect(80, 130, 56, 10);
  // TV on the top wall + media unit below it (playable: 510,94)
  csRR(c, 460, 44, 160, 18, 3, '#0f172a', '#475569', 2);
  c.fillStyle = 'rgba(56,189,248,0.18)';
  c.fillRect(470, 48, 140, 10);
  csRR(c, 435, 68, 204, 48, 6, '#f8fafc', '#cbd5e1', 3);
  // BIG CENTRAL coffee table (playable: 345,290, 310x205) — walk around it
  csRR(c, 303, 166, 248, 170, 10, '#ffffff', '#cbd5e1', 3);
  c.fillStyle = '#f8fafc'; c.strokeStyle = '#94a3b8'; c.lineWidth = 2;
  c.beginPath(); c.arc(500, 250, 9, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = '#1e293b';
  c.beginPath(); c.roundRect(450, 278, 48, 14, 4); c.fill();
  // sofa 3: RIGHT sofa — SAM'S sofa (playable: 830,140, 266x460)
  csRR(c, 691, 42, 213, 382, 16, '#3f3f46', '#18181b', 3);
  csRR(c, 705, 56, 185, 354, 12, '#d4d4d8');
  csRR(c, 775, 70, 110, 80, 12, '#38bdf8');
  csRR(c, 775, 170, 110, 95, 12, '#38bdf8');
  csRR(c, 775, 300, 110, 95, 12, '#38bdf8');
}

// ---- Cutscene 1: knock, enter the dark bedroom, switch the light on ----------
function csFrontYard(c, t) {
  c.fillStyle = '#4a7c3f';
  c.fillRect(0, 0, CS_W, CS_H);
  c.fillStyle = '#437236';
  for (let y = 0; y < CS_H; y += 60) c.fillRect(0, y, CS_W, 30);
  // path
  c.fillStyle = '#d6c3a1';
  c.beginPath();
  c.moveTo(420, 270); c.lineTo(540, 270); c.lineTo(610, CS_H); c.lineTo(350, CS_H);
  c.closePath(); c.fill();
  // house
  c.fillStyle = '#e7d9bd'; c.fillRect(190, 56, 580, 214);
  c.strokeStyle = '#8b7355'; c.lineWidth = 4; c.strokeRect(190, 56, 580, 214);
  c.fillStyle = '#9a3412'; c.fillRect(170, 0, 620, 64);
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 2;
  for (let x = 190; x < 790; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 64); c.stroke(); }
  // windows
  [250, 600].forEach((wx) => {
    csRR(c, wx, 110, 110, 90, 4, '#7dd3fc', '#f8fafc', 6);
    c.fillStyle = '#f87171'; c.fillRect(wx + 6, 116, 22, 78); c.fillRect(wx + 82, 116, 22, 78);
  });
  // doorway, dark inside
  c.fillStyle = '#0b0a12'; c.fillRect(435, 100, 90, 160);
  const open = csEase(csSeg(t, 4.0, 4.8));
  const leafW = 90 * (1 - open * 0.85);
  c.fillStyle = '#92400e'; c.fillRect(435, 100, leafW, 160);
  c.strokeStyle = '#451a03'; c.lineWidth = 3; c.strokeRect(435, 100, leafW, 160);
  if (leafW > 40) {
    c.strokeRect(445, 112, leafW - 20, 55);
    c.strokeRect(445, 180, leafW - 20, 66);
    c.fillStyle = '#facc15'; c.beginPath(); c.arc(435 + leafW - 10, 185, 5, 0, Math.PI * 2); c.fill();
  }
  c.strokeStyle = '#451a03'; c.lineWidth = 7; c.strokeRect(431, 96, 98, 164);
  // steps
  c.fillStyle = '#9ca3af'; c.fillRect(420, 260, 120, 22);
  c.fillStyle = '#6b7280'; c.fillRect(420, 280, 120, 6);
  // hedges
  c.fillStyle = '#166534';
  for (let i = 0; i < 5; i++) {
    c.beginPath(); c.arc(215 + i * 34, 262, 20, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(750 - i * 34, 262, 20, 0, Math.PI * 2); c.fill();
  }

  // player
  let py, sc, walk = false, raise = false;
  if (t < 3.0) {
    const p = csEase(csSeg(t, 0.3, 3.0));
    py = csLerp(520, 330, p); sc = csLerp(2.9, 2.3, p); walk = t > 0.3 && t < 3.0;
  } else if (t < 4.6) {
    py = 330; sc = 2.3;
    raise = t < 4.0 && ((t - 3.0) * 3.2) % 1 < 0.5;
  } else {
    const p = csSeg(t, 4.6, 5.4);
    py = csLerp(330, 250, p); sc = csLerp(2.3, 1.7, p); walk = true;
  }
  csPlayer(c, 480, py, t, { scale: sc, walk, raiseHands: raise, cadence: 9 });
  csText(c, 'KNOCK', 360, 220, '#fde68a', 34, csSeg(t, 3.1, 3.2) * (1 - csSeg(t, 3.5, 3.8)), 3, t);
  csText(c, 'KNOCK', 600, 200, '#fde68a', 34, csSeg(t, 3.6, 3.7) * (1 - csSeg(t, 4.0, 4.3)), 3, t);
}

function csBedroomInterior(c, t) {
  const lightOn = t >= 8.4;
  csBedroomRoom(c, lightOn);
  csBed(c, t, { mode: 'SLEEPING' });
  // Zzz floats above Sam's head on the east pillow
  csZzz(c, 810, 175, t);

  // Player enters through the BOTTOM door (205,500), walks north, then
  // west to the light switch — stopping clear of the Kallax (58-152),
  // in the open floor between the Kallax and the rug.
  let px = 205, py = 330, walk = false, face = -Math.PI / 2, raise = false;
  if (t < 7.0) {
    const p = csSeg(t, 5.6, 7.0);
    py = csLerp(500, 330, csEase(p)); walk = p < 1;
  } else if (t < 8.0) {
    const p = csSeg(t, 7.0, 8.0);
    px = csLerp(205, 180, csEase(p)); py = csLerp(330, 285, csEase(p)); walk = p < 1; face = Math.PI;
  } else {
    px = 180; py = 285;
    face = t < 8.8 ? Math.PI : 0;
    raise = t > 8.1 && t < 8.5;
  }
  csPlayer(c, px, py, t, { scale: 2.2, walk, face, raiseHands: raise, cadence: 8 });

  let dark = 0.72;
  if (t >= 8.4 && t < 8.75) dark = Math.sin((t - 8.4) * 55) > 0 ? 0.5 : 0.12;
  else if (t >= 8.75) dark = 0;
  c.fillStyle = `rgba(6,10,28,${dark})`;
  c.fillRect(0, 0, CS_W, CS_H);

  csText(c, 'CLICK!', 250, 240, '#fde68a', 30, csSeg(t, 8.4, 8.5) * (1 - csSeg(t, 9.0, 9.4)), 2, t);
  csText(c, 'shhh...', 300, 270, '#e0f2fe', 22, csSeg(t, 6.2, 6.5) * (1 - csSeg(t, 7.2, 7.6)));
  csText(c, 'still asleep...', 480, 460, '#e0f2fe', 24, csSeg(t, 9.3, 9.6) * (1 - csSeg(t, 10.2, 10.5)));
}

function csBedroom(c, t) {
  if (t < 5.6) csFrontYard(c, t); else csBedroomInterior(c, t);
  const between = t < 5.6 ? csSeg(t, 4.9, 5.5) : 1 - csSeg(t, 5.6, 6.2);
  csFade(c, Math.max(between, csSeg(t, 10.3, 11)));
}

// ---- Cutscene 2: Sam is annoyed, goes downstairs, falls asleep on the sofa ----
function csLounge(c, t) {
  if (t < 5.4) {
    csBedroomRoom(c, true);
    const left = t >= 2.8;
    const mode = t < 1.0 ? 'SLEEPING' : t < 1.9 ? 'WARNING' : 'AWAKE';
    const stirring = t > 1.0 && t < 2.8;
    if (!left) {
      csBed(c, t, { mode, rot: stirring ? Math.sin(t * 38) * 0.12 : 0, lift: csSeg(t, 2.0, 2.8) });
      if (t < 1.0) csZzz(c, 810, 175, t);
    } else {
      csBed(c, t, { empty: true });
    }
    // player waiting WEST of the bed (by its foot), gets barged aside
    const shove = csEase(csSeg(t, 3.3, 3.7));
    csPlayer(c, 490 - shove * 60, 320 + shove * 30, t, { scale: 2.2, face: t < 3.3 ? 0 : Math.PI, cadence: 8 });
    // Sam climbs out of the WEST side of the bed, stomps to the BOTTOM door
    if (left) {
      let sx, sy;
      if (t < 3.9) { const p = csSeg(t, 2.8, 3.9); sx = csLerp(560, 380, p); sy = csLerp(280, 360, p); }
      else if (t < 4.5) { const p = csSeg(t, 3.9, 4.5); sx = csLerp(380, 260, p); sy = csLerp(360, 430, p); }
      else { const p = csSeg(t, 4.5, 5.3); sx = 260; sy = csLerp(430, 530, p); }
      csSam(c, sx, sy, t, { walk: true, mode: 'WARNING', cadence: 13, rot: Math.sin(t * 13) * 0.06 });
    }
    csText(c, '💢', 820, 110, '#ef4444', 56, csSeg(t, 2.1, 2.3) * (1 - csSeg(t, 2.9, 3.2)));
    csText(c, 'HMPH!', 420, 280, '#fca5a5', 34, csSeg(t, 3.4, 3.5) * (1 - csSeg(t, 4.1, 4.5)), 3, t);
    csFade(c, csSeg(t, 4.9, 5.4));
  } else {
    csLoungeRoom(c);
    // Sam enters through the BOTTOM door, walks AROUND the central coffee
    // table (south walkway, then east walkway) onto the RIGHT sofa.
    if (t < 6.0) {
      const p = csSeg(t, 5.4, 6.0);
      csSam(c, 205, csLerp(500, 440, p), t, { walk: true, mode: 'WARNING', cadence: 13, rot: Math.sin(t * 13) * 0.06 });
    } else if (t < 6.9) {
      const p = csSeg(t, 6.0, 6.9);
      csSam(c, csLerp(205, 640, p), 440, t, { walk: true, mode: 'WARNING', cadence: 13, rot: Math.sin(t * 13) * 0.06 });
    } else if (t < 7.6) {
      const p = csEase(csSeg(t, 7.0, 7.6));
      // flop onto the right sofa, head EAST (rot +90deg), like in-game
      csSam(c, csLerp(640, 795, p), csLerp(440, 280, p) - Math.sin(p * Math.PI) * 60, t, {
        rot: p * Math.PI / 2, mode: 'WARNING', sy: 1 - Math.sin(p * Math.PI) * 0.12
      });
    } else {
      csSam(c, 795, 280, t, { rot: Math.PI / 2, mode: 'SLEEPING', sx: 1 + Math.sin(t * 2.2) * 0.015 });
      csZzz(c, 760, 230, t);
    }
    csText(c, 'FLOP!', 560, 210, '#fde68a', 34, csSeg(t, 7.5, 7.6) * (1 - csSeg(t, 8.0, 8.4)), 3, t);
    // player follows in through the bottom door, tiptoes to the south walkway
    if (t > 7.9) {
      const p = csSeg(t, 7.9, 9.6);
      csPlayer(c, csLerp(205, 280, csEase(p)), csLerp(500, 430, p), t, { scale: 2.1, walk: p < 1, cadence: 6, face: 0 });
    }
    csText(c, 'shhh...', 220, 390, '#e0f2fe', 22, csSeg(t, 8.8, 9.1) * (1 - csSeg(t, 9.5, 9.9)));
    csFade(c, Math.max(1 - csSeg(t, 5.4, 5.9), csSeg(t, 9.5, 10)));
  }
}

// ---- Cutscene 3: Sam is furious, smashes through the window, flops onto the sun lounger ----
// There is NO pool in the playable garden — it has a central gravel bed and
// a sun lounger on the right, and Sam starts the garden level asleep on that
// lounger. So the cutscene now ends there too: Sam charges out, flops onto
// the lounger, grumbles, and the sun knocks him straight back out. No float,
// no falling asleep in water that does not exist in the game.
function csGardenScene(c, t) {
  c.fillStyle = '#4a7c3f';
  c.fillRect(0, 0, CS_W, CS_H);
  c.fillStyle = '#437236';
  for (let y = 0; y < CS_H; y += 60) c.fillRect(0, y, CS_W, 30);
  // house wall on the LEFT (he just came out of it)
  c.fillStyle = '#7c4a32'; c.fillRect(0, 0, 110, CS_H);
  c.strokeStyle = 'rgba(0,0,0,0.25)'; c.lineWidth = 2;
  for (let y = 0; y < CS_H; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(110, y); c.stroke(); }
  // broken window in the house wall + the door he runs out of
  csRR(c, 84, 245, 36, 110, 3, '#17120f', '#f8fafc', 6);
  c.fillStyle = '#e0f2fe';
  [[90, 250, 10, 18], [90, 330, 10, 20], [108, 250, 8, 14]].forEach(([x, y, w, h]) => {
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y + h / 2); c.lineTo(x, y + h); c.closePath(); c.fill();
  });
  c.fillStyle = '#0b0a12'; c.fillRect(70, 440, 40, 70);
  c.strokeStyle = '#451a03'; c.lineWidth = 6; c.strokeRect(70, 440, 40, 70);
  // stepping stones, left of centre (playable garden: left slab path)
  c.fillStyle = '#a8a29e'; c.strokeStyle = '#57534e'; c.lineWidth = 2;
  [180, 250, 320, 390].forEach((sy) => {
    c.beginPath(); c.roundRect(170, sy, 60, 40, 4); c.fill(); c.stroke();
  });
  // central gravel bed with its red-brick border (playable garden: 310,225)
  csRR(c, 280, 180, 380, 260, 12, '#b91c1c');
  csRR(c, 292, 192, 356, 236, 10, '#a8a29e');
  c.fillStyle = 'rgba(68,64,60,0.22)';
  for (let gx = 310; gx < 620; gx += 28) {
    for (let gy = 210; gy < 410; gy += 28) c.fillRect(gx, gy, 4, 4);
  }
  // SUN LOUNGER on the RIGHT (playable garden: 830,230, pillow at its top)
  csRR(c, 690, 140, 210, 320, 14, '#d6d3d1', '#57534e', 4);
  csRR(c, 704, 154, 182, 292, 12, '#0284c7');
  csRR(c, 740, 162, 110, 80, 12, '#f8fafc', '#94a3b8', 3);
  // bushes
  c.fillStyle = '#166534';
  [[300, 60], [330, 80], [900, 60], [260, 500], [900, 500]].forEach(([x, y]) => {
    c.beginPath(); c.arc(x, y, 26, 0, Math.PI * 2); c.fill();
  });
  // washing line, bottom-left (playable garden: clothing line, left fence)
  c.fillStyle = '#78350f'; c.fillRect(180, 470, 8, 30); c.fillRect(320, 470, 8, 30);
  c.strokeStyle = '#e0f2fe'; c.lineWidth = 3;
  c.beginPath(); c.moveTo(184, 472); c.lineTo(324, 472); c.stroke();
  c.fillStyle = '#38bdf8'; c.beginPath(); c.roundRect(210, 472, 32, 40, 5); c.fill();
  c.fillStyle = '#f472b6'; c.beginPath(); c.roundRect(262, 472, 32, 40, 5); c.fill();
}

function csGarden(c, t) {
  c.save();
  if (t < 4.3) {
    // lounge: Sam wakes up furious
    const shk = t > 3.6 && t < 4.1 ? 9 : 0;
    if (shk) c.translate(Math.sin(t * 90) * shk, Math.cos(t * 77) * shk);
    csLoungeRoom(c);
    // window (right wall, above Sam's sofa)
    const broken = t >= 3.6;
    csRR(c, 896, 220, 28, 200, 3, broken ? '#17120f' : '#7dd3fc', '#e7e5e4', 5);
    if (broken) {
      c.fillStyle = '#e0f2fe';
      [[900, 226, 12, 24], [900, 300, 12, 26], [900, 380, 12, 30], [912, 250, 8, 20]].forEach(([x, y, w, h]) => {
        c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y + h / 2); c.lineTo(x, y + h); c.closePath(); c.fill();
      });
      const tau = t - 3.6;
      c.fillStyle = 'rgba(224,242,254,0.9)';
      for (let i = 0; i < 16; i++) {
        const a = Math.PI / 2 + (i / 15) * Math.PI;
        const sp = 130 + ((i * 47) % 120);
        c.globalAlpha = csClamp(1 - tau / 0.7);
        c.save();
        c.translate(910 + Math.cos(a) * sp * tau, 320 + Math.sin(a) * sp * tau * 1.6);
        c.rotate(i + tau * 9);
        c.fillRect(-5, -2, 10, 4);
        c.restore();
      }
      c.globalAlpha = 1;
    }
    // player cowering in the south-west walkway
    csPlayer(c, 170 + Math.sin(t * 38) * 1.4, 410, t, { scale: 2.2, face: 0 });

    if (t < 2.2) {
      const mode = t < 1.0 ? 'SLEEPING' : t < 1.8 ? 'WARNING' : 'AWAKE';
      const shake = t > 1.0 ? Math.sin(t * 45) * 0.04 : 0;
      // lying on the RIGHT sofa, head EAST (rot +90deg), like in-game
      csSam(c, 795, 280, t, { rot: Math.PI / 2 + shake, mode, sx: 1 + Math.sin(t * 2.2) * 0.015 });
      if (t < 1.0) csZzz(c, 760, 230, t);
    } else if (t < 2.9) {
      const p = csEase(csSeg(t, 2.2, 2.9));
      csSam(c, csLerp(795, 820, p), csLerp(280, 300, p) - Math.sin(p * Math.PI) * 40, t, {
        rot: csLerp(Math.PI / 2, 0, p), mode: 'AWAKE', fists: true
      });
    } else if (t < 3.6) {
      const p = csSeg(t, 2.9, 3.6);
      csSam(c, csLerp(820, 880, p), 300, t, { walk: true, mode: 'AWAKE', cadence: 20, fists: true, scale: 2.4 });
    } else {
      const p = csEase(csSeg(t, 3.6, 4.0));
      csSam(c, csLerp(880, 950, p), 300, t, { mode: 'AWAKE', fists: true, scale: csLerp(2.4, 3.2, p), rot: p * 0.9 });
    }
    if (t > 1.8 && t < 2.9) csSteam(c, 795, 250, t);
    if (t > 1.8 && t < 3.6) {
      c.fillStyle = `rgba(220,38,38,${0.16 * csSeg(t, 1.8, 2.2)})`;
      c.fillRect(0, 0, CS_W, CS_H);
    }
    csText(c, 'AAARGH!!', 480, 120, '#fca5a5', 54, csSeg(t, 2.0, 2.15) * (1 - csSeg(t, 3.2, 3.6)), 5, t);
    csText(c, 'SMASH!', 780, 220, '#fde68a', 44, csSeg(t, 3.6, 3.7) * (1 - csSeg(t, 4.0, 4.3)), 4, t);
    c.restore();
    csFade(c, csSeg(t, 3.9, 4.3));
    return;
  }

  // garden — no pool. Sam charges out and flops onto the sun lounger.
  csGardenScene(c, t);
  const landAt = 5.8;
  if (t < landAt) {
    const p = csSeg(t, 4.5, landAt);
    const x = csLerp(150, 760, p);
    const y = csLerp(300, 260, p) - Math.sin(p * Math.PI) * 90;
    csSam(c, x, y, t, { mode: 'AWAKE', fists: true, scale: 2.2 + Math.sin(p * Math.PI) * 0.6, rot: p * 1.2 });
  } else {
    const tau = t - landAt;
    // dust puff where he lands on the lounger
    if (tau < 0.6) {
      for (let i = 0; i < 6; i++) {
        c.fillStyle = `rgba(180,160,130,${csClamp(1 - tau / 0.6) * 0.7})`;
        c.beginPath(); c.arc(740 + i * 22, 380 + Math.sin(i * 2.1) * 10, 5 + tau * 22, 0, Math.PI * 2); c.fill();
      }
    }
    // Sam on the lounger: head on the pillow at the top, body down it.
    // In-game he starts the garden level asleep here, so this is where the
    // cutscene has to leave him — not in water, not on a float.
    const settle = csEase(csSeg(t, landAt, landAt + 0.5));
    const mode = t < 7.8 ? 'AWAKE' : 'SLEEPING';
    csSam(c, 795, 280 + (1 - settle) * 14, t, {
      rot: (1 - settle) * 0.4, mode, sx: 1 + Math.sin(t * 2.2) * 0.015
    });
    if (t >= 7.8) csZzz(c, 760, 200, t);
    csText(c, 'THUMP!', 795, 110, '#fde68a', 40, csSeg(t, landAt, landAt + 0.1) * (1 - csSeg(t, 6.8, 7.2)), 3, t);
    csText(c, 'HMPH!!', 795, 500, '#fca5a5', 36, csSeg(t, 7.0, 7.1) * (1 - csSeg(t, 7.6, 7.9)), 4, t);
  }
  // player runs out after him, stops west of the gravel bed (bed starts x=280)
  if (t > 6.6) {
    let px, py;
    if (t < 7.7) { const p = csSeg(t, 6.6, 7.7); px = csLerp(90, 230, p); py = csLerp(475, 430, p); }
    else { const p = csEase(csSeg(t, 7.7, 8.8)); px = csLerp(230, 250, p); py = csLerp(430, 350, p); }
    csPlayer(c, px, py, t, { scale: 2.2, walk: t < 8.8, cadence: 14, face: 0 });
  }
  csText(c, 'shhh...', 220, 390, '#e0f2fe', 22, csSeg(t, 8.8, 9.1) * (1 - csSeg(t, 9.5, 9.9)));
  csFade(c, Math.max(1 - csSeg(t, 4.3, 4.8), csSeg(t, 9.5, 10)));
  c.restore();
}

function clearCutsceneCanvas() {
  if (!cutsceneCanvas) return;
  const c = cutsceneCanvas.getContext('2d');
  c.clearRect(0, 0, CS_W, CS_H);
}

function hideCutsceneShell() {
  cutsceneShell?.classList.remove('active');
  clearCutsceneCanvas();
}

// Per-cutscene first watch: localStorage detector, one entry per map.
// Bedroom, lounge, and garden each get their own first watch — watching
// bedroom does NOT unlock skipping lounge or garden. Each cutscene is
// unskippable the first time THAT map's cutscene is seen, skippable every
// time after that map has finished naturally once. Refreshing does NOT
// reset it (it's localStorage, not session), but the lunge demo still
// replays after a refresh if you watch the whole intro cutscene — that
// demo is gated on introCutsceneWatched (this session), not on this flag.
// Dev menu can toggle/reset all flags for testing (see runCheatAction).
const CUTSCENE_SEEN_KEY = 'dont_wake_sam_cutscene_seen_v1';
const CUTSCENE_MAPS = ['bedroom', 'lounge', 'garden'];
function getSeenCutscenes() {
  try {
    const raw = localStorage.getItem(CUTSCENE_SEEN_KEY);
    if (!raw) return {};
    if (raw === '1') {
      // Old single-flag format: that could only have come from the first
      // cutscene, which is bedroom — migrate it to bedroom-only.
      return { bedroom: true };
    }
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed;
    return {};
  } catch (e) {
    return {};
  }
}
function hasEverCompletedCutscene(mapId) {
  const id = mapId || cutsceneMap || currentMap;
  if (!id) return false;
  return Boolean(getSeenCutscenes()[id]);
}
function markCutsceneSeen(mapId) {
  const id = mapId || cutsceneMap || currentMap;
  if (!id) return;
  try {
    const seen = getSeenCutscenes();
    seen[id] = true;
    localStorage.setItem(CUTSCENE_SEEN_KEY, JSON.stringify(seen));
  } catch (e) {}
}
function canSkipCutscene(mapId) {
  return hasEverCompletedCutscene(mapId);
}
function allCutscenesSeen() {
  return CUTSCENE_MAPS.every((m) => hasEverCompletedCutscene(m));
}
function refreshCutsceneSkipToggle() {
  document.querySelectorAll('[data-cheat-action="toggle-cutscene-skip"]').forEach((btn) => {
    btn.textContent = allCutscenesSeen() ? 'CUTSCENE SKIP: ON (ALL SEEN)' : 'CUTSCENE SKIP: OFF — RESET ALL';
  });
}
function updateCutsceneSkipLabel() {
  // No "cannot skip" title: on a first watch the skip prompt just isn't
  // there. If you see the prompt, you can skip; if you don't, you can't.
  if (cutsceneSkipLabel && cutsceneMap) {
    if (canSkipCutscene(cutsceneMap)) {
      cutsceneSkipLabel.textContent = document.body.classList.contains('touch-controls-on') ? 'TAP TO SKIP' : 'PRESS SPACE / ENTER / ESC TO SKIP';
      cutsceneSkipLabel.style.display = '';
    } else {
      cutsceneSkipLabel.style.display = 'none';
    }
  }
  refreshCutsceneSkipToggle();
}

function beginMapCutscene(mapId) {
  if (cutscenesSeenThisSession.has(mapId)) {
    // Play-once-per-session is the correct rule — but "not playing" must
    // also mean "nothing on screen". Previously a cutscene that was
    // interrupted (RESTART / MAIN MENU / map switch mid-cutscene) left the
    // shell with .active still on it and its last frame in the bitmap, so
    // the next start showed a frozen, unskippable still: gameState was
    // PLAYING, so drawMapCutscene() never redrew it and the skip key
    // (which only works in CUTSCENE) never dismissed it. Hide + clear here,
    // so every path that does NOT start a cutscene leaves no frame behind.
    hideCutsceneShell();
    cutsceneOutroStep = -1; // no cutscene played, so no ending is owed
    return false;
  }
  cutscenesSeenThisSession.add(mapId);
  cutsceneMap = mapId;
  cutsceneTimer = 0;
  cutsceneStartTime = performance.now();
  cutsceneBgmStep = 0; // cutscene music always starts from the top of its phrase
  cutsceneOutroStep = -1; // a new cutscene cancels any pending ending
  gameState = 'CUTSCENE';
  cutsceneShell?.classList.add('active');
  updateCutsceneSkipLabel();
  return true;
}

function endMapCutscene(watched = false) {
  // Capture before clearing: only a natural finish of the intro counts
  // as "watched". Skips (click / Space / Esc / Enter / menu / map switch)
  // call this with watched=false, so they never unlock the tutorial.
  const finishedMap = cutsceneMap;
  const wasInCutscene = gameState === 'CUTSCENE';
  // First watch of THIS cutscene cannot be skipped: if this map's
  // cutscene has never finished naturally, a watched=false end is a skip
  // attempt — stay in CUTSCENE and keep playing. Natural finishes
  // (watched=true) and leaked-still dismissals (wasInCutscene=false)
  // always go through.
  // Returns false when blocked, true when it actually ended/dismissed.
  if (wasInCutscene && !watched && !canSkipCutscene(finishedMap)) {
    updateCutsceneSkipLabel();
    return false;
  }
  if (wasInCutscene && watched) {
    // First natural finish of THIS map unlocks skipping that map forever after.
    markCutsceneSeen(finishedMap);
    if (finishedMap === 'bedroom') {
      introCutsceneWatched = true;
    }
  }
  hideCutsceneShell();
  cutsceneMap = null;
  cutsceneTimer = 0;
  // Only advance to PLAYING if we were actually in a cutscene. This is
  // also the safe "dismiss any leaked still" helper now, and it must never
  // yank the game out of START / GAMEOVER / the menu.
  if (gameState === 'CUTSCENE') {
    gameState = 'PLAYING';
    // A cutscene that actually played gets its closing cadence (see the
    // outro branch in startBackgroundMusic) instead of a hard cut.
    // This fires for watched AND skipped endings — the tutorial's
    // watched flag above is separate, and stays skip-gated.
    cutsceneOutroStep = 0;
    cutsceneOutroTick = 0;
  }
  updateCutsceneSkipLabel();
  return true;
}

function drawMapCutscene() {
  if (gameState !== 'CUTSCENE' || !cutsceneCanvas) return;
  const t = (performance.now() - cutsceneStartTime) / 1000;
  if (t >= (CUTSCENE_DURATIONS[cutsceneMap] || 10)) {
    endMapCutscene(true);
    return;
  }
  const c = cutsceneCanvas.getContext('2d');
  c.clearRect(0, 0, CS_W, CS_H);
  if (cutsceneMap === 'bedroom') csBedroom(c, t);
  else if (cutsceneMap === 'lounge') csLounge(c, t);
  else csGarden(c, t);
}

// The skip label says Space / Enter / Esc — make the shell itself
// clickable too, so a visible cutscene is never stuck on screen.
cutsceneShell?.addEventListener('click', () => {
  if (gameState === 'CUTSCENE' || cutsceneShell.classList.contains('active')) {
    endMapCutscene();
  }
});

const player = {
  x: 340,
  y: 520,
  radius: 20,
  baseSpeed: 330,
  lives: 3, // 3 Blue Forcefield lives (triggered via QTE when Sam charges!)
  holding: null,
  hasStick: false, // One-time knockout stick stored in inventory
  facingAngle: -Math.PI / 2,
  stepPhase: 0,
  isMoving: false,
  slowTimer: 0,
  speedBoostTimer: 0 // Once-per-game short speed boost from riffing the guitar!
};

// Sam's Sleep / Wake / Ice / Knockout State
const sam = {
  state: 'SLEEPING', // SLEEPING | WARNING | AWAKE | ATTACKING
  timer: 3.2,
  warningDuration: 0.78,
  awakeDuration: 2.1,
  iceTimer: 0, // When > 0, Sam is ICED and cannot wake up!
  knockoutTimer: 0, // When > 0, Sam was knocked out cold by the Stick or Forcefield!
  frozenOnSpot: false, // True when Sam lunged at you and got frozen mid-floor by an Ice Cube!
  returningToBed: false, // True when Sam unfreezes on the floor and walks back into bed!
  knockbackByStick: false, // True when Sam was knocked back into bed by the Stick during a lunge!
  lungeAngle: Math.PI, // Facing angle of Sam when lunging or frozen on the floor
  pendingDoublePeek: false, // Whether Sam will do a quick double-peek after closing eyes
  isDoublePeek: false, // Whether current warning/awake is a short double-peek
  peekChainRemaining: 0,
  isTriplePeek: false,
  graceTimer: 0, // Brief grace window when whoopee cushion wakes Sam
  attackX: samHead.x,
  attackY: samHead.y,
  attackStartDist: 500,
  qteActive: false,
  qteFailed: false,
  knockbackStartX: samHead.x,
  knockbackStartY: samHead.y,
  knockbackProgress: 0,
  zzzParticles: []
};

let shieldBurst = null; // Holds shattering blue forcefield shards when QTE succeeds

// Rotating funny situational phrases when pressing SPACE or picking up items
let funnyPhraseIndex = 0;
let spacePhraseCooldown = 0; // 5-second cooldown for pressing SPACE to show a random funny message
const generalFunnyPhrases = [
  "WHY DOES SAM SLEEP LIKE A MOTION SENSOR?!",
  "EXTREME 3 AM CHORE SIMULATOR.",
  "ONE CREAKY FLOORBOARD AND IT'S ALL OVER.",
  "CLEANING THIS ROOM SHOULD COUNT AS EXTREME SPORTS.",
  "I AM A SILENT TIDYING NINJA.",
  "HOW DOES ONE MAN PRODUCE THIS MUCH FLOOR CLUTTER?",
  "STEALTH LEVEL: MOM CLEANING AT 2 AM.",
  "IF HE WAKES UP, BLAME THE TEDDY BEAR."
];
const sockFunnyPhrases = [
  "WHY IS THIS SOCK CRISPY?!",
  "BIOHAZARD LEVEL 4 GYM SOCK SECURED.",
  "THIS SOCK COULD STAND UP ON ITS OWN.",
  "WHERE IS THE OTHER SOCK? NOBODY KNOWS."
];
const foodFunnyPhrases = [
  "3 AM FLOOR PIZZA... STILL WARM?",
  "HOW LONG HAS THIS WRAPPER LIVED UNDER HERE?",
  "DO YOU WANT ANTS, SAM? BECAUSE THIS IS HOW YOU GET ANTS.",
  "VINTAGE 2024 BEDROOM SNACK RECOVERED."
];
const cableFunnyPhrases = [
  "HOW DO CABLES TANGLE THEMSELVES IN THE DARK?!",
  "ANOTHER MYSTERY CORD THAT PLUGS INTO NOTHING.",
  "TRIPPING HAZARD NEUTRALIZED.",
  "50 FEET OF KNOTTED COPPER SECURED."
];

function getNextSituationalPhrase(contextType = null) {
  if (sam.state === 'AWAKE' && sam.iceTimer <= 0 && sam.knockoutTimer <= 0) {
    const awakeLines = [
      "DO NOT BREATHE. HE CAN SMELL FEAR.",
      "ACT NATURAL. PRETEND YOU'RE A COAT RACK.",
      "IF I DON'T MOVE, I'M BASICALLY BEDROOM FURNITURE."
    ];
    return awakeLines[funnyPhraseIndex++ % awakeLines.length];
  }
  if (sam.state === 'WARNING' && sam.iceTimer <= 0 && sam.knockoutTimer <= 0) {
    const warnLines = [
      "HE'S TWITCHING — STATUE MODE NOW!",
      "HOLD IT RIGHT THERE! DON'T BLINK!",
      "EYELIDS FLUTTERING — LOCK YOUR KNEES!"
    ];
    return warnLines[funnyPhraseIndex++ % warnLines.length];
  }
  if (sam.frozenOnSpot) {
    const frozenLines = [
      "WHY IS HE A HUMAN ICE SCULPTURE IN THE HALLWAY?!",
      "EXCUSE ME MATE, YOU'RE BLOCKING THE CARPET.",
      "WALK AROUND THE FROZEN MAN-STATUE!"
    ];
    return frozenLines[funnyPhraseIndex++ % frozenLines.length];
  }
  if (roomba.active && roomba.state === 'ROAMING' && Math.random() < 0.45) {
    const roombaLines = [
      "WHO SCHEDULED THE ROOMBA AT 3 AM?!",
      "WATCH YOUR ANKLES — THE ROBOT IS HUNTING!",
      "HIT THE BOTTOM-RIGHT DOCK BEFORE IT BUMPS YOU!"
    ];
    return roombaLines[funnyPhraseIndex++ % roombaLines.length];
  }
  const itemType = contextType || (player.holding && player.holding.type);
  if (itemType === 'sock') {
    return sockFunnyPhrases[funnyPhraseIndex++ % sockFunnyPhrases.length];
  }
  if (itemType === 'food') {
    return foodFunnyPhrases[funnyPhraseIndex++ % foodFunnyPhrases.length];
  }
  if (itemType === 'cable') {
    return cableFunnyPhrases[funnyPhraseIndex++ % cableFunnyPhrases.length];
  }
  return generalFunnyPhrases[funnyPhraseIndex++ % generalFunnyPhrases.length];
}

// Wandering Roomba Hazard (Dramatic entrance at 5,000+ score)
// Player baseSpeed is 330, so Roomba roaming speed 300 is very slightly slower than the player!
const roomba = {
  active: false,
  state: 'OFF', // OFF | INTRO | ROAMING | RETURNING | DOCKED
  x: 205,
  y: 724,
  vx: 0,
  vy: -28,
  radius: 22,
  speed: 185,
  returnSpeed: 105, // Slow return crawl back to base station
  playerContactTimer: 0,
  deflectCooldown: 0,
  dockTimer: 0,
  doorOpenProgress: 0,
  vignetteAlpha: 0,
  brushPhase: 0
};

// Roomba Base Station in the bottom-right area (touching it recalls the Roomba slowly to dock!)
const roombaBase = {
  x: 1055,
  y: 650,
  radius: 26
};

// Pesky Window Bird that randomly flies in through the top bay window (x: 560, y: 65),
// perches/flutters around you to block item pickups, and squawks loudly when shooed with SPACE!
const windowBird = {
  state: 'OUTSIDE', // OUTSIDE | FLYING_IN | HARASSING | FLYING_OUT
  x: 560,
  y: 55,
  wingPhase: 0,
  orbitAngle: 0,
  remindCooldown: 0,
  canShoo: false,
  spawnTimer: 11.0
};

let flyingStick = null;
let birdDismissQueued = false;

let items = [];
let slowHazards = [];
let lastLevelGooSpots = [];
let powerups = [];
let floatingTexts = [];

function getBirdSpawnDelay() {
  const [minT, maxT] = MAP_CONFIGS[currentMap].birdInterval;
  return minT + Math.random() * (maxT - minT);
}

function updateMapSelectorUI() {
  const unlockedCount =
    (unlockedMaps.bedroom ? 1 : 0) +
    (unlockedMaps.lounge ? 1 : 0) +
    (unlockedMaps.garden ? 1 : 0);

  // Map 1: Bedroom (Top HUD + Start Screen)
  mapBtnBedroom.classList.toggle('active', currentMap === 'bedroom');
  mapSubBedroom.textContent = currentMap === 'bedroom' ? 'ACTIVE' : 'READY';
  if (startMapBedroom) {
    startMapBedroom.classList.toggle('active', currentMap === 'bedroom');
    if (startMapSubBedroom) {
      startMapSubBedroom.textContent = currentMap === 'bedroom' ? 'SELECTED' : 'READY TO PLAY';
    }
  }

  // Map 2: The Lounge (Top HUD + Start Screen)
  mapBtnLounge.classList.toggle('locked', !unlockedMaps.lounge);
  mapBtnLounge.classList.toggle('active', currentMap === 'lounge');
  mapSubLounge.textContent = !unlockedMaps.lounge
    ? `${formatCash(LOUNGE_UNLOCK_SCORE)}`
    : currentMap === 'lounge'
    ? 'ACTIVE'
    : 'READY';
  if (startMapLounge) {
    startMapLounge.classList.toggle('locked', !unlockedMaps.lounge);
    startMapLounge.classList.toggle('active', currentMap === 'lounge');
    if (startMapSubLounge) {
      startMapSubLounge.textContent = !unlockedMaps.lounge
        ? `EARN ${formatCash(LOUNGE_UNLOCK_SCORE)} IN BEDROOM`
        : currentMap === 'lounge'
        ? 'SELECTED'
        : 'READY TO PLAY';
    }
  }

  // Map 3: The Backyard (Top HUD + Start Screen)
  mapBtnGarden.classList.toggle('locked', !unlockedMaps.garden);
  mapBtnGarden.classList.toggle('active', currentMap === 'garden');
  mapSubGarden.textContent = !unlockedMaps.garden
    ? `${formatCash(GARDEN_UNLOCK_SCORE)} (LOUNGE)`
    : currentMap === 'garden'
    ? 'ACTIVE'
    : 'READY';
  if (startMapGarden) {
    startMapGarden.classList.toggle('locked', !unlockedMaps.garden);
    startMapGarden.classList.toggle('active', currentMap === 'garden');
    if (startMapSubGarden) {
      startMapSubGarden.textContent = !unlockedMaps.garden
        ? `EARN ${formatCash(GARDEN_UNLOCK_SCORE)} IN LOUNGE`
        : currentMap === 'garden'
        ? 'SELECTED'
        : 'READY TO PLAY';
    }
  }

  // Random Mode (available once at least 2 maps are unlocked!)
  const canRandom = unlockedCount >= 2;
  if (!canRandom) randomMode = false;
  randomModeBtn.classList.toggle('locked', !canRandom);
  randomModeBtn.classList.toggle('random-on', randomMode);
  randomModeSub.textContent = !canRandom
    ? 'NEED 2 MAPS'
    : randomMode
    ? `ON (${Math.ceil(randomSwapTimer)}s)`
    : 'OFF (30-60s)';

  if (startRandomBtn) {
    startRandomBtn.classList.toggle('locked', !canRandom);
    startRandomBtn.classList.toggle('random-on', randomMode);
    if (startRandomSub) {
      startRandomSub.textContent = !canRandom
        ? 'UNLOCK 2 MAPS FIRST'
        : randomMode
        ? 'SHUFFLE ENABLED (30-60s)'
        : 'CLICK TO ENABLE SHUFFLE';
    }
  }
}

function showMapUnlockToast(mapId, messageText) {
  pendingToastMap = mapId;
  toastMapName.textContent = messageText;
  mapUnlockToast.classList.add('visible');
  toastHideTimer = 11.0;
}

function applyMapConfig(mapId) {
  const m = MAP_CONFIGS[mapId] || MAP_CONFIGS.bedroom;
  currentMap = m.id;
  dropZones = m.dropZones;
  furnitureObstacles = m.obstacles;
  itemTemplates = m.templates;
  carpetSpots = m.spots;
  samHead.x = m.samHeadPos.x;
  samHead.y = m.samHeadPos.y;
  samHead.radius = m.samHeadPos.radius;
  if (!sam.frozenOnSpot && !sam.returningToBed && sam.state !== 'ATTACKING') {
    sam.attackX = samHead.x;
    sam.attackY = samHead.y;
  }
  updateMapSelectorUI();
}

function swapMapMidGame(targetMapId, isRandomSwap = false) {
  if (!unlockedMaps[targetMapId]) return;
  if (isRandomSwap && gameState === 'PLAYING') {
    pendingMapTransition = targetMapId;
    gameState = 'MAP_TRANSITION';
    transitionTimer = 1.2;
    mapSwapBannerText = `MOVING TO ${MAP_CONFIGS[targetMapId].name}...`;
    mapSwapBannerTimer = transitionTimer;
    return;
  }
  if (targetMapId !== 'garden') {
    gardenBatches = 0;
    gardenBirdShook = false;
  }
  applyMapConfig(targetMapId);

  // If the new map doesn't allow the Roomba (Backyard), disable it;
  // otherwise if Roomba was already unlocked at 5,000+ pts, keep it roaming!
  if (!MAP_CONFIGS[currentMap].hasRoomba) {
    stopVacuumSound();
    roomba.active = false;
    roomba.state = 'OFF';
  } else if (currentMap === 'lounge' && !loungeRoombaReleased) {
    roomba.active = true;
    roomba.state = 'DOCKED';
    roomba.x = roombaBase.x - 6;
    roomba.y = roombaBase.y;
    roomba.vx = -1;
    roomba.vy = 0;
    roomba.dockTimer = 999999;
    stopVacuumSound();
  } else if (unlockedRoomba && !roomba.active) {
    if (currentMap === 'bedroom') {
      triggerDramaticRoombaEntrance();
    } else {
      roomba.active = true;
      roomba.state = 'ROAMING';
      roomba.x = 300;
      roomba.y = 615;
      roomba.vx = roomba.speed;
      roomba.vy = -roomba.speed * 0.4;
    }
  }

  // Ensure player isn't trapped inside the new map's furniture (e.g. Lounge center coffee table!)
  if (!canMoveTo(player.x, player.y)) {
    const safeSpot =
      carpetSpots.find((sp) => canMoveTo(sp.x, sp.y)) || { x: 265, y: 520 };
    player.x = safeSpot.x;
    player.y = safeSpot.y;
  }

  // Update held item label/emoji to match the new map's item theme
  if (player.holding) {
    const tList = itemTemplates[player.holding.type] || itemTemplates.sock;
    const tpl = tList[0];
    player.holding.name = player.holding.isHeavy ? `Heavy ${tpl.name}` : tpl.name;
    player.holding.emoji = tpl.emoji;
  }

  // Re-scatter current floor items & hazards onto valid spots on the new map
  const countToRespawn = Math.max(1, items.length);
  const hadStinky = items.find((it) => it.isStinky);
  items = [];
  for (let i = 0; i < countToRespawn; i++) {
    spawnSingleMessItem(true);
  }
  if (hadStinky && items.length > 0) {
    items[0].isStinky = true;
    items[0].stinkTimer = hadStinky.stinkTimer;
    items[0].maxStinkTimer = hadStinky.maxStinkTimer;
  }
  refreshGooHazards(true);

  // Reset bird timer for the new map's bird frequency (Backyard has far more birds!)
  if (windowBird.state === 'OUTSIDE') {
    windowBird.spawnTimer = Math.min(windowBird.spawnTimer, getBirdSpawnDelay());
  }

  // Give a brief safe sleep window when swapping maps so the player can orient themselves
  if (sam.state !== 'ATTACKING') {
    sam.state = 'SLEEPING';
    sam.pendingDoublePeek = false;
    sam.isDoublePeek = false;
    sam.peekChainRemaining = 0;
    sam.isTriplePeek = false;
    sam.timer = Math.max(sam.timer, 2.4);
    updateSamCamUI();
  }

  playSound('levelup');
  mapSwapBannerText = isRandomSwap
    ? `RANDOM MODE SWAP → ${MAP_CONFIGS[currentMap].name}!`
    : `MAP SWITCHED → ${MAP_CONFIGS[currentMap].name}!`;
  mapSwapBannerTimer = 3.2;
  beginMapCutscene(currentMap);
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Compute target active floor items & difficulty tier from current score in Infinite Mode
// Only 5 items are active on the board at a time, spaced far apart and away from their drop zones
// so the player must traverse the room instead of camping near the containers!
function getInfiniteConfig() {
  const targetItems = 5;
  const maxHeavyOnFloor = itemsSorted >= 20 ? 2 : itemsSorted >= 12 ? 1 : 0;
  const hazardCount = itemsSorted >= 25 ? 3 : itemsSorted >= 10 ? 2 : 1;
  return { targetItems, maxHeavyOnFloor, hazardCount };
}

function spawnSingleMessItem(animateScatter = true) {
  const cfg = getInfiniteConfig();
  const types = ['sock', 'food', 'cable'];
  const type = types[itemSpawnCounter % 3];
  const tplList = itemTemplates[type];
  const tpl = tplList[itemSpawnCounter % tplList.length];
  itemSpawnCounter++;

  const zone = dropZones[type];
  const occupied = [
    ...items.map((it) => ({ x: it.targetX, y: it.targetY })),
    ...powerups.map((p) => ({ x: p.targetX, y: p.targetY })),
    ...slowHazards.map((h) => ({ x: h.targetX, y: h.targetY }))
  ];

  const shuffledSpots = shuffle(carpetSpots);
  // Don't overcrowd under the bed (at most 1 item under the bed at a time)
  const underBedActive = items.some((it) => it.targetX > 750 && it.targetY > 600);
  const candidatePool = underBedActive
    ? shuffledSpots.filter((sp) => !(sp.x > 750 && sp.y > 600))
    : shuffledSpots;

  // Prefer spots that are far from other items (>= 150px), far from the player (>= 155px),
  // and far from the item's own drop-off container (>= 215px) so you can't camp near drop zones!
  let chosenSpot = candidatePool.find(
    (sp) =>
      occupied.every((occ) => Math.hypot(occ.x - sp.x, occ.y - sp.y) >= 150) &&
      Math.hypot(player.x - sp.x, player.y - sp.y) >= 155 &&
      (!zone || Math.hypot(zone.dropX - sp.x, zone.dropY - sp.y) >= 215)
  );
  if (!chosenSpot) {
    chosenSpot = candidatePool.find(
      (sp) =>
        occupied.every((occ) => Math.hypot(occ.x - sp.x, occ.y - sp.y) >= 120) &&
        Math.hypot(player.x - sp.x, player.y - sp.y) >= 95 &&
        (!zone || Math.hypot(zone.dropX - sp.x, zone.dropY - sp.y) >= 165)
    );
  }
  if (!chosenSpot) {
    chosenSpot =
      candidatePool.find((sp) => occupied.every((occ) => Math.hypot(occ.x - sp.x, occ.y - sp.y) >= 85)) ||
      candidatePool[0];
  }

  const targetX = chosenSpot.x + (Math.random() * 14 - 7);
  const targetY = chosenSpot.y + (Math.random() * 14 - 7);
  const originX = 760;
  const originY = 380;

  const currentHeavyCount = items.filter((it) => it.isHeavy).length + (player.holding && player.holding.isHeavy ? 1 : 0);
  const isHeavy = currentHeavyCount < cfg.maxHeavyOnFloor && Math.random() < 0.38;

  items.push({
    id: `${type}-${itemSpawnCounter}`,
    type,
    name: isHeavy ? `Heavy ${tpl.name}` : tpl.name,
    emoji: tpl.emoji,
    isHeavy,
    isStinky: false,
    stinkTimer: 0,
    maxStinkTimer: 15.0,
    pickupCooldown: 0,
    x: animateScatter ? originX : targetX,
    y: animateScatter ? originY : targetY,
    startX: originX,
    startY: originY,
    targetX,
    targetY,
    scatterProgress: animateScatter ? 0 : 1,
    scatterDelay: animateScatter ? 0.06 * items.length : 0,
    arcHeight: 65 + Math.random() * 75,
    bobOffset: Math.random() * Math.PI * 2
  });
}

function spawnMessBatch(animateScatter = true) {
  const cfg = getInfiniteConfig();
  for (let i = 0; i < cfg.targetItems; i++) {
    spawnSingleMessItem(animateScatter);
  }

  // After 8+ items sorted, rare chance (45% per batch) that a Sock or Pizza starts expiring!
  // Indicated by a green stink cloud around it; must be prioritized before timer hits 0 or Sam wakes up & lunges!
  if (itemsSorted >= 8 && items.length > 0 && Math.random() < 0.45) {
    let candidates = items.filter((it) => it.type === 'sock' || it.type === 'food');
    let stinkyTarget = null;
    if (candidates.length > 0) {
      stinkyTarget = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      // Convert one item in the batch into a sock or pizza so it can expire with a stink cloud
      stinkyTarget = items[Math.floor(Math.random() * items.length)];
      const forcedType = Math.random() < 0.5 ? 'sock' : 'food';
      const tpl = itemTemplates[forcedType][Math.floor(Math.random() * itemTemplates[forcedType].length)];
      stinkyTarget.type = forcedType;
      stinkyTarget.name = stinkyTarget.isHeavy ? `Heavy ${tpl.name}` : tpl.name;
      stinkyTarget.emoji = tpl.emoji;
    }

    stinkyTarget.isStinky = true;
    stinkyTarget.stinkTimer = 15.0;
    stinkyTarget.maxStinkTimer = 15.0;

    spawnFloatingText(
      `STINKY ${stinkyTarget.type === 'sock' ? 'SOCK' : 'PIZZA'}! SORT IN 15s OR SAM WAKES UP!`,
      stinkyTarget.targetX,
      stinkyTarget.targetY - 36,
      '#a3e635'
    );
  }
}

function refreshGooHazards(animateScatter = true) {
  const cfg = getInfiniteConfig();
  slowHazards = [];

  const clumpSpots = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      const d = Math.hypot(a.targetX - b.targetX, a.targetY - b.targetY);
      if (d < 195) {
        const midX = (a.targetX + b.targetX) / 2 + (Math.random() * 44 - 22);
        const midY = (a.targetY + b.targetY) / 2 + (Math.random() * 44 - 22);
        if (
          canMoveTo(midX, midY) &&
          midX >= 270 &&
          midX <= 595 &&
          midY >= 225 &&
          midY <= 530 &&
          items.every((it) => Math.hypot(it.targetX - midX, it.targetY - midY) > 54)
        ) {
          clumpSpots.push({ x: midX, y: midY });
        }
      }
    }
  }

  const randomMidSpots = [];
  for (let r = 0; r < 28; r++) {
    const rx = 285 + Math.random() * 305;
    const ry = 230 + Math.random() * 295;
    if (
      canMoveTo(rx, ry) &&
      items.every((it) => Math.hypot(it.targetX - rx, it.targetY - ry) > 54)
    ) {
      randomMidSpots.push({ x: rx, y: ry });
    }
  }

  const combinedPool = shuffle([...shuffle(clumpSpots).slice(0, 3), ...randomMidSpots]);
  const freshPool = combinedPool.filter((sp) =>
    lastLevelGooSpots.every((old) => Math.hypot(old.x - sp.x, old.y - sp.y) > 115)
  );
  const hazardPool = freshPool.length >= cfg.hazardCount ? freshPool : combinedPool;

  for (let pSpot of hazardPool) {
    if (slowHazards.length >= cfg.hazardCount) break;
    if (
      Math.hypot(pSpot.x - player.x, pSpot.y - player.y) > 75 &&
      slowHazards.every((existing) => Math.hypot(existing.targetX - pSpot.x, existing.targetY - pSpot.y) > 105)
    ) {
      const originX = 760;
      const originY = 380;
      slowHazards.push({
        x: animateScatter ? originX : pSpot.x,
        y: animateScatter ? originY : pSpot.y,
        startX: originX,
        startY: originY,
        targetX: pSpot.x,
        targetY: pSpot.y,
        scatterProgress: animateScatter ? 0 : 1,
        scatterDelay: animateScatter ? 0.1 * slowHazards.length : 0,
        arcHeight: 60 + Math.random() * 60,
        radius: 28
      });
    }
  }

  lastLevelGooSpots = slowHazards.map((h) => ({ x: h.targetX, y: h.targetY }));
}

function findFreePowerupSpot() {
  const shuffled = shuffle(carpetSpots);
  return (
    shuffled.find(
      (sp) =>
        Math.hypot(sp.x - player.x, sp.y - player.y) > 75 &&
        items.every((it) => Math.hypot(sp.x - it.targetX, sp.y - it.targetY) > 55) &&
        powerups.every((p) => Math.hypot(sp.x - p.targetX, sp.y - p.targetY) > 65) &&
        slowHazards.every((haz) => Math.hypot(sp.x - haz.targetX, sp.y - haz.targetY) > 65)
    ) || shuffled[0]
  );
}

function spawnPowerupOfType(type, animateScatter = true) {
  if (powerups.some((p) => p.type === type)) return;
  const spot = findFreePowerupSpot();
  const originX = 760;
  const originY = 380;
  powerups.push({
    type,
    name: type === 'ice' ? 'Cryo Ice Pack' : 'Knockout Stick',
    x: animateScatter ? originX : spot.x,
    y: animateScatter ? originY : spot.y,
    startX: originX,
    startY: originY,
    targetX: spot.x,
    targetY: spot.y,
    scatterProgress: animateScatter ? 0 : 1,
    scatterDelay: 0,
    arcHeight: 72,
    bobOffset: Math.random() * Math.PI * 2
  });
}

function spawnInitialFloor() {
  items = [];
  slowHazards = [];
  powerups = [];
  itemSpawnCounter = 0;

  spawnMessBatch(false);
  refreshGooHazards(false);
  updateScoreboardUI();
}

function resetGame() {
  stopVacuumSound();
  // Fresh run: no cutscene frame may survive from a previous run.
  // startGame() re-shows the shell via beginMapCutscene() if one is due.
  hideCutsceneShell();
  samStopsThisGame = 0;
  cleanBatches = 0;
  loungeBatches = 0;
  gardenBatches = 0;
  stinkySortedThisGame = 0;
  roombaRecallsThisGame = 0;
  loungePerfectBlocksThisGame = 0;
  gardenBirdShook = false;
  score = 0;
  itemsSorted = 0;
  levelTimer = BATCH_TIMER_START;
  batchRefreshCount = 0;
  loungeRoombaReleased = false;
  nextStickItemThreshold = 15 + Math.floor(Math.random() * 6); // Stick once every 15 items max (random past 15)
  unlockedStinky = false;
  unlockedHeavy = false;
  unlockedStick = false;
  unlockedRoomba = false;
  spacePhraseCooldown = 0;
  lungeTutorialActive = false;
  lungeTutorialFrozen = false;
  mapSwapBannerTimer = 0;
  randomSwapTimer = 30.0 + Math.random() * 30.0; // Random mode interval: 30s to 60s!

  applyMapConfig(currentMap);

  player.x = 320;
  player.y = 525;
  player.lives = 3;
  player.holding = null;
  player.hasStick = false;
  player.facingAngle = -Math.PI / 2;
  player.isMoving = false;
  player.slowTimer = 0;
  player.speedBoostTimer = 0;
  guitarEasterEgg.speedBoostUsed = false;
  guitarEasterEgg.cooldown = 0;
  guitarEasterEgg.cooldownDuration = GUITAR_COOLDOWN_SECONDS;
  guitarEasterEgg.playingTimer = 0;
  guitarEasterEgg.riffsThisGame = 0;
  guitarEasterEgg.ringVisible = false;

  windowBird.state = 'OUTSIDE';
  windowBird.x = 560;
  windowBird.y = 55;
  windowBird.wingPhase = 0;
  windowBird.orbitAngle = 0;
  windowBird.remindCooldown = 0;
  windowBird.canShoo = false;
  birdDismissQueued = false;
  windowBird.spawnTimer = getBirdSpawnDelay();

  floatingTexts = [];
  flyingStick = null;
  shieldBurst = null;

  sam.state = 'SLEEPING';
  sam.timer = 2.8 + Math.random() * 1.8;
  sam.iceTimer = 0;
  sam.knockoutTimer = 0;
  sam.frozenOnSpot = false;
  sam.returningToBed = false;
  sam.lungeAngle = Math.PI;
  sam.pendingDoublePeek = false;
  sam.isDoublePeek = false;
  sam.peekChainRemaining = 0;
  sam.isTriplePeek = false;
  sam.qteActive = false;
  sam.qteFailed = false;
  sam.attackX = samHead.x;
  sam.attackY = samHead.y;
  sam.zzzParticles = [];

  roomba.active = false;
  roomba.state = 'OFF';
  roomba.doorOpenProgress = 0;
  roomba.vignetteAlpha = 0;
  roomba.dockTimer = 0;
  roomba.playerContactTimer = 0;
  if (currentMap === 'lounge') {
    roomba.active = true;
    roomba.state = 'DOCKED';
    roomba.x = roombaBase.x - 6;
    roomba.y = roombaBase.y;
    roomba.vx = -1;
    roomba.vy = 0;
    roomba.dockTimer = 999999;
  }

  spawnInitialFloor();
  updateSamCamUI();
  updateMapSelectorUI();
}

function checkScoreMilestones() {
  // Progressive Achievements based on itemsSorted & score
  // 8+ Items Sorted: Expiring Stinky Items (Sock / Pizza) unlock!
  if (itemsSorted >= 8 && !unlockedStinky) {
    unlockedStinky = true;
    spawnFloatingText('WATCH OUT FOR STINKY EXPIRING ITEMS!', canvas.width / 2, 90, '#a3e635');
  }

  // 12+ Items Sorted: Heavy Items & Sam's Double-Peek unlock!
  if (itemsSorted >= 12 && !unlockedHeavy) {
    unlockedHeavy = true;
    spawnFloatingText('HEAVY ITEMS & DOUBLE-PEEK UNLOCKED!', canvas.width / 2, 90, '#f59e0b');
  }

  // $1,000+ Score on Map 1 (Bedroom, 20 items @ $50): Unlock Map 2 (The Lounge) & Random Mode!
  if (score >= LOUNGE_UNLOCK_SCORE && currentMap === 'bedroom' && !unlockedMaps.lounge) {
    unlockedMaps.lounge = true;
    saveUnlockedMaps();
    updateMapSelectorUI();
    playSound('levelup');
    spawnFloatingText('NEW MAP UNLOCKED: THE LOUNGE ($75/ITEM)!', canvas.width / 2, 120, '#38bdf8');
    showMapUnlockToast('lounge', 'THE LOUNGE + RANDOM MODE UNLOCKED!');
  }

  // $1,500+ Score on Map 2 (The Lounge, 20 items @ $75): Unlock Map 3 (The Backyard)!
  if (score >= GARDEN_UNLOCK_SCORE && currentMap === 'lounge' && !unlockedMaps.garden) {
    unlockedMaps.garden = true;
    saveUnlockedMaps();
    updateMapSelectorUI();
    playSound('levelup');
    spawnFloatingText('FINAL MAP UNLOCKED: THE BACKYARD ($100/ITEM)!', canvas.width / 2, 120, '#4ade80');
    showMapUnlockToast('garden', 'THE BACKYARD (FINAL MAP) UNLOCKED!');
  }

  // 15+ Items Sorted: Dramatic Wandering Roomba Entrance (on indoor maps with Roomba!)
  if (itemsSorted >= 15 && !unlockedRoomba) {
    unlockedRoomba = true;
    if (MAP_CONFIGS[currentMap].hasRoomba && currentMap === 'bedroom') {
      triggerDramaticRoombaEntrance();
    }
  }
}

function triggerGuitarRiff() {
  guitarEasterEgg.cooldown = GUITAR_COOLDOWN_SECONDS;
  guitarEasterEgg.cooldownDuration = GUITAR_COOLDOWN_SECONDS;
  guitarEasterEgg.playingTimer = 1.3;
  guitarEasterEgg.riffsThisGame = (guitarEasterEgg.riffsThisGame || 0) + 1;
  guitarEasterEgg.ringVisible = true;
  playSound('guitar_riff');

  // The speed boost still applies on the first riff, but nothing tells
  // the player that — they should just feel it. Same flavour text every
  // time, so the first riff doesn't look special either.
  if (!guitarEasterEgg.speedBoostUsed) {
    guitarEasterEgg.speedBoostUsed = true;
    player.speedBoostTimer = 6.0;
  }
  const guitarFlavourLines = [
    'Nice riff!',
    'Sweet lick!',
    'That was clean!',
    'Smooth!',
    'Nice one!',
    'Ooh, nice riff!',
    'That slapped!'
  ];
  const guitarFlavour = guitarFlavourLines[Math.floor(Math.random() * guitarFlavourLines.length)];
  spawnFloatingText(
    guitarFlavour,
    guitarEasterEgg.x + 105,
    guitarEasterEgg.y - 12,
    '#f472b6'
  );

  if (guitarEasterEgg.riffsThisGame >= 7) {
    unlockAchievement('guitar_5');
  }
}

function triggerDramaticRoombaEntrance() {
  gameState = 'LEVEL_TRANSITION';
  transitionTimer = 5.4;
  playSound('roomba_reveal');

  // Force Sam into peaceful sleep during the dramatic Roomba entrance freeze
  sam.state = 'SLEEPING';
  sam.pendingDoublePeek = false;
  sam.isDoublePeek = false;
  sam.timer = 2.6;
  updateSamCamUI();

  roomba.active = true;
  roomba.state = 'INTRO';
  roomba.x = 205;
  roomba.y = 724;
  roomba.vx = 0;
  roomba.vy = -28;
  roomba.speed = 185;
  roomba.doorOpenProgress = 0;
  roomba.vignetteAlpha = 0;
  roomba.dockTimer = 0;
}

function addScore(points) {
  score += points;
  walletCash += points;
  try {
    localStorage.setItem(WALLET_KEY, String(walletCash));
  } catch (e) {}
  if (score > highScore) {
    highScore = score;
    try {
      localStorage.setItem(HIGHSCORE_KEY, String(highScore));
    } catch (e) {}
  }
  updateScoreboardUI();
  updateWalletUI();
  checkScoreMilestones();
}

let lastTimerStr = '';
let lastUrgentState = false;

function updateScoreboardUI() {
  scoreValEl.textContent = formatCash(score);
  highscoreValEl.textContent = formatCash(highScore);
  if (sidebarWalletValEl) sidebarWalletValEl.textContent = formatCash(walletCash);
  levelValEl.textContent = itemsSorted;
  const tStr = `${Math.max(0, levelTimer).toFixed(1)}s`;
  if (tStr !== lastTimerStr) {
    lastTimerStr = tStr;
    timerValEl.textContent = tStr;
  }
  const isUrgent = levelTimer <= 8.0 && gameState === 'PLAYING';
  if (isUrgent !== lastUrgentState) {
    lastUrgentState = isUrgent;
    timerBoxEl.classList.toggle('timer-urgent', isUrgent);
  }
}

let lastVisualSamState = '';
let lastIceCountdownStr = '';

function updateSamCamUI() {
  const visualState =
    sam.knockoutTimer > 0 ? 'KNOCKED_OUT' : sam.iceTimer > 0 ? 'ICED' : sam.state;

  if (visualState !== lastVisualSamState) {
    lastVisualSamState = visualState;
    samCamCard.classList.remove('state-warning', 'state-awake', 'state-iced');
    canvasWrapper.classList.remove('warn-border', 'danger-border', 'ice-border');
    camAlert.classList.remove('visible');
    camIce.classList.remove('visible');

    // Render Sam's generic vector sprite onto the Baby Monitor canvas
    if (camSpriteCanvas) {
      const cCtx = camSpriteCanvas.getContext('2d');
      cCtx.fillStyle =
        visualState === 'AWAKE' || visualState === 'ATTACKING'
          ? '#291212'
          : visualState === 'WARNING'
          ? '#261f10'
          : visualState === 'ICED'
          ? '#0f232e'
          : '#161412';
      cCtx.fillRect(0, 0, camSpriteCanvas.width, camSpriteCanvas.height);
      drawGenericSamFace(cCtx, 120, 68, 46, visualState);
    }

    if (visualState === 'ICED') {
      samCamCard.classList.add('state-iced');
      canvasWrapper.classList.add('ice-border');
      camIce.textContent = 'ICED';
      camIce.classList.add('visible');
      camZzz.style.display = 'block';
      samStateText.style.color = '#38bdf8';
    } else if (visualState === 'KNOCKED_OUT') {
      camIce.textContent = 'KO!';
      camIce.classList.add('visible');
      camZzz.style.display = 'block';
      samStateText.style.color = '#facc15';
    } else if (visualState === 'SLEEPING') {
      camZzz.style.display = 'block';
      samStateText.textContent = 'DEEP SLEEP (SAFE)';
      samStateText.style.color = '#10b981';
    } else if (visualState === 'WARNING') {
      samCamCard.classList.add('state-warning');
      canvasWrapper.classList.add('warn-border');
      camAlert.classList.add('visible');
      camZzz.style.display = 'none';
      samStateText.textContent = sam.isTriplePeek
        ? 'TRIPLE PEEK! FREEZE!'
        : sam.isDoublePeek
        ? 'DOUBLE PEEK! FREEZE!'
        : 'STIRRING! FREEZE!';
      samStateText.style.color = '#f59e0b';
    } else if (visualState === 'AWAKE' || visualState === 'ATTACKING') {
      samCamCard.classList.add('state-awake');
      canvasWrapper.classList.add('danger-border');
      camZzz.style.display = 'none';
      samStateText.textContent = 'EYES OPEN — DO NOT MOVE!';
      samStateText.style.color = '#ef4444';
    }
  }

  if (visualState === 'ICED') {
    const iceStr = `ICED SOLID (${sam.iceTimer.toFixed(1)}s)`;
    if (iceStr !== lastIceCountdownStr) {
      lastIceCountdownStr = iceStr;
      samStateText.textContent = iceStr;
    }
  } else if (visualState === 'KNOCKED_OUT') {
    samStateText.textContent = 'KNOCKED OUT';
  }
}

function spawnFloatingText(text, x, y, color = '#ffffff') {
  const now = performance.now();
  const previousTime = floatingTextCooldowns.get(text) || 0;
  if (
    now - previousTime < FLOATING_TEXT_COOLDOWN_MS ||
    now - lastFloatingTextTime < FLOATING_TEXT_GLOBAL_COOLDOWN_MS
  ) return;
  floatingTextCooldowns.set(text, now);
  lastFloatingTextTime = now;
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  words.forEach((word) => {
    const candidate = line ? `${line} ${word}` : word;
    if (line && candidate.length > 48) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  const lifetime = Math.min(4.5, Math.max(2.0, 1.5 + text.length / 22));
  // Only one floating message on screen at a time — a new message
  // replaces the old one instead of stacking up to 4-5 at once.
  floatingTexts.length = 0;
  floatingTexts.push({
    text,
    lines,
    x,
    y,
    color,
    alpha: 1,
    vy: -30,
    lifetime,
    age: 0
  });
}

const floatingTextCooldowns = new Map();
const FLOATING_TEXT_COOLDOWN_MS = 1100;
const FLOATING_TEXT_GLOBAL_COOLDOWN_MS = 320;
const MAX_FLOATING_TEXTS = 1;
let lastFloatingTextTime = -Infinity;

function dismissBird() {
  if (
    gameState !== 'PLAYING' ||
    windowBird.state !== 'HARASSING' ||
    !windowBird.canShoo
  ) {
    return false;
  }

  if (sam.state !== 'SLEEPING') {
    birdDismissQueued = false;
    triggerSamKill(
      'THE BIRD GAVE YOU AWAY!',
      'You shooed the bird while Sam was looking. Wait until his eyes are closed.'
    );
    return true;
  }

  windowBird.state = 'FLYING_OUT';
  windowBird.canShoo = false;
  birdDismissQueued = false;
  if (currentMap === 'garden') gardenBirdShook = true;
  windowBird.spawnTimer = getBirdSpawnDelay();
  playSound('squawk');
  spawnFloatingText('*SQUAWK!* BIRD SHOOED OUT THE WINDOW!', player.x, player.y - 38, '#34d399');
  return true;
}

function deflectRoomba() {
  if (
    gameState !== 'PLAYING' ||
    !roomba.active ||
    roomba.state !== 'ROAMING' ||
    roomba.deflectCooldown > 0
  ) {
    return false;
  }

  const dx = roomba.x - player.x;
  const dy = roomba.y - player.y;
  const dist = Math.hypot(dx, dy);
  if (dist > player.radius + roomba.radius + 34) return false;

  const angle = dist > 0.001 ? Math.atan2(dy, dx) : Math.atan2(-roomba.vy, -roomba.vx);
  roomba.vx = Math.cos(angle) * roomba.speed;
  roomba.vy = Math.sin(angle) * roomba.speed;
  roomba.playerContactTimer = 0;
  roomba.deflectCooldown = 0.45;
  playSound('shield_break');
  spawnFloatingText('ROOMBA DEFLECTED! KEEP MOVING!', player.x, player.y - 42, '#38bdf8');
  return true;
}

// Input Handling (WASD + Arrow Keys + SPACE to shield/shoo, E to bonk, Q to drop)
function isTextInputTarget(target) {
  return target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target?.isContentEditable;
}

window.addEventListener('keydown', (e) => {
  if (isTextInputTarget(e.target)) return;

  // Title screen is up: unskippable, so eat keys here — don't dismiss,
  // and don't let them leak into the game underneath.
  if (!titleScreenDismissed && titleScreen?.classList.contains('active')) {
    return;
  }

  const k = e.key.toLowerCase();
  const isSpace = e.code === 'Space' || k === ' ';
  const inputKey = isSpace ? ' ' : k;
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(inputKey)) {
    e.preventDefault();
  }
  keys[inputKey] = true;
  if (isSpace) birdDismissQueued = true;

  if (e.repeat) return;

  if (
    (gameState === 'CUTSCENE' || cutsceneShell?.classList.contains('active')) &&
    (isSpace || k === 'escape' || k === 'enter')
  ) {
    // Dismisses a real cutscene AND any leaked still: if the shell is
    // visible, Space/Esc/Enter must always clear it, whatever gameState is.
    endMapCutscene();
    return;
  }

  // E is exclusively the Stick action during Sam's lunge.
  if (k === 'e' && gameState === 'KILL_ANIM' && player.hasStick) {
    player.hasStick = false;
    sam.qteActive = false;
    sam.qteFailed = false;
    sam.knockbackByStick = true;
    sam.knockoutTimer = 7.0;
    recordSamStopped();
    playSound('bonk');
    flyingStick = {
      startX: player.x,
      startY: player.y,
      x: player.x,
      y: player.y,
      progress: 0,
      angle: 0
    };
    gameState = 'SAM_KNOCKBACK';
    sam.knockbackStartX = sam.attackX;
    sam.knockbackStartY = sam.attackY;
    sam.knockbackProgress = 0;

    spawnFloatingText('*BONK!* STICK SAVED YOU — SAM KO\'D FOR 7s!', player.x, player.y - 42, '#facc15');
    return;
  }

  // Quick-Time Event (QTE) Forcefield Trigger when Sam is charging at you!
  if (isSpace && gameState === 'KILL_ANIM' && sam.qteActive && !sam.qteFailed) {
    // Tutorial: Sam hasn't stopped in GOLD yet — early SPACE does nothing.
    // You actually have to wait for the stop and press at the right time.
    // (Stick [E] and ice still work any time — only SPACE is gated.)
    if (lungeTutorialActive && !lungeTutorialFrozen) {
      return;
    }
    const dist = Math.hypot(player.x - sam.attackX, player.y - sam.attackY);
    const progress = 1 - dist / sam.attackStartDist;

    // Blue is the smaller safe block window; gold is the exact perfect window.
    // Tutorial frozen: Sam is stopped in GOLD, so any SPACE now counts as
    // perfect, even if you moved a bit after he stopped.
    const tutorialPerfect = lungeTutorialActive && lungeTutorialFrozen;
    if (tutorialPerfect || (progress >= QTE_BLOCK_START && progress <= QTE_BLOCK_END)) {
      const isPerfectBlock = tutorialPerfect || (progress >= QTE_PERFECT_START && progress <= QTE_PERFECT_END);
      if (isPerfectBlock) {
        player.lives = Math.min(3, player.lives + 1);
        if (currentMap === 'lounge' && loungeRoombaReleased) {
          loungePerfectBlocksThisGame++;
          if (loungePerfectBlocksThisGame >= 10) {
            unlockAchievement('lounge_perfect');
          }
        }
      } else {
        player.lives = Math.max(0, player.lives - 1);
        if (currentMap === 'lounge' && loungeRoombaReleased) {
          loungePerfectBlocksThisGame = 0;
        }
      }
      player.slowTimer = 0;
      sam.qteActive = false;
      sam.knockbackByStick = false;
      recordSamStopped();
      playSound('shield_break');

      // Spawn shattering blue forcefield shards around the player
      const shards = [];
      for (let i = 0; i < 16; i++) {
        const ang = (i * Math.PI * 2) / 16 + (Math.random() * 0.25 - 0.125);
        const spd = 150 + Math.random() * 160;
        shards.push({
          x: player.x + Math.cos(ang) * 34,
          y: player.y + Math.sin(ang) * 34,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          rot: ang,
          vRot: (Math.random() - 0.5) * 14,
          size: 8 + Math.random() * 6
        });
      }
      shieldBurst = {
        x: player.x,
        y: player.y,
        ringRadius: 34,
        alpha: 1.0,
        shards
      };

      // Knock Sam flying backward into his bed!
      gameState = 'SAM_KNOCKBACK';
      sam.knockbackStartX = sam.attackX;
      sam.knockbackStartY = sam.attackY;
      sam.knockbackProgress = 0;
      sam.knockoutTimer = 5.5;

      spawnFloatingText(
        isPerfectBlock
          ? `PERFECT BLOCK! SHIELD RESTORED (${player.lives}/3)`
          : `FORCEFIELD SHATTERED! (${player.lives} ${player.lives === 1 ? 'LIFE' : 'LIVES'} LEFT)`,
        player.x,
        player.y - 42,
        isPerfectBlock ? '#facc15' : '#38bdf8'
      );
    } else {
      // An early or late block is still a usable shield, but it costs one life
      // and does not grant the perfect-block refund.
      player.lives = Math.max(0, player.lives - 1);
      if (currentMap === 'lounge' && loungeRoombaReleased) {
        loungePerfectBlocksThisGame = 0;
      }
      player.slowTimer = 0;
      sam.qteActive = false;
      sam.qteFailed = false;
      sam.knockbackByStick = false;
      playSound('shield_break');
      gameState = 'SAM_KNOCKBACK';
      sam.knockbackStartX = sam.attackX;
      sam.knockbackStartY = sam.attackY;
      sam.knockbackProgress = 0;
      sam.knockoutTimer = 5.5;
      spawnFloatingText(
        `BLOCKED — SHIELD LOST (${player.lives}/3)`,
        player.x,
        player.y - 42,
        '#f97316'
      );
    }
    return;
  }

  if ((isSpace || k === 'e' || k === 'q') && gameState === 'PLAYING') {
    // Space priority during normal play: deflect a nearby Roomba before shooing a bird.
    if (isSpace && deflectRoomba()) {
      return;
    }

    // Space shooes the bird during normal play; during a lunge it was handled by the shield QTE above.
    if (isSpace && dismissBird()) {
      return;
    }

    if (isSpace && windowBird.state === 'HARASSING') {
      if (sam.state !== 'SLEEPING') {
        spawnFloatingText('TOO LOUD! SAM IS NOT ASLEEP!', player.x, player.y - 38, '#ef4444');
      }
      return;
    }

    // E uses the one-time Knockout Stick.
    if (player.hasStick && k === 'e') {
      player.hasStick = false;
      playSound('bonk');
      flyingStick = {
        startX: player.x,
        startY: player.y,
        x: player.x,
        y: player.y,
        progress: 0,
        angle: 0
      };
      if (sam.frozenOnSpot) {
        sam.frozenOnSpot = false;
        sam.returningToBed = true;
      }
      sam.iceTimer = 0;
      sam.knockoutTimer = 7.0;
      sam.state = 'SLEEPING';
      sam.pendingDoublePeek = false;
      sam.isDoublePeek = false;
      sam.timer = Math.max(sam.timer, 2.8);
      updateSamCamUI();
      spawnFloatingText('*BONK!* SAM KNOCKED OUT FOR 7 SECONDS!', player.x, player.y - 36, '#facc15');
      return;
    }

    // Q drops your held mess item (with a pickup cooldown so you don't immediately re-pickup)
    if (k === 'q' && player.holding) {
      const dropped = player.holding;
      dropped.x = Math.max(175, Math.min(660, player.x - Math.cos(player.facingAngle) * 52));
      dropped.y = Math.max(185, Math.min(660, player.y - Math.sin(player.facingAngle) * 52));
      dropped.scatterProgress = 1;
      dropped.pickupCooldown = 0.65;
      items.push(dropped);
      player.holding = null;
      spawnFloatingText('Dropped item', player.x, player.y - 26, '#cbd5e1');
      return;
    }

  }
});

window.addEventListener('keyup', (e) => {
  if (isTextInputTarget(e.target)) return;

  const k = e.key.toLowerCase();
  keys[e.code === 'Space' || k === ' ' ? ' ' : k] = false;
});

window.addEventListener('blur', () => {
  keys = {};
});

function circleRectCollide(cx, cy, cr, rx, ry, rw, rh) {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy < cr * cr;
}

function canMoveTo(nx, ny) {
  if (nx - player.radius < 28 || nx + player.radius > 1104) return false;
  if (ny + player.radius > 692) return false;

  // Angled top bay window alcove
  const minTopY = nx > 385 && nx < 735 ? 78 : 138;
  if (ny - player.radius < minTopY) return false;

  // When Sam is frozen on the spot (or walking back to bed after unfreezing), you cannot walk over him!
  if (sam.frozenOnSpot || sam.returningToBed) {
    const newDistToSam = Math.hypot(nx - sam.attackX, ny - sam.attackY);
    const curDistToSam = Math.hypot(player.x - sam.attackX, player.y - sam.attackY);
    if (newDistToSam < player.radius + samHead.radius + 4 && newDistToSam < curDistToSam) {
      return false;
    }
  }

  for (const obs of furnitureObstacles) {
    if (circleRectCollide(nx, ny, player.radius, obs.x, obs.y, obs.w, obs.h)) {
      return false;
    }
  }
  return true;
}

function triggerSamKill(title, reason) {
  if (sam.state === 'ATTACKING' || gameState === 'SAM_KNOCKBACK') return;
  sam.iceTimer = 0;
  sam.knockoutTimer = 0;
  sam.frozenOnSpot = false;
  sam.returningToBed = false;
  sam.state = 'ATTACKING';
  gameState = 'KILL_ANIM';
  sam.attackX = samHead.x;
  sam.attackY = samHead.y;
  sam.attackStartDist = Math.max(120, Math.hypot(player.x - samHead.x, player.y - samHead.y));
  sam.qteActive = player.lives > 0;
  sam.qteFailed = false;
  // First lunge this page load + intro watched: tutorial. Mark seen
  // straight away so it only happens once per load, even if this lunge
  // ends in death. Refreshing the page resets the flag and brings it back.
  // If the intro was skipped, don't start it — and don't mark seen, so
  // a later watched intro (e.g. after a refresh) can still trigger it.
  if (!lungeTutorialSeen && introCutsceneWatched) {
    lungeTutorialSeen = true;
    lungeTutorialActive = true;
    lungeTutorialFrozen = false;
  }
  deathTitleEl.textContent = title;
  deathReasonEl.textContent = reason;
  finalScoreEl.textContent = formatCash(score);
  finalHighscoreEl.textContent = formatCash(highScore);
  finalLevelEl.textContent = itemsSorted;
  renderWardrobeUI();
  playSound('death');
  updateSamCamUI();
}

// Pickup: walk over a mess item to grab it — if hands empty, or auto-swap
// onto an urgent stinky item. Used by both the PLAYING update and the
// KILL_ANIM (lunge) update. Previously this block only lived in PLAYING,
// so walking over an item while Sam lunged did nothing. Mirrors the
// tryDepositHeldItem() fix: same rules, same bird block, same swap.
function tryPickupMessItems() {
  // 4. Pick up mess items automatically when walking over them (if hands empty, or auto-swap onto an urgent stinky item!)
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.scatterProgress < 1 || item.pickupCooldown > 0) continue;
    const canGrab = !player.holding || (item.isStinky && !player.holding.isStinky);
    if (!canGrab) continue;

    const dist = Math.hypot(player.x - item.x, player.y - item.y);
    if (dist < player.radius + 20) {
      if (windowBird.state === 'HARASSING') {
        if (windowBird.remindCooldown <= 0) {
          windowBird.remindCooldown = 1.1;
          spawnFloatingText('BIRD BLOCKING HANDS! PRESS [SPACE] TO SHOO!', player.x, player.y - 38, '#f59e0b');
        }
        break;
      }
      if (player.holding) {
        const swapped = player.holding;
        swapped.x = Math.max(175, Math.min(660, player.x - Math.cos(player.facingAngle) * 44));
        swapped.y = Math.max(185, Math.min(660, player.y - Math.sin(player.facingAngle) * 44));
        swapped.targetX = swapped.x;
        swapped.targetY = swapped.y;
        swapped.scatterProgress = 1;
        swapped.pickupCooldown = 0.85;
        items.push(swapped);
      }
      player.holding = item;
      items.splice(i, 1);
      playSound('pickup');
      spawnFloatingText(
        item.isStinky
          ? `STINKY ${item.type === 'sock' ? 'SOCK' : 'PIZZA'}! SORT IN ${item.stinkTimer.toFixed(1)}s!`
          : getNextSituationalPhrase(item.type),
        player.x,
        player.y - 28,
        item.isStinky ? '#a3e635' : item.isHeavy ? '#f59e0b' : '#fde047'
      );
      break;
    }
  }
}

// Deposit: if you're holding an item and standing in its matching
// drop-off container, put it in — even mid-lunge. Used by both the
// PLAYING update and the KILL_ANIM (lunge) update. Previously this
// block only lived in PLAYING, so walking into your bin while Sam
// lunged did nothing. Returns true if an item was deposited.
function tryDepositHeldItem() {
  // 5. Check if player reached the matching drop-off container while holding an item
  if (player.holding && dropZones[player.holding.type]) {
    const zone = dropZones[player.holding.type];
    const distToZone = Math.hypot(player.x - zone.dropX, player.y - zone.dropY);
    if (distToZone < 56) {
      const wasStinky = player.holding.isStinky;
      if (wasStinky) {
        stinkySortedThisGame++;
        if (stinkySortedThisGame >= 2) {
          unlockAchievement('stink_stopper');
        }
      }
      const pts = MAP_CONFIGS[currentMap].itemCash;
      levelTimer = Math.min(MAX_TIMER_CAP, levelTimer + ITEM_TIME_BONUS);
      playSound('deposit');
      itemsSorted++;
      if (itemsSorted >= 20 && player.lives === 3) {
        unlockAchievement('sorted_15');
      }
      player.holding = null;
      addScore(pts);

      // Clearing all five refreshes the batch and restores the timer to 20 seconds
      // only when the current timer has already fallen below that baseline.
      const clearedAllFive = items.length === 0 && !player.holding;
      if (clearedAllFive) {
        spawnFloatingText(
          `BATCH CLEARED! +$${pts} · TIMER ${levelTimer < BATCH_TIMER_START ? 'RESET TO 20s' : 'KEPT'}`,
          zone.dropX,
          zone.dropY - 26,
          '#facc15'
        );
      } else {
        spawnFloatingText(
          wasStinky
            ? `STINK CLEARED! +$${pts}`
            : `+$${pts}`,
          zone.dropX,
          zone.dropY - 24,
          wasStinky ? '#a3e635' : '#34d399'
        );
      }
      // Knockout Stick spawns at most once every 15 items sorted (plus random past that)
      if (itemsSorted >= nextStickItemThreshold) {
        nextStickItemThreshold = itemsSorted + 15 + Math.floor(Math.random() * 8);
        if (!player.hasStick && !powerups.some((p) => p.type === 'stick')) {
          spawnPowerupOfType('stick', true);
          if (!unlockedStick) {
            unlockedStick = true;
            playSound('levelup');
            spawnFloatingText('KNOCKOUT STICK UNLOCKED!', canvas.width / 2, 90, '#facc15');
          }
        }
      }

      if (clearedAllFive) {
        batchRefreshCount++;
        if (
          currentMap === 'lounge' &&
          batchRefreshCount >= 3 &&
          !loungeRoombaReleased
        ) {
          loungeRoombaReleased = true;
          roomba.active = true;
          roomba.state = 'ROAMING';
          roomba.x = 655;
          roomba.y = 645;
          const releaseAngle = -Math.PI * 0.72;
          roomba.vx = Math.cos(releaseAngle) * roomba.speed;
          roomba.vy = Math.sin(releaseAngle) * roomba.speed;
          startVacuumSound();
          spawnFloatingText('ROOMBA RELEASED FROM THE LOUNGE STAND!', 655, 615, '#f59e0b');
        }
        if (levelTimer < BATCH_TIMER_START) {
          levelTimer = BATCH_TIMER_START;
        }
        if (levelTimer >= 21) {
          unlockAchievement('first_batch');
        }
        if (levelTimer >= 18) {
          cleanBatches++;
        } else {
          cleanBatches = 0;
        }
        if (cleanBatches >= 5) {
          unlockAchievement('grandmaster');
        }
        if (currentMap === 'lounge') {
          loungeBatches++;
          if (loungeBatches >= 3) {
            unlockAchievement('unlock_lounge');
          }
        }
        if (currentMap === 'garden') {
          gardenBatches = gardenBirdShook ? gardenBatches + 1 : 0;
          gardenBirdShook = false;
          if (gardenBatches >= 3) {
            unlockAchievement('unlock_garden');
          }
        }
        spawnMessBatch(true);
        refreshGooHazards(true);
        updateScoreboardUI();
        // Ice is a regular refresh reward: every second cleared batch gets one.
        if (batchRefreshCount % 2 === 0 && !powerups.some((p) => p.type === 'ice')) {
          spawnPowerupOfType('ice', true);
          spawnFloatingText('ICE CUBE DROP! EVERY SECOND REFRESH!', canvas.width / 2, 90, '#38bdf8');
        }
      }

      return true; // deposited
    }
  }
  return false;
}

function update(dt) {
  // Tutorial freeze only lives inside a lunge — any exit clears it.
  if (gameState !== 'KILL_ANIM' && lungeTutorialActive) {
    lungeTutorialActive = false;
    lungeTutorialFrozen = false;
  }
  // Update floating notifications in all active states
  for (let i = floatingTexts.length - 1; i >= 0; i--) {
    const ft = floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.age += dt;
    ft.alpha = Math.max(0, 1 - ft.age / ft.lifetime);
    if (ft.age >= ft.lifetime) floatingTexts.splice(i, 1);
  }

  // Update shattering blue forcefield burst effect
  if (shieldBurst) {
    shieldBurst.ringRadius += dt * 240;
    shieldBurst.alpha = Math.max(0, shieldBurst.alpha - dt * 1.45);
    shieldBurst.shards.forEach((sh) => {
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;
      sh.rot += sh.vRot * dt;
    });
    if (shieldBurst.alpha <= 0) {
      shieldBurst = null;
    }
  }

  if (gameState === 'CUTSCENE') {
    return;
  }

  if (gameState === 'KILL_ANIM') {
    // Player can still move while Sam lunges towards you — except in
    // the frozen tutorial demo (see below), where movement locks until you block.
    if (player.slowTimer > 0) {
      player.slowTimer = Math.max(0, player.slowTimer - dt);
    }
    if (player.speedBoostTimer > 0) {
      player.speedBoostTimer = Math.max(0, player.speedBoostTimer - dt);
    }
    if (roomba.deflectCooldown > 0) {
      roomba.deflectCooldown = Math.max(0, roomba.deflectCooldown - dt);
    }
    // Demo freeze: the first-playthrough tutorial lunge where Sam stops
    // in GOLD so you can read and press SPACE. While he's stopped, you
    // can't walk around — it looks weird to wander off while he's frozen.
    // Normal lunges still let you run (e.g. to the bin to deposit).
    // SPACE / stick / ice still work — this only locks WASD movement.
    const tutorialDemoFrozen = lungeTutorialActive && lungeTutorialFrozen;
    if (tutorialDemoFrozen) {
      player.isMoving = false;
    } else {
      handlePlayerMovement(dt, false);

      // Stepping in purple goo still slows you while fleeing
      for (let i = slowHazards.length - 1; i >= 0; i--) {
        const haz = slowHazards[i];
        if (haz.scatterProgress < 1) continue;
        if (Math.hypot(player.x - haz.x, player.y - haz.y) < player.radius + haz.radius - 6) {
          slowHazards.splice(i, 1);
          player.slowTimer = 2.6;
          playSound('slow');
          spawnFloatingText('PURPLE GOO! SLOWED!', player.x, player.y - 30, '#c084fc');
        }
      }
    }

    // If you move and touch an Ice Cube while Sam is lunging, he freezes on the spot!
    for (let i = powerups.length - 1; i >= 0; i--) {
      const p = powerups[i];
      if (p.scatterProgress < 1) continue;
      if (p.type === 'ice' && Math.hypot(player.x - p.x, player.y - p.y) < player.radius + 32) {
        powerups.splice(i, 1);
        recordSamStopped();
        playSound('ice');

        // Ensure Sam freezes just outside player's collision circle so player is never trapped inside him
        const sdx = sam.attackX - player.x;
        const sdy = sam.attackY - player.y;
        const sdist = Math.hypot(sdx, sdy) || 1;
        const minSafeDist = player.radius + samHead.radius + 8;
        if (sdist < minSafeDist) {
          sam.attackX = player.x + (sdx / sdist) * minSafeDist;
          sam.attackY = player.y + (sdy / sdist) * minSafeDist;
        }

        sam.frozenOnSpot = true;
        sam.returningToBed = false;
        sam.iceTimer = 6.0;
        sam.state = 'SLEEPING';
        sam.pendingDoublePeek = false;
        sam.isDoublePeek = false;
        sam.qteActive = false;
        sam.qteFailed = false;
        gameState = 'PLAYING';
        updateSamCamUI();
        spawnFloatingText('SAM FROZEN ON THE SPOT! (IN THE WAY FOR 6s)', sam.attackX, sam.attackY - 48, '#38bdf8');
        return;
      }
    }

    // Pickup works mid-lunge too, same as deposit: walk over an item
    // while fleeing and you grab it (or auto-swap onto a stinky one).
    // Cooldowns still tick here, otherwise an item dropped just before
    // the lunge (Q, bird fling, stinky swap) would stay unpickable for
    // the whole lunge. Stink timers stay frozen mid-lunge — Sam is
    // already lunging, so expiring shouldn't re-trigger a kill.
    // Pickup runs before deposit so one frame can do both, exactly
    // like the PLAYING update (grab, then drop it in if you're at its bin).
    for (let i = 0; i < items.length; i++) {
      if (items[i].pickupCooldown > 0) {
        items[i].pickupCooldown = Math.max(0, items[i].pickupCooldown - dt);
      }
    }
    tryPickupMessItems();

    // Deposit works mid-lunge too: if you're holding the pizza and you
    // reach its bin while waiting for the perfect block, it goes in.
    // Movement, SPACE, stick, and ice are all untouched — this just
    // runs the same deposit check the PLAYING update runs.
    tryDepositHeldItem();

    const dx = player.x - sam.attackX;
    const dy = player.y - sam.attackY;
    const dist = Math.hypot(dx, dy);
    sam.lungeAngle = Math.atan2(dy, dx);
    // Give the player a readable chase window to use Stick, hit QTE, or sprint to an Ice Cube!
    const difficultyTier = Math.min(8, Math.floor(itemsSorted / 5));
    const lungeSpeed =
      (sam.qteActive && !sam.qteFailed) || player.hasStick
        ? Math.min(680, Math.max(485 + difficultyTier * 24, sam.attackStartDist * 1.05))
        : Math.min(860, 720 + difficultyTier * 18);
    // Tutorial: once Sam reaches the GOLD perfect window, he stops dead
    // and stays stopped until you press SPACE (or use stick / ice).
    // That way you can't die during the tutorial — you just have to
    // press at the right time. Latching on >= PERFECT_START (not just
    // inside the window) so a big frame step can't jump clean over it.
    if (lungeTutorialActive && !lungeTutorialFrozen) {
      const tutorialProgress = 1 - dist / sam.attackStartDist;
      if (tutorialProgress >= QTE_PERFECT_START) {
        lungeTutorialFrozen = true;
      }
    }
    if (lungeTutorialActive && lungeTutorialFrozen) {
      // Frozen in perfect — Sam doesn't move, and walking into him
      // can't kill you during the tutorial. Waiting on your SPACE.
    } else if (dist <= 30) {
      gameState = 'GAMEOVER';
      gameoverOverlay.classList.add('active');
    } else {
      // Tutorial lunge is slightly slower, so there's time to read the
      // three lines and see the ring turn gold before Sam stops.
      const tutorialSlow = lungeTutorialActive ? LUNGE_TUTORIAL_SPEED : 1;
      sam.attackX += (dx / dist) * lungeSpeed * dt * tutorialSlow;
      sam.attackY += (dy / dist) * lungeSpeed * dt * tutorialSlow;
    }
    return;
  }

  if (gameState === 'SAM_KNOCKBACK') {
    handlePlayerMovement(dt, false);
    sam.knockoutTimer = Math.max(0, sam.knockoutTimer - dt);
    sam.knockbackProgress = Math.min(1, sam.knockbackProgress + dt * 1.85);
    const t = sam.knockbackProgress;
    const ease = 1 - Math.pow(1 - t, 3);
    const arc = Math.sin(t * Math.PI) * 95;
    sam.attackX = sam.knockbackStartX + (samHead.x - sam.knockbackStartX) * ease;
    sam.attackY = sam.knockbackStartY + (samHead.y - sam.knockbackStartY) * ease - arc;

    if (sam.knockbackProgress >= 1) {
      sam.attackX = samHead.x;
      sam.attackY = samHead.y;
      sam.state = 'SLEEPING';
      // KO time starts when the counter action is pressed, so the knockback
      // animation consumes part of the punishment window.
      sam.pendingDoublePeek = false;
      sam.isDoublePeek = false;
      sam.timer = 2.4;
      if (!sam.knockbackByStick) {
        sam.graceTimer = 1.0;
      }
      sam.knockbackByStick = false;
      gameState = 'PLAYING';
      updateSamCamUI();
      spawnFloatingText(
        'SAM KNOCKED OUT IN BED FOR 7s!',
        player.x,
        player.y - 26,
        '#facc15'
      );
    }
    return;
  }

  // Handle the Dramatic Roomba Entrance while keeping the player controllable.
  if (gameState === 'LEVEL_TRANSITION') {
    transitionTimer -= dt;
    handlePlayerMovement(dt, false);

    if (roomba.active && roomba.state === 'INTRO') {
      roomba.brushPhase += dt * 10;
      const elapsed = 5.4 - transitionTimer;
      // 1. Swing open bottom-left door & fade in dramatic vignette
      if (transitionTimer > 0.7) {
        roomba.doorOpenProgress = Math.min(1, elapsed / 0.9);
        roomba.vignetteAlpha = Math.min(1, elapsed / 0.8);
      } else {
        // Close door and fade out vignette right before gameplay resumes
        roomba.doorOpenProgress = Math.max(0, transitionTimer / 0.7);
        roomba.vignetteAlpha = Math.max(0, transitionTimer / 0.7);
      }

      // 2. Very slowly roll the Roomba in through the bottom-left doorway (y: 724 -> 585)
      if (elapsed > 0.65 && roomba.y > 585) {
        roomba.y = Math.max(585, roomba.y - 34 * dt);
        roomba.vx = 0;
        roomba.vy = -34;
      }
    }

    if (transitionTimer <= 0) {
      if (roomba.active && roomba.state === 'INTRO') {
        stopVacuumSound();
        roomba.doorOpenProgress = 0;
        roomba.vignetteAlpha = 0;
        roomba.state = 'ROAMING';
        startVacuumSound();
        // Launch Roomba into the room at its fast roaming speed (very slightly slower than player!)
        const launchAngle = -Math.PI * 0.28;
        roomba.vx = Math.cos(launchAngle) * roomba.speed;
        roomba.vy = Math.sin(launchAngle) * roomba.speed;
        spawnFloatingText('ROOMBA UNLEASHED! TOUCH BOTTOM-RIGHT BASE TO RECALL!', roomba.x + 120, roomba.y - 28, '#facc15');
      }
      gameState = 'PLAYING';
    }
    return;
  }

  if (gameState === 'MAP_TRANSITION') {
    transitionTimer -= dt;

    if (transitionTimer <= 0) {
      const nextMap = pendingMapTransition;
      pendingMapTransition = null;
      if (nextMap) {
        swapMapMidGame(nextMap, false);
      }
      if (gameState === 'MAP_TRANSITION') {
        gameState = 'PLAYING';
      }
    }
    return;
  }

  if (gameState !== 'PLAYING') return;

  // Animate any newly tossed replacement items, goo puddles, or powerups landing on the floor
  [...items, ...slowHazards, ...powerups].forEach((obj) => {
    if (obj.scatterDelay > 0) {
      obj.scatterDelay -= dt;
    } else if (obj.scatterProgress < 1) {
      obj.scatterProgress = Math.min(1, obj.scatterProgress + dt * 1.65);
      const t = obj.scatterProgress;
      const ease = 1 - Math.pow(1 - t, 3);
      const arc = Math.sin(t * Math.PI) * (obj.arcHeight || 85);
      obj.x = obj.startX + (obj.targetX - obj.startX) * ease;
      obj.y = obj.startY + (obj.targetY - obj.startY) * ease - arc;
    }
  });

  // 1. Batch countdown timer. Reaching zero ends the shift.
  levelTimer -= dt;
  updateScoreboardUI();
  if (levelTimer <= 0) {
    levelTimer = BATCH_TIMER_START;
    triggerSamKill('TIME RAN OUT.', 'The batch timer reached zero — stop Sam with the shield!');
    return;
  }

  // Update flying stick animation if thrown
  if (flyingStick) {
    flyingStick.progress = Math.min(1, flyingStick.progress + dt * 5.2);
    const t = flyingStick.progress;
    flyingStick.x = flyingStick.startX + (samHead.x - flyingStick.startX) * t;
    flyingStick.y = flyingStick.startY + (samHead.y - flyingStick.startY) * t - Math.sin(t * Math.PI) * 65;
    flyingStick.angle += dt * 22;
    if (flyingStick.progress >= 1) {
      flyingStick = null;
    }
  }

  // 2. Player Movement & Slow / Speed Boost / Map Toast & Random Mode Timers
  if (achToastTimer > 0) {
    achToastTimer -= dt;
    if (achToastTimer <= 0 && achToastEl) {
      achToastEl.classList.remove('visible');
    }
  }
  if (toastHideTimer > 0) {
    toastHideTimer -= dt;
    if (toastHideTimer <= 0) {
      mapUnlockToast.classList.remove('visible');
    }
  }
  if (mapSwapBannerTimer > 0) {
    mapSwapBannerTimer = Math.max(0, mapSwapBannerTimer - dt);
  }
  if (randomMode && (unlockedMaps.lounge || unlockedMaps.garden)) {
    const prevCeil = Math.ceil(randomSwapTimer);
    randomSwapTimer -= dt;
    if (Math.ceil(randomSwapTimer) !== prevCeil) {
      updateMapSelectorUI();
    }
    if (randomSwapTimer <= 0) {
      randomSwapTimer = 30.0 + Math.random() * 30.0; // Next swap in 30 to 60 seconds!
      const unlockedPool = Object.keys(unlockedMaps).filter(
        (mId) => unlockedMaps[mId] && mId !== currentMap
      );
      if (unlockedPool.length > 0) {
        const nextMap = unlockedPool[Math.floor(Math.random() * unlockedPool.length)];
        swapMapMidGame(nextMap, true);
      }
    }
  }
  if (spacePhraseCooldown > 0) {
    spacePhraseCooldown = Math.max(0, spacePhraseCooldown - dt);
  }
  if (player.slowTimer > 0) {
    player.slowTimer = Math.max(0, player.slowTimer - dt);
  }
  if (player.speedBoostTimer > 0) {
    player.speedBoostTimer = Math.max(0, player.speedBoostTimer - dt);
  }
  if (guitarEasterEgg.cooldown > 0) {
    guitarEasterEgg.cooldown = Math.max(0, guitarEasterEgg.cooldown - dt);
    // Refreshed — remove the ring until the guitar is stepped on again.
    if (guitarEasterEgg.cooldown <= 0) {
      guitarEasterEgg.ringVisible = false;
    }
  }
  if (guitarEasterEgg.playingTimer > 0) {
    guitarEasterEgg.playingTimer = Math.max(0, guitarEasterEgg.playingTimer - dt);
  }
  if (sam.graceTimer > 0) {
    sam.graceTimer = Math.max(0, sam.graceTimer - dt);
  }
  handlePlayerMovement(dt, true);
  if (gameState !== 'PLAYING') return;

  // 2b. Wandering Roomba Hazard & Bottom-Right Base Station Recall
  if (roomba.active) {
    // Check if player touched the Roomba Base Station in the bottom-right corner to recall the Roomba!
    if (
      roomba.state === 'ROAMING' &&
      Math.hypot(player.x - roombaBase.x, player.y - roombaBase.y) < player.radius + roombaBase.radius + 8
    ) {
      roomba.state = 'RETURNING';
      roombaRecalls++;
      roombaRecallsThisGame++;
      if (roombaRecallsThisGame >= 5) unlockAchievement('unleash_roomba');
      playSound('dock_beep');
      spawnFloatingText('ROOMBA RECALLED! SLOWLY RETURNING TO BASE...', roombaBase.x - 130, roombaBase.y - 32, '#34d399');
    }

    if (roomba.state === 'ROAMING') {
      roomba.brushPhase += dt * 18;
      const nextRx = roomba.x + roomba.vx * dt;
      const nextRy = roomba.y + roomba.vy * dt;

      // Roomba roams the open floor (x: 175..670, y: 175..665) at speed 238 (slightly slower than player's 265)
      const canRoombaX =
        nextRx >= 175 &&
        nextRx <= 670 &&
        canMoveTo(nextRx, roomba.y);
      const canRoombaY =
        nextRy >= 175 &&
        nextRy <= 665 &&
        canMoveTo(roomba.x, nextRy);

      const hitX = !canRoombaX;
      const hitY = !canRoombaY;
      if (!hitX) roomba.x = nextRx;
      if (!hitY) roomba.y = nextRy;

      if (hitX || hitY) {
        let heading = Math.atan2(roomba.vy, roomba.vx);
        if (hitX && hitY) {
          heading += (Math.random() < 0.5 ? -1 : 1) * (Math.PI * 0.42 + Math.random() * 0.28);
        } else if (hitX) {
          heading = Math.PI - heading;
          heading += (Math.random() < 0.5 ? -1 : 1) * (0.18 + Math.random() * 0.3);
        } else {
          heading = -heading;
          heading += (Math.random() < 0.5 ? -1 : 1) * (0.18 + Math.random() * 0.3);
        }
        // Walls deflect the Roomba, but give it a slight tendency to turn
        // back toward the player instead of choosing a fully random route.
        const playerAngle = Math.atan2(player.y - roomba.y, player.x - roomba.x);
        const bias = 0.2;
        const headingX = Math.cos(heading) * (1 - bias) + Math.cos(playerAngle) * bias;
        const headingY = Math.sin(heading) * (1 - bias) + Math.sin(playerAngle) * bias;
        heading = Math.atan2(headingY, headingX);
        roomba.vx = Math.cos(heading) * roomba.speed;
        roomba.vy = Math.sin(heading) * roomba.speed;
      }

      // Normalize Roomba speed
      const rSpd = Math.hypot(roomba.vx, roomba.vy) || 1;
      roomba.vx = (roomba.vx / rSpd) * roomba.speed;
      roomba.vy = (roomba.vy / rSpd) * roomba.speed;

      // Check collision between Roomba and Player (nudges player!)
      const dx = player.x - roomba.x;
      const dy = player.y - roomba.y;
      const dist = Math.hypot(dx, dy);
      const minDist = player.radius + roomba.radius;
      if (dist < minDist && dist > 0.001) {
        roomba.playerContactTimer += dt;
        const overlap = minDist - dist + 2;
        const nx = dx / dist;
        const ny = dy / dist;
        const pushedX = player.x + nx * overlap;
        const pushedY = player.y + ny * overlap;
        if (canMoveTo(pushedX, player.y)) player.x = pushedX;
        if (canMoveTo(player.x, pushedY)) player.y = pushedY;

        // Keep the Roomba moving through the player so it remains a persistent obstacle.
        // Require a brief shove before its contact can trigger a Sam check.
        if (
          roomba.playerContactTimer >= 0.18 &&
          sam.state === 'AWAKE' &&
          sam.iceTimer <= 0 &&
          sam.knockoutTimer <= 0 &&
          sam.graceTimer <= 0 &&
          isPlayerInRedZone()
        ) {
          triggerSamKill(
            'YOU WOKE SAM UP.',
            "The wandering Roomba bumped into you and made you move while Sam's eyes were open!"
          );
          return;
        }
      } else {
        roomba.playerContactTimer = 0;
      }
    } else if (roomba.state === 'RETURNING') {
      // Slowly navigate down to the bottom corridor (y: 650) and then right into the Base Station!
      roomba.brushPhase += dt * 6;
      const waypoint =
        roomba.y < 636 && roomba.x < 685
          ? { x: 645, y: 650 }
          : { x: roombaBase.x - 6, y: roombaBase.y };
      const dx = waypoint.x - roomba.x;
      const dy = waypoint.y - roomba.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 8 && Math.hypot(roombaBase.x - roomba.x, roombaBase.y - roomba.y) < 16) {
        roomba.x = roombaBase.x - 6;
        roomba.y = roombaBase.y;
        roomba.vx = -1;
        roomba.vy = 0;
        roomba.state = 'DOCKED';
        roomba.dockTimer = 10.0;
        stopVacuumSound();
        spawnFloatingText('ROOMBA DOCKED! CHARGING FOR 10s...', roombaBase.x - 115, roombaBase.y - 32, '#38bdf8');
      } else if (dist > 0.001) {
        roomba.vx = (dx / dist) * roomba.returnSpeed;
        roomba.vy = (dy / dist) * roomba.returnSpeed;
        roomba.x += roomba.vx * dt;
        roomba.y += roomba.vy * dt;
      }
    } else if (roomba.state === 'DOCKED') {
      roomba.dockTimer -= dt;
      if (roomba.dockTimer <= 0) {
        // Slowly exit corridor back toward main room, or resume roaming from corridor entrance
        roomba.state = 'ROAMING';
        startVacuumSound();
        roomba.x = 655;
        roomba.y = 645;
        const ang = -Math.PI * 0.72;
        roomba.vx = Math.cos(ang) * roomba.speed;
        roomba.vy = Math.sin(ang) * roomba.speed;
        spawnFloatingText('ROOMBA FULLY CHARGED — BACK ON PATROL!', 655, 615, '#f59e0b');
      }
    }
  }

  // 2c. Pesky Bird (flies in through the top bay window indoors, or swoops down frequently in the Backyard!)
  if (windowBird.remindCooldown > 0) {
    windowBird.remindCooldown = Math.max(0, windowBird.remindCooldown - dt);
  }
  if (windowBird.state === 'OUTSIDE') {
    windowBird.spawnTimer -= dt;
    if (windowBird.spawnTimer <= 0) {
      windowBird.state = 'FLYING_IN';
      windowBird.canShoo = false;
      windowBird.x = currentMap === 'garden' ? 320 + Math.random() * 440 : 560;
      windowBird.y = 48;
      windowBird.wingPhase = 0;
      playSound('bird_flutter');
      spawnFloatingText(
        currentMap === 'garden'
          ? 'SWOOPING GARDEN BIRD INCOMING!'
          : 'A BIRD FLEW IN THROUGH THE WINDOW!',
        windowBird.x,
        104,
        '#38bdf8'
      );
    }
  } else if (windowBird.state === 'FLYING_IN') {
    windowBird.wingPhase += dt * 28;
    const targetX = player.x;
    const targetY = player.y - 24;
    const bdx = targetX - windowBird.x;
    const bdy = targetY - windowBird.y;
    const bdist = Math.hypot(bdx, bdy);
    const flySpeed = currentMap === 'garden' ? 500 : 430;
    if (bdist <= 24) {
      // When the bird lands on you, it perches and blocks your hands. If
      // you're carrying an item, it flings it away across the room first.
      windowBird.state = 'HARASSING';
      windowBird.orbitAngle = 0;
      birdDismissQueued = false;
      playSound('bird_flutter');
      if (player.holding) {
        const flung = player.holding;
        player.holding = null;
        const distantSpots = shuffle(carpetSpots).filter(
          (sp) => Math.hypot(sp.x - player.x, sp.y - player.y) >= 180
        );
        const targetSpot = distantSpots[0] || carpetSpots[0];
        flung.startX = player.x;
        flung.startY = player.y;
        flung.x = player.x;
        flung.y = player.y;
        flung.targetX = targetSpot.x + (Math.random() * 16 - 8);
        flung.targetY = targetSpot.y + (Math.random() * 16 - 8);
        flung.scatterProgress = 0;
        flung.scatterDelay = 0;
        flung.arcHeight = 115;
        flung.pickupCooldown = 0.6;
        items.push(flung);
        spawnFloatingText(
          'BIRD FLUNG YOUR ITEM AWAY! SHOO IT WHEN SAM LOOKS AWAY!',
          player.x,
          player.y - 44,
          '#ef4444'
        );
      } else {
        spawnFloatingText(
          'BIRD PERCHED ON YOU! HANDS BLOCKED — SHOO IT WHEN SAM LOOKS AWAY!',
          player.x,
          player.y - 44,
          '#f59e0b'
        );
      }
      windowBird.canShoo = true;
    } else {
      windowBird.x += (bdx / bdist) * flySpeed * dt;
      windowBird.y += (bdy / bdist) * flySpeed * dt;
    }
  } else if (windowBird.state === 'HARASSING') {
    windowBird.wingPhase += dt * 26;
    windowBird.orbitAngle += dt * 7.5;
    windowBird.x = player.x + Math.cos(windowBird.orbitAngle) * 18;
    windowBird.y = player.y - 26 + Math.sin(windowBird.orbitAngle * 2) * 6;
  } else if (windowBird.state === 'FLYING_OUT') {
    windowBird.wingPhase += dt * 32;
    const outX = 560;
    const outY = 42;
    const bdx = outX - windowBird.x;
    const bdy = outY - windowBird.y;
    const bdist = Math.hypot(bdx, bdy);
    if (bdist <= 18) {
      windowBird.state = 'OUTSIDE';
      windowBird.canShoo = false;
    } else {
      windowBird.x += (bdx / bdist) * 520 * dt;
      windowBird.y += (bdy / bdist) * 520 * dt;
    }
  }

  // Check if player walked into the top-left corner and touched the Guitar Easter Egg (Bedroom only)!
  if (
    currentMap === 'bedroom' &&
    Math.hypot(player.x - guitarEasterEgg.x, player.y - guitarEasterEgg.y) < player.radius + guitarEasterEgg.radius
  ) {
    if (guitarEasterEgg.cooldown <= 0) {
      triggerGuitarRiff();
    } else {
      // Stepping on it mid-cooldown reveals the progress ring.
      guitarEasterEgg.ringVisible = true;
    }
  }

  // Check if stepping in a purple goo slow hazard
  for (let i = slowHazards.length - 1; i >= 0; i--) {
    const haz = slowHazards[i];
    if (haz.scatterProgress < 1) continue;
    const dist = Math.hypot(player.x - haz.x, player.y - haz.y);
    if (dist < player.radius + haz.radius - 6) {
      slowHazards.splice(i, 1);
      player.slowTimer = 2.6;
      playSound('slow');
      spawnFloatingText('PURPLE GOO! SLOWED!', player.x, player.y - 30, '#c084fc');
    }
  }

  // 3. Ice Powerup & Knockout Stick Pickup
  for (let i = powerups.length - 1; i >= 0; i--) {
    const p = powerups[i];
    if (p.scatterProgress < 1) continue;
    const dist = Math.hypot(player.x - p.x, player.y - p.y);
    if (dist < player.radius + 20) {
      if (p.type === 'ice') {
        powerups.splice(i, 1);
        sam.iceTimer = 6.0;
        sam.state = 'SLEEPING';
        sam.pendingDoublePeek = false;
        sam.isDoublePeek = false;
        sam.timer = 2.0;
        playSound('ice');
        updateSamCamUI();
        spawnFloatingText('SAM ICED FOR 6 SECONDS!', player.x, player.y - 32, '#38bdf8');
      } else if (p.type === 'stick' && !player.hasStick) {
        powerups.splice(i, 1);
        player.hasStick = true;
        playSound('pickup');
        spawnFloatingText('STICK IN INVENTORY! Press E anytime to KO Sam!', player.x, player.y - 32, '#facc15');
      }
    }
  }

  // Update pickup cooldowns & stinky item countdown timers (on floor and in player's hands!)
  let stinkyExpiredItem = null;
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.pickupCooldown > 0) {
      it.pickupCooldown = Math.max(0, it.pickupCooldown - dt);
    }
    if (it.isStinky && it.scatterProgress >= 1) {
      it.stinkTimer -= dt;
      if (it.stinkTimer <= 0) {
        it.isStinky = false;
        it.stinkTimer = 0;
        stinkyExpiredItem = it;
      }
    }
  }
  if (player.holding && player.holding.isStinky) {
    player.holding.stinkTimer -= dt;
    if (player.holding.stinkTimer <= 0) {
      player.holding.isStinky = false;
      player.holding.stinkTimer = 0;
      stinkyExpiredItem = player.holding;
    }
  }
  if (stinkyExpiredItem) {
    spawnFloatingText('THE STINK CLOUD WOKE SAM UP!', stinkyExpiredItem.x || player.x, (stinkyExpiredItem.y || player.y) - 38, '#a3e635');
    triggerSamKill(
      'THE SMELL WOKE SAM UP!',
      'A stinky item expired before you sorted it — the awful smell woke Sam up!'
    );
    return;
  }

  tryPickupMessItems();

  // 5. Check if player reached the matching drop-off container while holding an item
  tryDepositHeldItem();

  // 6. Update Sam's Sleep / Ice / Knockout / Frozen-On-Spot / Returning-To-Bed / Exclamation Warning / Awake Cycle
  if (sam.returningToBed) {
    const bdx = samHead.x - sam.attackX;
    const bdy = samHead.y - sam.attackY;
    const bdist = Math.hypot(bdx, bdy);
    sam.lungeAngle = Math.atan2(bdy, bdx);
    if (bdist <= 12) {
      sam.attackX = samHead.x;
      sam.attackY = samHead.y;
      sam.returningToBed = false;
      sam.state = 'SLEEPING';
      sam.timer = 2.2;
      updateSamCamUI();
      spawnFloatingText('SAM IS BACK IN BED!', samHead.x - 45, samHead.y - 46, '#10b981');
    } else {
      sam.attackX += (bdx / bdist) * 340 * dt;
      sam.attackY += (bdy / bdist) * 340 * dt;
    }
    return;
  }

  const difficultyTier = Math.min(8, Math.floor(itemsSorted / 5));
  if (sam.knockoutTimer > 0) {
    sam.knockoutTimer = Math.max(0, sam.knockoutTimer - dt);
    updateSamCamUI();
  } else if (sam.iceTimer > 0) {
    sam.iceTimer = Math.max(0, sam.iceTimer - dt);
    if (sam.iceTimer <= 0 && sam.frozenOnSpot) {
      // Sam unfreezes on the spot and walks back to bed!
      sam.frozenOnSpot = false;
      sam.returningToBed = true;
      spawnFloatingText('SAM UNFREEZES — HEADING BACK TO BED!', sam.attackX, sam.attackY - 46, '#38bdf8');
    }
    updateSamCamUI();
  } else {
    sam.timer -= dt;

    if (sam.state === 'SLEEPING') {
      if (Math.random() < dt * 2.0) {
        sam.zzzParticles.push({
          x: samHead.x - 12,
          y: samHead.y - 28,
          vy: -24,
          vx: -10 + Math.random() * 20,
          alpha: 1,
          size: 15 + Math.random() * 8
        });
      }

      if (sam.timer <= 0) {
        sam.state = 'WARNING';
        // No fake-out chains while you're first playing: a second peek
        // immediately after the first is a higher-difficulty trick.
        // The first 10 items (tier 0-1) are always single peeks, so you
        // learn the one-peek rhythm first. Tier 2+ unlocks double peeks,
        // tier 4+ unlocks triple peeks, as before.
        const triplePeekChance =
          difficultyTier >= 4 ? Math.min(0.28, 0.04 + (difficultyTier - 4) * 0.06) : 0;
        const doublePeekChance = Math.min(0.68, 0.16 + difficultyTier * 0.07);
        const chainRoll = Math.random();
        const chainLength =
          difficultyTier < 2
            ? 1
            : chainRoll < triplePeekChance
            ? 3
            : chainRoll < triplePeekChance + doublePeekChance
            ? 2
            : 1;
        sam.peekChainRemaining = chainLength - 1;
        sam.isTriplePeek = chainLength === 3;
        sam.isDoublePeek = chainLength === 2;
        sam.warningDuration = chainLength > 1
          ? Math.max(0.34, 0.43 - difficultyTier * 0.01)
          : Math.max(0.58, 0.8 - difficultyTier * 0.035);
        sam.timer = sam.warningDuration;
        playSound('alert');
        updateSamCamUI();
      }
    } else if (sam.state === 'WARNING') {
      if (sam.timer <= 0) {
        sam.state = 'AWAKE';
        sam.awakeDuration = sam.peekChainRemaining > 0
          ? Math.max(0.78, 1.15 - difficultyTier * 0.035)
          : 1.45 + Math.random() * Math.max(0.45, 1.15 - difficultyTier * 0.08);
        sam.timer = sam.awakeDuration;
        playSound('awake');
        updateSamCamUI();

        if (player.isMoving && isPlayerInRedZone()) {
          triggerSamKill('YOU WOKE SAM UP.', "You didn't freeze in time when the '!' warning flashed!");
          return;
        }
      }
    } else if (sam.state === 'AWAKE') {
      if (sam.timer <= 0) {
        if (sam.peekChainRemaining > 0) {
          sam.peekChainRemaining--;
          sam.state = 'WARNING';
          sam.warningDuration = Math.max(0.34, 0.43 - difficultyTier * 0.01);
          sam.timer = sam.warningDuration;
          playSound('alert');
          updateSamCamUI();
        } else {
          sam.state = 'SLEEPING';
          sam.pendingDoublePeek = false;
          sam.isDoublePeek = false;
          sam.isTriplePeek = false;
          sam.timer = Math.max(1.15, 2.5 - difficultyTier * 0.16 + Math.random() * Math.max(0.8, 2.2 - difficultyTier * 0.18));
        }
        updateSamCamUI();
      }
    }
  }

  // Update Zzz particles
  for (let i = sam.zzzParticles.length - 1; i >= 0; i--) {
    const z = sam.zzzParticles[i];
    z.x += z.vx * dt;
    z.y += z.vy * dt;
    z.alpha -= dt * 0.65;
    if (z.alpha <= 0) sam.zzzParticles.splice(i, 1);
  }
}

const RED_CONE_START_ANGLE = Math.PI * 0.55;
const RED_CONE_END_ANGLE = Math.PI * 1.45;
const RED_CONE_RADIUS = 1080;

function isPlayerInRedZone(px = player.x, py = player.y) {
  const dx = px - samHead.x;
  const dy = py - samHead.y;
  const dist = Math.hypot(dx, dy);
  if (dist > RED_CONE_RADIUS) return false;
  let angle = Math.atan2(dy, dx);
  if (angle < 0) angle += Math.PI * 2;
  return angle >= RED_CONE_START_ANGLE && angle <= RED_CONE_END_ANGLE;
}

const touchJoystick = { active: false, pointerId: null, dx: 0, dy: 0 };
function handlePlayerMovement(dt, canTriggerSam) {
  let vx = 0;
  let vy = 0;
  if (keys['w'] || keys['arrowup']) vy -= 1;
  if (keys['s'] || keys['arrowdown']) vy += 1;
  if (keys['a'] || keys['arrowleft']) vx -= 1;
  if (keys['d'] || keys['arrowright']) vx += 1;
  if (touchJoystick.active && (touchJoystick.dx !== 0 || touchJoystick.dy !== 0)) { vx += touchJoystick.dx; vy += touchJoystick.dy; }

  player.isMoving = vx !== 0 || vy !== 0;

  if (player.isMoving) {
    const len = Math.hypot(vx, vy);
    vx /= len;
    vy /= len;
    player.facingAngle = Math.atan2(vy, vx);

    const gooMultiplier = player.slowTimer > 0 ? 0.48 : 1.0;
    const heavyMultiplier = player.holding && player.holding.isHeavy ? 0.82 : 1.0;
    const boostMultiplier = player.speedBoostTimer > 0 ? 1.32 : 1.0;
    const speedMultiplier = Math.max(0.45, gooMultiplier * heavyMultiplier * boostMultiplier);
    const currentSpeed = player.baseSpeed * speedMultiplier;
    player.stepPhase += dt * (player.slowTimer > 0 ? 7 : player.speedBoostTimer > 0 ? 18 : 13);

    const nextX = player.x + vx * currentSpeed * dt;
    const nextY = player.y + vy * currentSpeed * dt;

    if (canMoveTo(nextX, player.y)) player.x = nextX;
    if (canMoveTo(player.x, nextY)) player.y = nextY;

    if (
      canTriggerSam &&
      sam.state === 'AWAKE' &&
      sam.iceTimer <= 0 &&
      sam.knockoutTimer <= 0 &&
      sam.graceTimer <= 0 &&
      isPlayerInRedZone()
    ) {
      triggerSamKill('YOU WOKE SAM UP.', "You moved inside Sam's red look zone while his eyes were open!");
    }
  }
}

// Drawing the Active 2D Map (Bedroom, The Lounge, or The Backyard)
function beginCartoonMap() {
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.shadowBlur = 0;
  ctx.shadowColor = 'transparent';
}

function drawCartoonFloorTexture(colors, dotColor) {
  ctx.save();
  ctx.clip();
  const gradient = ctx.createLinearGradient(0, 80, 0, 700);
  gradient.addColorStop(0, colors[0]);
  gradient.addColorStop(1, colors[1]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = dotColor;
  for (let x = 42; x < 1100; x += 34) {
    for (let y = 92; y < 690; y += 34) {
      ctx.beginPath();
      ctx.arc(x + ((y / 34) % 2) * 10, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawBedroom() {
  beginCartoonMap();
  if (currentMap === 'lounge') {
    drawLoungeMap();
    return;
  }
  if (currentMap === 'garden') {
    drawGardenMap();
    return;
  }

  // Outer wall background
  const bedroomWall = ctx.createLinearGradient(0, 0, 0, canvas.height);
  bedroomWall.addColorStop(0, '#f4dfbd');
  bedroomWall.addColorStop(1, '#d7b889');
  ctx.fillStyle = bedroomWall;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Carpet floor polygon (with angled top bay window alcove and wider right wall for the flag)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(28, 138);
  ctx.lineTo(355, 138);
  ctx.lineTo(400, 75);
  ctx.lineTo(720, 75);
  ctx.lineTo(765, 138);
  ctx.lineTo(1104, 138);
  ctx.lineTo(1104, 692);
  ctx.lineTo(28, 692);
  ctx.closePath();
  drawCartoonFloorTexture(['#c7b2a1', '#9d8578'], 'rgba(62, 45, 37, 0.10)');

  // White baseboard outline
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#3f332d';
  ctx.stroke();
  ctx.restore();

  // --- TOP & LEFT WALL DETAILS ---
  // Left window light on the left wall
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(12, 148, 16, 42);
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(12, 148, 16, 42);

  // --- GUITAR EASTER EGG IN TOP-LEFT CORNER (Above the Oak Wardrobe) ---
  ctx.save();
  const gVib = guitarEasterEgg.playingTimer > 0 ? Math.sin(performance.now() * 0.06) * 2.5 : 0;
  ctx.translate(guitarEasterEgg.x + gVib, guitarEasterEgg.y);
  ctx.rotate(-0.45);
  // Guitar Stand shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 8, 18, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Guitar Neck & Headstock (pointing toward top-right)
  ctx.fillStyle = '#78350f';
  ctx.fillRect(-3, -32, 6, 24);
  ctx.fillStyle = '#451a03';
  ctx.fillRect(-4, -38, 8, 7);
  // Acoustic/Electric Sunburst Guitar Body (figure-8 bouts)
  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.arc(0, -6, 10, 0, Math.PI * 2);
  ctx.arc(0, 7, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Soundhole & Bridge
  ctx.fillStyle = '#1c1917';
  ctx.beginPath();
  ctx.arc(0, -3, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(-5, 9, 10, 2.5);
  // Strings
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-1.5, -34);
  ctx.lineTo(-1.5, 9);
  ctx.moveTo(1.5, -34);
  ctx.lineTo(1.5, 9);
  ctx.stroke();
  ctx.restore();

  // --- GUITAR 60s COOLDOWN RING ---
  // Hidden until you step on the guitar, so it never gives the spot away.
  // Once triggered it stays visible for the whole cooldown — step off and
  // it keeps showing progress — then it is removed when the cooldown
  // refreshes. Only the green progress arc is drawn — no track, no
  // background circle, the rest of the ring is fully transparent.
  // progress 0 = just riffed, 1 = ready to riff again. No numbers shown.
  // Not rotated with the guitar, so the ring stays a clean circle around it.
  if (guitarEasterEgg.ringVisible && guitarEasterEgg.cooldown > 0) {
    const guitarCooldownTotal = guitarEasterEgg.cooldownDuration || GUITAR_COOLDOWN_SECONDS;
    const guitarCooldownProgress = Math.min(1, Math.max(0, 1 - guitarEasterEgg.cooldown / guitarCooldownTotal));
    if (guitarCooldownProgress > 0) {
      ctx.save();
      ctx.translate(guitarEasterEgg.x, guitarEasterEgg.y);
      const guitarRingRadius = 44;
      const guitarRingStart = -Math.PI / 2;
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(0, 0, guitarRingRadius, guitarRingStart, guitarRingStart + guitarCooldownProgress * Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // Staggered Picture Frames at Different Heights on the Wall Left of the Bay Window
  // Each frame contains a low-fi abstract mini photo (landscape, portrait silhouette)
  ctx.save();
  // Frame 1 (Left, Higher up: Abstract Landscape with Sky, Sun & Green Hill)
  ctx.fillStyle = '#3f2e21';
  ctx.fillRect(216, 68, 32, 36);
  ctx.fillStyle = '#93c5fd'; // Sky
  ctx.fillRect(219, 71, 26, 30);
  ctx.fillStyle = '#fde047'; // Tiny sun blob
  ctx.beginPath();
  ctx.arc(227, 78, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4ade80'; // Low-fi green hill
  ctx.beginPath();
  ctx.moveTo(219, 101);
  ctx.quadraticCurveTo(232, 86, 245, 101);
  ctx.fill();

  // Frame 2 (Right of Frame 1, Lower down: Abstract Head & Shoulders Portrait)
  ctx.fillStyle = '#3f2e21';
  ctx.fillRect(262, 86, 32, 38);
  ctx.fillStyle = '#fde68a'; // Warm backdrop
  ctx.fillRect(265, 89, 26, 32);
  ctx.fillStyle = '#6366f1'; // Abstract shoulders blob
  ctx.beginPath();
  ctx.arc(278, 121, 10, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#fca5a5'; // Abstract head blob
  ctx.beginPath();
  ctx.arc(278, 103, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Bay Window Glass Panels (Top Alcove)
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 5;
  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(425, 58, 270, 16);
  ctx.strokeRect(425, 58, 270, 16);

  // Grey patterned curtains on left & right of bay window
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.arc(400, 86, 21, 0, Math.PI * 2);
  ctx.arc(715, 86, 21, 0, Math.PI * 2);
  ctx.fill();

  // --- BAY WINDOW WHITE DESK & SWIVEL CHAIR ---
  ctx.save();
  // 1. White Swivel Office Chair tucked in front of desk (with 5-star wheel base & curved backrest)
  const chairX = 568;
  const chairY = 166;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  for (let s = 0; s < 5; s++) {
    const a = (s * Math.PI * 2) / 5 + 0.2;
    const wx = chairX + Math.cos(a) * 24;
    const wy = chairY + Math.sin(a) * 24;
    ctx.beginPath();
    ctx.moveTo(chairX, chairY);
    ctx.lineTo(wx, wy);
    ctx.stroke();
    // Little black caster wheel
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(wx, wy, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Chair seat cushion
  ctx.fillStyle = '#f1f5f9';
  ctx.beginPath();
  ctx.roundRect(chairX - 20, chairY - 18, 40, 34, 12);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.stroke();
  // Curved Chair Backrest along the bottom edge
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(chairX - 22, chairY + 8, 44, 10, 5);
  ctx.fill();
  ctx.stroke();

  // 2. Desk Drop Shadow & Corner Legs
  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.beginPath();
  ctx.roundRect(482, 83, 200, 74, 6);
  ctx.fill();

  // White Desk Surface
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(480, 78, 200, 72, 6);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // Front beveled edge of the desk
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(482, 144, 196, 5);

  // 3. Items on the Desk: Open Laptop, Mousepad + Mouse, Notebook + Pen, Mug, and Desk Lamp
  // Lined Notebook & Pen on the left
  ctx.save();
  ctx.translate(508, 114);
  ctx.rotate(-0.12);
  ctx.fillStyle = '#fefce8';
  ctx.fillRect(-13, -16, 26, 32);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-13, -16, 26, 32);
  // Ruled lines on notebook
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  for (let ly = -10; ly <= 10; ly += 5) {
    ctx.beginPath();
    ctx.moveTo(-9, ly);
    ctx.lineTo(9, ly);
    ctx.stroke();
  }
  // Blue pen resting on notebook
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-6, -12);
  ctx.lineTo(10, 8);
  ctx.stroke();
  ctx.restore();

  // Open Laptop in the center of the desk
  // Angled screen hinge at top
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(542, 84, 52, 10, 2);
  ctx.fill();
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(546, 86, 44, 5);
  // Silver laptop body & dark keyboard matrix
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(540, 94, 56, 36, 4);
  ctx.fill();
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#334155';
  ctx.fillRect(545, 98, 46, 18);
  // Trackpad
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(561, 119, 14, 8);

  // Dark Mousepad & White Wireless Mouse to the right of laptop
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.roundRect(604, 98, 24, 28, 3);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.ellipse(616, 112, 5.5, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Black Architect Desk Lamp on the right corner of the desk
  // Warm light pool from desk lamp
  ctx.fillStyle = 'rgba(254, 240, 138, 0.35)';
  ctx.beginPath();
  ctx.arc(648, 106, 22, 0, Math.PI * 2);
  ctx.fill();
  // Lamp base, arm & head
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(662, 92, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(662, 92);
  ctx.lineTo(648, 104);
  ctx.stroke();
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(648, 104, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- DROP ZONE 1: FOOD BIN (Left of Desk by Curtain) ---
  drawDropZoneHighlight(dropZones.food);
  ctx.fillStyle = '#6b7280';
  ctx.fillRect(400, 96, 58, 62);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(398, 96, 62, 13);
  ctx.fillStyle = '#374151';
  ctx.fillRect(408, 107, 42, 43);
  drawZoneLabel('FOOD BIN', 429, 86, '#4ade80');

  // --- DROP ZONE 2: OAK WARDROBE + SUITCASE ON TOP (Left Wall) ---
  drawDropZoneHighlight(dropZones.sock);
  ctx.fillStyle = '#c88a4b';
  ctx.fillRect(28, 195, 108, 195);
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 195, 108, 195);
  ctx.beginPath();
  ctx.moveTo(136, 292);
  ctx.lineTo(36, 292);
  ctx.stroke();
  // Black suitcase on top of the wardrobe
  ctx.fillStyle = '#1e1b24';
  ctx.fillRect(38, 212, 72, 135);
  ctx.strokeStyle = '#3f3f46';
  ctx.lineWidth = 2;
  ctx.strokeRect(38, 212, 72, 135);
  drawZoneLabel('WARDROBE', 82, 182, '#fb923c');

  // --- DROP ZONE 3: WHITE CUBE STORAGE UNIT + DEDICATED CABLE BOX (No TV!) ---
  drawDropZoneHighlight(dropZones.cable);
  // White Kallax shelf frame
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(28, 425, 112, 245);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.strokeRect(28, 425, 112, 245);
  // Grey fabric storage cubes sticking out slightly
  ctx.fillStyle = '#64748b';
  ctx.fillRect(104, 442, 36, 62);
  ctx.fillRect(104, 516, 36, 62);
  ctx.fillRect(104, 590, 36, 62);

  // Replaced TV with a dedicated CABLE ORGANIZER BOX on top of the unit!
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(42, 465, 54, 110, 8);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // Colorful coiled cables peeking out of the Cable Box
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(68, 495, 12, 0, Math.PI * 1.6);
  ctx.stroke();
  ctx.strokeStyle = '#f43f5e';
  ctx.beginPath();
  ctx.arc(66, 525, 11, 0.5, Math.PI * 1.9);
  ctx.stroke();
  ctx.strokeStyle = '#a3e635';
  ctx.beginPath();
  ctx.arc(70, 550, 10, 0.2, Math.PI * 1.5);
  ctx.stroke();

  // White Candle Jar below the Cable Box
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.arc(70, 615, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  drawZoneLabel('CABLE BOX', 84, 412, '#38bdf8');

  // --- PICTURE FRAME ON RIGHT WALL (Replacing old square next to Desk) ---
  // Abstract Sunset & Mountain Peaks Painting moved from left wall
  ctx.save();
  ctx.fillStyle = '#3f2e21';
  ctx.fillRect(774, 82, 36, 42);
  ctx.fillStyle = '#fb923c'; // Sunset sky
  ctx.fillRect(778, 86, 28, 34);
  ctx.fillStyle = '#fde047'; // Setting sun
  ctx.beginPath();
  ctx.arc(798, 95, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#475569'; // Abstract mountain triangles
  ctx.beginPath();
  ctx.moveTo(778, 120);
  ctx.lineTo(788, 99);
  ctx.lineTo(797, 120);
  ctx.lineTo(801, 104);
  ctx.lineTo(806, 120);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // --- SAM'S DOUBLE BED (Right Side) ---
  ctx.save();
  ctx.fillStyle = '#9ca3af';
  ctx.beginPath();
  ctx.roundRect(705, 195, 393, 410, 20);
  ctx.fill();
  ctx.strokeStyle = '#4b5563';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Duvet geometric pattern area (head of bed & pillow zone)
  ctx.fillStyle = '#e5e7eb';
  ctx.beginPath();
  ctx.roundRect(935, 205, 155, 390, 14);
  ctx.fill();

  // Black pillows at the head of the bed (right side)
  ctx.fillStyle = '#18181b';
  ctx.beginPath();
  ctx.roundRect(956, 222, 112, 150, 16);
  ctx.roundRect(956, 400, 112, 150, 16);
  ctx.fill();

  // Black throw blanket covering the main left/lower part of the bed
  ctx.fillStyle = '#111318';
  ctx.beginPath();
  ctx.roundRect(705, 202, 260, 396, 18);
  ctx.fill();

  // Detailed Teddy Bear sitting on the lower pillow
  ctx.save();
  ctx.translate(948, 456);
  ctx.rotate(-0.12); // Slightly angled toward the room

  // Soft shadow under teddy
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(0, 22, 22, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // Outer round bear ears
  ctx.fillStyle = '#b07d4f';
  ctx.strokeStyle = '#7f5539';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(-14, -22, 8.5, 0, Math.PI * 2);
  ctx.arc(14, -22, 8.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Inner pink/cream ear pads
  ctx.fillStyle = '#f4a29e';
  ctx.beginPath();
  ctx.arc(-14, -22, 4.5, 0, Math.PI * 2);
  ctx.arc(14, -22, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Chubby seated torso
  ctx.fillStyle = '#c89666';
  ctx.beginPath();
  ctx.ellipse(0, 9, 17, 15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Soft cream belly patch
  ctx.fillStyle = '#faedcd';
  ctx.beginPath();
  ctx.ellipse(0, 10, 10.5, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Arms resting on sides
  ctx.fillStyle = '#b07d4f';
  ctx.beginPath();
  ctx.ellipse(-16, 5, 6, 10, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(16, 5, 6, 10, -0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Seated feet/paws sticking forward
  ctx.fillStyle = '#b07d4f';
  ctx.beginPath();
  ctx.ellipse(-11, 20, 8, 6.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(11, 20, 8, 6.5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Cute cream paw pads on feet
  ctx.fillStyle = '#faedcd';
  ctx.beginPath();
  ctx.arc(-11, 20.5, 3.8, 0, Math.PI * 2);
  ctx.arc(11, 20.5, 3.8, 0, Math.PI * 2);
  ctx.fill();

  // Red bow tie under chin
  ctx.fillStyle = '#e11d48';
  ctx.beginPath();
  ctx.moveTo(0, -1);
  ctx.lineTo(-7, -4.5);
  ctx.lineTo(-7, 2.5);
  ctx.closePath();
  ctx.moveTo(0, -1);
  ctx.lineTo(7, -4.5);
  ctx.lineTo(7, 2.5);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9f1239';
  ctx.beginPath();
  ctx.arc(0, -1, 2.2, 0, Math.PI * 2);
  ctx.fill();

  // Teddy bear head
  ctx.fillStyle = '#c89666';
  ctx.beginPath();
  ctx.arc(0, -11, 15.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Rosy cheeks
  ctx.fillStyle = 'rgba(244, 114, 182, 0.42)';
  ctx.beginPath();
  ctx.arc(-9.5, -8, 3.5, 0, Math.PI * 2);
  ctx.arc(9.5, -8, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Cream snout / muzzle
  ctx.fillStyle = '#faedcd';
  ctx.beginPath();
  ctx.ellipse(0, -7.5, 7.5, 5.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glossy dark button eyes + white catchlights
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(-6, -13.5, 2.6, 0, Math.PI * 2);
  ctx.arc(6, -13.5, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-6.8, -14.3, 0.9, 0, Math.PI * 2);
  ctx.arc(5.2, -14.3, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Soft brown nose & stitched smile
  ctx.fillStyle = '#432818';
  ctx.beginPath();
  ctx.ellipse(0, -9.2, 3.2, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#432818';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(0, -4.8);
  ctx.moveTo(-3.2, -5.2);
  ctx.quadraticCurveTo(0, -3.2, 3.2, -5.2);
  ctx.stroke();

  ctx.restore();
  ctx.restore();

  // --- CALIFORNIA FLAG (WITH BEAR, STAR & SQUIGGLY TEXT) ON THE RIGHT WALL ---
  // Centered vertically with the bed (y: 225..575, center y: 400) on the right wall (x: 1108..1154)
  ctx.save();
  ctx.translate(1131, 400);
  ctx.rotate(Math.PI / 2); // Top of flag at outer right wall, bottom red stripe along the bedhead

  const fw = 350;
  const fh = 44;

  // Drop shadow on wall
  ctx.fillStyle = 'rgba(0, 0, 0, 0.24)';
  ctx.beginPath();
  ctx.roundRect(-fw / 2 + 2, -fh / 2 + 2, fw, fh, 4);
  ctx.fill();

  // White flag background
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(-fw / 2, -fh / 2, fw, fh, 4);
  ctx.clip();

  ctx.fillStyle = '#fafaf9';
  ctx.fillRect(-fw / 2, -fh / 2, fw, fh);

  // Bottom Red Stripe of the California Flag
  ctx.fillStyle = '#b91c1c';
  ctx.fillRect(-fw / 2, fh / 2 - 8, fw, 8);

  // Red 5-Pointed Lone Star in the upper-left corner
  ctx.save();
  ctx.translate(-128, -9);
  ctx.fillStyle = '#b91c1c';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
    const ox = Math.cos(outerAngle) * 7.5;
    const oy = Math.sin(outerAngle) * 7.5;
    if (i === 0) ctx.moveTo(ox, oy);
    else ctx.lineTo(ox, oy);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Green Grass Patch in the center
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.ellipse(0, 3, 44, 3.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // California Grizzly Bear walking left on the grass patch
  ctx.fillStyle = '#78350f';
  // Bear legs
  ctx.fillRect(-20, -4, 5, 7);
  ctx.fillRect(-10, -4, 5, 7);
  ctx.fillRect(6, -4, 5, 7);
  ctx.fillRect(16, -4, 5, 7);
  // Bear torso & shoulder hump
  ctx.beginPath();
  ctx.ellipse(2, -8, 22, 7.5, -0.05, 0, Math.PI * 2);
  ctx.arc(-8, -11, 7.5, 0, Math.PI * 2); // Grizzly shoulder hump
  ctx.fill();
  // Bear head, snout & ear facing left
  ctx.beginPath();
  ctx.arc(-21, -9, 5.5, 0, Math.PI * 2);
  ctx.ellipse(-26, -8, 4.5, 3, 0, 0, Math.PI * 2); // Snout
  ctx.arc(-18, -14, 2.5, 0, Math.PI * 2); // Ear
  ctx.arc(24, -8, 2.5, 0, Math.PI * 2); // Short tail
  ctx.fill();

  // Squiggly lines where "CALIFORNIA REPUBLIC" text goes (between grass and red stripe)
  ctx.strokeStyle = '#292524';
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  // First word squiggle ("CALIFORNIA")
  ctx.beginPath();
  ctx.moveTo(-58, 10);
  for (let sx = -54; sx <= -6; sx += 6) {
    ctx.quadraticCurveTo(sx - 3, 7.5, sx, 10);
    ctx.quadraticCurveTo(sx + 3, 12.5, sx + 6, 10);
  }
  ctx.stroke();
  // Second word squiggle ("REPUBLIC")
  ctx.beginPath();
  ctx.moveTo(10, 10);
  for (let sx = 14; sx <= 52; sx += 6) {
    ctx.quadraticCurveTo(sx - 3, 7.5, sx, 10);
    ctx.quadraticCurveTo(sx + 3, 12.5, sx + 6, 10);
  }
  ctx.stroke();

  ctx.restore(); // unclip

  // Crisp flag border
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(-fw / 2, -fh / 2, fw, fh, 4);
  ctx.stroke();

  // 4 Gold wall thumbtacks at the corners
  ctx.fillStyle = '#f59e0b';
  [
    [-fw / 2 + 5, -fh / 2 + 5],
    [fw / 2 - 5, -fh / 2 + 5],
    [-fw / 2 + 5, fh / 2 - 5],
    [fw / 2 - 5, fh / 2 - 5]
  ].forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // Warm ceiling light fixture glow
  const grad = ctx.createRadialGradient(820, 240, 12, 820, 240, 280);
  grad.addColorStop(0, 'rgba(254, 240, 138, 0.22)');
  grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(820, 240, 280, 0, Math.PI * 2);
  ctx.fill();

  // --- BOTTOM-LEFT BEDROOM DOOR (Opens after Level 5 for the Roomba's dramatic entrance!) ---
  ctx.save();
  const doorX = 165;
  const doorY = 692;
  const doorW = 80;
  // Dark hallway threshold visible when the door swings open
  if (roomba.doorOpenProgress > 0.01) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(doorX, doorY - 4, doorW, 28);
    // Dramatic red/amber hallway floor glow spilling in
    const doorGlow = ctx.createRadialGradient(doorX + doorW / 2, doorY + 10, 4, doorX + doorW / 2, doorY - 20, 110);
    doorGlow.addColorStop(0, `rgba(239, 68, 68, ${0.42 * roomba.doorOpenProgress})`);
    doorGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = doorGlow;
    ctx.beginPath();
    ctx.arc(doorX + doorW / 2, doorY, 110, Math.PI, Math.PI * 2);
    ctx.fill();
  }

  // Door frame posts on the bottom wall
  ctx.fillStyle = '#5c4033';
  ctx.fillRect(doorX - 6, doorY - 4, 6, 16);
  ctx.fillRect(doorX + doorW, doorY - 4, 6, 16);

  // Wooden door leaf swinging open from left hinge (doorX, doorY)
  ctx.translate(doorX, doorY);
  ctx.rotate(-roomba.doorOpenProgress * Math.PI * 0.46);
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#451a03';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(0, -4, doorW, 10, 2);
  ctx.fill();
  ctx.stroke();
  // Brass doorknob
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(doorW - 12, -6, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // --- ROOMBA BASE STATION (Bottom-Right Corner under the Bed) ---
  // Touching this base station recalls the Roomba slowly back to its dock!
  ctx.save();
  ctx.translate(roombaBase.x, roombaBase.y);

  // Pulsing activation ring when Roomba is actively roaming
  if (roomba.active && roomba.state === 'ROAMING') {
    const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.008);
    ctx.beginPath();
    ctx.arc(0, 0, roombaBase.radius + 4 + pulse * 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(52, 211, 153, 0.22)';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = '#34d399';
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // Rubberized dock mat
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = roomba.active && roomba.state === 'ROAMING' ? '#34d399' : '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-24, -24, 58, 48, 10);
  ctx.fill();
  ctx.stroke();

  // Metallic charging contact pads
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(6, -12, 8, 8);
  ctx.fillRect(6, 4, 8, 8);

  // Raised dock tower against the right wall
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(18, -20, 14, 40, 4);
  ctx.fill();
  ctx.stroke();

  // Status LED on dock tower
  ctx.fillStyle =
    !roomba.active
      ? '#475569'
      : roomba.state === 'ROAMING'
      ? '#22c55e'
      : roomba.state === 'RETURNING'
      ? '#f59e0b'
      : '#38bdf8';
  ctx.beginPath();
  ctx.arc(25, 0, 3.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '800 9px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = roomba.active && roomba.state === 'ROAMING' ? '#6ee7b7' : '#94a3b8';
  ctx.fillText(
    currentMap === 'lounge' && !loungeRoombaReleased
      ? 'STANDBY'
      : roomba.state === 'DOCKED'
      ? `DOCKED (${Math.ceil(roomba.dockTimer)}s)`
      : roomba.state === 'RETURNING'
      ? 'RETURNING...'
      : 'ROOMBA BASE',
    -2,
    -30
  );
  ctx.restore();
}

// ============================================================================
// MAP 2: THE LOUNGE (Hardwood floor, sofas around outside, white coffee table in center)
// ============================================================================
function drawLoungeMap() {
  beginCartoonMap();
  // Warm cream/yellow lounge walls
  const loungeWall = ctx.createLinearGradient(0, 0, 0, canvas.height);
  loungeWall.addColorStop(0, '#f8e8c8');
  loungeWall.addColorStop(1, '#d6b98b');
  ctx.fillStyle = loungeWall;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Warm honey-oak hardwood floor polygon
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(28, 138);
  ctx.lineTo(355, 138);
  ctx.lineTo(400, 75);
  ctx.lineTo(720, 75);
  ctx.lineTo(765, 138);
  ctx.lineTo(1104, 138);
  ctx.lineTo(1104, 692);
  ctx.lineTo(28, 692);
  ctx.closePath();
  drawCartoonFloorTexture(['#d8954f', '#a85e2d'], 'rgba(77, 42, 18, 0.11)');

  // Hardwood floor plank lines
  ctx.save();
  ctx.clip();
  ctx.strokeStyle = 'rgba(105, 55, 18, 0.24)';
  ctx.lineWidth = 1.5;
  for (let y = 90; y < 692; y += 26) {
    ctx.beginPath();
    ctx.moveTo(28, y);
    ctx.lineTo(1104, y);
    ctx.stroke();
    for (let x = 60 + ((y * 3) % 90); x < 1100; x += 135) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 26);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Crisp white baseboard
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#3f332d';
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();

  // Top Bay Window with sunlit green trees outside
  ctx.fillStyle = '#bbf7d0';
  ctx.fillRect(190, 56, 260, 20);
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 4;
  ctx.strokeRect(190, 56, 260, 20);

  // --- SOFA 1: TOP-LEFT BAY WINDOW SOFA (Navy/Grey with Light-Blue & White Pillows) ---
  ctx.save();
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(185, 88, 265, 78, 12);
  ctx.fill();
  ctx.stroke();
  // Grey throw blanket draped across sofa
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.roundRect(210, 102, 215, 58, 8);
  ctx.fill();
  // Light-blue & white throw pillows on ends
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(202, 106, 36, 34, 6);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(392, 104, 38, 36, 6);
  ctx.fill();
  ctx.restore();

  // --- SOFA 2: LEFT WALL DARK PLUSH SOFA ---
  ctx.save();
  ctx.fillStyle = '#1e1b24';
  ctx.strokeStyle = '#09090b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(28, 205, 100, 245, 14);
  ctx.fill();
  ctx.stroke();
  // Sage green & cream cushions on left sofa
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.roundRect(40, 222, 46, 58, 8);
  ctx.fill();
  ctx.fillStyle = '#86efac';
  ctx.beginPath();
  ctx.roundRect(44, 290, 42, 52, 8);
  ctx.fill();
  ctx.restore();

  // --- DROP ZONE 1 (FOOD): LOUNGE SNACK BIN (Top-Left) ---
  drawDropZoneHighlight(dropZones.food);
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.roundRect(68, 104, 66, 66, 8);
  ctx.fill();
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(66, 104, 70, 14);
  drawZoneLabel('LOUNGE BIN', 101, 94, '#4ade80');

  // --- DROP ZONE 2 (SOCK): LAUNDRY BASKET (Bottom-Left below Sofa) ---
  drawDropZoneHighlight(dropZones.sock);
  ctx.fillStyle = '#d97706';
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(28, 485, 100, 165, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#fef3c7';
  ctx.beginPath();
  ctx.roundRect(40, 502, 76, 130, 6);
  ctx.fill();
  drawZoneLabel('LAUNDRY BASKET', 82, 474, '#fb923c');

  // --- DROP ZONE 3 (CABLE): WHITE KALLAX TV SHELF + FLATSCREEN TV + FLOOR LAMP ---
  drawDropZoneHighlight(dropZones.cable);
  // Tall floor lamp to the left of the Kallax shelf
  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(492, 118, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 2;
  ctx.stroke();
  // White Kallax 4x2 shelf unit
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.fillRect(510, 94, 255, 80);
  ctx.strokeRect(510, 94, 255, 80);
  // Big Black Flatscreen TV mounted on the wall above Kallax shelf
  ctx.fillStyle = '#09090b';
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.roundRect(538, 62, 198, 26, 3);
  ctx.fill();
  ctx.stroke();
  // Little red soda can & black speaker on the Kallax unit (matching the photo!)
  ctx.fillStyle = '#dc2626';
  ctx.fillRect(695, 134, 12, 18);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(738, 102, 18, 28);
  drawZoneLabel('TV MEDIA UNIT', 638, 54, '#38bdf8');

  // --- BIG CENTRAL WHITE COFFEE TABLE (In the middle of the lounge — cannot cross!) ---
  ctx.save();
  // Floor drop shadow under coffee table
  ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.beginPath();
  ctx.roundRect(353, 300, 310, 205, 8);
  ctx.fill();
  // Lower shelf shadow peek
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(365, 312, 274, 170);
  // Crisp White IKEA Coffee Table Top (310x205)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.roundRect(345, 290, 310, 205, 6);
  ctx.fill();
  ctx.stroke();
  // Subtle inner bevel on table top
  ctx.strokeStyle = '#f1f5f9';
  ctx.lineWidth = 2;
  ctx.strokeRect(358, 303, 284, 179);
  // Corner table leg posts
  ctx.fillStyle = '#e2e8f0';
  [
    [350, 295],
    [635, 295],
    [350, 475],
    [635, 475]
  ].forEach(([lx, ly]) => {
    ctx.fillRect(lx, ly, 15, 15);
  });
  // Black TV Remote resting on the middle of the coffee table (just like the photo!)
  ctx.save();
  ctx.translate(480, 376);
  ctx.rotate(-0.22);
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.roundRect(-24, -7, 48, 14, 4);
  ctx.fill();
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.arc(16, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.font = '700 13px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#64748b';
  ctx.fillText('COFFEE TABLE', 500, 424);
  ctx.restore();

  // --- SOFA 3: RIGHT-SIDE GREY SOFA (Extended all the way to the top-right edge!) ---
  ctx.save();
  ctx.fillStyle = '#3f3f46';
  ctx.strokeStyle = '#18181b';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(830, 140, 266, 460, 18);
  ctx.fill();
  ctx.stroke();
  // Light grey throw sheet over the full-length sofa cushions
  ctx.fillStyle = '#d4d4d8';
  ctx.beginPath();
  ctx.roundRect(844, 154, 230, 432, 14);
  ctx.fill();
  // Bright Cyan / Light-Blue Cushions arranged along the full sofa
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(946, 166, 110, 95, 14);
  ctx.roundRect(946, 272, 110, 120, 14);
  ctx.roundRect(946, 444, 110, 120, 14);
  ctx.fill();
  ctx.restore();

  // Warm overhead pendant light glow in the center of the lounge ceiling
  const grad = ctx.createRadialGradient(520, 290, 10, 520, 290, 320);
  grad.addColorStop(0, 'rgba(254, 240, 138, 0.28)');
  grad.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(520, 290, 320, 0, Math.PI * 2);
  ctx.fill();

  // Roomba Door & Base Station in the Lounge
  ctx.save();
  ctx.translate(roombaBase.x, roombaBase.y);
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = roomba.active && roomba.state === 'ROAMING' ? '#34d399' : '#475569';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-24, -24, 58, 48, 10);
  ctx.fill();
  ctx.stroke();
  ctx.font = '700 9px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#cbd5e1';
  ctx.fillText('ROOMBA BASE', -2, -30);
  ctx.restore();
}

// ============================================================================
// MAP 3: THE BACKYARD (Outdoor garden from Photo 2 — Food Bin, Green Bin, Clothing Line, More Birds!)
// ============================================================================
function drawGardenMap() {
  beginCartoonMap();
  // Bright blue sky & brick house backdrop along the top
  const skyGradient = ctx.createLinearGradient(0, 0, 0, 145);
  skyGradient.addColorStop(0, '#7dd3fc');
  skyGradient.addColorStop(1, '#38bdf8');
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, canvas.width, 145);

  // Fluffy white sky clouds
  ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
  [
    [140, 42, 34],
    [172, 38, 26],
    [880, 45, 32],
    [912, 42, 24]
  ].forEach(([cx, cy, cr]) => {
    ctx.beginPath();
    ctx.arc(cx, cy, cr, 0, Math.PI * 2);
    ctx.fill();
  });

  // Lush Green Tree Canopy rising behind the back fence (center-top, matching the photo!)
  ctx.fillStyle = '#15803d';
  [
    [520, 62, 54],
    [575, 48, 62],
    [635, 58, 52],
    [475, 76, 44],
    [680, 74, 42]
  ].forEach(([tx, ty, tr]) => {
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#22c55e';
  [
    [535, 56, 38],
    [590, 46, 42],
    [640, 62, 34]
  ].forEach(([tx, ty, tr]) => {
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.fill();
  });

  // Main Backyard Ground (Concrete Patio + Stepping Stones + Central Brick-Bordered Gravel Bed)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(28, 138);
  ctx.lineTo(1104, 138);
  ctx.lineTo(1104, 692);
  ctx.lineTo(28, 692);
  ctx.closePath();
  drawCartoonFloorTexture(['#928b83', '#5f5a55'], 'rgba(28, 25, 23, 0.12)');

  // Left Stepping-Stone Slab Path (from the photo!)
  ctx.fillStyle = '#a8a29e';
  ctx.strokeStyle = '#57534e';
  ctx.lineWidth = 2;
  for (let sy = 215; sy <= 625; sy += 68) {
    ctx.beginPath();
    ctx.roundRect(195, sy, 86, 54, 4);
    ctx.fill();
    ctx.stroke();
  }

  // Central Gravel Bed bordered by Red Bricks (from the photo — walkable open yard!)
  ctx.fillStyle = '#a8a29e';
  ctx.beginPath();
  ctx.roundRect(310, 225, 465, 395, 12);
  ctx.fill();
  // Red-brick raised border around the central gravel bed
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 2;
  ctx.strokeRect(305, 220, 475, 405);

  // Subtle gravel pebble texture inside the central bed
  ctx.fillStyle = 'rgba(68, 64, 60, 0.22)';
  for (let gx = 328; gx < 760; gx += 28) {
    for (let gy = 242; gy < 605; gy += 28) {
      ctx.fillRect(gx, gy, 4, 4);
      ctx.fillRect(gx + 12, gy + 10, 3, 3);
    }
  }

  // Wooden Slat Fences along Top, Left, and Right Edges
  ctx.strokeStyle = '#3f332d';
  ctx.lineWidth = 10;
  ctx.strokeRect(28, 138, 1076, 554);
  ctx.restore();

  // Back Brick Wall, Orange Traffic Cone & Green Garden Chair (top-left of yard, matching the photo!)
  ctx.fillStyle = '#9a3412';
  ctx.fillRect(42, 86, 145, 52);
  // Orange traffic cone by the back gate
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(156, 102);
  ctx.lineTo(168, 134);
  ctx.lineTo(144, 134);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(149, 115, 14, 5);
  // Green garden chair frame next to cone
  ctx.strokeStyle = '#22c55e';
  ctx.lineWidth = 3;
  ctx.strokeRect(108, 104, 28, 30);

  // Overgrown Green Bush against the back fence (x: 385, y: 96, w: 110, h: 66)
  ctx.fillStyle = '#15803d';
  [
    [408, 132, 26],
    [438, 124, 30],
    [470, 132, 25]
  ].forEach(([bx, by, br]) => {
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.arc(438, 126, 16, 0, Math.PI * 2);
  ctx.fill();

  // --- DROP ZONE 1 (FOOD): OUTDOOR FOOD BIN (top-right) ---
  drawDropZoneHighlight(dropZones.food);
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.roundRect(1000, 96, 66, 64, 8);
  ctx.fill();
  ctx.fillStyle = '#eab308';
  ctx.fillRect(998, 96, 70, 14);
  drawZoneLabel('FOOD BIN', 1033, 86, '#fde047');

  // --- DROP ZONE 2 (CABLE / WEEDS): GREEN GARDEN WHEELIE BIN (Top-Left) ---
  drawDropZoneHighlight(dropZones.cable);
  ctx.fillStyle = '#15803d';
  ctx.strokeStyle = '#052e16';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(205, 96, 66, 64, 8);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.roundRect(211, 110, 54, 44, 6);
  ctx.fill();
  // Leaf icon on Green Bin
  ctx.fillStyle = '#dcfce7';
  ctx.beginPath();
  ctx.ellipse(238, 132, 12, 8, -0.4, 0, Math.PI * 2);
  ctx.fill();
  drawZoneLabel('GREEN BIN', 238, 86, '#4ade80');

  // --- DROP ZONE 3 (SOCK / CLOTHING): OUTDOOR CLOTHING LINE (Bottom-Left Fence) ---
  drawDropZoneHighlight(dropZones.sock);
  // Two wooden clothesline posts + taut washing line
  ctx.fillStyle = '#78350f';
  ctx.fillRect(46, 434, 14, 14);
  ctx.fillRect(46, 638, 14, 14);
  ctx.strokeStyle = '#e0f2fe';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(53, 441);
  ctx.lineTo(118, 542);
  ctx.lineTo(53, 645);
  ctx.stroke();
  // Hanging shirts/towels flapping gently in the breeze
  const breeze = Math.sin(performance.now() * 0.005) * 4;
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.roundRect(68, 472 + breeze, 36, 48, 5);
  ctx.fill();
  ctx.fillStyle = '#f472b6';
  ctx.beginPath();
  ctx.roundRect(74, 545 - breeze, 36, 48, 5);
  ctx.fill();
  drawZoneLabel('CLOTHING LINE', 92, 418, '#38bdf8');

  // --- SAM'S GARDEN PATIO SUN LOUNGER (Right Patio) ---
  ctx.save();
  ctx.fillStyle = '#d6d3d1';
  ctx.strokeStyle = '#57534e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(830, 230, 258, 365, 18);
  ctx.fill();
  ctx.stroke();
  // Striped summer patio mattress & pillow
  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.roundRect(844, 245, 228, 335, 14);
  ctx.fill();
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.roundRect(946, 252, 110, 120, 14);
  ctx.fill();
  ctx.restore();

  // --- AMBIENT CRAWLING BACKYARD ANTS (Purely cosmetic style on Garden map!) ---
  const antTime = performance.now() * 0.001;
  const antTrails = [
    { cx: 235, cy: 310, rx: 45, ry: 85, speed: 0.2, count: 1 },
    { cx: 470, cy: 505, rx: 140, ry: 22, speed: 0.16, count: 1 },
    { cx: 745, cy: 480, rx: 45, ry: 75, speed: 0.19, count: 1 }
  ];
  ctx.save();
  antTrails.forEach((trail, tIdx) => {
    for (let a = 0; a < trail.count; a++) {
      const phase = antTime * trail.speed + (a * Math.PI * 2) / trail.count + tIdx;
      const ax = trail.cx + Math.cos(phase) * trail.rx;
      const ay = trail.cy + Math.sin(phase * 1.3) * trail.ry;
      const vx = -Math.sin(phase) * trail.rx * trail.speed;
      const vy = Math.cos(phase * 1.3) * 1.3 * trail.ry * trail.speed;
      const ang = Math.atan2(vy, vx);
      const legWiggle = Math.sin(antTime * 22 + a * 2.1) * 1.4;

      ctx.save();
      ctx.translate(ax, ay);
      ctx.rotate(ang);

      // 6 tiny wiggling ant legs
      ctx.strokeStyle = 'rgba(28, 25, 23, 0.85)';
      ctx.lineWidth = 1;
      [-2.5, 0, 2.5].forEach((lx, lIdx) => {
        const lw = lIdx % 2 === 0 ? legWiggle : -legWiggle;
        ctx.beginPath();
        ctx.moveTo(lx, -3.5);
        ctx.lineTo(lx + lw, 3.5);
        ctx.stroke();
      });

      // 3 tiny ant body segments (abdomen, thorax, head)
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.ellipse(-3.2, 0, 2.3, 1.6, 0, 0, Math.PI * 2);
      ctx.ellipse(0, 0, 1.5, 1.1, 0, 0, Math.PI * 2);
      ctx.ellipse(2.6, 0, 1.6, 1.3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
  ctx.restore();

  // Ambient Perched & Circling Backyard Birds along the fence (visual indicator that the Backyard is full of birds!)
  const bt = performance.now() * 0.006;
  [
    [335, 134],
    [620, 134],
    [765, 134],
    [925, 134]
  ].forEach(([bx, by], idx) => {
    const hop = Math.abs(Math.sin(bt + idx * 1.7)) * 5;
    ctx.save();
    ctx.translate(bx, by - hop);
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(7, -2, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawDropZoneHighlight(zone) {
  const isTarget = player.holding && player.holding.type === zone.itemType;
  const pulse = 0.5 + 0.5 * Math.sin(performance.now() * 0.008);

  ctx.save();
  ctx.beginPath();
  ctx.arc(zone.dropX, zone.dropY, isTarget ? 38 + pulse * 7 : 30, 0, Math.PI * 2);
  ctx.fillStyle = isTarget ? 'rgba(52, 211, 153, 0.34)' : 'rgba(255, 255, 255, 0.12)';
  ctx.fill();
  ctx.lineWidth = isTarget ? 3.5 : 1.5;
  ctx.setLineDash([6, 4]);
  ctx.strokeStyle = isTarget ? '#10b981' : 'rgba(255, 255, 255, 0.45)';
  ctx.stroke();
  ctx.restore();
}

function drawZoneLabel(text, x, y, color) {
  ctx.save();
  ctx.font = '800 12px Outfit, sans-serif';
  ctx.textAlign = 'center';
  const width = ctx.measureText(text).width + 16;
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - 14, width, 20, 6);
  ctx.fill();
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Render exact miniature snapshots of the actual 2D levels (Bedroom, Lounge, Backyard) onto all map thumbnails
function renderMapThumbnails() {
  const savedCtx = ctx;
  const savedMap = currentMap;
  const savedDropZones = dropZones;
  const savedHolding = player.holding;

  const mapSnapshots = {};
  ['bedroom', 'lounge', 'garden'].forEach((mType) => {
    const snap = document.createElement('canvas');
    snap.width = canvas.width;
    snap.height = canvas.height;
    const sCtx = snap.getContext('2d');

    ctx = sCtx;
    currentMap = mType;
    dropZones = MAP_CONFIGS[mType].dropZones;
    player.holding = null;

    drawBedroom();
    const sPos = MAP_CONFIGS[mType].samHeadPos;
    drawGenericSamFace(sCtx, sPos.x, sPos.y, sPos.radius, 'SLEEPING');
    mapSnapshots[mType] = snap;
  });

  ctx = savedCtx;
  currentMap = savedMap;
  dropZones = savedDropZones;
  player.holding = savedHolding;

  document.querySelectorAll('.map-thumb-canvas').forEach((c) => {
    const mapType = c.getAttribute('data-thumb');
    const snap = mapSnapshots[mapType];
    if (!snap) return;
    const tCtx = c.getContext('2d');
    tCtx.clearRect(0, 0, c.width, c.height);
    tCtx.imageSmoothingEnabled = true;
    tCtx.imageSmoothingQuality = 'high';
    tCtx.drawImage(snap, 0, 0, c.width, c.height);
  });
}

// Custom crisp 2D vector artwork for each item type so every item is immediately recognizable
function drawCustomItemGraphic(type, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (type === 'sock' && currentMap === 'garden') {
    // Backyard Map: Crisp 2D T-Shirt / Clothing Item for the Clothing Line
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0c4a6e';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-6, -11);
    ctx.lineTo(-14, -5);
    ctx.lineTo(-10, 0);
    ctx.lineTo(-7, -3);
    ctx.lineTo(-7, 11);
    ctx.lineTo(7, 11);
    ctx.lineTo(7, -3);
    ctx.lineTo(10, 0);
    ctx.lineTo(14, -5);
    ctx.lineTo(6, -11);
    ctx.quadraticCurveTo(0, -7, -6, -11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Shirt stripe
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-6, 1, 12, 3);
  } else if (type === 'sock') {
    // Crisp 2D Striped Tube Sock
    ctx.rotate(-0.15);
    ctx.beginPath();
    // Leg tube + foot bend
    ctx.moveTo(-6, -13);
    ctx.lineTo(5, -13);
    ctx.lineTo(5, 3);
    ctx.quadraticCurveTo(5, 11, -2, 11);
    ctx.lineTo(-10, 11);
    ctx.arc(-10, 6, 5, Math.PI * 0.5, Math.PI * 1.5);
    ctx.lineTo(-6, 1);
    ctx.closePath();
    ctx.fillStyle = '#fff7ed';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#431407';
    ctx.stroke();

    // Orange sporty cuff stripes
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-5, -10, 9, 3);
    ctx.fillRect(-5, -5, 9, 2.5);

    // Orange toe & heel patches
    ctx.beginPath();
    ctx.arc(-10, 6, 4, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();
  } else if (type === 'food') {
    // Crisp 2D Pepperoni Pizza Slice
    ctx.rotate(0.12);
    // Golden Crust
    ctx.beginPath();
    ctx.moveTo(-11, -10);
    ctx.quadraticCurveTo(0, -15, 11, -10);
    ctx.lineTo(0, 13);
    ctx.closePath();
    ctx.fillStyle = '#d97706';
    ctx.fill();
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = '#451a03';
    ctx.stroke();

    // Melted Yellow Cheese triangle
    ctx.beginPath();
    ctx.moveTo(-9, -6);
    ctx.quadraticCurveTo(0, -9, 9, -6);
    ctx.lineTo(0, 12);
    ctx.closePath();
    ctx.fillStyle = '#fde047';
    ctx.fill();

    // Red Pepperoni circles
    ctx.fillStyle = '#dc2626';
    [
      [-3, -2],
      [3, -1],
      [0, 5]
    ].forEach(([px, py]) => {
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (type === 'cable' && currentMap === 'garden') {
    // Backyard Map: Leafy Green Garden Weed with Roots & Dandelion Top (goes into Green Bin!)
    ctx.strokeStyle = '#14532d';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(0, 11);
    ctx.quadraticCurveTo(2, 0, 0, -10);
    ctx.stroke();
    // Jagged green weed leaves
    ctx.fillStyle = '#22c55e';
    [
      [-6, 2, -0.5],
      [6, 1, 0.5],
      [-5, -4, -0.4],
      [5, -5, 0.4]
    ].forEach(([lx, ly, rot]) => {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.ellipse(0, 0, 6.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    // Yellow dandelion weed flower head
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, -10, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else if (type === 'cable') {
    // Squiggly Copper Cable with Twisted Bare Copper Wire Ends (not a ring!)
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Splayed twisted bare copper strands at bottom-left (-11, 8) and top-right (11, -8)
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    // Bottom-left twisted strands
    ctx.moveTo(-9, 6);
    ctx.lineTo(-14, 5);
    ctx.moveTo(-9, 6);
    ctx.lineTo(-13, 10);
    ctx.moveTo(-9, 6);
    ctx.lineTo(-8, 12);
    // Top-right twisted strands
    ctx.moveTo(9, -6);
    ctx.lineTo(14, -5);
    ctx.moveTo(9, -6);
    ctx.lineTo(13, -10);
    ctx.moveTo(9, -6);
    ctx.lineTo(8, -12);
    ctx.stroke();

    // Dark outer cable border along the squiggly S-curve
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(-9, 6);
    ctx.bezierCurveTo(-4, -10, 4, 10, 9, -6);
    ctx.stroke();

    // Rich Copper Wire Body along the squiggly S-curve
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-9, 6);
    ctx.bezierCurveTo(-4, -10, 4, 10, 9, -6);
    ctx.stroke();

    // Twisted copper strand texture highlight
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(-9, 6);
    ctx.bezierCurveTo(-4, -10, 4, 10, 9, -6);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (type === 'stick') {
    // Wooden Knockout Stick / Club with small side branch & leaf
    ctx.rotate(-0.55);
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Tapered wooden club shape
    ctx.moveTo(-4, 13);
    ctx.lineTo(3, 13);
    ctx.lineTo(5.5, -11);
    ctx.arc(0, -11, 5.5, 0, Math.PI, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Small side twig + green leaf
    ctx.beginPath();
    ctx.moveTo(3, -1);
    ctx.lineTo(9, -6);
    ctx.stroke();
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.ellipse(10, -7, 3.5, 2, -0.5, 0, Math.PI * 2);
    ctx.fill();

    // Wood grain highlight
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-1, 9);
    ctx.lineTo(0, -9);
    ctx.stroke();
  }

  ctx.restore();
}

function drawHazardsAndPowerups() {
  const now = performance.now() * 0.004;

  // Draw Unmistakable Bubbling Purple Sticky Puddles (Slow Hazards)
  slowHazards.forEach((haz) => {
    ctx.save();
    ctx.translate(haz.x, haz.y);

    // Multi-lobe liquid puddle shape
    ctx.fillStyle = 'rgba(147, 51, 234, 0.72)';
    ctx.strokeStyle = '#e9d5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, haz.radius * 1.1, haz.radius * 0.78, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(-14, 6, 11, 0, Math.PI * 2);
    ctx.arc(15, -5, 10, 0, Math.PI * 2);
    ctx.arc(8, 10, 9, 0, Math.PI * 2);
    ctx.fill();

    // Glossy liquid reflection & animated bubbles
    ctx.fillStyle = 'rgba(243, 232, 255, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-7, -5, 8, 3.5, -0.3, 0, Math.PI * 2);
    ctx.fill();

    const bPulse = Math.sin(now * 2 + haz.x) * 2;
    ctx.fillStyle = '#d8b4fe';
    ctx.beginPath();
    ctx.arc(7, -2 + bPulse, 3.5, 0, Math.PI * 2);
    ctx.arc(-4, 6 - bPulse, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // Draw Glossy 3D Ice Cube Powerups & Rare Knockout Sticks
  powerups.forEach((p) => {
    const bob = Math.sin(now * 1.5 + p.bobOffset) * 4;
    ctx.save();
    ctx.translate(p.x, p.y + bob);

    if (p.type === 'stick') {
      // Golden/Amber aura for Knockout Stick
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#fde047';
      ctx.stroke();
      drawCustomItemGraphic('stick', 0, 0, 1.05);

      ctx.font = '900 8px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('STICK', 0, 19);
    } else {
      const isLunging = gameState === 'KILL_ANIM';

      // When Sam is lunging at you, draw a dashed guidance line from player to the Ice Cube + huge pulsing beacon!
      if (isLunging) {
        const pulse = 0.5 + 0.5 * Math.sin(now * 6);
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(player.x - p.x, player.y - (p.y + bob));
        ctx.lineTo(0, 0);
        ctx.stroke();
        ctx.setLineDash([]);

        // Giant pulsing target ring around the Ice Cube
        ctx.beginPath();
        ctx.arc(0, 0, 34 + pulse * 12, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.fill();
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#bae6fd';
        ctx.stroke();
        ctx.restore();
      }

      // Outer icy aura
      ctx.beginPath();
      ctx.arc(0, 0, 23, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#7dd3fc';
      ctx.stroke();

      // 3D Glossy Ice Cube Block
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(-12, -12, 24, 24, 5);
      ctx.fill();
      ctx.lineWidth = 2.2;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // Inner ice facet & specular shine
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.roundRect(-8, -8, 12, 10, 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-4, -4, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Mini label
      ctx.font = '900 8px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0c4a6e';
      ctx.fillText('ICE', 0, 9);

      // High-visibility callout above the Ice Cube when Sam is lunging at you!
      if (isLunging) {
        const arrowBounce = Math.sin(now * 6) * 5;
        ctx.fillStyle = '#0284c7';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-92, -56 + arrowBounce, 184, 22, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = '700 10px "IBM Plex Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🧊 TOUCH TO FREEZE SAM!', 0, -45 + arrowBounce);
      }
    }
    ctx.restore();
  });
}

function drawStinkCloudEffect(cx, cy, baseRadius, stinkTimer, badgeOffsetY) {
  const t = performance.now() * 0.005;
  const isUrgent = stinkTimer <= 5.0;
  const pulse = Math.sin(t * (isUrgent ? 4.5 : 2.2)) * 3.5;

  ctx.save();
  // Toxic green/yellow stink cloud aura around item
  ctx.beginPath();
  ctx.arc(cx, cy, baseRadius + 9 + pulse, 0, Math.PI * 2);
  ctx.fillStyle = isUrgent ? 'rgba(239, 68, 68, 0.25)' : 'rgba(132, 204, 22, 0.26)';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = isUrgent ? '#f87171' : '#a3e635';
  ctx.stroke();
  ctx.setLineDash([]);

  // 4 orbiting green stink cloud puffs
  for (let p = 0; p < 4; p++) {
    const ang = t * 1.1 + (p * Math.PI) / 2;
    const px = cx + Math.cos(ang) * (baseRadius + 7);
    const py = cy + Math.sin(ang) * (baseRadius + 5);
    ctx.beginPath();
    ctx.arc(px, py, 5.5 + Math.sin(t * 2 + p) * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(163, 230, 53, 0.38)';
    ctx.fill();
  }

  // 3 wavy stink fume lines rising above the item
  ctx.strokeStyle = isUrgent ? '#fca5a5' : '#bef264';
  ctx.lineWidth = 2;
  for (let w = -1; w <= 1; w++) {
    const wx = cx + w * 9;
    const wyStart = cy - baseRadius + 2;
    const wave = Math.sin(t * 3 + w * 1.4) * 3.5;
    ctx.beginPath();
    ctx.moveTo(wx, wyStart);
    ctx.quadraticCurveTo(wx + wave, wyStart - 8, wx - wave * 0.7, wyStart - 16);
    ctx.stroke();
  }

  // High-contrast countdown badge above the stinky item
  const label = `STINK ${Math.max(0, stinkTimer).toFixed(1)}s`;
  ctx.fillStyle = isUrgent ? '#dc2626' : '#365314';
  ctx.strokeStyle = isUrgent ? '#fecaca' : '#a3e635';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.roundRect(cx - 34, cy + badgeOffsetY - 8, 68, 15, 4);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 9px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isUrgent ? '#ffffff' : '#ecfccb';
  ctx.fillText(label, cx, cy + badgeOffsetY);
  ctx.restore();
}

function drawMessItems() {
  const now = performance.now() * 0.004;
  items.forEach((item) => {
    const bob = item.scatterProgress >= 1 ? Math.sin(now + item.bobOffset) * 3.5 : 0;
    const drawY = item.y + bob;
    const badgeRadius = item.isHeavy ? 25 : 22;
    ctx.save();

    if (item.isStinky) {
      drawStinkCloudEffect(item.x, drawY, badgeRadius, item.stinkTimer, -badgeRadius - 14);
    }

    // Drop shadow under badge
    ctx.beginPath();
    ctx.arc(item.x, drawY + 3, badgeRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
    ctx.fill();

    // High-contrast colored circular badge
    ctx.beginPath();
    ctx.arc(item.x, drawY, badgeRadius, 0, Math.PI * 2);
    ctx.fillStyle =
      item.type === 'sock'
        ? 'rgba(249, 115, 22, 0.85)'
        : item.type === 'food'
        ? 'rgba(34, 197, 94, 0.85)'
        : 'rgba(14, 165, 233, 0.85)';
    ctx.fill();
    ctx.lineWidth = item.isHeavy ? 4 : 2.5;
    ctx.strokeStyle = item.isHeavy
      ? '#facc15'
      : item.type === 'sock'
      ? '#ffedd5'
      : item.type === 'food'
      ? '#dcfce7'
      : '#e0f2fe';
    ctx.stroke();

    // Draw custom vector illustration inside the badge
    drawCustomItemGraphic(item.type, item.x, drawY, item.isHeavy ? 1.15 : 1.05);

    if (item.isHeavy) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.beginPath();
      ctx.roundRect(item.x - 20, drawY + 18, 40, 13, 4);
      ctx.fill();
      ctx.font = '900 8px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#facc15';
      ctx.fillText('HEAVY', item.x, drawY + 27);
    }

    ctx.restore();
  });
}

function drawRoomba() {
  if (!roomba.active) return;
  ctx.save();
  ctx.translate(roomba.x, roomba.y);
  const moveAngle = Math.atan2(roomba.vy, roomba.vx);
  ctx.rotate(moveAngle);

  // Subtle dotted path indicator ahead of Roomba
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.45)';
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(roomba.radius + 4, 0);
  ctx.lineTo(roomba.radius + 28, 0);
  ctx.stroke();
  ctx.setLineDash([]);

  // Spinning front side-brushes
  ctx.save();
  ctx.translate(12, -13);
  ctx.rotate(roomba.brushPhase);
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 1.6;
  for (let b = 0; b < 3; b++) {
    const ba = (b * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(ba) * 8, Math.sin(ba) * 8);
    ctx.stroke();
  }
  ctx.restore();

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
  ctx.beginPath();
  ctx.arc(0, 3, roomba.radius, 0, Math.PI * 2);
  ctx.fill();

  // Roomba outer casing
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, 0, roomba.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Front bumper arc
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, roomba.radius - 2, -Math.PI * 0.4, Math.PI * 0.4);
  ctx.stroke();

  // Inner metallic ring & glowing power LED
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(0, 0, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle =
    roomba.state === 'INTRO'
      ? '#ef4444'
      : roomba.state === 'RETURNING'
      ? '#f59e0b'
      : roomba.state === 'DOCKED'
      ? '#38bdf8'
      : '#22c55e';
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawRoombaIntroVignette() {
  if (roomba.vignetteAlpha <= 0.01) return;
  ctx.save();
  // Dramatic dark radial vignette centered on the entering Roomba at the bottom-left door!
  const spotX = roomba.x;
  const spotY = Math.min(685, roomba.y);
  const grad = ctx.createRadialGradient(spotX, spotY, 55, spotX, spotY, 920);
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(0.18, `rgba(15, 23, 42, ${0.58 * roomba.vignetteAlpha})`);
  grad.addColorStop(0.55, `rgba(2, 6, 23, ${0.86 * roomba.vignetteAlpha})`);
  grad.addColorStop(1, `rgba(0, 0, 0, ${0.95 * roomba.vignetteAlpha})`);

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // No WARNING banner here anymore — you can see the Roomba entering.
  // The vignette above is the only signal, and it fades on its own.
  ctx.restore();
}

function drawSam() {
  const isOutOfBed =
    sam.state === 'ATTACKING' ||
    gameState === 'SAM_KNOCKBACK' ||
    sam.frozenOnSpot ||
    sam.returningToBed;
  const drawX = isOutOfBed ? sam.attackX : samHead.x;
  const drawY = isOutOfBed ? sam.attackY : samHead.y;

  // Red surveillance cone when AWAKE in bed
  if ((sam.state === 'AWAKE' || sam.state === 'ATTACKING') && sam.iceTimer <= 0 && sam.knockoutTimer <= 0) {
    ctx.save();
    const grad = ctx.createRadialGradient(drawX, drawY, 20, drawX, drawY, RED_CONE_RADIUS);
    grad.addColorStop(0, 'rgba(239, 68, 68, 0.42)');
    grad.addColorStop(1, 'rgba(239, 68, 68, 0.08)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(drawX, drawY, RED_CONE_RADIUS, RED_CONE_START_ANGLE, RED_CONE_END_ANGLE);
    ctx.lineTo(drawX, drawY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  // --- SAM'S VILLAIN BODY (In Bed vs. Lunging / Frozen on Floor / Returning to Bed) ---
  ctx.save();
  if (isOutOfBed) {
    const bodyAngle =
      sam.frozenOnSpot || sam.returningToBed
        ? sam.lungeAngle
        : Math.atan2(player.y - drawY, player.x - drawX);
    ctx.translate(drawX, drawY);
    ctx.rotate(bodyAngle);

    // Menacing dark-red aura & speed lines behind lunging Sam (only when actively lunging)
    if (sam.state === 'ATTACKING' && !sam.frozenOnSpot) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
      ctx.lineWidth = 3;
      for (let l = -1; l <= 1; l++) {
        ctx.beginPath();
        ctx.moveTo(-55, l * 26);
        ctx.lineTo(-98, l * 30);
        ctx.stroke();
      }
    }

    // Trailing legs kicking behind Sam (frozen still when frozenOnSpot!)
    const kick = sam.frozenOnSpot ? 0 : Math.sin(performance.now() * 0.03) * 8;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-84, -22 + kick, 40, 14, 7);
    ctx.roundRect(-84, 8 - kick, 40, 14, 7);
    ctx.fill();

    // Broad villain torso & shoulders
    ctx.fillStyle = sam.frozenOnSpot ? '#0c4a6e' : '#1e1b4b';
    ctx.strokeStyle = sam.frozenOnSpot ? '#38bdf8' : '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(-22, 0, 34, 48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Outstretched lunging arms & grabbing hands
    ctx.fillStyle = sam.frozenOnSpot ? '#0c4a6e' : '#1e1b4b';
    ctx.beginPath();
    ctx.roundRect(0, -48, 56, 16, 8);
    ctx.roundRect(0, 32, 56, 16, 8);
    ctx.fill();
    ctx.stroke();

    // Grabbing villain hands & fingers
    ctx.fillStyle = sam.frozenOnSpot ? '#bae6fd' : '#fecdd3';
    ctx.strokeStyle = sam.frozenOnSpot ? '#0284c7' : '#991b1b';
    ctx.lineWidth = 1.8;
    [-40, 40].forEach((hy) => {
      ctx.beginPath();
      ctx.arc(58, hy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Outstretched fingers
      for (let f = -1; f <= 1; f++) {
        ctx.beginPath();
        ctx.moveTo(64, hy + f * 4);
        ctx.lineTo(73, hy + f * 6);
        ctx.stroke();
      }
    });
  } else {
    // Sam lying in bed: draw his shoulders, pajama torso, and hands gripping the duvet edge!
    const isAlertOrAwake = (sam.state === 'WARNING' || sam.state === 'AWAKE') && sam.iceTimer <= 0 && sam.knockoutTimer <= 0;

    // Angry red aura around Sam in bed when AWAKE
    if (sam.state === 'AWAKE' && sam.iceTimer <= 0 && sam.knockoutTimer <= 0) {
      const pulse = 6 + Math.sin(performance.now() * 0.02) * 4;
      ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
      ctx.beginPath();
      ctx.arc(drawX, drawY, samHead.radius + pulse + 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shoulders & pajama shirt tucked into the duvet to the left of his pillow
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(drawX - 38, drawY, 28, 52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Duvet fold line + Sam's hands resting on (or tensely gripping) the blanket edge
    const handX = isAlertOrAwake ? drawX - 58 : drawX - 52;
    ctx.fillStyle = '#fecdd3';
    ctx.strokeStyle = isAlertOrAwake ? '#dc2626' : '#475569';
    ctx.lineWidth = 2;
    [-38, 38].forEach((hyOffset) => {
      ctx.beginPath();
      ctx.arc(handX, drawY + hyOffset, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Knuckle lines gripping the blanket
      ctx.beginPath();
      ctx.moveTo(handX - 5, drawY + hyOffset - 3);
      ctx.lineTo(handX - 9, drawY + hyOffset - 3);
      ctx.moveTo(handX - 5, drawY + hyOffset + 3);
      ctx.lineTo(handX - 9, drawY + hyOffset + 3);
      ctx.stroke();
    });
  }
  ctx.restore();

  // Draw Sam's generic vector sprite portrait on the pillow / lunging body
  const isEyesOpen = (sam.state === 'AWAKE' || sam.state === 'ATTACKING') && sam.iceTimer <= 0 && sam.knockoutTimer <= 0;
  let visualMode = 'SLEEPING';
  if (sam.knockoutTimer > 0) visualMode = 'KNOCKED_OUT';
  else if (sam.iceTimer > 0) visualMode = 'FROZEN';
  else if (sam.state === 'WARNING') visualMode = 'WARNING';
  else if (sam.state === 'AWAKE' || sam.state === 'ATTACKING') visualMode = 'AWAKE';

  drawGenericSamFace(ctx, drawX, drawY, samHead.radius, visualMode);

  // Frost tint overlay if Sam is ICED!
  if (sam.iceTimer > 0) {
    ctx.save();
    if (sam.frozenOnSpot) {
      // Solid ice block encasing Sam on the floor where he froze!
      ctx.fillStyle = 'rgba(56, 189, 248, 0.34)';
      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(drawX - 66, drawY - 62, 132, 124, 12);
      ctx.fill();
      ctx.stroke();

      // Ice shine lines
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(drawX - 48, drawY - 46);
      ctx.lineTo(drawX - 24, drawY - 54);
      ctx.moveTo(drawX + 26, drawY + 48);
      ctx.lineTo(drawX + 50, drawY + 34);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(drawX, drawY, samHead.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.fill();
    }
    ctx.restore();
  }

  // Portrait border ring + villain eyebrows / nightcap accessory
  ctx.save();
  ctx.beginPath();
  ctx.arc(drawX, drawY, samHead.radius, 0, Math.PI * 2);
  ctx.lineWidth = 4.5;
  ctx.strokeStyle =
    sam.knockoutTimer > 0
      ? '#facc15'
      : sam.iceTimer > 0
      ? '#38bdf8'
      : sam.state === 'SLEEPING'
      ? '#10b981'
      : sam.state === 'WARNING'
      ? '#f59e0b'
      : '#ef4444';
  ctx.stroke();

  // Cozy blue sleeping nightcap on Sam's head when sleeping/iced/KO'd in bed
  if (!isOutOfBed && !isEyesOpen) {
    ctx.save();
    ctx.translate(drawX + 26, drawY - 38);
    ctx.rotate(0.35);
    ctx.fillStyle = '#3b82f6';
    ctx.strokeStyle = '#1e3a8a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-24, 8);
    ctx.quadraticCurveTo(4, -22, 30, 4);
    ctx.quadraticCurveTo(4, 2, -24, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // White fluffy cuff & pom-pom ball
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(-26, 4, 34, 8, 4);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(32, 5, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  // Spinning stars around Sam's head if KNOCKED OUT by the Stick or Forcefield!
  if (sam.knockoutTimer > 0) {
    ctx.save();
    const spin = performance.now() * 0.005;
    for (let s = 0; s < 3; s++) {
      const sa = spin + (s * Math.PI * 2) / 3;
      const sx = drawX + Math.cos(sa) * 44;
      const sy = drawY - 18 + Math.sin(sa) * 18;
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#713f12';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(sx, sy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  // Flying stick projectile animation
  if (flyingStick) {
    ctx.save();
    ctx.translate(flyingStick.x, flyingStick.y);
    ctx.rotate(flyingStick.angle);
    drawCustomItemGraphic('stick', 0, 0, 1.25);
    ctx.restore();
  }

  // --- 3 SHIELD LIVES HUD BADGE (Top-Right of Canvas) ---
  // On mobile the hamburger sits top-right, so drop the badge below it.
  const isHamburgerMode = document.body.classList.contains('compact-game') || document.body.classList.contains('touch-controls-on');
  const shieldsBadgeY = isHamburgerMode ? 56 : 14;
  const shieldsTextY = shieldsBadgeY + 17;
  ctx.save();
  ctx.fillStyle = '#211d1a';
  ctx.strokeStyle = '#0c0a09';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(canvas.width - 194, shieldsBadgeY, 174, 34, 4);
  ctx.fill();
  ctx.stroke();

  ctx.font = '700 11px "IBM Plex Mono", monospace';
  ctx.fillStyle = '#f3ede2';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('SHIELDS:', canvas.width - 182, shieldsTextY);

  for (let i = 0; i < 3; i++) {
    const sx = canvas.width - 96 + i * 26;
    const sy = shieldsTextY;
    const active = i < player.lives;
    ctx.beginPath();
    ctx.arc(sx, sy, 8, 0, Math.PI * 2);
    ctx.fillStyle = active ? '#0284c7' : '#2c2622';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = active ? '#bae6fd' : '#574d43';
    ctx.stroke();
  }
  ctx.restore();

  // No top status banners anymore — they flashed past too fast to read,
  // and you can see what Sam is doing anyway (stirring, lunging, frozen,
  // knocked out, map changing). The Sam Cam sidebar still shows his state.
  // The only banner-style exception is the one-time lunge tutorial, drawn
  // separately by drawLungeTutorial().
  // Small '!' badge above Sam while he is stirring — not a banner, just
  // a quiet marker you can see on Sam himself.
  if (sam.state === 'WARNING') {
    const bounce = Math.sin(performance.now() * 0.035) * 5;
    const badgeX = drawX - 65;
    const badgeY = drawY - 50 + bounce;

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.roundRect(badgeX - 24, badgeY - 26, 48, 52, 4);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0c0a09';
    ctx.stroke();

    ctx.fillStyle = '#000000';
    ctx.font = '700 36px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('!', badgeX, badgeY + 2);
  }

  // Floating Zzz particles
  sam.zzzParticles.forEach((z) => {
    ctx.fillStyle = `rgba(243, 237, 226, ${z.alpha})`;
    ctx.font = `700 ${z.size}px "IBM Plex Mono", monospace`;
    ctx.fillText('Z', z.x, z.y);
  });

  ctx.restore();
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);

  // --- BLUE FORCEFIELD SHATTER BURST (When QTE Succeeds) ---
  if (shieldBurst) {
    ctx.save();
    ctx.globalAlpha = shieldBurst.alpha;
    ctx.beginPath();
    ctx.arc(0, 0, shieldBurst.ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.stroke();

    shieldBurst.shards.forEach((sh) => {
      ctx.save();
      ctx.translate(sh.x - player.x, sh.y - player.y);
      ctx.rotate(sh.rot);
      ctx.fillStyle = '#7dd3fc';
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -sh.size);
      ctx.lineTo(sh.size * 0.75, sh.size * 0.7);
      ctx.lineTo(-sh.size * 0.75, sh.size * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });
    ctx.restore();
  }

  // --- STICK PROMPT OR ACTIVE QTE FORCEFIELD TIMING RINGS (When Sam Is Charging At You) ---
  if (gameState === 'KILL_ANIM' && player.hasStick) {
    // Yellow circle only — no PRESS banner. You can see Sam lunging and
    // you have the stick; the first-lunge tutorial (once ever) is the
    // only place the key is spelled out.
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 42, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(250, 204, 21, 0.28)';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();
    ctx.restore();
  } else if (gameState === 'KILL_ANIM' && sam.qteActive && !sam.qteFailed) {
    const dist = Math.hypot(player.x - sam.attackX, player.y - sam.attackY);
    const progress = Math.max(0, Math.min(1, 1 - dist / sam.attackStartDist));
    const inSweetSpot = progress >= QTE_BLOCK_START && progress <= QTE_BLOCK_END;
    const inPerfectSpot = progress >= QTE_PERFECT_START && progress <= QTE_PERFECT_END;

    // Inner Blue Forcefield Target Zone (radius 38)
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 38, 0, Math.PI * 2);
    ctx.fillStyle = inPerfectSpot
      ? 'rgba(250, 204, 21, 0.5)'
      : inSweetSpot
      ? 'rgba(56, 189, 248, 0.42)'
      : 'rgba(239, 68, 68, 0.22)';
    ctx.fill();
    ctx.lineWidth = inPerfectSpot ? 5.5 : inSweetSpot ? 4.5 : 2.5;
    ctx.strokeStyle = inPerfectSpot
      ? '#facc15'
      : inSweetSpot
      ? '#38bdf8'
      : '#ef4444';
    ctx.stroke();

    // Shrinking Outer Timing Ring converging onto radius 38
    const outerRadius = Math.max(24, 38 + (0.62 - progress) * 110);
    ctx.beginPath();
    ctx.arc(0, 0, outerRadius, 0, Math.PI * 2);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = inPerfectSpot ? '#facc15' : inSweetSpot ? '#38bdf8' : '#ef4444';
    ctx.stroke();

    // Gold boundaries show the exact perfect-block interval while the ring shrinks.
    const perfectOuterRadius = 38 + (0.62 - QTE_PERFECT_START) * 110;
    const perfectInnerRadius = 38 + (0.62 - QTE_PERFECT_END) * 110;
    ctx.setLineDash([6, 5]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(250, 204, 21, 0.9)';
    [perfectOuterRadius, perfectInnerRadius].forEach((radius) => {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    });
    ctx.setLineDash([]);

    // No overhead banner here anymore — the rings themselves are the
    // timing tell (blue = block, gold = perfect). The first-lunge
    // tutorial (once ever) is the only place the timing is spelled out.
    ctx.restore();
  }

  // --- GUITAR RIFF AURA (When Active) ---
  // Visual only — no text telling the player they have a boost or how
  // long is left. They should just feel it.
  if (player.speedBoostTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.ellipse(0, 14, 24, 12, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }

  // --- TOP-DOWN SNEAKY CHARACTER GRAPHIC (Renders Equipped Outfit!) ---
  const stride = player.isMoving ? Math.sin(player.stepPhase) * 6.5 : 0;
  const armSwing = player.isMoving ? Math.cos(player.stepPhase) * 5.5 : 0;
  drawPlayerOutfitBody(ctx, getEquippedOutfitObj(), {
    stride,
    armSwing,
    isSlowed: player.slowTimer > 0,
    isHolding: Boolean(player.holding),
    facingAngle: player.facingAngle
  });

  // Nervous sweat drop when Sam is Stirring or Watching!
  if ((sam.state === 'WARNING' || sam.state === 'AWAKE') && sam.iceTimer <= 0 && sam.knockoutTimer <= 0) {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(11, -12);
    ctx.quadraticCurveTo(14, -7, 11, -5);
    ctx.quadraticCurveTo(8, -7, 11, -12);
    ctx.fill();
  }

  if (player.holding) {
    if (player.holding.isStinky) {
      drawStinkCloudEffect(0, -36, 15, player.holding.stinkTimer, -26);
    }
    ctx.beginPath();
    ctx.arc(0, -36, 16, 0, Math.PI * 2);
    ctx.fillStyle = '#211d1a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = player.holding.isStinky
      ? '#a3e635'
      : player.holding.type === 'sock'
      ? '#fb923c'
      : player.holding.type === 'food'
      ? '#4ade80'
      : '#38bdf8';
    ctx.stroke();
    drawCustomItemGraphic(player.holding.type, 0, -36, 0.85);
  }

  // Show Stick in player's side inventory slot when carried!
  if (player.hasStick) {
    ctx.beginPath();
    ctx.arc(26, -18, 13, 0, Math.PI * 2);
    ctx.fillStyle = '#211d1a';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#facc15';
    ctx.stroke();
    drawCustomItemGraphic('stick', 26, -18, 0.72);

    ctx.font = '700 9px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fde047';
    ctx.fillText('STICK [E]', 26, -36);
  }

  ctx.restore();

  // Directional guide arrow toward active drop-off zone when carrying a normal mess item
  if (player.holding && dropZones[player.holding.type]) {
    const targetZone = dropZones[player.holding.type];
    const angle = Math.atan2(targetZone.dropY - player.y, targetZone.dropX - player.x);
    const arrowDist = 38;
    const ax = player.x + Math.cos(angle) * arrowDist;
    const ay = player.y + Math.sin(angle) * arrowDist;

    ctx.save();
    ctx.translate(ax, ay);
    ctx.rotate(angle);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(11, 0);
    ctx.lineTo(-6, -7);
    ctx.lineTo(-6, 7);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

function drawWindowBird() {
  if (windowBird.state === 'OUTSIDE') return;

  ctx.save();
  ctx.translate(windowBird.x, windowBird.y);

  // Determine flight facing angle
  let angle = Math.PI / 2;
  if (windowBird.state === 'FLYING_IN') {
    angle = Math.atan2(player.y - 24 - windowBird.y, player.x - windowBird.x);
  } else if (windowBird.state === 'FLYING_OUT') {
    angle = Math.atan2(42 - windowBird.y, 560 - windowBird.x);
  } else {
    angle = windowBird.orbitAngle + Math.PI / 2;
  }

  ctx.save();
  ctx.rotate(angle);

  // Flapping wings
  const wingSpread = 9 + Math.sin(windowBird.wingPhase) * 9;
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.6;

  // Left & Right Wings
  ctx.beginPath();
  ctx.moveTo(2, -3);
  ctx.quadraticCurveTo(-4, -6 - wingSpread, -8, -2 - wingSpread * 0.7);
  ctx.quadraticCurveTo(-5, -2, -3, -2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(2, 3);
  ctx.quadraticCurveTo(-4, 6 + wingSpread, -8, 2 + wingSpread * 0.7);
  ctx.quadraticCurveTo(-5, 2, -3, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fanned tail feathers
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(-6, 0);
  ctx.lineTo(-14, -5);
  ctx.lineTo(-14, 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Plump Pigeon/Seagull Body
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head & Iridescent Neck Band
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(7, 0, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Sharp Yellow Beak
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(11, -2.2);
  ctx.lineTo(16, 0);
  ctx.lineTo(11, 2.2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Prompt above bird when harassing player
  if (windowBird.state === 'HARASSING') {
    ctx.fillStyle = '#211d1a';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-56, -30, 112, 18, 3);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 9px "IBM Plex Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fde047';
    ctx.fillText('SHOO BIRD [SPACE]', 0, -21);
  }

  ctx.restore();
}

function drawFloatingTexts() {
  // Only one message can exist at a time (see spawnFloatingText), so
  // there is no stacking / vertical-slot logic here anymore.
  const padding = 8;
  const lineHeight = 16;

  floatingTexts.forEach((ft) => {
    ctx.save();
    ctx.font = '700 13px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = ft.color;
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 3;
    const lines = ft.lines || [ft.text];
    const renderY = Math.max(ft.y, 8 + (lines.length * lineHeight + padding * 2) / 2);

    const firstLineY = renderY - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, ft.x, firstLineY + index * lineHeight);
    });
    ctx.restore();
  });
}

// First-lunge tutorial: the ONLY banner-style text left in the game.
// Static — it never pulses, flashes, or changes with the lunge progress,
// so it can actually be read. Sam lunges slightly slower, then stops in
// GOLD (see update()) so you have time to read it and press. Shown once
// per page load, and only if the intro cutscene was watched — refreshing
// the page brings it back.
//
// Styled to match the rest of the UI exactly (styles.css tokens + the
// in-canvas SHIELDS badge): flat #211d1a panel, 2px #3d362f border,
// 6px radius, hard 0 4px 0 #0c0a09 shadow, #f3ede2 text, #3d362f divider,
// and the <kbd> style for SPACE — dark #2c2622, 1px #574d43 border, 3px
// radius, IBM Plex Mono. No gradients, no soft glow, no gold border,
// no gold heading, no decorative ring dot. The only gold is the word
// "gold" itself, in the UI warning colour #eab308.
function drawLungeTutorial() {
  if (!lungeTutorialActive || gameState !== 'KILL_ANIM') return;
  ctx.save();
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Vignette marks this lunge as the test one — darkened edges, clear
  // centre, so you can tell this isn't a normal lunge. Kept: it's a
  // fullscreen effect, not part of the card's UI.
  const vignette = ctx.createRadialGradient(
    cx, cy, Math.min(canvas.width, canvas.height) * 0.32,
    cx, cy, Math.max(canvas.width, canvas.height) * 0.72
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Exactly three lines, nothing else — as a hub-panel card.
  const panelW = 700;
  const panelH = 138;
  const panelX = cx - panelW / 2;
  const panelY = 96;

  // Hard shadow, like .hub-panel / .hud-bar: 0 4px 0 #0c0a09.
  // Drawn as an offset solid rect, not a blurred shadow.
  ctx.fillStyle = '#0c0a09';
  ctx.beginPath();
  ctx.roundRect(panelX, panelY + 4, panelW, panelH, 6);
  ctx.fill();

  // Flat panel, like .hub-panel: #211d1a, 2px #3d362f, 6px radius.
  ctx.fillStyle = '#211d1a';
  ctx.strokeStyle = '#3d362f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(panelX, panelY, panelW, panelH, 6);
  ctx.fill();
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Line 1 — plain heading, UI text colour, not gold.
  ctx.fillStyle = '#f3ede2';
  ctx.font = '700 19px "Space Grotesk", sans-serif';
  ctx.fillText('Sam is lunging at you.', cx, panelY + 28);

  // Divider, like .hub-section-header: 1px #3d362f.
  ctx.strokeStyle = '#3d362f';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(panelX + 24, panelY + 50);
  ctx.lineTo(panelX + panelW - 24, panelY + 50);
  ctx.stroke();

  // Line 2 — "Press [SPACE] to use shield and block." with SPACE as a
  // <kbd> exactly like styles.css: #2c2622 bg, 1px #574d43 border,
  // 3px radius, IBM Plex Mono, #f3ede2 text.
  const line2Y = panelY + 80;
  const pre2 = 'Press ';
  const keyLabel = 'SPACE';
  const post2 = ' to use shield and block.';
  ctx.font = '700 12px "IBM Plex Mono", monospace';
  const keyW = ctx.measureText(keyLabel).width + 12;
  ctx.font = '700 17px "Space Grotesk", sans-serif';
  const pre2W = ctx.measureText(pre2).width;
  const post2W = ctx.measureText(post2).width;
  const total2W = pre2W + keyW + 6 + post2W;
  let x2 = cx - total2W / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f3ede2';
  ctx.fillText(pre2, x2, line2Y);
  x2 += pre2W;
  const keyH = 22;
  const keyY = line2Y - keyH / 2;
  ctx.fillStyle = '#2c2622';
  ctx.strokeStyle = '#574d43';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x2, keyY, keyW, keyH, 3);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#f3ede2';
  ctx.font = '700 12px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(keyLabel, x2 + keyW / 2, line2Y + 1);
  x2 += keyW + 6;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f3ede2';
  ctx.font = '700 17px "Space Grotesk", sans-serif';
  ctx.fillText(post2, x2, line2Y);

  // Line 3 — "gold" in the UI warning colour, rest in UI text colour.
  // No decorative ring dot: the rest of the UI doesn't do that.
  const line3Y = panelY + 112;
  const part1 = 'If you use a shield when the ring is ';
  const goldWord = 'gold';
  const part2 = ', you keep it.';
  ctx.font = '700 15px "Space Grotesk", sans-serif';
  const part1W = ctx.measureText(part1).width;
  const goldW = ctx.measureText(goldWord).width;
  const part2W = ctx.measureText(part2).width;
  const total3W = part1W + goldW + part2W;
  let x3 = cx - total3W / 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#f3ede2';
  ctx.fillText(part1, x3, line3Y);
  x3 += part1W;
  ctx.fillStyle = '#eab308';
  ctx.fillText(goldWord, x3, line3Y);
  x3 += goldW;
  ctx.fillStyle = '#f3ede2';
  ctx.fillText(part2, x3, line3Y);

  ctx.restore();
}

// Main Game Loop
let lastTime = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  update(dt);
  updateTouchButtons();

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBedroom();
  drawHazardsAndPowerups();
  drawMessItems();
  drawRoomba();
  drawPlayer();
  drawWindowBird();
  drawSam();
  drawRoombaIntroVignette();
  drawMapCutscene();
  drawLungeTutorial();
  drawFloatingTexts();

  requestAnimationFrame(loop);
}

function simulateKey(key, code) {
  window.dispatchEvent(new KeyboardEvent('keydown', { key, code, bubbles: true, cancelable: true }));
  window.setTimeout(() => { window.dispatchEvent(new KeyboardEvent('keyup', { key, code, bubbles: true })); }, 90);
}
function pressTouchUse() {
  initAudio();
  if (gameState === 'CUTSCENE' || cutsceneShell?.classList.contains('active')) { endMapCutscene(); return; }
  if (player.hasStick) simulateKey('e', 'KeyE'); else simulateKey(' ', 'Space');
  updateTouchButtons();
}
function pressTouchDrop() {
  initAudio();
  if (!player.holding) return;
  simulateKey('q', 'KeyQ'); updateTouchButtons();
}
function updateTouchButtons() {
  if (!touchUseBtn || !touchDropBtn) return;
  let label = 'USE'; let sub = 'SHIELD / STICK';
  if (player?.hasStick) { label = 'STICK'; sub = 'BONK SAM!'; }
  else if (gameState === 'KILL_ANIM') { label = 'SHIELD'; sub = 'BLOCK!'; }
  else if (windowBird?.state === 'HARASSING') { label = 'SHOO'; sub = 'SHOO BIRD'; }
  if (touchUseLabel && touchUseLabel.textContent !== label) touchUseLabel.textContent = label;
  if (touchUseSub && touchUseSub.textContent !== sub) touchUseSub.textContent = sub;
  touchDropBtn.classList.toggle('touch-disabled', !player?.holding);
}
function enterFullscreen() {
  // True fullscreen hides the browser search bar / tabs on mobile/tablet,
  // so the playable window is not tiny. Must be called from a user gesture
  // (Start Shift / Play Again / Restart / guard button / hub Fullscreen).
  // Android Chrome / Edge support it.
  // iOS Safari has no document fullscreen — it falls through to the
  // scroll-to-hide fallback below, and 100dvh still gives the most space.
  // On iOS the real fix is Share -> Add to Home Screen (see guard hint),
  // or Play Anyway — the guard no longer blocks short landscape at all.
  // PC: NEVER fullscreen. isTouchDevice() is false on a keyboard+mouse PC
  // (pointer fine, no touch), so we return and the game stays windowed.
  try {
    if (typeof isTouchDevice === 'function' ? !isTouchDevice() : !(window.matchMedia && window.matchMedia('(pointer: coarse)').matches)) return;
    if (document.fullscreenElement) return;
    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (req) {
      const p = req.call(el, { navigationUI: 'hide' });
      if (p && p.catch) p.catch(() => {});
    } else {
      // No fullscreen API (iOS Safari): scroll is the only way Safari
      // collapses its bars, and one scroll often isn't enough — the bar
      // re-appears on the next paint. Scroll twice, a frame apart.
      window.scrollTo(0, 1);
      setTimeout(() => { try { window.scrollTo(0, 1); } catch (e) {} }, 100);
    }
    if (screen.orientation && screen.orientation.lock) {
      // Lock after fullscreen engages; if it fails (not fullscreen yet on
      // this browser), the catch keeps the game starting anyway.
      setTimeout(() => { try { screen.orientation.lock('landscape').catch(() => {}); } catch (e) {} }, 300);
    }
  } catch (e) {}
}
// ---- Aspect-guard escape hatch (phone fix) ---------------------------
// Before this, the guard could trap phone players: it covered the whole
// screen, and the ONLY fullscreen trigger (Start Shift) was underneath it.
// So a phone in landscape with its address bar still showing could never
// hide the bar, could never clear the guard, could never start.
// The guard now has its own buttons, wired here:
//  - GO FULLSCREEN: tries real fullscreen (Android). If that works the
//    viewport grows and the CSS guard hides itself. If it doesn't (iOS,
//    no fullscreen API) and we're already landscape, we dismiss anyway —
//    the player chose to play with the bar showing rather than be stuck.
//  - PLAY ANYWAY: dismisses the guard for this session, but ONLY when
//    actually landscape (w > h). In portrait it refuses and asks to rotate,
//    so portrait players don't get a squished game by accident.
// Dismissal is session-only and reversible: rotating back to portrait
// re-shows the guard (see refreshGuardDismissed).
const aspectGuardEl = document.getElementById('aspect-guard');
const guardFullscreenBtn = document.getElementById('guard-fullscreen-btn');
const guardPlayAnywayBtn = document.getElementById('guard-play-anyway-btn');
const guardIosHintEl = document.getElementById('guard-ios-hint');
const guardAnywayNoteEl = document.getElementById('guard-anyway-note');
const hubFullscreenBtn = document.getElementById('open-fullscreen-btn');
function isIOSDevice() {
  try {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0);
  } catch (e) { return false; }
}
if (guardIosHintEl && isIOSDevice()) guardIosHintEl.hidden = false;
function isGuardLandscape() {
  return window.innerWidth > window.innerHeight;
}
function refreshGuardDismissed() {
  if (!aspectGuardEl) return;
  // Only stay dismissed while landscape. Back to portrait -> guard returns.
  if (aspectGuardEl.classList.contains('guard-dismissed') && !isGuardLandscape()) {
    aspectGuardEl.classList.remove('guard-dismissed');
  }
}
function dismissGuardForSession() {
  if (aspectGuardEl) aspectGuardEl.classList.add('guard-dismissed');
}
if (guardFullscreenBtn) {
  guardFullscreenBtn.addEventListener('click', () => {
    initAudio();
    enterFullscreen();
    // Give fullscreen ~400ms to engage (Android). If we're landscape by
    // then — with or without fullscreen (iOS has none) — stop blocking.
    // If we're still portrait, leave the guard up: rotating is the fix.
    setTimeout(() => { if (isGuardLandscape()) dismissGuardForSession(); }, 400);
  });
}
if (guardPlayAnywayBtn) {
  guardPlayAnywayBtn.addEventListener('click', () => {
    if (isGuardLandscape()) {
      dismissGuardForSession();
    } else if (guardAnywayNoteEl) {
      guardAnywayNoteEl.hidden = false;
      guardAnywayNoteEl.textContent = 'Still portrait — rotate your phone sideways first, then tap Play Anyway.';
    }
  });
}
if (hubFullscreenBtn) {
  hubFullscreenBtn.addEventListener('click', () => { initAudio(); enterFullscreen(); });
}
window.addEventListener('resize', refreshGuardDismissed);
window.addEventListener('orientationchange', () => setTimeout(refreshGuardDismissed, 250));
document.addEventListener('fullscreenchange', refreshGuardDismissed);

function startGame() {
  // First watch of this cutscene: Restart must not bypass it — resetGame() hides
  // the shell and beginMapCutscene() would treat it as seen-this-session,
  // so a restart mid-cutscene would skip it. Stay in the cutscene.
  if (gameState === 'CUTSCENE' && !canSkipCutscene(currentMap)) return;
  initAudio();
  enterFullscreen();
  try { if (screen.orientation && screen.orientation.lock && document.fullscreenElement) { screen.orientation.lock('landscape').catch(() => {}); } } catch (e) {}
  startOverlay.classList.remove('active');
  gameoverOverlay.classList.remove('active');
  resetGame();
  if (!beginMapCutscene(currentMap)) {
    gameState = 'PLAYING';
  }
}

function openMainMenu() {
  stopVacuumSound();
  // If the menu is opened mid-cutscene, end it properly — otherwise the
  // shell stayed .active under the menu and froze on the next start.
  // First watch of this cutscene: the menu must not bypass it — endMapCutscene
  // returns false when skipping is blocked, so stay in the cutscene.
  if (!endMapCutscene()) return;
  cutsceneOutroStep = -1; // going to the menu cancels the ending — it is
  // for the cutscene -> gameplay handoff, not the menu
  gameState = 'START';
  gameoverOverlay.classList.remove('active');
  startOverlay.classList.add('active');
  renderWardrobeUI();
  renderAchievementsUI();
  updateMapSelectorUI();
}

function selectMap(mapKey) {
  if (!unlockedMaps[mapKey]) return;
  randomMode = false;
  // Switching maps mid-cutscene ends it first — otherwise the old
  // cutscene kept playing over the new map, or its frame got stuck.
  if (gameState === 'CUTSCENE') {
    if (!endMapCutscene()) return; // first watch of this cutscene cannot be skipped via map switch
  }
  if (currentMap !== mapKey) {
    if (gameState === 'PLAYING') {
      swapMapMidGame(mapKey, false);
    } else {
      applyMapConfig(mapKey);
      spawnInitialFloor();
    }
  } else {
    updateMapSelectorUI();
  }
}

function toggleRandomMode() {
  const unlockedCount = Object.values(unlockedMaps).filter(Boolean).length;
  if (unlockedCount < 2) return;
  randomMode = !randomMode;
  if (randomMode) {
    randomSwapTimer = 30.0 + Math.random() * 30.0;
    spawnFloatingText('RANDOM MAP SHUFFLE ENABLED (30-60s)!', canvas.width / 2, 85, '#d8b4fe');
  } else {
    spawnFloatingText('RANDOM MAP SHUFFLE OFF', canvas.width / 2, 85, '#9c8f80');
  }
  updateMapSelectorUI();
}

if (mapBtnBedroom) mapBtnBedroom.addEventListener('click', () => selectMap('bedroom'));
if (mapBtnLounge) mapBtnLounge.addEventListener('click', () => selectMap('lounge'));
if (mapBtnGarden) mapBtnGarden.addEventListener('click', () => selectMap('garden'));

if (startMapBedroom) startMapBedroom.addEventListener('click', () => selectMap('bedroom'));
if (startMapLounge) startMapLounge.addEventListener('click', () => selectMap('lounge'));
if (startMapGarden) startMapGarden.addEventListener('click', () => selectMap('garden'));

if (randomModeBtn) randomModeBtn.addEventListener('click', toggleRandomMode);
if (startRandomBtn) startRandomBtn.addEventListener('click', toggleRandomMode);

if (toastSwitchBtn) {
  toastSwitchBtn.addEventListener('click', () => {
    if (pendingToastMap && unlockedMaps[pendingToastMap]) {
      selectMap(pendingToastMap);
    }
    if (mapUnlockToast) mapUnlockToast.classList.remove('visible');
  });
}

const tutorialSlides = [
  { title: 'MOVE AND COLLECT', label: '1 / 6' },
  { title: 'SORT THE MESS', label: '2 / 6' },
  { title: 'FREEZE WHEN SAM LOOKS', label: '3 / 6' },
  { title: 'BLOCK THE LUNGE', label: '4 / 6' },
  { title: 'USE YOUR EMERGENCY ITEMS', label: '5 / 6' },
  { title: 'SURVIVE THE HAZARDS', label: '6 / 6' }
];
let tutorialSlideIndex = 0;

function drawTutorialSlide() {
  if (!tutorialSlideCanvas) return;
  const c = tutorialSlideCanvas.getContext('2d');
  const w = tutorialSlideCanvas.width;
  const h = tutorialSlideCanvas.height;
  c.clearRect(0, 0, w, h);
  c.fillStyle = '#171411';
  c.fillRect(0, 0, w, h);
  c.fillStyle = '#2c2622';
  c.fillRect(32, 32, w - 64, h - 64);
  c.strokeStyle = '#5b4b3b';
  c.lineWidth = 3;
  c.strokeRect(32, 32, w - 64, h - 64);
  c.textAlign = 'center';
  c.textBaseline = 'middle';

  const arrow = (x1, y1, x2, y2, color = '#facc15') => {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const ux = Math.cos(angle);
    const uy = Math.sin(angle);
    const px = -uy;
    const py = ux;
    const headLength = 18;
    const headWidth = 9;
    const baseX = x2 - ux * headLength;
    const baseY = y2 - uy * headLength;
    c.strokeStyle = color;
    c.fillStyle = color;
    c.lineWidth = 6;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(baseX, baseY);
    c.stroke();
    c.beginPath();
    c.moveTo(x2, y2);
    c.lineTo(baseX + px * headWidth, baseY + py * headWidth);
    c.lineTo(baseX - px * headWidth, baseY - py * headWidth);
    c.closePath();
    c.fill();
  };
  const bubble = (text, x, y, color = '#facc15') => {
    c.fillStyle = '#0c0a09';
    c.strokeStyle = color;
    c.lineWidth = 3;
    c.beginPath();
    c.roundRect(x - 100, y - 25, 200, 50, 8);
    c.fill();
    c.stroke();
    c.fillStyle = color;
    c.font = '900 18px "IBM Plex Mono", monospace';
    c.fillText(text, x, y);
  };
  const item = (x, y, type) => {
    const color =
      type === 'sock' ? 'rgba(249, 115, 22, 0.85)' :
      type === 'food' ? 'rgba(34, 197, 94, 0.85)' :
      type === 'cable' ? 'rgba(14, 165, 233, 0.85)' :
      type === 'stick' ? 'rgba(250, 204, 21, 0.85)' :
      'rgba(56, 189, 248, 0.85)';
    c.fillStyle = 'rgba(0, 0, 0, 0.25)';
    c.beginPath();
    c.ellipse(x, y + 31, 31, 8, 0, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = color;
    c.beginPath();
    c.arc(x, y, 28, 0, Math.PI * 2);
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.28)';
    c.lineWidth = 2;
    c.stroke();
    if (type === 'ice') {
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.roundRect(x - 12, y - 12, 24, 24, 5);
      c.fill();
      c.strokeStyle = '#fff';
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = '#bae6fd';
      c.fillRect(x - 8, y - 8, 12, 10);
      label('ICE', x, y + 3, '#0c4a6e');
      return;
    }
    if (type === 'bird') {
      c.fillStyle = '#f59e0b';
      c.beginPath();
      c.ellipse(x, y, 15, 11, -0.15, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#fbbf24';
      c.beginPath();
      c.moveTo(x - 2, y - 2);
      c.lineTo(x - 16, y - 12);
      c.lineTo(x - 9, y + 1);
      c.closePath();
      c.fill();
      c.fillStyle = '#0c0a09';
      c.beginPath();
      c.arc(x + 8, y - 4, 2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#ef4444';
      c.beginPath();
      c.moveTo(x + 15, y - 1);
      c.lineTo(x + 24, y + 3);
      c.lineTo(x + 15, y + 6);
      c.closePath();
      c.fill();
      return;
    }
    if (type === 'roomba') {
      c.fillStyle = '#475569';
      c.beginPath();
      c.arc(x, y, 17, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = '#cbd5e1';
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.arc(x, y, 5, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#0f172a';
      c.beginPath();
      c.arc(x - 10, y + 13, 3, 0, Math.PI * 2);
      c.arc(x + 10, y + 13, 3, 0, Math.PI * 2);
      c.fill();
      return;
    }
    const previousContext = ctx;
    const previousMap = currentMap;
    ctx = c;
    currentMap = 'bedroom';
    drawCustomItemGraphic(type, x, y, 1.15);
    ctx = previousContext;
    currentMap = previousMap;
  };
  const scene = () => {
    c.fillStyle = '#b7a58d';
    c.fillRect(80, 105, 600, 180);
    c.fillStyle = 'rgba(255,255,255,0.08)';
    c.fillRect(80, 105, 600, 38);
    c.strokeStyle = 'rgba(45,34,25,0.2)';
    c.lineWidth = 2;
    for (let x = 110; x < 680; x += 48) {
      c.beginPath();
      c.moveTo(x, 105);
      c.lineTo(x, 285);
      c.stroke();
    }
    for (let y = 145; y < 285; y += 35) {
      c.beginPath();
      c.moveTo(80, y);
      c.lineTo(680, y);
      c.stroke();
    }
    c.strokeStyle = '#6b5748';
    c.lineWidth = 3;
    c.strokeRect(80, 105, 600, 180);
  };
  const label = (text, x, y, color = '#f3ede2') => {
    c.fillStyle = color;
    c.font = '700 15px "IBM Plex Mono", monospace';
    c.fillText(text, x, y);
  };
  const cleaner = (x, y, scale = 1.8) => {
    c.save();
    c.translate(x, y);
    c.scale(scale, scale);
    drawPlayerOutfitBody(c, getEquippedOutfitObj(), { facingAngle: Math.PI / 2 });
    c.restore();
  };
  const samFace = (x, y, mode = 'SLEEPING') => drawGenericSamFace(c, x, y, 64, mode);

  if (tutorialSlideIndex === 0) {
    scene();
    item(240, 190, 'sock');
    item(460, 190, 'food');
    cleaner(180, 260, 1.6);
    arrow(225, 245, 431, 197);
    bubble('WASD / ARROWS', 240, 92, '#38bdf8');
    label('PICK UP', 240, 248, '#fff');
    c.font = '700 19px "Space Grotesk", sans-serif';
    c.fillText('Walk over an item to pick it up', 380, 325);
  } else if (tutorialSlideIndex === 1) {
    scene();
    item(220, 190, 'sock');
    c.fillStyle = '#d97706';
    c.fillRect(530, 145, 80, 90);
    c.fillStyle = '#fbbf24';
    c.fillRect(522, 136, 96, 14);
    c.fillStyle = '#fff';
    c.font = '700 14px "IBM Plex Mono", monospace';
    c.fillText('BIN', 570, 190);
    label('MATCH', 570, 260, '#34d399');
    cleaner(340, 220, 1.6);
    arrow(385, 210, 522, 190, '#34d399');
    bubble('DROP IT IN', 570, 92, '#34d399');
    c.font = '700 19px "Space Grotesk", sans-serif';
    c.fillText('Carry each item to its matching container', 380, 325);
  } else if (tutorialSlideIndex === 2) {
    scene();
    samFace(555, 190, 'WARNING');
    c.strokeStyle = 'rgba(239,68,68,0.65)';
    c.lineWidth = 24;
    c.beginPath();
    c.moveTo(500, 190);
    c.lineTo(250, 190);
    c.stroke();
    c.strokeStyle = 'rgba(239,68,68,0.9)';
    c.lineWidth = 3;
    c.setLineDash([8, 8]);
    c.beginPath();
    c.moveTo(500, 155);
    c.lineTo(250, 155);
    c.stroke();
    c.setLineDash([]);
    cleaner(170, 245, 1.6);
    bubble('STOP MOVING', 275, 92, '#ef4444');
    c.font = '700 19px "Space Grotesk", sans-serif';
    c.fillText('When Sam looks, freeze outside the red zone', 380, 325);
  } else if (tutorialSlideIndex === 3) {
    scene();
    samFace(555, 190, 'AWAKE');
    c.strokeStyle = '#38bdf8';
    c.lineWidth = 8;
    c.beginPath();
    c.arc(300, 205, 58, 0, Math.PI * 2);
    c.stroke();
    c.strokeStyle = 'rgba(56,189,248,0.25)';
    c.lineWidth = 18;
    c.beginPath();
    c.arc(300, 205, 58, 0, Math.PI * 2);
    c.stroke();
    cleaner(300, 205, 1.6);
    bubble('SPACE', 300, 92, '#38bdf8');
    c.font = '700 19px "Space Grotesk", sans-serif';
    c.fillText('Press SPACE inside the timing ring to use a shield', 380, 325);
  } else if (tutorialSlideIndex === 4) {
    scene();
    item(240, 195, 'ice');
    item(520, 195, 'stick');
    cleaner(380, 250, 1.6);
    arrow(350, 220, 266, 202, '#38bdf8');
    arrow(410, 220, 494, 202, '#facc15');
    bubble('ICE = FREEZE', 240, 92, '#38bdf8');
    bubble('E = STICK', 520, 92, '#facc15');
    c.font = '700 19px "Space Grotesk", sans-serif';
    c.fillText('Run to ice or use the stick when Sam lunges', 380, 325);
  } else {
    scene();
    cleaner(380, 225, 1.6);
    item(205, 185, 'bird');
    item(555, 185, 'roomba');
    arrow(238, 188, 340, 212, '#f59e0b');
    arrow(522, 188, 420, 212, '#38bdf8');
    bubble('SPACE TO SHOO', 205, 92, '#f59e0b');
    bubble('WATCH ROOMBA', 555, 92, '#38bdf8');
    c.font = '700 19px "Space Grotesk", sans-serif';
    c.fillText('Birds fling your items (drop the item to prevent this) and the roomba flings you!', 380, 325);
  }

  if (tutorialSlideTitle) tutorialSlideTitle.textContent = tutorialSlides[tutorialSlideIndex].title;
  if (tutorialSlideStep) tutorialSlideStep.textContent = tutorialSlides[tutorialSlideIndex].label;
  if (tutorialDots) {
    tutorialDots.innerHTML = tutorialSlides.map((_, index) =>
      `<button class="tutorial-dot ${index === tutorialSlideIndex ? 'active' : ''}" type="button" aria-label="Tutorial slide ${index + 1}" data-tutorial-slide="${index}"></button>`
    ).join('');
    tutorialDots.querySelectorAll('[data-tutorial-slide]').forEach((dot) => {
      dot.addEventListener('click', () => {
        tutorialSlideIndex = Number(dot.dataset.tutorialSlide);
        drawTutorialSlide();
      });
    });
  }
  if (tutorialPrevBtn) tutorialPrevBtn.disabled = tutorialSlideIndex === 0;
  if (tutorialNextBtn) tutorialNextBtn.textContent = tutorialSlideIndex === tutorialSlides.length - 1 ? 'DONE →' : 'NEXT →';
}

// Tutorial & Achievements Sub-Modals on Full-Screen Start Menu
if (openTutorialBtn && tutorialModal) {
  openTutorialBtn.addEventListener('click', () => {
    tutorialSlideIndex = 0;
    drawTutorialSlide();
    tutorialModal.classList.add('active');
  });
}
if (closeTutorialBtn && tutorialModal) {
  closeTutorialBtn.addEventListener('click', () => tutorialModal.classList.remove('active'));
}
if (gotItTutorialBtn && tutorialModal) {
  gotItTutorialBtn.addEventListener('click', () => tutorialModal.classList.remove('active'));
}
if (tutorialPrevBtn) {
  tutorialPrevBtn.addEventListener('click', () => {
    tutorialSlideIndex = Math.max(0, tutorialSlideIndex - 1);
    drawTutorialSlide();
  });
}
if (tutorialNextBtn) {
  tutorialNextBtn.addEventListener('click', () => {
    if (tutorialSlideIndex >= tutorialSlides.length - 1) {
      tutorialModal?.classList.remove('active');
      return;
    }
    tutorialSlideIndex++;
    drawTutorialSlide();
  });
}

if (openAchievementsBtn && achievementsModal) {
  openAchievementsBtn.addEventListener('click', () => {
    renderAchievementsUI();
    achievementsModal.classList.add('active');
  });
}
if (closeAchievementsBtn && achievementsModal) {
  closeAchievementsBtn.addEventListener('click', () => achievementsModal.classList.remove('active'));
}
if (doneAchievementsBtn && achievementsModal) {
  doneAchievementsBtn.addEventListener('click', () => achievementsModal.classList.remove('active'));
}

if (openOutfitsBtn && outfitsModal) {
  openOutfitsBtn.addEventListener('click', () => {
    renderWardrobeUI();
    outfitsModal.classList.add('active');
  });
}
if (closeOutfitsBtn && outfitsModal) {
  closeOutfitsBtn.addEventListener('click', () => outfitsModal.classList.remove('active'));
}
if (doneOutfitsBtn && outfitsModal) {
  doneOutfitsBtn.addEventListener('click', () => outfitsModal.classList.remove('active'));
}

if (menuBtn) menuBtn.addEventListener('click', openMainMenu);
if (gameoverMenuBtn) gameoverMenuBtn.addEventListener('click', openMainMenu);

// Mobile hamburger: whole HUD bar collapses to one button top-right.
// Panel holds the same MAIN MENU / SOUND / RESTART buttons, stacked.
function closeHudMenu() {
  if (hudBar) hudBar.classList.remove('hud-menu-open');
  if (hudMenuToggle) hudMenuToggle.setAttribute('aria-expanded', 'false');
}
if (hudMenuToggle && hudBar) {
  hudMenuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = hudBar.classList.toggle('hud-menu-open');
    hudMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });
}
document.addEventListener('click', (e) => {
  if (!hudBar || !hudBar.classList.contains('hud-menu-open')) return;
  if (hudBar.contains(e.target)) return;
  closeHudMenu();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeHudMenu();
});
[menuBtn, muteBtn, restartBtn].forEach((btn) => {
  if (btn) btn.addEventListener('click', closeHudMenu);
});

startBtn.addEventListener('click', startGame);
retryBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function toggleSound() {
  initAudio();
  isMuted = !isMuted;
  try { localStorage.setItem(MUTED_KEY, isMuted ? '1' : '0'); } catch (e) {}
  if (isMuted) stopVacuumSound();
  applyVolume(); syncSettingsUI();
}
if (muteBtn) muteBtn.addEventListener('click', toggleSound);
if (settingsMuteBtn) settingsMuteBtn.addEventListener('click', toggleSound);
if (openSettingsBtn && settingsModal) {
  openSettingsBtn.addEventListener('click', () => { initAudio(); syncSettingsUI(); settingsModal.classList.add('active'); });
}
if (closeSettingsBtn && settingsModal) closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('active'));
if (doneSettingsBtn && settingsModal) doneSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('active'));
if (settingsVolumeSlider) settingsVolumeSlider.addEventListener('input', () => { initAudio(); setVolume(parseInt(settingsVolumeSlider.value, 10) / 100); });
document.querySelectorAll('.controls-mode-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.controlsMode;
    if (mode !== 'auto' && mode !== 'on' && mode !== 'off') return;
    touchControlsMode = mode;
    try { localStorage.setItem(CONTROLS_MODE_KEY, mode); } catch (e) {}
    applyTouchControlsMode();
  });
});
function updateJoystickFromEvent(e) {
  if (!joystickBase || !joystickKnob) return;
  const rect = joystickBase.getBoundingClientRect();
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  let dx = (e.clientX - cx) / (rect.width / 2), dy = (e.clientY - cy) / (rect.height / 2);
  const len = Math.hypot(dx, dy);
  if (len > 1) { dx /= len; dy /= len; }
  touchJoystick.dx = dx; touchJoystick.dy = dy;
  joystickKnob.style.transform = `translate(calc(-50% + ${dx * 32}px), calc(-50% + ${dy * 32}px))`;
}
function resetJoystick() {
  touchJoystick.active = false; touchJoystick.pointerId = null; touchJoystick.dx = 0; touchJoystick.dy = 0;
  if (joystickKnob) joystickKnob.style.transform = 'translate(-50%, -50%)';
}
if (joystickZone) {
  joystickZone.addEventListener('pointerdown', (e) => { e.preventDefault(); try { joystickZone.setPointerCapture(e.pointerId); } catch (err) {} touchJoystick.active = true; touchJoystick.pointerId = e.pointerId; updateJoystickFromEvent(e); });
  joystickZone.addEventListener('pointermove', (e) => { if (!touchJoystick.active || e.pointerId !== touchJoystick.pointerId) return; e.preventDefault(); updateJoystickFromEvent(e); });
  const endJoystick = (e) => { if (e.pointerId !== touchJoystick.pointerId) return; resetJoystick(); };
  joystickZone.addEventListener('pointerup', endJoystick);
  joystickZone.addEventListener('pointercancel', endJoystick);
}
function bindTouchButton(btn, handler) {
  if (!btn) return;
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); btn.classList.add('touch-pressed'); handler(); });
  const release = () => btn.classList.remove('touch-pressed');
  btn.addEventListener('pointerup', release); btn.addEventListener('pointercancel', release); btn.addEventListener('pointerleave', release);
}
bindTouchButton(touchUseBtn, pressTouchUse);
bindTouchButton(touchDropBtn, pressTouchDrop);
if (touchControlsEl) touchControlsEl.addEventListener('contextmenu', (e) => e.preventDefault());

let cheatTriggerClicks = 0;
let cheatTriggerResetTimer = null;

function openCheatAuth() {
  cheatTriggerClicks = 0;
  if (cheatAuthError) cheatAuthError.textContent = '';
  if (cheatPasswordInput) cheatPasswordInput.value = '';
  if (cheatAuthModal) cheatAuthModal.classList.add('active');
  setTimeout(() => cheatPasswordInput?.focus(), 0);
}

function closeCheatModals() {
  cheatAuthModal?.classList.remove('active');
  cheatMenuModal?.classList.remove('active');
}

function saveCheatProgress() {
  try {
    localStorage.setItem(WALLET_KEY, String(walletCash));
    localStorage.setItem(OWNED_OUTFITS_KEY, JSON.stringify(ownedOutfits));
    localStorage.setItem(EQUIPPED_OUTFIT_KEY, equippedOutfit);
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlockedAchievements));
  } catch (error) {
    if (cheatStatus) cheatStatus.textContent = 'Could not save local progress.';
  }
  saveUnlockedMaps();
  updateWalletUI();
  updateMapSelectorUI();
  renderAchievementsUI();
  renderWardrobeUI();
}

function runCheatAction(action) {
  if (action === 'unlock-maps') {
    unlockedMaps = { bedroom: true, lounge: true, garden: true };
  } else if (action === 'lock-maps') {
    unlockedMaps = { bedroom: true, lounge: false, garden: false };
    if (currentMap !== 'bedroom') {
      applyMapConfig('bedroom');
      currentMap = 'bedroom';
    }
  } else if (action === 'unlock-achievements') {
    ACHIEVEMENTS.forEach((achievement) => {
      unlockedAchievements[achievement.id] = true;
    });
  } else if (action === 'clear-achievements') {
    unlockedAchievements = {};
  } else if (action === 'max-money') {
    walletCash = 99999;
  } else if (action === 'clear-money') {
    walletCash = 0;
  } else if (action === 'unlock-outfits') {
    OUTFITS.forEach((outfit) => {
      ownedOutfits[outfit.id] = true;
    });
  } else if (action === 'clear-outfits') {
    ownedOutfits = { default: true };
    equippedOutfit = 'default';
    selectedOutfitId = 'default';
  } else if (action === 'enforce-roomba') {
    if (gameState !== 'PLAYING') {
      startGame();
      closeCheatModals();
    }
    roomba.active = true;
    roomba.state = 'ROAMING';
    roomba.speed = 185;
    roomba.x = Math.max(175, Math.min(670, player.x + 120));
    roomba.y = Math.max(175, Math.min(665, player.y));
    const angle = Math.atan2(player.y - roomba.y, player.x - roomba.x);
    roomba.vx = Math.cos(angle) * roomba.speed;
    roomba.vy = Math.sin(angle) * roomba.speed;
    roomba.playerContactTimer = 0;
    playSound('roomba_reveal');
    startVacuumSound();
    spawnFloatingText('ROOMBA ENFORCED — WATCH YOUR ANKLES!', player.x, player.y - 42, '#facc15');
  } else if (action === 'toggle-cutscene-skip') {
    // Dev toggle for testing: flips ALL maps between first-watch
    // (none seen, nothing skippable) and can-skip (all seen). To test
    // one cutscene's first watch, reset all, then watch just that one.
    try {
      if (allCutscenesSeen()) {
        localStorage.removeItem(CUTSCENE_SEEN_KEY);
      } else {
        localStorage.setItem(CUTSCENE_SEEN_KEY, JSON.stringify({ bedroom: true, lounge: true, garden: true }));
      }
    } catch (e) {}
    updateCutsceneSkipLabel();
  } else if (action === 'equip-outfit') {
    const outfitId = cheatOutfitSelect?.value;
    if (!outfitId || !ownedOutfits[outfitId]) {
      if (cheatStatus) cheatStatus.textContent = 'UNLOCK OUTFITS BEFORE EQUIPPING ONE';
      return;
    }
    equippedOutfit = outfitId;
    selectedOutfitId = outfitId;
  } else {
    return;
  }

  saveCheatProgress();
  if (cheatStatus) {
    cheatStatus.textContent = `${action.replaceAll('-', ' ').toUpperCase()} APPLIED`;
  }
}

if (versionCheatTrigger) {
  versionCheatTrigger.addEventListener('click', () => {
    cheatTriggerClicks++;
    clearTimeout(cheatTriggerResetTimer);
    cheatTriggerResetTimer = setTimeout(() => {
      cheatTriggerClicks = 0;
    }, 1400);
    if (cheatTriggerClicks >= 5) openCheatAuth();
  });
}

if (closeCheatAuthBtn) closeCheatAuthBtn.addEventListener('click', closeCheatModals);
if (closeCheatMenuBtn) closeCheatMenuBtn.addEventListener('click', closeCheatModals);
if (cheatAuthForm) {
  cheatAuthForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const password = cheatPasswordInput?.value || '';
    let passwordHash = 2166136261;
    for (const character of password) {
      passwordHash ^= character.charCodeAt(0);
      passwordHash = Math.imul(passwordHash, 16777619);
    }
    if ((passwordHash >>> 0) === 2127252605) {
      cheatAuthModal?.classList.remove('active');
      cheatMenuModal?.classList.add('active');
      if (cheatAuthError) cheatAuthError.textContent = '';
    } else if (cheatAuthError) {
      cheatAuthError.textContent = 'INVALID PASSWORD';
    }
  });
}
document.querySelectorAll('[data-cheat-action]').forEach((button) => {
  button.addEventListener('click', () => runCheatAction(button.dataset.cheatAction));
});
// First-load: cutscene skip label + dev toggle reflect stored flag.
updateCutsceneSkipLabel();
if (cheatOutfitSelect) {
  OUTFITS.forEach((outfit) => {
    const option = document.createElement('option');
    option.value = outfit.id;
    option.textContent = outfit.name;
    cheatOutfitSelect.appendChild(option);
  });
}

renderMapThumbnails();
resetGame();
syncSettingsUI();
applyTouchControlsMode();
window.__DWS_MOBILE_WIRED = true;
window.addEventListener('resize', updateCompactLayout);
window.addEventListener('orientationchange', updateCompactLayout);
requestAnimationFrame(loop);
