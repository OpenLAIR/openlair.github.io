"use strict";

// The only numbers displayed are the measured endpoints. Animation is illustrative.
(() => {
  const depths = [
    { accuracy: "63.2", cost: "25", x: 65, y: 171.28 },
    { accuracy: "71.0", cost: "50", x: 200, y: 96.4 },
    { accuracy: "75.3", cost: "75", x: 335, y: 55.12 },
    { accuracy: "76.2", cost: "100", x: 470, y: 46.48 },
  ];
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hero = document.querySelector(".hero");
  const diagram = document.querySelector(".hero-diagram");
  const motionToggle = document.querySelector("#motion-toggle");
  const motionLabel = motionToggle.querySelector(".motion-label");
  const orbit = document.querySelector("#loop-motion-path");
  const orbitLength = orbit.getTotalLength();
  const particles = [...document.querySelectorAll(".loop-particles circle")];
  const loopBadges = [...document.querySelectorAll(".loop-sequence b")];
  const explorer = document.querySelector(".depth-explorer");
  const radios = [...document.querySelectorAll('input[name="depth"]')];
  const playButton = document.querySelector("#play-depths");
  const curve = document.querySelector(".curve-line");
  const curveLength = curve.getTotalLength();
  const highlight = document.querySelector(".curve-highlight");
  const marker = document.querySelector("#selected-point");
  const halo = document.querySelector("#selected-halo");
  const curvePoints = [...document.querySelectorAll(".curve-points circle")];
  const distances = [0];
  depths
    .slice(1)
    .forEach((point, i) =>
      distances.push(
        distances[i] + Math.hypot(point.x - depths[i].x, point.y - depths[i].y),
      ),
    );
  const fractions = distances.map((value) => value / distances.at(-1));
  let userPaused = false;
  let heroVisible = diagram.getBoundingClientRect().top < innerHeight;
  let heroFrame = null;
  let previousFrame = null;
  let heroElapsed = 0;
  let currentLoop = -1;
  let chartFrame = null;
  let chartPosition = 0;
  let selectedDepth = 0;
  let playbackTimer = null;
  let playing = false;
  const enabled = () => !reduced.matches && !userPaused;

  function drawHero() {
    const phase = (heroElapsed % 2200) / 2200;
    particles.forEach((particle, i) => {
      const offset = Math.max(0, i - 1) * 0.023;
      const point = orbit.getPointAtLength(
        ((phase - offset + 1) % 1) * orbitLength,
      );
      particle.setAttribute("transform", `translate(${point.x} ${point.y})`);
    });
    const loop = Math.floor(heroElapsed / 2200) % 4;
    if (loop !== currentLoop) {
      loopBadges.forEach((badge, i) =>
        badge.classList.toggle("is-active", i === loop),
      );
      currentLoop = loop;
    }
  }

  function animateHero(time) {
    heroFrame = null;
    if (!enabled() || !heroVisible || document.hidden) return;
    if (previousFrame !== null)
      heroElapsed += Math.min(time - previousFrame, 80);
    previousFrame = time;
    drawHero();
    heroFrame = requestAnimationFrame(animateHero);
  }

  function updateHeroActivity() {
    const running = enabled() && heroVisible && !document.hidden;
    diagram.classList.toggle("is-running", running);
    hero.classList.toggle("is-running", running);
    if (running && heroFrame === null) {
      previousFrame = null;
      heroFrame = requestAnimationFrame(animateHero);
    } else if (!running) {
      cancelAnimationFrame(heroFrame);
      heroFrame = null;
      previousFrame = null;
    }
  }

  function drawChart(position) {
    chartPosition = position;
    const point = curve.getPointAtLength(position * curveLength);
    [marker, halo].forEach((dot) => {
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
    });
    highlight.setAttribute("stroke-dasharray", `${position} 1`);
  }

  function finishChart() {
    cancelAnimationFrame(chartFrame);
    chartFrame = null;
    drawChart(fractions[selectedDepth]);
  }

  function setDepth(index, animate = true) {
    selectedDepth = index;
    radios[index].checked = true;
    const data = depths[index];
    for (const [id, value] of [
      ["accuracy", data.accuracy],
      ["compute", data.cost],
    ]) {
      const element = document.getElementById(id);
      const unit = document.createElement("span");
      unit.textContent = "%";
      element.replaceChildren(document.createTextNode(value), unit);
      // Fade between exact results instead of inventing interpolated measurements.
      element.getAnimations().forEach((animation) => animation.cancel());
      if (animate && enabled() && !document.hidden)
        element.animate(
          [
            { opacity: 0.35, transform: "translateY(5px)" },
            { opacity: 1, transform: "none" },
          ],
          { duration: 340, easing: "ease-out" },
        );
    }
    curvePoints.forEach((dot, i) =>
      dot.classList.toggle("is-visited", i <= index),
    );
    explorer.dataset.depth = String(index + 1);
    cancelAnimationFrame(chartFrame);
    if (!animate || !enabled() || document.hidden) return finishChart();
    const start = chartPosition;
    const target = fractions[index];
    const started = performance.now();
    function move(now) {
      const t = Math.min((now - started) / 700, 1);
      drawChart(start + (target - start) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) chartFrame = requestAnimationFrame(move);
      else {
        chartFrame = null;
        drawChart(target);
      }
    }
    chartFrame = requestAnimationFrame(move);
  }

  function stopPlayback() {
    clearTimeout(playbackTimer);
    playbackTimer = null;
    playing = false;
    playButton.querySelector(".play-label").textContent = "Play depths";
    playButton.setAttribute("aria-pressed", "false");
  }

  playButton.addEventListener("click", () => {
    if (playing || !enabled()) return stopPlayback();
    playing = true;
    playButton.setAttribute("aria-pressed", "true");
    playButton.querySelector(".play-label").textContent = "Stop playback";
    setDepth(0);
    let next = 1;
    function advance() {
      if (!playing || !enabled() || document.hidden || next === depths.length)
        return stopPlayback();
      setDepth(next++);
      playbackTimer = setTimeout(advance, 1250);
    }
    playbackTimer = setTimeout(advance, 1250);
  });
  radios.forEach((radio, index) =>
    radio.addEventListener("change", () => {
      stopPlayback();
      setDepth(index);
    }),
  );

  function syncMotion() {
    const on = enabled();
    root.classList.toggle("motion-enabled", on);
    root.classList.toggle("motion-paused", !on || document.hidden);
    motionToggle.disabled = reduced.matches;
    motionToggle.setAttribute("aria-pressed", String(!on));
    motionLabel.textContent = reduced.matches
      ? "Motion reduced"
      : on
        ? "Pause motion"
        : "Resume motion";
    playButton.disabled = !on;
    playButton.title = on
      ? "Play the four measured depth results once"
      : "Choose a depth manually while motion is paused";
    if (!on || document.hidden) {
      stopPlayback();
      finishChart();
      document
        .querySelectorAll(".depth-readout strong")
        .forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    }
    if (!on)
      document
        .querySelectorAll(".reveal-pending")
        .forEach((el) => el.classList.remove("reveal-pending"));
    updateHeroActivity();
  }
  motionToggle.addEventListener("click", () => {
    userPaused = !userPaused;
    syncMotion();
  });
  reduced.addEventListener("change", syncMotion);
  document.addEventListener("visibilitychange", syncMotion);
  document.querySelector(".depth-controls").disabled = false;
  motionToggle.hidden = false;
  playButton.hidden = false;
  stopPlayback();
  drawHero();
  setDepth(0, false);
  syncMotion();

  if ("IntersectionObserver" in window) {
    const activity = new IntersectionObserver((entries) =>
      entries.forEach((entry) => {
        if (entry.target === diagram) {
          heroVisible = entry.isIntersecting;
          updateHeroActivity();
        }
        if (entry.target === explorer && !entry.isIntersecting) {
          stopPlayback();
          finishChart();
        }
      }),
    );
    activity.observe(diagram);
    activity.observe(explorer);
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-pending");
            reveal.unobserve(entry.target);
          }
        }),
      { rootMargin: "0px 0px -35px 0px", threshold: 0 },
    );
    document
      .querySelectorAll(
        ".section-label,.idea-grid > *,.depth-explorer,.section-heading,.paper-figure,.method-steps li,.finding,.limits-grid > *,.release-list > div,.citation-heading,.citation pre",
      )
      .forEach((el, i) => {
        el.classList.add("reveal-ready");
        el.style.setProperty("--reveal-delay", `${(i % 3) * 0.07}s`);
        if (enabled() && el.getBoundingClientRect().top >= innerHeight)
          el.classList.add("reveal-pending");
        reveal.observe(el);
      });
    document.addEventListener("focusin", (event) =>
      event.target
        .closest(".reveal-pending")
        ?.classList.remove("reveal-pending"),
    );
  }

  const progress = document.querySelector(".reading-progress span");
  const nav = [...document.querySelectorAll(".site-header nav a")].map(
    (link) => ({
      link,
      section: document.querySelector(link.getAttribute("href")),
    }),
  );
  let scrollFrame = null;
  function updateReading() {
    scrollFrame = null;
    const length = document.documentElement.scrollHeight - innerHeight;
    const ratio = length > 0 ? Math.min(1, Math.max(0, scrollY / length)) : 0;
    let current = null;
    nav.forEach((item) => {
      if (item.section.getBoundingClientRect().top <= 160) current = item;
    });
    progress.style.transform = `scaleX(${ratio})`;
    nav.forEach((item) => {
      if (item === current) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    });
  }
  function scheduleReading() {
    if (scrollFrame === null)
      scrollFrame = requestAnimationFrame(updateReading);
  }
  addEventListener("scroll", scheduleReading, { passive: true });
  addEventListener("resize", scheduleReading, { passive: true });
  addEventListener("load", scheduleReading, { once: true });
  updateReading();
})();
