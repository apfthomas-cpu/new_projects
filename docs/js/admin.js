import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const titleInput = document.getElementById("titleInput");
const instrInput = document.getElementById("instrInput");
const textInput = document.getElementById("textInput");
const preview = document.getElementById("preview");
const mistakeCount = document.getElementById("mistakeCount");
const orderInput = document.getElementById("orderInput");
const activeInput = document.getElementById("activeInput");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");
const sectionsList = document.getElementById("sectionsList");

let currentMistakes = new Set();
let editingId = null;

// Render preview
function renderPreview() {
  const text = textInput.value.trim();
  if (!text) {
    preview.innerHTML = "<em>Paste text above</em>";
    currentMistakes.clear();
    mistakeCount.textContent = "0";
    return;
  }

  preview.innerHTML = text
    .split(/\s+/)
    .map(w => {
      const clean = w.replace(/[^\w']/g, "").toLowerCase();
      const cls = currentMistakes.has(clean) ? "mistake" : "";
      return `<span class="word ${cls}" data-word="${clean}">${w}</span>`;
    })
    .join(" ");

  mistakeCount.textContent = currentMistakes.size;
}

// Toggle click
preview.addEventListener("click", e => {
  const span = e.target.closest(".word");
  if (!span) return;
  const w = span.dataset.word;
  if (currentMistakes.has(w)) currentMistakes.delete(w);
  else currentMistakes.add(w);
  renderPreview();
});

// Live typing
textInput.addEventListener("input", () => {
  currentMistakes.clear();
  renderPreview();
});

function resetForm() {
  editingId = null;
  titleInput.value = "";
  instrInput.value = "";
  textInput.value = "";
  orderInput.value = 1;
  activeInput.value = "true";
  currentMistakes.clear();
  renderPreview();
}

// Save section
saveBtn.onclick = async () => {
  if (!titleInput.value.trim() || !textInput.value.trim()) {
    alert("Title + text required");
    return;
  }

  const data = {
    type: "scroll",
    title: titleInput.value.trim(),
    text: textInput.value.trim(),
    instructions: instrInput.value
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean),
    mistakes: Array.from(currentMistakes),
    order: Number(orderInput.value),
    active: activeInput.value === "true",
    updatedAt: serverTimestamp()
  };

  if (editingId) {
    await updateDoc(doc(db, "sections", editingId), data);
  } else {
    data.createdAt = serverTimestamp();
    await addDoc(collection(db, "sections"), data);
  }

  resetForm();
  loadSections();
};

// Load sections
async function loadSections() {
  sectionsList.innerHTML = "";
  const snap = await getDocs(collection(db, "sections"));

  snap.forEach(d => {
    const s = d.data();
    if (s.type !== "scroll") return;

    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <strong>${s.title}</strong><br>
      Order: ${s.order} — Mistakes: ${s.mistakes?.length || 0}<br>
      <button data-edit="${d.id}">Edit</button>
      <button data-del="${d.id}">Delete</button>
    `;

    div.querySelector("[data-edit]").onclick = () => {
      editingId = d.id;
      titleInput.value = s.title;
      instrInput.value = (s.instructions || []).join("\n");
      textInput.value = s.text;
      orderInput.value = s.order;
      activeInput.value = s.active ? "true" : "false";
      currentMistakes = new Set(s.mistakes || []);
      renderPreview();
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    div.querySelector("[data-del]").onclick = async () => {
      if (confirm("Delete section?")) {
        await deleteDoc(doc(db, "sections", d.id));
        loadSections();
      }
    };

    sectionsList.appendChild(div);
  });
}

resetBtn.onclick = resetForm;
renderPreview();
loadSections();
