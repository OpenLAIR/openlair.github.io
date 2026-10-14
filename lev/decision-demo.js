"use strict";

(() => {
  const diagram = document.querySelector(".decision-demo");
  if (!diagram) return;
  // Hand-authored teaching examples, never evaluation records or model output.
  // Stopper agreement is a separate prediction from the option probabilities.
  // The example threshold is illustrative; 98% in the paper is a fitting target,
  // not a universal per-question probability threshold.
  const examples = {
    fast: { probabilities: [[88, 8, 4]], agreement: [.97] },
    deeper: { probabilities: [[46, 37, 17], [43, 46, 11], [8, 86, 6]], agreement: [.61, .84, .97] },
    full: { probabilities: [[44, 39, 17], [38, 45, 17], [42, 43, 15], [12, 78, 10]], agreement: [.56, .73, .81] },
  };
  const threshold = .95;
  const rows = [...diagram.querySelectorAll(".loop-row")];
  const buttons = [...diagram.querySelectorAll("[data-scenario]")];
  const status = diagram.querySelector("#demo-status");
  const announcement = diagram.querySelector("#demo-announcement");
  const durations = [900, 1100, 1400, 1600];
  let scenario = "deeper";
  let loop = 0;
  let phase = 0; // decoder pass, readout, stopper prediction, decision
  let elapsed = 0;
  let running = false;
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
      row.querySelector(".option-distribution").setAttribute("aria-label", `Loop ${index + 1}: ${values ? values.map((value, option) => `${"ABC"[option]} ${value} percent`).join(", ") : skipped ? "skipped" : "not computed yet"}`);
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
        : exits ? `Select ${"ABC"[winner]}` : "Continue";
      row.querySelector(".exit-branch").classList.toggle("is-chosen", exits);
      row.querySelector(".continue-branch").classList.toggle("is-chosen", judged && !exits);
      row.querySelector(".exit-branch").innerHTML = final ? 'Exit <span aria-hidden="true">↗</span>' : 'Yes <span aria-hidden="true">↗</span>';
      row.querySelector(".continue-branch").hidden = final;
    });
    buttons.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.scenario === scenario)));
    diagram.dataset.loop = String(loop + 1);
    diagram.dataset.phase = ["compute", "readout", "stopper", "decision"][phase];
    diagram.dataset.finished = String(atExit());
    diagram.querySelector("#demo-loop-label").textContent = `Loop 0${loop + 1} / 04`;
    const values = data.probabilities[loop];
    const winner = "ABC"[values.indexOf(Math.max(...values))];
    status.textContent = phase === 0
      ? `Loop ${loop + 1} · ${loop === 0 ? "Read the request" : "Reuse the hidden state"}. Run the same decoder.`
      : phase === 1
        ? `Loop ${loop + 1} · The shared head scores A, B and C. ${winner} leads; now check whether to stop.`
        : phase === 2
          ? `Loop ${loop + 1} · Stopper g${"₁₂₃"[loop]} predicts ${Math.round(data.agreement[loop] * 100)}% agreement with the deepest answer. Compare with τ = 95%.`
        : atExit()
          ? `Loop ${loop + 1} · Select ${winner}. ${loop === 3 ? "Maximum depth reached." : `${3 - loop} ${loop === 2 ? "loop" : "loops"} skipped: predicted agreement is high enough.`}`
          : `Loop ${loop + 1} · Don't select yet. Predicted agreement is too low → loop ${loop + 2}.`;
    diagram.querySelector(".outcome-symbol").textContent = atExit() ? "↗" : phase === 3 ? "↻" : "→";
    if (manual) announcement.textContent = status.textContent;
  }

  function advance() {
    if (phase < 3) phase = loop === 3 && phase === 1 ? 3 : phase + 1;
    else if (atExit()) { loop = 0; phase = 0; }
    else { loop++; phase = 0; }
    elapsed = 0;
  }

  function tick(time) {
    frame = null;
    if (!running) return;
    if (previous !== null) elapsed += Math.min(time - previous, 100);
    previous = time;
    if (elapsed >= (atExit() ? 3600 : durations[phase])) { advance(); render(); }
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
  buttons.forEach(button => {
    button.disabled = false;
    button.addEventListener("click", () => {
      scenario = button.dataset.scenario;
      loop = 0; phase = running ? 0 : 3; elapsed = 0;
      render(true);
    });
  });
  diagram.querySelector("#demo-replay").disabled = false;
  diagram.querySelector("#demo-replay").addEventListener("click", () => {
    loop = 0; phase = 0; elapsed = 0; render(true);
  });
  diagram.querySelector("#demo-next").disabled = false;
  diagram.querySelector("#demo-next").addEventListener("click", () => {
    document.dispatchEvent(new Event("lev:pause-motion"));
    advance(); render(true);
  });
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { loop = 2; phase = 3; }
  render();
})();
