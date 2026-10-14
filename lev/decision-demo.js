"use strict";

(() => {
  const diagram = document.querySelector(".decision-demo");
  if (!diagram) return;
  // Archived fp32 readouts; stopper scores reconstructed with unchanged E06 settings.
  const trace = window.LevDecisionCases;
  if (!trace?.cases) return;
  const examples = Object.fromEntries(Object.entries(trace.cases).map(([key, data]) => [key, {
    ...data, probabilities: data.probabilities.slice(0, data.exitDepth),
  }]));
  const answerSummaries = {
    easy: "Correct: B — got into Cameron’s automobile. The stopper clears τ after one loop.",
    hard: "Correct: 6. White is 13/24 of the total: 26 ÷ (13/24) = 48 balls; 48 ÷ 8 = 6.",
  };
  const percent = value => `${(value * 100).toFixed(2)}%`;
  const rows = [...diagram.querySelectorAll(".loop-row")];
  const buttons = [...document.querySelectorAll(".demo-scenarios button[data-scenario]")];
  const casePanels = [...document.querySelectorAll(".case-input")];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const status = diagram.querySelector("#demo-status");
  const announcement = diagram.querySelector("#demo-announcement");
  // Leave time to read each distribution and the stopper comparison.
  const durations = [1200, 1500, 1900, 2100];
  let scenario = "easy";
  let loop = 0;
  let phase = 0; // decoder pass, readout, stopper prediction, decision
  let elapsed = 0;
  let running = false;
  let autoTour = true;
  let frame = null;
  let previous = null;
  const example = () => examples[scenario];
  const atExit = () => loop === example().probabilities.length - 1 && phase === 3;

  function render(manual = false) {
    const data = example();
    const threshold = data.threshold;
    diagram.dataset.optionCount = String(data.options.length);
    document.querySelector("#case-question").textContent = data.heading;
    diagram.querySelector("#demo-threshold").textContent = percent(threshold);
    rows.forEach((row, index) => {
      const read = index < loop || (index === loop && phase >= 1);
      const evaluated = index < loop || (index === loop && phase >= 2);
      const judged = index < loop || (index === loop && phase === 3);
      const final = index === 3;
      const exits = judged && (final || data.agreement[index] >= threshold);
      const values = read ? data.probabilities[index] : null;
      const winner = values ? values.indexOf(Math.max(...values)) : -1;
      const skipped = atExit() && index > loop;
      row.dataset.current = String(index === loop);
      row.dataset.state = skipped ? "skipped" : index > loop ? "waiting" : exits ? "exited" : judged ? "complete" : phase === 0 ? "computing" : phase === 1 ? "reading" : "stopping";
      const distribution = row.querySelector(".option-distribution");
      if (distribution.children.length !== data.options.length) {
        distribution.replaceChildren(...data.options.map(() => {
          const bar = document.createElement("div");
          bar.className = "option-bar";
          bar.innerHTML = '<span class="bar-value"></span><span class="bar-track"><span class="bar-fill"></span></span><span class="bar-label"></span>';
          return bar;
        }));
      }
      row.querySelectorAll(".option-bar").forEach((bar, option) => {
        bar.querySelector(".bar-label").textContent = data.options[option];
        bar.title = `${data.option_keys[option].toUpperCase()}: ${data.option_text[option]}`;
        const probability = values?.[option];
        bar.classList.toggle("is-top", winner === option);
        bar.querySelector(".bar-value").textContent = probability === undefined ? "—" : `${probability.toFixed(1)}%`;
        bar.querySelector(".bar-fill").style.setProperty("--probability", (probability ?? 0) / 100);
      });
      row.querySelector(".option-distribution").setAttribute("aria-label", `Loop ${index + 1}: ${values ? values.map((value, option) => `${data.option_text[option]} ${value.toFixed(2)} percent`).join(", ") : skipped ? "skipped" : "not computed yet"}`);
      const score = evaluated && !final ? data.agreement[index] : undefined;
      const stopper = row.querySelector(".stopper-block");
      const inputLabel = index === 0 ? "p¹" : `p${"¹²³⁴"[index - 1]}, p${"¹²³⁴"[index]}`;
      stopper.querySelector(".stopper-inputs").textContent = final ? "No stopper" : inputLabel;
      stopper.querySelector(".stopper-comparison").textContent = score === undefined
        ? final ? (judged ? "Return answer" : "—") : "g = ?"
        : `${percent(score)} ${score >= threshold ? "≥" : "<"} ${percent(threshold)}`;
      stopper.querySelector(".stopper-meter").style.setProperty("--agreement", score ?? 0);
      stopper.querySelector(".stopper-meter").style.setProperty("--threshold", `${threshold * 100}%`);
      stopper.querySelector(".stopper-threshold").title = `Fitted threshold: ${percent(threshold)}`;
      stopper.querySelector(".stopper-meter").hidden = final;
      stopper.setAttribute("aria-label", final
        ? `Loop 4: maximum depth; no stopper needed${judged ? "; return the current answer" : ""}`
        : `Loop ${index + 1}: stopper uses ${index === 0 ? "the current readout" : "the previous and current readouts"}; ${score === undefined ? "prediction pending" : `predicted agreement ${percent(score)} ${score >= threshold ? "meets" : "is below"} the fitted threshold of ${percent(threshold)}`}`);
      row.querySelector(".gate-label").textContent = skipped ? "Not needed" : !judged
        ? evaluated ? "Compare to τ" : read ? (final ? "Depth limit" : "Predict agreement") : "Await readout"
        : exits ? `Select ${data.options[winner]}` : "Continue";
      row.querySelector(".exit-branch").classList.toggle("is-chosen", exits);
      row.querySelector(".continue-branch").classList.toggle("is-chosen", judged && !exits);
      row.querySelector(".exit-branch").innerHTML = final ? 'Exit <span aria-hidden="true">↗</span>' : 'Yes <span aria-hidden="true">↗</span>';
      row.querySelector(".continue-branch").hidden = final;
    });
    buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.scenario === scenario)));
    diagram.dataset.scenario = scenario;
    document.querySelector("#case-kind").textContent = `${data.label} · ${data.kind}`;
    casePanels.forEach(panel => {
      panel.hidden = panel.id !== `case-input-${scenario}`;
      panel.querySelectorAll("[data-answer]").forEach(option => {
        const chosen = atExit() && !panel.hidden && Number(option.dataset.answer) === data.probabilities[loop].indexOf(Math.max(...data.probabilities[loop]));
        option.classList.toggle("is-selected", chosen);
        option.querySelector(".answer-mark").textContent = chosen ? "✓" : "";
      });
    });
    document.querySelector("#case-answer").textContent = atExit() ? answerSummaries[scenario] : "Read the input and compare the options. Watch the recorded decision unfold.";
    document.querySelector("#case-playback").textContent = autoTour
      ? "Autoplay · choose a case to keep it selected."
      : atExit() ? `${data.label} complete · Replay to watch again.` : `${data.label} selected · plays once, then stays here.`;
    diagram.dataset.loop = String(loop + 1);
    diagram.dataset.phase = ["compute", "readout", "stopper", "decision"][phase];
    diagram.dataset.finished = String(atExit());
    diagram.querySelector("#demo-loop-label").textContent = `${data.label} · 0${loop + 1} / 04`;
    const values = data.probabilities[loop];
    const winner = data.options[values.indexOf(Math.max(...values))];
    status.textContent = phase === 0
      ? `${data.label} · Loop ${loop + 1} · ${loop === 0 ? "Read the request" : "Reuse the hidden state"}. Run the same decoder.`
      : phase === 1
        ? `${data.label} · Loop ${loop + 1} · The shared head scores the ${data.options.length} options. ${winner} leads; now check whether to stop.`
        : phase === 2
          ? `${data.label} · Loop ${loop + 1} · Stopper g${"₁₂₃"[loop]} predicts ${percent(data.agreement[loop])} agreement with the deepest answer. Compare with τ = ${percent(threshold)}.`
        : atExit()
          ? `${data.label} · Loop ${loop + 1} · Select ${winner}. ${loop === 3 ? "Maximum depth reached; return the top option, even with uncertainty." : `${3 - loop} ${loop === 2 ? "loop" : "loops"} skipped: predicted agreement is high enough.`}`
          : `${data.label} · Loop ${loop + 1} · Don't select yet. Predicted agreement is too low → loop ${loop + 2}.`;
    diagram.querySelector(".outcome-symbol").textContent = atExit() ? "↗" : phase === 3 ? "↻" : "→";
    if (manual) announcement.textContent = status.textContent;
  }

  function advance(cycleCases = false) {
    if (phase < 3) phase = loop === 3 && phase === 1 ? 3 : phase + 1;
    else if (atExit()) {
      if (cycleCases && autoTour) scenario = scenario === "easy" ? "hard" : "easy";
      loop = 0; phase = 0;
    }
    else { loop++; phase = 0; }
    elapsed = 0;
  }

  function tick(time) {
    frame = null;
    if (!running || (atExit() && !autoTour)) return;
    if (previous !== null) elapsed += Math.min(time - previous, 100);
    previous = time;
    if (elapsed >= (atExit() ? 5000 : durations[phase])) { advance(true); render(); }
    frame = requestAnimationFrame(tick);
  }

  window.LevDecisionDemo = {
    setRunning(value) {
      running = value;
      previous = null;
      if (running && frame === null) frame = requestAnimationFrame(tick);
      else if (!running) { cancelAnimationFrame(frame); frame = null; }
    },
  };
  function restartCase() {
    autoTour = false;
    loop = reducedMotion.matches ? example().probabilities.length - 1 : 0;
    phase = reducedMotion.matches ? 3 : 0;
    elapsed = 0;
    previous = null;
    render(true);
    // Explicit selection/replay takes over from a pause and from the auto tour.
    // Motion preferences and visibility are still enforced by the coordinator.
    document.dispatchEvent(new Event("lev:play-motion"));
  }
  buttons.forEach(button => {
    button.addEventListener("click", () => {
      scenario = button.dataset.scenario;
      restartCase();
    });
  });
  diagram.querySelector("#demo-replay").disabled = false;
  diagram.querySelector("#demo-replay").addEventListener("click", restartCase);
  diagram.querySelector("#demo-next").disabled = false;
  diagram.querySelector("#demo-next").addEventListener("click", () => {
    autoTour = false;
    document.dispatchEvent(new Event("lev:pause-motion"));
    advance(); render(true);
  });
  if (reducedMotion.matches) { loop = 0; phase = 3; }
  render();
  document.querySelector(".demo-scenarios").hidden = false;
  const sourceDialog = document.querySelector("#case-source-dialog");
  if (sourceDialog?.showModal) {
    document.querySelectorAll("#case-provenance-link, .case-provenance-trigger").forEach(link => {
      link.addEventListener("click", event => {
        event.preventDefault();
        document.dispatchEvent(new Event("lev:pause-motion"));
        sourceDialog.showModal();
      });
    });
    document.querySelector("#case-source-close").addEventListener("click", () => sourceDialog.close());
    sourceDialog.addEventListener("click", event => {
      if (event.target !== sourceDialog) return;
      const rect = sourceDialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) sourceDialog.close();
    });
  }
})();
