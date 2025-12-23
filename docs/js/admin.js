import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* 🔥 Firebase config */
const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ===============================
   Elements
================================ */
const titleInput = document.getElementById("titleInput");
const scrollTextArea = document.getElementById("scrollText");
const baseSpeedInput = document.getElementById("baseSpeed");
const boostSpeedInput = document.getElementById("boostSpeed");
const orderInput = document.getElementById("orderInput");
const activeInput = document.getElementById("activeInput");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const sectionsList = document.getElementById("sectionsList");
const makeMistakeBtn = document.getElementById("makeMistakeBtn");

/* ===============================
   Tabs
================================ */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab, .tab-content")
      .forEach(el => el.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

/* =========================================================
   SMART MISTAKE GENERATOR
========================================================= */

const confusionMap = {
  families: ["familys"],
  family: ["familys"],

  rain: ["reign"],
  reign: ["rain"],

  happy: ["hapy"],
  clear: ["cleer"],
  friend: ["freind"],

  their: ["there", "they're"],
  there: ["their"],
  they're: ["their"],

  your: ["you're"],
  you're: ["your"],

  our: ["are"],
  are: ["our"],

  to: ["too"],
  too: ["to"],

  its: ["it's"],
  it's: ["its"],

  than: ["then"],
  then: ["than"],

  could: ["could of"],
  should: ["should of"],
  would: ["would of"]
};

function apostropheMistake(word) {
  if (word.includes("'")) {
    return word.replace("'", "");
  }
  if (/^[A-Z][a-z]+$/.test(word)) {
    return word + "s";
  }
  return null;
}

function spellingMistake(word) {
  if (word.length < 4) return null;

  const variants = [
    w => w.replace(/([a-z])/, '$1$1'),
    w => w.replace(/([aeiou])/i, ""),
    w => w.slice(0, -1),
    w => w.replace(/ie/g, "ei"),
    w => w.replace(/ei/g, "ie"),
  ];

  const fn = variants[Math.floor(Math.random() * variants.length)];
  const res = fn(word);
  return res !== word ? res : null;
}

function preserveCase(original, mistake) {
  if (original[0] === original[0].toUpperCase()) {
    return mistake.charAt(0).toUpperCase() + mistake.slice(1);
  }
  return mistake;
}

function generateMistake(word) {
  const clean = word.replace(/[^\w']/g, "");
  const lower = clean.toLowerCase();

  const apos = apostropheMistake(clean);
  if (apos) return preserveCase(clean, apos);

  if (confusionMap[lower]) {
    const opts = confusionMap[lower];
    const chosen = opts[Math.floor(Math.random() * opts.length)];
    return preserveCase(clean, chosen);
  }

  const typo = spellingMistake(clean);
  if (typo) return preserveCase(clean, typo);

  return preserveCase(clean, clean.slice(0, -1));
}

/* =========================================================
   Create mistake from selection
========================================================= */

makeMistakeBtn.addEventListener("click", () => {
  const start = scrollTextArea.selectionStart;
  const end = scrollTextArea.selectionEnd;

  if (start === end) {
    alert("Select a single word first.");
    return;
  }

  const text = scrollTextArea.value;
  const selected = text.slice(start, end).trim();

  if (!selected || selected.includes(" ")) {
    alert("Please select one word only.");
    return;
  }

  const mistake = generateMistake(selected);
  scrollTextArea.value =
    text.slice(0, start) + mistake + text.slice(end);
});

/* =========================================================
   Save section
========================================================= */

saveBtn.addEventListener("click", async () => {
  if (!titleInput.value || !scrollTextArea.value) {
    alert("Title and text required.");
    return;
  }

  await addDoc(collection(db, "sections"), {
    type: "scroll",
    title: titleInput.value,
    text: scrollTextArea.value,
    baseSpeed: Number(baseSpeedInput.value || 20),
    boost: Number(boostSpeedInput.value || 6),
    order: Number(orderInput.value || 1),
    active: activeInput.value === "true",
    created: Date.now()
  });

  resetForm();
  loadSections();
});

/* Reset */
resetBtn.addEventListener("click", resetForm);

function resetForm() {
  titleInput.value = "";
  scrollTextArea.value = "";
}

/* =========================================================
   Load sections list
========================================================= */

async function loadSections() {
  sectionsList.innerHTML = "";
  const snap = await getDocs(collection(db, "sections"));

  snap.forEach(docSnap => {
    const d = docSnap.data();
    if (d.type !== "scroll") return;

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <strong>${d.title}</strong><br>
      Active: ${d.active ? "Yes" : "No"}<br>
      <button>Delete</button>
    `;

    div.querySelector("button").onclick = async () => {
      await deleteDoc(doc(db, "sections", docSnap.id));
      loadSections();
    };

    sectionsList.appendChild(div);
  });
}

/* Init */
loadSections();
