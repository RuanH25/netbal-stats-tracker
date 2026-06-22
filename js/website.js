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

const navbar = document.querySelector('.home-nav');

window.addEventListener('scroll', () => {

  if (window.scrollY > 40) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

});

const sections = [
  {
    section: document.getElementById("features"),
    nav: document.getElementById("nav-features")
  },
  {
    section: document.getElementById("preview"),
    nav: document.getElementById("nav-preview")
  },
  {
    section: document.getElementById("stats"),
    nav: document.getElementById("nav-impact")
  }
];

window.addEventListener("scroll", () => {

  let current = null;

  sections.forEach(item => {

    const top = item.section.offsetTop - 180;
    const bottom = top + item.section.offsetHeight;

    if (
      window.scrollY >= top &&
      window.scrollY < bottom
    ) {
      current = item.nav;
    }

  });

  document
    .querySelectorAll(".nav-links a")
    .forEach(link =>
      link.classList.remove("active-link")
    );

  if (current) {
    current.classList.add("active-link");
  }

});

const logo = document.querySelector('.logo');

logo.addEventListener('click', () => {

  logo.classList.add('logo-burst');

  setTimeout(() => {
    logo.classList.remove('logo-burst');
  }, 1000);

});

function openFeatureModal(type) {

  const modal = document.getElementById("featureModal");

  const title =
    document.getElementById("modalTitle");

  const description =
    document.getElementById("modalDescription");

  const image =
    document.getElementById("modalImage");

  const features =
    document.getElementById("modalFeatures");

  if(type === "analytics"){

    title.textContent =
      "Player Analytics";

    description.textContent =
       "Turn match statistics into meaningful player insights. Identify your most effective attackers, strongest defenders and most consistent performers with advanced analytics captured throughout every quarter.";

    image.src =
      "assets/images/Player stats.jpg";

    features.innerHTML = `
      <li>Identify MVP performances instantly</li>
      <li>Compare player efficiency across matches</li>
      <li>Spot strengths and development areas</li>
      <li>Track player growth throughout the season</li>
      <li>Support smarter team selections</li>
    `;
   document.getElementById("modalHighlight").innerHTML =
    `
    🏆 Perfect for coaches who want deeper player insights without spending hours analysing spreadsheets.
    `;
  }

  if(type === "reports"){

    title.textContent =
      "Smart Reports";

    description.textContent =
       "Transform raw match statistics into professional reports that coaches and teams can understand instantly. Review key moments, standout performers and team trends without manually compiling data.";

    image.src =
      "assets/images/stats.jpg";

    features.innerHTML = `
      <li>Automatically generate match summaries</li>
      <li>Highlight standout player performances</li>
      <li>Review team trends and efficiencies</li>
      <li>Create professional reports in seconds</li>
      <li>Share insights with coaches and teams</li>
    `;
    document.getElementById("modalHighlight").innerHTML =
    `
    📊 Turn every match into actionable insights with reports designed for coaches, analysts and performance-driven teams.
    `;
  }

  if(type === "security"){

    title.textContent =
      "Secure & Reliable";

    description.textContent =
       "Focus on coaching while we protect your data. Every match, statistic and report is securely stored, backed up and available whenever you need it.";

    image.src =
      "assets/images/security.jpg";

    features.innerHTML = `
      <li>Automatic cloud backups</li>
      <li>Protection against data loss</li>
      <li>Access from multiple devices</li>
      <li>Reliable and secure storage</li>
      <li>Built for future team collaboration</li>
    `;
    document.getElementById("modalHighlight").innerHTML =
    `
    🛡️ Your data is one of your most valuable assets. Netball Stats Pro is built to keep it safe, accessible and protected.
    `;
  }

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeFeatureModal(){

  document
    .getElementById("featureModal")
    .classList
    .remove("active");

  document.body.style.overflow = "";
}

function openRoadmap() {

  document
    .getElementById("roadmapModal")
    .classList
    .add("active");

  document.body.style.overflow = "hidden";

}

function closeRoadmap() {
  
  document
    .getElementById("roadmapModal")
    .classList
    .remove("active");
  document.body.style.overflow = "";
}

const roadmapObserver =
new IntersectionObserver((entries)=>{

  entries.forEach(entry=>{

    if(entry.isIntersecting){

      entry.target.classList.add("visible");

    }else {

      entry.target.classList.remove("visible");

    }

  });

},{
  threshold:0.25
});

document
.querySelectorAll(".roadmap-stop")
.forEach(stop=>{

  roadmapObserver.observe(stop);

});

const slides =
document.querySelectorAll(".preview-carousel .slide");

let current = 0;

function updateCarousel(){

  slides.forEach((slide,index)=>{

    let position =
      (index - current + slides.length)
      % slides.length;

    slide.className =
      `slide pos-${position}`;

  });

}

updateCarousel();

setInterval(()=>{

  current++;

  if(current >= slides.length){

    current = 0;

  }

  updateCarousel();

},5000);

function openInfoModal(type){

  const modal =
    document.getElementById("infoModal");

  const title =
    document.getElementById("infoTitle");

  const body =
    document.getElementById("infoBody");

  if(type === "about"){

    title.textContent =
      "Why Netball Stats Pro Exists";

    body.innerHTML = `

      <div class="about-highlight">
        Building the future of netball analytics,
        one match at a time.
      </div>

      <p>
        Netball Stats Pro started from a simple idea:
        performance data should be easy to collect,
        understand and use.
      </p>

      <h3>The Problem</h3>

      <p>
        Many teams still rely on manual notes,
        spreadsheets and time-consuming analysis.
      </p>

      <h3>The Vision</h3>

      <p>
        Professional analytics for every team.
      </p>

    `;
  }

  if(type === "contact"){

    title.textContent =
      "Contact";

    body.innerHTML = `

      <p>
        We'd love to hear from you.
      </p>

      <h3>Email</h3>

      <p>
        info@netballstatspro.com
      </p>

      <h3>Response Time</h3>

      <p>
        We aim to respond within 24–48 hours.
      </p>

    `;
  }

  if(type === "faq"){

    title.textContent =
      "Frequently Asked Questions";

    body.innerHTML = `

      <h3>What devices are supported?</h3>

      <p>
        Netball Stats Pro works on modern
        phones, tablets and desktops.
      </p>

      <h3>Is cloud sync available?</h3>

      <p>
        Cloud Sync is currently in development.
      </p>

      <h3>Will there be AI features?</h3>

      <p>
        Yes. AI Tactical Insights are part
        of our future roadmap.
      </p>

    `;
  }

  if(type === "support"){

    title.textContent =
      "Support";

    body.innerHTML = `

      <p>
        Need assistance?
      </p>

      <h3>Bug Reports</h3>

      <p>
        Report issues and unexpected behaviour.
      </p>

      <h3>Feature Requests</h3>

      <p>
        Suggest improvements and future ideas.
      </p>

    `;
  }

  modal.classList.add("active");

  document.body.style.overflow =
    "hidden";
}

function closeInfoModal(){

  document
    .getElementById("infoModal")
    .classList
    .remove("active");

  document.body.style.overflow = "";

}
