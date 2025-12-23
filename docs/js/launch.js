const video = document.getElementById("introVideo");
const videoStage = document.getElementById("video-stage");
const welcomeStage = document.getElementById("welcome-stage");
const enterBtn = document.getElementById("enterBtn");

// When video ends, show welcome
video.addEventListener("ended", showWelcome);

// Fallback: if autoplay fails, click video to continue
video.addEventListener("click", showWelcome);

function showWelcome() {
  videoStage.style.display = "none";
  welcomeStage.classList.remove("hidden");
}

// Enter button → go to sign-in page
enterBtn.addEventListener("click", () => {
  window.location.href = "signin.html";
});
