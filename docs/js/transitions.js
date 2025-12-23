// docs/js/transitions.js
window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("page-visible");
});

export function navigateWithFade(url) {
  document.body.classList.remove("page-visible");
  setTimeout(() => (window.location.href = url), 450);
}
