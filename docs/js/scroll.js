const startBtn = document.getElementById("startBtn");
const intro = document.getElementById("intro");
const exercise = document.getElementById("exercise");
const scrollText = document.getElementById("scrollText");

/* 👉 List of mistake words */
const mistakes = [
  "Apples","are","wite","elegance","presision","Samsungs",
  "flogship","tecnology","familys","acheiving",
  "There","markting","importants","Ultimitely"
];

let speed = 0.35;
let pos = -100;
let running = false;

/* Wrap every word in spans */
function prepareWords() {
  const paragraphs = scrollText.querySelectorAll("p");

  paragraphs.forEach(p => {
    const words = p.innerText.split(" ");
    p.innerHTML = words
      .map(w => `<span class="word">${w}</span>`)
      .join(" ");
  });

  document.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => handleWordClick(span));
  });
}

/* Handle clicks */
function handleWordClick(span) {
  if (!running) return;

  const clean = span.innerText.replace(/[^\w’']/g, "");

  if (mistakes.includes(clean)) {
    if (!span.classList.contains("found")) {
      span.classList.add("found");
      speed += 0.15; // 🔼 increase scroll speed
    }
  }
}

/* Start scrolling */
startBtn.addEventListener("click", () => {
  intro.classList.add("hidden");
  exercise.classList.remove("hidden");
  prepareWords();
  running = true;
  requestAnimationFrame(scrollLoop);
});

/* Scroll animation loop */
function scrollLoop() {
  if (!running) return;
  pos += speed;
  scrollText.style.bottom = pos + "%";
  requestAnimationFrame(scrollLoop);
}
