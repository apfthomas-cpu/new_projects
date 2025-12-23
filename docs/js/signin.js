const form = document.getElementById("signinForm");
const classSelect = document.getElementById("classSelect");
const nameInput = document.getElementById("nameInput");
const errorMsg = document.getElementById("errorMsg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const cls = classSelect.value.trim();
  const name = nameInput.value.trim();

  if (!cls) {
    errorMsg.textContent = "Please select your class.";
    return;
  }
  if (!name) {
    errorMsg.textContent = "Please enter your name.";
    return;
  }

  localStorage.setItem("ci_studentClass", cls);
  localStorage.setItem("ci_studentName", name);

  navigateWithFade("scroll.html");
});
