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
const scrollContent = document.getElementById("scrollContent");
const scrollTitle = document.getElementById("scrollTitle");
const scoreEl = document.getElementById("score");

// End overlay (created here if not in HTML)
let endOverlay = document.createElement("div");
endOverlay.id = "end-overlay";
endOverlay.style.cssText = `
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 999;
`;
endOverlay.innerHTML = `
  <div style="
    background: rgba(255,255,255,0.95);
    padding: 40px;
    border-radius: 24px;
    text-align: center;
    box-shadow: 0 12px 30px rgba(0,0,0,0.3);
  ">
    <h2>SECTION COMPLETE</h2>
    <button id="continueBtn" style="
      margin-top: 20px;
      padding: 12px 28px;
      border-radius: 14px;
      border: none;
      background: linear-gradient(#9aa5b1,#6f7882);
      color: white;
      font-size: 1rem;
      cursor: pointer;
    ">Continue to next section</button>
  </div>
`;
document.body.appendChild(endOverlay);

document.getElementById("continueBtn").onclick = () => {
  // 🔁 Change later when next section exists
  window.location.href = "index.html";
};

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

// Common mistake forms we will treat as “correct”
const COMMON_MISTAKES = [
  "familys", "reign", "hapy", "could of", "should of", "would of",
  "their", "there", "our", "are", "cleer", "alberts",
  "acheive", "definately", "wich", "recieve", "seperate",
  "enviroment", "goverment", "arguement"
];

// ===============================
// Helpers
// ===============================
function wrapWords(text) {
  return text
    .split(/\s+/)
    .map(w => `<span class="word">${w}</span>`)
    .join(" ");
}

function extractMistakes(text) {
  const words = text.toLowerCase().split(/\s+/);
  return words.filter(w =>
    COMMON_MISTAKES.includes(w.replace(/[^\w']/g, ""))
  );
}

function enableClicks() {
  document.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (ended) return;

      if (span.classList.contains("clicked")) return;
      span.classList.add("clicked");
      span.style.fontWeight = "700";
      span.style.color = "#000";

      const word = span.innerText.toLowerCase().replace(/[^\w']/g, "");

      if (mistakes.includes(word)) {
        score++;
        targetSpeed += boost;
        scoreEl.textContent = `Score: ${score}`;
      }
      // ❌ incorrect → still bold, no penalty, no boost
    });
  });
}

// ===============================
// Firebase load (random)
// ===============================
async function loadSection() {
  try {
    const q = query(
      collection(db, "sections"),
      where("type", "==", "scroll"),
      where("active", "==", true)
    );

    const snap = await getDocs(q);
    if (snap.empty) throw new Error("No active scroll sections.");

    const docs = snap.docs;
    const randomDoc = docs[Math.floor(Math.random() * docs.length)];
    const section = randomDoc.data();

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

  } catch (err) {
    console.error("Firebase failed:", err);
    scrollTitle.textContent = "Demo Scroll (Firebase failed)";

    const demo =
      "This is a fallback passage with a mistake to test scoring. Click mistake to gain speed.";

    scrollContent.innerHTML = wrapWords(demo);
    mistakes = ["mistake"];
    enableClicks();

    const wrapper = scrollContent.parentElement;
    position = wrapper.offsetHeight;
    scrollContent.style.top = position + "px";
  }
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

    const h = scrollContent.offsetHeight;
    if (position + h < 0) {
      ended = true;
      endOverlay.style.display = "flex";
    }
  }

  requestAnimationFrame(scrollLoop);
}

// ===============================
// Init
// ===============================
loadSection();
requestAnimationFrame(scrollLoop);
