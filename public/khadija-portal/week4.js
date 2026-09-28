(() => {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const exposure = window.SpeakersGymExposure;
  const root = document.querySelector("#week4Root");
  if (!portal || !exposure || !root) return;

  const getState = () => portal.getState().week4Lecture;
  const update = patch => portal.updateWeek4(patch);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
  const baselineQuestion = "Tell me about a time you had to handle multiple priorities at once.";
  const purposes = {
    breathe: { number: "01", label: "Breathe", line: "Make room for your next sentence.", icon: "◌" },
    land: { number: "02", label: "Let it land", line: "Give a complete idea room to be understood.", icon: "◎" },
    shift: { number: "03", label: "Change gears", line: "Mark the move from quick context to a slower point.", icon: "↘" }
  };
  const slides = [
    ["Feel", "Your starting point"], ["Understand", "Three reasons"], ["Understand", "Room to breathe"],
    ["Understand", "Time to think"], ["Understand", "Space for the listener"], ["Understand", "Change gears"],
    ["Understand", "The feeling of silence"], ["Choose", "Which pause?"], ["Choose", "Hear the whole question"],
    ["Choose", "The right opening"], ["Practice", "Between complete thoughts"], ["Practice", "Recover and continue"],
    ["Practice", "Before and after"], ["Practice", "The surprise round"], ["Prove", "Take it into life"]
  ];
  const situations = [
    { id: "breath", title: "Your sentence is running out of air.", right: "breathe", reason: "A natural breath helps you choose the next complete thought." },
    { id: "listener", title: "You have just said the key recommendation.", right: "land", reason: "Let that complete idea arrive before adding the reason." },
    { id: "transition", title: "You have moved quickly through familiar context.", right: "shift", reason: "A pause marks the move into a slower, important point." }
  ];
  const questions = [
    { id: "required", label: "01 · START HERE", question: "Tell me about a time you faced a challenge. How did you handle it?", hint: "Choose one point, then one concrete action. The pause can happen where it helps.", source: "University of Michigan interview practice" },
    { id: "optional1", label: "02 · IF USEFUL", question: "What would you improve about a process you know well, and why?", hint: "Let the whole question finish. Think about both the change and the reason." },
    { id: "optional2", label: "03 · STRETCH", question: "Tell me about a time when you failed or made a mistake.", hint: "Acknowledge the event, then pause and focus on what you learned.", source: "University of Michigan interview practice" }
  ];

  let previousFocus = null;
  let demoToken = 0;
  let activeTimer = null;
  let recorder = null;
  let recordingStream = null;
  let recordingKind = null;
  const recordings = { baseline: null, final: null };

  function clearDemo() {
    demoToken++;
    if (activeTimer) clearTimeout(activeTimer);
    activeTimer = null;
    window.speechSynthesis?.cancel();
  }

  function getLevel() {
    return exposure.clampLevel(getState().currentLevel || portal.getState().week2Lecture.currentLevel || 1);
  }

  function missionText(reason, level) {
    const place = exposure.levels[level - 1]?.name || "a real conversation";
    const purpose = purposes[reason]?.label.toLowerCase() || "pause with purpose";
    return `In ${place.toLowerCase()}, I will pause to ${purpose} once, then complete one clear thought.`;
  }

  function feature(icon, title, text, index = 0, extra = "") {
    return `<article class="w4-feature" data-w4-reveal style="--i:${index}"><span class="w4-feature-icon" aria-hidden="true">${icon}</span><h2>${title}</h2><p>${text}</p>${extra}</article>`;
  }

  function statement(text, label = "SAY IT ALOUD") {
    return `<div class="w4-statement"><span>${label}</span><p>${esc(text)}</p></div>`;
  }

  function choiceButtons(options, selected, attr) {
    return `<div class="w4-choice-row">${options.map(option => `<button type="button" class="w4-choice ${selected === option.id ? "selected" : ""}" ${attr}="${option.id}">${esc(option.label)}</button>`).join("")}</div>`;
  }

  function recordingControls(kind) {
    const current = recordings[kind];
    return `<div class="w4-recording"><div><strong>Want to hear yourself?</strong><small>Optional. Recording stays in this visit and is not uploaded.</small></div><button type="button" class="w4-secondary" data-w4-action="record-${kind}">${recordingKind === kind ? "Stop recording" : current ? "Record again" : "Record answer"}</button>${current ? `<audio controls src="${current}" aria-label="Play your ${kind} answer"></audio>` : ""}</div>`;
  }

  function markDone(label, done, action) {
    return `<button type="button" class="w4-done ${done ? "done" : ""}" data-w4-action="${action}"><span aria-hidden="true">${done ? "✓" : "○"}</span>${label}</button>`;
  }

  function shell(content, options = {}) {
    const state = getState();
    const step = Math.min(14, Math.max(0, Number(state.currentStep || 0)));
    const stage = slides[step][0];
    const progress = Math.round(((step + 1) / 15) * 100);
    const missionActive = step === 14 && Boolean(state.lectureCompletedAt);
    return `<div class="w4-page" role="dialog" aria-modal="true" aria-labelledby="week4Title">
      <header class="w4-header">
        <div class="w4-brand"><img src="Logo.png?v=khadija-v2" alt="" /><span><small>THE SPEAKER'S GYM</small><strong>WEEK 4 · THINK WHILE YOU SPEAK</strong></span></div>
        <div class="w4-track"><span>${esc(stage)} <i aria-hidden="true">/</i> ${esc(slides[step][1])}</span><div class="w4-track-dots" aria-hidden="true">${[0, 1, 2, 3, 4].map((_, i) => `<b class="${i <= ["Feel", "Understand", "Choose", "Practice", "Prove"].indexOf(stage) ? "on" : ""}"></b>`).join("")}</div></div>
        <button type="button" class="w4-close" data-w4-action="close" aria-label="Save and close">×</button>
        <div class="w4-progress" aria-hidden="true"><i style="width:${progress}%"></i></div>
      </header>
      <main class="w4-main"><section class="w4-screen ${options.className || ""}">${content}</section></main>
      <footer class="w4-footer"><button type="button" class="w4-back" data-w4-action="back" ${step === 0 || missionActive ? "disabled" : ""}>Back</button><span>${String(step + 1).padStart(2, "0")} <i>/</i> 15</span><div>${options.footer || `<button type="button" class="w4-next" data-w4-action="next">${options.nextLabel || "Continue"}<span aria-hidden="true">→</span></button>`}</div></footer>
    </div>`;
  }

  function slide(step, state) {
    if (step === 0) return shell(`
      <p class="w4-kicker">01 · FEEL THE DIFFERENCE</p><h1 id="week4Title">A question lands.<br /><em>What happens next?</em></h1>
      <p class="w4-lede">Start where you are. No framework, no perfect answer. Speak for roughly 45 seconds and notice what happens.</p>
      ${statement(baselineQuestion, "YOUR FIRST QUESTION")}
      <div class="w4-practice-grid"><div class="w4-prompt"><span>NOTICE AS YOU SPEAK</span><p>Did you finish hearing the question? Where did you need a breath? Did one clear point arrive?</p></div><div class="w4-practice-action">${markDone("I answered aloud", state.baselineDone, "baseline-done")}</div></div>
      ${recordingControls("baseline")}
      <label class="w4-note-label">One observation, if you want to remember it<textarea data-w4-input="baselineNote" rows="2" placeholder="I rushed into the first sentence…">${esc(state.baselineNote)}</textarea></label>
    `, { className: "w4-hero" });

    if (step === 1) return shell(`
      <p class="w4-kicker">THE TOOL IS SILENCE</p><h1 id="week4Title">A pause has<br /><em>three jobs.</em></h1>
      <p class="w4-lede">You are not trying to become a slow speaker. You are choosing what the space is for.</p>
      <div class="w4-feature-grid">${Object.entries(purposes).map(([id, item], i) => feature(`<b>${item.number}</b>${item.icon}`, item.label, item.line, i, `<span class="w4-purpose-rule ${id}"></span>`)).join("")}</div>
      <div class="w4-callout"><strong>One pause. One purpose.</strong><span>The best position depends on what you and the listener need next.</span></div>
    `, { className: "w4-three" });

    if (step === 2) return shell(`
      <p class="w4-kicker">REASON 01 · BREATHE</p><h1 id="week4Title">Give your next sentence<br /><em>room to breathe.</em></h1>
      <p class="w4-lede">You can feel a racing heart and still take one natural breath. A pause is room to begin the next sentence by choice.</p>
      <div class="w4-breath-layout"><div class="w4-breath-visual" aria-label="Illustration of a natural breathing pause"><div class="w4-breath-orb"><span>inhale</span><span>exhale</span></div><small>FOLLOW YOUR OWN COMFORTABLE BREATH</small></div><div class="w4-breath-script"><span>TRY BOTH VERSIONS</span><p>“I had two priorities that day. <strong class="w4-breath-gap">[natural breath]</strong> I checked which deadline mattered first.”</p><ol><li>Say both sentences without planning a pause.</li><li>Now let the first thought finish, breathe naturally, and say the second.</li></ol>${markDone("I tried both ways", state.breathDone, "breath-done")}</div></div>
      <p class="w4-caution">A single pause is not a treatment for palpitations. It is a practical place to breathe and regain control of your words.</p>
    `, { className: "w4-breathe" });

    if (step === 3) return shell(`
      <p class="w4-kicker">REASON 02 · THINK</p><h1 id="week4Title">Let the question finish.<br /><em>Let your answer form.</em></h1>
      <p class="w4-lede">For a question that needs judgment, a brief pause can show that you are considering it. If you need longer, say so plainly.</p>
      <div class="w4-conversation"><div class="w4-bubble asker"><small>THE QUESTION</small><p>“What would you change about our process—and why?”</p></div><div class="w4-thinking"><span>hear it</span><i></i><span>choose one point</span><i></i><span>answer</span></div><div class="w4-bubble answer"><small>AN HONEST START</small><p>“Let me think about the trade-off for a moment.”</p></div></div>
      <div class="w4-choice-card"><strong>What should come first?</strong>${choiceButtons([{ id: "whole", label: "Hear the whole question" }, { id: "early", label: "Start after ‘what would you change’" }], state.questionChoice, "data-w4-question-choice")}${state.questionChoice ? `<p class="w4-feedback ${state.questionChoice === "whole" ? "good" : "try"}">${state.questionChoice === "whole" ? "Exactly. The final words ask for a reason, not only a change." : "Listen through ‘and why?’ before choosing the point."}</p>` : ""}</div>
    `);

    if (step === 4) return shell(`
      <p class="w4-kicker">REASON 02 · LET IT LAND</p><h1 id="week4Title">Your listener needs<br /><em>space too.</em></h1>
      <p class="w4-lede">A short pause after a complete thought gives it a boundary. Listen to the same answer two ways, then notice which idea stays with you.</p>
      <div class="w4-listener-grid"><article class="w4-listener-card" data-w4-demo-card="crowded"><span>VERSION A · NO SPACE</span><p>The clinic had two urgent tasks. I checked which deadline was fixed. I delegated the other. We finished both on time.</p><button type="button" class="w4-secondary" data-w4-demo="crowded">▶ Play A</button></article><article class="w4-listener-card" data-w4-demo-card="spaced"><span>VERSION B · ONE IDEA AT A TIME</span><p>The clinic had two urgent tasks. <b>[pause]</b> I checked which deadline was fixed. <b>[pause]</b> I delegated the other. We finished both on time.</p><button type="button" class="w4-secondary" data-w4-demo="spaced">▶ Play B</button></article></div>
      <div class="w4-choice-card"><strong>What did the speaker do first?</strong>${choiceButtons([{ id: "deadline", label: "Checked the fixed deadline" }, { id: "delegate", label: "Delegated immediately" }], state.listenerChoice, "data-w4-listener-choice")}${state.listenerChoice ? `<p class="w4-feedback ${state.listenerChoice === "deadline" ? "good" : "try"}">${state.listenerChoice === "deadline" ? "Yes. The pause helps separate the decision from the action." : "Listen again: the first action was checking the fixed deadline."}</p>` : ""}</div>
    `);

    if (step === 5) return shell(`
      <p class="w4-kicker">REASON 03 · CHANGE GEARS</p><h1 id="week4Title">Fast setup.<br /><em>Space.</em> Slow point.</h1>
      <p class="w4-lede">You learned the gears in Week 3. Here the pause is the hinge that makes the shift easy to hear.</p>
      <div class="w4-gear-stage" data-w4-gear-stage><div class="w4-gear-track"><span class="fast">FAST CONTEXT</span><i class="w4-gear-gap">PAUSE</i><span class="slow">SLOW POINT</span></div><div class="w4-gear-words"><p data-w4-gear-part="setup">“We reviewed three options quickly.”</p><b data-w4-gear-part="pause">a deliberate beat</b><p data-w4-gear-part="point">“My recommendation is to start with the smallest pilot.”</p></div></div>
      <div class="w4-demo-actions"><button type="button" class="w4-secondary" data-w4-gear="flat">▶ Hear no pause</button><button type="button" class="w4-secondary accent" data-w4-gear="hinge">▶ Hear the pause</button></div>
      <p class="w4-coachline">The pause is not the point. It prepares the listener to hear the point.</p>
    `);

    if (step === 6) return shell(`
      <p class="w4-kicker">MAKE SILENCE FAMILIAR</p><h1 id="week4Title">Inside, a pause can feel<br /><em>longer than it is.</em></h1>
      <p class="w4-lede">Try a short silence and guess how long it lasted. This is a perception exercise, not a target for every answer.</p>
      <div class="w4-silence-lab"><div class="w4-silence-disc" data-w4-silence-disc><span>READY</span></div><div><span class="w4-lab-label">A MOMENT OF SILENCE</span><p>Press start. Look at the circle and let the silence happen.</p><button type="button" class="w4-secondary" data-w4-action="silence-start">Start the silence</button></div></div>
      <div class="w4-choice-card" data-w4-estimate-box ${state.silenceEstimate ? "" : "hidden"}><strong>How long did it feel?</strong>${choiceButtons([{ id: "1", label: "About 1 second" }, { id: "2", label: "About 2 seconds" }, { id: "4", label: "About 4 seconds" }], String(state.silenceEstimate || ""), "data-w4-estimate")}<p class="w4-feedback good" data-w4-estimate-feedback ${state.silenceEstimate ? "" : "hidden"}>The silence lasted about 2 seconds. Your estimate describes your experience, not your ability.</p></div>
    `);

    if (step === 7) return shell(`
      <p class="w4-kicker">CHOICE CREATES CONTROL</p><h1 id="week4Title">Which pause<br /><em>belongs here?</em></h1>
      <p class="w4-lede">Do not pause because a rule told you to. Choose what the moment needs.</p>
      <div class="w4-scenario-list">${situations.map((item, index) => `<article class="w4-scenario" data-w4-reveal style="--i:${index}"><span>SCENE 0${index + 1}</span><h2>${item.title}</h2>${choiceButtons(Object.entries(purposes).map(([id, p]) => ({ id, label: p.label })), state.reasonAnswers?.[item.id], `data-w4-reason="${item.id}" data-w4-answer`)}${state.reasonAnswers?.[item.id] ? `<p class="w4-feedback ${state.reasonAnswers[item.id] === item.right ? "good" : "try"}">${state.reasonAnswers[item.id] === item.right ? "Yes. " : `${purposes[item.right].label} works best here. `}${item.reason}</p>` : ""}</article>`).join("")}</div>
    `);

    if (step === 8) return shell(`
      <p class="w4-kicker">LISTEN BEFORE YOU ANSWER</p><h1 id="week4Title">The last words can<br /><em>change the question.</em></h1>
      <p class="w4-lede">Do not solve the question before it ends. Reveal the second half, then decide what a good answer needs.</p>
      <div class="w4-question-reveal"><div class="w4-bubble asker"><small>PART ONE</small><p>“What did you do when two deadlines collided…”</p></div><div class="w4-question-rest" data-w4-question-rest ${state.completeQuestionChoice ? "" : "hidden"}><span>AND THEN</span><p>“…and how did you decide which one came first?”</p></div><button type="button" class="w4-secondary" data-w4-action="reveal-question">${state.completeQuestionChoice ? "Show the full question again" : "Reveal the rest of the question"}</button></div>
      <div class="w4-choice-card" data-w4-complete-card ${state.completeQuestionChoice ? "" : "hidden"}><strong>What must the answer include?</strong>${choiceButtons([{ id: "both", label: "My action and how I chose" }, { id: "action", label: "Only what I did" }], state.completeQuestionChoice, "data-w4-complete-choice")}${state.completeQuestionChoice ? `<p class="w4-feedback ${state.completeQuestionChoice === "both" ? "good" : "try"}">${state.completeQuestionChoice === "both" ? "Exactly. Hearing the entire question makes the answer more useful." : "The final clause asks for your decision process too."}</p>` : ""}</div>
    `);

    if (step === 9) return shell(`
      <p class="w4-kicker">PAUSE WITH JUDGMENT</p><h1 id="week4Title">Some answers start now.<br /><em>Some need a moment.</em></h1>
      <p class="w4-lede">Use a direct answer when you know it. Signal thinking time when the question asks for a considered judgment.</p>
      <div class="w4-opening-grid"><article><span>QUESTION A</span><h2>“Are you free at 3 p.m.?”</h2>${choiceButtons([{ id: "direct", label: "Answer directly" }, { id: "signal", label: "Ask for thinking time" }], state.openingChoices?.simple, 'data-w4-opening="simple" data-w4-answer')}</article><article><span>QUESTION B</span><h2>“What trade-off would you make in this plan?”</h2>${choiceButtons([{ id: "direct", label: "Answer immediately" }, { id: "signal", label: "Signal a moment to think" }], state.openingChoices?.complex, 'data-w4-opening="complex" data-w4-answer')}</article></div>
      ${state.openingChoices?.simple && state.openingChoices?.complex ? `<div class="w4-callout"><strong>${state.openingChoices.simple === "direct" && state.openingChoices.complex === "signal" ? "Good judgment." : "Try matching the pause to the question."}</strong><span>A simple fact usually needs a direct reply. A complex trade-off can justify a brief signalled pause.</span></div>` : ""}
    `);

    if (step === 10) return shell(`
      <p class="w4-kicker">USE WHAT YOU ALREADY KNOW</p><h1 id="week4Title">Pause between<br /><em>complete thoughts.</em></h1>
      <p class="w4-lede">Your PREP structure still works. Place a pause where one idea has finished and the next begins.</p>
      <div class="w4-prep-map"><span>POINT</span><p>“I would begin with a small pilot.”</p>${pauseButton("after-point", state.pauseMarkers)}<span>REASON</span><p>“It lets us learn before changing the entire process.”</p>${pauseButton("after-reason", state.pauseMarkers)}<span>EXAMPLE</span><p>“We could test it with one team for two weeks.”</p>${pauseButton("after-example", state.pauseMarkers)}<span>FINAL POINT</span><p>“That gives us evidence for the larger decision.”</p></div>
      <div class="w4-demo-actions"><button type="button" class="w4-secondary" data-w4-action="play-prep">▶ Play my pause map</button><button type="button" class="w4-secondary" data-w4-action="reset-markers">Reset markers</button></div><p class="w4-coachline" data-w4-prep-status>Choose at least one place where the listener needs a beat. Then speak the full answer aloud.</p>
    `);

    if (step === 11) return shell(`
      <p class="w4-kicker">RECOVER AND CONTINUE</p><h1 id="week4Title">A blank moment is<br /><em>not the end.</em></h1>
      <p class="w4-lede">You can stop, take a breath, and restart from one clear point. You do not owe the listener a long apology.</p>
      <div class="w4-blank-stage"><div class="w4-blank-question">“What did that experience teach you?”</div><div class="w4-blank-gap"><span>THE WORDS DISAPPEAR</span><b>…</b></div><div class="w4-blank-return">Stop <i>→</i> Breathe <i>→</i> One point</div></div>
      <div class="w4-choice-card"><strong>Which restart helps you continue?</strong>${choiceButtons([{ id: "point", label: "“Let me put the main point more clearly.”" }, { id: "apology", label: "“Sorry, I'm terrible at this…”" }], state.recoveryChoice, "data-w4-recovery")}${state.recoveryChoice ? `<p class="w4-feedback ${state.recoveryChoice === "point" ? "good" : "try"}">${state.recoveryChoice === "point" ? "Yes. Return to the idea, then give one example." : "A brief pause and a clear point serve you better than an apology spiral."}</p>` : ""}</div>
      ${statement("Let me put the main point more clearly. I learned to check the priorities before acting.", "TRY THIS RESTART")}
    `);

    if (step === 12) return shell(`
      <p class="w4-kicker">THE SAME QUESTION · A NEW CHOICE</p><h1 id="week4Title">Now answer it<br /><em>again.</em></h1>
      <p class="w4-lede">Use the question from Slide 1. Choose a pause only where it has a purpose. Keep the words yours.</p>
      ${statement(baselineQuestion, "YOUR ORIGINAL QUESTION")}
      <div class="w4-final-grid"><div class="w4-practice-action">${markDone("I answered again", state.finalDone, "final-done")}</div><div class="w4-review"><span>LISTEN FOR EVIDENCE</span>${[{ id: "heard", label: "I heard the whole question" }, { id: "point", label: "I made one clear point" }, { id: "pause", label: "My pause had a purpose" }, { id: "continued", label: "I finished the thought" }].map(item => `<label><input type="checkbox" data-w4-review="${item.id}" ${state.selfReview?.[item.id] ? "checked" : ""} />${item.label}</label>`).join("")}</div></div>
      ${recordingControls("final")}
      <label class="w4-note-label">What changed from your first answer?<textarea data-w4-input="finalNote" rows="2" placeholder="I let the question finish and paused before the example…">${esc(state.finalNote)}</textarea></label>
    `);

    if (step === 13) return shell(`
      <p class="w4-kicker">TRANSFER THE SKILL</p><h1 id="week4Title">One real question.<br /><em>Two optional stretches.</em></h1>
      <p class="w4-lede">Answer the first question aloud. The other two are available if you want more practice—without a countdown or pressure to perform.</p>
      <div class="w4-surprise-list">${questions.map((item, index) => `<article data-w4-reveal style="--i:${index}" class="${index === 0 ? "required" : ""}"><span>${item.label}</span><h2>${esc(item.question)}</h2><p>${esc(item.hint)}</p>${item.source ? `<small>Question source: <a href="https://careercenter.umich.edu/content/interviewing-resources" target="_blank" rel="noopener noreferrer">${item.source}</a></small>` : ""}${markDone(index === 0 ? "I answered this aloud" : "I tried this stretch", index === 0 ? state.surpriseDone : state.surpriseOptional?.[item.id], `surprise-${item.id}`)}</article>`).join("")}</div>
      <div class="w4-callout"><strong>When interrupted?</strong><span>Welcome a useful clarification. If your point is unfinished, calmly say: “Let me finish that thought.”</span></div>
    `);

    const level = getLevel();
    const chosenReason = state.missionReason || "land";
    const mission = state.mission || missionText(chosenReason, level);
    const completed = Boolean(state.completedAt);
    if (state.lectureCompletedAt) return shell(`
      <p class="w4-kicker">YOUR LECTURE IS COMPLETE</p><h1 id="week4Title">Your pause has<br /><em>a purpose now.</em></h1>
      <p class="w4-lede">${completed ? "You brought the skill into a real conversation and collected evidence." : "Your mission is active. The next step happens outside this screen."}</p>
      <div class="w4-mission-ticket"><span>WEEK 4 · ${completed ? "EVIDENCE COLLECTED" : "MISSION ACTIVE"}</span><strong>${esc(state.mission)}</strong><small>WIN: I paused with purpose and completed one clear thought.</small></div>
      <div class="w4-leave-plan"><div><b>01</b><span>Leave the lecture</span></div><div><b>02</b><span>Try one real moment</span></div><div><b>03</b><span>Return and report what happened</span></div></div>
      <details class="w4-sources"><summary>Research behind this lesson</summary><p><a href="https://link.springer.com/article/10.1007/s12671-023-02294-2" target="_blank" rel="noopener noreferrer">Slow-breathing review</a> · <a href="https://www.sciencedirect.com/science/article/pii/S0749597825000676" target="_blank" rel="noopener noreferrer">Pauses in conversation</a> · <a href="https://pubmed.ncbi.nlm.nih.gov/33591774/" target="_blank" rel="noopener noreferrer">Response delays and context</a></p></details>
    `, { footer: '<button type="button" class="w4-next" data-w4-action="close">Return to my portal <span aria-hidden="true">→</span></button>' });

    return shell(`
      <p class="w4-kicker">YOUR REAL-WORLD MISSION</p><h1 id="week4Title">Take one pause<br /><em>into life.</em></h1>
      <p class="w4-lede">Choose the reason and a situation that fits your current level. One honest attempt is the win.</p>
      <div class="w4-mission-builder"><div><span>01 · WHY WILL YOU PAUSE?</span>${choiceButtons(Object.entries(purposes).map(([id, p]) => ({ id, label: p.label })), state.missionReason, "data-w4-mission-reason")}</div><div><span>02 · WHERE WILL YOU TRY IT?</span><div class="w4-levels">${exposure.levels.map((item, index) => `<button type="button" class="${index + 1 === level ? "selected" : ""}" data-w4-level="${index + 1}" aria-label="Level ${index + 1}: ${esc(item.name)}" title="${esc(item.behavior)}"><b>${index + 1}</b><small>${esc(item.name)}</small></button>`).join("")}</div><p class="w4-level-description">${esc(exposure.levels[level - 1].behavior)}</p></div><label><span>03 · YOUR ONE SENTENCE MISSION</span><textarea data-w4-input="mission" rows="2">${esc(mission)}</textarea></label></div>
      <div class="w4-callout"><strong>Win condition</strong><span>Use one purposeful pause and complete one clear thought. The listener's reaction is information, not your grade.</span></div>
    `, { footer: '<button type="button" class="w4-next" data-w4-action="accept-mission">Accept my mission <span aria-hidden="true">→</span></button>' });
  }

  function pauseButton(id, markers) {
    return `<button type="button" class="w4-pause-marker ${markers.includes(id) ? "selected" : ""}" data-w4-marker="${id}" aria-pressed="${markers.includes(id)}"><i></i>${markers.includes(id) ? "PAUSE HERE" : "+ ADD A PAUSE"}<i></i></button>`;
  }

  function render(focusClose = false) {
    clearDemo();
    const active = document.activeElement;
    const focusAttr = [...(active?.attributes || [])].find(attr => attr.name.startsWith("data-w4-"));
    const state = getState();
    const step = Math.min(14, Math.max(0, Number(state.currentStep || 0)));
    if (step !== state.currentStep) update({ currentStep: step });
    root.innerHTML = slide(step, state);
    document.body.classList.add("week4-open");
    root.querySelector(".w4-main")?.scrollTo(0, 0);
    requestAnimationFrame(() => root.querySelectorAll("[data-w4-reveal]").forEach(item => item.classList.add("in")));
    if (focusClose) root.querySelector(".w4-close")?.focus({ preventScroll: true });
    else if (focusAttr) [...root.querySelectorAll(`[${focusAttr.name}]`)].find(item => item.getAttribute(focusAttr.name) === focusAttr.value)?.focus({ preventScroll: true });
  }

  function move(direction) {
    const state = getState();
    const step = Number(state.currentStep || 0);
    if (direction > 0) {
      const requirements = {
        0: [state.baselineDone, "Say your starting answer aloud, then mark it complete."],
        2: [state.breathDone, "Try both versions with a natural breath."],
        3: [state.questionChoice, "Choose what should come first."],
        4: [state.listenerChoice, "Choose what the speaker did first."],
        6: [state.silenceEstimate, "Try the short silence and choose how long it felt."],
        7: [situations.every(item => state.reasonAnswers?.[item.id]), "Choose a reason for each situation."],
        8: [state.completeQuestionChoice, "Reveal the full question and choose what to answer."],
        9: [state.openingChoices?.simple && state.openingChoices?.complex, "Choose an opening for both questions."],
        10: [state.pauseMarkers?.length, "Place at least one pause at a complete thought."],
        11: [state.recoveryChoice, "Choose a way to restart your answer."],
        12: [state.finalDone, "Answer the original question again, then mark it complete."],
        13: [state.surpriseDone, "Answer the first surprise question aloud."],
        14: [false, "Choose and accept your mission to finish the lecture."]
      };
      const gate = requirements[step];
      if (gate && !gate[0]) return portal.showToast(gate[1]);
    }
    if (step + direction < 0 || step + direction > 14) return;
    update({ currentStep: step + direction, lastViewedAt: new Date().toISOString() });
    render(true);
  }

  function close() {
    clearDemo();
    if (recorder?.state === "recording") recorder.stop();
    update({ lastViewedAt: new Date().toISOString() });
    root.innerHTML = "";
    document.body.classList.remove("week4-open");
    portal.renderAll();
    previousFocus?.focus?.();
  }

  function playSegments(segments, cardSelector, statusSelector) {
    clearDemo();
    const token = demoToken;
    let index = 0;
    const cards = [...root.querySelectorAll(cardSelector)];
    const status = statusSelector ? root.querySelector(statusSelector) : null;
    function next() {
      if (token !== demoToken) return;
      cards.forEach((card, i) => card.classList.toggle("playing", index < segments.length && (cards.length === 1 || i === index)));
      if (index >= segments.length) {
        cards.forEach(card => card.classList.remove("playing"));
        if (status) status.textContent = "Complete. Speak it once yourself.";
        return;
      }
      const segment = segments[index];
      if (status) status.textContent = segment.status || "Listen and watch where the thought lands.";
      const advance = () => {
        if (token !== demoToken) return;
        index++;
        activeTimer = setTimeout(next, segment.pause || 0);
      };
      if (window.speechSynthesis && window.SpeechSynthesisUtterance && segment.text) {
        const utterance = new SpeechSynthesisUtterance(segment.text);
        utterance.lang = "en-US";
        utterance.rate = segment.rate || 1;
        utterance.pitch = 1;
        utterance.onend = advance;
        utterance.onerror = advance;
        window.speechSynthesis.speak(utterance);
      } else {
        activeTimer = setTimeout(advance, segment.text ? Math.max(750, segment.text.length * 43 / (segment.rate || 1)) : 300);
      }
    }
    next();
  }

  async function toggleRecording(kind) {
    if (recorder?.state === "recording") {
      recorder.stop();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      portal.showToast("Recording is unavailable here. Speak aloud and continue without it.");
      return;
    }
    try {
      recordingStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks = [];
      recorder = new MediaRecorder(recordingStream);
      recordingKind = kind;
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => {
        recordingStream?.getTracks().forEach(track => track.stop());
        recordingStream = null;
        const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        if (recordings[kind]) URL.revokeObjectURL(recordings[kind]);
        recordings[kind] = URL.createObjectURL(blob);
        recordingKind = null;
        if (root.querySelector(".w4-page")) render();
      };
      recorder.start();
      root.querySelector(`[data-w4-action="record-${kind}"]`).textContent = "Stop recording";
      portal.showToast("Recording locally. Press Stop when your answer is complete.");
    } catch {
      recordingStream?.getTracks().forEach(track => track.stop());
      recordingStream = null;
      recordingKind = null;
      portal.showToast("Microphone unavailable. You can speak aloud and continue.");
    }
  }

  function acceptMission() {
    const state = getState();
    if (!state.missionReason) return portal.showToast("Choose why you will pause in your mission.");
    const level = getLevel();
    const mission = root.querySelector("[data-w4-input='mission']")?.value.trim() || missionText(state.missionReason, level);
    update({ mission, missionLevel: level, missionStatus: "accepted", acceptedAt: new Date().toISOString(), lectureCompletedAt: new Date().toISOString(), currentStep: 14 });
    portal.showToast("Mission active. One purposeful pause is the win.");
    render();
  }

  function collectEvidence() {
    const state = getState();
    if (!state.actualResult.trim()) return portal.showToast("Write one sentence about what actually happened.");
    const id = state.evidenceId || `week4-${Date.now()}`;
    const card = { id, week: 4, skill: "Purposeful Pauses", level: state.missionLevel || getLevel(), mission: state.mission,
      reality: state.actualResult, purpose: state.missionReason, completedAt: new Date().toISOString() };
    portal.saveEvidence(card);
    update({ evidenceId: id, completedAt: card.completedAt, missionStatus: "completed" });
    portal.showToast("Week 4 evidence collected.");
    render(true);
  }

  function renderReflection() {
    clearDemo();
    const state = getState();
    const content = `<p class="w4-kicker">WELCOME BACK · WEEK 4</p><h1 id="week4Title">What happened<br /><em>in the real moment?</em></h1><p class="w4-lede">The win is the attempt. A racing heart, an imperfect sentence, or a surprised listener does not erase it.</p><div class="w4-mission-ticket"><span>YOUR MISSION</span><strong>${esc(state.mission)}</strong></div><label class="w4-note-label">One honest sentence<textarea data-w4-input="actualResult" rows="4" placeholder="I paused after my point, and the listener had time to respond…">${esc(state.actualResult)}</textarea></label>`;
    root.innerHTML = shell(content, { footer: '<button type="button" class="w4-next" data-w4-action="collect-evidence">Collect evidence <span aria-hidden="true">→</span></button>' });
    document.body.classList.add("week4-open");
    root.querySelector("[data-w4-input='actualResult']")?.focus();
  }

  root.addEventListener("click", event => {
    const action = event.target.closest("[data-w4-action]")?.dataset.w4Action;
    if (action === "close") return close();
    if (action === "back") return move(-1);
    if (action === "next") return move(1);
    if (action === "baseline-done") { update({ baselineDone: !getState().baselineDone }); return render(); }
    if (action === "breath-done") { update({ breathDone: !getState().breathDone }); return render(); }
    if (action === "final-done") { update({ finalDone: !getState().finalDone }); return render(); }
    if (action?.startsWith("surprise-")) {
      const id = action.slice(9);
      if (id === "required") update({ surpriseDone: !getState().surpriseDone });
      else update({ surpriseOptional: { ...getState().surpriseOptional, [id]: !getState().surpriseOptional?.[id] } });
      return render();
    }
    if (action === "record-baseline" || action === "record-final") return toggleRecording(action.slice(7));
    if (action === "silence-start") {
      clearDemo();
      const disc = root.querySelector("[data-w4-silence-disc]");
      const button = event.target.closest("button");
      button.disabled = true;
      disc.classList.add("running");
      disc.querySelector("span").textContent = "SILENCE";
      activeTimer = setTimeout(() => {
        disc.classList.remove("running");
        disc.querySelector("span").textContent = "DONE";
        root.querySelector("[data-w4-estimate-box]").hidden = false;
        button.disabled = false;
        button.textContent = "Try again";
      }, 2200);
      return;
    }
    if (action === "reveal-question") { root.querySelector("[data-w4-question-rest]").hidden = false; root.querySelector("[data-w4-complete-card]").hidden = false; return; }
    if (action === "reset-markers") { update({ pauseMarkers: [] }); return render(); }
    if (action === "play-prep") {
      const lines = [...root.querySelectorAll(".w4-prep-map p")];
      const pause = getState().pauseMarkers || [];
      const labels = ["after-point", "after-reason", "after-example"];
      return playSegments(lines.map((line, index) => ({ text: line.textContent, rate: 1, pause: pause.includes(labels[index]) ? 800 : 140, status: pause.includes(labels[index]) ? "Pause after this complete thought." : "Keep the thought moving." })), ".w4-prep-map p", "[data-w4-prep-status]");
    }
    if (action === "accept-mission") return acceptMission();
    if (action === "collect-evidence") return collectEvidence();

    const demo = event.target.closest("[data-w4-demo]")?.dataset.w4Demo;
    if (demo) {
      const text = ["The clinic had two urgent tasks.", "I checked which deadline was fixed.", "I delegated the other.", "We finished both on time."];
      const spaced = demo === "spaced";
      return playSegments(text.map((part, i) => ({ text: part, rate: spaced ? .95 : 1.25, pause: spaced && i < 2 ? 650 : 50, status: spaced ? "Notice the space after each complete idea." : "Notice how the ideas crowd together." })), `[data-w4-demo-card="${demo}"]`, null);
    }
    const gear = event.target.closest("[data-w4-gear]")?.dataset.w4Gear;
    if (gear) {
      update({ gearDemo: gear });
      const hinge = gear === "hinge";
      return playSegments([
        { text: "We reviewed three options quickly.", rate: 1.4, pause: hinge ? 850 : 0 },
        { text: "My recommendation is to start with the smallest pilot.", rate: .88, pause: 0 }
      ], "[data-w4-gear-part='setup'],[data-w4-gear-part='point']", null);
    }

    const field = event.target.closest("[data-w4-question-choice],[data-w4-listener-choice],[data-w4-estimate],[data-w4-complete-choice],[data-w4-recovery],[data-w4-mission-reason],[data-w4-level],[data-w4-marker],[data-w4-reason],[data-w4-opening]");
    if (!field) return;
    const state = getState();
    if (field.dataset.w4QuestionChoice) update({ questionChoice: field.dataset.w4QuestionChoice });
    else if (field.dataset.w4ListenerChoice) update({ listenerChoice: field.dataset.w4ListenerChoice });
    else if (field.dataset.w4Estimate) update({ silenceEstimate: Number(field.dataset.w4Estimate) });
    else if (field.dataset.w4CompleteChoice) update({ completeQuestionChoice: field.dataset.w4CompleteChoice });
    else if (field.dataset.w4Recovery) update({ recoveryChoice: field.dataset.w4Recovery });
    else if (field.dataset.w4MissionReason) update({ missionReason: field.dataset.w4MissionReason, mission: missionText(field.dataset.w4MissionReason, getLevel()) });
    else if (field.dataset.w4Level) update({ currentLevel: exposure.clampLevel(field.dataset.w4Level), mission: missionText(state.missionReason || "land", exposure.clampLevel(field.dataset.w4Level)) });
    else if (field.dataset.w4Marker) {
      const markers = new Set(state.pauseMarkers || []);
      markers.has(field.dataset.w4Marker) ? markers.delete(field.dataset.w4Marker) : markers.add(field.dataset.w4Marker);
      update({ pauseMarkers: [...markers] });
    } else if (field.dataset.w4Reason) update({ reasonAnswers: { ...state.reasonAnswers, [field.dataset.w4Reason]: field.dataset.w4Answer } });
    else if (field.dataset.w4Opening) update({ openingChoices: { ...state.openingChoices, [field.dataset.w4Opening]: field.dataset.w4Answer } });
    render();
    if (field.dataset.w4Estimate) {
      root.querySelector("[data-w4-estimate-box]").hidden = false;
      root.querySelector("[data-w4-estimate-feedback]").hidden = false;
      root.querySelector("[data-w4-silence-disc] span").textContent = "DONE";
    }
    if (field.dataset.w4CompleteChoice) root.querySelector("[data-w4-question-rest]").hidden = false;
  });

  root.addEventListener("input", event => {
    const key = event.target.dataset.w4Input;
    if (key) update({ [key]: event.target.value });
  });
  root.addEventListener("change", event => {
    const key = event.target.dataset.w4Review;
    if (key) update({ selfReview: { ...getState().selfReview, [key]: event.target.checked } });
  });

  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-week4-reflection]")) {
      previousFocus = document.activeElement;
      renderReflection();
      return;
    }
    if (!event.target.closest("[data-open-week4-lecture]")) return;
    previousFocus = document.activeElement;
    render(true);
  });
  document.addEventListener("keydown", event => {
    if (!document.body.classList.contains("week4-open")) return;
    if (event.key === "Escape") return close();
    if (event.key !== "Tab") return;
    const focusables = [...root.querySelectorAll("button:not([disabled]),a[href],textarea,input,audio[controls],summary")].filter(el => el.getClientRects().length);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();
