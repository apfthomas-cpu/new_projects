// ===============================
// FIREBASE IMPORTS (MODULE SAFE)
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
// FIREBASE CONFIG
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ===============================
// DOM GUARANTEE
// ===============================
const scrollText = document.getElementById("scroll-text");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");

if (!scrollText || !statusEl || !scoreEl) {
  throw new Error("Scroll DOM elements missing");
}

// ===============================
// STATE
// ===============================
let position = 0;
let speed = 35;
let lastTime = performance.now();
let score = 0;
let started = false;

// ===============================
// HELPERS
// ===============================
function wrapWords(text) {
  return text
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
// SCROLL START (SAFE)
// ===============================
function startScroll() {
  if (started) return;
  started = true;

  const wrapper = scrollText.parentElement;
  position = wrapper.offsetHeight;
  scrollText.style.top = position + "px";

  statusEl.textContent = "Scroll started";
  requestAnimationFrame(scrollLoop);
}

// ===============================
// SCROLL LOOP
// ===============================
function scrollLoop(t) {
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  position -= speed * delta;
  scrollText.style.top = position + "px";

  if (position + scrollText.offsetHeight < 0) {
    statusEl.textContent = "Section complete";
    return;
  }

  requestAnimationFrame(scrollLoop);
}

// ===============================
// FIREBASE LOAD (BULLETPROOF)
// ===============================
async function loadFromFirebase() {
  statusEl.textContent = "Loading exercise…";

  try {
    const q = query(
      collection(db, "sections"),
      where("type", "==", "scroll"),
      where("active", "==", true)
    );

    const snap = await getDocs(q);

    if (snap.empty) {
      throw new Error("No active scroll sections");
    }

    const docs = snap.docs;
    const random = docs[Math.floor(Math.random() * docs.length)];
    const section = random.data();

    scrollText.innerHTML = wrapWords(section.text);
    enableClicks();
    startScroll();

  } catch (err) {
    console.error("Firebase failed:", err);

    // HARD FALLBACK — SCROLL MUST STILL WORK
    scrollText.innerHTML = wrapWords(
      "This is a fallback scrolling passage. Firebase failed to load, but the exercise still works."
    );
    enableClicks();
    statusEl.textContent = "Offline mode";
    startScroll();
  }
}

// ===============================
// INIT
// ===============================
loadFromFirebase();
