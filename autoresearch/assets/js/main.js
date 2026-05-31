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

  /* ---------- Typed hero command ---------- */
  var typed = document.getElementById("typed");
  if (typed) {
    var full = 'agent.run("conduct ML research, end to end")';
    if (reduceMotion) {
      typed.innerHTML = colorize(full);
    } else {
      var i = 0;
      (function tick() {
        i++;
        typed.innerHTML = colorize(full.slice(0, i));
        if (i < full.length) setTimeout(tick, 34 + (full[i] === " " ? 30 : 0));
        else litPipeline();
      })();
    }
  } else { litPipeline(); }

  function colorize(s) {
    // wrap the quoted string in an accent span (handles partial strings while typing)
    return s.replace(/(&quot;|")(.*?)("|&quot;|$)/, function (m, a, mid, b) {
      return '<span class="str">' + a + mid + b + "</span>";
    });
  }

  function litPipeline() {
    var p = document.getElementById("pipeline");
    if (!p) return;
    if (reduceMotion) { p.classList.add("lit"); p.querySelectorAll(".stage").forEach(function(s){s.style.opacity=1;}); return; }
    var stages = p.querySelectorAll(".stage");
    p.classList.add("lit");
    stages.forEach(function (s) { s.style.opacity = ".35"; });
    var k = 0;
    (function step() {
      if (k < stages.length) { stages[k].style.opacity = "1"; k++; setTimeout(step, 220); }
    })();
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
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

  /* ---------- Live-demo mock dashboard ---------- */
  var dash = document.getElementById("dash");
  if (dash && !reduceMotion && "IntersectionObserver" in window) {
    var started = false;
    new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) { if (e.isIntersecting && !started) { started = true; runDash(); obs.disconnect(); } });
    }, { threshold: 0.4 }).observe(dash);
  } else if (dash) {
    // static fallback: fill bars to base
    dash.querySelectorAll(".agent").forEach(function (a) {
      a.querySelector(".bar > i").style.width = (a.getAttribute("data-base") || 60) + "%";
    });
  }

  function runDash() {
    // countdown clock
    var clock = document.getElementById("clock");
    var remain = 59 * 60 + 12;
    setInterval(function () {
      if (remain <= 0) return;
      remain -= 1;
      var m = Math.floor(remain / 60), s = remain % 60;
      clock.textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }, 1000);

    // progress bars drift upward toward 100
    var agents = Array.prototype.slice.call(dash.querySelectorAll(".agent"));
    agents.forEach(function (a) {
      var bar = a.querySelector(".bar > i");
      var w = parseFloat(a.getAttribute("data-base")) || 55;
      bar.style.width = w + "%";
      setInterval(function () {
        w = Math.min(99, w + Math.random() * 4);
        bar.style.width = w.toFixed(1) + "%";
      }, 1600 + Math.random() * 1200);
    });

    // scrolling log feed
    var feed = document.getElementById("feed");
    var lines = [
      ['12:04', 'g', 'sakana-run · experiment passed · val_acc=0.712'],
      ['12:05', 'c', 'openhands · revising hypothesis after failed run'],
      ['12:06', 'g', 'local-7B · draft section "Results" written'],
      ['12:07', 'c', 'sakana-run · launching ablation (3 seeds)'],
      ['12:08', 'g', 'jury · faithfulness check queued'],
      ['12:09', 'c', 'openhands · sandbox reset · retry step 34'],
      ['12:10', 'g', 'local-7B · figures rendered · 2 of 3']
    ];
    var fi = 0, buffer = [];
    function push() {
      var L = lines[fi % lines.length]; fi++;
      var el = document.createElement("div");
      el.innerHTML = '<span class="t">[' + L[0] + ']</span> <span class="' + L[1] + '">' + L[2] + '</span>';
      feed.appendChild(el);
      buffer.push(el);
      requestAnimationFrame(function () { el.classList.add("show"); });
      if (buffer.length > 3) { var old = buffer.shift(); old.remove(); }
    }
    push(); push();
    setInterval(push, 2400);
  }
})();
