import { db } from "./firebase.js";
import { navigateWithFade } from "./transitions.js";
import {
  collection, addDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-visible");
});

const form = document.getElementById("signinForm");
const classSelect = document.getElementById("classSelect");
const nameInput = document.getElementById("nameInput");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cls = classSelect.value.trim();
  const name = nameInput.value.trim();

  if (!cls || !name){
    errorMsg.textContent = "Please complete all fields.";
    return;
  }

  errorMsg.textContent = "";

  // store locally (useful across pages)
  localStorage.setItem("cg_studentClass", cls);
  localStorage.setItem("cg_studentName", name);

  // create an attempt in Firestore (score will accumulate across sections)
  const attemptsRef = collection(db, "attempts");

  const attemptDoc = await addDoc(attemptsRef, {
    name,
    class: cls,
    startedAt: serverTimestamp(),
    finishedAt: null,
    totalScore: 0,
    sectionScores: {},    // { [sectionId]: { score, maxScore, type, title } }
    sectionOrder: [],     // list of completed sectionIds in order
  });

  localStorage.setItem("cg_attemptId", attemptDoc.id);

  navigateWithFade("scroll.html");
});
