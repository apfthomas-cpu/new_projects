// docs/js/scroll.js
import {
  getSession,
  saveSectionResult,
  getNextSectionId
} from "./session.js";

const session = getSession();

const scrollUserEl = document.getElementById("scrollUser");
const scrollTextEl = document.getElementById("scrollText");

// Show user info
if (session.user) {
  scrollUserEl.textContent = `${session.user.name} – ${session.user.className || ""}`;
} else {
  scrollUserEl.textContent = "Anonymous user";
}

// Prepare text: wrap each word in span.word
const rawHtml = scrollTextEl.innerHTML;
const tmpDiv = document.createElement("div");
tmpDiv.innerHTML = rawHtml;

let totalWords = 0;
let score = 0;

tmpDiv.querySelectorAll("p").forEach(p => {
  const words = p.innerText.split(/\s+/).filter(Boolean);
  totalWords += words.length;
  p.innerHTML = words
    .map(w => `<span class="word">${w}</span>`)
    .join(" ");
});

scrollTextEl.innerHTML = tmpDiv.innerHTML;

// Word click behaviour
scrollTextEl.querySelectorAll(".word").forEach(span => {
  span.addEventListener("click", () => {
    if (span.classList.contains("clicked")) return;
    span.classList.add("clicked");
    score++;
  });
});

// Basic scrolling
let position = 0;
let speed = 25; // pixels/sec
let lastTime = performance.now();
const wrapper = scrollTextEl.parentElement;

function setInitialPosition() {
  position = wrapper.offsetHeight;
  scrollTextEl.style.top = position + "px";
}
setInitialPosition();

function animate(t) {
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  position -= speed * delta;
  scrollTextEl.style.top = position + "px";

  const h = scrollTextEl.offsetHeight;
  if (position + h < 0) {
    endScrollSection();
    return;
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

function endScrollSection() {
  // Save section result; score out of totalWords
  saveSectionResult("scroll", {
    score,
    maxScore: totalWords,
    finishedAt: Date.now()
  });

  // Move to next section or results
  const nextId = getNextSectionId("scroll");
  if (nextId) {
    window.location.href = `instructions.html?section=${nextId}`;
  } else {
    window.location.href = "results.html";
  }
}
