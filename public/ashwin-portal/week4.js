(function () {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const exposure = window.SpeakersGymExposure;
  const root = document.querySelector("#week4Root");
  if (!portal || !exposure || !root) return;

  const chapters = [
    { title: "Why Silence Feels So Long", steps: [1] },
    { title: "Why Pausing Works", steps: [12, 13] },
    { title: "Your Pause Toolkit", steps: [2, 3, 14] },
    { title: "The Two-Second Answer", steps: [5] },
    { title: "Read With the Pauses", steps: [6] },
    { title: "Leave With One Pause to Prove", steps: [7, 8] }
  ];

  const stages = [
    { name: "DISCOVER", steps: [0, 1, 12, 13] },
    { name: "STILL", steps: [2, 3, 14] },
    { name: "SPEAK", steps: [5, 6] },
    { name: "PROVE", steps: [7, 8, 9, 10, 11] }
  ];

  const defaultMission = level => {
    const trigger = triggers.find(item => item.id === getState().pauseTrigger);
    const behavior = exposure.levels[level - 1].behavior;
    return trigger
      ? `${behavior} Use your pause trigger (${trigger.label.toLowerCase()}) before you start, and replace fillers with silence.`
      : `${behavior} Take a two-second pause before you start, and replace fillers with silence.`;
  };

  const coachVoices = [
    { name: "Matt Abrahams", source: "Stanford · Think Faster, Talk Smarter", idea: "A beat of silence reads as thoughtfulness. Paraphrasing the question buys you time honestly." },
    { name: "Toastmasters", source: "The Power of Pauses", idea: "Listeners need time to process. Nobody remembers your silence. They do remember the ums." }
  ];

  // Each reason has a short demo. Text tokens are spoken at ms per word; { p } is a pause in ms.
  const reasons = [
    {
      id: "process",
      title: "They need time to take it in.",
      text: "You already know your point. They are hearing it for the first time, at your speed. A pause gives their mind a moment to catch up.",
      without: [{ t: "The meeting is at three o'clock on Thursday. Please bring your passport.", ms: 230 }],
      with: [{ t: "The meeting is at three o'clock on Thursday.", ms: 260 }, { p: 1400 }, { t: "Please bring your passport.", ms: 260 }]
    },
    {
      id: "filler",
      title: "A pause sounds like thinking. An “um” sounds like searching.",
      text: "Both buy you a moment. The pause makes you sound calm and in control. The filler makes people wonder if you know what to say.",
      without: [{ t: "The best choice is, um, like, the second one.", ms: 300 }],
      with: [{ t: "The best choice is", ms: 300 }, { p: 1200 }, { t: "the second one.", ms: 300 }]
    },
    {
      id: "gear",
      title: "It lets you switch from fast to slow.",
      text: "Move quickly through what they already know. Stop. Then slow down for what matters. The pause is the moment you change speed.",
      without: [{ t: "We met on Monday, talked on Tuesday, and agreed on Wednesday. Here is what we decided.", ms: 260 }],
      with: [{ t: "We met on Monday, talked on Tuesday, and agreed on Wednesday.", ms: 130 }, { p: 1200 }, { t: "Here is what we decided.", ms: 480 }]
    },
    {
      id: "weight",
      title: "A pause adds weight.",
      text: "A pause before your key sentence tells people: listen, this one matters. A pause after it lets it sink in. The silence is what gives your words weight.",
      without: [{ t: "I have one thing to tell you. I got the job.", ms: 260 }],
      with: [{ t: "I have one thing to tell you.", ms: 260 }, { p: 1800 }, { t: "I got the job.", ms: 420 }]
    }
  ];

  const beliefs = [
    { mind: "If I pause, they will think I do not know the answer.", truth: "They think you are choosing your words. A calm pause looks like confidence. An “um” looks more like searching.", tip: "Keep your face relaxed and your eyes on them while you wait." },
    { mind: "The silence feels like forever.", truth: "It only feels long to you. Two seconds sounds like a thoughtful moment to the listener.", tip: "Count “one… two” in your head. Then speak." },
    { mind: "If I stop, someone will jump in.", truth: "While you are quiet, people can see you are about to speak. You still have the floor.", tip: "Keep your lips gently closed and your eyes up. That says: I am not finished." }
  ];

  const triggers = [
    { id: "count", label: "Count in your head", how: "Silently count “one… two”. Then speak. Nobody can hear it, and it gives you exactly two seconds.", steps: ["one…", "two…", "Now speak."] },
    { id: "sip", label: "Take a sip of water", how: "Pick up your glass, take a small sip, then speak. It looks natural and works well in meetings and calls.", steps: ["Sip…", "Swallow…", "Now speak."] },
    { id: "phrase", label: "Say “Good question.” and wait", how: "Say it slowly, give a small smile, then stay quiet for two seconds. It is honest and it buys you time.", steps: ["“Good question.”", "…two seconds of silence…", "Now speak."] }
  ];

  // Fillers are wrapped in [brackets]. Everything else carries meaning.
  const spotScript = "[So,] [um,] the biggest risk right now is [like,] the data migration. We're [uh,] [basically] two weeks behind because [you know,] the vendor changed the format. [I mean,] I think we should [um,] bring in one more engineer.";
  const spotTokens = (() => {
    const tokens = [];
    spotScript.replace(/\[([^\]]+)\]|([^\s[\]]+)/g, (match, filler, word) => {
      tokens.push({ text: filler || word, filler: Boolean(filler) });
      return match;
    });
    return tokens.map((token, index) => ({ ...token, index }));
  })();
  const fillerCount = spotTokens.filter(token => token.filler).length;
  const cleanScript = ["The biggest risk right now is the data migration.", "We're two weeks behind because the vendor changed the format.", "I think we should bring in one more engineer."];

  const trainerQuestions = [
    "What did you do last weekend?",
    "What do you enjoy most about your work?",
    "What is your favourite meal?",
    "Where would you like to travel next?",
    "What makes a good day for you?",
    "What is a hobby you enjoy?"
  ];
  const trainerTarget = 3;
  const questionWordMs = 320;
  const questionHoldMs = 1200;
  const pauseTarget = 2000;
  const ringCircumference = 2 * Math.PI * 96;

  const moonScript = [
    { text: "We choose to go to the Moon.", pause: 1600 },
    { text: "We choose to go to the Moon in this decade and do the other things, not because they are easy,", pause: 900 },
    { text: "but because they are hard;", pause: 2000, long: true },
    { text: "because that goal will serve to organize and measure the best of our energies and skills, because that challenge is one that we are willing to accept, one we are unwilling to postpone,", pause: 900 },
    { text: "and one we intend to win.", pause: 0, finish: true }
  ];

  // Step 4 (Do / Avoid) was retired; saved positions on it move on to the trainer.
  // Steps 12 to 14 are newer slides placed earlier in the lecture, so the list order is the real order.
  const stepOrder = [0, 1, 12, 13, 2, 3, 14, 5, 6, 7, 8, 9, 10, 11];
  const lectureStepCount = 11;
  let previousFocus = null;
  let timers = [];
  let frame = null;
  let trainer = { phase: "idle", question: -1, startedAt: 0, feedback: null };

  const esc = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  const getState = () => portal.getState().week4Lecture;
  const update = patch => portal.updateWeek4(patch);
  const getLevel = () => exposure.clampLevel(getState().currentLevel || portal.getState().currentLevel || 1);
  const chapterFor = step => chapters.find(chapter => chapter.steps.includes(step));
  const stageFor = step => stages.find(stage => stage.steps.includes(step)) || stages[3];

  function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() {
    timers.forEach(id => clearTimeout(id));
    timers = [];
    if (frame) cancelAnimationFrame(frame);
    frame = null;
  }

  function shell(content, options = {}) {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const chapter = chapterFor(step);
    const chapterIndex = chapter ? chapters.indexOf(chapter) : -1;
    const slideNumber = stepOrder.indexOf(step) + 1;
    const afterMission = [9, 10, 11].includes(step);
    const canBack = step > 0 && !options.lockBack;
    const progress = Math.round((Math.min(lectureStepCount, slideNumber) / lectureStepCount) * 100);
    const chapterLabel = step === 0 ? "THE PLAN" : afterMission ? "MISSION FOLLOW-UP" : "WEEK 4";
    const chapterTitle = chapter?.title || (step === 0 ? "The Pause" : "Turn experience into evidence");
    const stage = stageFor(step);

    return `<div class="week3-page week4-page" role="dialog" aria-modal="true" aria-labelledby="week4PageTitle">
      <header class="w3-header">
        <div class="w3-brand"><img src="Logo.png?v=ashwin-lecture-v1" alt="" /><div><small>THE SPEAKER'S GYM</small><strong>WEEK 4 · THE PAUSE</strong></div></div>
        <div class="w3-chapter-track" aria-label="${esc(chapter ? `Chapter ${chapterIndex + 1} of ${chapters.length}: ${chapterTitle}` : chapterTitle)}">
          <div><small>${chapter ? `CHAPTER ${String(chapterIndex + 1).padStart(2, "0")} OF ${String(chapters.length).padStart(2, "0")}` : chapterLabel}</small><strong>${esc(chapterTitle)}</strong></div>
          <div class="w3-chapter-dots" aria-hidden="true">${chapters.map((item, index) => `<i class="${index < chapterIndex ? "done" : index === chapterIndex ? "active" : ""}"></i>`).join("")}</div>
        </div>
        <div class="w3-header-actions"><button class="w3-reset" type="button" data-w4-action="reset">Reset</button><button class="w3-close" type="button" data-w4-action="close" aria-label="Save and close">&times;</button></div>
        <div class="w3-progress" aria-hidden="true"><i style="width:${progress}%"></i></div>
      </header>
      <main class="w3-main"><section class="w3-screen ${options.className || ""}">${content}</section></main>
      <footer class="w3-footer">
        <button class="w3-back" type="button" data-w4-action="back" ${canBack ? "" : "disabled"}>Back</button>
        <span>${afterMission ? "AFTER THE MISSION" : `${stage.name} · ${slideNumber} / ${lectureStepCount}`}</span>
        <div class="w3-footer-actions">${options.footer || `<button class="w3-next" type="button" data-w4-action="next">${options.nextLabel || "Continue"}</button>`}</div>
      </footer>
    </div>`;
  }

  function breathMark(label = "") {
    return `<span class="w4-breath" aria-label="pause"><i></i>${label ? `<small>${esc(label)}</small>` : ""}</span>`;
  }

  function demoWords(tokens) {
    return tokens.map(token => token.p
      ? `<em class="w4-gap" style="--gap:${Math.round(token.p / 40)}px" aria-label="pause">‖</em>`
      : token.t.split(" ").map(word => `<b class="w4-dw">${esc(word)}</b>`).join(" ")).join(" ");
  }

  const reasonsNote = count => count >= reasons.length
    ? "All four opened. Notice how every reason is about helping the listener, not about you."
    : `Open each of the four reasons. ${count} of ${reasons.length} opened.`;
  const beliefsNote = count => count >= beliefs.length
    ? "A pause takes two seconds. Fear makes it feel like ten."
    : `Tap each card to see what the listener really hears. ${count} of ${beliefs.length} turned.`;

  function renderStep() {
    clearTimers();
    const state = getState();
    const savedStep = Number(state.currentStep || 0);
    const step = savedStep === 4 ? 5 : stepOrder.includes(savedStep) ? savedStep : 0;
    if (step !== savedStep) update({ currentStep: step });
    const level = getLevel();
    const levelData = exposure.levels[level - 1];
    let page = "";

    if (step === 0) {
      page = shell(`
        <p class="w3-eyebrow">WEEK 4 · THE PAUSE</p>
        <h1 id="week4PageTitle">The pause is where<br /><em>your best answer is born.</em></h1>
        <p class="w4-hero-line" aria-label="So, um, basically, the answer is, uh, simple. Becomes: The answer is simple.">
          <span class="filler">So,</span> <span class="filler">um,</span> <span class="filler">basically,</span> <span class="keep">the answer is</span><span class="filler">, uh,</span><span class="gap" aria-hidden="true"><i></i></span> <span class="keep">simple.</span>
        </p>
        <div class="w3-agenda">${chapters.map((chapter, index) => `<article data-w3-animate style="--i:${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${esc(chapter.title)}</strong></article>`).join("")}</div>
      `, { className: "opening w4-opening", nextLabel: "Start with the silence" });
    } else if (step === 1) {
      const felt = Boolean(state.feltSilence);
      page = shell(`
        <p class="w3-eyebrow">WHY WE FILL THE GAP</p>
        <h1 id="week4PageTitle">Silence feels long<br /><em>only to the speaker.</em></h1>
        <article class="w4-clock-card ${felt ? "done" : ""}" data-w4-clock>
          <div class="w4-clocks">
            <div class="w4-clock inside"><small>INSIDE YOUR HEAD</small><strong data-w4-clock-in>${felt ? "Forever" : "0"}</strong><span>feels like</span></div>
            <div class="w4-silence-bar" aria-hidden="true"><i data-w4-silence-fill></i></div>
            <div class="w4-clock outside"><small>TO THE ROOM</small><strong data-w4-clock-out>${felt ? "2.0s" : "0.0s"}</strong><span>actually is</span></div>
          </div>
          <p class="w4-clock-caption" data-w4-clock-caption aria-live="polite">${felt ? "Two seconds. To them, it sounded like thought." : "Press the button and stay completely silent until the bar fills."}</p>
          <button type="button" class="w4-primary" data-w4-action="feel-silence">${felt ? "Feel it again" : "Hold two seconds of silence"}</button>
        </article>
        <div class="w4-coaches ${felt ? "in" : ""}" data-w4-coaches>
          <p class="w4-coaches-label">WHAT THE COACHES AGREE ON</p>
          <div>${coachVoices.map((coach, index) => `<article style="--i:${index}"><strong>${esc(coach.name)}</strong><small>${esc(coach.source)}</small><p>${esc(coach.idea)}</p></article>`).join("")}</div>
        </div>
      `, { className: "w4-why" });
    } else if (step === 2) {
      page = shell(`
        <p class="w3-eyebrow">THE TOOLKIT</p>
        <h1 id="week4PageTitle">Two pauses.<br /><em>One escape line.</em></h1>
        <div class="w4-pause-types">
          <article class="thinking" data-w3-animate style="--i:0">
            <small>BEFORE YOU ANSWER</small>
            <h2>The thinking pause</h2>
            <ol class="w4-cycle" aria-label="Receive, breathe, find the point, speak">
              <li style="--c:0">Receive</li><li style="--c:1">Breathe</li><li style="--c:2">Find the point</li><li style="--c:3">Speak</li>
            </ol>
            <p>When the question ends, let it land. Your first sentence should be your point, not your search for it.</p>
            <b>2 seconds</b>
          </article>
          <article class="bridge" data-w3-animate style="--i:1">
            <small>INSIDE YOUR ANSWER</small>
            <h2>The bridge pause</h2>
            <p class="w4-swap" aria-label="changed the format, pause, I think we should">…changed the format. <s>um,</s>${breathMark()} I think we should…</p>
            <p>The pause is what removes filler words. Where "um" used to be, close your lips, breathe in through your nose and continue when the next thought arrives.</p>
            <b>1 breath</b>
          </article>
          <article class="escape" data-w3-animate style="--i:2">
            <small>WHEN YOU NEED LONGER</small>
            <h2>Name the pause</h2>
            <p class="w4-escape-lines"><span>"Let me think about that for a moment."</span><span>"Give me a second to get this right."</span><span>"Let me pull my thoughts together."</span><span>"That's worth a proper answer. One moment."</span><span>"The biggest risk? …" <small>repeat the key words</small></span></p>
            <p>On a hard question, say you are thinking or repeat its key words. Then pause. Honest, calm and still in control.</p>
            <b>Any length</b>
          </article>
        </div>
        <blockquote>A filler tells them you are searching.<br /><strong>A pause tells them you are choosing.</strong></blockquote>
      `, { className: "w4-types" });
    } else if (step === 3) {
      const found = new Set(state.spotFound || []);
      const complete = found.size >= fillerCount;
      page = shell(`
        <p class="w3-eyebrow">SPOT THE FILLERS</p>
        <h1 id="week4PageTitle">Tap every filler.<br /><em>Turn it into silence.</em></h1>
        <article class="w4-spot-card ${complete ? "complete" : ""}">
          <header><span>A MANAGER ASKS: "WHAT'S THE BIGGEST RISK?"</span><strong data-w4-spot-count>${found.size} / ${fillerCount}</strong></header>
          <p class="w4-spot-text">${spotTokens.map(token => token.filler && found.has(token.index)
            ? breathMark()
            : `<button type="button" class="w4-word" data-w4-word="${token.index}">${esc(token.text)}</button>`).join(" ")}</p>
          <div class="w4-spot-clean" ${complete ? "" : "hidden"}>
            <small>THE SAME ANSWER, WITH PAUSES</small>
            <p>${cleanScript.map(esc).join(` ${breathMark()} `)}</p>
            <span>Same message. ${fillerCount} fewer sounds. The silence carries the confidence.</span>
          </div>
        </article>
        <div class="w3-coach-actions"><p class="w3-coach-note" data-w4-spot-note aria-live="polite">${complete ? "Every filler became a pause. Read the clean version aloud once." : "Fillers sound like words, but carry no meaning. Tap each one."}</p><button type="button" class="w3-reset-button" data-w4-action="reset-spot">Reset</button></div>
      `, { className: "w4-spot" });
    } else if (step === 12) {
      const seen = new Set(state.reasonsSeen || []);
      page = shell(`
        <p class="w3-eyebrow">WHY PAUSING WORKS</p>
        <h1 id="week4PageTitle">Four reasons<br /><em>to stop talking.</em></h1>
        <div class="w4-reasons">${reasons.map((reason, index) => `<article class="w4-reason ${seen.has(reason.id) ? "seen" : ""}" data-w3-animate style="--i:${index}">
          <button type="button" class="w4-reason-head" data-w4-reason="${reason.id}" aria-expanded="false"><span>0${index + 1}</span><strong>${esc(reason.title)}</strong><i aria-hidden="true">+</i></button>
          <div class="w4-reason-body">
            <p>${esc(reason.text)}</p>
            <div class="w4-demo" data-w4-demo="${reason.id}">
              <p class="w4-demo-line" data-w4-line-kind="without"><small>WITHOUT A PAUSE</small><span>${demoWords(reason.without)}</span></p>
              <p class="w4-demo-line good" data-w4-line-kind="with"><small>WITH A PAUSE</small><span>${demoWords(reason.with)}</span></p>
            </div>
          </div>
        </article>`).join("")}</div>
        <p class="w3-coach-note" data-w4-reasons-note aria-live="polite">${reasonsNote(seen.size)}</p>
      `, { className: "w4-reasons-screen" });
    } else if (step === 13) {
      const turned = new Set((state.beliefsTurned || []).map(Number));
      page = shell(`
        <p class="w3-eyebrow">WHAT YOUR MIND SAYS</p>
        <h1 id="week4PageTitle">“But they will think<br /><em>I do not know.”</em></h1>
        <div class="w4-beliefs">${beliefs.map((belief, index) => `<button type="button" class="w4-belief ${turned.has(index) ? "flipped" : ""}" data-w4-belief="${index}" data-w3-animate style="--i:${index}" aria-pressed="${turned.has(index)}">
          <span class="w4-belief-face front"><small>YOUR MIND SAYS</small><strong>“${esc(belief.mind)}”</strong><em>Tap to see the truth</em></span>
          <span class="w4-belief-face back"><small>WHAT THEY REALLY HEAR</small><p>${esc(belief.truth)}</p><small>TRY THIS</small><p class="tip">${esc(belief.tip)}</p></span>
        </button>`).join("")}</div>
        <p class="w3-coach-note" data-w4-beliefs-note aria-live="polite">${beliefsNote(turned.size)}</p>
      `, { className: "w4-beliefs-screen" });
    } else if (step === 14) {
      const chosen = triggers.find(item => item.id === state.pauseTrigger);
      page = shell(`
        <p class="w3-eyebrow">MAKE IT EASY</p>
        <h1 id="week4PageTitle">Pick one trigger.<br /><em>Use it every time.</em></h1>
        <p class="w3-lede">You do not need to remember rules. Choose one small action that gives you your two seconds.</p>
        <div class="w4-triggers">${triggers.map((item, index) => `<button type="button" class="w4-trigger ${chosen?.id === item.id ? "selected" : ""}" data-w4-trigger="${item.id}" data-w3-animate style="--i:${index}"><span>0${index + 1}</span><strong>${esc(item.label)}</strong></button>`).join("")}</div>
        <div class="w4-try" data-w4-try ${chosen ? "" : "hidden"}>
          <p data-w4-try-how>${esc(chosen?.how || "")}</p>
          <div class="w4-try-stage" data-w4-try-stage aria-live="polite">Press try it, then follow the steps.</div>
          <button type="button" class="w4-primary" data-w4-action="try-trigger">Try it now</button>
        </div>
        <div class="w4-practice"><small>PRACTISE WHERE NOTHING IS AT STAKE</small><ul><li>Ordering a coffee</li><li>Answering “How are you?”</li><li>Reading a message out loud</li></ul></div>
      `, { className: "w4-trigger-screen" });
    } else if (step === 5) {
      const reps = Number(state.trainerReps || 0);
      page = shell(`
        <p class="w3-eyebrow">PAUSE TRAINER</p>
        <h1 id="week4PageTitle">Hear the question.<br /><em>Then let it land.</em></h1>
        <article class="w4-trainer" data-w4-trainer>
          <p class="w4-question" data-w4-question aria-live="polite">A workplace question will appear here. Your job is to not answer it yet.</p>
          <div class="w4-ring-wrap" data-w4-ring-wrap>
            <svg class="w4-ring" viewBox="0 0 220 220" aria-hidden="true">
              <circle class="track" cx="110" cy="110" r="96" />
              <circle class="fill" data-w4-ring-fill cx="110" cy="110" r="96" style="stroke-dasharray:${ringCircumference};stroke-dashoffset:${ringCircumference}" />
            </svg>
            <div class="w4-ring-core"><i class="w4-breath-dot"></i><strong data-w4-ring-label>Ready</strong><small data-w4-ring-time>two seconds of silence</small></div>
          </div>
          <ol class="w4-phases" data-w4-phases aria-hidden="true"><li data-phase="0">Receive</li><li data-phase="1">Breathe</li><li data-phase="2">Find the point</li><li data-phase="3">Speak</li></ol>
          <p class="w4-feedback" data-w4-feedback role="status"></p>
          <div class="w4-trainer-actions">
            <button type="button" class="w4-primary" data-w4-action="ask">${reps ? "Next question" : "Ask me a question"}</button>
            <button type="button" class="w4-speak" data-w4-action="speak" hidden>I'm starting to speak <kbd>Space</kbd></button>
          </div>
          <div class="w4-reps" aria-label="${Math.min(reps, trainerTarget)} of ${trainerTarget} composed answers">${Array.from({ length: trainerTarget }, (_, index) => `<i class="${index < reps ? "done" : ""}"></i>`).join("")}<span>${Math.min(reps, trainerTarget)} / ${trainerTarget} composed answers${reps >= 2 ? " · guide hidden" : ""}</span></div>
        </article>
        <p class="w3-coach-note">${triggers.find(item => item.id === state.pauseTrigger) ? `Your trigger: ${esc(triggers.find(item => item.id === state.pauseTrigger).label.toLowerCase())}. ` : ""}Press "I'm starting to speak" the moment you open your mouth, then answer out loud, point first. From the third question the ring disappears. Trust your own two seconds.</p>
      `, { className: "w4-train" });
    } else if (step === 6) {
      page = shell(`
        <div class="w4-moon-heading"><i class="w4-moon" aria-hidden="true"></i><p class="w3-eyebrow">ON STAGE · READ ALOUD</p>
        <h1 id="week4PageTitle">Let the silence<br /><em>do the lifting.</em></h1>
        <p class="w4-moon-credit">John F. Kennedy · Rice University, 1962</p></div>
        <p class="w4-moon-instruction">Read it out loud. Stop at every <span class="w4-inline-mark">‖</span> and let one beat of silence pass. At the long pause, hold it until it feels slightly too long. Then hold one more beat.</p>
        <div class="w4-moon-script" aria-label="Reading passage with pause marks">
          ${moonScript.map((line, index) => `<p class="${line.finish ? "finish" : ""}" data-w4-line="${index}">${esc(line.text)}</p>${line.pause ? `<span class="w4-moon-pause ${line.long ? "long" : ""}" data-w4-pause="${index}"><i></i>${line.long ? "LONG PAUSE · 2 seconds" : "PAUSE · one beat"}</span>` : ""}`).join("")}
        </div>
        <div class="w4-moon-actions"><button type="button" class="w4-primary light" data-w4-action="guide-moon">Guide my pace</button><span data-w4-moon-status aria-live="polite">Or read it at your own pace.</span></div>
      `, { className: "w4-moon-screen", footer: '<button class="w3-next" type="button" data-w4-action="complete-reading">Reading complete</button>' });
    } else if (step === 7) {
      const mission = state.mission || defaultMission(level);
      page = shell(`
        <p class="w3-eyebrow">CHOOSE THE RIGHT-SIZED MISSION</p>
        <h1 id="week4PageTitle">One real question.<br /><em>Two seconds of calm.</em></h1>
        <div class="w3-level-picker" role="group" aria-label="Exposure level">${exposure.levels.map((item, index) => `<button type="button" class="${index + 1 === level ? "selected" : ""}" data-w4-level="${index + 1}"><span>${index + 1}</span><small>${esc(item.name)}</small></button>`).join("")}</div>
        <div class="w3-level-focus"><small>LEVEL ${level} · SITUATION</small><h2>${esc(levelData.name)}</h2><p>${esc(levelData.behavior)}</p></div>
        <label class="w3-mission-edit"><span>YOUR WEEK 4 CHALLENGE</span><textarea data-w4-mission rows="2">${esc(mission)}</textarea></label>
        <div class="w3-win-line"><small>WIN CONDITION</small><strong>I paused on purpose instead of filling the silence at least once.</strong></div>
      `, { footer: '<button class="w3-next mission-accept" type="button" data-w4-action="accept-mission">Accept mission</button>' });
    } else if (step === 8) {
      page = shell(`
        <p class="w3-eyebrow">LECTURE 4 COMPLETE</p>
        <h1 id="week4PageTitle">The silence is yours.<br /><em>Your mission is active.</em></h1>
        <article class="w3-mission-mini active"><small>YOUR WEEK 4 MISSION</small><p>${esc(state.mission)}</p><strong>Win by pausing on purpose at least once.</strong></article>
        <div class="w3-leave-plan"><article><span>01</span><strong>Leave the lecture</strong><p>Take the thinking pause and the bridge pause into your week.</p></article><article><span>02</span><strong>Attempt the mission</strong><p>A pause that feels too long is usually just right.</p></article><article><span>03</span><strong>Return with reality</strong><p>Use "Report mission" in your portal.</p></article></div>
        <blockquote>The lecture ends here.<br /><strong>The evidence begins the first time you choose silence over "um".</strong></blockquote>
      `, { footer: '<button class="w3-next" type="button" data-w4-action="close">Return to my portal</button>' });
    } else if (step === 9) {
      page = shell(`
        <p class="w3-eyebrow">WELCOME BACK</p>
        <h1 id="week4PageTitle">Did you pause<br /><em>on purpose?</em></h1>
        <p class="w3-lede">The win is the attempt. Nothing else is required.</p>
        <article class="w3-mission-mini"><small>YOUR MISSION</small><p>${esc(state.mission)}</p></article>
        <div class="w3-did-it"><button type="button" data-w4-action="mission-not-yet"><span>NOT YET</span><small>Save and return later</small></button><button type="button" class="yes" data-w4-action="mission-yes"><span>YES</span><small>I attempted it</small></button></div>
      `, { lockBack: true, footer: '<span class="w3-footer-hint">Your mission stays active until you attempt it.</span>' });
    } else if (step === 10) {
      page = shell(`
        <p class="w3-eyebrow">REALITY CHECK</p>
        <h1 id="week4PageTitle">What actually happened?</h1>
        <p class="w3-lede">One short answer. No report and no long reflection.</p>
        <div class="w3-input-card">
          <textarea data-w4-result rows="3" placeholder="I paused before answering my manager. It felt long to me, and nobody reacted. My first sentence was my point…">${esc(state.actualResult)}</textarea>
        </div>
      `, { lockBack: true, footer: '<button class="w3-next" type="button" data-w4-action="collect-evidence">Collect evidence</button>' });
    } else {
      const evidence = (portal.getState().evidence || []).find(item => item.id === state.evidenceId);
      page = shell(`
        <p class="w3-eyebrow">WEEK 4 COMPLETE</p>
        <h1 id="week4PageTitle">You held the silence.<br /><em>You proved it works.</em></h1>
        <div class="w3-completion-stats"><article><small>SKILL UNLOCKED</small><strong>The Pause</strong></article><article><small>PAUSE TOOLS</small><strong>Think · Bridge · Name</strong></article><article><small>EXPOSURE</small><strong>Level ${state.missionLevel || level}</strong></article><article><small>EVIDENCE COLLECTED</small><strong>1</strong></article></div>
        <article class="w3-evidence-card"><header><small>EVIDENCE COLLECTED</small><span>WEEK 4</span></header><div><small>YOUR MISSION</small><p>${esc(evidence?.situation || state.mission)}</p></div><div><small>WHAT HAPPENED</small><p>${esc(evidence?.result || state.actualResult)}</p></div></article>
        <div class="w3-week-progress">${[1, 2, 3, 4].map(number => `<span class="complete">W${number} <i>●</i></span>`).join("")}${[5, 6].map(number => `<span>W${number} <i>○</i></span>`).join("")}</div>
        <div class="w3-next-week"><small>NEXT</small><strong>Find the music in your voice.</strong></div>
      `, { lockBack: true, footer: '<button class="w3-next" type="button" data-w4-action="close">Return to my portal</button>' });
    }

    trainer = { phase: "idle", question: trainer.question, startedAt: 0, feedback: null };
    root.innerHTML = page;
    document.body.classList.add("week4-open");
    requestAnimationFrame(() => {
      root.querySelectorAll("[data-w3-animate]").forEach(el => el.classList.add("in"));
      if (step === 0) playHero();
      root.querySelector("textarea, input, button:not([disabled])")?.focus({ preventScroll: true });
    });
  }

  /* ---------- opening: fillers dissolve into silence ---------- */
  function playHero() {
    const line = root.querySelector(".w4-hero-line");
    if (!line) return;
    const fillers = [...line.querySelectorAll(".filler")];
    const cycle = () => {
      line.classList.remove("clean");
      fillers.forEach(el => el.classList.remove("gone"));
      fillers.forEach((el, index) => later(() => el.classList.add("gone"), 1400 + index * 450));
      later(() => line.classList.add("clean"), 1400 + fillers.length * 450 + 200);
      later(cycle, 1400 + fillers.length * 450 + 4200);
    };
    cycle();
  }

  /* ---------- slide 1: two seconds, inside vs outside ---------- */
  function feelSilence(button) {
    clearTimers();
    const card = root.querySelector("[data-w4-clock]");
    const inside = root.querySelector("[data-w4-clock-in]");
    const outside = root.querySelector("[data-w4-clock-out]");
    const fill = root.querySelector("[data-w4-silence-fill]");
    const caption = root.querySelector("[data-w4-clock-caption]");
    button.disabled = true;
    button.textContent = "Stay silent…";
    card.classList.remove("done");
    card.classList.add("running");
    caption.textContent = "Silence. Notice the urge to fill it.";
    const start = performance.now();
    const tick = now => {
      const t = Math.max(0, Math.min(1, (now - start) / pauseTarget));
      const felt = Math.round(10 * (1 - Math.pow(1 - t, 2.2)));
      inside.textContent = `${felt}s`;
      outside.textContent = `${(t * 2).toFixed(1)}s`;
      fill.style.width = `${t * 100}%`;
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    // A timer owns completion so the demo always finishes, even if animation frames are throttled.
    later(() => {
      if (frame) cancelAnimationFrame(frame);
      frame = null;
      fill.style.width = "100%";
      outside.textContent = "2.0s";
      inside.textContent = "Forever";
      card.classList.remove("running");
      card.classList.add("done");
      caption.textContent = "Two seconds. To them, it sounded like thought.";
      button.disabled = false;
      button.textContent = "Feel it again";
      root.querySelector("[data-w4-coaches]")?.classList.add("in");
      update({ feltSilence: true });
    }, pauseTarget);
  }

  /* ---------- slide 3: spot the fillers ---------- */
  function tapWord(button) {
    const token = spotTokens[Number(button.dataset.w4Word)];
    if (!token) return;
    if (!token.filler) {
      button.classList.remove("nope");
      void button.offsetWidth;
      button.classList.add("nope");
      const note = root.querySelector("[data-w4-spot-note]");
      if (note) note.textContent = `"${token.text.replace(/[.,;]$/, "")}" carries meaning. Keep it.`;
      return;
    }
    const found = [...new Set([...(getState().spotFound || []), token.index])];
    update({ spotFound: found });
    button.classList.add("vanish");
    button.disabled = true;
    // Update in place so the slide does not replay its entrance animation on every tap.
    later(() => {
      button.outerHTML = breathMark();
      const complete = found.length >= fillerCount;
      const count = root.querySelector("[data-w4-spot-count]");
      if (count) count.textContent = `${found.length} / ${fillerCount}`;
      if (!complete) return;
      root.querySelector(".w4-spot-card")?.classList.add("complete");
      const clean = root.querySelector(".w4-spot-clean");
      if (clean) clean.hidden = false;
      const note = root.querySelector("[data-w4-spot-note]");
      if (note) note.textContent = "Every filler became a pause. Read the clean version aloud once.";
    }, 260);
  }

  /* ---------- slide 5: pause trainer ---------- */
  function trainerEls() {
    return {
      question: root.querySelector("[data-w4-question]"),
      wrap: root.querySelector("[data-w4-ring-wrap]"),
      fill: root.querySelector("[data-w4-ring-fill]"),
      label: root.querySelector("[data-w4-ring-label]"),
      time: root.querySelector("[data-w4-ring-time]"),
      phases: [...root.querySelectorAll("[data-w4-phases] li")],
      feedback: root.querySelector("[data-w4-feedback]"),
      ask: root.querySelector('[data-w4-action="ask"]'),
      speak: root.querySelector('[data-w4-action="speak"]')
    };
  }

  function askQuestion() {
    clearTimers();
    const els = trainerEls();
    const guided = Number(getState().trainerReps || 0) < 2;
    trainer.question = (trainer.question + 1) % trainerQuestions.length;
    trainer.phase = "reading";
    const questionWords = trainerQuestions[trainer.question].split(" ");
    els.question.innerHTML = questionWords.map(word => `<span>${esc(word)}</span>`).join(" ");
    els.question.classList.remove("in");
    void els.question.offsetWidth;
    els.question.classList.add("in", "asking");
    els.wrap.classList.remove("ready", "rushed", "composed", "live");
    els.wrap.classList.toggle("unguided", !guided);
    els.wrap.classList.add("listening");
    els.fill.style.strokeDashoffset = String(ringCircumference);
    els.label.textContent = "Listen";
    els.time.textContent = "the question is being asked";
    els.phases.forEach(li => li.classList.remove("active", "past"));
    els.feedback.textContent = "";
    els.feedback.className = "w4-feedback";
    els.ask.hidden = true;
    els.speak.hidden = true;

    // The question is "spoken" word by word, then held briefly so it can be read in full.
    // The pause only starts once the question has finished.
    const spans = [...els.question.querySelectorAll("span")];
    spans.forEach((span, index) => later(() => span.classList.add("said"), index * questionWordMs));
    later(() => startPause(els, guided), spans.length * questionWordMs + questionHoldMs);
  }

  function startPause(els, guided) {
    trainer.phase = "waiting";
    trainer.startedAt = performance.now();
    els.question.classList.remove("asking");
    els.wrap.classList.remove("listening");
    els.wrap.classList.add("live");
    els.speak.hidden = false;
    els.speak.focus({ preventScroll: true });
    const phaseLabels = ["Receive", "Breathe", "Find the point"];
    const tick = now => {
      if (trainer.phase !== "waiting") return;
      const elapsed = Math.max(0, now - trainer.startedAt);
      const t = Math.min(1, elapsed / pauseTarget);
      const phase = elapsed >= pauseTarget ? 3 : Math.min(2, Math.floor(t * 3));
      els.fill.style.strokeDashoffset = String(ringCircumference * (1 - t));
      els.phases.forEach((li, index) => { li.classList.toggle("active", index === phase); li.classList.toggle("past", index < phase); });
      if (guided) {
        els.label.textContent = phase === 3 ? "Speak" : phaseLabels[phase];
        els.time.textContent = `${(elapsed / 1000).toFixed(1)}s`;
      } else {
        els.label.textContent = "Breathe";
        els.time.textContent = "trust your two seconds";
      }
      els.wrap.classList.toggle("ready", elapsed >= pauseTarget && guided);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
  }

  function startSpeaking() {
    if (trainer.phase !== "waiting") return;
    trainer.phase = "done";
    if (frame) cancelAnimationFrame(frame);
    frame = null;
    const elapsed = performance.now() - trainer.startedAt;
    const seconds = (elapsed / 1000).toFixed(1);
    const els = trainerEls();
    const composed = elapsed >= pauseTarget;
    let message;
    if (elapsed < 1000) message = `You started at ${seconds}s. The answer began before the point did. Let the question land first.`;
    else if (!composed) message = `${seconds}s. So close. Give it one more breath next time.`;
    else if (elapsed <= 6000) message = `Composed · ${seconds}s. That silence read as thought. Now say your point out loud.`;
    else message = `${seconds}s. Long, and that is fine. On a hard question you can name it: "Let me think about that for a moment."`;
    const reps = Number(getState().trainerReps || 0) + (composed ? 1 : 0);
    update({ trainerReps: reps, trainerAttempts: Number(getState().trainerAttempts || 0) + 1 });
    els.wrap.classList.remove("live", "ready", "unguided");
    els.wrap.classList.add(composed ? "composed" : "rushed");
    els.fill.style.strokeDashoffset = String(ringCircumference * (1 - Math.min(1, elapsed / pauseTarget)));
    els.label.textContent = composed ? "Composed" : "Too soon";
    els.time.textContent = `${seconds}s of silence`;
    els.phases.forEach(li => li.classList.remove("active"));
    els.feedback.textContent = message;
    els.feedback.className = `w4-feedback ${composed ? "good" : "soon"}`;
    els.speak.hidden = true;
    els.ask.hidden = false;
    els.ask.textContent = composed ? "Next question" : "Try another";
    const dots = [...root.querySelectorAll(".w4-reps i")];
    dots.forEach((dot, index) => dot.classList.toggle("done", index < reps));
    const counter = root.querySelector(".w4-reps span");
    if (counter) counter.textContent = `${Math.min(reps, trainerTarget)} / ${trainerTarget} composed answers${reps >= 2 ? " · guide hidden" : ""}`;
    if (composed && reps === trainerTarget) portal.showToast("Three composed answers. Your pause is ready for real questions.");
    else if (composed && reps === 2) portal.showToast("Next question has no guide. Trust your own two seconds.");
  }

  /* ---------- slide 6: guided reading ---------- */
  function guideMoon(button) {
    clearTimers();
    const lines = [...root.querySelectorAll("[data-w4-line]")];
    const pauses = [...root.querySelectorAll("[data-w4-pause]")];
    const status = root.querySelector("[data-w4-moon-status]");
    lines.forEach(el => el.classList.remove("lit", "past"));
    pauses.forEach(el => el.classList.remove("lit", "past"));
    button.disabled = true;
    button.textContent = "Guiding…";
    let offset = 300;
    moonScript.forEach((line, index) => {
      const lineEl = lines[index];
      const pauseEl = pauses.find(el => Number(el.dataset.w4Pause) === index);
      const speakTime = Math.max(1400, line.text.split(/\s+/).length * 380);
      later(() => {
        lines.forEach((el, i) => { el.classList.toggle("lit", i === index); el.classList.toggle("past", i < index); });
        pauses.forEach(el => el.classList.remove("lit"));
        if (status) status.textContent = "Speak";
        lineEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }, offset);
      offset += speakTime;
      if (pauseEl) {
        later(() => {
          lineEl.classList.remove("lit");
          lineEl.classList.add("past");
          pauseEl.classList.add("lit");
          if (status) status.textContent = line.long ? "Hold… one more beat." : "Pause. Let it land.";
        }, offset);
        later(() => { pauseEl.classList.remove("lit"); pauseEl.classList.add("past"); }, offset + line.pause);
        offset += line.pause;
      }
    });
    later(() => {
      lines.forEach(el => { el.classList.remove("lit"); el.classList.add("past"); });
      button.disabled = false;
      button.textContent = "Guide me again";
      if (status) status.textContent = "Notice how much weight the silence added.";
    }, offset + 600);
  }

  /* ---------- why pausing works ---------- */
  function toggleReason(head) {
    const card = head.closest(".w4-reason");
    const open = !card.classList.contains("open");
    // One reason open at a time keeps the slide short.
    root.querySelectorAll(".w4-reason.open").forEach(other => { other.classList.remove("open"); other.querySelector("[data-w4-reason]").setAttribute("aria-expanded", "false"); });
    card.classList.toggle("open", open);
    head.setAttribute("aria-expanded", String(open));
    clearTimers();
    root.querySelectorAll(".w4-demo .lit").forEach(el => el.classList.remove("lit"));
    if (!open) return;
    card.classList.add("seen");
    const seen = [...new Set([...(getState().reasonsSeen || []), head.dataset.w4Reason])];
    update({ reasonsSeen: seen });
    const note = root.querySelector("[data-w4-reasons-note]");
    if (note) note.textContent = reasonsNote(seen.length);
    later(() => playDemo(head.dataset.w4Reason), 450);
  }

  function playDemo(id) {
    clearTimers();
    const reason = reasons.find(item => item.id === id);
    const box = root.querySelector(`[data-w4-demo="${id}"]`);
    if (!reason || !box) return;
    box.querySelectorAll(".lit").forEach(el => el.classList.remove("lit"));
    let offset = 200;
    [["without", reason.without], ["with", reason.with]].forEach(([kind, tokens]) => {
      const pieces = [...box.querySelectorAll(`[data-w4-line-kind="${kind}"] .w4-dw, [data-w4-line-kind="${kind}"] .w4-gap`)];
      let index = 0;
      tokens.forEach(token => {
        if (token.p) {
          const gap = pieces[index++];
          later(() => gap.classList.add("lit"), offset);
          offset += token.p;
        } else {
          token.t.split(" ").forEach(() => {
            const word = pieces[index++];
            later(() => word.classList.add("lit"), offset);
            offset += token.ms;
          });
        }
      });
      offset += 900;
    });
    // Keep it alive: play the pair again for as long as the reason stays open.
    later(() => { if (box.closest(".w4-reason.open")) playDemo(id); }, offset + 1200);
  }

  function turnBelief(card) {
    const index = Number(card.dataset.w4Belief);
    card.classList.toggle("flipped");
    card.setAttribute("aria-pressed", String(card.classList.contains("flipped")));
    const turned = [...new Set([...(getState().beliefsTurned || []).map(Number), index])];
    update({ beliefsTurned: turned });
    const note = root.querySelector("[data-w4-beliefs-note]");
    if (note) note.textContent = beliefsNote(turned.length);
  }

  function chooseTrigger(button) {
    const trigger = triggers.find(item => item.id === button.dataset.w4Trigger);
    if (!trigger) return;
    update({ pauseTrigger: trigger.id, mission: "" });
    root.querySelectorAll("[data-w4-trigger]").forEach(el => el.classList.toggle("selected", el === button));
    const panel = root.querySelector("[data-w4-try]");
    panel.hidden = false;
    panel.querySelector("[data-w4-try-how]").textContent = trigger.how;
    const stage = panel.querySelector("[data-w4-try-stage]");
    stage.textContent = "Press try it, then follow the steps.";
    stage.classList.remove("done");
  }

  function tryTrigger() {
    clearTimers();
    const trigger = triggers.find(item => item.id === getState().pauseTrigger);
    if (!trigger) return;
    const stage = root.querySelector("[data-w4-try-stage]");
    const button = root.querySelector('[data-w4-action="try-trigger"]');
    button.disabled = true;
    trigger.steps.forEach((text, index) => later(() => {
      stage.textContent = text;
      stage.classList.toggle("done", index === trigger.steps.length - 1);
    }, index * 1000));
    later(() => { button.disabled = false; button.textContent = "Try it again"; }, trigger.steps.length * 1000);
  }

  function validateAndNext() {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const requirements = {
      1: [state.feltSilence, "Hold two seconds of silence first."],
      3: [(state.spotFound || []).length >= fillerCount ? "ok" : "", `Find all ${fillerCount} fillers before continuing.`],
      5: [Number(state.trainerReps || 0) >= trainerTarget ? "ok" : "", `Complete ${trainerTarget} composed answers with a two-second pause.`],
      12: [(state.reasonsSeen || []).length >= reasons.length ? "ok" : "", "Open all four reasons before continuing."],
      13: [(state.beliefsTurned || []).length >= beliefs.length ? "ok" : "", "Turn all three cards before continuing."],
      14: [state.pauseTrigger, "Pick your pause trigger first."],
      7: [state.mission || defaultMission(getLevel()), "Choose one small mission."]
    };
    if (requirements[step] && !String(requirements[step][0] || "").trim()) {
      portal.showToast(requirements[step][1]);
      return;
    }
    update({ currentStep: stepOrder[Math.min(stepOrder.indexOf(8), stepOrder.indexOf(step) + 1)], lastViewedAt: new Date().toISOString() });
    renderStep();
  }

  function back() {
    const step = Number(getState().currentStep || 0);
    if (step <= 0) return;
    update({ currentStep: stepOrder[Math.max(0, stepOrder.indexOf(step) - 1)] });
    renderStep();
  }

  function close() {
    clearTimers();
    trainer.phase = "idle";
    update({ lastViewedAt: new Date().toISOString() });
    root.innerHTML = "";
    document.body.classList.remove("week4-open");
    portal.renderAll();
    previousFocus?.focus?.();
  }

  function collectEvidence() {
    const state = getState();
    if (!String(state.actualResult || "").trim()) {
      portal.showToast("Add one short sentence about what actually happened.");
      root.querySelector("[data-w4-result]")?.focus();
      return;
    }
    const id = state.evidenceId || `week4-${Date.now()}`;
    const card = {
      id,
      week: 4,
      skill: "Pause",
      prediction: state.prediction,
      reality: state.actualResult,
      beliefBefore: Number(state.beliefBefore),
      beliefAfter: Number(state.beliefAfter),
      level: Number(state.missionLevel || getLevel()),
      mission: state.mission,
      completedAt: new Date().toISOString()
    };
    portal.saveEvidence(card);
    update({ evidenceId: id, completedAt: card.completedAt, currentStep: 11 });
    portal.showToast("Pause evidence collected.");
    renderStep();
  }

  root.addEventListener("click", event => {
    const actionEl = event.target.closest("[data-w4-action]");
    const action = actionEl?.dataset.w4Action;
    if (action === "close") return close();
    if (action === "reset") { clearTimers(); if (portal.resetLecture(4)) renderStep(); return; }
    if (action === "back") return back();
    if (action === "next") return validateAndNext();
    if (action === "feel-silence") return feelSilence(actionEl);
    if (action === "ask") return askQuestion();
    if (action === "speak") return startSpeaking();
    if (action === "guide-moon") return guideMoon(actionEl);
    if (action === "play-demo") return playDemo(actionEl.dataset.w4DemoId);
    if (action === "try-trigger") return tryTrigger();
    if (action === "reset-spot") { update({ spotFound: [] }); return renderStep(); }
    if (action === "complete-reading") {
      update({ readingCompleted: true, currentStep: 7 });
      portal.showToast("Reading complete. Choose your real-world mission.");
      return renderStep();
    }
    if (action === "accept-mission") {
      const state = getState();
      const level = getLevel();
      update({ mission: state.mission || defaultMission(level), missionLevel: level, missionStatus: "accepted", acceptedAt: new Date().toISOString(), lectureCompletedAt: new Date().toISOString(), currentStep: 8 });
      portal.showToast("Mission accepted. One deliberate pause is the win.");
      return renderStep();
    }
    if (action === "mission-not-yet") return close();
    if (action === "mission-yes") { update({ missionStatus: "completed", currentStep: 10 }); return renderStep(); }
    if (action === "collect-evidence") return collectEvidence();

    const reasonHead = event.target.closest("[data-w4-reason]");
    if (reasonHead) return toggleReason(reasonHead);
    const belief = event.target.closest("[data-w4-belief]");
    if (belief) return turnBelief(belief);
    const trigger = event.target.closest("[data-w4-trigger]");
    if (trigger) return chooseTrigger(trigger);

    const word = event.target.closest("[data-w4-word]");
    if (word) return tapWord(word);

    const levelButton = event.target.closest("[data-w4-level]");
    if (levelButton) {
      const level = exposure.clampLevel(levelButton.dataset.w4Level);
      portal.setExposureLevel(level);
      update({ currentLevel: level, mission: defaultMission(level), missionLevel: null });
      return renderStep();
    }
  });

  root.addEventListener("input", event => {
    if (event.target.matches("[data-w4-mission]")) update({ mission: event.target.value });
    else if (event.target.matches("[data-w4-result]")) update({ actualResult: event.target.value });
  });

  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-week4-reflection]")) {
      previousFocus = document.activeElement;
      update({ currentStep: 9 });
      return renderStep();
    }
    if (!event.target.closest("[data-open-week4-lecture]")) return;
    previousFocus = document.activeElement;
    renderStep();
  });

  document.addEventListener("keydown", event => {
    if (!document.body.classList.contains("week4-open")) return;
    if (event.key === "Escape") return close();
    if (event.code === "Space" && trainer.phase === "waiting") {
      event.preventDefault();
      startSpeaking();
    }
  });
})();


