import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const scrollContent = document.getElementById("scrollContent");
const scrollTitle = document.getElementById("scrollTitle");
const statusEl = document.getElementById("status");
const scoreEl = document.getElementById("score");
const endOverlay = document.getElementById("end-overlay");
const continueBtn = document.getElementById("continueBtn");

// State
let position = 0;
let speed = 20;
let targetSpeed = 20;
let boost = 6;
let lastTime = performance.now();
let score = 0;
let ended = false;
let mistakes = [];

// Common mistake list
const COMMON_MISTAKES = [
  "familys","reign","hapy","could of","should of","would of",
  "their","there","our","are","cleer","alberts",
  "acheive","definately","wich","recieve","seperate",
  "enviroment","goverment","arguement"
];

// Helpers
function wrapWords(text) {
  return text
    .split(/\s+/)
    .map(w => `<span class="word">${w}</span>`)
    .join(" ");
}

function extractMistakes(text) {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^\w']/g, ""))
    .filter(w => COMMON_MISTAKES.includes(w));
}

function enableClicks() {
  document.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (ended || span.classList.contains("clicked")) return;

      span.classList.add("clicked");

      const word = span.innerText
        .toLowerCase()
        .replace(/[^\w']/g, "");

      if (mistakes.includes(word)) {
        score++;
        targetSpeed += boost;
        scoreEl.textContent = score;
      }
    });
  });
}

// Load random scroll section
async function loadSection() {
  try {
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
    speed = section.baseSpeed || 20;
    targetSpeed = speed;
    boost = section.boost || 6;

    scrollContent.innerHTML = wrapWords(section.text);
    mistakes = extractMistakes(section.text);

    enableClicks();

    const wrapper = scrollContent.parentElement;
    position = wrapper.offsetHeight;
    scrollContent.style.top = position + "px";

    statusEl.textContent = "Scroll started";

  } catch (err) {
    console.error("Firebase error:", err);
    statusEl.textContent = "Failed to load text";
    scrollContent.textContent = "Error loading scrolling text.";
  }
}

// Scroll loop
function scrollLoop(t) {
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  if (!ended) {
    speed += (targetSpeed - speed) * 0.05;
    position -= speed * delta;
    scrollContent.style.top = position + "px";

    const h = scrollContent.offsetHeight;
    if (position + h < 0) {
      ended = true;
      endOverlay.style.display = "flex";
    }
  }

  requestAnimationFrame(scrollLoop);
}

continueBtn.onclick = () => {
  window.location.href = "index.html";
};

// Init
loadSection();
requestAnimationFrame(scrollLoop);
