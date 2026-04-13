const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

fetch("/api/contact", {
  headers: {
    Authorization: token
  }
})
.then(res => {
  if (res.status === 401 || res.status === 403) {
    window.location.href = "/login.html";
  }
  return res.json();
})
.then(data => {
    allMessages = data;
  const container = document.getElementById("messages");

  container.innerHTML = "";

  data.forEach((msg, index) => {
    container.innerHTML += `
      <div class="card" onclick="openModal(${index})">
        <h3>${msg.name || "Unknown User"}</h3>
        <p>${msg.message || "No message"}</p>
  
        <div class="meta">
          <span>${msg.email || "No email"}</span>
          <span>${msg.date ? new Date(msg.date).toLocaleDateString() : ""}</span>
        </div>
      </div>
    `;
  });
});
let allMessages = [];

function openModal(index) {
  const msg = allMessages[index];

  document.getElementById("modalName").innerText = msg.name || "Unknown";
  document.getElementById("modalMessage").innerText = msg.message || "";
  document.getElementById("modalEmail").innerText = msg.email || "";
  document.getElementById("modalDate").innerText = msg.date
    ? new Date(msg.date).toLocaleString()
    : "";

  document.getElementById("modal").style.display = "flex";
}

document.getElementById("closeModal").onclick = function () {
  document.getElementById("modal").style.display = "none";
};

window.onclick = function (e) {
  if (e.target.id === "modal") {
    document.getElementById("modal").style.display = "none";
  }
};