import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const contentEl = document.getElementById("scrollContent");
const titleEl = document.getElementById("scrollTitle");
const scoreEl = document.getElementById("score");
const wrapper = document.querySelector(".scroll-wrapper");

/* =========================
   Config
========================= */

let baseSpeed = 14;       // px per second
let boostAmount = 6;     // added when correct mistake clicked
let speed = baseSpeed;
let targetSpeed = baseSpeed;

let position = 0;
let lastTime = performance.now();
let started = false;
let ended = false;
let score = 0;

/* Example mistakes – replace with Firebase field later */
let mistakes = [];

/* =========================
   Firebase load
========================= */

async function loadFromFirebase() {
  try {
    const snap = await getDocs(collection(db, "scrollSections"));
    if (snap.empty) throw new Error("No docs");

    const doc = snap.docs[0].data();

    titleEl.textContent = doc.title || "Scrolling Exercise";
    mistakes = doc.mistakes || [];

    buildText(doc.text);
    startScroll();
  } catch (err) {
    console.warn("Firebase failed, using fallback.", err);
    useFallback();
  }
}

/* =========================
   Fallback content
========================= */

function useFallback() {
  titleEl.textContent = "Demo Scroll (Firebase failed)";
  mistakes = ["mistake"];

  const fallback = `
    <p>This is a fallback passage so the scroll still works.</p>
    <p>Click the word mistake to test scoring and speed.</p>
    <p>Everything else should be ignored.</p>
  `;

  buildText(fallback);
  startScroll();
}

/* =========================
   Build clickable words
========================= */

function buildText(html) {
  contentEl.innerHTML = html;

  contentEl.querySelectorAll("p").forEach(p => {
    p.innerHTML = p.innerText
      .split(" ")
      .map(w => `<span class="word">${w}</span>`)
      .join(" ");
  });

  makeWordsClickable();
}

/* =========================
   Click logic
========================= */

function makeWordsClickable() {
  contentEl.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (!started || ended) return;

      const clean = span.innerText.replace(/[^\w’']/g, "");

      if (mistakes.includes(clean)) {
        if (!span.classList.contains("correct")) {
          span.classList.add("correct");
          score++;
          scoreEl.textContent = `Score: ${score}`;
          targetSpeed += boostAmount;
        }
      }
      // ❌ do nothing for incorrect clicks
    });
  });
}

/* =========================
   Start scroll
========================= */

function startScroll() {
  requestAnimationFrame(() => {
    position = wrapper.clientHeight * 0.9;
    contentEl.style.top = position + "px";
    started = true;
  });
}

/* =========================
   Animation loop
========================= */

function animate(t) {
  const dt = (t - lastTime) / 1000;
  lastTime = t;

  if (started && !ended) {
    speed += (targetSpeed - speed) * 0.04;
    position -= speed * dt;
    contentEl.style.top = position + "px";

    const h = contentEl.offsetHeight;
    if (position + h <= 0) {
      ended = true;
    }
  }

  requestAnimationFrame(animate);
}

/* =========================
   Init
========================= */

scoreEl.textContent = "Score: 0";
contentEl.textContent = "Loading...";
loadFromFirebase();
requestAnimationFrame(animate);
