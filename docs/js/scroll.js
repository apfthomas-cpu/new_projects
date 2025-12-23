const startBtn = document.getElementById("startBtn");
const intro = document.getElementById("intro");
const exercise = document.getElementById("exercise");
const scrollText = document.getElementById("scrollText");
const wrapper = document.getElementById("scroll-wrapper");

/* Mistakes list */
const mistakes = [
  "Apples","are","are","wite","eligance","presision","tecnology",
  "familys","acheiving","rely","There","flogship","Samsungs",
  "fice","markting","importants","Ultimitely"
];

let position = 0;
let lastTime = performance.now();

/* 🔽 HALVED SPEED SETTINGS */
let pixelsPerSecond = 6.25;   // was ~12.5
let targetSpeed = 6.25;       // was ~12.5
const speedBoost = 3;        // was ~6

let running = false;

/* Wrap words */
function prepareWords() {
  scrollText.querySelectorAll("p").forEach(p => {
    p.innerHTML = p.innerText
      .split(" ")
      .map(w => `<span class="word">${w}</span>`)
      .join(" ");
  });

  document.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => handleWordClick(span));
  });
}

/* Handle clicks → bold + slower boost */
function handleWordClick(span) {
  if (!running) return;

  const clean = span.innerText.replace(/[^\w’']/g, "");

  if (mistakes.includes(clean)) {
    if (!span.classList.contains("found")) {
      span.classList.add("found");
      targetSpeed += speedBoost; // 🔼 slower increase
    }
  }
}

/* Start */
startBtn.addEventListener("click", () => {
  intro.classList.add("hidden");
  exercise.classList.remove("hidden");
  prepareWords();
  running = true;

  position = wrapper.clientHeight * 0.5;
  scrollText.style.top = position + "px";
});

/* Smooth scroll loop */
function scrollLoop(t) {
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  if (running) {
    pixelsPerSecond += (targetSpeed - pixelsPerSecond) * 0.04;
    position -= pixelsPerSecond * delta;
    scrollText.style.top = position + "px";
  }

  requestAnimationFrame(scrollLoop);
}
requestAnimationFrame(scrollLoop);
