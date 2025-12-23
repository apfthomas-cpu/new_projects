const startBtn = document.getElementById("startBtn");
const introPanel = document.getElementById("introPanel");
const scrollPanel = document.getElementById("scrollPanel");
const scrollContent = document.getElementById("scrollContent");
const viewport = document.getElementById("scrollViewport");

// === TEXT WITH MISTAKES ===
// Wrap mistakes in * * so we can mark them
const rawText = `
This is an example of a scrolling text where some words are incorret and
others are absolutly fine. The purpos of this excercise is to identifie
mistakes while the paragraf continues to move upwards across the screen.
Clicking on any word will make it bold, but only the wrong ones increase
the speeed of the scrolling text.
`;

// === CONFIG (¼ faster) ===
let baseSpeed = 0.3 * 1.25;      // was 0.3 → now +25%
let speed = baseSpeed;
let speedBoost = 0.12 * 1.25;   // was 0.12 → now +25%

let y = 0;
let lastTime = null;

// Mistakes list must match wrong words in text
const mistakes = [
  "incorret",
  "absolutly",
  "purpos",
  "excercise",
  "identifie",
  "paragraf",
  "speeed"
];

// === Build content ===
function buildContent() {
  const words = rawText.split(/\s+/);

  scrollContent.innerHTML = words.map(w => {
    const clean = w.replace(/[^\w]/g, "");
    const isMistake = mistakes.includes(clean);
    return `<span class="word${isMistake ? " mistake" : ""}" data-word="${clean}">${w}</span> `;
  }).join("");

  y = viewport.offsetHeight;
  scrollContent.style.top = y + "px";
}

buildContent();

// === Click handling ===
scrollContent.addEventListener("click", (e) => {
  if (!e.target.classList.contains("word")) return;

  const span = e.target;
  if (span.classList.contains("clicked")) return;

  span.classList.add("clicked");

  if (span.classList.contains("mistake")) {
    speed += speedBoost;
  }
});

// === Smooth scrolling loop ===
function animate(time) {
  if (!lastTime) lastTime = time;
  const delta = (time - lastTime) / 16.67; // normalize to ~60fps
  lastTime = time;

  y -= speed * delta;
  scrollContent.style.top = y + "px";

  if (y + scrollContent.offsetHeight < 0) {
    y = viewport.offsetHeight;
    speed = baseSpeed;
    lastTime = null;
    document.querySelectorAll(".word").forEach(w => w.classList.remove("clicked"));
  }

  requestAnimationFrame(animate);
}

// === Start ===
startBtn.addEventListener("click", () => {
  introPanel.classList.remove("fade-in");
  introPanel.classList.add("fade-out");

  setTimeout(() => {
    introPanel.style.display = "none";
    scrollPanel.classList.remove("hidden");
    requestAnimationFrame(animate);
  }, 400);
});
