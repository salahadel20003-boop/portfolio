
// Smooth scroll للزرار
document.querySelector('.btn').addEventListener('click', () => {
  document.getElementById('projects').scrollIntoView({
    behavior: 'smooth'
  });
});


// Navbar background on scroll
window.addEventListener('scroll', () => {
  const header = document.querySelector('header');

  if (window.scrollY > 50) {
    header.style.background = 'rgba(2, 6, 23, 0.9)';
  } else {
    header.style.background = 'rgba(15, 23, 42, 0.6)';
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
const container = document.getElementById('projects-container');

fetch('http://localhost:5000/api/projects')
.then(res => res.json())
.then(projects => {
  projects.forEach(project => {
    container.insertAdjacentHTML('beforeend', `
      <div class="card fade-in">
        <img src="images/${project.img}" alt="${project.title}">
        <h3>${project.title}</h3>
        <p>${project.desc}</p>
        <button onclick="viewProject('${project.title}')">View</button>
      </div>
    `);
  });
})
.catch(err => {
  console.error('Error fetching projects:', err);
  container.innerHTML = '<p>Failed to load projects</p>';
});


// View project
function viewProject(title) {
  alert("Opening project: " + title);
}


// Contact form (UI notifications بدل alerts)
const form = document.getElementById("contact-form");

const successBox = document.getElementById("successBox");
const errorBox = document.getElementById("errorBox");

form.addEventListener("submit", function(e) {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value
  };

  fetch("http://localhost:5000/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(res => res.json())
  .then(result => {

    // نجاح
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

    // خطأ
    errorBox.style.display = "block";
    errorBox.innerText = "Error sending message ❌";

    successBox.style.display = "none";

    setTimeout(() => {
      errorBox.style.display = "none";
    }, 3000);

  });

});

document.getElementById("openSystemBtn").addEventListener("click", function () {
  window.open("projects/cashier-system/web/index.html", "_blank");
});


