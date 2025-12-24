document.addEventListener("DOMContentLoaded", () => {

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
  // DOM
  // ===============================
  const scrollContent = document.getElementById("scroll-text");
  const scoreEl = document.getElementById("score");
  const endOverlay = document.getElementById("end-overlay");
  const continueBtn = document.getElementById("continue-btn");

  if (!scrollContent || !scoreEl || !endOverlay || !continueBtn) {
    console.error("❌ Missing required DOM elements.");
    return;
  }

  continueBtn.onclick = () => {
    // 🔁 change later when next section exists
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

  // ===============================
  // Known mistake forms
  // ===============================
  const COMMON_MISTAKES = [
    "familys", "reign", "hapy", "could of", "should of", "would of",
    "their", "there", "our", "are", "cleer", "alberts",
    "acheive", "definately", "wich", "recieve", "seperate",
    "enviroment", "goverment", "arguement", "occured", "untill",
    "becuase", "thier", "wiered", "freind"
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
          scoreEl.textContent = score;
        }
        // incorrect clicks: still bold, no score, no speed change
      });
    });
  }

  // ===============================
  // Firebase load (random section)
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

});
