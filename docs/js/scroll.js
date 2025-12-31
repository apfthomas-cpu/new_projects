// ===============================
// SAFETY: DOM MUST EXIST
// ===============================
const scrollText = document.getElementById("scroll-text");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");

if (!scrollText || !statusEl || !scoreEl) {
  throw new Error("Required DOM elements missing");
}

// ===============================
// STATE
// ===============================
let position = 0;
let speed = 35;
let lastTime = performance.now();
let score = 0;

// ===============================
// TEXT LOAD (TEMP STATIC — SAFE)
// ===============================
const text =
  "Yet beyond philosophy, religion, and science, meaning often emerges in the everyday. " +
  "It is found in relationships, in the bonds of family and friendship, in acts of kindness, " +
  "and in the pursuit of passions. Viktor Frankl argued that even in suffering, meaning can be found.";

// ===============================
// HELPERS
// ===============================
function wrapWords(t) {
  return t
    .split(/\s+/)
    .map(w => `<span class="word">${w}</span>`)
    .join(" ");
}

function enableClicks() {
  document.querySelectorAll(".word").forEach(word => {
    word.addEventListener("click", () => {
      if (word.classList.contains("clicked")) return;
      word.classList.add("clicked");
      score++;
      scoreEl.textContent = score;
    });
  });
}

// ===============================
// INIT
// ===============================
scrollText.innerHTML = wrapWords(text);
enableClicks();

statusEl.textContent = "Scroll started";

// start BELOW container
const wrapper = scrollText.parentElement;
position = wrapper.offsetHeight;
scrollText.style.top = position + "px";

// ===============================
// SCROLL LOOP
// ===============================
function loop(t) {
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  position -= speed * delta;
  scrollText.style.top = position + "px";

  if (position + scrollText.offsetHeight < 0) {
    statusEl.textContent = "Section complete";
    return;
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
