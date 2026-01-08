// docs/js/algebra.js
import {
  getSession,
  saveSectionResult,
  getNextSectionId
} from "./session.js";

const BASE_TIME = 8;

// Configure your questions here
const algebraQuestions = [
  {
    img: "1.jpg",
    time: 8,
    options: ["A", "B", "C", "D"],
    correct: "C"
  },
  {
    img: "2.jpg",
    time: 10,
    options: ["A", "B", "C", "D"],
    correct: "B"
  },
  {
    img: "3.jpg",
    options: ["A", "B", "C", "D"],
    correct: "A"
  }
];

let current = 0;
let timerInterval = null;
let score = 0;

const s = getSession();
const userEl = document.getElementById("algUser");
if (s.user) {
  userEl.textContent = `${s.user.name} – ${s.user.className || ""}`;
} else {
  userEl.textContent = "Anonymous user";
}

const timerEl = document.getElementById("timer");
const imgEl = document.getElementById("questionImage");
const optionsContainer = document.getElementById("options");

function loadQuestion() {
  const q = algebraQuestions[current];
  let remaining = q.time ?? BASE_TIME;

  timerEl.textContent = remaining;
  imgEl.src = `media/algebra/${q.img}`;

  optionsContainer.innerHTML = "";
  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "opt-btn";
    btn.textContent = opt;
    btn.onclick = () => selectOption(opt);
    optionsContainer.appendChild(btn);
  });

  if (timerInterval) clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    remaining--;
    timerEl.textContent = remaining;

    if (remaining <= 0) {
      clearInterval(timerInterval);
      revealCorrect();
      setTimeout(nextQuestion, 1000);
    }
  }, 1000);
}

function selectOption(opt) {
  clearInterval(timerInterval);

  const q = algebraQuestions[current];
  const correct = q.correct;

  const buttons = [...document.querySelectorAll(".opt-btn")];

  buttons.forEach(b => {
    if (b.textContent === correct) b.classList.add("correct");
    else if (b.textContent === opt) b.classList.add("wrong");
    b.disabled = true;
  });

  if (opt === correct) score++;

  setTimeout(nextQuestion, 1000);
}

function revealCorrect() {
  const q = algebraQuestions[current];
  const buttons = [...document.querySelectorAll(".opt-btn")];

  buttons.forEach(b => {
    if (b.textContent === q.correct) b.classList.add("correct");
    else b.classList.add("disabled");
    b.disabled = true;
  });
}

function nextQuestion() {
  current++;
  if (current >= algebraQuestions.length) {
    endAlgebraSection();
    return;
  }
  loadQuestion();
}

function endAlgebraSection() {
  saveSectionResult("algebra", {
    score,
    maxScore: algebraQuestions.length,
    finishedAt: Date.now()
  });

  const nextId = getNextSectionId("algebra");
  if (nextId) {
    window.location.href = `instructions.html?section=${nextId}`;
  } else {
    window.location.href = "results.html";
  }
}

loadQuestion();
