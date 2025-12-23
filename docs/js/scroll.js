// docs/js/scroll.js

import { db } from "./firebase.js";
import { collection, getDocs, query, where } 
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// =======================
// DOM elements
// =======================
const scrollContent = document.getElementById("scrollContent");
const scrollWindow  = document.querySelector(".scroll-window");
const scoreEl       = document.getElementById("score");
const titleEl       = document.getElementById("scrollTitle");

// =======================
// State
// =======================
let mistakes = [];
let score = 0;

let position = 0;
let lastTime = performance.now();

let pixelsPerSecond = 14;
let targetSpeed     = 14;
let boostSpeed      = 6;

let started = false;
let ended   = false;

// =======================
// Load from Firestore
// =======================
async function loadScrollFromFirebase() {
  try {
    const q = query(
      collection(db, "scroll_sections"),
      where("active", "==", true)
    );

    const snapshot = await getDocs(q);
    const docs = snapshot.docs.map(d => d.data());

    if (!docs.length) throw new Error("No active scroll sections found");

    // Pick one at random
    const chosen = docs[Math.floor(Math.random() * docs.length)];

    titleEl.textContent = chosen.title || "Scrolling Exercise";
    scrollContent.innerHTML = chosen.text || "";
    mistakes = chosen.mistakes || [];
    pixelsPerSecond = chosen.baseSpeed || 14;
    targetSpeed     = pixelsPerSecond;
    boostSpeed      = chosen.boostSpeed || 6;

    prepareWords();
    startScroll();

  } catch (err) {
    console.error("Firebase load failed:", err);

    // Fallback demo text
    titleEl.textContent = "Demo Text";
    scrollContent.innerHTML = `
      <p>This is a demo scrolling passage with a mistake in the text to click.</p>
      <p>The exercise will still scroll even if Firebase fails to load.</p>
    `;
    mistakes = ["mistake"];
    prepareWords();
    startScroll();
  }
}

// =======================
// Prepare clickable words
// =======================
function prepareWords() {
  scrollContent.querySelectorAll("p").forEach(p => {
    p.innerHTML = p.innerText
      .split(" ")
      .map(w => `<span class="word">${w}</span>`)
      .join(" ");
  });

  document.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (!started || ended) return;

      const clean = span.innerText.replace(/[^\w’']/g, "");

      if (mistakes.includes(clean)) {
        if (!span.classList.contains("correct")) {
          span.classList.add("correct");
          score++;
          scoreEl.textContent = `Score: ${score}`;

          // Speed boost
          targetSpeed += boostSpeed;
        }
      } else {
        span.classList.add("incorrect");
      }
    });
  });
}

// =======================
// Start scroll
// =======================
function startScroll() {
  requestAnimationFrame(() => {
    position = scrollWindow.clientHeight;
    scrollContent.style.top = position + "px";
    started = true;
  });
}

// =======================
// Scroll loop (smooth)
// =======================
function scrollLoop(time) {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  if (started && !ended) {
    // Smooth acceleration
    pixelsPerSecond += (targetSpeed - pixelsPerSecond) * 0.05;

    position -= pixelsPerSecond * delta;
    scrollContent.style.top = position + "px";

    // End detection
    if (position + scrollContent.offsetHeight <= 0) {
      ended = true;
      console.log("End reached");
    }
  }

  requestAnimationFrame(scrollLoop);
}

// =======================
// Init
// =======================
window.addEventListener("load", () => {
  loadScrollFromFirebase();
  requestAnimationFrame(scrollLoop);
});
