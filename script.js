// ========= Customize =========
const PERSON_NAME = "sukhda";
const YES_IMAGE_URL = "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif";
// If you uploaded your own photo to the repo, use:
// const YES_IMAGE_URL = "photo.jpg";
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

nameEl.textContent = PERSON_NAME;
yayImg.src = YES_IMAGE_URL;

// ---------- NO button dodge + shrink ----------
const DODGE_DISTANCE = 120;
let noClicks = 0;
let noScale = 1;

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

  // Shrink the NO button progressively (min size 55%)
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

  // Avoid overlapping YES (with extra margin)
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

  // NOTE: Keep transition for left/top in CSS, but this supports older versions too
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

// ---------- YES flow ----------
yesBtn.addEventListener("click", () => {
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

againBtn.addEventListener("click", () => {
  // reset
  chosen = "";
  noClicks = 0;
  noScale = 1;
  noBtn.style.transform = "scale(1)";
  hint.textContent = "“No” seems a bit shy 😈";
  showOnly(screenAsk);
  placeNoButtonRandomly(false);
});
