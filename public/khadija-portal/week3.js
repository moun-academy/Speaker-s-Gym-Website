(function () {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const exposure = window.SpeakersGymExposure;
  const root = document.querySelector("#week3Root");
  if (!portal || !exposure || !root) return;

  const chapters = [
    { title: "Why Pace Decides What Lands", start: 1, end: 3 },
    { title: "Find Your Default Rate", start: 4, end: 4 },
    { title: "Feel the Three Gears", start: 5, end: 6 },
    { title: "Slow the New, Speed the Known", start: 7, end: 8 },
    { title: "Map the Pace of Your Own Answer", start: 9, end: 11 },
    { title: "Leave With One Moment to Shape Your Pace", start: 12, end: 14 }
  ];

  const stages = [
    { name: "DISCOVER", end: 4 },
    { name: "TUNE", end: 8 },
    { name: "SPEAK", end: 11 },
    { name: "PROVE", end: 14 }
  ];

  const missionTemplates = [
    "Slow one key sentence on purpose with your coach or someone you deeply trust.",
    "Shape the pace of one short answer with a familiar person: run the context, hold the point.",
    "Use one deliberate slow-down on your main point with a familiar colleague.",
    "In one planned professional conversation, run the background and hold the point.",
    "Speaking to a small familiar group, slow the one sentence that matters most.",
    "In one routine meeting, stop for one beat before your main point, then say it slowly.",
    "When an unplanned professional conversation develops, hold your point and run the rest.",
    "While guiding one short professional discussion, change pace at least once on purpose.",
    "Answer one unexpected question with a stop first, then a slow point and a quicker explanation.",
    "In one high-pressure leadership moment, shape the pace: run the context, stop, then hold the point."
  ];

  const gears = {
    hold: { label: "HOLD", rate: "100 to 120 wpm", tagline: "for what must land" },
    run: { label: "RUN", rate: "150 to 170 wpm", tagline: "for what they already know" },
    stop: { label: "STOP", rate: "0 wpm", tagline: "for what must be felt" }
  };
  const gearOrder = ["hold", "run", "stop"];

  const ratePassage = "When I share an idea at work, I want people to understand it the first time. That means choosing one clear point, giving one honest reason, and showing one real example. I do not need to say everything I know. I need to say the right thing at the right speed, so the listener can keep up and stay with me.";
  const pacerPassage = "The most important sentence in any answer is the one you slow down for. Everything around it can move. The point itself should arrive one word at a time, with enough space for the listener to hold it.";
  const demoSentence = "The decision is not about the budget. It is about trust.";

  const sortItems = [
    { id: "point", text: "Your main point", answer: "hold", why: "New and load-bearing. Give it room." },
    { id: "background", text: "Background the listener already knows", answer: "run", why: "Familiar ground. Move through it." },
    { id: "number", text: "A number or a name", answer: "hold", why: "Numbers need processing time." },
    { id: "transition", text: "A transition between ideas", answer: "run", why: "Connective tissue. Keep it moving." },
    { id: "recommendation", text: "Your recommendation", answer: "hold", why: "This is the sentence they will repeat." },
    { id: "example", text: "A familiar example", answer: "run", why: "They can picture it already. Speed reads as confidence." }
  ];

  const demoModes = {
    flat: { label: "Flat", meaning: "Sounds like a list.", note: "Every word the same weight. The listener does the sorting.", timings: null, perWord: 300 },
    rushed: { label: "Rushed", meaning: "Sounds like an apology.", note: "Pressure in the voice becomes pressure in the room.", timings: null, perWord: 130 },
    shaped: { label: "Dynamic", meaning: "Sounds like a decision.", note: "Run the setup. Stop. Hold the point.", timings: [150, 150, 150, 150, 150, 150, 1050, 600, 600, 600, 600], perWord: null }
  };

  const lectureStepCount = 15;
  const lastStep = 17;
  let previousFocus = null;
  let timers = [];
  let rateStartedAt = null;

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
  function clearTimers() { timers.forEach(id => { clearTimeout(id); clearInterval(id); }); timers = []; rateStartedAt = null; }

  function keywordFrom(value, fallback) {
    const list = String(value || "").replace(/[^a-zA-Z0-9' -]/g, " ").split(/\s+/)
      .filter(word => word.length > 3 && !["this", "that", "with", "because", "believe", "opinion", "main", "reason", "example"].includes(word.toLowerCase()));
    return (list[0] || fallback).toUpperCase();
  }

  function practiceMaterial() {
    const week1 = portal.getState().week1Lecture || {};
    const prep = week1.prep || {};
    const saved = week1.keywords || {};
    return {
      topic: week1.selectedTopic || "A habit that improves your day",
      segments: [
        { id: "point", letter: "P", name: "POINT", keyword: saved.point || keywordFrom(prep.point, "RESET"), sentence: prep.point || "A short walk is a good way to clear your mind." },
        { id: "reason", letter: "R", name: "REASON", keyword: saved.reason || keywordFrom(prep.reason, "DISTANCE"), sentence: prep.reason || "It creates distance from whatever was crowding my thinking." },
        { id: "example", letter: "E", name: "EXAMPLE", keyword: saved.example || keywordFrom(prep.example, "MOMENT"), sentence: prep.example || "After a stressful meeting last week, ten minutes outside changed my whole afternoon." },
        { id: "finalPoint", letter: "P", name: "FINAL POINT", keyword: saved.finalPoint || keywordFrom(prep.finalPoint, "WALK"), sentence: prep.finalPoint || "That is why I walk before I decide anything important." }
      ]
    };
  }

  function rateBand(wpm) {
    if (wpm < 120) return { name: "Slow", note: "Clear, but the listener may drift." };
    if (wpm < 150) return { name: "Conversational", note: "Easy to follow. Easy to tune out." };
    if (wpm < 170) return { name: "Brisk", note: "Energetic. Complex points start slipping." };
    return { name: "Fast", note: "Reads as confident, costs comprehension." };
  }

  function topicChip(material) {
    return `<span class="w3-topic-chip"><small>YOUR WEEK 1 TOPIC</small>${esc(material.topic)}</span>`;
  }

  function wordSpans(text, attr) {
    return words(text).map((word, index) => `<span ${attr}="${index}">${esc(word)}</span>`).join(" ");
  }

  function paceMapMarkup(material, map, options = {}) {
    return `<div class="w3-pace-map ${options.compact ? "compact" : ""}" ${options.interactive ? 'data-w3-map-interactive' : ""}>${material.segments.map(segment => {
      const gear = map[segment.id] || "run";
      return `<${options.interactive ? "button type=\"button\"" : "article"} class="w3-map-segment ${gear}" ${options.interactive ? `data-w3-map-segment="${segment.id}"` : ""} data-w3-segment="${segment.id}">
        <header><span>${segment.letter}</span><small>${segment.name}</small><b class="w3-gear-pill ${gear}">${gears[gear].label}</b></header>
        <strong>${esc(segment.keyword)}</strong>
        <p>${esc(segment.sentence)}</p>
        <i class="w3-ribbon ${gear}" aria-hidden="true"><em></em><em></em><em></em><em></em><em></em><em></em><em></em><em></em></i>
      </${options.interactive ? "button" : "article"}>`;
    }).join("")}</div>`;
  }

  function shell(content, options = {}) {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const chapter = chapterFor(step);
    const chapterIndex = chapter ? chapters.indexOf(chapter) : -1;
    const afterMission = step >= lectureStepCount;
    const canBack = step > 0 && !options.lockBack;
    const progress = Math.round((Math.min(lectureStepCount, step + 1) / lectureStepCount) * 100);
    const chapterLabel = step === 0 ? "YOUR SIX OUTCOMES" : afterMission ? "MISSION FOLLOW-UP" : "WEEK 3";
    const chapterTitle = chapter?.title || (step === 0 ? "Pace Variety" : "Turn experience into evidence");
    const stage = stageFor(step);

    return `<div class="week3-page" role="dialog" aria-modal="true" aria-labelledby="week3PageTitle">
      <header class="w3-header">
        <div class="w3-brand"><img src="Logo.png?v=khadija-v2" alt="" /><div><small>THE SPEAKER'S GYM</small><strong>WEEK 3 · PACE VARIETY</strong></div></div>
        <div class="w3-chapter-track" aria-label="${esc(chapter ? `Chapter ${chapterIndex + 1} of 6: ${chapterTitle}` : chapterTitle)}">
          <div><small>${chapter ? `CHAPTER ${String(chapterIndex + 1).padStart(2, "0")} OF 06` : chapterLabel}</small><strong>${esc(chapterTitle)}</strong></div>
          <div class="w3-chapter-dots" aria-hidden="true">${chapters.map((item, index) => `<i class="${index < chapterIndex ? "done" : index === chapterIndex ? "active" : ""}"></i>`).join("")}</div>
        </div>
        <button class="w3-close" type="button" data-w3-action="close" aria-label="Save and close">&times;</button>
        <div class="w3-progress" aria-hidden="true"><i style="width:${progress}%"></i></div>
      </header>
      <main class="w3-main"><section class="w3-screen ${options.className || ""}">${content}</section></main>
      <footer class="w3-footer">
        <button class="w3-back" type="button" data-w3-action="back" ${canBack ? "" : "disabled"}>Back</button>
        <span>${afterMission ? "AFTER THE MISSION" : `${stage.name} · ${step + 1} / ${lectureStepCount}`}</span>
        <div class="w3-footer-actions">${options.footer || `<button class="w3-next" type="button" data-w3-action="next">${options.nextLabel || "Continue"}</button>`}</div>
      </footer>
    </div>`;
  }

  function renderStep() {
    clearTimers();
    const state = getState();
    const step = Number(state.currentStep || 0);
    const material = practiceMaterial();
    const level = getLevel();
    const levelData = exposure.levels[level - 1];
    const map = { point: "hold", reason: "run", example: "run", finalPoint: "stop", ...(state.paceMap || {}) };
    let page = "";

    if (step === 0) {
      page = shell(`
        <p class="w3-eyebrow">WEEK 3 · PACE VARIETY</p>
        <h1 id="week3PageTitle">You already have the words.<br /><em>Pace decides which ones land.</em></h1>
        <div class="w3-hero-line" aria-hidden="true">${wordSpans("Some words should run. One word should stop everything.", "data-w3-hero")}</div>
        <div class="w3-agenda">${chapters.map((chapter, index) => `<article data-w3-animate style="--i:${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${esc(chapter.title)}</strong></article>`).join("")}</div>
      `, { className: "opening", nextLabel: "Start with why" });
    } else if (step === 1) {
      const mode = demoModes[state.demoMode] || null;
      page = shell(`
        <p class="w3-eyebrow">WHY PACE MATTERS · 1 OF 3</p>
        <h1>Same words.<br />Different pace. <em>Different meaning.</em></h1>
        <article class="w3-demo-card">
          <p class="w3-demo-line" data-w3-demo-line>${wordSpans(demoSentence, "data-w3-demo-word")}</p>
          <div class="w3-demo-meaning" data-w3-demo-meaning aria-live="polite">${mode ? `<strong>${esc(mode.meaning)}</strong><span>${esc(mode.note)}</span>` : `<span>Press a pace to hear the same sentence change its meaning.</span>`}</div>
          <div class="w3-demo-buttons">${Object.entries(demoModes).map(([id, item]) => `<button type="button" class="${state.demoMode === id ? "selected" : ""} ${id}" data-w3-demo="${id}"><strong>${item.label}</strong><small>${id === "flat" ? "one speed" : id === "rushed" ? "all fast" : "run · stop · hold"}</small></button>`).join("")}</div>
        </article>
        <p class="w3-coach-note">Flat pace makes your priorities the listener's problem. Most listeners will not do that work.</p>
      `);
    } else if (step === 2) {
      page = shell(`
        <p class="w3-eyebrow">WHY PACE MATTERS · 2 OF 3</p>
        <h1>The listener feels your speed<br /><em>before they hear your words.</em></h1>
        <div class="w3-loop">
          <article data-w3-animate style="--i:0"><small>01</small><strong>Pressure rises</strong><p>The moment feels bigger than the sentence.</p></article><i>→</i>
          <article data-w3-animate style="--i:1"><small>02</small><strong>Pace rises</strong><p>You speed up to get it over with.</p></article><i>→</i>
          <article data-w3-animate style="--i:2" class="hot"><small>03</small><strong>The room tightens</strong><p>They feel your pressure in their own body.</p></article>
          <b class="w3-loop-return" aria-hidden="true">and their tension sends you faster again</b>
        </div>
        <blockquote>Speed is not read as information.<br /><strong>It is read as emotion.</strong></blockquote>
      `);
    } else if (step === 3) {
      page = shell(`
        <p class="w3-eyebrow">WHY PACE MATTERS · 3 OF 3</p>
        <h1>So why not just<br /><em>slow down?</em></h1>
        <div class="w3-research">
          <article data-w3-animate style="--i:0">
            <small>FAST READS AS CREDIBLE</small>
            <div class="w3-bars"><div><span>195 wpm</span><i style="--w:100%"></i><b>more persuasive</b></div><div><span>102 wpm</span><i style="--w:52%"></i><b>less persuasive</b></div></div>
            <p>Miller and colleagues, 449 listeners: the same message was rated more credible, more expert and more persuasive when it was spoken fast.</p>
          </article>
          <article data-w3-animate style="--i:1">
            <small>FAST COSTS COMPREHENSION</small>
            <div class="w3-bars"><div><span>120 wpm</span><i style="--w:100%" class="good"></i><b>complex ideas land</b></div><div><span>160+ wpm</span><i style="--w:58%" class="warn"></i><b>comprehension drops</b></div></div>
            <p>Above roughly 160 words per minute, listeners measurably lose complex material. Numbers, names and new ideas need time.</p>
          </article>
        </div>
        <blockquote>The instruction is never "slow down".<br /><strong>It is: put the speed where it belongs.</strong></blockquote>
      `);
    } else if (step === 4) {
      const total = words(ratePassage).length;
      const wpm = state.baselineWpm ? Number(state.baselineWpm) : null;
      const band = wpm ? rateBand(wpm) : null;
      const position = wpm ? Math.max(0, Math.min(100, ((wpm - 80) / 140) * 100)) : 0;
      page = shell(`
        <p class="w3-eyebrow">FIND YOUR DEFAULT RATE</p>
        <h1>Read this aloud<br /><em>at the speed you would normally use.</em></h1>
        <article class="w3-rate-card">
          <p class="w3-rate-passage" data-w3-rate-passage>${wordSpans(ratePassage, "data-w3-rate-word")}</p>
          <div class="w3-rate-controls">
            <div class="w3-rate-clock"><strong data-w3-rate-clock>${state.baselineSeconds ? Number(state.baselineSeconds).toFixed(1) : "0.0"}</strong><span>seconds · ${total} words</span></div>
            <button type="button" class="w3-rate-button" data-w3-action="rate-toggle">${wpm ? "Read it again" : "Start reading"}</button>
          </div>
        </article>
        <div class="w3-gauge ${wpm ? "has-result" : ""}" data-w3-gauge>
          <div class="w3-gauge-bands"><span>Slow</span><span>Conversational</span><span>Brisk</span><span>Fast</span></div>
          <div class="w3-gauge-track"><i class="w3-gauge-marker" data-w3-animate style="--pos:${position}%"><b>${wpm || ""}</b></i></div>
          <div class="w3-gauge-scale"><span>80</span><span>120</span><span>150</span><span>170</span><span>220 wpm</span></div>
        </div>
        ${wpm ? `<article class="w3-rate-result" data-w3-animate><small>YOUR DEFAULT RATE</small><strong>${wpm} words per minute · ${esc(band.name)}</strong><p>${esc(band.note)} The number is not the problem. <b>Staying at it is.</b> A default rate, fast or slow, tells the listener nothing about what matters.</p></article>` : `<p class="w3-coach-note">Press start, read the passage once at your everyday speed, then press stop. No performance needed.</p>`}
      `);
    } else if (step === 5) {
      page = shell(`
        <p class="w3-eyebrow">FEEL THE GEARS</p>
        <h1>Read along with the light.<br /><em>Feel each speed in your mouth.</em></h1>
        <article class="w3-pacer">
          <div class="w3-pacer-buttons">
            <button type="button" class="hold" data-w3-pace="110"><strong>110</strong><small>HOLD</small></button>
            <button type="button" class="mid" data-w3-pace="150"><strong>150</strong><small>EVERYDAY</small></button>
            <button type="button" class="run" data-w3-pace="180"><strong>180</strong><small>RUN</small></button>
            <button type="button" class="stop-pacer" data-w3-action="pacer-stop">Stop</button>
          </div>
          <p class="w3-pacer-line" data-w3-pacer-line>${wordSpans(pacerPassage, "data-w3-pacer-word")}</p>
          <div class="w3-tempo" aria-hidden="true"><i data-w3-tempo></i><span data-w3-tempo-label>Choose a speed</span></div>
        </article>
        <p class="w3-coach-note">Try all three at least once. Notice which one feels like you, and which one feels like a stranger. Both are useful.</p>
      `);
    } else if (step === 6) {
      page = shell(`
        <p class="w3-eyebrow">THREE GEARS</p>
        <h1>You only need<br /><em>three speeds.</em></h1>
        <div class="w3-gears">${gearOrder.map((id, index) => `<article class="${id}" data-w3-animate style="--i:${index}">
            <span>${gears[id].label}</span><small>${gears[id].rate}</small>
            <strong>${esc(gears[id].tagline)}</strong>
            <i class="w3-ribbon ${id}" aria-hidden="true"><em></em><em></em><em></em><em></em><em></em><em></em><em></em><em></em></i>
            <p>${id === "hold" ? "Your point. A number. Your recommendation. Say it one word at a time." : id === "run" ? "Background, transitions, the familiar. Move, and let the movement read as confidence." : "One beat of silence before the sentence that matters. Pace taken to zero is the strongest emphasis you have."}</p>
          </article>`).join("")}</div>
        <blockquote>Engagement does not come from a speed.<br /><strong>It comes from the change.</strong></blockquote>
      `);
    } else if (step === 7) {
      const answers = state.sortAnswers || {};
      page = shell(`
        <p class="w3-eyebrow">THE RULE OF THUMB</p>
        <h1>Slow the new.<br /><em>Speed the known.</em></h1>
        <div class="w3-sorter">${sortItems.map((item, index) => {
          const chosen = answers[item.id];
          const correct = chosen && chosen === item.answer;
          return `<article class="${chosen ? (correct ? "correct" : "wrong") : ""}" data-w3-animate style="--i:${index}">
            <strong>${esc(item.text)}</strong>
            <div class="w3-sort-buttons">
              <button type="button" class="hold ${chosen === "hold" ? "chosen" : ""}" data-w3-sort="${item.id}" data-w3-gear="hold" ${chosen ? "disabled" : ""}>HOLD</button>
              <button type="button" class="run ${chosen === "run" ? "chosen" : ""}" data-w3-sort="${item.id}" data-w3-gear="run" ${chosen ? "disabled" : ""}>RUN</button>
            </div>
            <small>${chosen ? `${correct ? "Yes." : `${gears[item.answer].label}.`} ${esc(item.why)}` : "&nbsp;"}</small>
          </article>`;
        }).join("")}</div>
        <p class="w3-coach-note">Tap the gear you would use. Getting one wrong is useful: it shows you where your instinct runs when it should hold.</p>
      `);
    } else if (step === 8) {
      const point = material.segments[3].sentence;
      page = shell(`
        <p class="w3-eyebrow">THE STOP</p>
        <h1>One beat of silence<br /><em>before the sentence that matters.</em></h1>
        ${topicChip(material)}
        <article class="w3-beat-card">
          <div class="w3-beat" data-w3-beat><small>STOP</small><i></i></div>
          <p class="w3-beat-line" data-w3-beat-line>${wordSpans(point, "data-w3-beat-word")}</p>
          <button type="button" class="w3-beat-button" data-w3-action="play-beat">Play the beat</button>
        </article>
        <blockquote>Silence before the Point does not sound like hesitation.<br /><strong>It sounds like weight.</strong></blockquote>
      `);
    } else if (step === 9) {
      page = shell(`
        <p class="w3-eyebrow">YOUR PACE MAP</p>
        <h1>Give each part of your answer<br /><em>its own speed.</em></h1>
        ${topicChip(material)}
        ${paceMapMarkup(material, map, { interactive: true })}
        <p class="w3-coach-note">Tap a segment to change its gear. The suggested map is a strong default: hold the Point, run the Reason and Example, stop before the Final Point.</p>
      `, { nextLabel: "Speak Version 1" });
    } else if (step === 10) {
      page = shell(`
        <p class="w3-eyebrow">VERSION 1</p>
        ${topicChip(material)}
        <h1>Speak your answer<br /><em>with the map.</em></h1>
        ${paceMapMarkup(material, map, { compact: true })}
        <div class="w3-play-row">
          <div class="w3-playhead" aria-hidden="true"><i data-w3-playhead></i></div>
          <button type="button" data-w3-action="play-map" class="w3-play-button">Play my map</button>
          <div class="w3-timer"><strong data-w3-timer-display>60</strong><span>seconds</span><button type="button" data-w3-action="timer">Start timer</button></div>
        </div>
        <blockquote>Do not perfect the words.<br /><strong>Only notice where the speed changed.</strong></blockquote>
      `, { footer: '<button class="w3-next" type="button" data-w3-action="complete-v1">Version 1 complete</button>' });
    } else if (step === 11) {
      page = shell(`
        <p class="w3-eyebrow">ONE CHANGE · VERSION 2</p>
        <h1>Change one gear.<br />Then speak again.</h1>
        <div class="w3-version-stack">
          <article class="done"><span>VERSION 1</span><strong>Initial attempt complete</strong></article><i>↓</i>
          <label><span>ONE PACE ADJUSTMENT</span><input data-w3-improvement value="${esc(state.coachImprovement)}" placeholder="For example: stop for a full beat before the Final Point" /></label><i>↓</i>
          <article><span>VERSION 2</span><strong>Same answer, shaped pace</strong></article>
        </div>
        <div class="w3-improvement-options"><button type="button" data-w3-improvement-option="Slow the Point even more">Slow the Point more</button><button type="button" data-w3-improvement-option="Run the Example faster">Run the Example faster</button><button type="button" data-w3-improvement-option="Stop for a full beat before the Final Point">A full beat before the Final Point</button><button type="button" data-w3-improvement-option="Keep one gear per segment, no drifting">One gear per segment</button></div>
        <div class="w3-timer"><strong data-w3-timer-display>60</strong><span>seconds</span><button type="button" data-w3-action="timer">Start timer</button></div>
      `, { footer: '<button class="w3-next" type="button" data-w3-action="complete-v2">Version 2 complete</button>' });
    } else if (step === 12) {
      page = shell(`
        <p class="w3-eyebrow">IDENTIFY THE WORST-CASE SCENARIO</p>
        <h1>If you slow down on purpose,<br /><em>what are you afraid will happen?</em></h1>
        <div class="w3-input-card">
          <textarea data-w3-prediction rows="3" placeholder="If I slow down on my point, people will think I have lost my place…">${esc(state.prediction)}</textarea>
          <div class="w3-prediction-examples"><span>I'll sound slow and boring.</span><span>Someone will interrupt me.</span><span>The silence will feel endless.</span><span>It will sound rehearsed.</span></div>
          <label class="w3-slider-label"><span>How likely does this feel right now?</span><strong data-w3-before-value>${state.beliefBefore}%</strong></label>
          <input class="w3-slider" type="range" min="0" max="100" step="5" value="${state.beliefBefore}" data-w3-before />
          <div class="w3-slider-scale"><span>0%</span><span>100%</span></div>
        </div>
      `);
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
      `, { lockBack: true, footer: '<button class="w3-next" type="button" data-w3-action="close">Return to my portal</button>' });
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
          <label class="w3-slider-label"><span>How likely does your original prediction feel now?</span><strong data-w3-after-value>${state.beliefAfter}%</strong></label>
          <input class="w3-slider" type="range" min="0" max="100" step="5" value="${state.beliefAfter}" data-w3-after />
          <div class="w3-belief-change"><div><small>BEFORE</small><strong>${state.beliefBefore}%</strong></div><i>→</i><div><small>AFTER</small><strong data-w3-after-card>${state.beliefAfter}%</strong></div></div>
        </div>
      `, { lockBack: true, footer: '<button class="w3-next" type="button" data-w3-action="collect-evidence">Collect evidence</button>' });
    } else {
      const evidence = portal.getState().evidenceBank.find(item => item.id === state.evidenceId);
      page = shell(`
        <p class="w3-eyebrow">WEEK 3 COMPLETE</p>
        <h1>You shaped your pace.<br /><em>You proved it holds.</em></h1>
        <div class="w3-completion-stats"><article><small>SKILL UNLOCKED</small><strong>Pace Variety</strong></article><article><small>DEFAULT RATE</small><strong>${state.baselineWpm ? `${state.baselineWpm} wpm` : "Measured"}</strong></article><article><small>EXPOSURE</small><strong>Level ${state.missionLevel || level}</strong></article><article><small>EVIDENCE COLLECTED</small><strong>1</strong></article></div>
        <article class="w3-evidence-card"><header><small>EVIDENCE COLLECTED</small><span>WEEK 3</span></header><div><small>PREDICTION</small><p>${esc(evidence?.prediction || state.prediction)}</p></div><div><small>REALITY</small><p>${esc(evidence?.reality || state.actualResult)}</p></div><div class="belief"><small>BELIEF</small><strong>${state.beliefBefore}% → ${state.beliefAfter}%</strong></div></article>
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

  /* ---------- slide 4: default rate finder ---------- */
  function toggleRate(button) {
    const clock = root.querySelector("[data-w3-rate-clock]");
    if (!rateStartedAt) {
      rateStartedAt = performance.now();
      button.textContent = "Stop";
      button.classList.add("running");
      root.querySelectorAll("[data-w3-rate-word]").forEach(span => span.classList.remove("past"));
      every(() => { if (rateStartedAt && clock) clock.textContent = ((performance.now() - rateStartedAt) / 1000).toFixed(1); }, 100);
      return;
    }
    const seconds = (performance.now() - rateStartedAt) / 1000;
    rateStartedAt = null;
    if (seconds < 4) { portal.showToast("That was very quick. Read the whole passage, then press stop."); button.textContent = "Start reading"; button.classList.remove("running"); return; }
    const total = words(ratePassage).length;
    const wpm = Math.round(total / (seconds / 60));
    update({ baselineWpm: wpm, baselineSeconds: Number(seconds.toFixed(1)) });
    portal.showToast(`${wpm} words per minute. That is your default.`);
    renderStep();
  }

  /* ---------- slide 5: the pacer ---------- */
  function startPacer(rate) {
    clearTimers();
    const spans = [...root.querySelectorAll("[data-w3-pacer-word]")];
    const tempo = root.querySelector("[data-w3-tempo]");
    const label = root.querySelector("[data-w3-tempo-label]");
    root.querySelectorAll("[data-w3-pace]").forEach(b => b.classList.toggle("selected", Number(b.dataset.w3Pace) === rate));
    if (tempo) { tempo.style.setProperty("--period", `${(60 / rate).toFixed(3)}s`); tempo.classList.add("on"); }
    if (label) label.textContent = `${rate} words per minute`;
    spans.forEach(span => span.className = "");
    let index = 0;
    const interval = 60000 / rate;
    const tick = () => {
      spans.forEach((span, i) => { span.classList.toggle("lit", i === index); span.classList.toggle("past", i < index); });
      index += 1;
      if (index < spans.length) later(tick, interval);
      else later(() => { spans.forEach(span => { span.classList.remove("lit"); span.classList.add("past"); }); if (tempo) tempo.classList.remove("on"); if (label) label.textContent = `Done at ${rate}. Try another speed.`; }, interval);
    };
    tick();
    const felt = { ...(getState().feltRates || {}) };
    felt[rate] = true;
    update({ feltRates: felt });
  }
  function stopPacer() {
    clearTimers();
    root.querySelectorAll("[data-w3-pacer-word]").forEach(span => span.className = "");
    root.querySelectorAll("[data-w3-pace]").forEach(b => b.classList.remove("selected"));
    const tempo = root.querySelector("[data-w3-tempo]");
    const label = root.querySelector("[data-w3-tempo-label]");
    if (tempo) tempo.classList.remove("on");
    if (label) label.textContent = "Choose a speed";
  }

  /* ---------- slide 8: the stop beat ---------- */
  function playBeat(button) {
    clearTimers();
    const beat = root.querySelector("[data-w3-beat]");
    const spans = [...root.querySelectorAll("[data-w3-beat-word]")];
    spans.forEach(span => span.className = "");
    button.disabled = true;
    if (beat) { beat.classList.remove("filling"); void beat.offsetWidth; beat.classList.add("filling"); }
    later(() => {
      if (beat) beat.classList.add("held");
      let index = 0;
      const tick = () => {
        spans.forEach((span, i) => { span.classList.toggle("lit", i === index); span.classList.toggle("past", i < index); });
        index += 1;
        if (index < spans.length) later(tick, 520);
        else later(() => { spans.forEach(span => { span.classList.remove("lit"); span.classList.add("past"); }); button.disabled = false; button.textContent = "Play it again"; if (beat) beat.classList.remove("filling", "held"); }, 700);
      };
      tick();
    }, 1400);
  }

  /* ---------- slide 10: play the pace map ---------- */
  function playMap(button) {
    clearTimers();
    const map = { point: "hold", reason: "run", example: "run", finalPoint: "stop", ...(getState().paceMap || {}) };
    const segments = [...root.querySelectorAll("[data-w3-segment]")];
    const head = root.querySelector("[data-w3-playhead]");
    const durations = { hold: 6500, run: 4000, stop: 7000 };
    const total = segments.reduce((sum, el) => sum + durations[map[el.dataset.w3Segment] || "run"], 0);
    button.disabled = true;
    button.textContent = "Playing…";
    segments.forEach(el => el.classList.remove("playing", "played", "beat"));
    if (head) { head.style.transition = "none"; head.style.width = "0%"; void head.offsetWidth; head.style.transition = `width ${total}ms linear`; head.style.width = "100%"; }
    let offset = 0;
    segments.forEach(el => {
      const gear = map[el.dataset.w3Segment] || "run";
      later(() => {
        segments.forEach(other => { other.classList.remove("playing"); if (other !== el && other.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) other.classList.add("played"); });
        el.classList.add("playing");
        if (gear === "stop") { el.classList.add("beat"); later(() => el.classList.remove("beat"), 1500); }
      }, offset);
      offset += durations[gear];
    });
    later(() => { segments.forEach(el => { el.classList.remove("playing"); el.classList.add("played"); }); button.disabled = false; button.textContent = "Play it again"; }, total);
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
    const requirements = {
      1: [state.demoMode, "Press at least one pace to hear the sentence change."],
      4: [state.baselineWpm, "Read the passage aloud and press stop to find your default rate."],
      5: [Object.keys(state.feltRates || {}).length ? "ok" : "", "Play at least one speed and read along with it."],
      7: [sortedAll ? "ok" : "", "Choose a gear for every line before continuing."],
      11: [state.coachImprovement, "Choose one pace adjustment for Version 2."],
      12: [state.prediction, "Name what you fear will happen if you slow down on purpose."],
      13: [state.mission || missionTemplates[getLevel() - 1], "Choose one small mission."]
    };
    if (requirements[step] && !String(requirements[step][0] || "").trim()) {
      portal.showToast(requirements[step][1]);
      root.querySelector("textarea, input, button")?.focus();
      return;
    }
    const patch = { currentStep: Math.min(lastStep, step + 1), lastViewedAt: new Date().toISOString() };
    if (step === 13 && !state.mission) patch.mission = missionTemplates[getLevel() - 1];
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
    if (action === "rate-toggle") return toggleRate(actionEl);
    if (action === "pacer-stop") return stopPacer();
    if (action === "play-beat") return playBeat(actionEl);
    if (action === "play-map") return playMap(actionEl);
    if (action === "complete-v1") {
      update({ versionsCompleted: Math.max(1, Number(getState().versionsCompleted || 0)), currentStep: 11 });
      portal.showToast("Version 1 complete. Choose one pace adjustment.");
      return renderStep();
    }
    if (action === "complete-v2") {
      update({ versionsCompleted: Math.max(2, Number(getState().versionsCompleted || 0)), currentStep: 12 });
      portal.showToast("Version 2 complete. A shaped pace is evidence.");
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
    const pace = event.target.closest("[data-w3-pace]");
    if (pace) return startPacer(Number(pace.dataset.w3Pace));

    const sort = event.target.closest("[data-w3-sort]");
    if (sort) {
      const answers = { ...(getState().sortAnswers || {}) };
      answers[sort.dataset.w3Sort] = sort.dataset.w3Gear;
      update({ sortAnswers: answers });
      return renderStep();
    }
    const segment = event.target.closest("[data-w3-map-segment]");
    if (segment) {
      const current = { point: "hold", reason: "run", example: "run", finalPoint: "stop", ...(getState().paceMap || {}) };
      const id = segment.dataset.w3MapSegment;
      const next = gearOrder[(gearOrder.indexOf(current[id] || "run") + 1) % gearOrder.length];
      update({ paceMap: { ...current, [id]: next } });
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
