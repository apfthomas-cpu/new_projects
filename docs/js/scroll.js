import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, where, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* 🔥 Firebase config — SAME as admin.js */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* Elements */
const wrapper = document.getElementById("scroll-wrapper");
const textBox = document.getElementById("scroll-text");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");

/* End overlay */
const endOverlay = document.getElementById("end-overlay");
const continueBtn = document.getElementById("continue-btn");

/* State */
let position = 0;
let lastTime = performance.now();
let baseSpeed = 12;
let boostSpeed = 6;
let speed = baseSpeed;
let score = 0;
let ended = false;

/* ============================================================
   Load active scroll section from Firestore
   ============================================================ */
async function loadSection() {
  try {
    const q = query(
      collection(db, "sections"),
      where("type", "==", "scroll"),
      where("active", "==", true),
      orderBy("order")
    );

    const snap = await getDocs(q);

    if (snap.empty) throw new Error("No active scroll sections.");

    const data = snap.docs[0].data();
    baseSpeed = data.baseSpeed || 12;
    boostSpeed = data.boost || 6;
    speed = baseSpeed;

    buildText(data.text);
    statusEl.textContent = "Loaded from Firebase";

    startScroll();
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Demo Scroll (Firebase failed)";
    buildText(
      "This is a fallback passage so the scroll still works. Click the word mistake to test scoring and speed. Everything else should be marked incorrect."
    );
    startScroll();
  }
}

/* ============================================================
   Build clickable words
   ============================================================ */
function buildText(text) {
  textBox.innerHTML = "";

  text.split(/\s+/).forEach(word => {
    const span = document.createElement("span");
    span.className = "word";
    span.textContent = word + " ";
    span.addEventListener("click", () => onWordClick(span));
    textBox.appendChild(span);
  });
}

/* ============================================================
   Click logic
   ============================================================ */
function onWordClick(span) {
  if (ended || span.classList.contains("clicked")) return;

  span.classList.add("clicked");
  span.style.fontWeight = "700";
  span.style.color = "#000";

  if (span.textContent.toLowerCase().includes("@") ||
      span.textContent.includes("0") ||
      span.textContent.match(/zz|ee/)) {
    // correct mistake
    score++;
    speed += boostSpeed;
    scoreEl.textContent = score;
  }
  // wrong clicks just bold — no penalty, no boost
}

/* ============================================================
   Start scrolling
   ============================================================ */
function startScroll() {
  wrapper.style.display = "block";
  position = wrapper.clientHeight * 0.9;
  textBox.style.top = position + "px";

  requestAnimationFrame(scrollLoop);
}

/* ============================================================
   Smooth scroll loop (top-based)
   ============================================================ */
function scrollLoop(t) {
  if (ended) return;

  const delta = (t - lastTime) / 1000;
  lastTime = t;

  position -= speed * delta;
  textBox.style.top = position + "px";

  if (position + textBox.offsetHeight <= 0) {
    finish();
    return;
  }

  requestAnimationFrame(scrollLoop);
}

/* ============================================================
   Finish
   ============================================================ */
function finish() {
  ended = true;
  endOverlay.style.display = "flex";
}

continueBtn.addEventListener("click", () => {
  // link later
  alert("Next section coming soon!");
});

/* ============================================================
   Init
   ============================================================ */
loadSection();
