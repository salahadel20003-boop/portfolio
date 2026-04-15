const API_BASE = "https://portfolio-backend-production-770e.up.railway.app";

// Smooth scroll للزرار
const workButton = document.querySelector(".btn");

if (workButton) {
  workButton.addEventListener("click", () => {
    document.getElementById("projects").scrollIntoView({
      behavior: "smooth"
    });
  });
}

// Navbar background on scroll
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");

  if (window.scrollY > 50) {
    header.style.background = "rgba(2, 6, 23, 0.9)";
  } else {
    header.style.background = "rgba(15, 23, 42, 0.6)";
  }
});

// Active nav link + scroll spy
const links = document.querySelectorAll("nav a");
const sections = document.querySelectorAll("section");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(sec => {
    const top = sec.offsetTop;

    if (window.scrollY >= top - 120) {
      current = sec.id;
    }
  });

  links.forEach(link => {
    link.classList.remove("active");

    if (link.getAttribute("href") === "#" + current) {
      link.classList.add("active");
    }
  });
});

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, {
  threshold: 0.1
});

document.querySelectorAll(".fade-in").forEach(el => {
  observer.observe(el);
});

// Dynamic Projects
const container = document.getElementById("projects-container");

if (container) {
  fetch(`${API_BASE}/api/projects`)
    .then(res => {
      if (!res.ok) {
        throw new Error("Failed to load projects");
      }

      return res.json();
    })
    .then(projects => {
      projects.forEach(project => {
        const card = document.createElement("div");
        card.className = "project-card fade-in";

        const img = document.createElement("img");
        img.src = `images/${project.img}`;
        img.alt = project.title || "Project image";

        const overlay = document.createElement("div");
        overlay.className = "overlay";

        const title = document.createElement("h3");
        title.textContent = project.title || "Untitled Project";

        const button = document.createElement("button");
        button.textContent = "View";
        button.addEventListener("click", () => {
          viewProject(project.title || "Project");
        });

        overlay.appendChild(title);
        overlay.appendChild(button);

        card.appendChild(img);
        card.appendChild(overlay);

        container.appendChild(card);
        observer.observe(card);
      });
    })
    .catch(err => {
      console.error("Error fetching projects:", err);
    });
}

// View project
function viewProject(title) {
  alert("Opening project: " + title);
}

// Contact form
const form = document.getElementById("contact-form");
const successBox = document.getElementById("successBox");
const errorBox = document.getElementById("errorBox");

if (form) {
  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      message: document.getElementById("message").value.trim()
    };

    fetch(`${API_BASE}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error("Failed to send message");
        }

        return res.json();
      })
      .then(result => {
        successBox.style.display = "block";
        successBox.innerText = "Message sent successfully ✅";

        errorBox.style.display = "none";

        form.reset();

        setTimeout(() => {
          successBox.style.display = "none";
        }, 3000);
      })
      .catch(err => {
        console.error(err);

        errorBox.style.display = "block";
        errorBox.innerText = "Error sending message ❌";

        successBox.style.display = "none";

        setTimeout(() => {
          errorBox.style.display = "none";
        }, 3000);
      });
  });
}

// Open cashier project
const openSystemBtn = document.getElementById("openSystemBtn");

if (openSystemBtn) {
  openSystemBtn.addEventListener("click", function () {
    window.open("https://salahadel20003-boop.github.io/restaurant-system/", "_blank");
  });
}
