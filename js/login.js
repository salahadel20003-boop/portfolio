const API_BASE = "https://portfolio-backend-production-770e.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
  const loginBtn = document.getElementById("loginBtn");
  const passwordInput = document.getElementById("pass");

  if (loginBtn) {
    loginBtn.addEventListener("click", login);
  }

  if (passwordInput) {
    passwordInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        login();
      }
    });
  }
});

async function login() {
  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("pass").value;

  const errorBox = document.getElementById("errorBox");

  errorBox.style.display = "none";
  errorBox.innerText = "";

  if (!username || !password) {
    errorBox.style.display = "block";
    errorBox.innerText = "Please enter username and password";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorBox.style.display = "block";
      errorBox.innerText = data.message || "Wrong login ❌";
      return;
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "dashboard.html";
    } else {
      errorBox.style.display = "block";
      errorBox.innerText = "Wrong login ❌";
    }

  } catch (err) {
    console.error(err);

    errorBox.style.display = "block";
    errorBox.innerText = "Server error, try again later ⚠️";
  }
}
