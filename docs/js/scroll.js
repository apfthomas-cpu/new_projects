import { db } from "./firebase.js";
import { navigateWithFade } from "./transitions.js";
import {
  collection, getDocs, query, where, limit,
  doc, updateDoc, increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-visible");
});

const startBtn = document.getElementById("startBtn");
const introPanel = document.getElementById("introPanel");
const scrollPanel = document.getElementById("scrollPanel");

const viewport = document.getElementById("scrollViewport");
const contentEl = document.getElementById("scrollContent");

const hudScore = document.getElementById("hudScore");
const hudTitle = document.getElementById("hudTitle");

const SPEED_FACTOR = 1.25; // "increase by a quarter" (base + boosts)

let section = null;
let mistakesSet = new Set();
let clickedMistakes = new Set();

let score = 0;

// smooth scrolling state
let y = 0;
let lastTs = null;
let speedPxPerSec = 28 * SPEED_FACTOR;     // default base speed
let boostPxPerSec = 8 * SPEED_FACTOR;      // default boost per correct mistake

async function loadRandomScrollSection(){
  const sectionsRef = collection(db, "sections");

  // Active + type=scroll
  const q = query(
    sectionsRef,
    where("active", "==", true),
    where("type", "==", "scroll"),
    limit(100)
  );

  const snap = await getDocs(q);
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  if (!all.length) {
    return {
      id: null,
      title: "Scrolling Challenge",
      data: {
        content: "No scrolling sections found in Firestore. Ask an admin to add one.",
        mistakes: [],
        baseSpeedPxPerSec: 28,
        boostPxPerSec: 8,
      }
    };
  }

  return all[Math.floor(Math.random() * all.length)];
}

function tokenizeWithPunctuation(text){
  // Returns tokens preserving punctuation; spaces handled by join
  // Example token: {raw:"word,", clean:"word", isWord:true}
  return text.split(/\s+/).filter(Boolean).map(raw => {
    const clean = raw.replace(/[^\p{L}\p{N}'-]/gu, ""); // keep letters/numbers/apostrophe/hyphen
    const isWord = clean.length > 0;
    return { raw, clean, isWord };
  });
}

function renderText(text){
  const tokens = tokenizeWithPunctuation(text);
  contentEl.innerHTML = tokens.map(t => {
    if (!t.isWord) return `${t.raw} `;
    return `<span class="word" data-clean="${escapeHtml(t.clean)}">${escapeHtml(t.raw)}</span> `;
  }).join("");
}

function escapeHtml(s){
  return s
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

function resetScroll(){
  // start just below the viewport
  y = viewport.clientHeight + 10;
  contentEl.style.transform = `translate3d(0, ${y}px, 0)`;
  lastTs = null;
}

function tick(ts){
  if (lastTs == null) lastTs = ts;
  const dt = (ts - lastTs) / 1000; // seconds
  lastTs = ts;

  y -= speedPxPerSec * dt;
  contentEl.style.transform = `translate3d(0, ${y}px, 0)`;

  const contentHeight = contentEl.scrollHeight;
  if (y < -contentHeight - 30){
    resetScroll();
  }

  requestAnimationFrame(tick);
}

function updateHud(){
  hudScore.textContent = `Score: ${score}`;
}

async function writeSectionScore(){
  const attemptId = localStorage.getItem("cg_attemptId");
  if (!attemptId || !section?.id) return;

  const attemptRef = doc(db, "attempts", attemptId);

  // store a simple per-section record + add to totalScore
  // NOTE: totalScore increments only when a new correct mistake is found.
  const payload = {
    [`sectionScores.${section.id}`]: {
      type: "scroll",
      title: section.title || "Scrolling Challenge",
      score,
      maxScore: mistakesSet.size
    }
  };

  await updateDoc(attemptRef, payload);
}

async function addPoint(){
  score += 1;
  updateHud();

  const attemptId = localStorage.getItem("cg_attemptId");
  if (attemptId) {
    const attemptRef = doc(db, "attempts", attemptId);
    await updateDoc(attemptRef, {
      totalScore: increment(1)
    });
  }

  await writeSectionScore();
}

contentEl.addEventListener("click", async (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;
  if (!target.classList.contains("word")) return;

  // always bold on first click
  if (!target.classList.contains("clicked")) {
    target.classList.add("clicked");
  }

  const clean = (target.dataset.clean || "").trim();
  if (!clean) return;

  // only correct mistakes affect speed + score (once per unique mistake word)
  if (mistakesSet.has(clean) && !clickedMistakes.has(clean)) {
    clickedMistakes.add(clean);
    speedPxPerSec += boostPxPerSec; // speed up
    await addPoint();
  }
});

startBtn.addEventListener("click", async () => {
  introPanel.classList.add("hidden");
  scrollPanel.classList.remove("hidden");

  section = await loadRandomScrollSection();

  const data = section.data || {};
  const text = String(data.content || "");
  const mistakes = Array.isArray(data.mistakes) ? data.mistakes : [];

  hudTitle.textContent = section.title || "Scrolling Challenge";

  mistakesSet = new Set(mistakes);
  clickedMistakes = new Set();

  // speeds (admin controllable per section)
  const base = Number(data.baseSpeedPxPerSec ?? 28);
  const boost = Number(data.boostPxPerSec ?? 8);
  speedPxPerSec = base * SPEED_FACTOR;
  boostPxPerSec = boost * SPEED_FACTOR;

  score = 0;
  updateHud();

  renderText(text);
  resetScroll();
  requestAnimationFrame(tick);

  await writeSectionScore();
});
