import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* 🔥 FIREBASE CONFIG — REPLACE WITH YOUR REAL KEYS */
const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================================
   DOM ELEMENTS
================================ */
const titleInput = document.getElementById("titleInput");
const scrollTextArea = document.getElementById("scrollText");
const baseSpeed = document.getElementById("baseSpeed");
const boostSpeed = document.getElementById("boostSpeed");
const orderInput = document.getElementById("orderInput");
const activeInput = document.getElementById("activeInput");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const sectionsList = document.getElementById("sectionsList");
const makeMistakeBtn = document.getElementById("makeMistakeBtn");

/* ================================
   TABS
================================ */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab, .tab-content")
      .forEach(el => el.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

/* ================================
   INTELLIGENT MISTAKE ENGINE
================================ */

const commonMistakes = {
  "families": ["familys"],
  "rain": ["reign"],
  "reign": ["rain"],
  "their": ["there", "they're"],
  "there": ["their", "they're"],
  "they're": ["their", "there"],
  "your": ["you're"],
  "you're": ["your"],
  "our": ["are"],
  "are": ["our"],
  "to": ["too", "two"],
  "too": ["to", "two"],
  "two": ["to", "too"],
  "its": ["it's"],
  "it's": ["its"],
  "than": ["then"],
  "then": ["than"],
  "could have": ["could of"],
  "should have": ["should of"],
  "would have": ["would of"],
  "happy": ["hapy", "happpy"],
  "clear": ["cleer"],
  "friend": ["freind"],
  "people": ["peaple"],
  "beautiful": ["beatiful"],
  "different": ["diffrent", "diferent"],
  "grammar": ["grammer"],
  "definitely": ["definately"],
  "separate": ["seperate"],
  "tomorrow": ["tommorow"],
  "business": ["buisness"],
  "environment": ["enviroment"],
  "necessary": ["neccessary", "necesary"]
};

function generateVariants(word) {
  const v = new Set();

  if (word.length > 3) v.add(word.slice(0, -1));
  v.add(word.replace(/([a-z])/, "$1$1"));
  v.add(word.replace(/ie/g, "ei"));
  v.add(word.replace(/ei/g, "ie"));
  v.add(word.replace(/ea/g, "ee"));
  v.add(word.replace(/ph/g, "f"));
  v.add(word.replace(/ck/g, "k"));
  v.add(word.replace(/c/g, "k"));
  v.add(word.replace(/s/g, "z"));
  v.add(word.replace(/'/g, ""));

  if (word.endsWith("ies")) v.add(word.slice(0, -3) + "ys");
  if (word.endsWith("ed")) v.add(word.slice(0, -2));
  if (word.endsWith("ing")) v.add(word.slice(0, -3));

  return [...v].filter(x => x && x !== word);
}

function intelligentMistake(original) {
  const clean = original.toLowerCase().replace(/[^a-z']/g, "");
  let options = [];

  if (commonMistakes[clean]) {
    options = options.concat(commonMistakes[clean]);
  }

  options = options.concat(generateVariants(clean));
  options = options.filter(o => o && o !== clean);

  if (!options.length) return null;

  let chosen = options[Math.floor(Math.random() * options.length)];

  if (original[0] === original[0].toUpperCase()) {
    chosen = chosen.charAt(0).toUpperCase() + chosen.slice(1);
  }

  return chosen;
}

/* ================================
   CREATE MISTAKE BUTTON
================================ */
makeMistakeBtn.addEventListener("click", () => {
  const start = scrollTextArea.selectionStart;
  const end = scrollTextArea.selectionEnd;

  if (start === end) {
    alert("Select a word or short phrase first.");
    return;
  }

  const text = scrollTextArea.value;
  const selected = text.slice(start, end).trim();

  const mistake = intelligentMistake(selected);

  if (!mistake) {
    alert("Couldn't generate a realistic mistake for that selection.");
    return;
  }

  scrollTextArea.value =
    text.slice(0, start) + mistake + text.slice(end);
});

/* ================================
   SAVE SECTION
================================ */
saveBtn.addEventListener("click", async () => {
  if (!titleInput.value || !scrollTextArea.value) {
    alert("Title and text required.");
    return;
  }

  await addDoc(collection(db, "sections"), {
    type: "scroll",
    title: titleInput.value,
    text: scrollTextArea.value,
    baseSpeed: Number(baseSpeed.value),
    boost: Number(boostSpeed.value),
    order: Number(orderInput.value),
    active: activeInput.value === "true",
    created: Date.now()
  });

  resetForm();
  loadSections();
});

/* ================================
   RESET
================================ */
resetBtn.addEventListener("click", resetForm);

function resetForm() {
  titleInput.value = "";
  scrollTextArea.value = "";
  baseSpeed.value = 30;
  boostSpeed.value = 8;
  orderInput.value = 1;
  activeInput.value = "true";
}

/* ================================
   LOAD / DELETE SECTIONS
================================ */
async function loadSections() {
  sectionsList.innerHTML = "";
  const snap = await getDocs(collection(db, "sections"));

  snap.forEach(docSnap => {
    const d = docSnap.data();
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <strong>${d.title}</strong><br>
      Active: ${d.active ? "Yes" : "No"}<br>
      <button data-id="${docSnap.id}">Delete</button>
    `;
    div.querySelector("button").onclick = async () => {
      await deleteDoc(doc(db, "sections", docSnap.id));
      loadSections();
    };
    sectionsList.appendChild(div);
  });
}

loadSections();
