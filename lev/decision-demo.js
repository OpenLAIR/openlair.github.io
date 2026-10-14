"use strict";

(() => {
  const diagram = document.querySelector(".decision-demo");
  if (!diagram) return;
  // Hand-authored teaching examples, never evaluation records or model output.
  // Stopper agreement is a separate prediction from the option probabilities.
  // The example threshold is illustrative; 98% in the paper is a fitting target,
  // not a universal per-question probability threshold.
  const examples = {
    easy: {
      label: "Easy", kind: "direct rule", options: ["Maple", "Cedar", "Pine"],
      explanation: "Maple is paid and in stock. Cedar is unpaid; Pine is out of stock.",
      probabilities: [[88, 8, 4]], agreement: [.97],
    },
    hard: {
      label: "Hard", kind: "rule + exception", options: ["Maple", "Cedar", "Pine"],
      explanation: "Cedar qualifies: 60 hours is within the 72-hour priority limit. Maple exceeds 48 hours; Pine is out of stock.",
      probabilities: [[44, 39, 17], [38, 45, 17], [42, 43, 15], [12, 78, 10]], agreement: [.56, .73, .81],
    },
  };
  const threshold = .95;
  const rows = [...diagram.querySelectorAll(".loop-row")];
  const buttons = [...document.querySelectorAll(".demo-scenarios button[data-scenario]")];
  const casePanels = [...document.querySelectorAll(".case-input")];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const status = diagram.querySelector("#demo-status");
  const announcement = diagram.querySelector("#demo-announcement");
  const durations = [900, 1100, 1400, 1600];
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
      row.querySelectorAll(".option-bar").forEach((bar, option) => {
        const probability = values?.[option];
        bar.classList.toggle("is-top", winner === option);
        bar.querySelector(".bar-value").textContent = probability === undefined ? "—" : `${probability}%`;
        bar.querySelector(".bar-fill").style.setProperty("--probability", (probability ?? 0) / 100);
      });
      row.querySelector(".option-distribution").setAttribute("aria-label", `Loop ${index + 1}: ${values ? values.map((value, option) => `${data.options[option]} ${value} percent`).join(", ") : skipped ? "skipped" : "not computed yet"}`);
      const score = evaluated && !final ? data.agreement[index] : undefined;
      const stopper = row.querySelector(".stopper-block");
      const inputLabel = index === 0 ? "p¹" : `p${"¹²³⁴"[index - 1]}, p${"¹²³⁴"[index]}`;
      stopper.querySelector(".stopper-inputs").textContent = final ? "No stopper" : inputLabel;
      stopper.querySelector(".stopper-comparison").textContent = score === undefined
        ? final ? (judged ? "Return answer" : "—") : "g = ?"
        : `${Math.round(score * 100)}% ${score >= threshold ? "≥" : "<"} ${threshold * 100}%`;
      stopper.querySelector(".stopper-meter").style.setProperty("--agreement", score ?? 0);
      stopper.querySelector(".stopper-meter").hidden = final;
      stopper.setAttribute("aria-label", final
        ? `Loop 4: maximum depth; no stopper needed${judged ? "; return the current answer" : ""}`
        : `Loop ${index + 1}: stopper uses ${index === 0 ? "the current readout" : "the previous and current readouts"}; ${score === undefined ? "prediction pending" : `predicted agreement ${Math.round(score * 100)} percent ${score >= threshold ? "meets" : "is below"} the illustrative threshold of 95 percent`}`);
      row.querySelector(".gate-label").textContent = skipped ? "Not needed" : !judged
        ? evaluated ? "Compare to τ" : read ? (final ? "Depth limit" : "Predict agreement") : "Await readout"
        : exits ? `Ship ${data.options[winner]}` : "Continue";
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
    document.querySelector("#case-answer").textContent = atExit() ? data.explanation : "Read the rule and compare the three orders. Watch the decision unfold.";
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
        ? `${data.label} · Loop ${loop + 1} · The shared head scores Maple, Cedar and Pine. ${winner} leads; now check whether to stop.`
        : phase === 2
          ? `${data.label} · Loop ${loop + 1} · Stopper g${"₁₂₃"[loop]} predicts ${Math.round(data.agreement[loop] * 100)}% agreement with the deepest answer. Compare with τ = 95%.`
        : atExit()
          ? `${data.label} · Loop ${loop + 1} · Ship ${winner}. ${loop === 3 ? "Maximum depth reached." : `${3 - loop} ${loop === 2 ? "loop" : "loops"} skipped: predicted agreement is high enough.`}`
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
    if (elapsed >= (atExit() ? 3600 : durations[phase])) { advance(true); render(); }
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
})();
