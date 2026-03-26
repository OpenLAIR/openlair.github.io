(() => {
  "use strict";

  // ---- Theme Toggle ----
  const html = document.documentElement;
  const toggle = document.getElementById("themeToggle");
  const stored = localStorage.getItem("drclaw-theme");

  if (stored) {
    html.setAttribute("data-theme", stored);
  } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    html.setAttribute("data-theme", "light");
  }

  toggle?.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    localStorage.setItem("drclaw-theme", next);
  });

  // ---- Mobile Menu ----
  const mobileToggle = document.getElementById("mobileToggle");
  const navLinks = document.querySelector(".nav-links");

  mobileToggle?.addEventListener("click", () => {
    navLinks?.classList.toggle("open");
  });

  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => navLinks?.classList.remove("open"));
  });

  // ---- Tabs ----
  document.querySelectorAll(".tabs").forEach((tabGroup) => {
    tabGroup.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        const target = btn.dataset.tab;
        tabGroup.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
        btn.classList.add("active");
        const parent = tabGroup.parentElement;
        parent.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
        const panel = parent.querySelector(`#tab-${target}`);
        panel?.classList.add("active");
      });
    });
  });

  // ---- Lightbox ----
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");

  document.querySelectorAll("[data-lightbox]").forEach((card) => {
    card.addEventListener("click", () => {
      lightboxImg.src = card.dataset.lightbox;
      lightbox?.classList.add("open");
      document.body.style.overflow = "hidden";
    });
  });

  function closeLightbox() {
    lightbox?.classList.remove("open");
    document.body.style.overflow = "";
  }

  lightbox?.addEventListener("click", (e) => {
    if (e.target !== lightboxImg) closeLightbox();
  });

  document.querySelector(".lightbox-close")?.addEventListener("click", closeLightbox);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  // ---- Terminal Typing Animation ----
  const terminalEl = document.getElementById("terminalOutput");

  const lines = [
    { type: "prompt", text: "$ " },
    { type: "cmd", text: "cd ~/my-research-project", delay: 40 },
    { type: "newline" },
    { type: "prompt", text: "$ " },
    { type: "cmd", text: "claude --model opus", delay: 40 },
    { type: "newline" },
    { type: "newline" },
    { type: "comment", text: "╭─ Claude Code (opus) ─────────────────────────╮" },
    { type: "newline" },
    { type: "comment", text: "│  Dr. Claw skills auto-discovered: 48 skills  │" },
    { type: "newline" },
    { type: "comment", text: "╰───────────────────────────────────────────────╯" },
    { type: "newline" },
    { type: "newline" },
    { type: "prompt", text: "> " },
    { type: "cmd", text: 'Read .claude/skills/inno-deep-research/SKILL.md and research "lightweight LLM routing"', delay: 25 },
    { type: "newline" },
    { type: "newline" },
    { type: "success", text: "Reading skill: inno-deep-research..." },
    { type: "newline" },
    { type: "success", text: "Searching arXiv, Semantic Scholar..." },
    { type: "newline" },
    { type: "success", text: "Synthesizing 23 papers with citations..." },
    { type: "newline" },
    { type: "success", text: "Survey report saved to Survey/reports/" },
    { type: "newline" },
    { type: "newline" },
    { type: "prompt", text: "> " },
    { type: "cursor" },
  ];

  async function typeTerminal() {
    if (!terminalEl) return;
    terminalEl.innerHTML = "";

    for (const line of lines) {
      if (line.type === "newline") {
        terminalEl.appendChild(document.createTextNode("\n"));
        continue;
      }

      if (line.type === "cursor") {
        const cursor = document.createElement("span");
        cursor.className = "cursor-blink";
        terminalEl.appendChild(cursor);
        continue;
      }

      const span = document.createElement("span");
      span.className = line.type;
      terminalEl.appendChild(span);

      if (line.delay) {
        for (const ch of line.text) {
          span.textContent += ch;
          await sleep(line.delay);
        }
      } else {
        span.textContent = line.text;
        await sleep(20);
      }
    }
  }

  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        typeTerminal();
      }
    },
    { threshold: 0.3 }
  );

  if (terminalEl) {
    observer.observe(terminalEl);
  }
})();
