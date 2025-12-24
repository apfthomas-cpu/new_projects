console.log("✅ admin.js loaded");
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* 🔥 FIREBASE CONFIG — PUT YOUR REAL API KEY HERE */
const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* Elements */
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

/* --------------------------------------------------
   Intelligent mistake generator
-------------------------------------------------- */
function smartMistake(word) {
  const lower = word.toLowerCase();

  const common = {
    families: "familys",
    rain: "reign",
    reign: "rain",
    happy: "hapy",
    their: "there",
    there: "their",
    your: "you're",
    "you're": "your",
    our: "are",
    are: "our",
    clear: "cleer",
    could: "could of",
    should: "should of",
    would: "would of",
    its: "it's",
    "it's": "its"
  };

  if (common[lower]) {
    return preserveCase(word, common[lower]);
  }

  if (lower.endsWith("'s")) {
    return word.replace(/'s$/i, "s");
  }

  if (lower.length > 4) {
    return word.slice(0, -1);
  }

  return word + word[word.length - 1];
}

function preserveCase(original, replacement) {
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}


/* --------------------------------------------------
   Create mistake from selected word
-------------------------------------------------- */
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

  const mistake = smartMistake(selected);
  scrollTextArea.value =
    text.slice(0, start) + mistake + text.slice(end);
});

/* --------------------------------------------------
   Save section to Firestore
-------------------------------------------------- */
saveBtn.addEventListener("click", async () => {
  if (!titleInput.value || !scrollTextArea.value) {
    alert("Title and text required.");
    return;
  }

  try {
    await addDoc(collection(db, "sections"), {
      type: "scroll",
      title: titleInput.value,
      text: scrollTextArea.value,
      baseSpeed: Number(baseSpeed.value) || 30,
      boost: Number(boostSpeed.value) || 8,
      order: Number(orderInput.value) || 1,
      active: activeInput.value === "true",
      created: serverTimestamp()
    });

    resetForm();
    loadSections();
    alert("Section saved!");
  } catch (err) {
    console.error(err);
    alert("Error saving section. Check console.");
  }
});

/* --------------------------------------------------
   Reset form
-------------------------------------------------- */
function resetForm() {
  titleInput.value = "";
  scrollTextArea.value = "";
  orderInput.value = 1;
}

/* --------------------------------------------------
   Load existing sections
-------------------------------------------------- */
async function loadSections() {
  sectionsList.innerHTML = "<em>Loading…</em>";

  try {
    const snap = await getDocs(collection(db, "sections"));
    sectionsList.innerHTML = "";

    snap.forEach(docSnap => {
      const d = docSnap.data();
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `
        <strong>${d.title}</strong><br>
        Active: ${d.active}<br>
        <button>Delete</button>
      `;

      div.querySelector("button").onclick = async () => {
        if (confirm("Delete this section?")) {
          await deleteDoc(doc(db, "sections", docSnap.id));
          loadSections();
        }
      };

      sectionsList.appendChild(div);
    });

    if (!snap.size) {
      sectionsList.innerHTML = "<em>No sections yet.</em>";
    }
  } catch (err) {
    console.error(err);
    sectionsList.innerHTML = "<span style='color:red'>Error loading sections.</span>";
  }
}

loadSections();
