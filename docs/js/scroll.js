document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("scrollContent");
  const titleEl = document.getElementById("scrollTitle");
  const scoreEl = document.getElementById("score");

  // Example fallback text (until Firestore wired in)
  const scrollData = {
    title: "The Silent Takeover",
    text: `Imagine this: it’s 2045. Your AI-powered home assistant, “Nexus,” wakes you with gentle light and the scent of fresh reign. It has already analysed your sleep patterns, ordered groceries based on your fridges contents, and summarised your schoolwork.

Your breakfast, prepared by a robotic chef, is perfectly nutritious. A self-driving pod whisks you to school, while drone cleaners buzz around your home. Your social life is curated by algorithms suggesting friends and activities.

Every task, every potential hassle, is managed by silent, efficient machines. It sounds like a utopia, doesn’t it? But beneath this seamless surface, a quiet revolution is occurring.`,
    baseSpeed: 30
  };

  // Inject content
  titleEl.textContent = scrollData.title;
  content.innerText = scrollData.text;
  scoreEl.textContent = "Score: 0";

  const scrollWindow = document.querySelector(".scroll-window");

  let position = scrollWindow.offsetHeight; // start below window
  let speed = scrollData.baseSpeed / 100;   // convert to px per frame-ish

  function animate() {
    position -= speed;
    content.style.top = position + "px";

    // Stop when text fully leaves the window
    if (position + content.offsetHeight > 0) {
      requestAnimationFrame(animate);
    }
  }

  // Wait a tick so layout is ready
  setTimeout(() => {
    position = scrollWindow.offsetHeight;
    content.style.top = position + "px";
    animate();
  }, 100);
});
