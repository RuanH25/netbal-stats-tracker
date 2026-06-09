let deferredPrompt = null;

function showToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

function openNewGame() {
  window.location.href = "app.html";
}

function openSignup() {
  showToast();
}

function openDemo() {
  const home = document.getElementById("home");
  const demo = document.getElementById("demoScreen");

  if (home) home.style.display = "none";
  if (demo) demo.style.display = "block";

  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  });
}

function goHome() {
  const home = document.getElementById("home");
  const demo = document.getElementById("demoScreen");

  if (demo) demo.style.display = "none";
  if (home) home.style.display = "block";

  window.scrollTo(0, 0);
}

function dismissInstallBanner() {
  const installBanner = document.getElementById("installBanner");
  if (installBanner) installBanner.style.display = "none";
  localStorage.setItem("installBannerDismissed", "true");
}

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredPrompt = event;

  if (!window.matchMedia("(display-mode: standalone)").matches) {
    const installBtn = document.getElementById("installBtn");
    if (installBtn) {
      installBtn.style.display = "inline-flex";
      installBtn.textContent = "Install App";
    }
  }
});

window.addEventListener("load", () => {
  if (window.matchMedia("(display-mode: standalone)").matches) {
    const installBtn = document.getElementById("installBtn");
    const installBanner = document.getElementById("installBanner");
    if (installBtn) installBtn.style.display = "none";
    if (installBanner) installBanner.style.display = "none";
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js").then(registration => {
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          if (confirm("A new version of Netball Stats is available. Reload to update?")) {
            window.location.reload();
          }
        }
      });
    });
  });
}
