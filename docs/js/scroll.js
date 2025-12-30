import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ===============================
   Firebase
   =============================== */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ===============================
   DOM
   =============================== */

const scrollContent = document.getElementById("scroll-text");
const scoreEl = document.getElementById("score");

/* ===============================
   State
   =============================== */

let speed = 20;
let targetSpeed = 20;
let boost = 6;
let score = 0;
let position = 0;
let lastTime = performance.now();
let ended = false;

let mistakes = [];

/* ===============================
   Helpers
   =============================== */

function wrapWords(text) {
  return text.split(/\s+/).map(word =>
    `<span class="word">${word}</span>`
  ).join(" ");
}

function enableClicks() {
  document.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (span.classList.contains("clicked")) return;

      span.classList.add("clicked");
      span.style.fontWeight = "700";
      span.style.color = "#000";

      const clean = span.textContent.replace(/[^\w']/g, "");

      if (mistakes.includes(clean)) {
        score++;
        targetSpeed += boost;
        scoreEl.textContent = score;
      }
    });
  });
}

/* ===============================
   Load section
   =============================== */

async function loadSection() {
  const q = query(
    collection(db, "sections"),
    where("type", "==", "scroll"),
    where("active", "==", true)
  );

  const snap = await getDocs(q);
  const docSnap = snap.docs[Math.floor(Math.random() * snap.docs.length)];
  const section = docSnap.data();

  speed = section.baseSpeed;
  targetSpeed = speed;
  boost = section.boost;

  mistakes = section.mistakes || [];

  scrollContent.innerHTML = wrapWords(section.text);
  enableClicks();

  const wrapper = scrollContent.parentElement;
  position = wrapper.offsetHeight;
  scrollContent.style.top = position + "px";
}

/* ===============================
   Scroll loop
   =============================== */

function loop(t) {
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  speed += (targetSpeed - speed) * 0.05;
  position -= speed * delta;

  scrollContent.style.top = position + "px";

  requestAnimationFrame(loop);
}

/* ===============================
   Init
   =============================== */

loadSection().then(() => {
  requestAnimationFrame(loop);
});
