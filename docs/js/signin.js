const studentsByClass = { /* same object as before */ };

const classSelect = document.getElementById("classSelect");
const nameSelect = document.getElementById("nameSelect");
const errorMsg = document.getElementById("errorMsg");

classSelect.innerHTML =
  '<option value="">-- Select class --</option>' +
  Object.keys(studentsByClass)
    .map(c => `<option>${c}</option>`).join("");

classSelect.onchange = () => {
  const cls = classSelect.value;
  nameSelect.innerHTML = cls
    ? '<option value="">-- Select name --</option>' +
      studentsByClass[cls].map(n => `<option>${n}</option>`).join("")
    : '<option>-- First choose class --</option>';
};

document.getElementById("continueBtn").onclick = () => {
  if (!classSelect.value || !nameSelect.value) {
    errorMsg.textContent = "Please select class and name.";
    return;
  }
  localStorage.setItem("ci_studentClass", classSelect.value);
  localStorage.setItem("ci_studentName", nameSelect.value);
  window.location.href = "scroll.html";
};
