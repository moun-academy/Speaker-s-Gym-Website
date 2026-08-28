(function () {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const exposure = window.SpeakersGymExposure;
  const root = document.querySelector("#week1Root");
  if (!portal || !exposure || !root) return;

  const topics = [
    "A habit that improves your day",
    "A place you would recommend",
    "An activity that helps you relax",
    "Something useful you recently learned"
  ];

  const missionTemplates = [
    "Share one prepared PREP point with a familiar person.",
    "Give one short PREP answer with two natural moments of eye contact.",
    "Ask one new question, then share one clear PREP opinion when it fits.",
    "Give one concise PREP opinion to a colleague or familiar professional contact.",
    "Start a short conversation and share one PREP opinion.",
    "Contribute one PREP point during a small professional group conversation.",
    "Make one PREP recommendation with a reason, example and next step.",
    "Open a short discussion with one clear PREP point.",
    "Answer one unexpected question using PREP without scripting the full answer.",
    "Lead a discussion and respond naturally from four PREP anchors."
  ];

  const stages = [
    { name: "DISCOVER", end: 5 },
    { name: "BUILD", end: 11 },
    { name: "SPEAK", end: 14 },
    { name: "PROVE", end: 22 }
  ];

  const lectureStepCount = 20;
  const lastStep = 22;
  let previousFocus = null;
  let timer = null;

  const esc = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  const getState = () => portal.getState().week1Lecture;
  const getLevel = () => exposure.clampLevel(portal.getState().week2Lecture.currentLevel || 1);
  const update = patch => portal.updateWeek1(patch);
  const stageFor = step => stages.find(stage => step <= stage.end) || stages[3];

  function keywordFrom(value, fallback) {
    const words = String(value || "").replace(/[^a-zA-Z0-9' -]/g, " ").split(/\s+/)
      .filter(word => word.length > 3 && !["this", "that", "with", "because", "believe", "opinion", "main", "reason", "example"].includes(word.toLowerCase()));
    return (words[0] || fallback).toUpperCase();
  }

  function prepRail(active = -1, values = null) {
    const items = [
      ["P", "POINT", values?.point],
      ["R", "REASON", values?.reason],
      ["E", "EXAMPLE", values?.example],
      ["P", "FINAL POINT", values?.finalPoint]
    ];
    return `<div class="w1-prep-rail">${items.map((item, index) => `<div class="${index === active ? "active" : ""} ${item[2] ? "filled" : ""}">
      <span>${item[0]}</span><small>${item[1]}</small>
    </div>`).join('<i aria-hidden="true">→</i>')}</div>`;
  }

  function shell(content, options = {}) {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const stage = stageFor(step);
    const canBack = step > 0 && !options.lockBack;
    const afterMission = step >= lectureStepCount;
    const progress = Math.round((Math.min(lectureStepCount, step + 1) / lectureStepCount) * 100);
    return `<div class="week1-page" role="dialog" aria-modal="true" aria-labelledby="week1Title">
      <header class="w1-header">
        <div class="w1-brand"><img src="Logo.png?v=khadija-v2" alt="" /><div><small>THE SPEAKER'S GYM</small><strong>WEEK 1 · SPEAK WITH STRUCTURE</strong></div></div>
        <div class="w1-stage-track" aria-label="Discover, Build, Speak, Prove">
          ${stages.map(item => `<span class="${item.name === stage.name ? "active" : ""}">${item.name}</span>`).join('<i aria-hidden="true">→</i>')}
        </div>
        <button class="w1-close" type="button" data-w1-action="close" aria-label="Save and close">&times;</button>
        <div class="w1-progress" aria-hidden="true"><i style="width:${progress}%"></i></div>
      </header>
      <main class="w1-main">
        <section class="w1-screen ${options.className || ""}">
          ${content}
        </section>
      </main>
      <footer class="w1-footer">
        <button class="w1-back" type="button" data-w1-action="back" ${canBack ? "" : "disabled"}>Back</button>
        <span>${afterMission ? "AFTER THE MISSION" : stage.name + " · " + (step + 1) + " / " + lectureStepCount}</span>
        <div class="w1-footer-actions">${options.footer || `<button class="w1-next" type="button" data-w1-action="next">${options.nextLabel || "Continue"}</button>`}</div>
      </footer>
    </div>`;
  }

  function choiceButtons(items, selected, attribute) {
    return `<div class="w1-choices">${items.map((item, index) => `<button type="button" class="${selected === item ? "selected" : ""}" ${attribute}="${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${esc(item)}</strong></button>`).join("")}</div>`;
  }

  function prepInput(name, title, question, hint, starters, active) {
    const state = getState();
    return shell(`
      <p class="w1-eyebrow">BUILD YOUR ANSWER</p>
      <span class="w1-topic-chip"><small>YOUR TOPIC</small>${esc(state.selectedTopic)}</span>
      <h1>${title}</h1>
      <p class="w1-lede">${question}</p>
      ${prepRail(active, state.prep)}
      <div class="w1-coach-card">
        <label for="w1PrepInput">${hint}</label>
        <textarea id="w1PrepInput" data-w1-prep="${name}" rows="4" placeholder="${starters[0]}">${esc(state.prep[name])}</textarea>
        <div class="w1-starters">${starters.map(starter => `<button type="button" data-w1-starter="${esc(starter)}">${starter}</button>`).join("")}</div>
      </div>
    `, { className: "build-step" });
  }

  function renderStep() {
    clearInterval(timer);
    timer = null;
    const state = getState();
    const step = Number(state.currentStep || 0);
    const level = getLevel();
    const levelData = exposure.levels[level - 1];
    let page = "";

    if (step === 0) {
      page = shell(`
        <p class="w1-eyebrow">WEEK 1 · THINK CLEARLY, SPEAK SIMPLY</p>
        <h1 id="week1Title">Build one clear answer<br /><em>without pressure or memorization.</em></h1>
        <blockquote>Today is not a lecture.<br /><strong>You are going to speak more than I do.</strong></blockquote>
        <div class="w1-flow"><span>DISCOVER</span><i>→</i><span>BUILD</span><i>→</i><span>SPEAK</span><i>→</i><span>PROVE</span></div>
      `, { className: "opening", nextLabel: "See what you will achieve" });
    } else if (step === 1) {
      page = shell(`
        <p class="w1-eyebrow">YOUR WEEK 1 TRANSFORMATION</p>
        <h1>What you will<br />walk away with.</h1>
        <div class="w1-agenda">
          <article><span>01</span><strong>Turn Overthinking into One Clear Point</strong></article>
          <article><span>02</span><strong>Build a Strong Answer in Four Simple Steps</strong></article>
          <article><span>03</span><strong>Speak Freely Without Memorizing</strong></article>
          <article><span>04</span><strong>Feel the Difference Between Version 1 and Version 2</strong></article>
          <article><span>05</span><strong>Turn Fear into a Testable Prediction</strong></article>
          <article><span>06</span><strong>Leave with One Mission You Can Attempt</strong></article>
        </div>
      `, { className: "agenda", nextLabel: "Start the transformation" });
    } else if (step === 2) {
      page = shell(`
        <p class="w1-eyebrow">THE SPEAKER'S GYM PHILOSOPHY</p>
        <h1>Train the skill.<br />Use it when it matters.</h1>
        <div class="w1-two-tracks">
          <article><span>01</span><small>SKILL</small><h2>How you speak</h2><p>Structure · Pace · Volume · Pauses · Expression</p></article>
          <i>+</i>
          <article><span>02</span><small>EXPOSURE</small><h2>When you use it</h2><p>Speak sooner · Initiate · Share opinions · Handle attention · Show personality</p></article>
        </div>
        <div class="w1-equation"><strong>SKILL + EXPOSURE</strong><i>→</i><strong>EVIDENCE</strong><i>→</i><strong>CONFIDENCE</strong></div>
        <p class="w1-coach-note">Confidence is built from repeated evidence, not from waiting to feel ready.</p>
      `, { className: "philosophy" });
    } else if (step === 3) {
      page = shell(`
        <p class="w1-eyebrow">MEET PREP</p>
        <h1>A clear answer<br />from four anchors.</h1>
        ${prepRail()}
        <p class="w1-lede centered">A simple structure for organizing an opinion quickly, without memorizing a script.</p>
        <div class="w1-benefits"><span>Speak sooner</span><span>Stay clear</span><span>Sound considered</span><span>Finish strongly</span></div>
        <blockquote>PREP is a framework for speaking clearly,<br /><strong>not a script to memorize.</strong></blockquote>
      `);
    } else if (step === 4) {
      page = shell(`
        <p class="w1-eyebrow">FOUR DISCOVERY QUESTIONS</p>
        <h1>One question at a time.</h1>
        <div class="w1-question-grid">
          <article><span>P</span><small>POINT</small><strong>What am I trying to say?</strong></article>
          <article><span>R</span><small>REASON</small><strong>Why do I believe it?</strong></article>
          <article><span>E</span><small>EXAMPLE</small><strong>When have I seen it?</strong></article>
          <article><span>P</span><small>FINAL POINT</small><strong>What should they remember?</strong></article>
        </div>
      `);
    } else if (step === 5) {
      page = shell(`
        <p class="w1-eyebrow">PREP IN ACTION</p>
        <h1>A short walk is a good way<br />to clear your mind.</h1>
        <div class="w1-demo">
          <article><span>P</span><p>A short walk is one of the best ways to reset your mind.</p></article>
          <article><span>R</span><p>Movement creates distance from whatever is making you feel stuck.</p></article>
          <article><span>E</span><p>When I walk after a stressful meeting, I return calmer and think more clearly.</p></article>
          <article><span>P</span><p>That is why I recommend a short walk when your mind feels crowded.</p></article>
        </div>
        <div class="w1-anchor-reveal"><small>NOW REDUCE IT</small><strong>RESET → DISTANCE → STRESSFUL MEETING → WALK</strong></div>
        <blockquote>Remember the idea,<br /><strong>not the sentence.</strong></blockquote>
      `, { nextLabel: "Build my answer" });
    } else if (step === 6) {
      page = shell(`
        <p class="w1-eyebrow">CHOOSE AN EASY TOPIC</p>
        <h1>Start where speaking feels light.</h1>
        <p class="w1-lede">Choose the easiest option. You will keep seeing it while you build all four PREP steps.</p>
        ${choiceButtons(topics, state.selectedTopic, "data-w1-topic")}
      `);
    } else if (step === 7) {
      page = prepInput("point", "POINT", "What is the one thing you are trying to say?", "One sentence. Say the idea before you explain it.", ["I believe…", "In my opinion…"], 0);
    } else if (step === 8) {
      page = prepInput("reason", "REASON", "What is the main reason you believe this?", "One strong why. Choose the reason that matters most.", ["The main reason is…", "This matters because…"], 1);
    } else if (step === 9) {
      page = prepInput("example", "EXAMPLE", "What is one personal or practical example?", "Be specific. Choose one moment, action, or observation.", ["For example…", "For instance…"], 2);
    } else if (step === 10) {
      page = prepInput("finalPoint", "FINAL POINT", "What should the listener remember?", "Restate your opinion, make a recommendation, or summarize the takeaway.", ["That’s why…", "That’s the takeaway…"], 3);
    } else if (step === 11) {
      const suggested = {
        point: state.keywords.point || keywordFrom(state.prep.point, "IDEA"),
        reason: state.keywords.reason || keywordFrom(state.prep.reason, "WHY"),
        example: state.keywords.example || keywordFrom(state.prep.example, "MOMENT"),
        finalPoint: state.keywords.finalPoint || keywordFrom(state.prep.finalPoint, "TAKEAWAY")
      };
      if (!Object.values(state.keywords).some(Boolean)) update({ keywords: suggested });
      page = shell(`
        <p class="w1-eyebrow">REDUCE THE ANSWER</p>
        <h1>Speak from four keywords.</h1>
        <p class="w1-lede">Keep the meaning. Let the wording change.</p>
        <div class="w1-keywords">
          ${[["point","P","IDEA"],["reason","R","WHY"],["example","E","MOMENT"],["finalPoint","P","TAKEAWAY"]].map(item => `<label><span>${item[1]}</span><small>${item[2]}</small><input data-w1-keyword="${item[0]}" value="${esc(suggested[item[0]])}" maxlength="28" /></label>`).join("")}
        </div>
        <blockquote>One keyword per step.<br /><strong>No memorized sentences.</strong></blockquote>
      `, { nextLabel: "Speak Version 1" });
    } else if (step === 12) {
      page = shell(`
        <p class="w1-eyebrow">VERSION 1</p>
        <h1>Say it naturally.</h1>
        <p class="w1-lede">Use only your four anchors. Give yourself 30 to 60 seconds.</p>
        ${prepRail(-1, state.keywords)}
        <div class="w1-speaking-card">
          <div class="w1-anchor-line">${Object.values(state.keywords).map(word => `<strong>${esc(word)}</strong>`).join("<i>→</i>")}</div>
          <div class="w1-timer"><strong data-w1-timer-display>60</strong><span>seconds</span><button type="button" data-w1-action="timer">Start timer</button></div>
        </div>
        <blockquote>There are no failed speeches.<br /><strong>There are only Versions.</strong></blockquote>
        <div class="w1-version-loop"><span>V1</span><i>→</i><span>LEARN</span><i>→</i><span>V2</span><i>→</i><span>LEARN</span><i>→</i><span>V3</span></div>
      `, { footer: `<button class="w1-next" type="button" data-w1-action="complete-v1">Version 1 complete</button>` });
    } else if (step === 13) {
      page = shell(`
        <p class="w1-eyebrow">ONE IMPROVEMENT</p>
        <h1>Change one thing.<br />Then speak again.</h1>
        <p class="w1-lede">The coach chooses only one or two improvements. Do not overload the next Version.</p>
        <div class="w1-version-stack">
          <article class="done"><span>VERSION 1</span><strong>Initial attempt complete</strong></article>
          <i>↓</i>
          <label><span>ONE IMPROVEMENT</span><input data-w1-improvement value="${esc(state.coachImprovement)}" placeholder="For example: lead with a shorter Point" /></label>
          <i>↓</i>
          <article><span>VERSION 2</span><strong>Try the same answer again</strong></article>
        </div>
        <div class="w1-anchor-line compact">${Object.values(state.keywords).map(word => `<strong>${esc(word)}</strong>`).join("<i>→</i>")}</div>
      `, { footer: `<button class="w1-next" type="button" data-w1-action="complete-v2">Version 2 complete</button>` });
    } else if (step === 14) {
      page = shell(`
        <p class="w1-eyebrow">FROM PRACTICE TO REAL LIFE</p>
        <h1>You proved you can<br />build a clear answer.</h1>
        <p class="w1-lede">You used PREP, spoke once, adjusted one thing and heard yourself improve. That proves the skill is available.</p>
        <div class="w1-bridge">
          <article><small>IN THIS SESSION</small><strong>You had time, support and a clear structure.</strong></article>
          <i>→</i>
          <article><small>IN REAL LIFE</small><strong>The harder moment is often deciding to speak at all.</strong></article>
        </div>
        <blockquote>Before choosing your mission,<br /><strong>let's name what makes you hold back.</strong></blockquote>
      `, { nextLabel: "Name the prediction" });
    } else if (step === 15) {
      page = shell(`
        <p class="w1-eyebrow">IDENTIFY THE WORST-CASE SCENARIO</p>
        <h1>What are you afraid<br />would happen?</h1>
        <p class="w1-lede">If you spoke more freely instead of holding yourself back, what are you afraid would happen?</p>
        <div class="w1-coach-card">
          <textarea data-w1-prediction rows="3" placeholder="If I speak during a meeting without rehearsing, I'll freeze…">${esc(state.prediction)}</textarea>
          <div class="w1-prediction-examples"><span>I'll freeze.</span><span>People won't understand me.</span><span>I'll lose my train of thought.</span><span>Someone will challenge me.</span></div>
          <label class="w1-slider-label"><span>How likely does this feel right now?</span><strong data-w1-before-value>${state.beliefBefore}%</strong></label>
          <input class="w1-slider" type="range" min="0" max="100" step="5" value="${state.beliefBefore}" data-w1-before />
          <div class="w1-slider-scale"><span>0%</span><span>100%</span></div>
        </div>
        <p class="w1-coach-note">Keep this tied to communication. This is a prediction, not a verdict.</p>
      `);
    } else if (step === 16) {
      page = shell(`
        <p class="w1-eyebrow">LET'S RUN AN EXPERIMENT</p>
        <h1>We know the prediction.<br />Now we test it.</h1>
        <div class="w1-experiment">
          <article><small>PREDICTION</small><p>${esc(state.prediction || "What do you predict will happen?")}</p></article>
          <i>↓</i>
          <article><small>MISSION</small><p>Use PREP once during a real conversation or meeting.</p></article>
          <i>↓</i>
          <article><small>REALITY</small><p>What actually happened?</p></article>
        </div>
        <div class="w1-equation compact"><strong>PREDICTION</strong><i>→</i><strong>EXPOSURE</strong><i>→</i><strong>EVIDENCE</strong></div>
      `);
    } else if (step === 17) {
      const mission = state.mission || missionTemplates[level - 1];
      page = shell(`
        <p class="w1-eyebrow">CHOOSE THE RIGHT-SIZED MISSION</p>
        <h1>One meaningful action<br />is enough.</h1>
        <p class="w1-lede">Use your existing Speaker's Gym level. Choose the highest behavior you can repeat reliably.</p>
        <div class="w1-level-picker" role="group" aria-label="Exposure level">
          ${exposure.levels.map((item, index) => `<button type="button" class="${index + 1 === level ? "selected" : ""}" data-w1-level="${index + 1}"><span>${index + 1}</span><small>${esc(item.name)}</small></button>`).join("")}
        </div>
        <div class="w1-level-focus">
          <small>LEVEL ${level}</small><h2>${esc(levelData.name)}</h2><p>${esc(levelData.behavior)}</p>
        </div>
        <label class="w1-mission-edit"><span>YOUR WEEK 1 CHALLENGE</span><textarea data-w1-mission rows="2">${esc(mission)}</textarea></label>
      `, { nextLabel: "Build mission card" });
    } else if (step === 18) {
      const mission = state.mission || missionTemplates[level - 1];
      page = shell(`
        <p class="w1-eyebrow">WEEK 1 MISSION</p>
        <h1>Skill meets exposure.</h1>
        <article class="w1-mission-card ${state.missionStatus === "accepted" ? "activated" : ""}">
          <div><small>SKILL</small><strong>PREP</strong></div>
          <div><small>LEVEL</small><strong>Level ${state.missionLevel || level}</strong></div>
          <section><small>CHALLENGE</small><p>${esc(mission)}</p></section>
          <section><small>YOUR PREDICTION</small><p>“${esc(state.prediction)}”</p></section>
          <section class="win"><small>WIN CONDITION</small><strong>I attempted the mission.</strong><p>You do not need to sound confident, feel calm, or deliver PREP perfectly.</p></section>
        </article>
      `, {
        footer: `<button class="w1-next mission-accept" type="button" data-w1-action="accept-mission">Accept mission</button>`
      });
    } else if (step === 19) {
      page = shell(`
        <p class="w1-eyebrow">LECTURE 1 COMPLETE</p>
        <h1>Your skill is ready.<br /><em>Your mission is active.</em></h1>
        <article class="w1-mission-mini active"><small>YOUR WEEK 1 MISSION</small><p>${esc(state.mission)}</p><strong>Win by attempting it.</strong></article>
        <div class="w1-leave-plan">
          <article><span>01</span><strong>Leave the lecture</strong><p>Take PREP into your week.</p></article>
          <article><span>02</span><strong>Attempt the mission</strong><p>Nervous is allowed. Imperfect is allowed.</p></article>
          <article><span>03</span><strong>Return with reality</strong><p>Use “Report mission” in your portal.</p></article>
        </div>
        <blockquote>The lecture ends here.<br /><strong>The evidence begins in real life.</strong></blockquote>
      `, { lockBack: true, footer: '<button class="w1-next" type="button" data-w1-action="close">Return to my portal</button>' });
    } else if (step === 20) {
      page = shell(`
        <p class="w1-eyebrow">WELCOME BACK</p>
        <h1>Did you attempt<br />your mission?</h1>
        <p class="w1-lede">The win is the attempt. Nothing else is required.</p>
        <article class="w1-mission-mini"><small>YOUR MISSION</small><p>${esc(state.mission)}</p></article>
        <div class="w1-did-it">
          <button type="button" data-w1-action="mission-not-yet"><span>NOT YET</span><small>Save and return later</small></button>
          <button type="button" class="yes" data-w1-action="mission-yes"><span>YES</span><small>I attempted it</small></button>
        </div>
      `, { lockBack: true, footer: '<span class="w1-footer-hint">Your mission stays active until you attempt it.</span>' });
    } else if (step === 21) {
      page = shell(`
        <p class="w1-eyebrow">REALITY CHECK</p>
        <h1>What actually happened?</h1>
        <p class="w1-lede">One short answer. No journaling and no report.</p>
        <div class="w1-coach-card">
          <textarea data-w1-result rows="3" placeholder="I hesitated for a moment, then finished my answer…">${esc(state.actualResult)}</textarea>
          <label class="w1-slider-label"><span>How likely does your original prediction feel now?</span><strong data-w1-after-value>${state.beliefAfter}%</strong></label>
          <input class="w1-slider" type="range" min="0" max="100" step="5" value="${state.beliefAfter}" data-w1-after />
          <div class="w1-belief-change"><div><small>BEFORE</small><strong>${state.beliefBefore}%</strong></div><i>→</i><div><small>AFTER</small><strong data-w1-after-card>${state.beliefAfter}%</strong></div></div>
        </div>
      `, { lockBack: true, footer: '<button class="w1-next" type="button" data-w1-action="collect-evidence">Collect evidence</button>' });
    } else {
      const evidence = portal.getState().evidenceBank.find(item => item.id === state.evidenceId);
      page = shell(`
        <p class="w1-eyebrow">WEEK 1 COMPLETE</p>
        <h1>You built the skill.<br />You proved you can use it.</h1>
        <div class="w1-completion-stats">
          <article><small>SKILL UNLOCKED</small><strong>PREP</strong></article>
          <article><small>VERSIONS COMPLETED</small><strong>${state.versionsCompleted || 2}</strong></article>
          <article><small>EXPOSURE</small><strong>Level ${state.missionLevel || level}</strong></article>
          <article><small>EVIDENCE COLLECTED</small><strong>1</strong></article>
        </div>
        <article class="w1-evidence-card">
          <header><small>EVIDENCE COLLECTED</small><span>WEEK 1</span></header>
          <div><small>PREDICTION</small><p>${esc(evidence?.prediction || state.prediction)}</p></div>
          <div><small>REALITY</small><p>${esc(evidence?.reality || state.actualResult)}</p></div>
          <div class="belief"><small>BELIEF</small><strong>${state.beliefBefore}% → ${state.beliefAfter}%</strong></div>
        </article>
        <div class="w1-week-progress"><span class="complete">W1 <i>●</i></span>${[2,3,4,5,6].map(number => `<span>W${number} <i>○</i></span>`).join("")}</div>
        <div class="w1-next-week"><small>NEXT</small><strong>Use your voice with more authority.</strong></div>
        <details class="w1-optional"><summary>Optional extra reps</summary><ul><li>Practice another PREP response</li><li>Record another Version</li><li>Share with the community</li><li>Ask AI for feedback</li></ul></details>
      `, { lockBack: true, footer: '<button class="w1-next" type="button" data-w1-action="close">Return to my portal</button>' });
    }

    root.innerHTML = page;
    document.body.classList.add("week1-open");
    requestAnimationFrame(() => root.querySelector("textarea, input, button")?.focus({ preventScroll: true }));
  }

  function validateAndNext() {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const requirements = {
      6: [state.selectedTopic, "Choose one easy topic."],
      7: [state.prep.point, "Add one clear Point."],
      8: [state.prep.reason, "Add one main Reason."],
      9: [state.prep.example, "Add one specific Example."],
      10: [state.prep.finalPoint, "Add one Final Point."],
      15: [state.prediction, "Name the communication outcome you are afraid of."],
      17: [state.mission || missionTemplates[getLevel() - 1], "Choose a small mission."]
    };
    if (requirements[step] && !String(requirements[step][0] || "").trim()) {
      portal.showToast(requirements[step][1]);
      root.querySelector("textarea, input")?.focus();
      return;
    }
    const patch = { currentStep: Math.min(lastStep, step + 1), lastViewedAt: new Date().toISOString() };
    if (step === 11 && !Object.values(state.keywords).every(Boolean)) {
      patch.keywords = {
        point: state.keywords.point || keywordFrom(state.prep.point, "IDEA"),
        reason: state.keywords.reason || keywordFrom(state.prep.reason, "WHY"),
        example: state.keywords.example || keywordFrom(state.prep.example, "MOMENT"),
        finalPoint: state.keywords.finalPoint || keywordFrom(state.prep.finalPoint, "TAKEAWAY")
      };
    }
    if (step === 17 && !state.mission) patch.mission = missionTemplates[getLevel() - 1];
    update(patch);
    renderStep();
  }

  function back() {
    const step = Number(getState().currentStep || 0);
    if (step <= 0) return;
    update({ currentStep: step - 1 });
    renderStep();
  }

  function close() {
    clearInterval(timer);
    update({ lastViewedAt: new Date().toISOString() });
    root.innerHTML = "";
    document.body.classList.remove("week1-open");
    portal.renderAll();
    previousFocus?.focus?.();
  }

  function startTimer(button) {
    clearInterval(timer);
    let remaining = 60;
    const display = root.querySelector("[data-w1-timer-display]");
    button.disabled = true;
    button.textContent = "Speaking…";
    display.textContent = remaining;
    timer = setInterval(() => {
      remaining -= 1;
      display.textContent = remaining > 0 ? remaining : "Done";
      if (remaining <= 0) {
        clearInterval(timer);
        timer = null;
        button.disabled = false;
        button.textContent = "Start again";
      }
    }, 1000);
  }

  function collectEvidence() {
    const state = getState();
    if (!String(state.actualResult || "").trim()) {
      portal.showToast("Add one short sentence about what actually happened.");
      root.querySelector("[data-w1-result]")?.focus();
      return;
    }
    const id = state.evidenceId || `week1-${Date.now()}`;
    const card = {
      id,
      week: 1,
      skill: "PREP",
      prediction: state.prediction,
      reality: state.actualResult,
      beliefBefore: Number(state.beliefBefore),
      beliefAfter: Number(state.beliefAfter),
      level: Number(state.missionLevel || getLevel()),
      mission: state.mission,
      completedAt: new Date().toISOString()
    };
    portal.saveEvidence(card);
    update({ evidenceId: id, completedAt: card.completedAt, currentStep: 22 });
    portal.showToast("Evidence collected.");
    renderStep();
  }

  root.addEventListener("click", event => {
    const action = event.target.closest("[data-w1-action]")?.dataset.w1Action;
    if (action === "close") return close();
    if (action === "back") return back();
    if (action === "next") return validateAndNext();
    if (action === "timer") return startTimer(event.target.closest("[data-w1-action]"));
    if (action === "complete-v1") {
      update({ versionsCompleted: Math.max(1, Number(getState().versionsCompleted || 0)), currentStep: 13 });
      portal.showToast("Version 1 complete. Choose one improvement.");
      return renderStep();
    }
    if (action === "complete-v2") {
      update({ versionsCompleted: Math.max(2, Number(getState().versionsCompleted || 0)), currentStep: 14 });
      portal.showToast("Version 2 complete. Improvement is evidence.");
      return renderStep();
    }
    if (action === "accept-mission") {
      const state = getState();
      const level = getLevel();
      update({
        mission: state.mission || missionTemplates[level - 1],
        missionLevel: level,
        missionStatus: "accepted",
        acceptedAt: new Date().toISOString(),
        lectureCompletedAt: new Date().toISOString(),
        currentStep: 19
      });
      portal.showToast("Mission accepted. The win is attempting it.");
      return renderStep();
    }
    if (action === "mission-not-yet") return close();
    if (action === "mission-yes") {
      update({ missionStatus: "completed", currentStep: 21 });
      return renderStep();
    }
    if (action === "collect-evidence") return collectEvidence();

    const topic = event.target.closest("[data-w1-topic]");
    if (topic) {
      update({ selectedTopic: topics[Number(topic.dataset.w1Topic)] });
      return renderStep();
    }
    const levelButton = event.target.closest("[data-w1-level]");
    if (levelButton) {
      const level = exposure.clampLevel(levelButton.dataset.w1Level);
      portal.setExposureLevel(level);
      update({ mission: missionTemplates[level - 1], missionLevel: null });
      return renderStep();
    }
    const starter = event.target.closest("[data-w1-starter]");
    if (starter) {
      const field = root.querySelector("[data-w1-prep]");
      const name = field.dataset.w1Prep;
      if (!field.value.trim()) {
        field.value = starter.dataset.w1Starter + " ";
        const prep = { ...getState().prep, [name]: field.value };
        update({ prep });
        field.focus();
      }
    }
  });

  root.addEventListener("input", event => {
    if (event.target.matches("[data-w1-prep]")) {
      const prep = { ...getState().prep, [event.target.dataset.w1Prep]: event.target.value };
      update({ prep });
    } else if (event.target.matches("[data-w1-keyword]")) {
      const keywords = { ...getState().keywords, [event.target.dataset.w1Keyword]: event.target.value.toUpperCase() };
      update({ keywords });
    } else if (event.target.matches("[data-w1-improvement]")) {
      update({ coachImprovement: event.target.value });
    } else if (event.target.matches("[data-w1-prediction]")) {
      update({ prediction: event.target.value });
    } else if (event.target.matches("[data-w1-before]")) {
      update({ beliefBefore: Number(event.target.value) });
      root.querySelector("[data-w1-before-value]").textContent = `${event.target.value}%`;
    } else if (event.target.matches("[data-w1-mission]")) {
      update({ mission: event.target.value });
    } else if (event.target.matches("[data-w1-result]")) {
      update({ actualResult: event.target.value });
    } else if (event.target.matches("[data-w1-after]")) {
      update({ beliefAfter: Number(event.target.value) });
      root.querySelector("[data-w1-after-value]").textContent = `${event.target.value}%`;
      root.querySelector("[data-w1-after-card]").textContent = `${event.target.value}%`;
    }
  });

  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-week1-reflection]")) {
      previousFocus = document.activeElement;
      update({ currentStep: 20 });
      return renderStep();
    }
    if (!event.target.closest("[data-open-week1]")) return;
    previousFocus = document.activeElement;
    renderStep();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("week1-open")) close();
  });
})();
