(function () {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const exposure = window.SpeakersGymExposure;
  const root = document.querySelector("#lectureRoot");
  if (!portal || !exposure || !root) return;

  const chapters = [
    { title: "Understand what your voice signals", steps: [21, 22, 6] },
    { title: "Build a strong voice, then make it move", steps: [7, 3, 4, 5, 24] },
    { title: "One answer. One adjustment.", steps: [9, 10, 11] },
    { title: "Use it, then test it", steps: [12, 13, 14] },
    { title: "Choose one audible moment", steps: [15, 16, 17] }
  ];

  // Level 1 is a private practice in the app. Every level asks for a louder, standing voice.
  const defaultMission = level => level === 1
    ? "Answer questions in the Speaker's Gym app in a louder voice while standing up. Stand tall and let your energy rise."
    : exposure.levels[level - 1].behavior + " Stand up if you can, and use a louder, steady voice through your final sentence.";

  const qualities = [
    { id: "confidence", name: "Confidence", text: "You sound sure of yourself." },
    { id: "authority", name: "Authority", text: "People take what you say seriously." },
    { id: "vitality", name: "Vitality", text: "You sound alive and full of energy." },
    { id: "believability", name: "Believability", text: "You sound like you believe what you say." }
  ];

  const leaks = [
    { id: "quiet", name: "I become too quiet", bars: [3, 3, 2, 3, 3, 2, 3, 3, 2], sign: "The listener has to work to hear you.", why: "Under pressure the body tightens and the voice shrinks to stay safe.", fix: "Start one notch stronger than feels natural. Aim your voice at the person farthest away." },
    { id: "ending", name: "My endings disappear", bars: [7, 8, 8, 7, 7, 6, 4, 2, 1], sign: "You begin clearly, then the last words fade.", why: "We run out of breath and courage exactly where the point lives.", fix: "Take a fresh breath before your last sentence. Make the last three words as strong as the first three." },
    { id: "push", name: "I push from my throat", bars: [9, 10, 6, 10, 5, 10, 6, 9, 5], sign: "You get louder, but tighter, and your voice tires.", why: "Pushing from the throat tenses the neck. The sound gets strained, not stronger.", fix: "Breathe low and speak on a steady out-breath. Power comes from the belly, not the neck." }
  ];

  const heardChips = {
    low: ["Unsure", "Shy", "Tired", "Not that excited"],
    loud: ["Confident", "Authoritative", "Alive", "Believable"]
  };

  // ---------- microphone level meter (nothing is recorded or stored; only two level numbers are saved) ----------
  const mic = { stream: null, ctx: null, analyser: null, buffer: null, interval: null };
  const micSupported = () => Boolean(navigator.mediaDevices?.getUserMedia && (window.AudioContext || window.webkitAudioContext));

  async function micStart(onFrame) {
    micStop();
    mic.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    mic.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = mic.ctx.createMediaStreamSource(mic.stream);
    mic.analyser = mic.ctx.createAnalyser();
    mic.analyser.fftSize = 1024;
    source.connect(mic.analyser);
    mic.buffer = new Float32Array(mic.analyser.fftSize);
    mic.interval = setInterval(() => {
      mic.analyser.getFloatTimeDomainData(mic.buffer);
      let sum = 0;
      for (let i = 0; i < mic.buffer.length; i++) sum += mic.buffer[i] * mic.buffer[i];
      onFrame(Math.sqrt(sum / mic.buffer.length));
    }, 50);
  }

  function micStop() {
    if (mic.interval) clearInterval(mic.interval);
    mic.stream?.getTracks().forEach(track => track.stop());
    mic.ctx?.close().catch(() => {});
    mic.stream = mic.ctx = mic.analyser = mic.buffer = mic.interval = null;
  }

  // Loudness on a 0 to 100 scale for the live bar (about -50 dB to -10 dB).
  const levelPercent = rms => Math.max(0, Math.min(100, ((20 * Math.log10(Math.max(rms, 0.00001)) + 50) / 40) * 100));
  const median = values => { const sorted = [...values].sort((a, b) => a - b); return sorted[Math.floor(sorted.length / 2)]; };


  const dialStory = [
    { t: "We worked on it for months.", lvl: 6, label: "Steady" },
    { t: "Then the day came.", lvl: 7, label: "Steady" },
    { t: "WE DID IT!", lvl: 9, label: "Up" },
    { t: "And I will never forget how that felt.", lvl: 4, label: "Down" }
  ];

  // Slide 9: the same short story told all loud, all soft, and with dynamic volume.
  const dynamicStory = [
    { t: "Last year, my sister asked me to give the speech at her wedding.", lvl: 7 },
    { t: "Two hundred people. One microphone. And me.", lvl: 7 },
    { t: "Just before I stood up, I leaned over and whispered to her…", lvl: 4 },
    { t: "“I’m terrified.”", lvl: 3 },
    { t: "Then I stood up, and gave the best speech of my life!", lvl: 9 }
  ];
  const dynamicModes = {
    soft: { name: "All soft", tag: "Drifting away", meter: 18, read: "It sounds unsure. People have to work to hear you, and soon they stop trying." },
    loud: { name: "All loud", tag: "Overwhelmed", meter: 30, read: "It sounds like shouting. When everything is loud, nothing stands out, and people get tired." },
    dynamic: { name: "Dynamic", tag: "Leaning in", meter: 96, read: "Strong when you are sure. Soft on the secret. Loud on the win. They lean in, then sit up." }
  };
  const dynamicLevel = (mode, line) => mode === "loud" ? 9 : mode === "soft" ? 3 : line.lvl;

  const voicePatterns = [
    { id: "quiet", label: "I become too quiet", note: "The listener has to work to hear me." },
    { id: "fade", label: "My endings disappear", note: "I begin clearly, then lose the final words." },
    { id: "push", label: "I push from my throat", note: "I try to sound louder and become tense." }
  ];

  // Keep stored step IDs stable while placing two new teaching screens after Slide 2.
  // Steps 21, 22 and 24 are newer slides placed earlier in the lecture, so the list order is the real order.
  const lectureFlow = [0, 1, 21, 22, 6, 7, 3, 4, 5, 24, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  // Retired slides resume at the slide that replaced them (8: merged practice, 2: pressure slide).
  const retiredSteps = { 8: 5, 2: 3 };
  const followUpSteps = [18, 19, 20];
  const missionFollowUpStep = 18;
  const lectureStepCount = lectureFlow.length;
  const lastStep = 20;
  let previousFocus = null;
  let timer = null;
  let timeouts = [];
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timeouts.push(id); return id; };
  const clearLater = () => { timeouts.forEach(id => clearTimeout(id)); timeouts = []; };

  const esc = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  const getState = () => portal.getState().week2Lecture;
  const update = patch => portal.updateLecture(patch);
  const getLevel = () => exposure.clampLevel(getState().currentLevel || 1);
  const chapterFor = step => chapters.find(chapter => chapter.steps.includes(step));

  function practiceMaterial() {
    return {
      topic: "A habit that improves your day",
      pointSentence: "A short walk is a habit that improves my day.",
      sentences: [
        "A short walk is a habit that improves my day.",
        "It gives me a mental reset and helps me return with more focus.",
        "After a stressful meeting, a ten-minute walk helps me clear my mind.",
        "That is why I believe a short daily walk improves my day."
      ],
      keywords: {
        point: "DAILY WALK",
        reason: "MENTAL RESET",
        example: "STRESSFUL MEETING",
        finalPoint: "BETTER DAY"
      }
    };
  }

  function topicChip(material) {
    return `<span class="w2-topic-chip"><small>TODAY'S PRACTICE TOPIC</small>${esc(material.topic)}</span>`;
  }

  function prepGuide(material) {
    const items = [
      ["P", "POINT", material.keywords.point, "strong", "Strong · 7/10"],
      ["R", "REASON", material.keywords.reason, "strong", "Strong · 7/10"],
      ["E", "EXAMPLE", material.keywords.example, "soft", "Soft on purpose · 4/10"],
      ["P", "FINAL POINT", material.keywords.finalPoint, "up", "Back up · 8/10"]
    ];
    return `<div class="w2-prep-guide" aria-label="PREP speaking guide">${items.map((item, index) => `<article style="--cue-order:${index}"><span>${item[0]}</span><div><small>${item[1]}</small><strong>${esc(item[2])}</strong><b class="w2-vol-cue ${item[3]}">${item[4]}</b></div><em>${index === 3 ? "Land the ending" : "Pause · breathe if needed"}</em></article>`).join("")}</div>
      <details class="w2-prep-example"><summary>See the complete PREP example</summary>
        <p class="w2-example-note">Practice example: a habit that improves your day · Read once. Close it. Speak from keywords.</p>
        <div>${items.map((item, index) => `<article><small>${item[1]} · <b class="w2-vol-cue ${item[3]}">${item[4]}</b></small>${endingSentence(material.sentences[index])}<span class="w2-pause-cue">${index === 3 ? "● Finish. Let it land." : "Ⅱ Pause. Breathe if needed."}</span></article>`).join("")}</div>
      </details>`;
  }

  function endingSentence(sentence) {
    const words = String(sentence || "").trim().split(/\s+/).filter(Boolean);
    const split = Math.max(0, words.length - Math.min(3, words.length));
    return `<p class="w2-ending-sentence"><span>${esc(words.slice(0, split).join(" "))}</span> <strong>${esc(words.slice(split).join(" "))}</strong></p>`;
  }

  function shell(content, options = {}) {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const chapter = chapterFor(step);
    const chapterIndex = chapter ? chapters.indexOf(chapter) : -1;
    const afterMission = followUpSteps.includes(step);
    const flowIndex = lectureFlow.indexOf(step);
    const slideNumber = flowIndex >= 0 ? flowIndex + 1 : lectureStepCount;
    const canBack = step > 0;
    const progress = Math.round((Math.min(lectureStepCount, slideNumber) / lectureStepCount) * 100);
    const chapterLabel = step <= 1 ? "YOUR FIVE OUTCOMES" : afterMission ? "MISSION FOLLOW-UP" : "WEEK 2";
    const chapterTitle = chapter?.title || (step <= 1 ? "Develop a Stronger Voice" : "Turn experience into evidence");

    return `<div class="week2-page" role="dialog" aria-modal="true" aria-labelledby="lecturePageTitle">
      <header class="w2-header">
        <div class="w2-brand"><img src="Logo.png?v=ashwin-lecture-v1" alt="" /><div><small>THE SPEAKER'S GYM</small><strong>WEEK 2 · DEVELOP A STRONGER VOICE</strong></div></div>
        <div class="w2-chapter-track" aria-label="${esc(chapter ? `Chapter ${chapterIndex + 1} of ${chapters.length}: ${chapterTitle}` : chapterTitle)}">
          <div><small>${chapter ? `CHAPTER ${String(chapterIndex + 1).padStart(2, "0")} OF ${String(chapters.length).padStart(2, "0")}` : chapterLabel}</small><strong>${esc(chapterTitle)}</strong></div>
          <div class="w2-chapter-dots" style="grid-template-columns:repeat(${chapters.length},1fr)" aria-hidden="true">${chapters.map((item, index) => `<i class="${index < chapterIndex ? "done" : index === chapterIndex ? "active" : ""}"></i>`).join("")}</div>
        </div>
        <div class="w2-header-actions"><button class="w2-reset" type="button" data-w2-action="reset">Reset</button><button class="w2-close" type="button" data-w2-action="close" aria-label="Save and close">&times;</button></div>
        <div class="w2-progress" aria-hidden="true"><i style="width:${progress}%"></i></div>
      </header>
      <main class="w2-main"><section class="w2-screen ${options.className || ""}">${content}</section></main>
      <footer class="w2-footer">
        <button class="w2-back" type="button" data-w2-action="back" ${canBack ? "" : "disabled"}>Back</button>
        <span>${afterMission ? "AFTER THE MISSION" : `WEEK 2 · ${slideNumber} / ${lectureStepCount}`}</span>
        <div class="w2-footer-actions">${options.footer || `<button class="w2-next" type="button" data-w2-action="next">${options.nextLabel || "Continue"}</button>`}</div>
      </footer>
    </div>`;
  }

  const leaksNote = count => count >= leaks.length
    ? "You now know where volume slips away. Next you train each one."
    : `${count} of ${leaks.length} flipped.`;

  function renderStep() {
    clearInterval(timer);
    timer = null;
    clearLater();
    micStop();
    const state = getState();
    const step = Number(state.currentStep || 0);
    // Resume retired sentence drills at the single combined exercise.
    if (retiredSteps[step] !== undefined) {
      update({ currentStep: retiredSteps[step] });
      return renderStep();
    }
    const material = practiceMaterial();
    const level = getLevel();
    const levelData = exposure.levels[level - 1];
    let page = "";

    if (step === 0) {
      page = shell(`
        <p class="w2-eyebrow">WEEK 2 · DEVELOP A STRONGER VOICE</p>
        <h1 id="lecturePageTitle">Make your voice easy to hear<br /><em>without forcing it.</em></h1>
        <blockquote><strong>Clear to your listener.<br />Comfortable for you.</strong></blockquote>
        <div class="w2-sound-mark" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
      `, { className: "opening", nextLabel: "See what you will achieve" });
    } else if (step === 1) {
      page = shell(`
        <p class="w2-eyebrow">YOUR WEEK 2 TRANSFORMATION</p>
        <h1>What you will<br />walk away with.</h1>
        <div class="w2-agenda">${chapters.map((chapter, index) => `<article><span>${String(index + 1).padStart(2, "0")}</span><strong>${esc(chapter.title)}</strong></article>`).join("")}</div>
      `, { className: "agenda", nextLabel: "Why projection matters" });
    } else if (step === 6) {
      page = shell(`
        <p class="w2-eyebrow">WHY A STRONGER VOICE MATTERS</p>
        <h1>Your voice carries more<br />than your words.</h1>
        <div class="w2-voice-signal">
          <article class="quiet"><header><span>3/10</span><small>WHEN THE VOICE SHRINKS</small></header><div class="w2-mini-wave"><i></i><i></i><i></i><i></i><i></i></div><p>The listener may read hesitation, shyness or self-doubt, even when your idea is strong.</p></article>
          <div class="w2-signal-shift" aria-hidden="true"><span>PROJECT</span><i>→</i></div>
          <article class="present"><header><span>7/10</span><small>WHEN THE VOICE ARRIVES</small></header><div class="w2-mini-wave"><i></i><i></i><i></i><i></i><i></i></div><p>Your idea is easier to follow, carries more weight and can strengthen impressions of confidence, presence and respect.</p></article>
        </div>
        <div class="w2-body-link"><article><small>YOUR VOICE → YOUR BODY</small><p>A fuller voice wakes up your face, your hands and the way you move.</p></article><i aria-hidden="true">⇄</i><article><small>YOUR BODY → YOUR VOICE</small><p>A lively body gives your voice more life.</p></article></div>
        <blockquote>Your voice is part of your personality.<br /><strong>Make your expertise audible.</strong></blockquote>
      `, { className: "w2-why-volume", nextLabel: "Build a stronger voice" });
    } else if (step === 7) {
      page = shell(`
        <p class="w2-eyebrow">BUILD THE VOICE, DO NOT FORCE IT</p>
        <h1>Three habits keep<br />a strong voice steady.</h1>
        <div class="w2-strong-voice">
          <article><span>01</span><div class="w2-tip-icon breath" aria-hidden="true"><i></i><i></i><i></i></div><small>BREATH</small><h2>Support the sound.</h2><p>Inhale low and quietly. Speak on a steady exhale so the throat does not have to push.</p></article>
          <article><span>02</span><div class="w2-tip-icon posture" aria-hidden="true"><i></i></div><small>POSTURE</small><h2>Give the voice space.</h2><p>Ground your feet. Lengthen your spine. Release your shoulders, jaw and face.</p></article>
          <article><span>03</span><div class="w2-tip-icon habit" aria-hidden="true"><i></i><i></i><i></i></div><small>HABIT</small><h2>Train a volume ladder.</h2><p>Say one sentence at 3/10, 5/10, 7/10 and 8/10. Treat 7/10 as ideal. Push to 8/10 so 7/10 feels easier and controlled.</p></article>
        </div>
        <div class="w2-projection-formula"><strong>SUPPORTED BREATH</strong><i>+</i><strong>OPEN POSTURE</strong><i>+</i><strong>DAILY REPETITION</strong><span>= STRONGER VOICE</span></div>
        <p class="w2-coach-note">Add melody as volume rises. A louder flat voice can sound aggressive. A supported, varied voice sounds present.</p>
      `, { className: "w2-voice-tips", nextLabel: "Notice my pressure pattern" });
    } else if (step === 3) {
      const seen = new Set(state.leaksSeen || []);
      page = shell(`
        <p class="w2-eyebrow">WHERE WE LOSE OUR VOLUME</p>
        <h1>Three places your<br /><em>volume slips away.</em></h1>
        <p class="w2-lede">All three happen to everyone, and all three matter. Flip each card to see why it happens and how to fix it.</p>
        <div class="w2-leaks">${leaks.map((leak, index) => `<button type="button" class="w2-leak ${seen.has(leak.id) ? "flipped" : ""}" data-w2-leak="${leak.id}" aria-pressed="${seen.has(leak.id)}" style="--i:${index}">
          <span class="w2-leak-face front"><small>0${index + 1}</small><strong>${esc(leak.name)}</strong><span class="w2-leak-bars" aria-hidden="true">${leak.bars.map((h, i) => `<i style="--h:${h};--d:${i}"></i>`).join("")}</span><p>${esc(leak.sign)}</p><em>Tap to flip</em></span>
          <span class="w2-leak-face back"><small>WHY IT HAPPENS</small><p>${esc(leak.why)}</p><small>THE FIX</small><p class="fix">${esc(leak.fix)}</p></span>
        </button>`).join("")}</div>
        <p class="w2-coach-note" data-w2-leaks-note aria-live="polite">${leaksNote(seen.size)}</p>
      `, { className: "w2-leaks-screen" });
    } else if (step === 4) {
      page = shell(`
        <p class="w2-eyebrow">THREE VOICE SETTINGS</p>
        <h1>Strong is not the same<br />as loud.</h1>
        <div class="w2-voice-zones">
          <article class="hidden"><span>3/10</span><small>HELD BACK</small><strong>The listener works to hear you.</strong><div class="wave"><i></i><i></i><i></i><i></i><i></i></div></article>
          <article class="grounded"><span>7/10</span><small>IDEAL</small><strong>Audible, natural and supported.</strong><div class="wave"><i></i><i></i><i></i><i></i><i></i></div></article>
          <article class="forced"><span>8/10</span><small>STRETCH</small><strong>Louder than ideal, used briefly to expand your range.</strong><div class="wave"><i></i><i></i><i></i><i></i><i></i></div></article>
        </div>
        <blockquote>Your ideal is 7/10:<br /><strong>clear enough to arrive, relaxed enough to remain yours.</strong></blockquote>
      `);
    } else if (step === 21) {
      page = shell(`
        <p class="w2-eyebrow">WHY VOLUME COMES FIRST</p>
        <h1>Volume is the lifeblood<br /><em>of your voice.</em></h1>
        <p class="w2-lede">It gives life to everything else: your pace, your pitch and your pauses. With a weak volume, they all go flat.</p>
        <div class="w2-lifeline" aria-hidden="true"><svg viewBox="0 0 600 60"><path d="M0 30 H190 L212 30 L232 6 L256 54 L280 16 L300 30 H600" /></svg></div>
        <div class="w2-qualities" role="group" aria-label="What a stronger volume gives you">${qualities.map((item, index) => `<button type="button" class="w2-quality ${state.wantQuality === item.id ? "selected" : ""}" data-w2-quality="${item.id}" aria-pressed="${state.wantQuality === item.id}" style="--i:${index}"><span>0${index + 1}</span><strong>${esc(item.name)}</strong><p>${esc(item.text)}</p></button>`).join("")}</div>
        <p class="w2-coach-note">A stronger volume makes people hear you this way. Tap the one you want people to feel most.</p>
      `, { className: "w2-lifeblood", nextLabel: "Feel it first" });
    } else if (step === 22) {
      page = shell(`
        <p class="w2-eyebrow">FEEL THE DIFFERENCE</p>
        <h1>Say it small.<br /><em>Then say it strong.</em></h1>
        <article class="w2-lowtry">
          <small>READ THIS SENTENCE ALOUD, TWICE</small>
          <p class="w2-low-sentence">“I am really excited about this project.”</p>
        </article>
        <div class="w2-duo">
          <section class="w2-try low ${state.lowDone ? "done" : ""}" data-w2-try="low">
            <small>ATTEMPT 1 · VERY LOW · 3 OUT OF 10</small>
            <p>Say it quietly, as if you do not want to be heard.</p>
            <div class="w2-try-status" data-w2-try-status="low" aria-live="polite">${state.lowDone ? "Done ✓" : "Press record, then say it."}</div>
            <button type="button" class="w2-try-button" data-w2-action="record-low">${state.lowDone ? "Try again" : "Record"}</button>
          </section>
          <section class="w2-try loud ${state.loudDone ? "done" : ""}" data-w2-try="loud">
            <small>ATTEMPT 2 · STRONG · 7 OUT OF 10</small>
            <p>Stand up. Breathe low. Aim your voice at the far wall.</p>
            <div class="w2-try-status" data-w2-try-status="loud" aria-live="polite">${state.loudDone ? "Done ✓" : state.lowDone ? "Press record, then say it." : "Do attempt 1 first."}</div>
            <button type="button" class="w2-try-button" data-w2-action="record-loud" ${state.lowDone ? "" : "disabled"}>${state.loudDone ? "Try again" : "Record"}</button>
          </section>
        </div>
        <div class="w2-live" data-w2-live hidden aria-hidden="true"><span>YOUR VOICE, LIVE</span><div><i data-w2-live-bar></i></div></div>
        <p class="w2-coach-note">${micSupported() ? "Your microphone is used only on this slide. Nothing is recorded. Only the two loudness numbers are saved." : "No microphone is available here. Say it out loud, then press the button."}</p>
        <section class="w2-tracker" data-w2-tracker aria-live="polite" hidden></section>
        <div class="w2-low-heard" data-w2-low-heard ${state.lowDone && state.loudDone ? "" : "hidden"}>
          <p>How did each one sound to a listener?</p>
          ${["low", "loud"].map(kind => `<div class="w2-heard-row"><b>${kind === "low" ? "Quiet" : "Strong"}</b><div class="w2-chips">${heardChips[kind].map(chip => `<button type="button" class="${(kind === "low" ? state.lowHeard : state.loudHeard || []).includes(chip) ? "selected" : ""}" data-w2-heard="${esc(chip)}" data-w2-heard-row="${kind}" aria-pressed="${(kind === "low" ? state.lowHeard : state.loudHeard || []).includes(chip)}">${esc(chip)}</button>`).join("")}</div></div>`).join("")}
          <blockquote>Same words. Different message.<br /><strong>The idea did not change. Only the volume did.</strong></blockquote>
        </div>
      `, { className: "w2-lowvolume" });
    } else if (step === 24) {
      page = shell(`
        <p class="w2-eyebrow">VOLUME IS A DIAL</p>
        <h1>Volume is a dial,<br /><em>not a switch.</em></h1>
        <div class="w2-dial-cards">
          <article class="up"><small>TURN IT UP</small><ul><li>To show energy and excitement</li><li>To mark the point that matters</li><li>To reach the whole room</li></ul></article>
          <article class="down"><small>TURN IT DOWN</small><ul><li>To create closeness</li><li>To invite reflection</li><li>To make people lean in</li></ul></article>
        </div>
        <div class="w2-dial-story" aria-label="A short story with steady, louder and softer moments">${dialStory.map((seg, index) => `<div class="w2-seg ${seg.label.toLowerCase()}" data-w2-seg="${index}" style="--lvl:${seg.lvl}"><i></i><p>${esc(seg.t)}</p><b>${seg.lvl}/10 · ${seg.label}</b></div>`).join("")}</div>
        <button type="button" class="w2-play" data-w2-action="play-story">▶ Read it aloud with the pattern</button>
        <blockquote>Soft is a choice. Hidden is a habit.<br /><strong>Even your quiet voice must reach the listener.</strong></blockquote>
        <p class="w2-coach-note">Next, you use the dial in a real answer: a strong base, one soft moment, then back up.</p>
      `, { className: "w2-dial", nextLabel: "Use it in PREP" });
    } else if (step === 5) {
      const mode = state.volMode || "";
      const tried = new Set(state.volModesTried || []);
      const modeData = dynamicModes[mode];
      page = shell(`
        <p class="w2-eyebrow">THE NEXT LEVEL · VOLUME VARIETY</p>
        <div class="w2-shift" aria-label="So far, louder was better. Now, your volume learns to move.">
          <article class="before"><small>SO FAR</small><p>Volume is important. You built a strong 7/10 base.</p><span class="w2-shift-bar flat" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></article>
          <i class="w2-shift-arrow" aria-hidden="true">→</i>
          <article class="after"><small>THE NEXT LEVEL</small><p>Volume variety: up and down, on purpose. That is what keeps people listening.</p><span class="w2-shift-bar moving" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span></article>
        </div>
        <h1>Contrast is king.<br /><em>Go soft on purpose.</em></h1>
        <p class="w2-lede">A strong volume is important: it shows confidence. But volume variety takes you to the next level. Lowering your voice, on purpose, creates intimacy and connection: people lean in.</p>
        <article class="w2-contrast ${mode}" data-w2-contrast>
          <small>SAME STORY · THREE WAYS · TAP EACH ONE</small>
          <div class="w2-contrast-modes" role="group" aria-label="Choose how to tell the story">${Object.keys(dynamicModes).map(key => `<button type="button" class="${key} ${mode === key ? "selected" : ""} ${tried.has(key) ? "tried" : ""}" data-w2-volmode="${key}" aria-pressed="${mode === key}">${esc(dynamicModes[key].name)}</button>`).join("")}</div>
          <div class="w2-contrast-lines">${dynamicStory.map((line, index) => { const lvl = mode ? dynamicLevel(mode, line) : 6; return `<div class="w2-cline ${lvl >= 8 ? "loud" : lvl <= 4 ? "soft" : ""}" data-w2-cline="${index}" style="--lvl:${lvl}"><span class="w2-cbar"><i></i><em class="w2-clive"></em><b>${mode ? `${lvl}/10` : "–"}</b></span><p>${esc(line.t)}</p></div>`; }).join("")}</div>
          <div class="w2-contrast-meter"><span>LISTENER</span><div><i data-w2-cmeter style="width:0%"></i></div><strong data-w2-ctag>Waiting</strong></div>
          <p class="w2-contrast-read" data-w2-cread aria-live="polite">${mode ? "Now read it out loud. The highlight moves with you." : "Tap a version. Then read the story out loud the same way."}</p>
          <div class="w2-contrast-go" data-w2-go>
            ${micSupported() ? `<button type="button" class="w2-follow" data-w2-action="follow-mic" ${mode ? "" : "disabled"}>🎙 Read it, I’ll follow you</button>` : ""}
            <button type="button" class="w2-follow-quiet" data-w2-action="follow-pace" ${mode ? "" : "disabled"}>${micSupported() ? "No mic? Play it at reading pace" : "▶ Play it at reading pace"}</button>
          </div>
          <p class="w2-mic-privacy">${micSupported() ? "The microphone only listens for when you speak and pause. Nothing is recorded or saved." : ""}</p>
        </article>
        <div class="w2-dyn-tips">
          <article><span>01</span><strong>Strong first</strong><p>Soft only works after a strong base. Without the contrast, it just sounds unsure.</p></article>
          <article><span>02</span><strong>One or two sentences</strong><p>Lower it for a personal moment, or the line just before your point. Then come back up.</p></article>
          <article><span>03</span><strong>Soft, not mumbled</strong><p>Slow down a little and say every word clearly. The back of the room must still hear you.</p></article>
        </div>
        <blockquote>A strong voice earns their respect.<br /><strong>A soft moment, on purpose, earns their closeness.</strong></blockquote>
      `, { className: "w2-dynamic", nextLabel: "Turn the dial" });
    } else if (step === 9) {
      page = shell(`
        <p class="w2-eyebrow">VERSION 1 · STRONG BASE + ONE SOFT MOMENT</p>
        ${topicChip(material)}
        <h1>PREP gives you the words.<br /><em>Your volume gives them life.</em></h1>
        <div class="w2-projection-brief">
          <article><span>01</span><p>Use the four PREP keywords to build an answer of up to 90 seconds. Do not read a script.</p></article>
          <article><span>02</span><p>Point and reason: strong and steady at 7/10, as if speaking to someone across the room.</p></article>
          <article><span>03</span><p>Example: go soft on purpose for one sentence. Then come back up strong for your final point.</p></article>
        </div>
        ${prepGuide(material)}
        <div class="w2-timer"><strong data-w2-timer-display>90</strong><span>seconds</span><button type="button" data-w2-action="timer" data-w2-timer-seconds="90">Start timer</button></div>
        <p class="w2-coach-note">Listener test: could they hear every word, and did your soft moment make them lean in? PREP is the content. Volume variety is the skill.</p>
      `, { footer: '<button class="w2-next" type="button" data-w2-action="complete-v1">Version 1 complete</button>' });
    } else if (step === 10) {
      page = shell(`
        <p class="w2-eyebrow">ONE IMPROVEMENT</p>
        <h1>Change one thing.<br />Then speak again.</h1>
        <div class="w2-version-stack">
          <article class="done"><span>VERSION 1</span><strong>Initial attempt complete</strong></article><i>↓</i>
          <label><span>ONE VOICE ADJUSTMENT</span><input data-w2-improvement value="${esc(state.coachImprovement)}" placeholder="For example: keep the final words audible" /></label><i>↓</i>
          <article><span>VERSION 2</span><strong>Same answer, stronger delivery</strong></article>
        </div>
        <div class="w2-improvement-options"><button type="button" data-w2-improvement-option="Begin one level stronger">Begin one level stronger</button><button type="button" data-w2-improvement-option="Send the sentence to the listener">Send it to the listener</button><button type="button" data-w2-improvement-option="Keep the final words audible">Keep the ending audible</button><button type="button" data-w2-improvement-option="Make my soft moment clearer and more deliberate">Make my soft moment deliberate</button></div>
      `, { nextLabel: "Speak Version 2" });
    } else if (step === 11) {
      page = shell(`
        <p class="w2-eyebrow">VERSION 2</p>
        ${topicChip(material)}
        <h1>Same message.<br /><em>More of your voice.</em></h1>
        <article class="w2-improvement-banner"><small>YOUR ONE IMPROVEMENT</small><strong>${esc(state.coachImprovement || "Keep the final words audible")}</strong></article>
        ${prepGuide(material)}
        <div class="w2-timer"><strong data-w2-timer-display>90</strong><span>seconds</span><button type="button" data-w2-action="timer" data-w2-timer-seconds="90">Start timer</button></div>
      `, { footer: '<button class="w2-next" type="button" data-w2-action="complete-v2">Version 2 complete</button>' });
    } else if (step === 12) {
      page = shell(`
        <p class="w2-eyebrow">FROM PRACTICE TO REAL LIFE</p>
        <h1>What changed<br />the second time?</h1>
        <div class="w2-version-result"><article><small>VERSION 1</small><strong>Your natural baseline</strong></article><i>→</i><article><small>ONE CHANGE</small><strong>${esc(state.coachImprovement || "Strong through the ending")}</strong></article><i>→</i><article class="strong"><small>VERSION 2</small><strong>What sounded clearer?</strong></article></div>
        <p class="w2-lede">Name one difference with your coach. Take one useful cue into your week.</p>
        <blockquote>Before choosing the mission,<br /><strong>let's name what speaking audibly predicts.</strong></blockquote>
      `, { nextLabel: "Name the prediction" });
    } else if (step === 13) {
      page = shell(`
        <p class="w2-eyebrow">IDENTIFY THE WORST-CASE SCENARIO</p>
        <h1>If you make yourself heard,<br />what are you afraid will happen?</h1>
        <div class="w2-input-card">
          <textarea data-w2-prediction rows="3" placeholder="If I speak loudly enough to be heard, people will think I am trying too hard…">${esc(state.prediction)}</textarea>
          <div class="w2-prediction-examples"><span>I'll sound nervous.</span><span>I'll attract too much attention.</span><span>I'll sound aggressive.</span><span>My voice will shake.</span></div>
          <label class="w2-slider-label"><span>How likely does this feel right now?</span><strong data-w2-before-value>${state.beliefBefore}%</strong></label>
          <input class="w2-slider" type="range" min="0" max="100" step="5" value="${state.beliefBefore}" data-w2-before />
          <div class="w2-slider-scale"><span>0%</span><span>100%</span></div>
        </div>
      `);
    } else if (step === 14) {
      page = shell(`
        <p class="w2-eyebrow">LET'S RUN AN EXPERIMENT</p>
        <h1>We know the prediction.<br />Now we test it.</h1>
        <div class="w2-experiment"><article><small>PREDICTION</small><p>${esc(state.prediction || "What do you predict will happen?")}</p></article><i>↓</i><article><small>MISSION</small><p>Answer questions in the Speaker's Gym app in a louder voice, standing up for more energy.</p></article><i>↓</i><article><small>REALITY</small><p>What actually happened?</p></article></div>
        <div class="w2-equation"><strong>PREDICTION</strong><i>→</i><strong>VOICE EXPOSURE</strong><i>→</i><strong>EVIDENCE</strong></div>
      `);
    } else if (step === 15) {
      const mission = state.mission || defaultMission(level);
      page = shell(`
        <p class="w2-eyebrow">CHOOSE THE RIGHT-SIZED MISSION</p>
        <h1>One voice skill.<br />The right situation.</h1>
        <p class="w2-lede">A stronger voice is the only new challenge. Your level simply chooses how safe or demanding the situation will be.</p>
        <div class="w2-level-picker" role="group" aria-label="Exposure level">${exposure.levels.map((item, index) => `<button type="button" class="${index + 1 === level ? "selected" : ""}" data-w2-level="${index + 1}"><span>${index + 1}</span><small>${esc(item.name)}</small></button>`).join("")}</div>
        <div class="w2-level-focus"><small>LEVEL ${level} · SITUATION</small><h2>${esc(levelData.name)}</h2><p>${esc(levelData.behavior)}</p></div>
        <label class="w2-mission-edit"><span>YOUR WEEK 2 CHALLENGE</span><textarea data-w2-mission rows="2">${esc(mission)}</textarea></label>
      `, { nextLabel: "Build mission card" });
    } else if (step === 16) {
      const mission = state.mission || defaultMission(level);
      page = shell(`
        <p class="w2-eyebrow">WEEK 2 MISSION</p>
        <h1>One skill.<br />One audible moment.</h1>
        <article class="w2-mission-card ${state.missionStatus === "accepted" ? "activated" : ""}">
          <div><small>SKILL</small><strong>A Stronger Voice</strong></div><div><small>SITUATION</small><strong>Level ${state.missionLevel || level} · ${esc(levelData.name)}</strong></div>
          <section><small>CHALLENGE</small><p>${esc(mission)}</p></section><section><small>YOUR PREDICTION</small><p>“${esc(state.prediction)}”</p></section>${qualities.find(item => item.id === state.wantQuality) ? `<section><small>WHAT YOU WANT PEOPLE TO FEEL</small><p>${esc(qualities.find(item => item.id === state.wantQuality).name)}</p></section>` : ""}
          <section class="win"><small>WIN CONDITION</small><strong>I answered out loud, standing up, in a stronger voice.</strong><p>You do not need to feel calm or sound perfect. Standing up and speaking louder is the win.</p></section>
        </article>
      `, { footer: '<button class="w2-next mission-accept" type="button" data-w2-action="accept-mission">Accept mission</button>' });
    } else if (step === 17) {
      page = shell(`
        <p class="w2-eyebrow">LECTURE 2 COMPLETE</p>
        <h1>Your voice is ready.<br /><em>Your mission is active.</em></h1>
        <article class="w2-mission-mini active"><small>YOUR WEEK 2 MISSION</small><p>${esc(state.mission)}</p><strong>Win by answering out loud, standing up, in a stronger voice.</strong></article>
        <div class="w2-leave-plan"><article><span>01</span><strong>Leave the lecture</strong><p>Take a stronger voice into your week.</p></article><article><span>02</span><strong>Attempt the mission</strong><p>Nervous and imperfect are allowed.</p></article><article><span>03</span><strong>Return with reality</strong><p>Use “Report mission” in your portal.</p></article></div>
        <blockquote>The lecture ends here.<br /><strong>The evidence begins when your voice enters the room.</strong></blockquote>
      `, { footer: '<button class="w2-next" type="button" data-w2-action="close">Return to my portal</button>' });
    } else if (step === 18) {
      page = shell(`
        <p class="w2-eyebrow">WELCOME BACK</p>
        <h1>Did you make yourself<br />clearly audible?</h1>
        <p class="w2-lede">The win is the attempt. Nothing else is required.</p>
        <article class="w2-mission-mini"><small>YOUR MISSION</small><p>${esc(state.mission)}</p></article>
        <div class="w2-did-it"><button type="button" data-w2-action="mission-not-yet"><span>NOT YET</span><small>Save and return later</small></button><button type="button" class="yes" data-w2-action="mission-yes"><span>YES</span><small>I attempted it</small></button></div>
      `, { footer: '<span class="w2-footer-hint">Your mission stays active until you attempt it.</span>' });
    } else if (step === 19) {
      page = shell(`
        <p class="w2-eyebrow">REALITY CHECK</p>
        <h1>What actually happened?</h1>
        <p class="w2-lede">One short answer. No report and no long reflection.</p>
        <div class="w2-input-card">
          <textarea data-w2-result rows="3" placeholder="My voice shook at first, but the listener heard the complete sentence…">${esc(state.actualResult)}</textarea>
          <label class="w2-slider-label"><span>How likely does your original prediction feel now?</span><strong data-w2-after-value>${state.beliefAfter}%</strong></label>
          <input class="w2-slider" type="range" min="0" max="100" step="5" value="${state.beliefAfter}" data-w2-after />
          <div class="w2-belief-change"><div><small>BEFORE</small><strong>${state.beliefBefore}%</strong></div><i>→</i><div><small>AFTER</small><strong data-w2-after-card>${state.beliefAfter}%</strong></div></div>
        </div>
      `, { footer: '<button class="w2-next" type="button" data-w2-action="collect-evidence">Collect evidence</button>' });
    } else {
      const evidence = (portal.getState().evidence || []).find(item => item.id === state.evidenceId);
      page = shell(`
        <p class="w2-eyebrow">WEEK 2 COMPLETE</p>
        <h1>You strengthened your voice.<br />You proved it can arrive.</h1>
        <div class="w2-completion-stats"><article><small>SKILL UNLOCKED</small><strong>A Stronger Voice</strong></article><article><small>VERSIONS COMPLETED</small><strong>${state.versionsCompleted || 2}</strong></article><article><small>EXPOSURE</small><strong>Level ${state.missionLevel || level}</strong></article><article><small>EVIDENCE COLLECTED</small><strong>1</strong></article></div>
        <article class="w2-evidence-card"><header><small>EVIDENCE COLLECTED</small><span>WEEK 2</span></header><div><small>PREDICTION</small><p>${esc(evidence?.prediction || state.prediction)}</p></div><div><small>REALITY</small><p>${esc(evidence?.reality || state.actualResult)}</p></div><div class="belief"><small>BELIEF</small><strong>${state.beliefBefore}% → ${state.beliefAfter}%</strong></div></article>
        <div class="w2-week-progress"><span class="complete">W1 <i>●</i></span><span class="complete">W2 <i>●</i></span>${[3,4,5,6].map(number => `<span>W${number} <i>○</i></span>`).join("")}</div>
        <div class="w2-next-week"><small>NEXT</small><strong>Make your voice more expressive and engaging.</strong></div>
      `, { footer: '<button class="w2-next" type="button" data-w2-action="close">Return to my portal</button>' });
    }

    root.innerHTML = page;
    renderTracker();
    root.querySelector("h1")?.setAttribute("id", "lecturePageTitle");
    document.body.classList.add("lecture-open");
    requestAnimationFrame(() => root.querySelector("textarea, input, button")?.focus({ preventScroll: true }));
  }

  function validateAndNext() {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const requirements = {
      3: [(state.leaksSeen || []).length >= leaks.length ? "ok" : "", "Flip all three cards before continuing."],
      10: [state.coachImprovement, "Choose one voice adjustment for Version 2."],
      13: [state.prediction, "Name what you fear might happen if you make yourself heard."],
      15: [state.mission || defaultMission(getLevel()), "Choose one small mission."]
    };
    if (requirements[step] && !String(requirements[step][0] || "").trim()) {
      portal.showToast(requirements[step][1]);
      root.querySelector("textarea, input, button")?.focus();
      return;
    }
    const flowIndex = lectureFlow.indexOf(step);
    const nextStep = flowIndex >= 0 && flowIndex < lectureFlow.length - 1 ? lectureFlow[flowIndex + 1] : Math.min(lastStep, step + 1);
    const patch = { currentStep: nextStep, lastViewedAt: new Date().toISOString() };
    if (step === 15 && !state.mission) patch.mission = defaultMission(getLevel());
    update(patch);
    renderStep();
  }

  function back() {
    const step = Number(getState().currentStep || 0);
    if (followUpSteps.includes(step)) {
      update({ currentStep: step - 1 });
      return renderStep();
    }
    const flowIndex = lectureFlow.indexOf(step);
    if (flowIndex <= 0) return;
    update({ currentStep: lectureFlow[flowIndex - 1] });
    renderStep();
  }

  function resetLecture() {
    clearInterval(timer);
    if (!portal.resetLecture(2)) return;
    renderStep();
  }

  function close() {
    micStop();
    clearLater();
    clearInterval(timer);
    update({ lastViewedAt: new Date().toISOString() });
    root.innerHTML = "";
    document.body.classList.remove("lecture-open");
    portal.renderAll();
    previousFocus?.focus?.();
  }

  function startTimer(button) {
    clearInterval(timer);
    let remaining = Number(button.dataset.w2TimerSeconds) || 90;
    const display = root.querySelector("[data-w2-timer-display]");
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
      root.querySelector("[data-w2-result]")?.focus();
      return;
    }
    const id = state.evidenceId || `week2-${Date.now()}`;
    const card = {
      id,
      week: 2,
      skill: "A Stronger Voice",
      prediction: state.prediction,
      reality: state.actualResult,
      beliefBefore: Number(state.beliefBefore),
      beliefAfter: Number(state.beliefAfter),
      level: Number(state.missionLevel || getLevel()),
      mission: state.mission,
      completedAt: new Date().toISOString()
    };
    portal.saveEvidence(card);
    update({ evidenceId: id, completedAt: card.completedAt, currentStep: 20 });
    portal.showToast("Voice evidence collected.");
    renderStep();
  }

  function flipLeak(card) {
    card.classList.toggle("flipped");
    card.setAttribute("aria-pressed", String(card.classList.contains("flipped")));
    const seen = [...new Set([...(getState().leaksSeen || []), card.dataset.w2Leak])];
    update({ leaksSeen: seen });
    const note = root.querySelector("[data-w2-leaks-note]");
    if (note) note.textContent = leaksNote(seen.length);
  }

  function chooseQuality(button) {
    const id = button.dataset.w2Quality;
    const next = getState().wantQuality === id ? "" : id;
    update({ wantQuality: next });
    root.querySelectorAll("[data-w2-quality]").forEach(el => {
      const on = el.dataset.w2Quality === next;
      el.classList.toggle("selected", on);
      el.setAttribute("aria-pressed", String(on));
    });
  }

  function renderTracker() {
    const box = root.querySelector("[data-w2-tracker]");
    if (!box) return;
    const s = getState();
    box.hidden = !(s.lowDone || s.loudDone);
    if (box.hidden) return;
    const low = Number(s.lowLevel) || 0;
    const loud = Number(s.loudLevel) || 0;
    const measured = low > 0 && loud > 0;
    let lowPct = 30;
    let loudPct = 70;
    let note = "No microphone reading, so these bars show the targets: 3 out of 10 and 7 out of 10.";
    if (measured) {
      const top = Math.max(low, loud);
      lowPct = Math.max(8, Math.round((low / top) * 100));
      loudPct = Math.max(8, Math.round((loud / top) * 100));
      const gap = 20 * Math.log10(loud / low);
      const times = (loud / low).toFixed(1);
      note = gap >= 6 ? `Big difference. Your strong voice was about ${times} times stronger than your quiet one.`
        : gap >= 3 ? "Clear difference. Your strong voice was louder and fuller."
        : gap > 0 ? "A small difference. Stand up, breathe low and push the strong one a little more."
        : "Your strong voice was not louder than the quiet one. Stand up and try the strong one again.";
    } else if (!s.loudDone) {
      note = "Now do attempt 2, and watch the second bar.";
      loudPct = 0;
    }
    const lowText = low > 0 ? "Measured" : "Target";
    const loudText = loud > 0 ? "Measured" : "Target";
    box.innerHTML = `<small>YOUR VOLUME TRACKER</small>
      <div class="w2-track-row"><b>Quiet</b><div><i class="low" style="width:${s.lowDone ? lowPct : 0}%"></i></div><span>${s.lowDone ? lowText + " · 3/10" : "—"}</span></div>
      <div class="w2-track-row"><b>Strong</b><div><i class="loud" style="width:${s.loudDone ? loudPct : 0}%"></i></div><span>${s.loudDone ? loudText + " · 7/10" : "—"}</span></div>
      <p>${esc(note)}</p>`;
  }

  async function recordAttempt(button, kind) {
    clearLater();
    micStop();
    const status = root.querySelector(`[data-w2-try-status="${kind}"]`);
    const live = root.querySelector("[data-w2-live]");
    const bar = root.querySelector("[data-w2-live-bar]");
    const other = root.querySelector(`[data-w2-action="${kind === "low" ? "record-loud" : "record-low"}"]`);
    button.disabled = true;
    if (other) other.disabled = true;
    const frames = [];
    const noise = [];
    let phase = "wait";
    let measuring = micSupported();
    if (measuring) {
      try {
        await micStart(rms => {
          if (bar) bar.style.width = `${levelPercent(rms)}%`;
          if (phase === "wait") noise.push(rms);
          else if (phase === "say") frames.push(rms);
        });
        if (live) live.hidden = false;
      } catch {
        measuring = false;
        status.textContent = "No microphone access. Say it out loud anyway.";
      }
    }
    const say = kind === "low" ? "Say it now, very quietly." : "Say it now, strongly.";
    [["3…", 0], ["2…", 1000], ["1…", 2000]].forEach(([text, ms]) => later(() => { status.textContent = text; }, ms));
    later(() => { phase = "say"; status.textContent = say; status.classList.add("go"); }, 3000);
    later(() => {
      phase = "done";
      status.classList.remove("go");
      micStop();
      if (live) live.hidden = true;
      let level = null;
      if (measuring) {
        const floor = Math.max(0.01, (noise.length ? median(noise) : 0) * 2.5);
        const voiced = frames.filter(value => value > floor);
        if (voiced.length < 8) {
          status.textContent = "I could not hear you. Move closer and try again.";
          button.disabled = false;
          if (other && (kind === "loud" || getState().lowDone)) other.disabled = false;
          return;
        }
        level = Number(median(voiced).toFixed(5));
      }
      update(kind === "low" ? { lowDone: true, lowLevel: level } : { loudDone: true, loudLevel: level });
      status.textContent = "Done ✓";
      button.textContent = "Try again";
      button.disabled = false;
      button.closest("[data-w2-try]")?.classList.add("done");
      const loudButton = root.querySelector('[data-w2-action="record-loud"]');
      if (loudButton) loudButton.disabled = false;
      const lowButton = root.querySelector('[data-w2-action="record-low"]');
      if (lowButton) lowButton.disabled = false;
      const loudStatus = root.querySelector('[data-w2-try-status="loud"]');
      if (kind === "low" && loudStatus && !getState().loudDone) loudStatus.textContent = "Press record, then say it.";
      renderTracker();
      const heard = root.querySelector("[data-w2-low-heard]");
      if (heard && getState().lowDone && getState().loudDone) heard.hidden = false;
    }, 8200);
  }

  function tapHeard(chip) {
    const row = chip.dataset.w2HeardRow === "loud" ? "loud" : "low";
    const key = row === "loud" ? "loudHeard" : "lowHeard";
    const label = chip.dataset.w2Heard;
    const current = new Set(getState()[key] || []);
    if (current.has(label)) current.delete(label); else current.add(label);
    update({ [key]: [...current] });
    chip.classList.toggle("selected", current.has(label));
    chip.setAttribute("aria-pressed", String(current.has(label)));
  }

  // Time to read a line out loud, with a breath before the next one.
  const readTime = text => Math.max(2600, text.split(/\s+/).length * 480 + 1200);

  function setVolumeMode(mode) {
    clearLater();
    micStop();
    update({ volMode: mode });
    const box = root.querySelector("[data-w2-contrast]");
    box.classList.remove("loud", "soft", "dynamic");
    box.classList.add(mode);
    root.querySelectorAll("[data-w2-volmode]").forEach(button => {
      const on = button.dataset.w2Volmode === mode;
      button.classList.toggle("selected", on);
      button.setAttribute("aria-pressed", String(on));
    });
    contrastLines().forEach((el, index) => {
      const lvl = dynamicLevel(mode, dynamicStory[index]);
      el.style.setProperty("--lvl", lvl);
      el.classList.toggle("loud", lvl >= 8);
      el.classList.toggle("soft", lvl <= 4);
      el.classList.remove("lit", "said");
      el.querySelector("b").textContent = `${lvl}/10`;
      el.querySelector(".w2-clive").style.width = "0%";
    });
    root.querySelector("[data-w2-cmeter]").style.width = "0%";
    root.querySelector("[data-w2-ctag]").textContent = "Waiting";
    root.querySelector("[data-w2-cread]").textContent = "Now read it out loud. The highlight moves with you.";
    resetFollowButtons(false);
  }

  const contrastLines = () => [...root.querySelectorAll("[data-w2-cline]")];

  function resetFollowButtons(running) {
    const micButton = root.querySelector('[data-w2-action="follow-mic"]');
    const paceButton = root.querySelector('[data-w2-action="follow-pace"]');
    const nextButton = root.querySelector('[data-w2-action="follow-next"]');
    if (micButton) { micButton.disabled = running; micButton.textContent = running ? "Listening…" : "🎙 Read it, I’ll follow you"; }
    if (paceButton) paceButton.disabled = running;
    if (running && !nextButton) root.querySelector("[data-w2-go]").insertAdjacentHTML("beforeend", '<button type="button" class="w2-follow-quiet" data-w2-action="follow-next">Next line ›</button>');
    if (!running) nextButton?.remove();
  }

  function lightLine(index) {
    contrastLines().forEach((el, i) => {
      el.classList.toggle("lit", i === index);
      if (i === index) { el.classList.add("said"); el.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
    });
  }

  function finishVolumeRun(lineLevels) {
    const mode = getState().volMode;
    const data = dynamicModes[mode];
    const tried = [...new Set([...(getState().volModesTried || []), mode])];
    update({ volModesTried: tried });
    root.querySelector(`[data-w2-volmode="${mode}"]`)?.classList.add("tried");
    contrastLines().forEach(el => { el.classList.remove("lit"); el.querySelector(".w2-clive").style.width = "0%"; });
    root.querySelector("[data-w2-cmeter]").style.width = `${data.meter}%`;
    root.querySelector("[data-w2-ctag]").textContent = data.tag;
    let extra = "";
    if (mode === "dynamic" && lineLevels) {
      const soft = [], strong = [];
      dynamicStory.forEach((line, index) => { if (lineLevels[index] == null) return; (line.lvl <= 4 ? soft : strong).push(lineLevels[index]); });
      if (soft.length && strong.length) {
        extra = median(soft) < median(strong) - 4
          ? " ✓ Your soft lines really were softer than the rest. That is contrast."
          : " Your soft lines came out about as loud as the rest. Next time, bring them down further, on purpose.";
      }
    }
    root.querySelector("[data-w2-cread]").textContent = data.read + extra;
    resetFollowButtons(false);
    if (tried.length === 3) portal.showToast(mode === "dynamic" ? "Contrast is king. That is dynamic volume." : "All three done. Notice which one kept you listening.");
  }

  function followAtPace() {
    clearLater();
    micStop();
    resetFollowButtons(true);
    root.querySelector('[data-w2-action="follow-next"]')?.remove();
    root.querySelector("[data-w2-cread]").textContent = "Read along out loud, at the volume shown.";
    let offset = 300;
    dynamicStory.forEach((line, index) => {
      later(() => lightLine(index), offset);
      offset += readTime(line.t);
    });
    later(() => finishVolumeRun(null), offset);
  }

  // Follows the reader: a line is done once enough speech was heard for its length, followed by a short pause.
  const follow = { index: -1, voiced: 0, silent: 0, floor: null, noise: [], levels: [], lineLevels: [] };

  function nextFollowLine() {
    if (follow.index < 0) return;
    follow.lineLevels[follow.index] = follow.levels.length ? median(follow.levels) : null;
    contrastLines()[follow.index]?.querySelector(".w2-clive").style.setProperty("width", "0%");
    Object.assign(follow, { index: follow.index + 1, voiced: 0, silent: 0, levels: [] });
    if (follow.index >= dynamicStory.length) {
      micStop();
      clearLater();
      follow.index = -1;
      return finishVolumeRun(follow.lineLevels);
    }
    lightLine(follow.index);
  }

  async function followWithMic() {
    clearLater();
    micStop();
    Object.assign(follow, { index: -1, voiced: 0, silent: 0, floor: null, noise: [], levels: [], lineLevels: [] });
    const read = root.querySelector("[data-w2-cread]");
    resetFollowButtons(true);
    read.textContent = "One second of quiet, please…";
    try {
      await micStart(rms => {
        const pct = levelPercent(rms);
        if (follow.floor === null) {
          follow.noise.push(pct);
          if (follow.noise.length >= 10) {
            follow.floor = median(follow.noise);
            follow.index = 0;
            lightLine(0);
            read.textContent = "Start reading. I will follow you.";
          }
          return;
        }
        if (follow.index < 0) return;
        const line = contrastLines()[follow.index];
        line?.querySelector(".w2-clive").style.setProperty("width", `${Math.round(pct)}%`);
        if (pct > follow.floor + 12) { follow.voiced += 1; follow.silent = 0; follow.levels.push(pct); }
        else follow.silent += 1;
        const words = dynamicStory[follow.index].t.split(/\s+/).length;
        // About half a second of silence ends a line; a well-finished line needs a little less.
        const pauseFrames = follow.voiced >= words * 6 ? 6 : 9;
        if (follow.voiced >= Math.max(8, words * 4) && follow.silent >= pauseFrames) nextFollowLine();
      });
    } catch {
      resetFollowButtons(false);
      read.textContent = "The microphone is not available. Allow access, or use “Play it at reading pace”.";
      return;
    }
    later(() => { if (mic.stream) { micStop(); follow.index = -1; finishVolumeRun(follow.lineLevels); } }, 120000);
  }

  function playStory(button) {
    clearLater();
    const segs = [...root.querySelectorAll("[data-w2-seg]")];
    segs.forEach(el => el.classList.remove("lit"));
    button.disabled = true;
    let offset = 300;
    segs.forEach((el, index) => {
      later(() => {
        segs.forEach(other => other.classList.remove("lit"));
        el.classList.add("lit");
      }, offset);
      offset += readTime(dialStory[index].t);
    });
    later(() => {
      segs.forEach(other => other.classList.remove("lit"));
      button.disabled = false;
      button.textContent = "▶ Read it again";
    }, offset);
  }

  root.addEventListener("click", event => {
    const action = event.target.closest("[data-w2-action]")?.dataset.w2Action;
    if (action === "close") return close();
    if (action === "back") return back();
    if (action === "reset") return resetLecture();
    if (action === "next") return validateAndNext();
    if (action === "timer") return startTimer(event.target.closest("[data-w2-action]"));
    if (action === "complete-v1") {
      update({ versionsCompleted: Math.max(1, Number(getState().versionsCompleted || 0)), currentStep: 10 });
      portal.showToast("Version 1 complete. Choose one voice adjustment.");
      return renderStep();
    }
    if (action === "complete-v2") {
      update({ versionsCompleted: Math.max(2, Number(getState().versionsCompleted || 0)), currentStep: 12 });
      portal.showToast("Version 2 complete. Compare what you noticed.");
      return renderStep();
    }
    if (action === "accept-mission") {
      const state = getState();
      const level = getLevel();
      update({ mission: state.mission || defaultMission(level), missionLevel: level, missionStatus: "accepted", acceptedAt: new Date().toISOString(), lectureCompletedAt: new Date().toISOString(), currentStep: 17 });
      portal.showToast("Mission accepted. Standing up and speaking louder is the win.");
      return renderStep();
    }
    if (action === "mission-not-yet") return close();
    if (action === "mission-yes") {
      update({ missionStatus: "completed", currentStep: 19 });
      return renderStep();
    }
    if (action === "collect-evidence") return collectEvidence();

    if (action === "record-low") return recordAttempt(event.target.closest("[data-w2-action]"), "low");
    if (action === "record-loud") return recordAttempt(event.target.closest("[data-w2-action]"), "loud");
    if (action === "play-story") return playStory(event.target.closest("[data-w2-action]"));
    const volMode = event.target.closest("[data-w2-volmode]");
    if (volMode) return setVolumeMode(volMode.dataset.w2Volmode);
    if (action === "follow-mic") return followWithMic();
    if (action === "follow-pace") return followAtPace();
    if (action === "follow-next") return nextFollowLine();
    const leak = event.target.closest("[data-w2-leak]");
    if (leak) return flipLeak(leak);
    const quality = event.target.closest("[data-w2-quality]");
    if (quality) return chooseQuality(quality);
    const heardChip = event.target.closest("[data-w2-heard]");
    if (heardChip) return tapHeard(heardChip);
    const pattern = event.target.closest("[data-w2-pattern]");
    if (pattern) {
      update({ voicePattern: pattern.dataset.w2Pattern });
      return renderStep();
    }
    const zone = event.target.closest("[data-w2-zone]");
    if (zone) {
      update({ voiceZone: zone.dataset.w2Zone });
      return renderStep();
    }
    const improvement = event.target.closest("[data-w2-improvement-option]");
    if (improvement) {
      update({ coachImprovement: improvement.dataset.w2ImprovementOption });
      return renderStep();
    }
    const levelButton = event.target.closest("[data-w2-level]");
    if (levelButton) {
      const level = exposure.clampLevel(levelButton.dataset.w2Level);
      portal.setExposureLevel(level);
      update({ mission: defaultMission(level), missionLevel: null });
      return renderStep();
    }
  });

  root.addEventListener("input", event => {
    if (event.target.matches("[data-w2-improvement]")) {
      update({ coachImprovement: event.target.value });
    } else if (event.target.matches("[data-w2-prediction]")) {
      update({ prediction: event.target.value });
    } else if (event.target.matches("[data-w2-before]")) {
      update({ beliefBefore: Number(event.target.value) });
      root.querySelector("[data-w2-before-value]").textContent = `${event.target.value}%`;
    } else if (event.target.matches("[data-w2-mission]")) {
      update({ mission: event.target.value });
    } else if (event.target.matches("[data-w2-result]")) {
      update({ actualResult: event.target.value });
    } else if (event.target.matches("[data-w2-after]")) {
      update({ beliefAfter: Number(event.target.value) });
      root.querySelector("[data-w2-after-value]").textContent = `${event.target.value}%`;
      root.querySelector("[data-w2-after-card]").textContent = `${event.target.value}%`;
    }
  });

  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-week2-reflection]")) {
      previousFocus = document.activeElement;
      update({ currentStep: 18 });
      return renderStep();
    }
    if (!event.target.closest("[data-open-week2-lecture]")) return;
    previousFocus = document.activeElement;
    renderStep();
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.classList.contains("lecture-open")) close();
  });
})();


