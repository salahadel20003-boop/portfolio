const API_BASE = "https://portfolio-backend-production-770e.up.railway.app";

const token = localStorage.getItem("token");

let allMessages = [];

if (!token) {
  window.location.href = "login.html";
}

fetch(`${API_BASE}/api/contact`, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
  .then(res => {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "login.html";
      return;
    }

    if (!res.ok) {
      throw new Error("Failed to load messages");
    }

    return res.json();
  })
  .then(data => {
    if (!data) return;

    allMessages = data;

    const container = document.getElementById("messages");

    container.innerHTML = "";

    if (!Array.isArray(data) || data.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "No messages yet.";
      container.appendChild(emptyMessage);
      return;
    }

    data.forEach((msg, index) => {
      const card = document.createElement("div");
      card.className = "card";
      card.addEventListener("click", () => openModal(index));

      const name = document.createElement("h3");
      name.textContent = msg.name || "Unknown User";

      const message = document.createElement("p");
      message.textContent = msg.message || "No message";

      const meta = document.createElement("div");
      meta.className = "meta";

      const email = document.createElement("span");
      email.textContent = msg.email || "No email";

      const date = document.createElement("span");
      date.textContent = msg.date ? new Date(msg.date).toLocaleDateString() : "";

      meta.appendChild(email);
      meta.appendChild(date);

      card.appendChild(name);
      card.appendChild(message);
      card.appendChild(meta);

      container.appendChild(card);
    });
  })
  .catch(err => {
    console.error(err);

    const container = document.getElementById("messages");

    if (container) {
      container.innerHTML = "";

      const errorMessage = document.createElement("p");
      errorMessage.textContent = "Error loading messages.";
      container.appendChild(errorMessage);
    }
  });

function openModal(index) {
  const msg = allMessages[index];

  if (!msg) return;

  document.getElementById("modalName").innerText = msg.name || "Unknown";
  document.getElementById("modalMessage").innerText = msg.message || "";
  document.getElementById("modalEmail").innerText = msg.email || "";
  document.getElementById("modalDate").innerText = msg.date
    ? new Date(msg.date).toLocaleString()
    : "";

  document.getElementById("modal").style.display = "flex";
}

const closeModal = document.getElementById("closeModal");

if (closeModal) {
  closeModal.onclick = function () {
    document.getElementById("modal").style.display = "none";
  };
}

window.onclick = function (e) {
  if (e.target.id === "modal") {
    document.getElementById("modal").style.display = "none";
  }
};
