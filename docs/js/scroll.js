const scrollContent = document.getElementById("scrollContent");
const scoreEl = document.getElementById("score");
const endOverlay = document.getElementById("endOverlay");
const continueBtn = document.getElementById("continueBtn");

let score = 0;
let position = 0;
let lastTime = performance.now();
let pixelsPerSecond = 14;
let targetSpeed = 14;
let started = false;
let ended = false;

/* Demo text (replace later with Firebase) */
const text = `
<p>This is a fallback passage so the scroll still works.</p>
<p>Click the word mistake to test scoring and speed.</p>
<p>Everything else should be marked incorrect.</p>
<p>The text will smoothly scroll upward until complete.</p>
<p>Try clicking mistake again for speed boost.</p>
`;

const mistakes = ["mistake"];

/* Build content */
function initText(raw) {
  scrollContent.innerHTML = raw;
  scrollContent.querySelectorAll("p").forEach(p => {
    p.innerHTML = p.innerText
      .split(" ")
      .map(w => `<span class="word">${w}</span>`)
      .join(" ");
  });

  document.querySelectorAll(".word").forEach(span => {
    span.addEventListener("click", () => {
      if (!started || ended) return;

      if (mistakes.includes(span.innerText)) {
        if (!span.classList.contains("correct")) {
          span.classList.add("correct");
          score++;
          targetSpeed += 5;
          scoreEl.textContent = `Score: ${score}`;
        }
      }
      // Do nothing for wrong clicks (no red marking)
    });
  });

  position = scrollContent.parentElement.clientHeight;
  scrollContent.style.top = position + "px";
  started = true;
}

initText(text);

/* Smooth scroll loop */
function scrollLoop(t) {
  const delta = (t - lastTime) / 1000;
  lastTime = t;

  if (started && !ended) {
    pixelsPerSecond += (targetSpeed - pixelsPerSecond) * 0.05;
    position -= pixelsPerSecond * delta;
    scrollContent.style.top = position + "px";

    const h = scrollContent.offsetHeight;
    if (position + h <= 0) {
      ended = true;
      endOverlay.classList.remove("hidden");
    }
  }

  requestAnimationFrame(scrollLoop);
}

requestAnimationFrame(scrollLoop);

/* Continue button */
continueBtn.addEventListener("click", () => {
  // TODO: change to next section when ready
  window.location.href = "#";
});
