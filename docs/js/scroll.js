// ===============================
// Firebase imports
// ===============================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// DOM
// ===============================
const scrollText = document.getElementById("scroll-text");
const scrollTitle = document.getElementById("scroll-title");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const endOverlay = document.getElementById("end-overlay");
const continueBtn = document.getElementById("continue-btn");
const scrollWindow = document.querySelector(".scroll-window");

// ===============================
// State
// ===============================
let position = 0;
let speed = 30;
let targetSpeed = 30;
let boost = 6;
let lastTime = null;
let ended = false;
let score = 0;

// ===============================
// Helpers
// ===============================
function wrapWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .map(w => `<span class="word">${w}</span>`)
    .join(" ");
}

function enableClicks() {
  document.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (span.classList.contains("clicked") || ended) return;

      span.classList.add("clicked");
      score++;
      scoreEl.textContent = score;
      targetSpeed += boost;
    });
  });
}

// ===============================
// Load random section from Firebase
// ===============================
async function loadSection() {
  try {
    statusEl.textContent = "Loading from Firebase…";

    const q = query(
      collection(db, "sections"),
      where("type", "==", "scroll"),
      where("active", "==", true)
    );

    const snap = await getDocs(q);
    if (snap.empty) throw new Error("No active scroll sections");

    const docs = snap.docs;
    const section = docs[Math.floor(Math.random() * docs.length)].data();

    scrollTitle.textContent = section.title || "Scrolling Exercise";
    speed = section.baseSpeed || 30;
    targetSpeed = speed;
    boost = section.boost || 6;

    scrollText.innerHTML = wrapWords(section.text);
    enableClicks();

    position = scrollWindow.offsetHeight;
    scrollText.style.top = position + "px";

    statusEl.textContent = "Scroll started";

  } catch (err) {
    console.error("Firebase load failed:", err);
    statusEl.textContent = "Failed to load text.";
    scrollText.textContent = "Unable to load scrolling text.";
  }
}

// ===============================
// Scroll loop
// ===============================
function scrollLoop(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = (timestamp - lastTime) / 1000;
  lastTime = timestamp;

  if (!ended) {
    speed += (targetSpeed - speed) * 0.05;
    position -= speed * delta;
    scrollText.style.top = position + "px";

    const h = scrollText.offsetHeight;
    if (h > 0 && position + h < 0) {
      ended = true;
      endOverlay.style.display = "flex";
    }
  }

  requestAnimationFrame(scrollLoop);
}

// ===============================
// Events
// ===============================
continueBtn.addEventListener("click", () => {
  window.location.href = "index.html"; // change later
});

// ===============================
// Init
// ===============================
loadSection();
requestAnimationFrame(scrollLoop);
