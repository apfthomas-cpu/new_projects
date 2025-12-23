// docs/js/scroll.js

import { db } from "./firebase.js";
import {
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const scrollContent = document.getElementById("scrollContent");
const scrollWindow  = document.querySelector(".scroll-window");
const titleEl       = document.getElementById("scrollTitle");
const scoreEl       = document.getElementById("score");
const errorEl       = document.getElementById("scrollError");

let mistakes = [];
let score = 0;

let position = 0;
let lastTime = performance.now();

let pixelsPerSecond = 12.5;
let targetSpeed = 12.5;
let boostAmount = 6;     // added per correct click

let started = false;
let ended = false;

// ---------- helpers ----------
function showError(msg) {
  console.error(msg);
  if (errorEl) errorEl.textContent = msg;
}

// Convert each <p> to clickable word spans
function makeWordsClickable() {
  // If you stored plain text without <p> tags, wrap it:
  if (!scrollContent.querySelector("p")) {
    const raw = scrollContent.innerText.trim();
    scrollContent.innerHTML = raw
      .split(/\n+/)
      .map(line => `<p>${line}</p>`)
      .join("");
  }

  scrollContent.querySelectorAll("p").forEach(p => {
    const words = p.innerText.split(" ");
    p.innerHTML = words.map(w => `<span class="word">${w}</span>`).join(" ");
  });

  scrollContent.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (!started || ended) return;

      // Clean word for matching (remove punctuation)
      const clean = span.innerText.replace(/[^\w’']/g, "");

      if (mistakes.includes(clean)) {
        if (!span.classList.contains("correct")) {
          span.classList.add("correct");
          score++;
          scoreEl.textContent = `Score: ${score}`;

          // Speed boost (smoothly approaches target)
          targetSpeed += boostAmount;
        }
      } else {
        span.classList.add("incorrect");
      }
    });
  });
}

function startScrolling() {
  requestAnimationFrame(() => {
    // Start just below the visible area
    position = scrollWindow.clientHeight;
    scrollContent.style.top = position + "px";
    started = true;
  });
}

// Main smooth loop
function tick(t) {
  const dt = (t - lastTime) / 1000;
  lastTime = t;

  if (started && !ended) {
    // Smooth acceleration to target speed (stable feel)
    pixelsPerSecond += (targetSpeed - pixelsPerSecond) * 0.04;

    position -= pixelsPerSecond * dt;
    scrollContent.style.top = position + "px";

    // End detection
    const textHeight = scrollContent.offsetHeight;
    if (position + textHeight <= 0) {
      ended = true;
      // optional: show end screen or redirect
      // alert("End reached!");
    }
  }

  requestAnimationFrame(tick);
}

// ---------- Firebase load ----------
async function loadRandomScrollSection() {
  titleEl.textContent = "Loading...";
  errorEl.textContent = "";

  try {
    const q = query(collection(db, "scroll_sections"), where("active", "==", true));
    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("No active scroll sections found in Firestore (collection: scroll_sections).");
    }

    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    const chosen = all[Math.floor(Math.random() * all.length)];

    // Title
    titleEl.textContent = chosen.title || "Scrolling Exercise";

    // Text (stored as HTML with <p>…</p> recommended)
    scrollContent.innerHTML = chosen.text || "<p>No text found.</p>";

    // Mistakes list
    mistakes = Array.isArray(chosen.mistakes) ? chosen.mistakes : [];

    // Speed settings (use your admin fields)
    pixelsPerSecond = Number(chosen.baseSpeed ?? 12.5);
    targetSpeed = pixelsPerSecond;

    boostAmount = Number(chosen.boostSpeed ?? 6);

    makeWordsClickable();
    startScrolling();
  } catch (err) {
    showError(
      `Could not load from Firebase. Check console + Firestore rules. (${err.message})`
    );

    // fallback demo so you SEE it running
    titleEl.textContent = "Demo Scroll (Firebase failed)";
    scrollContent.innerHTML = `
      <p>This is a fallback passage so the scroll still works.</p>
      <p>Click the word <b>mistake</b> to test scoring + speed.</p>
      <p>Everything else should be marked incorrect.</p>
    `;
    mistakes = ["mistake"];
    pixelsPerSecond = 12.5;
    targetSpeed = 12.5;
    boostAmount = 6;

    makeWordsClickable();
    startScrolling();
  }
}

// ---------- init ----------
window.addEventListener("load", () => {
  loadRandomScrollSection();
  requestAnimationFrame(tick);
});
