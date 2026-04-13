document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("loginBtn").addEventListener("click", login);
  });
  
  async function login() {
    const username = document.getElementById("user").value;
    const password = document.getElementById("pass").value;
  
    const errorBox = document.getElementById("errorBox");
  
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
  
      const data = await res.json();
  
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/dashboard.html";
      } else {
        errorBox.style.display = "block";
        errorBox.innerText = "Wrong login ❌";
      }
  
    } catch (err) {
      console.log(err);
      errorBox.style.display = "block";
      errorBox.innerText = "Server error, try again later ⚠️";
    }
  }