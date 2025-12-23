import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const scrollContent = document.getElementById("scrollContent");
const scoreEl = document.getElementById("score");
const titleEl = document.getElementById("scrollTitle");
const endOverlay = document.getElementById("endOverlay");
const continueBtn = document.getElementById("continueBtn");
const wrapper = document.querySelector(".scroll-window");

let score = 0;
let mistakes = [];

let position = 0;
let lastTime = performance.now();

let pixelsPerSecond = 14;
let targetSpeed = 14;
let boostAmount = 5;

let started = false;
let ended = false;

/* =========================
   Load from Firestore
========================= */

async function loadScrollSection() {
  titleEl.textContent = "Loading...";

  try {
    const q = query(
      collection(db, "scroll_sections"),
      where("active", "==", true)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("No active scroll sections found.");
    }

    const sections = snap.docs.map(d => d.data());
    const chosen = sections[Math.floor(Math.random() * sections.length)];

    titleEl.textContent = chosen.title || "Scrolling Exercise";
    scrollContent.innerHTML = chosen.text || "<p>No text provided.</p>";
    mistakes = chosen.mistakes || [];

    pixelsPerSecond = Number(chosen.baseSpeed ?? 14);
    targetSpeed = pixelsPerSecond;
    boostAmount = Number(chosen.boostSpeed ?? 5);

    prepareText();
    startScroll();

  } catch (err) {
    console.error("Failed to load scroll section:", err);
    titleEl.textContent = "Error loading section";
    scrollContent.innerHTML = "<p>Unable to load scrolling text.</p>";
  }
}

/* =========================
   Prepare clickable words
========================= */

function prepareText() {
  scrollContent.querySelectorAll("p").forEach(p => {
    p.innerHTML = p.innerText
      .split(" ")
      .map(w => `<span class="word">${w}</span>`)
      .join(" ");
  });

  scrollContent.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (!started || ended) return;

      const clean = span.innerText.replace(/[^\w’']/g, "");

      // Always bold when clicked
      span.classList.add("selected");

      // Only correct mistakes affect score + speed
      if (mistakes.includes(clean)) {
        if (!span.classList.contains("correct")) {
          span.classList.add("correct");
          score++;
          scoreEl.textContent = `Score: ${score}`;
          targetSpeed += boostAmount;
        }
      }
    });
  });
}

/* =========================
   Start scrolling
========================= */

function startScroll() {
  requestAnimationFrame(() => {
    position = wrapper.clientHeight;
    scrollContent.style.top = position + "px";
    started = true;
  });
}

/* =========================
   Animation loop
========================= */

function scrollLoop(t) {
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  if (started && !ended) {
    pixelsPerSecond += (targetSpeed - pixelsPerSecond) * 0.05;
    position -= pixelsPerSecond * delta;
    scrollContent.style.top = position + "px";

    const h = scrollContent.offsetHeight;
    if (position + h <= 0) {
      ended = true;
      endOverlay.classList.remove("hidden");
    }
  }

  requestAnimationFrame(scrollLoop);
}

/* =========================
   Continue button
========================= */

continueBtn.addEventListener("click", () => {
  // TODO: replace with your next section URL later
  window.location.href = "#";
});

/* =========================
   Init
========================= */

scoreEl.textContent = "Score: 0";
loadScrollSection();
requestAnimationFrame(scrollLoop);
