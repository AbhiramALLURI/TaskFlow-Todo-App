document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("user-form");
    const error = document.getElementById("error");
    const nameInput = document.getElementById("name");
    const dobInput = document.getElementById("dob");
  
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) window.location.href = "app.html";
  
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const dob = new Date(dobInput.value);
      const age = new Date().getFullYear() - dob.getFullYear();
  
      if (!name || !dobInput.value) {
        error.textContent = "All fields are required.";
      } else if (age <= 10) {
        error.textContent = "Age must be over 10.";
      } else {
        localStorage.setItem("user", JSON.stringify({ name, dob: dobInput.value }));
        window.location.href = "app.html";
      }
    });
  });