import { navigateWithFade } from "./transitions.js";

const video = document.getElementById("introVideo");
const videoStage = document.getElementById("video-stage");
const welcomeStage = document.getElementById("welcome-stage");
const enterBtn = document.getElementById("enterBtn");

function showWelcome(){
  videoStage.style.display = "none";
  welcomeStage.classList.remove("hidden");
  document.body.classList.add("page-visible");
}

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-visible");
});

video.addEventListener("ended", showWelcome);
video.addEventListener("click", showWelcome); // tap to skip on mobile

enterBtn.addEventListener("click", () => navigateWithFade("signin.html"));
