const wrapper = document.getElementById("scroll-wrapper");
const text = document.getElementById("scroll-text");

text.innerHTML = `<!-- DROP ANY TEXT / HTML SECTION HERE -->`;

const mistakes = ["Apples","wite","eligance","Ultimitely"];

let y = 0, speed = 12, running = false, ended = false;

text.querySelectorAll("p").forEach(p => {
  p.innerHTML = p.innerText.split(" ")
    .map(w => `<span class="word">${w}</span>`).join(" ");
});

document.querySelectorAll(".word").forEach(w => {
  w.onclick = () => {
    if (!running) return;
    w.classList.add(mistakes.includes(w.innerText) ? "correct" : "incorrect");
  };
});

document.getElementById("start-btn").onclick = () => {
  document.getElementById("launch-overlay").style.display = "none";
  wrapper.style.display = "block";
  y = wrapper.clientHeight * 0.5;
  running = true;
};

function loop() {
  if (running && !ended) {
    y -= speed * 0.016;
    text.style.top = y + "px";
    if (y + text.offsetHeight < 0) {
      ended = true;
      document.getElementById("end-overlay").style.display = "flex";
    }
  }
  requestAnimationFrame(loop);
}
loop();
