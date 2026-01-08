// docs/js/instructions.js
import { getSession } from "./session.js";

// Simple section descriptions (no Firebase yet)
const SECTIONS = {
  scroll: {
    sectionLabel: "SECTION 1",
    heading: "SCROLLING TEXT EXERCISE",
    body: [
      "In this section, you will see a passage that scrolls upwards.",
      "Read carefully and click on any mistakes in spelling or grammar as they appear.",
      "The more mistakes you correctly identify, the higher your score."
    ],
    targetPage: "scroll.html"
  },
  algebra: {
    sectionLabel: "SECTION 2",
    heading: "ALGEBRA – MULTIPLE CHOICE",
    body: [
      "In this section, you will see algebra questions shown as images.",
      "For each question, choose the correct answer from A, B, C, or D before the time runs out.",
      "Your score depends on how many questions you answer correctly."
    ],
    targetPage: "algebra.html"
  }
};

const params = new URLSearchParams(window.location.search);
const sectionId = params.get("section");

const labelEl = document.getElementById("sectionLabel");
const headingEl = document.getElementById("instrHeading");
const bodyEl = document.getElementById("instrBody");
const startBtn = document.getElementById("startBtn");

const session = getSession(); // not strictly needed here, but future-proof

if (!sectionId || !SECTIONS[sectionId]) {
  labelEl.textContent = "ERROR";
  headingEl.textContent = "Unknown section";
  bodyEl.innerHTML = `<p class="instr-text">No section specified or section not recognised.</p>`;
  startBtn.disabled = true;
} else {
  const cfg = SECTIONS[sectionId];
  labelEl.textContent = cfg.sectionLabel;
  headingEl.textContent = cfg.heading;

  bodyEl.innerHTML = "";
  cfg.body.forEach(line => {
    const p = document.createElement("p");
    p.className = "instr-text";
    p.textContent = line;
    bodyEl.appendChild(p);
  });

  startBtn.disabled = false;
  startBtn.onclick = () => {
    // We always go to the correct section page
    window.location.href = `${cfg.targetPage}`;
  };
}
