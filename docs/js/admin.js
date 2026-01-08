import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* 🔥 Firebase config (your existing project) */
const firebaseConfig = {
  apiKey: "AIzaSyCgjZv-a6t23QqELDSrY8402hZcY_N_Ors",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sectionsCol = collection(db, "sections");

/* DOM references */
const newSectionBtn   = document.getElementById("newSectionBtn");
const sectionsListEl  = document.getElementById("sectionsList");

const sectionIdInput   = document.getElementById("sectionId");
const sectionTitle     = document.getElementById("sectionTitle");
const sectionType      = document.getElementById("sectionType");
const sectionOrder     = document.getElementById("sectionOrder");
const sectionActive    = document.getElementById("sectionActive");
const instructionsText = document.getElementById("instructionsText");
const saveSectionBtn   = document.getElementById("saveSectionBtn");
const editorTitleEl    = document.getElementById("editorTitle");

const algebraBlock      = document.getElementById("algebraBlock");
const qImageInput       = document.getElementById("qImage");
const qTimeInput        = document.getElementById("qTime");
const qCorrectSelect    = document.getElementById("qCorrect");
const addQuestionBtn    = document.getElementById("addQuestionBtn");
const questionsListEl   = document.getElementById("questionsList");

/* Local state */
let currentSectionId = null;
let currentQuestions = []; // array of { img, time, correct }

// ===========================
// Helpers
// ===========================

function clearSectionForm() {
  sectionIdInput.value = "";
  sectionTitle.value = "";
  sectionType.value = "scroll";
  sectionOrder.value = 1;
  sectionActive.checked = true;
  instructionsText.value = "";
  currentSectionId = null;
  currentQuestions = [];
  renderQuestionsList();
  editorTitleEl.textContent = "New Section";
  showAlgebraBlockIfNeeded();
}

function showAlgebraBlockIfNeeded() {
  if (sectionType.value === "algebra") {
    algebraBlock.classList.remove("hidden");
  } else {
    algebraBlock.classList.add("hidden");
  }
}

function renderSectionsList(sections) {
  sectionsListEl.innerHTML = "";
  sections.forEach(sec => {
    const div = document.createElement("div");
    div.className = "section-item";
    if (!sec.active) div.classList.add("inactive");
    if (sec.id === currentSectionId) div.classList.add("active");

    const titleSpan = document.createElement("span");
    titleSpan.textContent = sec.title || "(untitled)";

    const metaSpan = document.createElement("span");
    metaSpan.innerHTML =
      `<small>${sec.type || "?"} · order ${sec.order ?? "?"}</small>`;

    div.appendChild(titleSpan);
    div.appendChild(metaSpan);

    div.onclick = () => loadSection(sec.id);

    sectionsListEl.appendChild(div);
  });
}

function renderQuestionsList() {
  questionsListEl.innerHTML = "";
  if (!currentQuestions || currentQuestions.length === 0) {
    questionsListEl.innerHTML = "<p>No questions yet.</p>";
    return;
  }

  currentQuestions.forEach((q, index) => {
    const row = document.createElement("div");
    row.className = "question-row";

    const leftSpan = document.createElement("span");
    leftSpan.textContent = `${index + 1}. ${q.img} (time: ${q.time || "base"}s)`;

    const rightSpan = document.createElement("span");
    rightSpan.textContent = `Correct: ${q.correct}`;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "btn-small";
    delBtn.style.marginLeft = "8px";
    delBtn.onclick = () => {
      currentQuestions.splice(index, 1);
      renderQuestionsList();
    };

    const rightWrap = document.createElement("span");
    rightWrap.appendChild(rightSpan);
    rightWrap.appendChild(delBtn);

    row.appendChild(leftSpan);
    row.appendChild(rightWrap);

    questionsListEl.appendChild(row);
  });
}

// ===========================
// Firebase I/O
// ===========================

async function loadAllSections() {
  const snap = await getDocs(sectionsCol);
  const sections = [];
  snap.forEach(docSnap => {
    const d = docSnap.data();
    sections.push({
      id: docSnap.id,
      title: d.title,
      type: d.type,
      order: d.order,
      active: d.active
    });
  });

  sections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  renderSectionsList(sections);
}

async function loadSection(id) {
  const ref = doc(db, "sections", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;

  const d = snap.data();
  currentSectionId = id;

  sectionIdInput.value = id;
  sectionTitle.value = d.title || "";
  sectionType.value = d.type || "scroll";
  sectionOrder.value = d.order ?? 1;
  sectionActive.checked = !!d.active;

  const instr = d.instructions || [];
  instructionsText.value = instr.join("\n");

  currentQuestions = Array.isArray(d.questions) ? d.questions : [];
  renderQuestionsList();
  showAlgebraBlockIfNeeded();

  editorTitleEl.textContent = `${d.title || "(untitled)"} (${d.type || ""})`;

  // reload sections list to highlight current
  await loadAllSections();
}

async function saveSection() {
  const title = sectionTitle.value.trim();
  const type  = sectionType.value;

  if (!title) {
    alert("Title is required.");
    return;
  }

  const order = Number(sectionOrder.value) || 1;
  const active = sectionActive.checked;
  const instructions = instructionsText.value
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const data = {
    title,
    type,
    order,
    active,
    instructions,
    questions: type === "algebra" ? currentQuestions : [],
    updatedAt: Date.now()
  };

  if (currentSectionId) {
    const ref = doc(db, "sections", currentSectionId);
    await updateDoc(ref, data);
  } else {
    data.createdAt = Date.now();
    const ref = await addDoc(sectionsCol, data);
    currentSectionId = ref.id;
    sectionIdInput.value = ref.id;
  }

  await loadAllSections();
  alert("Section saved.");
}

// ===========================
// Event wiring
// ===========================

newSectionBtn.addEventListener("click", () => {
  clearSectionForm();
  loadAllSections();
});

sectionType.addEventListener("change", () => {
  showAlgebraBlockIfNeeded();
});

saveSectionBtn.addEventListener("click", () => {
  saveSection().catch(err => {
    console.error(err);
    alert("Failed to save section – check console.");
  });
});

addQuestionBtn.addEventListener("click", () => {
  const img = qImageInput.value.trim();
  const timeVal = qTimeInput.value.trim();
  const correct = qCorrectSelect.value;

  if (!img) {
    alert("Please enter an image filename.");
    return;
  }

  const q = {
    img,
    correct
  };
  if (timeVal) {
    q.time = Number(timeVal);
  }

  currentQuestions.push(q);
  renderQuestionsList();

  qImageInput.value = "";
  qTimeInput.value = "";
  qCorrectSelect.value = "A";
});

// Initial load
loadAllSections().catch(err => {
  console.error("Failed to load sections:", err);
});
clearSectionForm();
