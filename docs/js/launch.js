const video = document.getElementById("introVideo");
const videoStage = document.getElementById("video-stage");
const welcomeStage = document.getElementById("welcome-stage");
const enterBtn = document.getElementById("enterBtn");

function showWelcome() {
  videoStage.style.display = "none";
  welcomeStage.classList.remove("hidden");
}

video.addEventListener("ended", showWelcome);
video.addEventListener("click", showWelcome);

enterBtn.addEventListener("click", () => {
  navigateWithFade("signin.html");
});
