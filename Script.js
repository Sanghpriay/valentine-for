// ========= Customize =========
const PERSON_NAME = "sukhda";
const YES_IMAGE_URL = "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif";
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

// ---------- NO button dodge ----------
const DODGE_DISTANCE = 120;
let noClicks = 0;

function placeNoButtonRandomly(animate = true) {
  const areaRect = buttonsArea.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();

  const padding = 8;
  const maxX = areaRect.width - btnRect.width - padding;
  const maxY = areaRect.height - btnRect.height - padding;

  const x = Math.max(padding, Math.random() * maxX);
  const y = Math.max(padding, Math.random() * maxY);

  noBtn.style.transition = animate ? "left 120ms ease, top 120ms ease" : "none";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

// initial placement after layout
window.addEventListener("load", () => placeNoButtonRandomly(false));
window.addEventListener("resize", () => placeNoButtonRandomly(false));

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
}

buttonsArea.addEventListener("mousemove", (e) => {
  const btn = noBtn.getBoundingClientRect();
  const dx = e.clientX - (btn.left + btn.width / 2);
  const dy = e.clientY - (btn.top + btn.height / 2);
  const dist = Math.hypot(dx, dy);

  if (dist < DODGE_DISTANCE) {
    placeNoButtonRandomly(true);
    updateHint();
  }
});

noBtn.addEventListener("touchstart", (e) => {
  e.preventDefault();
  placeNoButtonRandomly(true);
  updateHint();
}, { passive: false });

noBtn.addEventListener("click", () => {
  noClicks++;
  placeNoButtonRandomly(true);
  updateHint(true);
});

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
    // fallback: select text
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
  hint.textContent = "“No” seems a bit shy 😈";
  showOnly(screenAsk);
  placeNoButtonRandomly(false);
});
