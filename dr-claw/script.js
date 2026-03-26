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
    { type: "cmd", text: "cd ~/my-research-project && claude", delay: 40 },
    { type: "newline" },
    { type: "newline" },
    { type: "comment", text: "╭─ Claude Code ──────────────────────────────────────╮" },
    { type: "newline" },
    { type: "comment", text: "│  Dr. Claw skills auto-discovered: 48 skills       │" },
    { type: "newline" },
    { type: "comment", text: "│  Project: lightweight-routers                      │" },
    { type: "newline" },
    { type: "comment", text: "╰────────────────────────────────────────────────────╯" },
    { type: "newline" },
    { type: "newline" },
    { type: "prompt", text: "> " },
    { type: "cmd", text: "Research lightweight LLM routing methods and write a paper about it.", delay: 30 },
    { type: "newline" },
    { type: "newline" },
    { type: "thinking", text: "  Thinking..." },
    { type: "newline" },
    { type: "thinking", text: "  Planning research pipeline using inno-pipeline-planner..." },
    { type: "pause", ms: 800 },
    { type: "newline" },
    { type: "newline" },
    { type: "phase", text: "  [Survey]" },
    { type: "dim", text: "      Searching arXiv, Semantic Scholar..." },
    { type: "newline" },
    { type: "success", text: "                  ✓ 37 papers collected, 12 selected" },
    { type: "newline" },
    { type: "phase", text: "  [Ideation]" },
    { type: "dim", text: "    Generating ideas via SCAMPER + SWOT..." },
    { type: "newline" },
    { type: "success", text: "                  ✓ 5 ideas scored, top: \"Hybrid embedding router\"" },
    { type: "newline" },
    { type: "phase", text: "  [Experiment]" },
    { type: "dim", text: "  Running plan → implement → judge loop..." },
    { type: "newline" },
    { type: "success", text: "                  ✓ 3 baselines, 2 ablations, all passing" },
    { type: "newline" },
    { type: "phase", text: "  [Paper]" },
    { type: "dim", text: "       Drafting IEEE-format manuscript..." },
    { type: "newline" },
    { type: "success", text: "                  ✓ 6,200 words, 23 citations verified" },
    { type: "newline" },
    { type: "phase", text: "  [Promotion]" },
    { type: "dim", text: "   Generating slides + audio narration..." },
    { type: "newline" },
    { type: "success", text: "                  ✓ 18 slides, 12min audio, demo video" },
    { type: "newline" },
    { type: "newline" },
    { type: "success", text: "  Done. All artifacts saved to project workspace." },
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

      if (line.type === "pause") {
        await sleep(line.ms || 500);
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
