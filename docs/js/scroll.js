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

// ===============================
// Firebase config
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// State
// ===============================
let position = 0;
let speed = 20;
let targetSpeed = 20;
let boost = 6;
let lastTime = performance.now();
let score = 0;
let ended = false;
let mistakes = [];

let scrollContent, scoreEl, statusEl;

// ===============================
// Helpers
// ===============================
function wrapWords(text) {
  return text
    .split(/\s+/)
    .map(w => `<span class="word">${w}</span>`)
    .join(" ");
}

function enableClicks() {
  document.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (ended || span.classList.contains("clicked")) return;

      span.classList.add("clicked");
      span.style.fontWeight = "700";
      span.style.color = "#000";

      const word = span.innerText.toLowerCase().replace(/[^\w']/g, "");
      if (mistakes.includes(word)) {
        score++;
        targetSpeed += boost;
        scoreEl.textContent = score;
      }
    });
  });
}

// ===============================
// Firebase load
// ===============================
async function loadSection() {
  statusEl.textContent = "Loading from database...";

  const q = query(
    collection(db, "sections"),
    where("type", "==", "scroll"),
    where("active", "==", true)
  );

  const snap = await getDocs(q);
  if (snap.empty) throw new Error("No active scroll sections.");

  const docs = snap.docs;
  const section = docs[Math.floor(Math.random() * docs.length)].data();

  speed = section.baseSpeed || 20;
  targetSpeed = speed;
  boost = section.boost || 6;

  scrollContent.innerHTML = wrapWords(section.text);
  mistakes = (section.mistakes || []).map(m => m.toLowerCase());

  enableClicks();

  const wrapper = scrollContent.parentElement;
  position = wrapper.offsetHeight + 20;
  scrollContent.style.top = position + "px";

  statusEl.textContent = "Scroll started";
}

// ===============================
// Scroll loop
// ===============================
function scrollLoop(t) {
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  if (!ended) {
    speed += (targetSpeed - speed) * 0.05;
    position -= speed * delta;
    scrollContent.style.top = position + "px";

    if (position + scrollContent.offsetHeight < 0) {
      ended = true;
      document.getElementById("end-overlay").style.display = "flex";
    }
  }

  requestAnimationFrame(scrollLoop);
}

// ===============================
// Init — SAFE & ORDERED
// ===============================
window.addEventListener("DOMContentLoaded", async () => {
  scrollContent = document.getElementById("scroll-text");
  scoreEl = document.getElementById("score");
  statusEl = document.getElementById("status");

  try {
    await loadSection();        // ✅ wait for Firebase
    requestAnimationFrame(scrollLoop); // ✅ start scroll only after load
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to load text.";
  }
});
