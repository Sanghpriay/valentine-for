// ========= Customize =========
const PERSON_NAME = "sukhda";
const YES_IMAGE_URL = "us.jpg"; // or "photo.jpg" or a gif URL
const MUSIC_VOLUME_TARGET = 0.6; // 0.0 - 1.0
const MUSIC_FADE_IN_MS = 1200;   // fade-in duration
const MUSIC_FADE_OUT_MS = 900;   // fade-out duration
// ============================

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

// Music
const bgMusic = document.getElementById("bgMusic");
let musicStarted = false;
let fadeRaf = null;

function cancelFade() {
  if (fadeRaf) cancelAnimationFrame(fadeRaf);
  fadeRaf = null;
}

// Try to load ASAP (helps first-click start)
window.addEventListener("load", () => {
  if (!bgMusic) return;
  try { bgMusic.load(); } catch {}
});

// “Arm” audio on first interaction (iOS/Safari friendly).
// This makes the very first YES click succeed much more often.
function armAudioOnce() {
  if (!bgMusic) return;
  // play muted for a split second (counts as user gesture), then pause
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
  window.removeEventListener("pointerdown", armAudioOnce);
  window.removeEventListener("touchstart", armAudioOnce);
}
window.addEventListener("pointerdown", armAudioOnce, { once: true });
window.addEventListener("touchstart", armAudioOnce, { once: true });

async function startMusicWithFadeIn(targetVolume = 0.6, fadeMs = 1200) {
  if (!bgMusic) return;

  cancelFade();

  bgMusic.muted = false;
  bgMusic.currentTime = 0;     // always start from beginning
  bgMusic.volume = 0;

  // IMPORTANT: start playback immediately (before other UI work)
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

// ✅ Replace your existing YES handler with this:
yesBtn.addEventListener("click", async () => {
  // Start music FIRST so it counts cleanly as part of the click gesture
  if (!musicStarted) {
    try {
      await startMusicWithFadeIn(0.6, 1200);
      musicStarted = true;
    } catch (e) {
      // If it fails, it’ll usually work on the next tap (but this reduces that a lot)
      console.log("Music blocked/failed:", e);
    }
  }

  // Then do the UI celebration
  showOnly(screenYay);
  fireConfetti(1000);
});


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
  const idx = Math.min(noClicks, lines.length - 1);
  hint.textContent = lines[idx];

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

  let x, y;
  let tries = 0;

  do {
    x = Math.max(padding, Math.random() * maxX);
    y = Math.max(padding, Math.random() * maxY);
    tries++;
  } while (overlapsYes(x, y) && tries < 50);

  noBtn.style.transition = animate ? "left 120ms ease, top 120ms ease, transform 120ms ease" : "none";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

// initial placement after layout
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

// ---------- YES flow (starts music + fades in) ----------
yesBtn.addEventListener("click", async () => {
  showOnly(screenYay);
  fireConfetti(1000);

  if (!musicStarted && bgMusic) {
    try {
      await playMusicWithFadeIn(MUSIC_VOLUME_TARGET, MUSIC_FADE_IN_MS);
      musicStarted = true;
    } catch {
      // If a browser blocks it (rare since YES is a click), it will play next interaction.
      musicStarted = false;
    }
  }
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
  const msg =
`SUKHDA 💘

You are officially my Valentine.
Plan selected: ${choice}

Dress code: cute.
Vibe: chaotic-good.
Snacks: mandatory.

Now say the word and I’ll plan the rest 😌`;

  finalMsg.textContent = msg;
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
  // fade out music like a movie moment ✨
  try {
    if (musicStarted) {
      await stopMusicWithFadeOut(MUSIC_FADE_OUT_MS);
    } else {
      stopMusicInstant();
    }
  } catch {
    stopMusicInstant();
  }

  // reset UI + NO behavior
  chosen = "";
  noClicks = 0;
  noScale = 1;
  noBtn.style.transform = "scale(1)";
  hint.textContent = "“No” seems a bit shy 😈";
  showOnly(screenAsk);
  placeNoButtonRandomly(false);
});

