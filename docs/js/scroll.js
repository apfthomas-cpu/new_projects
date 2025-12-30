import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* Firebase config */
const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* DOM */
const scrollText = document.getElementById("scroll-text");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status");
const endOverlay = document.getElementById("end-overlay");
const continueBtn = document.getElementById("continue-btn");

/* State */
let position = 0;
let speed = 25;
let targetSpeed = 25;
let lastTime = performance.now();
let ended = false;

/* Safety text (never removed) */
const FALLBACK_TEXT = `
This scrolling exercise could not load live content.

If you are seeing this message, the system is still working
and scrolling correctly, but Firebase did not return data.

Please inform your teacher.
`;

/* Helpers */
function wrap(text) {
  return text
    .trim()
    .split(/\s+/)
    .map(w => `<span class="word">${w}</span>`)
    .join(" ");
}

/* Load section */
async function loadSection() {
  let textToUse = FALLBACK_TEXT;

  try {
    const q = query(
      collection(db, "sections"),
      where("type", "==", "scroll"),
      where("active", "==", true)
    );

    const snap = await getDocs(q);

    if (!snap.empty) {
      const docs = snap.docs;
      const chosen = docs[Math.floor(Math.random() * docs.length)].data();
      textToUse = chosen.text;
      speed = chosen.baseSpeed || speed;
      targetSpeed = speed;
      statusEl.textContent = "Scroll started";
    } else {
      statusEl.textContent = "No active sections found";
    }
  } catch (err) {
    console.error("Firebase error:", err);
    statusEl.textContent = "Offline mode";
  }

  /* GUARANTEED text injection */
  scrollText.innerHTML = wrap(textToUse);

  /* Reset position safely */
  const wrapper = scrollText.parentElement;
  position = wrapper.offsetHeight + 40;
  scrollText.style.top = position + "px";
}

/* Scroll loop */
function loop(t) {
  const dt = (t - lastTime) / 1000;
  lastTime = t;

  if (!ended) {
    position -= speed * dt;
    scrollText.style.top = position + "px";

    const h = scrollText.offsetHeight;
    if (h > 0 && position + h < 0) {
      ended = true;
      endOverlay.classList.remove("hidden");
    }
  }

  requestAnimationFrame(loop);
}

/* Continue */
continueBtn.onclick = () => {
  window.location.href = "welcome.html";
};

/* Init */
loadSection().then(() => {
  requestAnimationFrame(loop);
});