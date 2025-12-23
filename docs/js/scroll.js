const scrollContent = document.getElementById("scrollContent");
const scrollViewport = document.getElementById("scrollViewport");
const scrollTitle = document.getElementById("scrollTitle");
const scoreEl = document.getElementById("score");

let y = 0;
let speed = 0.4; // smooth base speed
let score = 0;

// Example text (later this comes from Firebase)
const title = "The Silent Takeover: Are We Trading Our Humanity for Convenience?";
const text = `Imagine this: it’s 2045. Your AI-powered home assistant, “Nexus,” wakes you with gentle light and the scent of fresh reign. It has already analysed your sleep patterns, ordered groceries based on your fridges contents, and summarised your schoolwork.

Your breakfast, prepared by a robotic chef, is perfectly nutritious. A self-driving pod whisks you to school, while drone cleaners buzz around your home. Your social life is currated by algorithms suggesting friends and activities.

Every task, every potential hassle, is managed by silent, efficient machines. It sounds like a utopia, doesn’t it? But beneath this seamless surface, a quiet revolution is occurring.`;

// Mistakes list (words user should identify)
const mistakes = ["reign", "fridges", "currated"];

scrollTitle.textContent = title;

// Build clickable word spans
function buildText(text) {
  scrollContent.innerHTML = "";
  const words = text.split(/\s+/);

  words.forEach(word => {
    const clean = word.replace(/[^\w’]/g, "");
    const span = document.createElement("span");
    span.textContent = word + " ";
    span.classList.add("word");

    span.addEventListener("click", () => {
      span.classList.toggle("bold");

      if (mistakes.includes(clean)) {
        score++;
        speed += 0.1; // increase smoothly
        scoreEl.textContent = `Score: ${score}`;
      }
    });

    scrollContent.appendChild(span);
  });
}

buildText(text);

// Start below viewport
function resetPosition() {
  y = scrollViewport.offsetHeight;
}

resetPosition();

function animate() {
  y -= speed;
  scrollContent.style.transform = `translate(-50%, ${y}px)`;

  if (y < -scrollContent.offsetHeight) {
    resetPosition();
  }

  requestAnimationFrame(animate);
}

animate();
