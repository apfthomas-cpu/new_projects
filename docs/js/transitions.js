// Fade in on load
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-visible");
});

// Fade out then navigate
function navigateWithFade(url) {
  document.body.classList.remove("page-visible");
  setTimeout(() => {
    window.location.href = url;
  }, 500);
}
