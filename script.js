
const rootHtml = document.documentElement;
const THEME_KEY = "ritik-portfolio-theme";

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

function applyTheme(theme) {
  rootHtml.setAttribute("data-theme", theme);
}

function initTheme() {
  const themeToggle = document.getElementById("theme-toggle");
  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const current = rootHtml.getAttribute("data-theme") === "dark" ? "dark" : "light";
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem(THEME_KEY, next);
    });
  }
}



function initNav() {
  const menuToggle = document.getElementById("menu-toggle");
  if (!menuToggle) return;

  menuToggle.addEventListener("click", () => {
    document.body.classList.toggle("nav-open");
  });

  const navLinks = document.querySelectorAll(".nav-links a");
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("nav-open");
    });
  });
}



function initReveal() {
  const revealEls = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window) || revealEls.length === 0) {
    revealEls.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.18,
    }
  );

  revealEls.forEach((el) => observer.observe(el));
}



const CONTACT_TO = "ritikpatel@asu.edu";

function buildContactPayload(name, email, subject, message) {
  const fullSubject = `Portfolio: ${subject}`;
  const body = [`Name: ${name}`, `Reply-To: ${email}`, "", "Message:", message].join("\n");
  return { fullSubject, body };
}

function buildGmailUrl(to, subject, body) {
  const params = new URLSearchParams({
    view: "cm",
    fs: "1",
    to,
    su: subject,
    body,
  });
  return `https://mail.google.com/mail/?${params.toString()}`;
}

function buildOutlookUrl(to, subject, body) {
  const params = new URLSearchParams({ to, subject, body });
  return `https://outlook.office.com/mail/deeplink/compose?${params.toString()}`;
}

function buildMailtoUrl(to, subject, body) {
  const params = new URLSearchParams({ subject, body });
  return `mailto:${to}?${params.toString()}`;
}

function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const fields = {
    name: form.querySelector("#name"),
    email: form.querySelector("#email"),
    subject: form.querySelector("#subject"),
    message: form.querySelector("#message"),
  };

  const sendOptions = document.getElementById("contact-send-options");
  const gmailLink = document.getElementById("contact-gmail-link");
  const mailtoLink = document.getElementById("contact-mailto-link");
  const outlookLink = document.getElementById("contact-outlook-link");
  const copyBtn = document.getElementById("contact-copy-btn");
  const sendNote = document.getElementById("contact-send-note");

  let lastClipboardText = "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const subject = fields.subject.value.trim();
    const message = fields.message.value.trim();

    if (!name || !email || !subject || !message) {
      form.reportValidity();
      return;
    }

    const { fullSubject, body } = buildContactPayload(name, email, subject, message);
    lastClipboardText = `To: ${CONTACT_TO}\nSubject: ${fullSubject}\n\n${body}`;

    gmailLink.href = buildGmailUrl(CONTACT_TO, fullSubject, body);
    mailtoLink.href = buildMailtoUrl(CONTACT_TO, fullSubject, body);
    outlookLink.href = buildOutlookUrl(CONTACT_TO, fullSubject, body);

    sendOptions.hidden = false;
    sendOptions.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const isLocalFile = window.location.protocol === "file:";
    sendNote.textContent = isLocalFile
      ? "You're viewing this site as a local file — browsers block auto-opening email. Click Open in Gmail (recommended) or Default email app."
      : "If nothing opened automatically, click Open in Gmail or Default email app below.";

    
    try {
      window.location.href = mailtoLink.href;
    } catch {
     
    }
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      if (!lastClipboardText) return;
      try {
        await navigator.clipboard.writeText(lastClipboardText);
        showFormToast("Message copied — paste into any email app");
      } catch {
        showFormToast("Could not copy — select and copy the text manually");
      }
    });
  }
}

function showFormToast(message) {
  const toast = document.getElementById("copy-toast");
  if (!toast) return;

  const original = toast.textContent;
  toast.textContent = message;
  toast.classList.add("copy-toast-visible");

  setTimeout(() => {
    toast.classList.remove("copy-toast-visible");
    toast.textContent = original;
  }, 2800);
}



function initYear() {
  const yearEl = document.getElementById("year");
  if (!yearEl) return;
  yearEl.textContent = new Date().getFullYear();
}



function initNavHighlight() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  if (!sections.length || !navLinks.length) return;

  const linkByHash = {};
  navLinks.forEach((a) => {
    const href = a.getAttribute("href");
    if (href && href.startsWith("#") && href.length > 1) {
      linkByHash[href.slice(1)] = a;
    }
  });

  const ratios = {};
  function setActiveFromRatios() {
    const bestId = Object.entries(ratios)
      .filter(([, r]) => r > 0)
      .sort((a, b) => b[1] - a[1])[0];
    navLinks.forEach((a) => a.classList.remove("active"));
    if (bestId && linkByHash[bestId[0]]) linkByHash[bestId[0]].classList.add("active");
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        ratios[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      setActiveFromRatios();
    },
    { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] }
  );

  sections.forEach((section) => {
    if (linkByHash[section.id]) observer.observe(section);
  });
}



function initCopyEmail() {
  const toast = document.getElementById("copy-toast");
  const links = document.querySelectorAll(".copy-email-link");
  if (!toast || links.length === 0) return;

  let hideTimeout = null;

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const email = link.getAttribute("data-email") || link.getAttribute("href")?.replace("mailto:", "") || "";
      if (!email) return;

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(() => {
          toast.classList.add("copy-toast-visible");
          if (hideTimeout) clearTimeout(hideTimeout);
          hideTimeout = setTimeout(() => {
            toast.classList.remove("copy-toast-visible");
          }, 2000);
        });
      }
    });
  });
}



const RESUME_FILES = {
  da: {
    src: "assets/RitikPatel_Resume_DA.pdf#zoom=90",
    download: "assets/RitikPatel_Resume_DA.pdf",
    title: "Ritik Rameshwar Patel – Data Analytics Resume (PDF)",
    label: "Download Data Analytics Resume (PDF)",
  },
  ml: {
    src: "assets/RitikPatel_Resume_MLAI.pdf#zoom=90",
    download: "assets/RitikPatel_Resume_MLAI.pdf",
    title: "Ritik Rameshwar Patel – ML/AI Resume (PDF)",
    label: "Download ML / AI Resume (PDF)",
  },
};

function initResumeToggle() {
  const toggleBtns = document.querySelectorAll(".resume-toggle-btn");
  const viewer = document.getElementById("resume-viewer");
  const downloadLink = document.getElementById("resume-download");
  if (!toggleBtns.length || !viewer || !downloadLink) return;

  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-resume");
      const resume = RESUME_FILES[key];
      if (!resume) return;

      toggleBtns.forEach((b) => {
        const isActive = b === btn;
        b.classList.toggle("active", isActive);
        b.setAttribute("aria-selected", isActive ? "true" : "false");
      });

      viewer.src = resume.src;
      viewer.title = resume.title;
      downloadLink.href = resume.download;
      downloadLink.querySelector("span").textContent = resume.label;
    });
  });
}



document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initNav();
  initReveal();
  initNavHighlight();
  initContactForm();
  initYear();
  initCopyEmail();
  initResumeToggle();
});

