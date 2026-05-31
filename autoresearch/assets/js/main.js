/* =============================================================================
   AutoResearch @ NeurIPS 2026 — interactions
   ============================================================================= */
(function () {
  "use strict";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme toggle (light / dark) ----------
     Initial theme is set pre-paint by the inline script in <head>. */
  var themeBtn = document.getElementById("themeToggle");
  if (themeBtn) {
    var setLabel = function () {
      var isLight = document.documentElement.getAttribute("data-theme") === "light";
      themeBtn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    };
    setLabel();
    themeBtn.addEventListener("click", function () {
      var isLight = document.documentElement.getAttribute("data-theme") === "light";
      if (isLight) document.documentElement.removeAttribute("data-theme");
      else document.documentElement.setAttribute("data-theme", "light");
      try { localStorage.setItem("ar-theme", isLight ? "dark" : "light"); } catch (e) {}
      setLabel();
    });
  }

  /* ---------- OpenReview placeholder guard ----------
     Until the real portal exists, links flagged [data-openreview] tell the
     visitor it's coming rather than dumping them at "#". Replace ORURL when live. */
  var ORURL = ""; // e.g. "https://openreview.net/group?id=NeurIPS.cc/2026/Workshop/AutoResearch"
  document.querySelectorAll("[data-openreview]").forEach(function (a) {
    if (ORURL) { a.setAttribute("href", ORURL); a.setAttribute("target", "_blank"); a.setAttribute("rel", "noopener"); return; }
    a.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.hash = "#cfp";
      flash("OpenReview portal opens once the workshop is accepted (≈ Jul 2026).");
    });
  });

  var toast;
  function flash(msg) {
    if (!toast) {
      toast = document.createElement("div");
      toast.style.cssText =
        "position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(12px);" +
        "z-index:300;font-family:var(--mono,monospace);font-size:13px;color:#070a0e;" +
        "background:#4fe6cb;padding:11px 18px;border-radius:4px;box-shadow:0 8px 30px rgba(0,0,0,.5);" +
        "opacity:0;transition:.3s cubic-bezier(.22,1,.36,1);max-width:90vw;text-align:center;";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(function () { toast.style.opacity = "1"; toast.style.transform = "translateX(-50%) translateY(0)"; });
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toast.style.opacity = "0"; toast.style.transform = "translateX(-50%) translateY(12px)"; }, 3200);
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open"); toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Hero command (static) ---------- */
  var typed = document.getElementById("typed");
  if (typed) typed.innerHTML = colorize('agent.run("conduct ML research, end to end")');
  var pipeline = document.getElementById("pipeline");
  if (pipeline) pipeline.classList.add("lit");

  function colorize(s) {
    // wrap the quoted string in an accent span
    return s.replace(/(&quot;|")(.*?)("|&quot;|$)/, function (m, a, mid, b) {
      return '<span class="str">' + a + mid + b + "</span>";
    });
  }

  /* ---------- Nav active-section highlight ---------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta)'));
  var sections = navAnchors.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }

})();
