const loaderScreen = document.querySelector(".loader-screen");
const progressBar = document.querySelector(".progress-bar");
const percentage = document.querySelector(".percentage");
const loadingText = document.querySelector(".loading-text");
const contentCard = document.querySelector(".content-card");
const projectsCard = document.querySelector(".projects-card");
const continueButton = document.querySelector(".continue-btn");
const backButton = document.querySelector(".back-btn");
const projectSearch = document.querySelector(".project-search");
const projectCategory = document.querySelector(".project-category");
const launcherThemeButton = document.querySelector(".launcher-theme");
const projectLinks = document.querySelectorAll(".project-link");

let progress = 0;

let loadingFinished = false;

const loading = setInterval(() => {
  progress++;

  progressBar.style.width = `${progress}%`;
  percentage.textContent = `${progress}%`;

  // Change loading text
  if (progress >= 30 && progress < 60) {
    loadingText.textContent = "Loading projects...";
  } else if (progress >= 60 && progress < 90) {
    loadingText.textContent = "Almost ready...";
  } else if (progress >= 90) {
    loadingText.textContent = "Finishing up...";
  }

  // Loading finished
  if (progress >= 100) {
    clearInterval(loading);

    loadingFinished = true;

    finishLoading();
  }
}, 20);

function finishLoading() {
  setTimeout(() => {
    loaderScreen.classList.add("hide");
  }, 500);
}

function openProjects() {
  // Don't allow opening before loading
  if (!loadingFinished) {
    return;
  }

  contentCard.classList.add("hide");
  projectsCard.classList.add("show");
}

function closeProjects() {
  projectsCard.classList.remove("show");

  contentCard.classList.remove("hide");
}

continueButton.addEventListener("click", openProjects);

backButton.addEventListener("click", closeProjects);

function filterProjects() {
  const query = projectSearch.value.trim().toLowerCase();
  projectLinks.forEach((link) => {
    const matchesSearch = link.textContent.toLowerCase().includes(query);
    const matchesCategory =
      projectCategory.value === "all" ||
      link.dataset.category === projectCategory.value;
    link.hidden = !matchesSearch || !matchesCategory;
  });
}

projectSearch.addEventListener("input", filterProjects);
projectCategory.addEventListener("change", filterProjects);

function setLauncherTheme(theme) {
  document.body.classList.toggle("light-theme", theme === "light");
  launcherThemeButton.textContent =
    theme === "light" ? "Dark theme" : "Light theme";
  localStorage.setItem("launcher-theme", theme);
}
launcherThemeButton.addEventListener("click", () =>
  setLauncherTheme(
    document.body.classList.contains("light-theme") ? "dark" : "light",
  ),
);
setLauncherTheme(localStorage.getItem("launcher-theme") || "dark");
