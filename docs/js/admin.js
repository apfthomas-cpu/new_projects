import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, addDoc, getDocs, deleteDoc, doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* 🔥 YOUR FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

/* Tabs */
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab, .tab-content").forEach(el => el.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  });
});

/* Generate subtle mistake */
function generateMistake(word) {
  const variants = [
    w => w.slice(0, -1),
    w => w + w[w.length - 1],
    w => w.replace(/ie/g, "ei"),
    w => w.replace(/ei/g, "ie"),
    w => w.replace(/a/g, "@"),
    w => w.replace(/o/g, "0"),
    w => w.replace(/s/g, "z"),
    w => w.replace(/([a-z])/, '$1$1'),
  ];
  const fn = variants[Math.floor(Math.random() * variants.length)];
  const res = fn(word);
  return res === word ? word + "e" : res;
}

/* Create mistake from selection */
makeMistakeBtn.addEventListener("click", () => {
  const start = scrollTextArea.selectionStart;
  const end = scrollTextArea.selectionEnd;
  if (start === end) {
    alert("Select a word first.");
    return;
  }
  const text = scrollTextArea.value;
  const selected = text.slice(start, end).trim();
  if (!selected || selected.includes(" ")) {
    alert("Please select a single word.");
    return;
  }
  const mistake = generateMistake(selected);
  scrollTextArea.value = text.slice(0, start) + mistake + text.slice(end);
});

/* Save section */
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

/* Reset */
function resetForm() {
  titleInput.value = "";
  scrollTextArea.value = "";
}

/* Load sections */
async function loadSections() {
  sectionsList.innerHTML = "";
  const snap = await getDocs(collection(db, "sections"));
  snap.forEach(docSnap => {
    const d = docSnap.data();
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <strong>${d.title}</strong><br>
      Mistakes: ${(d.text.match(/@|0|zz|ee/g)||[]).length}<br>
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
