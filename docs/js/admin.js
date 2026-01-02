/* ======================================================
   FIREBASE SETUP
   ====================================================== */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc
} from
  "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "cranium-gymnasium.firebaseapp.com",
  projectId: "cranium-gymnasium"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ======================================================
   DOM ELEMENTS
   ====================================================== */

// Sidebar
const sectionsList = document.getElementById("sectionsList");
const addSectionBtn = document.getElementById("addSectionBtn");

// Main editor
const emptyState = document.getElementById("emptyState");
const sectionEditor = document.getElementById("sectionEditor");

// Section editor fields
const sectionTitleEl = document.getElementById("sectionTitle");
const sectionMetaEl = document.getElementById("sectionMeta");

const titleInput = document.getElementById("titleInput");
const scrollText = document.getElementById("scrollText");
const baseSpeed = document.getElementById("baseSpeed");
const boostSpeed = document.getElementById("boostSpeed");
const orderInput = document.getElementById("orderInput");
const activeInput = document.getElementById("activeInput");

const saveBtn = document.getElementById("saveBtn");
const deleteSectionBtn = document.getElementById("deleteSectionBtn");

// Questions
const questionsList = document.getElementById("questionsList");
const addQuestionBtn = document.getElementById("addQuestionBtn");

// Question modal
const modal = document.getElementById("questionModal");
const modalTitle = document.getElementById("questionModalTitle");
const questionTextInput = document.getElementById("questionTextInput");
const correctAnswerInput = document.getElementById("correctAnswerInput");
const mistakesInput = document.getElementById("mistakesInput");
const saveQuestionBtn = document.getElementById("saveQuestionBtn");
const cancelQuestionBtn = document.getElementById("cancelQuestionBtn");

// Performance dashboard
const performanceSectionFilter =
  document.getElementById("performanceSectionFilter");
const pupilFilter = document.getElementById("pupilFilter");

const avgScoreEl = document.getElementById("avgScore");
const attemptCountEl = document.getElementById("attemptCount");
const attemptsList = document.getElementById("attemptsList");
const mistakesList = document.getElementById("mistakesList");

/* ======================================================
   STATE
   ====================================================== */

let selectedSectionId = null;
let editingQuestionId = null;

/* ======================================================
   INIT
   ====================================================== */

loadSections();
loadPerformanceSections();
loadAttempts();

/* ======================================================
   SECTIONS
   ====================================================== */

async function loadSections() {
  sectionsList.innerHTML = "";

  const snap = await getDocs(collection(db, "sections"));

  snap.forEach(docSnap => {
    const data = docSnap.data();

    const el = document.createElement("div");
    el.className = "section-item";
    el.dataset.id = docSnap.id;

    el.innerHTML = `
      <div>
        <strong>${data.title || "Untitled"}</strong>
        <small>${data.active ? "Active" : "Inactive"}</small>
      </div>
      <span class="badge ${data.active ? "active" : ""}">
        ${data.active ? "On" : "Off"}
      </span>
    `;

    el.addEventListener("click", () => selectSection(docSnap.id));
    sectionsList.appendChild(el);
  });
}

async function selectSection(id) {
  selectedSectionId = id;

  [...sectionsList.children].forEach(el =>
    el.classList.toggle("active", el.dataset.id === id)
  );

  const snap = await getDoc(doc(db, "sections", id));
  const data = snap.data();

  emptyState.classList.add("hidden");
  sectionEditor.classList.remove("hidden");

  sectionTitleEl.textContent = data.title;
  titleInput.value = data.title || "";
  scrollText.value = data.text || "";
  baseSpeed.value = data.baseSpeed ?? 30;
  boostSpeed.value = data.boost ?? 8;
  orderInput.value = data.order ?? 1;
  activeInput.value = data.active ? "true" : "false";

  await loadQuestions(id);
}

/* ======================================================
   CREATE / SAVE / DELETE SECTION
   ====================================================== */

addSectionBtn.addEventListener("click", async () => {
  const ref = await addDoc(collection(db, "sections"), {
    title: "New Section",
    text: "",
    baseSpeed: 30,
    boost: 8,
    order: 1,
    active: true,
    created: Date.now()
  });

  await loadSections();
  selectSection(ref.id);
});

saveBtn.addEventListener("click", async () => {
  if (!selectedSectionId) return;

  await updateDoc(doc(db, "sections", selectedSectionId), {
    title: titleInput.value.trim(),
    text: scrollText.value,
    baseSpeed: Number(baseSpeed.value),
    boost: Number(boostSpeed.value),
    order: Number(orderInput.value),
    active: activeInput.value === "true"
  });

  sectionTitleEl.textContent = titleInput.value;
  loadSections();
});

deleteSectionBtn.addEventListener("click", async () => {
  if (!selectedSectionId) return;
  if (!confirm("Delete this section and all its questions?")) return;

  await deleteDoc(doc(db, "sections", selectedSectionId));

  selectedSectionId = null;
  sectionEditor.classList.add("hidden");
  emptyState.classList.remove("hidden");

  loadSections();
});

/* ======================================================
   QUESTIONS
   ====================================================== */

async function loadQuestions(sectionId) {
  questionsList.innerHTML = "";

  const snap = await getDocs(
    collection(db, "sections", sectionId, "questions")
  );

  let count = 0;

  snap.forEach(q => {
    count++;
    const d = q.data();

    const el = document.createElement("div");
    el.className = "question-item";

    el.innerHTML = `
      <span>${d.text}</span>
      <div class="actions">
        <button class="icon-btn" data-edit="${q.id}">✏️</button>
        <button class="icon-btn danger" data-delete="${q.id}">🗑️</button>
      </div>
    `;

    questionsList.appendChild(el);
  });

  sectionMetaEl.textContent = `${count} question${count !== 1 ? "s" : ""}`;
}

addQuestionBtn.addEventListener("click", () => {
  editingQuestionId = null;
  modalTitle.textContent = "Add Question";
  openModal();
});

questionsList.addEventListener("click", async (e) => {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;

  if (deleteId) {
    if (!confirm("Delete this question?")) return;
    await deleteDoc(
      doc(db, "sections", selectedSectionId, "questions", deleteId)
    );
    loadQuestions(selectedSectionId);
  }

  if (editId) {
    editingQuestionId = editId;

    const snap = await getDoc(
      doc(db, "sections", selectedSectionId, "questions", editId)
    );
    const d = snap.data();

    questionTextInput.value = d.text;
    correctAnswerInput.value = d.correctAnswer;
    mistakesInput.value = (d.mistakes || []).join(", ");

    modalTitle.textContent = "Edit Question";
    openModal();
  }
});

saveQuestionBtn.addEventListener("click", async () => {
  const data = {
    text: questionTextInput.value.trim(),
    correctAnswer: correctAnswerInput.value.trim(),
    mistakes: mistakesInput.value
      .split(",")
      .map(w => w.trim())
      .filter(Boolean),
    updated: Date.now()
  };

  if (!data.text || !data.correctAnswer) {
    alert("Question and correct answer required");
    return;
  }

  if (editingQuestionId) {
    await updateDoc(
      doc(db, "sections", selectedSectionId, "questions", editingQuestionId),
      data
    );
  } else {
    await addDoc(
      collection(db, "sections", selectedSectionId, "questions"),
      { ...data, created: Date.now() }
    );
  }

  closeModal();
  loadQuestions(selectedSectionId);
});

/* ======================================================
   MODAL HELPERS
   ====================================================== */

function openModal() {
  modal.classList.remove("hidden");
}

function closeModal() {
  modal.classList.add("hidden");
  questionTextInput.value = "";
  correctAnswerInput.value = "";
  mistakesInput.value = "";
}

cancelQuestionBtn.addEventListener("click", closeModal);

/* ======================================================
   PERFORMANCE DASHBOARD
   ====================================================== */

async function loadPerformanceSections() {
  const snap = await getDocs(collection(db, "sections"));
  snap.forEach(docSnap => {
    const opt = document.createElement("option");
    opt.value = docSnap.id;
    opt.textContent = docSnap.data().title;
    performanceSectionFilter.appendChild(opt);
  });
}

async function loadAttempts() {
  attemptsList.innerHTML = "";
  mistakesList.innerHTML = "";

  const sectionFilter = performanceSectionFilter.value;
  const pupilText = pupilFilter.value.toLowerCase();

  const snap = await getDocs(collection(db, "attempts"));

  let totalScore = 0;
  let count = 0;
  const mistakeMap = {};

  snap.forEach(a => {
    const d = a.data();

    if (sectionFilter !== "all" && d.sectionId !== sectionFilter) return;
    if (pupilText && !d.pupilName.toLowerCase().includes(pupilText)) return;

    count++;
    totalScore += d.score;

    (d.mistakes || []).forEach(word => {
      mistakeMap[word] = (mistakeMap[word] || 0) + 1;
    });

    const row = document.createElement("div");
    row.className = "attempt-row";
    row.innerHTML = `
      <div>
        <strong>${d.pupilName}</strong>
        <span> — ${new Date(d.created).toLocaleDateString()}</span>
      </div>
      <div>${d.score}%</div>
    `;

    attemptsList.appendChild(row);
  });

  avgScoreEl.textContent = count
    ? Math.round(totalScore / count) + "%"
    : "–";

  attemptCountEl.textContent = count;

  renderMistakes(mistakeMap);
}

function renderMistakes(map) {
  Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([word, count]) => {
      const chip = document.createElement("span");
      chip.className = "mistake-chip";
      chip.textContent = `${word} (${count})`;
      mistakesList.appendChild(chip);
    });
}

performanceSectionFilter.addEventListener("change", loadAttempts);
pupilFilter.addEventListener("input", loadAttempts);
