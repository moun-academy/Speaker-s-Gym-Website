(function () {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const exposure = window.SpeakersGymExposure;
  const root = document.querySelector("#week3Root");
  if (!portal || !exposure || !root) return;

  const chapters = [
    { title: "Hear the Difference", start: 1, end: 1 },
    { title: "Fast, Slow, Stop", start: 6, end: 7 },
    { title: "Practice With a Pace Map", start: 9, end: 10 },
    { title: "Keep Moving Forward", start: 11, end: 11 },
    { title: "Leave With One Moment to Shape Your Pace", start: 12, end: 14 }
  ];

  const stages = [
    { name: "DISCOVER", end: 4 },
    { name: "TUNE", end: 8 },
    { name: "SPEAK", end: 11 },
    { name: "PROVE", end: 14 }
  ];

  const missionTemplates = [
    "Record one private 60-second answer in the Speaker's Gym app and slow the key sentence on purpose.",
    "Post one 60-second audio speech in the community Speech channel with a faster setup and a slower main point.",
    "Post one 60-second video speech in the community Speech channel and slow the main point on purpose.",
    "Speak with a colleague in a familiar one-to-one conversation and slow the one sentence that matters most.",
    "Share one idea with two to four familiar people and slow the one sentence that matters most.",
    "In one routine meeting, stop for one beat before your main point, then say it slowly.",
    "Answer one unplanned workplace question in 45 to 90 seconds, using a pause and a slower main point.",
    "Lead a three to five-minute workplace update, using a faster setup, a pause and a slower recommendation.",
    "Answer one unexpected management question in 45 to 90 seconds, pausing before a slower main point.",
    "Present one recommendation in a meaningful management or client meeting, using a faster setup, a pause and a slower recommendation."
  ];

  const gears = {
    hold: { label: "SLOW", action: "Slow down", rate: "100 to 120 wpm", tagline: "for what is important" },
    run: { label: "FAST", action: "Speed up", rate: "150 to 170 wpm", tagline: "for what they already know" },
    stop: { label: "STOP", rate: "0 wpm", tagline: "for what must be felt" }
  };
  const gearOrder = ["run", "hold", "stop"];

  const demoSentence = "The decision is not about the budget. It is about trust.";

  const sortItems = [
    { id: "point", text: "Your main point", answer: "hold", why: "New and load-bearing. Give it room." },
    { id: "background", text: "Background the listener already knows", answer: "run", why: "Familiar ground. Move through it." },
    { id: "number", text: "A number or a name", answer: "hold", why: "Numbers need processing time." },
    { id: "transition", text: "A transition between ideas", answer: "run", why: "Connective tissue. Keep it moving." },
    { id: "recommendation", text: "Your recommendation", answer: "hold", why: "This is the sentence they will repeat." },
    { id: "example", text: "A familiar example", answer: "run", why: "They can picture it already. Speed reads as confidence." }
  ];
  const sortOrder = ["background", "point", "number", "transition", "example", "recommendation"];

  function currentPaceMap() {
    const saved = getState().paceMap || {};
    const ids = ["point", "reason", "example", "finalPoint"];
    if (!getState().paceMapConfigured) return Object.fromEntries(ids.map(id => [id, null]));
    return Object.fromEntries(ids.map(id => [id, ["hold", "run"].includes(saved[id]) ? saved[id] : null]));
  }

  const demoModes = {
    flat: { label: "Slow", meaning: "Sounds calm and deliberate.", note: "Every word gets time and space.", timings: null, perWord: 650 },
    rushed: { label: "Fast", meaning: "Sounds urgent and energetic.", note: "Every word moves quickly.", timings: null, perWord: 130 },
    shaped: { label: "Dynamic", meaning: "Sounds like a decision.", note: "Fast setup. Pause. Slow point.", timings: [150, 150, 150, 150, 150, 150, 1050, 600, 600, 600, 600], perWord: null }
  };

  // Keep saved step IDs stable while removing retired screens from navigation.
  const stepOrder = [0, 1, 6, 7, 9, 10, 11, 13, 14, 15, 16, 17];
  const lectureStepCount = 9;
  let previousFocus = null;
  let timers = [];

  const esc = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  const getState = () => portal.getState().week3Lecture;
  const update = patch => portal.updateWeek3(patch);
  const getLevel = () => exposure.clampLevel(getState().currentLevel || portal.getState().week2Lecture.currentLevel || 1);
  const chapterFor = step => chapters.find(chapter => step >= chapter.start && step <= chapter.end);
  const stageFor = step => stages.find(stage => step <= stage.end) || stages[3];
  const words = text => String(text || "").trim().split(/\s+/).filter(Boolean);

  function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function every(fn, ms) { const id = setInterval(fn, ms); timers.push(id); return id; }
  function clearTimers() { timers.forEach(id => { clearTimeout(id); clearInterval(id); }); timers = []; }

  function practiceMaterial() {
    return {
      topic: "A short walk to clear your mind",
      segments: [
        { id: "point", letter: "P", name: "POINT", keyword: "RESET", sentence: "A short walk is a good way to clear your mind." },
        { id: "reason", letter: "R", name: "REASON", keyword: "DISTANCE", sentence: "It creates distance from whatever was crowding my thinking." },
        { id: "example", letter: "E", name: "EXAMPLE", keyword: "MOMENT", sentence: "After a stressful meeting last week, ten minutes outside changed my whole afternoon." },
        { id: "finalPoint", letter: "P", name: "FINAL POINT", keyword: "WALK", sentence: "That is why I walk before I decide anything important." }
      ]
    };
  }

  function topicChip(material) {
    return `<span class="w3-topic-chip"><small>PRACTICE TOPIC</small>${esc(material.topic)}</span>`;
  }

  function wordSpans(text, attr) {
    return words(text).map((word, index) => `<span ${attr}="${index}">${esc(word)}</span>`).join(" ");
  }

  function paceMapMarkup(material, map, options = {}) {
    return `<div class="w3-pace-map ${options.compact ? "compact" : ""}" ${options.interactive ? 'data-w3-map-interactive' : ""}>${material.segments.map(segment => {
      const gear = map[segment.id];
      const label = gear ? gears[gear].label : "CHOOSE";
      return `${segment.id === "finalPoint" ? '<div class="w3-map-pause" data-w3-map-pause><strong>Pause</strong><small>2 seconds of silence</small></div>' : ""}<${options.interactive ? "button type=\"button\"" : "article"} class="w3-map-segment ${gear || "neutral"}" ${options.interactive ? `data-w3-map-segment="${segment.id}"` : ""} data-w3-segment="${segment.id}">
        <header><span>${segment.letter}</span><small>${segment.name}</small><b class="w3-gear-pill ${gear || "neutral"}">${label}</b></header>
        <strong>${esc(segment.keyword)}</strong>
        <p>${esc(segment.sentence)}</p>
        <i class="w3-ribbon ${gear || "neutral"}" aria-hidden="true"><em></em><em></em><em></em><em></em><em></em><em></em><em></em><em></em></i>
      </${options.interactive ? "button" : "article"}>`;
    }).join("")}</div>`;
  }

  function shell(content, options = {}) {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const chapter = chapterFor(step);
    const chapterIndex = chapter ? chapters.indexOf(chapter) : -1;
    const slideNumber = stepOrder.indexOf(step) + 1;
    const afterMission = step >= 15;
    const canBack = step > 0 && !options.lockBack;
    const progress = Math.round((Math.min(lectureStepCount, slideNumber) / lectureStepCount) * 100);
    const chapterLabel = step === 0 ? "YOUR FIVE OUTCOMES" : afterMission ? "MISSION FOLLOW-UP" : "WEEK 3";
    const chapterTitle = chapter?.title || (step === 0 ? "Pace Variety" : "Turn experience into evidence");
    const stage = stageFor(step);

    return `<div class="week3-page" role="dialog" aria-modal="true" aria-labelledby="week3PageTitle">
      <header class="w3-header">
        <div class="w3-brand"><img src="Logo.png?v=pankaj-lecture-v1" alt="" /><div><small>THE SPEAKER'S GYM</small><strong>WEEK 3 · PACE VARIETY</strong></div></div>
        <div class="w3-chapter-track" aria-label="${esc(chapter ? `Chapter ${chapterIndex + 1} of ${chapters.length}: ${chapterTitle}` : chapterTitle)}">
          <div><small>${chapter ? `CHAPTER ${String(chapterIndex + 1).padStart(2, "0")} OF ${String(chapters.length).padStart(2, "0")}` : chapterLabel}</small><strong>${esc(chapterTitle)}</strong></div>
          <div class="w3-chapter-dots" aria-hidden="true">${chapters.map((item, index) => `<i class="${index < chapterIndex ? "done" : index === chapterIndex ? "active" : ""}"></i>`).join("")}</div>
        </div>
        <button class="w3-close" type="button" data-w3-action="close" aria-label="Save and close">&times;</button>
        <div class="w3-progress" aria-hidden="true"><i style="width:${progress}%"></i></div>
      </header>
      <main class="w3-main"><section class="w3-screen ${options.className || ""}">${content}</section></main>
      <footer class="w3-footer">
        <button class="w3-back" type="button" data-w3-action="back" ${canBack ? "" : "disabled"}>Back</button>
        <span>${afterMission ? "AFTER THE MISSION" : `${stage.name} · ${slideNumber} / ${lectureStepCount}`}</span>
        <div class="w3-footer-actions">${options.footer || `<button class="w3-next" type="button" data-w3-action="next">${options.nextLabel || "Continue"}</button>`}</div>
      </footer>
    </div>`;
  }

  function renderStep() {
    clearTimers();
    const state = getState();
    const savedStep = Number(state.currentStep || 0);
    const step = stepOrder.find(item => item >= savedStep) ?? 0;
    if (step !== savedStep) update({ currentStep: step });
    const material = practiceMaterial();
    const level = getLevel();
    const levelData = exposure.levels[level - 1];
    const map = currentPaceMap();
    let page = "";

    if (step === 0) {
      page = shell(`
        <p class="w3-eyebrow">WEEK 3 · PACE VARIETY</p>
        <h1 id="week3PageTitle">You already have the words.<br /><em>Pace decides which ones land.</em></h1>
        <div class="w3-hero-line" aria-hidden="true">${wordSpans("Fast for the setup. Slow for the point. Pause.", "data-w3-hero")}</div>
        <div class="w3-agenda">${chapters.map((chapter, index) => `<article data-w3-animate style="--i:${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${esc(chapter.title)}</strong></article>`).join("")}</div>
      `, { className: "opening", nextLabel: "Start with why" });
    } else if (step === 1) {
      const mode = demoModes[state.demoMode] || null;
      page = shell(`
        <p class="w3-eyebrow">WHY PACE MATTERS</p>
        <h1>Same words.<br />Different pace. <em>Different meaning.</em></h1>
        <article class="w3-demo-card">
          <p class="w3-demo-line" data-w3-demo-line>${wordSpans(demoSentence, "data-w3-demo-word")}</p>
          <div class="w3-demo-meaning" data-w3-demo-meaning aria-live="polite">${mode ? `<strong>${esc(mode.meaning)}</strong><span>${esc(mode.note)}</span>` : `<span>Press a pace to hear the same sentence change its meaning.</span>`}</div>
          <div class="w3-demo-buttons">${Object.entries(demoModes).map(([id, item]) => `<button type="button" class="${state.demoMode === id ? "selected" : ""} ${id}" data-w3-demo="${id}"><strong>${item.label}</strong><small>${id === "flat" ? "all slow" : id === "rushed" ? "all fast" : "fast · pause · slow"}</small></button>`).join("")}</div>
        </article>
        <p class="w3-coach-note">One unchanging pace makes your priorities the listener's problem. Most listeners will not do that work.</p>
      `);
    } else if (step === 6) {
      page = shell(`
        <p class="w3-eyebrow">THREE GEARS</p>
        <h1>You only need<br /><em>three speeds.</em></h1>
        <div class="w3-gears">${gearOrder.map((id, index) => `<article class="${id}" data-w3-animate style="--i:${index}">
            <span>${gears[id].action || "Stop"}</span><small>${gears[id].rate}</small>
            <strong>${esc(gears[id].tagline)}</strong>
            <i class="w3-ribbon ${id}" aria-hidden="true"><em></em><em></em><em></em><em></em><em></em><em></em><em></em><em></em></i>
            <p>${id === "hold" ? "Your point. A number. Your recommendation. Say it one word at a time." : id === "run" ? "Background, transitions, the familiar. Move, and let the movement read as confidence." : "One beat of silence before the sentence that matters. Pace taken to zero is the strongest emphasis you have."}</p>
          </article>`).join("")}</div>
        <blockquote>Engagement does not come from speed.<br /><strong>It comes from variety.</strong></blockquote>
      `);
    } else if (step === 7) {
      const answers = state.sortAnswers || {};
      page = shell(`
        <p class="w3-eyebrow">THE RULE OF THUMB</p>
        <h1>Slow the new.<br /><em>Speed the known.</em></h1>
        <div class="w3-sorter">${sortOrder.map(id => sortItems.find(item => item.id === id)).map((item, index) => {
          const chosen = answers[item.id];
          const correct = chosen && chosen === item.answer;
          return `<article class="${chosen ? (correct ? "correct" : "wrong") : ""}" data-w3-animate style="--i:${index}">
            <strong>${esc(item.text)}</strong>
            <div class="w3-sort-buttons">
              <button type="button" class="hold ${chosen === "hold" ? "chosen" : ""}" data-w3-sort="${item.id}" data-w3-gear="hold" ${chosen ? "disabled" : ""}>SLOW</button>
              <button type="button" class="run ${chosen === "run" ? "chosen" : ""}" data-w3-sort="${item.id}" data-w3-gear="run" ${chosen ? "disabled" : ""}>FAST</button>
            </div>
            <small>${chosen ? `${correct ? "Yes." : `${gears[item.answer].label}.`} ${esc(item.why)}` : "&nbsp;"}</small>
          </article>`;
        }).join("")}</div>
        <div class="w3-coach-actions"><p class="w3-coach-note">Choose Fast or Slow for each example. Notice where you naturally speed up and where the listener needs you to slow down.</p><button type="button" class="w3-reset-button" data-w3-action="reset-sort">Reset</button></div>
      `);
    } else if (step === 9) {
      page = shell(`
        <p class="w3-eyebrow">YOUR PACE MAP</p>
        <h1>Give each part of your answer<br /><em>its own speed.</em></h1>
        ${topicChip(material)}
        ${paceMapMarkup(material, map, { interactive: true })}
        <div class="w3-coach-actions"><p class="w3-coach-note">Choose Fast or Slow for every box, then Pause before the Final Point.</p><button type="button" class="w3-reset-button" data-w3-action="reset-map">Reset</button></div>
      `, { nextLabel: "Practice my map" });
    } else if (step === 10) {
      page = shell(`
        ${topicChip(material)}
        <h1>Speak your answer<br /><em>with the map.</em></h1>
        ${paceMapMarkup(material, map, { compact: true })}
        <div class="w3-play-row">
          <div class="w3-playhead" aria-hidden="true"><i data-w3-playhead></i></div>
          <button type="button" data-w3-action="play-map" class="w3-play-button">Play my map</button>
          <div class="w3-timer"><strong data-w3-timer-display>60</strong><span>seconds</span><button type="button" data-w3-action="timer">Start timer</button></div>
        </div>
        <p class="w3-play-status" data-w3-play-status role="status">Follow the highlighted box. When Pause lights up, stop speaking for two seconds.</p>
        <blockquote>Do not perfect the words.<br /><strong>Only notice where the speed changed.</strong></blockquote>
      `, { footer: '<button class="w3-next" type="button" data-w3-action="complete-v1">Practice complete</button>' });
    } else if (step === 11) {
      page = shell(`
        <div class="w3-rocky-heading"><p class="w3-eyebrow">IN THE RING · READ ALOUD</p>
        <h1>Keep moving<br /><em>forward.</em></h1>
        <p class="w3-rocky-credit">Rocky Balboa · Pace practice</p></div>
        <div class="w3-rocky-legend" aria-label="Reading cues"><span class="fast">GREEN · FAST</span><span class="slow">YELLOW · SLOW</span><span class="pause">RED · PAUSE</span></div>
        <p class="w3-rocky-instruction">Build momentum in green. Give each word space in yellow. Stop for two seconds at every red PAUSE.</p>
        <div class="w3-rocky-script" aria-label="Rocky Balboa reading passage">
          <p class="fast"><small>FAST</small>Let me tell you something you already know.</p>
          <p class="slow"><small>SLOW</small>The world ain't all sunshine and rainbows.</p>
          <div class="pause">PAUSE <small>2 seconds</small></div>
          <p class="fast"><small>FAST</small>It's a very mean and nasty place and I don't care how tough you are it will beat you to your knees and keep you there permanently if you let it.</p>
          <p class="slow"><small>SLOW</small>You, me, or nobody is gonna hit as hard as life.</p>
          <div class="pause">PAUSE <small>2 seconds</small></div>
          <p class="slow"><small>SLOW</small>But it ain't about how hard you hit.</p>
          <div class="pause">PAUSE <small>2 seconds</small></div>
          <p class="fast"><small>FAST</small>It's about how hard you can get hit <span class="slow"><small>SLOW</small>and keep moving forward.</span></p>
          <p class="fast"><small>FAST</small>How much you can take <span class="slow"><small>SLOW</small>and keep moving forward.</span></p>
          <div class="pause">PAUSE <small>2 seconds</small></div>
          <p class="slow finish"><small>SLOW</small>That's how winning is done!</p>
        </div>
      `, { className: "rocky", footer: '<button class="w3-next" type="button" data-w3-action="complete-v2">Reading complete</button>' });
    } else if (step === 13) {
      const mission = state.mission || missionTemplates[level - 1];
      page = shell(`
        <p class="w3-eyebrow">CHOOSE THE RIGHT-SIZED MISSION</p>
        <h1>One pace change.<br /><em>The right situation.</em></h1>
        <div class="w3-level-picker" role="group" aria-label="Exposure level">${exposure.levels.map((item, index) => `<button type="button" class="${index + 1 === level ? "selected" : ""}" data-w3-level="${index + 1}"><span>${index + 1}</span><small>${esc(item.name)}</small></button>`).join("")}</div>
        <div class="w3-level-focus"><small>LEVEL ${level} · SITUATION</small><h2>${esc(levelData.name)}</h2><p>${esc(levelData.behavior)}</p></div>
        <label class="w3-mission-edit"><span>YOUR WEEK 3 CHALLENGE</span><textarea data-w3-mission rows="2">${esc(mission)}</textarea></label>
        <div class="w3-win-line"><small>WIN CONDITION</small><strong>I changed pace on purpose at least once.</strong></div>
      `, { footer: '<button class="w3-next mission-accept" type="button" data-w3-action="accept-mission">Accept mission</button>' });
    } else if (step === 14) {
      page = shell(`
        <p class="w3-eyebrow">LECTURE 3 COMPLETE</p>
        <h1>Your map is ready.<br /><em>Your mission is active.</em></h1>
        <article class="w3-mission-mini active"><small>YOUR WEEK 3 MISSION</small><p>${esc(state.mission)}</p><strong>Win by changing pace on purpose at least once.</strong></article>
        <div class="w3-leave-plan"><article><span>01</span><strong>Leave the lecture</strong><p>Take three gears into your week.</p></article><article><span>02</span><strong>Attempt the mission</strong><p>Nervous and imperfect are allowed.</p></article><article><span>03</span><strong>Return with reality</strong><p>Use "Report mission" in your portal.</p></article></div>
        <blockquote>The lecture ends here.<br /><strong>The evidence begins the first time you slow down on purpose.</strong></blockquote>
      `, { footer: '<button class="w3-next" type="button" data-w3-action="close">Return to my portal</button>' });
    } else if (step === 15) {
      page = shell(`
        <p class="w3-eyebrow">WELCOME BACK</p>
        <h1>Did you change pace<br /><em>on purpose?</em></h1>
        <p class="w3-lede">The win is the attempt. Nothing else is required.</p>
        <article class="w3-mission-mini"><small>YOUR MISSION</small><p>${esc(state.mission)}</p></article>
        <div class="w3-did-it"><button type="button" data-w3-action="mission-not-yet"><span>NOT YET</span><small>Save and return later</small></button><button type="button" class="yes" data-w3-action="mission-yes"><span>YES</span><small>I attempted it</small></button></div>
      `, { lockBack: true, footer: '<span class="w3-footer-hint">Your mission stays active until you attempt it.</span>' });
    } else if (step === 16) {
      page = shell(`
        <p class="w3-eyebrow">REALITY CHECK</p>
        <h1>What actually happened?</h1>
        <p class="w3-lede">One short answer. No report and no long reflection.</p>
        <div class="w3-input-card">
          <textarea data-w3-result rows="3" placeholder="I slowed down on the point and nobody interrupted. It felt long to me, and normal to them…">${esc(state.actualResult)}</textarea>
        </div>
      `, { lockBack: true, footer: '<button class="w3-next" type="button" data-w3-action="collect-evidence">Collect evidence</button>' });
    } else {
      const evidence = portal.getState().evidenceBank.find(item => item.id === state.evidenceId);
      page = shell(`
        <p class="w3-eyebrow">WEEK 3 COMPLETE</p>
        <h1>You shaped your pace.<br /><em>You proved it holds.</em></h1>
        <div class="w3-completion-stats"><article><small>SKILL UNLOCKED</small><strong>Pace Variety</strong></article><article><small>PACE TOOLS</small><strong>Fast · Slow · Stop</strong></article><article><small>EXPOSURE</small><strong>Level ${state.missionLevel || level}</strong></article><article><small>EVIDENCE COLLECTED</small><strong>1</strong></article></div>
        <article class="w3-evidence-card"><header><small>EVIDENCE COLLECTED</small><span>WEEK 3</span></header><div><small>YOUR MISSION</small><p>${esc(evidence?.mission || state.mission)}</p></div><div><small>WHAT HAPPENED</small><p>${esc(evidence?.reality || state.actualResult)}</p></div></article>
        <div class="w3-week-progress"><span class="complete">W1 <i>●</i></span><span class="complete">W2 <i>●</i></span><span class="complete">W3 <i>●</i></span>${[4, 5, 6].map(number => `<span>W${number} <i>○</i></span>`).join("")}</div>
        <div class="w3-next-week"><small>NEXT</small><strong>Think while you speak: pauses that buy you time.</strong></div>
      `, { lockBack: true, footer: '<button class="w3-next" type="button" data-w3-action="close">Return to my portal</button>' });
    }

    root.innerHTML = page;
    document.body.classList.add("week3-open");
    requestAnimationFrame(() => {
      root.querySelectorAll("[data-w3-animate]").forEach(el => el.classList.add("in"));
      if (step === 0) playHeroLine();
      if (step === 1 && state.demoMode) later(() => playDemo(state.demoMode), 350);
      root.querySelector("textarea, input, button")?.focus({ preventScroll: true });
    });
  }

  /* ---------- opening hero line: ambient pace demo ---------- */
  function playHeroLine() {
    const spans = [...root.querySelectorAll("[data-w3-hero]")];
    if (!spans.length) return;
    const timing = [140, 140, 140, 140, 700, 200, 200, 200, 200, 900];
    let index = 0;
    const tick = () => {
      spans.forEach((span, i) => span.classList.toggle("lit", i === index));
      const delay = timing[index] || 200;
      index += 1;
      if (index < spans.length) later(tick, delay);
      else later(() => { spans.forEach(span => span.classList.remove("lit")); index = 0; later(tick, 900); }, 1400);
    };
    later(tick, 500);
  }

  /* ---------- slide 1: same sentence, three pacings ---------- */
  function playDemo(modeId) {
    const mode = demoModes[modeId];
    const spans = [...root.querySelectorAll("[data-w3-demo-word]")];
    const meaning = root.querySelector("[data-w3-demo-meaning]");
    if (!mode || !spans.length) return;
    spans.forEach(span => span.className = "");
    if (meaning) meaning.innerHTML = "<span>Listen with your eyes.</span>";
    let index = 0;
    const tick = () => {
      spans.forEach((span, i) => { span.classList.toggle("lit", i === index); span.classList.toggle("past", i < index); });
      const delay = mode.timings ? mode.timings[index] : mode.perWord;
      index += 1;
      if (index < spans.length) later(tick, delay);
      else later(() => {
        spans.forEach(span => { span.classList.remove("lit"); span.classList.add("past"); });
        if (meaning) meaning.innerHTML = `<strong>${esc(mode.meaning)}</strong><span>${esc(mode.note)}</span>`;
      }, delay);
    };
    tick();
  }

  /* ---------- slide 10: play the pace map ---------- */
  function playMap(button) {
    clearTimers();
    const map = currentPaceMap();
    const segments = [...root.querySelectorAll("[data-w3-segment]")];
    const pause = root.querySelector("[data-w3-map-pause]");
    const status = root.querySelector("[data-w3-play-status]");
    const head = root.querySelector("[data-w3-playhead]");
    const material = practiceMaterial();
    const durationFor = el => words(material.segments.find(item => item.id === el.dataset.w3Segment).sentence).length * (map[el.dataset.w3Segment] === "hold" ? 600 : 350);
    const total = segments.reduce((sum, el) => sum + durationFor(el), 2000);
    button.disabled = true;
    button.textContent = "Playing…";
    segments.forEach(el => el.classList.remove("playing", "played", "beat"));
    pause?.classList.remove("playing", "played");
    if (head) { head.style.transition = "none"; head.style.width = "0%"; void head.offsetWidth; head.style.transition = `width ${total}ms linear`; head.style.width = "100%"; }
    let offset = 0;
    segments.forEach(el => {
      const gear = map[el.dataset.w3Segment] || "run";
      if (el.dataset.w3Segment === "finalPoint") {
        later(() => {
          segments.forEach(other => other.classList.remove("playing"));
          pause?.classList.add("playing");
          if (status) { status.textContent = "PAUSE · Stop speaking. Two seconds of silence."; status.classList.add("pausing"); }
        }, offset);
        offset += 2000;
      }
      later(() => {
        pause?.classList.remove("playing");
        if (el.dataset.w3Segment === "finalPoint") pause?.classList.add("played");
        if (status) { status.textContent = `${gears[gear].label} · ${material.segments.find(item => item.id === el.dataset.w3Segment).name}`; status.classList.remove("pausing"); }
        segments.forEach(other => { other.classList.remove("playing"); if (other !== el && other.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) other.classList.add("played"); });
        el.classList.add("playing");
      }, offset);
      offset += durationFor(el);
    });
    later(() => { segments.forEach(el => { el.classList.remove("playing"); el.classList.add("played"); }); button.disabled = false; button.textContent = "Play it again"; if (status) status.textContent = "Complete · Fast, Slow, and a clear Pause before the final point."; }, total);
  }

  function startTimer(button) {
    let remaining = 60;
    const display = root.querySelector("[data-w3-timer-display]");
    button.disabled = true;
    button.textContent = "Speaking…";
    if (display) display.textContent = remaining;
    const id = every(() => {
      remaining -= 1;
      if (display) display.textContent = remaining > 0 ? remaining : "Done";
      if (remaining <= 0) { clearInterval(id); button.disabled = false; button.textContent = "Start again"; }
    }, 1000);
  }

  function validateAndNext() {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const sortedAll = sortItems.every(item => (state.sortAnswers || {})[item.id]);
    const mapComplete = ["point", "reason", "example", "finalPoint"].every(id => currentPaceMap()[id]);
    const requirements = {
      1: [state.demoMode, "Press at least one pace to hear the sentence change."],
      7: [sortedAll ? "ok" : "", "Choose a gear for every line before continuing."],
      9: [mapComplete ? "ok" : "", "Choose Fast or Slow for every box before practicing your map."],
      13: [state.mission || missionTemplates[getLevel() - 1], "Choose one small mission."]
    };
    if (requirements[step] && !String(requirements[step][0] || "").trim()) {
      portal.showToast(requirements[step][1]);
      root.querySelector("textarea, input, button")?.focus();
      return;
    }
    const patch = { currentStep: stepOrder[Math.min(stepOrder.length - 1, stepOrder.indexOf(step) + 1)], lastViewedAt: new Date().toISOString() };
    if (step === 13 && !state.mission) patch.mission = missionTemplates[getLevel() - 1];
    update(patch);
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
    update({ lastViewedAt: new Date().toISOString() });
    root.innerHTML = "";
    document.body.classList.remove("week3-open");
    portal.renderAll();
    previousFocus?.focus?.();
  }

  function collectEvidence() {
    const state = getState();
    if (!String(state.actualResult || "").trim()) {
      portal.showToast("Add one short sentence about what actually happened.");
      root.querySelector("[data-w3-result]")?.focus();
      return;
    }
    const id = state.evidenceId || `week3-${Date.now()}`;
    const card = {
      id,
      week: 3,
      skill: "Pace Variety",
      prediction: state.prediction,
      reality: state.actualResult,
      beliefBefore: Number(state.beliefBefore),
      beliefAfter: Number(state.beliefAfter),
      level: Number(state.missionLevel || getLevel()),
      mission: state.mission,
      completedAt: new Date().toISOString()
    };
    portal.saveEvidence(card);
    update({ evidenceId: id, completedAt: card.completedAt, currentStep: 17 });
    portal.showToast("Pace evidence collected.");
    renderStep();
  }

  root.addEventListener("click", event => {
    const actionEl = event.target.closest("[data-w3-action]");
    const action = actionEl?.dataset.w3Action;
    if (action === "close") return close();
    if (action === "back") return back();
    if (action === "next") return validateAndNext();
    if (action === "timer") return startTimer(actionEl);
    if (action === "play-map") return playMap(actionEl);
    if (action === "reset-sort") {
      update({ sortAnswers: {} });
      return renderStep();
    }
    if (action === "reset-map") {
      update({ paceMap: {}, paceMapConfigured: false });
      return renderStep();
    }
    if (action === "complete-v1") {
      update({ versionsCompleted: Math.max(1, Number(getState().versionsCompleted || 0)), currentStep: 11 });
      portal.showToast("Map practice complete. Take your pace into the Rocky reading.");
      return renderStep();
    }
    if (action === "complete-v2") {
      update({ versionsCompleted: Math.max(2, Number(getState().versionsCompleted || 0)), currentStep: 13 });
      portal.showToast("Reading complete. Choose your real-world mission.");
      return renderStep();
    }
    if (action === "accept-mission") {
      const state = getState();
      const level = getLevel();
      update({ mission: state.mission || missionTemplates[level - 1], missionLevel: level, missionStatus: "accepted", acceptedAt: new Date().toISOString(), lectureCompletedAt: new Date().toISOString(), currentStep: 14 });
      portal.showToast("Mission accepted. One deliberate pace change is the win.");
      return renderStep();
    }
    if (action === "mission-not-yet") return close();
    if (action === "mission-yes") { update({ missionStatus: "completed", currentStep: 16 }); return renderStep(); }
    if (action === "collect-evidence") return collectEvidence();

    const demo = event.target.closest("[data-w3-demo]");
    if (demo) {
      update({ demoMode: demo.dataset.w3Demo });
      root.querySelectorAll("[data-w3-demo]").forEach(b => b.classList.toggle("selected", b === demo));
      clearTimers();
      return playDemo(demo.dataset.w3Demo);
    }

    const sort = event.target.closest("[data-w3-sort]");
    if (sort) {
      const answers = { ...(getState().sortAnswers || {}) };
      answers[sort.dataset.w3Sort] = sort.dataset.w3Gear;
      update({ sortAnswers: answers });
      return renderStep();
    }
    const segment = event.target.closest("[data-w3-map-segment]");
    if (segment) {
      const current = currentPaceMap();
      const id = segment.dataset.w3MapSegment;
      const next = current[id] === "run" ? "hold" : "run";
      update({ paceMap: { ...current, [id]: next }, paceMapConfigured: true });
      return renderStep();
    }
    const improvement = event.target.closest("[data-w3-improvement-option]");
    if (improvement) {
      update({ coachImprovement: improvement.dataset.w3ImprovementOption });
      return renderStep();
    }
    const levelButton = event.target.closest("[data-w3-level]");
    if (levelButton) {
      const level = exposure.clampLevel(levelButton.dataset.w3Level);
      portal.setExposureLevel(level);
      update({ currentLevel: level, mission: missionTemplates[level - 1], missionLevel: null });
      return renderStep();
    }
  });

  root.addEventListener("input", event => {
    if (event.target.matches("[data-w3-improvement]")) {
      update({ coachImprovement: event.target.value });
    } else if (event.target.matches("[data-w3-prediction]")) {
      update({ prediction: event.target.value });
    } else if (event.target.matches("[data-w3-before]")) {
      update({ beliefBefore: Number(event.target.value) });
      root.querySelector("[data-w3-before-value]").textContent = `${event.target.value}%`;
    } else if (event.target.matches("[data-w3-mission]")) {
      update({ mission: event.target.value });
    } else if (event.target.matches("[data-w3-result]")) {
      update({ actualResult: event.target.value });
    } else if (event.target.matches("[data-w3-after]")) {
      update({ beliefAfter: Number(event.target.value) });
      root.querySelector("[data-w3-after-value]").textContent = `${event.target.value}%`;
      root.querySelector("[data-w3-after-card]").textContent = `${event.target.value}%`;
    }
  });

  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-week3-reflection]")) {
      previousFocus = document.activeElement;
      update({ currentStep: 15 });
      return renderStep();
    }
    if (!event.target.closest("[data-open-week3-lecture]")) return;
    previousFocus = document.activeElement;
    renderStep();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("week3-open")) close();
  });
})();
