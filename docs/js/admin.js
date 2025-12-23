import { db } from "./firebase.js";

import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, serverTimestamp, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-visible");
});

const sectionsRef = collection(db, "sections");

const titleInput = document.getElementById("titleInput");
const textInput = document.getElementById("textInput");
const baseSpeed = document.getElementById("baseSpeed");
const boostSpeed = document.getElementById("boostSpeed");
const orderInput = document.getElementById("orderInput");
const activeToggle = document.getElementById("activeToggle");

const previewBtn = document.getElementById("previewBtn");
const saveBtn = document.getElementById("saveBtn");
const resetBtn = document.getElementById("resetBtn");

const previewWrap = document.getElementById("previewWrap");
const previewEl = document.getElementById("preview");
const mistakeCount = document.getElementById("mistakeCount");

const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");

let editingId = null;
let mistakesSet = new Set();

function escapeHtml(s){
  return s
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#39;");
}

function cleanWord(raw){
  return raw.replace(/[^\p{L}\p{N}'-]/gu, "");
}

function setStatus(msg){
  statusEl.textContent = msg || "";
}

function renderPreview(text){
  const tokens = text.split(/\s+/).filter(Boolean);
  previewEl.innerHTML = tokens.map(raw => {
    const clean = cleanWord(raw);
    const isWord = clean.length > 0;
    if (!isWord) return `${escapeHtml(raw)} `;
    const isMistake = mistakesSet.has(clean);
    return `<span class="pword ${isMistake ? "mistake" : ""}" data-clean="${escapeHtml(clean)}">${escapeHtml(raw)}</span> `;
  }).join("");

  mistakeCount.textContent = `Mistakes: ${mistakesSet.size}`;
}

previewEl.addEventListener("click", (e) => {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  if (!t.classList.contains("pword")) return;

  const clean = (t.dataset.clean || "").trim();
  if (!clean) return;

  if (mistakesSet.has(clean)) {
    mistakesSet.delete(clean);
    t.classList.remove("mistake");
  } else {
    mistakesSet.add(clean);
    t.classList.add("mistake");
  }
  mistakeCount.textContent = `Mistakes: ${mistakesSet.size}`;
});

previewBtn.addEventListener("click", () => {
  const text = textInput.value || "";
  previewWrap.classList.remove("hidden");
  renderPreview(text);
});

function resetForm(){
  editingId = null;
  mistakesSet = new Set();
  titleInput.value = "";
  textInput.value = "";
  baseSpeed.value = "28";
  boostSpeed.value = "8";
  orderInput.value = "1";
  activeToggle.value = "true";
  previewWrap.classList.add("hidden");
  previewEl.innerHTML = "";
  mistakeCount.textContent = "Mistakes: 0";
  setStatus("");
}

resetBtn.addEventListener("click", resetForm);

async function loadList(){
  listEl.innerHTML = "Loading…";
  const q = query(sectionsRef, orderBy("order","asc"));
  const snap = await getDocs(q);

  const rows = snap.docs.map(d => ({ id:d.id, ...d.data() }));

  if (!rows.length){
    listEl.innerHTML = `<div class="item"><div class="item-title">No sections yet</div><div class="item-meta">Create one on the left.</div></div>`;
    return;
  }

  listEl.innerHTML = rows.map(r => {
    const type = r.type || "unknown";
    const title = r.title || "(untitled)";
    const active = r.active ? "Active" : "Inactive";
    const order = r.order ?? "-";
    const mistakes = Array.isArray(r.data?.mistakes) ? r.data.mistakes.length : 0;

    return `
      <div class="item">
        <div class="item-title">${escapeHtml(title)}</div>
        <div class="item-meta">Type: ${escapeHtml(type)} • Order: ${order} • ${active} • Mistakes: ${mistakes}</div>
        <div class="item-actions">
          <button class="cranium-button" data-action="edit" data-id="${r.id}">Edit</button>
          <button class="cranium-button" data-action="delete" data-id="${r.id}">Delete</button>
        </div>
      </div>
    `;
  }).join("");
}

listEl.addEventListener("click", async (e) => {
  const t = e.target;
  if (!(t instanceof HTMLElement)) return;
  if (!(t instanceof HTMLButtonElement)) return;

  const action = t.dataset.action;
  const id = t.dataset.id;
  if (!action || !id) return;

  if (action === "delete") {
    if (!confirm("Delete this section?")) return;
    await deleteDoc(doc(db, "sections", id));
    setStatus("Deleted.");
    await loadList();
    return;
  }

  if (action === "edit") {
    // load doc
    const snap = await getDocs(query(sectionsRef)); // simple fetch-all then find
    const found = snap.docs.find(d => d.id === id);
    if (!found) return;

    const data = found.data();

    editingId = id;
    titleInput.value = data.title || "";
    textInput.value = data.data?.content || "";
    baseSpeed.value = String(data.data?.baseSpeedPxPerSec ?? 28);
    boostSpeed.value = String(data.data?.boostPxPerSec ?? 8);
    orderInput.value = String(data.order ?? 1);
    activeToggle.value = String(!!data.active);

    mistakesSet = new Set(Array.isArray(data.data?.mistakes) ? data.data.mistakes : []);

    previewWrap.classList.remove("hidden");
    renderPreview(textInput.value || "");

    setStatus("Editing existing section. Make changes and click Save.");
  }
});

saveBtn.addEventListener("click", async () => {
  const title = (titleInput.value || "").trim();
  const content = (textInput.value || "").trim();

  if (!title || !content) {
    setStatus("Please provide a title and text.");
    return;
  }

  const payload = {
    type: "scroll",
    title,
    active: activeToggle.value === "true",
    order: Number(orderInput.value || 1),
    data: {
      content,
      mistakes: Array.from(mistakesSet),
      baseSpeedPxPerSec: Number(baseSpeed.value || 28),
      boostPxPerSec: Number(boostSpeed.value || 8),
    },
    updatedAt: serverTimestamp()
  };

  if (editingId) {
    await updateDoc(doc(db, "sections", editingId), payload);
    setStatus("Updated.");
  } else {
    await addDoc(sectionsRef, {
      ...payload,
      createdAt: serverTimestamp()
    });
    setStatus("Saved new section.");
  }

  await loadList();
});

loadList();
resetForm();
