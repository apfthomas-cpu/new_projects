const startBtn = document.getElementById("startBtn");
const intro = document.getElementById("intro");
const exercise = document.getElementById("exercise");
const scrollText = document.getElementById("scrollText");
const wrapper = document.getElementById("scroll-wrapper");

/* Mistakes list from original file */
const mistakes = [
  "Apples","are","are","wite","eligance","presision","tecnology",
  "familys","acheiving","rely","There","flogship","Samsungs",
  "fice","markting","importants","Ultimitely"
];

let position = 0;
let lastTime = performance.now();
let pixelsPerSecond = 12.5;
let targetSpeed = 12.5;
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

/* Handle clicks → bold + speed up */
function handleWordClick(span) {
  if (!running) return;

  const clean = span.innerText.replace(/[^\w’']/g, "");

  if (mistakes.includes(clean)) {
    if (!span.classList.contains("found")) {
      span.classList.add("found");
      targetSpeed += 6; // same boost as original
    }
  }
}

/* Start */
startBtn.addEventListener("click", () => {
  intro.classList.add("hidden");
  exercise.classList.remove("hidden");
  prepareWords();
  running = true;

  requestAnimationFrame(() => {
    position = wrapper.clientHeight * 0.5;
    scrollText.style.top = position + "px";
  });
});

/* Scroll loop with smoothing */
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
