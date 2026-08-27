(function () {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const root = document.querySelector("#lectureRoot");
  if (!portal || !root) return;

  const exposure = window.SpeakersGymExposure;
  const levels = exposure?.levels;
  if (!exposure) return;

  const rounds = [
    { seconds: 30, label: "30 seconds", question: "Are mornings better than evenings?" },
    { seconds: 10, label: "10 seconds", question: "Is it better to plan everything or be spontaneous?" },
    { seconds: 5, label: "Begin now", question: "Should people spend more time outdoors?" }
  ];

  const prepSteps = [
    { letter: "P", name: "Point", question: "What do I believe?", starters: ["I believe...", "In my opinion..."] },
    { letter: "R", name: "Reason", question: "Why do I believe it?", starters: ["The main reason is...", "This matters because..."] },
    { letter: "E", name: "Example", question: "What is one simple example?", starters: ["For instance...", "For example..."] },
    { letter: "P", name: "Final Point", question: "What should they remember?", starters: ["That’s why I recommend...", "That’s the takeaway I want you to remember."] }
  ];

  let activeTimer = null;
  let timerButton = null;
  let revealObserver = null;
  let previousFocus = null;
  let scrollSaveTimer = null;

  const esc = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const lectureState = () => portal.getState().week2Lecture;

  function accessVisual() {
    return `<figure class="access-figure">
      <div class="access-diagram" role="img" aria-label="Technique is available at low pressure. Discomfort can restrict access in a high-stakes moment. Gradual exposure widens access to technique and personality.">
        <div class="tool-bank">
          <small>TECHNIQUE YOU ALREADY OWN</small>
          <div><span>PREP</span><span>VOICE</span><span>PAUSES</span><span>IDEAS</span></div>
        </div>
        <div class="access-path restricted">
          <small>WITHOUT EXPOSURE</small>
          <i></i><strong>Restricted access</strong>
        </div>
        <div class="access-gate"><span>HIGH-STAKES<br />DISCOMFORT</span></div>
        <div class="access-path trained">
          <small>WITH GRADUAL EXPOSURE</small>
          <i></i><strong>Fuller access</strong>
        </div>
        <div class="full-expression">
          <small>WHAT BECOMES AVAILABLE</small>
          <strong>Your ideas.<br />Your voice.<br />Your personality.</strong>
        </div>
      </div>
      <figcaption>Exposure starts with a manageable action, repeats it, and gradually raises the pressure.</figcaption>
    </figure>`;
  }

  function exposureLoop() {
    return `<div class="exposure-loop" aria-label="Small action, evidence, repeat, more access">
      <span>Small action</span><i>&rarr;</i><span>Evidence</span><i>&rarr;</i><span>Repeat</span><i>&rarr;</i><span>More access</span>
    </div>`;
  }

  function roundCards() {
    return rounds.map(round => `<article>
      <div class="round-time"><strong data-timer-display="${round.seconds}">${round.seconds === 5 ? "Now" : round.seconds}</strong><span>${round.label}</span></div>
      <p>${round.question}</p>
      <button type="button" data-countdown="${round.seconds}">Start</button>
    </article>`).join("");
  }

  function render() {
    const state = lectureState();
    const selected = clamp(Number(state.currentLevel || 1), 1, 10);
    const missions = Array.isArray(state.missions) ? [...state.missions, "", ""].slice(0, 3) : ["", "", ""];

    root.innerHTML = `<div class="lecture-page" role="dialog" aria-modal="true" aria-labelledby="lecturePageTitle">
      <header class="keynote-header">
        <div class="keynote-brand">
          <img src="Logo.png" alt="" />
          <div><small>The Speaker's Gym</small><strong id="lecturePageTitle">Week 2</strong></div>
        </div>
        <button class="keynote-close" type="button" data-action="close" aria-label="Save and close the lecture">&times;</button>
        <div class="keynote-progress" aria-hidden="true"><i></i></div>
      </header>

      <main class="keynote-scroll">
        <section class="keynote-section access" data-reveal>
          <p class="eyebrow">EXPOSURE COMES FIRST</p>
          <h1>Your technique is not missing.<br /><strong>Access is.</strong></h1>
          <p class="lede">At low stakes, your structure, voice and personality may feel available. In a high-stakes moment, discomfort can narrow how much of them you can use.</p>
          ${accessVisual()}
          <p class="access-statement">Technique gives you tools.<br /><strong>Exposure gives you access to your full personality.</strong></p>
          ${exposureLoop()}
          <div class="speak-prompts">
            <small>ANSWER ALOUD</small>
            <p>Where do you already speak freely?</p>
            <p>Where do you notice yourself holding back?</p>
          </div>
        </section>

        <section class="keynote-section levels" data-reveal>
          <p class="eyebrow">CHOOSE YOUR TRAINING POSITION</p>
          <h2>One level at a time.</h2>
          <p class="lede">Choose the highest behavior you can repeat reliably, not something you managed only once.</p>
          <div class="level-axis"><span>SMALLEST USEFUL ACTION</span><i></i><span>FREEDOM OF EXPRESSION</span></div>
          <div class="staircase" role="group" aria-label="Ten exposure levels">${exposure.staircase(selected)}</div>
          <div class="level-detail" aria-live="polite">${exposure.detail(selected)}</div>
          <div class="move-up">
            <h3>When do you move up?</h3>
            <p>When you have completed the behavior on three separate occasions. Reliability matters more than feeling completely comfortable.</p>
          </div>
          <p class="closing-line">You do not need Level 10 today.<br /><strong>You need the next repeatable action.</strong></p>
        </section>

        <section class="keynote-section prep" data-reveal>
          <p class="eyebrow">WEEK 1 RESET</p>
          <h2>PREP carries the answer after you begin.</h2>
          <p class="lede">Use one simple starting phrase for each part. You only need the first few words.</p>
          <div class="prep-reminders">
            ${prepSteps.map((step, index) => `<article class="${index === 3 ? "closing" : ""}">
              <span>${step.letter}</span>
              <div><small>${step.name}</small><strong>${step.question}</strong></div>
              <p>${step.starters.map(starter => `<em>${starter}</em>`).join("<b>or</b>")}</p>
            </article>`).join("")}
          </div>
          <div class="prep-line" aria-label="Point, Reason, Example, Point"><span>POINT</span><i>&rarr;</i><span>REASON</span><i>&rarr;</i><span>EXAMPLE</span><i>&rarr;</i><span>POINT</span></div>
          <div class="drill">
            <h3>Easy opinions. Less time to think.</h3>
            <p>There is no perfect answer. Choose one idea and let PREP carry it.</p>
            <div class="rounds">${roundCards()}</div>
          </div>
        </section>

        <section class="keynote-section live-practice" data-reveal>
          <p class="eyebrow">PRACTICE THE NEXT LEVEL NOW</p>
          <h2>Three attempts.<br />The same small behavior.</h2>
          <div class="practice-sequence">
            <article><span>01</span><strong>Choose</strong><p>Use the next-level behavior shown above.</p></article>
            <article><span>02</span><strong>Begin</strong><p>Count 5, 4, 3, 2, 1 and say the first sentence.</p></article>
            <article><span>03</span><strong>Adjust</strong><p>Change one observable behavior, then repeat.</p></article>
          </div>
          <div class="attempts">
            <div><span>ATTEMPT 1</span><p>Make it small enough to start.</p></div>
            <div><span>ATTEMPT 2</span><p>Keep the action. Improve one detail.</p></div>
            <div><span>ATTEMPT 3</span><p>Collect evidence that you can repeat it.</p></div>
          </div>
          <blockquote class="success-rule">Success is completing the behavior.<br /><strong>It is not sounding perfect or feeling calm.</strong></blockquote>
        </section>

        <section class="keynote-section commit" data-reveal>
          <div class="level-strip">
            <div><small>Current reliable level</small><strong data-current-level>Level ${selected}, ${levels[selected - 1].name}</strong></div>
            <i aria-hidden="true">&rarr;</i>
            <div><small>Next exposure</small><strong data-next-level>Level ${Math.min(10, selected + 1)}, ${levels[Math.min(9, selected)].name}</strong></div>
          </div>
          <p class="eyebrow">THIS WEEK</p>
          <h2>Three small attempts.</h2>
          <p class="lede">Each action should be visible, specific and small enough to complete in less than two minutes.</p>
          <div class="missions">
            ${missions.map((mission, index) => `<label><span>${index + 1}</span><input data-mission="${index}" value="${esc(mission)}" placeholder="During [situation], I will [visible action]" /></label>`).join("")}
          </div>
          <div class="challenge">
            <small>TECHNIQUE TO CARRY WITH YOU</small>
            <h3>Pause. Use a clear volume. Begin.</h3>
            <p>The exposure is the action. PREP, pauses and volume help the action land.</p>
          </div>
          <div class="final">
            <h2>Do not come back with perfection.<br /><strong>Come back with evidence.</strong></h2>
            <p>Use the technique. Practice the next level. Collect the evidence.</p>
          </div>
        </section>
      </main>
    </div>`;

    document.body.classList.add("lecture-open");
    bindPage();
    requestAnimationFrame(() => {
      const scroller = root.querySelector(".keynote-scroll");
      scroller.scrollTop = Number(state.lastScroll || 0);
      root.querySelector(".keynote-section")?.classList.add("visible");
    });
  }

  function bindPage() {
    const scroller = root.querySelector(".keynote-scroll");
    const progress = root.querySelector(".keynote-progress i");
    scroller.addEventListener("scroll", () => {
      const max = Math.max(1, scroller.scrollHeight - scroller.clientHeight);
      progress.style.width = `${Math.min(100, (scroller.scrollTop / max) * 100)}%`;
      clearTimeout(scrollSaveTimer);
      scrollSaveTimer = setTimeout(() => portal.updateLecture({ lastScroll: Math.round(scroller.scrollTop) }), 150);
    }, { passive: true });

    revealObserver?.disconnect();
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add("visible"); });
    }, { root: scroller, threshold: .08, rootMargin: "0px 0px -5%" });
    root.querySelectorAll("[data-reveal]").forEach(section => revealObserver.observe(section));
  }

  function selectLevel(number) {
    const selected = clamp(Number(number), 1, 10);
    portal.updateLecture({ currentLevel: selected });
    const nextNumber = Math.min(10, selected + 1);

    root.querySelectorAll(".step").forEach(button => {
      const level = Number(button.dataset.level);
      const state = level < selected ? "done" : level === selected ? "current" : level === nextNumber ? "next" : "ahead";
      button.className = `step ${state}`;
      button.setAttribute("aria-pressed", level === selected);
      button.querySelector("em")?.remove();
      if (state === "current") button.insertAdjacentHTML("beforeend", "<em>You are here</em>");
      if (state === "next" && nextNumber !== selected) button.insertAdjacentHTML("beforeend", "<em>Practice next</em>");
    });

    root.querySelector(".level-detail").innerHTML = exposure.detail(selected);
    root.querySelector("[data-current-level]").textContent = `Level ${selected}, ${levels[selected - 1].name}`;
    root.querySelector("[data-next-level]").textContent = `Level ${nextNumber}, ${levels[nextNumber - 1].name}`;
    portal.renderAll();
  }

  function startCountdown(button) {
    clearInterval(activeTimer);
    if (timerButton && timerButton !== button) timerButton.disabled = false;
    timerButton = button;
    const seconds = Number(button.dataset.countdown);
    const display = root.querySelector(`[data-timer-display="${seconds}"]`);
    let remaining = seconds;
    button.disabled = true;
    display.textContent = remaining;
    activeTimer = setInterval(() => {
      remaining -= 1;
      display.textContent = remaining > 0 ? remaining : "Speak";
      if (remaining <= 0) {
        clearInterval(activeTimer);
        activeTimer = null;
        button.disabled = false;
        button.textContent = "Again";
      }
    }, 1000);
  }

  function closeLecture() {
    clearInterval(activeTimer);
    const scroller = root.querySelector(".keynote-scroll");
    portal.updateLecture({ lastScroll: Math.round(scroller?.scrollTop || 0), lastViewedAt: new Date().toISOString() });
    revealObserver?.disconnect();
    root.innerHTML = "";
    document.body.classList.remove("lecture-open");
    portal.renderAll();
    previousFocus?.focus?.();
  }

  root.addEventListener("click", event => {
    if (event.target.closest('[data-action="close"]')) return closeLecture();
    const timer = event.target.closest("[data-countdown]");
    if (timer) return startCountdown(timer);
    const step = event.target.closest("[data-level]");
    if (step) selectLevel(step.dataset.level);
  });

  root.addEventListener("input", event => {
    const field = event.target.closest("[data-mission]");
    if (!field) return;
    const missions = [...(lectureState().missions || ["", "", ""]), "", ""].slice(0, 3);
    missions[Number(field.dataset.mission)] = field.value;
    portal.updateLecture({ missions });
    portal.renderAll();
  });

  document.addEventListener("click", event => {
    if (!event.target.closest("[data-open-week2-lecture]")) return;
    previousFocus = document.activeElement;
    render();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("lecture-open")) closeLecture();
  });
})();
