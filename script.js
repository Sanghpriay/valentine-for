// ========= Customize =========
const PERSON_NAME = "sukhda";
const YES_IMAGE_URL = "us.jpg";      // your couple photo filename (in repo root) OR a gif URL
const SONG_FILE = "song.mp3";        // your mp3 filename (in repo root)

const MUSIC_VOLUME_TARGET = 0.6;     // 0.0 - 1.0
const MUSIC_FADE_IN_MS = 1200;       // fade-in duration
const MUSIC_FADE_OUT_MS = 900;       // fade-out duration
// ============================

// ---------- Elements ----------
const nameEl = document.getElementById("name");
const yayImg = document.getElementById("yayImg");

const screenAsk = document.getElementById("screenAsk");
const screenYay = document.getElementById("screenYay");
const screenPick = document.getElementById("screenPick");
const screenFinal = document.getElementById("screenFinal");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const hint = document.getElementById("hint");
const buttonsArea = document.getElementById("buttonsArea");

const nextBtn = document.getElementById("nextBtn");
const againBtn = document.getElementById("againBtn");
const copyBtn = document.getElementById("copyBtn");

const finalLine = document.getElementById("finalLine");
const finalMsg = document.getElementById("finalMsg");

// ---------- Inject/attach music element (so you don't have to edit HTML) ----------
let bgMusic = document.getElementById("bgMusic");
if (!bgMusic) {
  bgMusic = document.createElement("audio");
  bgMusic.id = "bgMusic";
  bgMusic.src = SONG_FILE;
  bgMusic.preload = "auto";
  bgMusic.loop = true;
  bgMusic.setAttribute("playsinline", "");
  document.body.appendChild(bgMusic);
} else {
  // If you already had an <audio> tag, ensure it points to your file
  bgMusic.src = bgMusic.getAttribute("src") || SONG_FILE;
  bgMusic.loop = true;
  bgMusic.preload = "auto";
  bgMusic.setAttribute("playsinline", "");
}

// ---------- Init ----------
nameEl.textContent = PERSON_NAME;
yayImg.src = YES_IMAGE_URL;

// ---------- Screen helpers ----------
function showOnly(which) {
  [screenAsk, screenYay, screenPick, screenFinal].forEach(el => el.classList.add("hidden"));
  which.classList.remove("hidden");
}

function fireConfetti(ms = 900) {
  if (typeof confetti !== "function") return;
  const end = Date.now() + ms;

  (function frame() {
    confetti({ particleCount: 7, spread: 70, origin: { y: 0.65 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

// ---------- Music (first-click reliable) ----------
let musicStarted = false;
let fadeRaf = null;

function cancelFade() {
  if (fadeRaf) cancelAnimationFrame(fadeRaf);
  fadeRaf = null;
}

window.addEventListener("load", () => {
  try { bgMusic.load(); } catch {}
});

// Arm audio on first user interaction (helps Safari/iOS + slow first load)
function armAudioOnce() {
  try {
    const prevMuted = bgMusic.muted;
    bgMusic.muted = true;

    const p = bgMusic.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        bgMusic.pause();
        bgMusic.currentTime = 0;
        bgMusic.muted = prevMuted;
      }).catch(() => {
        bgMusic.muted = prevMuted;
      });
    } else {
      bgMusic.muted = prevMuted;
    }
  } catch {}

  window.removeEventListener("pointerdown", armAudioOnce);
  window.removeEventListener("touchstart", armAudioOnce);
}
window.addEventListener("pointerdown", armAudioOnce, { once: true });
window.addEventListener("touchstart", armAudioOnce, { once: true });

async function startMusicWithFadeIn(targetVolume = MUSIC_VOLUME_TARGET, fadeMs = MUSIC_FADE_IN_MS) {
  cancelFade();

  bgMusic.muted = false;
  bgMusic.volume = 0;

  // Start playback FIRST (most important for first-click reliability)
  await bgMusic.play();

  const start = performance.now();
  function step(now) {
    const t = Math.min(1, (now - start) / fadeMs);
    bgMusic.volume = t * targetVolume;
    if (t < 1) fadeRaf = requestAnimationFrame(step);
    else fadeRaf = null;
  }
  fadeRaf = requestAnimationFrame(step);
}

function stopMusicInstant() {
  cancelFade();
  try { bgMusic.pause(); } catch {}
  try { bgMusic.currentTime = 0; } catch {}
  try { bgMusic.volume = 0; } catch {}
  musicStarted = false;
}

function stopMusicWithFadeOut(fadeMs = MUSIC_FADE_OUT_MS) {
  cancelFade();

  const startVol = Number.isFinite(bgMusic.volume) ? bgMusic.volume : 0;
  const start = performance.now();

  return new Promise((resolve) => {
    function step(now) {
      const t = Math.min(1, (now - start) / fadeMs);
      bgMusic.volume = Math.max(0, startVol * (1 - t));

      if (t < 1) {
        fadeRaf = requestAnimationFrame(step);
      } else {
        fadeRaf = null;
        try { bgMusic.pause(); } catch {}
        try { bgMusic.currentTime = 0; } catch {}
        try { bgMusic.volume = 0; } catch {}
        musicStarted = false;
        resolve();
      }
    }
    fadeRaf = requestAnimationFrame(step);
  });
}

// ---------- NO button dodge + shrink ----------
const DODGE_DISTANCE = 120;
let noClicks = 0;
let noScale = 1;

function updateHint(force = false) {
  const lines = [
    "“No” seems a bit shy 😈",
    "Sukhda… that button is kinda rude 😭",
    "Okay miss independent 😌",
    "I respect consent… but also… pls 🥺",
    "No button is malfunctioning (by design) 🧠",
    "Just hit YES and I’ll shut up forever (lie) 🤭",
    "Last warning: I will deploy more romance 💘"
  ];

  if (force) noClicks++;
  hint.textContent = lines[Math.min(noClicks, lines.length - 1)];

  // Shrink NO progressively (min size 55%)
  noScale = Math.max(0.55, 1 - noClicks * 0.08);
  noBtn.style.transform = `scale(${noScale})`;
}

function placeNoButtonRandomly(animate = true) {
  const areaRect = buttonsArea.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();

  const padding = 8;

  // YES position relative to buttonsArea
  const yes = {
    x: yesRect.left - areaRect.left,
    y: yesRect.top - areaRect.top,
    w: yesRect.width,
    h: yesRect.height
  };

  const maxX = areaRect.width - noRect.width - padding;
  const maxY = areaRect.height - noRect.height - padding;

  function overlapsYes(x, y) {
    const margin = 18;
    return !(
      x + noRect.width < yes.x - margin ||
      x > yes.x + yes.w + margin ||
      y + noRect.height < yes.y - margin ||
      y > yes.y + yes.h + margin
    );
  }

  let x, y, tries = 0;
  do {
    x = Math.max(padding, Math.random() * maxX);
    y = Math.max(padding, Math.random() * maxY);
    tries++;
  } while (overlapsYes(x, y) && tries < 50);

  noBtn.style.transition = animate ? "left 120ms ease, top 120ms ease, transform 120ms ease" : "none";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

// Initial placement after layout
window.addEventListener("load", () => {
  placeNoButtonRandomly(false);
  noBtn.style.transform = "scale(1)";
});
window.addEventListener("resize", () => placeNoButtonRandomly(false));

// Desktop dodge
buttonsArea.addEventListener("mousemove", (e) => {
  const btn = noBtn.getBoundingClientRect();
  const dx = e.clientX - (btn.left + btn.width / 2);
  const dy = e.clientY - (btn.top + btn.height / 2);
  const dist = Math.hypot(dx, dy);

  if (dist < DODGE_DISTANCE) {
    placeNoButtonRandomly(true);
    updateHint(false);
  }
});

// Mobile dodge
noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  placeNoButtonRandomly(true);
  updateHint(false);
}, { passive: false });

// If she somehow clicks NO
noBtn.addEventListener("click", () => {
  noClicks++;
  placeNoButtonRandomly(true);
  updateHint(true);
});

// ---------- YES flow (music first, then celebration) ----------
yesBtn.addEventListener("click", async () => {
  // Start music FIRST inside the click gesture (most reliable)
  if (!musicStarted) {
    try {
      await startMusicWithFadeIn(MUSIC_VOLUME_TARGET, MUSIC_FADE_IN_MS);
      musicStarted = true;
    } catch (e) {
      console.log("Music play() blocked/failed:", e);
      // If it fails, it will usually work on the next tap due to arming.
    }
  }

  showOnly(screenYay);
  fireConfetti(1000);
});

nextBtn.addEventListener("click", () => {
  showOnly(screenPick);
});

// ---------- Pick flow ----------
let chosen = "";
document.querySelectorAll(".choice").forEach(btn => {
  btn.addEventListener("click", () => {
    chosen = btn.dataset.choice || "A cute date 💘";
    showFinal(chosen);
  });
});

function showFinal(choice) {
  showOnly(screenFinal);
  fireConfetti(850);

  finalLine.textContent = `We’re doing: ${choice}`;
  finalMsg.textContent =
`SUKHDA 💘

You are officially my Valentine.
Plan selected: ${choice}

Dress code: cute.
Vibe: chaotic-good.
Snacks: mandatory.

Now say the word and I’ll plan the rest 😌`;
}

// ---------- Copy / Replay ----------
copyBtn.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(finalMsg.textContent);
    copyBtn.textContent = "Copied ✅";
    setTimeout(() => (copyBtn.textContent = "Copy this message"), 1200);
  } catch {
    const range = document.createRange();
    range.selectNodeContents(finalMsg);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    copyBtn.textContent = "Select + Copy manually ✅";
    setTimeout(() => (copyBtn.textContent = "Copy this message"), 1500);
  }
});

againBtn.addEventListener("click", async () => {
  // Fade out music like a movie moment ✨
  try {
    if (musicStarted) await stopMusicWithFadeOut(MUSIC_FADE_OUT_MS);
    else stopMusicInstant();
  } catch {
    stopMusicInstant();
  }

  // Reset UI + NO behavior
  chosen = "";
  noClicks = 0;
  noScale = 1;
  noBtn.style.transform = "scale(1)";
  hint.textContent = "“No” seems a bit shy 😈";
  showOnly(screenAsk);
  placeNoButtonRandomly(false);
});
