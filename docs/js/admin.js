import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
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

const titleInput = document.getElementById("titleInput");
const scrollText = document.getElementById("scrollText");
const baseSpeed = document.getElementById("baseSpeed");
const boostSpeed = document.getElementById("boostSpeed");
const activeInput = document.getElementById("activeInput");
const saveBtn = document.getElementById("saveBtn");

const markBtn = document.getElementById("markMistakeBtn");
const mistakeCountEl = document.getElementById("mistakeCount");

/* ===============================
   State
   =============================== */

let mistakes = [];

/* ===============================
   Mark mistake from selection
   =============================== */

markBtn.addEventListener("click", () => {
  const start = scrollText.selectionStart;
  const end = scrollText.selectionEnd;

  if (start === end) {
    alert("Select a word first.");
    return;
  }

  const selected = scrollText.value.slice(start, end).trim();

  if (!selected || selected.includes(" ")) {
    alert("Please select a single word.");
    return;
  }

  if (!mistakes.includes(selected)) {
    mistakes.push(selected);
    mistakeCountEl.textContent = mistakes.length;
  }
});

/* ===============================
   Save section
   =============================== */

saveBtn.addEventListener("click", async () => {
  if (!titleInput.value || !scrollText.value) {
    alert("Title and text required.");
    return;
  }

  await addDoc(collection(db, "sections"), {
    type: "scroll",
    title: titleInput.value,
    text: scrollText.value,
    mistakes,
    baseSpeed: Number(baseSpeed.value),
    boost: Number(boostSpeed.value),
    active: activeInput.value === "true",
    created: Date.now()
  });

  resetForm();
});

/* ===============================
   Reset
   =============================== */

function resetForm() {
  titleInput.value = "";
  scrollText.value = "";
  mistakes = [];
  mistakeCountEl.textContent = "0";
}
