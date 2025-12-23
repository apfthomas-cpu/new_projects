const startBtn = document.getElementById("startBtn");
const intro = document.getElementById("intro");
const exercise = document.getElementById("exercise");
const scrollText = document.getElementById("scrollText");

let speed = 0.3;
let pos = -100;

startBtn.addEventListener("click", () => {
  intro.classList.add("hidden");
  exercise.classList.remove("hidden");
  requestAnimationFrame(scrollLoop);
});

function scrollLoop() {
  pos += speed;
  scrollText.style.bottom = pos + "%";
  requestAnimationFrame(scrollLoop);
}
