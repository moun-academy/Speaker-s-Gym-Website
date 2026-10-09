(function () {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const exposure = window.SpeakersGymExposure;
  const root = document.querySelector("#week5Root");
  if (!portal || !exposure || !root) return;

  const chapters = [
    { title: "Why Melody Matters", start: 1, end: 2 },
    { title: "Find Your Range", start: 3, end: 4 },
    { title: "Pitch Shapes Meaning", start: 5, end: 7 },
    { title: "Mix Pace, Volume and Pitch", start: 8, end: 9 },
    { title: "Take It Into Real Life", start: 11, end: 12 }
  ];

  const stages = [
    { name: "DISCOVER", end: 2 },
    { name: "RANGE", end: 4 },
    { name: "SHAPE", end: 7 },
    { name: "MIX", end: 9 },
    { name: "PROVE", end: 12 }
  ];

  const missionTemplates = window.ASHWIN_DATA.levels.map(level => level.behavior + " Step up on one key word, and land your final sentence with a falling tone.");

  const moves = [
    { id: "step", name: "Step up", when: "on the one word that matters", example: ["It", "took", "three", "weeks."], ys: [0, 0, -22, 4], points: [26, 26, 26, 6, 26, 28] },
    { id: "lift", name: "Lift", when: "new ideas, questions, good news", example: ["And", "then", "we", "found", "it."], ys: [6, 2, -4, -12, -20], points: [34, 30, 24, 16, 8, 4] },
    { id: "drop", name: "Drop", when: "serious moments, bad news, suspense", example: ["Then", "the", "lights…", "went", "out."], ys: [4, 8, 12, 16, 18], points: [22, 28, 32, 36, 38, 38] },
    { id: "land", name: "Land", when: "statements, decisions, endings", example: ["I", "think", "we", "should", "wait."], ys: [0, -8, -2, -4, 14], points: [20, 12, 16, 14, 24, 38] }
  ];

  const stressWords = [
    { word: "I", meaning: "Someone else said it. Not me." },
    { word: "didn't", meaning: "I really did not say that." },
    { word: "say", meaning: "I might have hinted at it…" },
    { word: "he", meaning: "Someone else ate it." },
    { word: "ate", meaning: "He did something else with it." },
    { word: "my", meaning: "He ate someone else's sandwich." },
    { word: "sandwich.", meaning: "He ate something else of mine." }
  ];
  const stressTarget = 4;

  const sortItems = [
    { id: "news", text: "A friend tells you they just got engaged.", answer: "lift", why: "Match their energy first. That is rapport in sound." },
    { id: "delay", text: "You tell your team the trip is cancelled.", answer: "drop", why: "Low and steady reads as calm and in control." },
    { id: "recommend", text: "You give your opinion in a meeting.", answer: "land", why: "A falling end tells them you have decided." },
    { id: "question", text: "You ask a friend where they want to eat tonight.", answer: "lift", why: "A genuine question rises. Curiosity sounds curious." },
    { id: "suspense", text: "The moment in your story just before the problem appears.", answer: "drop", why: "Lower, slower, softer. They lean in to hear it." },
    { id: "intro", text: "You introduce yourself: \"I'm a nurse.\"", answer: "land", why: "Statements about you should land, not ask for permission." }
  ];
  const sortOrder = ["news", "recommend", "delay", "question", "intro", "suspense"];
  const sortLabels = { lift: "LIFT", drop: "DROP", land: "LAND" };

  const storyBeats = [
    { id: "setup", label: "SET THE SCENE", text: "We were at the airport, and our flight was boarding in twenty minutes.", coach: { pitch: "mid", pace: "fast", volume: "strong" }, why: "Background they can follow easily. Keep it moving." },
    { id: "tension", label: "THE PROBLEM", text: "Then I opened my bag… and my passport was gone.", coach: { pitch: "low", pace: "slow", volume: "soft" }, why: "Low, slow and soft pulls them in. Tension lives down here.", pauseAfter: true },
    { id: "action", label: "WHAT WE DID", text: "So we ran back, checked every café, and found it: on a chair, right where I had left it.", coach: { pitch: "high", pace: "fast", volume: "strong" }, why: "Energy rises with action. Lift and speed up." },
    { id: "result", label: "THE RESULT", text: "We made the flight with two minutes to spare. And I have never lost that passport again.", coach: { pitch: "low", pace: "slow", volume: "strong" }, why: "Slow down and land it. Ending low sounds sure." }
  ];
  const mixOptions = {
    pitch: [["high", "Lift"], ["mid", "Middle"], ["low", "Low · land"]],
    pace: [["fast", "Fast"], ["slow", "Slow"]],
    volume: [["strong", "Strong"], ["soft", "Soft"]]
  };
  const mixLabel = (dial, value) => (mixOptions[dial].find(option => option[0] === value) || [, "?"])[1];

  const landSentence = "I think we should start next Monday.";

  // Step 10 (build your own story) was retired; it is now an assignment given after the lecture.
  const stepOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15];
  const lectureStepCount = 12;
  let previousFocus = null;
  let timers = [];

  const esc = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  const getState = () => portal.getState().week5Lecture;
  const update = patch => portal.updateWeek5(patch);
  const getLevel = () => exposure.clampLevel(getState().currentLevel || portal.getState().currentLevel || 1);
  const chapterFor = step => chapters.find(chapter => step >= chapter.start && step <= chapter.end);
  const stageFor = step => stages.find(stage => step <= stage.end) || stages[stages.length - 1];

  function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() { timers.forEach(id => clearTimeout(id)); timers = []; }

  /* ---------- microphone pitch tracking ---------- */
  // Autocorrelation pitch detection. Returns semitones above A1 (55 Hz), or null when there is no clear voice.
  const mic = { stream: null, ctx: null, analyser: null, buffer: null, interval: null };
  const micSupported = () => Boolean(navigator.mediaDevices?.getUserMedia && (window.AudioContext || window.webkitAudioContext));

  function detectPitch(buffer, sampleRate) {
    const size = buffer.length;
    let rms = 0;
    for (let i = 0; i < size; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / size);
    if (rms < 0.012) return null;
    const minLag = Math.floor(sampleRate / 520);
    const maxLag = Math.min(Math.floor(sampleRate / 65), size - 1);
    const overlap = size - maxLag;
    const corr = new Float32Array(maxLag + 1);
    let best = 0;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let sum = 0, energyA = 0, energyB = 0;
      for (let i = 0; i < overlap; i++) {
        const a = buffer[i], b = buffer[i + lag];
        sum += a * b; energyA += a * a; energyB += b * b;
      }
      corr[lag] = sum / (Math.sqrt(energyA * energyB) || 1);
      if (corr[lag] > best) best = corr[lag];
    }
    if (best < 0.72) return null;
    // Take the first strong peak, which avoids reading the voice an octave too low.
    let lag = minLag;
    for (let l = minLag + 1; l < maxLag; l++) {
      if (corr[l] >= best * 0.9 && corr[l] >= corr[l - 1] && corr[l] >= corr[l + 1]) { lag = l; break; }
    }
    const a = corr[lag - 1] || corr[lag], b = corr[lag], c = corr[lag + 1] || corr[lag];
    const shift = (a - 2 * b + c) ? (a - c) / (2 * (a - 2 * b + c)) : 0;
    const frequency = sampleRate / (lag + shift);
    return 12 * Math.log2(frequency / 55);
  }

  async function micStart(onFrame) {
    micStop();
    mic.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    mic.ctx = new (window.AudioContext || window.webkitAudioContext)();
    const source = mic.ctx.createMediaStreamSource(mic.stream);
    mic.analyser = mic.ctx.createAnalyser();
    mic.analyser.fftSize = 2048;
    source.connect(mic.analyser);
    mic.buffer = new Float32Array(mic.analyser.fftSize);
    mic.interval = setInterval(() => {
      mic.analyser.getFloatTimeDomainData(mic.buffer);
      onFrame(detectPitch(mic.buffer, mic.ctx.sampleRate));
    }, 40);
  }

  function micStop() {
    if (mic.interval) clearInterval(mic.interval);
    mic.stream?.getTracks().forEach(track => track.stop());
    mic.ctx?.close().catch(() => {});
    mic.stream = mic.ctx = mic.analyser = mic.buffer = mic.interval = null;
  }

  const percentile = (values, p) => {
    const sorted = [...values].sort((x, y) => x - y);
    return sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((sorted.length - 1) * p)))];
  };
  // A median of three removes single-frame jumps before anything is measured or drawn.
  function smooth(values) {
    return values.map((value, index) => {
      if (value == null) return null;
      const near = [values[index - 1], value, values[index + 1]].filter(item => item != null);
      return near.sort((x, y) => x - y)[Math.floor(near.length / 2)];
    });
  }

  function traceView(canvas, low, high) {
    const points = [];
    const draw = () => {
      const ratio = window.devicePixelRatio || 1;
      const width = canvas.clientWidth, height = canvas.clientHeight;
      if (canvas.width !== width * ratio) { canvas.width = width * ratio; canvas.height = height * ratio; }
      const ctx = canvas.getContext("2d");
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = "rgba(241,203,61,.09)";
      ctx.lineWidth = 1;
      for (let st = Math.ceil(low); st <= high; st += 2) {
        const y = height - ((st - low) / (high - low)) * height;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      const visible = points.slice(-Math.floor(width / 3));
      const clean = smooth(visible);
      ctx.strokeStyle = "#f1cb3d";
      ctx.lineWidth = 3;
      ctx.lineJoin = ctx.lineCap = "round";
      ctx.beginPath();
      let drawing = false;
      clean.forEach((st, index) => {
        if (st == null) { drawing = false; return; }
        const x = index * 3, y = height - ((Math.max(low, Math.min(high, st)) - low) / (high - low)) * height;
        if (drawing) ctx.lineTo(x, y); else ctx.moveTo(x, y);
        drawing = true;
      });
      ctx.stroke();
    };
    return { push(st) { points.push(st); draw(); }, points, draw };
  }

  const sirenScale = [2, 42];
  const sirenPlace = st => `${Math.max(0, Math.min(100, ((st - sirenScale[0]) / (sirenScale[1] - sirenScale[0])) * 100))}%`;

  function rangeWindow() {
    const state = getState();
    if (state.rangeLow != null && state.rangeHigh != null) return [state.rangeLow - 3, state.rangeHigh + 3];
    return [6, 38];
  }

  /* ---------- markup helpers ---------- */
  function melodyLine(words, ys, className = "") {
    return `<p class="w5-melody ${className}">${words.map((word, index) => `<span style="--y:${ys[index] || 0}px;--d:${index}"><i aria-hidden="true"></i>${esc(word)}</span>`).join(" ")}</p>`;
  }

  function contour(points, className = "") {
    const step = 160 / (points.length - 1);
    const d = points.map((y, index) => `${index ? "L" : "M"}${(index * step).toFixed(1)} ${y}`).join(" ");
    return `<svg class="w5-contour ${className}" viewBox="-4 0 168 44" aria-hidden="true"><path d="${d}" pathLength="1" /></svg>`;
  }

  function micFallbackNote() {
    return micSupported() ? "" : '<p class="w5-mic-note">This browser cannot use a microphone here. Use the self-check button instead.</p>';
  }

  function shell(content, options = {}) {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const chapter = chapterFor(step);
    const chapterIndex = chapter ? chapters.indexOf(chapter) : -1;
    const slideNumber = stepOrder.indexOf(step) + 1;
    const afterMission = step >= 13;
    const canBack = step > 0 && !options.lockBack;
    const progress = Math.round((Math.min(lectureStepCount, slideNumber) / lectureStepCount) * 100);
    const chapterLabel = step === 0 ? "YOUR FIVE CHAPTERS" : afterMission ? "MISSION FOLLOW-UP" : "WEEK 5";
    const chapterTitle = chapter?.title || (step === 0 ? "Vocal Variety" : "Turn experience into evidence");
    const stage = stageFor(step);

    return `<div class="week3-page week5-page" role="dialog" aria-modal="true" aria-labelledby="week5PageTitle">
      <header class="w3-header">
        <div class="w3-brand"><img src="Logo.png?v=ashwin-lecture-v1" alt="" /><div><small>THE SPEAKER'S GYM</small><strong>WEEK 5 · VOCAL VARIETY</strong></div></div>
        <div class="w3-chapter-track" aria-label="${esc(chapter ? `Chapter ${chapterIndex + 1} of ${chapters.length}: ${chapterTitle}` : chapterTitle)}">
          <div><small>${chapter ? `CHAPTER ${String(chapterIndex + 1).padStart(2, "0")} OF ${String(chapters.length).padStart(2, "0")}` : chapterLabel}</small><strong>${esc(chapterTitle)}</strong></div>
          <div class="w3-chapter-dots" aria-hidden="true">${chapters.map((item, index) => `<i class="${index < chapterIndex ? "done" : index === chapterIndex ? "active" : ""}"></i>`).join("")}</div>
        </div>
        <div class="w3-header-actions"><button class="w3-reset" type="button" data-w5-action="reset">Reset</button><button class="w3-close" type="button" data-w5-action="close" aria-label="Save and close">&times;</button></div>
        <div class="w3-progress" aria-hidden="true"><i style="width:${progress}%"></i></div>
      </header>
      <main class="w3-main"><section class="w3-screen ${options.className || ""}">${content}</section></main>
      <footer class="w3-footer">
        <button class="w3-back" type="button" data-w5-action="back" ${canBack ? "" : "disabled"}>Back</button>
        <span>${afterMission ? "AFTER THE MISSION" : `${stage.name} · ${slideNumber} / ${lectureStepCount}`}</span>
        <div class="w3-footer-actions">${options.footer || `<button class="w3-next" type="button" data-w5-action="next">${options.nextLabel || "Continue"}</button>`}</div>
      </footer>
    </div>`;
  }

  function renderStep() {
    clearTimers();
    micStop();
    const state = getState();
    const savedStep = Number(state.currentStep || 0);
    const step = stepOrder.find(item => item >= savedStep) ?? 0;
    if (step !== savedStep) update({ currentStep: step });
    const level = getLevel();
    const levelData = exposure.levels[level - 1];
    let page = "";

    if (step === 0) {
      page = shell(`
        <p class="w3-eyebrow">WEEK 5 · VOCAL VARIETY</p>
        <h1 id="week5PageTitle">Your words carry the meaning.<br /><em>Your melody carries you.</em></h1>
        <div class="w5-hero" aria-label="The sentence 'I cooked for ten people, and they loved it' shown first on one flat note, then with melody.">
          ${melodyLine(["I", "cooked", "for", "ten", "people,", "and", "they", "loved", "it."], [0, -6, 0, -26, -4, -2, 0, 6, 16], "opening-line")}
          <small class="w5-hero-tag" data-w5-hero-tag>ONE NOTE</small>
          <p class="w5-hero-note">Pitch is how high or low your voice goes. Watch the dots: a higher dot is a higher note.</p>
        </div>
        <div class="w3-agenda">${chapters.map((chapter, index) => `<article data-w3-animate style="--i:${index}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${esc(chapter.title)}</strong></article>`).join("")}</div>
      `, { className: "opening w5-opening", nextLabel: "Find the music" });
    } else if (step === 1) {
      const tried = new Set(state.demoTried || []);
      const mode = state.demoMode || "";
      page = shell(`
        <p class="w3-eyebrow">WHY MELODY MATTERS</p>
        <h1 id="week5PageTitle">When voice and words disagree,<br /><em>people believe the voice.</em></h1>
        <article class="w5-demo ${mode}" data-w5-demo>
          <small>SAY IT OUT LOUD BOTH WAYS</small>
          ${melodyLine(["I'm", "really", "excited", "about", "this", "role."], [0, -10, -24, -6, 2, 14], "demo")}
          <div class="w5-meter"><span>LISTENER</span><div><i data-w5-meter></i></div><strong data-w5-meter-label>${mode === "flat" ? "Drifting" : mode === "sung" ? "Leaning in" : "Waiting"}</strong></div>
          <p class="w5-demo-read" data-w5-demo-read aria-live="polite">${mode === "flat" ? "Sounds: unsure, rehearsed, not that excited." : mode === "sung" ? "Sounds: genuinely excited. The words finally match." : "Choose a version, then say it aloud the same way."}</p>
          <div class="w5-toggle"><button type="button" class="${mode === "flat" ? "selected" : ""}" data-w5-demo-mode="flat">One note</button><button type="button" class="${mode === "sung" ? "selected" : ""}" data-w5-demo-mode="sung">With melody</button></div>
        </article>
      `, { className: "w5-why" });
    } else if (step === 2) {
      const choice = state.rapportChoice || "";
      page = shell(`
        <p class="w3-eyebrow">MELODY BUILDS RAPPORT</p>
        <h1 id="week5PageTitle">Same words.<br /><em>Which one feels like you care?</em></h1>
        <article class="w5-rapport">
          <p class="w5-quote"><small>A FRIEND, SMILING</small>"I got the job!"</p>
          <div class="w5-replies">
            <button type="button" class="${choice === "flat" ? "chosen" : ""}" data-w5-rapport="flat" ${choice ? "disabled" : ""}>${contour([22, 22, 23, 22, 22, 23], "flat")}<strong>"That's great news. Well done."</strong><small>REPLY A</small></button>
            <button type="button" class="${choice === "lifted" ? "chosen" : ""}" data-w5-rapport="lifted" ${choice ? "disabled" : ""}>${contour([28, 18, 6, 14, 26, 32], "lifted")}<strong>"That's great news. Well done."</strong><small>REPLY B</small></button>
          </div>
          <p class="w5-rapport-result" data-w5-rapport-result aria-live="polite">${choice ? (choice === "lifted" ? "Reply B. Your pitch rose to meet theirs, so the words sound like you mean them." : "Most of us give Reply A when we are nervous. It sounds polite, not pleased. Reply B rises to meet their energy.") : "Read both replies out loud, following the line. Then pick one."}</p>
        </article>
        <div class="w5-science ${choice ? "in" : ""}" data-w5-science>
          <article><small>WHAT RESEARCH SHOWS</small><p>When two people get along, their voices start to match: similar speed, volume and pitch. People whose voices match like each other more, and the talk feels easier.</p></article>
          <article class="tip"><small>THE RAPPORT MOVE</small><p><strong>Match, then lead.</strong> Meet their energy in your first sentence, then bring your voice to where you want the conversation to go.</p></article>
        </div>
      `, { className: "w5-rapport-screen" });
    } else if (step === 3) {
      const done = state.rangeLow != null || state.rangeSelfCheck;
      const span = state.rangeLow != null ? Math.round(state.rangeHigh - state.rangeLow) : null;
      page = shell(`
        <p class="w3-eyebrow">FIND YOUR RANGE · THE SIREN</p>
        <h1 id="week5PageTitle">You have more notes<br /><em>than you use.</em></h1>
        <article class="w5-range" data-w5-range>
          <div class="w5-range-stage">
            <div class="w5-range-bar"><i class="band" data-w5-range-band style="${span != null ? `bottom:${sirenPlace(state.rangeLow)};top:calc(100% - ${sirenPlace(state.rangeHigh)})` : ""}"></i><i class="dot" data-w5-range-dot></i></div>
            <div class="w5-range-copy">
              <p>Slide on <strong>"ooo"</strong> from your lowest comfortable note up to your highest, then back down. Like a siren. Gentle, never strained.</p>
              <strong class="w5-range-result" data-w5-range-result aria-live="polite">${span != null ? `You reached ${span} notes` : state.rangeSelfCheck ? "Siren done out loud" : "Ready when you are"}</strong>
              <small data-w5-range-sub>${span != null ? "That is the instrument you speak with. Under pressure, most of us use only a narrow slice of it." : "8 seconds · up and down twice"}</small>
            </div>
          </div>
          ${micFallbackNote()}
          <div class="w5-actions">
            ${micSupported() ? `<button type="button" class="w5-primary" data-w5-action="siren">${done ? "Measure again" : "Start the siren"}</button>` : ""}
            <button type="button" class="w5-quiet" data-w5-action="siren-self">${micSupported() ? "No mic? I did it out loud" : "I did the siren out loud"}</button>
          </div>
        </article>
        <p class="w3-coach-note">Your microphone is only used live on this page. Nothing is recorded or saved except the size of your range.</p>
      `, { className: "w5-range-screen" });
    } else if (step === 4) {
      page = shell(`
        <p class="w3-eyebrow">FOUR PITCH MOVES</p>
        <h1 id="week5PageTitle">Melody is not singing.<br /><em>It is four small moves.</em></h1>
        <div class="w5-moves">${moves.map((move, index) => `<button type="button" class="w5-move ${move.id}" data-w5-move="${move.id}" data-w3-animate style="--i:${index}">
          <small>0${index + 1}</small><h2>${esc(move.name)}</h2>
          ${contour(move.points)}
          <p>${esc(move.when)}</p>
          ${melodyLine(move.example, move.ys, "mini sung")}
          <b>Tap · then say it</b>
        </button>`).join("")}</div>
        <blockquote>A monotone is not calm. It is one note.<br /><strong>Calm is a low note you chose.</strong></blockquote>
      `, { className: "w5-moves-screen" });
    } else if (step === 5) {
      const tried = state.stressTried || [];
      const active = tried.length ? tried[tried.length - 1] : -1;
      page = shell(`
        <p class="w3-eyebrow">STEP UP · ONE WORD, NEW MEANING</p>
        <h1 id="week5PageTitle">Move the step.<br /><em>Change the story.</em></h1>
        <article class="w5-stress">
          <p class="w5-stress-line">${stressWords.map((item, index) => `<button type="button" class="${index === active ? "up" : ""} ${tried.includes(index) ? "tried" : ""}" data-w5-stress="${index}">${esc(item.word)}</button>`).join(" ")}</p>
          <p class="w5-stress-meaning" data-w5-stress-meaning aria-live="polite">${active >= 0 ? `"${esc(stressWords[active].meaning)}"` : "Tap a word. Then say the whole sentence, stepping up on it."}</p>
          <div class="w5-stress-count"><span data-w5-stress-count>${Math.min(tried.length, stressWords.length)} / ${stressWords.length}</span> meanings heard · try at least ${stressTarget}</div>
        </article>
        <p class="w3-coach-note">A step is pitch, volume and pace working together: a little higher, a little stronger, a little slower. Everything you trained in Weeks 2 and 3, on a single word.</p>
      `, { className: "w5-stress-screen" });
    } else if (step === 6) {
      const landed = Number(state.landed || 0);
      page = shell(`
        <p class="w3-eyebrow">LAND · SOUND LIKE YOU'VE DECIDED</p>
        <h1 id="week5PageTitle">A rising end asks permission.<br /><em>A falling end gives an answer.</em></h1>
        <article class="w5-land" data-w5-land>
          <div class="w5-land-shapes">
            <div class="up">${contour([24, 22, 24, 20, 12, 2])}<small>RISING END · sounds like a question</small></div>
            <div class="down">${contour([20, 14, 18, 16, 26, 40])}<small>LANDED · sounds like a decision</small></div>
          </div>
          <p class="w5-land-sentence">"${esc(landSentence)}"</p>
          <canvas class="w5-trace" data-w5-trace aria-hidden="true"></canvas>
          <p class="w5-feedback ${landed ? "good" : ""}" data-w5-land-feedback role="status">${landed ? `Landed ${landed}×. That is the sound of certainty.` : "Say it once as a question. Then say it again and let the last word fall."}</p>
          ${micFallbackNote()}
          <div class="w5-actions">
            ${micSupported() ? `<button type="button" class="w5-primary" data-w5-action="land-record">${landed ? "Try again" : "Listen to me say it"}</button>` : ""}
            <button type="button" class="w5-quiet" data-w5-action="land-self">${micSupported() ? "No mic? I landed it 3 times" : "I landed it 3 times out loud"}</button>
          </div>
        </article>
        <p class="w3-coach-note">In interviews, land every statement about yourself. Save rising tones for real questions.</p>
      `, { className: "w5-land-screen" });
    } else if (step === 7) {
      const answers = state.sortAnswers || {};
      page = shell(`
        <p class="w3-eyebrow">MATCH THE MOMENT</p>
        <h1 id="week5PageTitle">Which move<br /><em>fits the moment?</em></h1>
        <div class="w3-sorter w5-sorter">${sortOrder.map(id => sortItems.find(item => item.id === id)).map((item, index) => {
          const chosen = answers[item.id];
          const correct = chosen && chosen === item.answer;
          return `<article class="${chosen ? (correct ? "correct" : "wrong") : ""}" data-w3-animate style="--i:${index}">
            <strong>${esc(item.text)}</strong>
            <div class="w3-sort-buttons">${Object.keys(sortLabels).map(key => `<button type="button" class="${key} ${chosen === key ? "chosen" : ""}" data-w5-sort="${item.id}" data-w5-choice="${key}" ${chosen ? "disabled" : ""}>${sortLabels[key]}</button>`).join("")}</div>
            <small>${chosen ? `${correct ? "Yes." : `${sortLabels[item.answer]}.`} ${esc(item.why)}` : "&nbsp;"}</small>
          </article>`;
        }).join("")}</div>
        <div class="w3-coach-actions"><p class="w3-coach-note">Pitch is how your listener knows what you feel. Choose the move for each moment.</p><button type="button" class="w3-reset-button" data-w5-action="reset-sort">Reset</button></div>
      `);
    } else if (step === 8) {
      const mix = state.mix || {};
      const complete = storyBeats.every(beat => ["pitch", "pace", "volume"].every(dial => mix[beat.id]?.[dial]));
      page = shell(`
        <p class="w3-eyebrow">THE MIXING DESK · WEEKS 2 + 3 + 5</p>
        <h1 id="week5PageTitle">Volume. Pace. Pitch.<br /><em>Now mix all three.</em></h1>
        <div class="w5-desk">${storyBeats.map((beat, index) => {
          const settings = mix[beat.id] || {};
          return `<article class="w5-beat" data-w5-beat="${beat.id}" data-w3-animate style="--i:${index}">
            <header><small>${String(index + 1).padStart(2, "0")} · ${esc(beat.label)}</small></header>
            <p class="w5-beat-text pitch-${settings.pitch || "mid"} pace-${settings.pace || "none"} vol-${settings.volume || "none"}">${esc(beat.text)}</p>
            ${Object.keys(mixOptions).map(dial => `<div class="w5-dial" role="group" aria-label="${dial} for ${esc(beat.label)}"><span>${dial.toUpperCase()}</span>${mixOptions[dial].map(([value, label]) => `<button type="button" class="${settings[dial] === value ? "on" : ""}" data-w5-mix="${beat.id}" data-w5-dial="${dial}" data-w5-value="${value}">${esc(label)}</button>`).join("")}</div>`).join("")}
            <p class="w5-coach-mix" ${complete ? "" : "hidden"}><b>Coach's mix:</b> ${esc(mixLabel("pitch", beat.coach.pitch))} · ${esc(mixLabel("pace", beat.coach.pace))} · ${esc(mixLabel("volume", beat.coach.volume))}. ${esc(beat.why)}</p>
          </article>${beat.pauseAfter ? '<div class="w5-desk-pause" aria-label="pause">‖ PAUSE</div>' : ""}`;
        }).join("")}</div>
        <div class="w5-actions"><button type="button" class="w5-primary" data-w5-action="play-mix" ${complete ? "" : "disabled"}>▶ Preview my mix</button><span class="w5-mix-status" data-w5-mix-status aria-live="polite">${complete ? "Compare with the coach's mix. Yours is allowed to differ." : "Choose pitch, pace and volume for all four parts."}</span></div>
      `, { className: "w5-desk-screen" });
    } else if (step === 9) {
      const mix = state.mix || {};
      const span = state.performSpan;
      page = shell(`
        <p class="w3-eyebrow">PERFORM · READ ALOUD WITH YOUR MIX</p>
        <h1 id="week5PageTitle">Tell it like it happened.<br /><em>Watch your melody move.</em></h1>
        <div class="w5-perform">
          <div class="w5-script">${storyBeats.map(beat => {
            const settings = mix[beat.id] || beat.coach;
            return `<p class="pitch-${settings.pitch}"><span class="w5-chips"><i>${esc(mixLabel("pitch", settings.pitch))}</i><i>${esc(mixLabel("pace", settings.pace))}</i><i>${esc(mixLabel("volume", settings.volume))}</i></span>${esc(beat.text)}</p>${beat.pauseAfter ? '<span class="w5-script-pause">‖ hold the silence</span>' : ""}`;
          }).join("")}</div>
          <aside class="w5-meter-panel">
            <small>YOUR MELODY</small>
            <canvas class="w5-trace tall" data-w5-trace aria-hidden="true"></canvas>
            <strong class="w5-span" data-w5-span>${span != null ? `${span} notes` : state.performSelfCheck ? "Read aloud" : "—"}</strong>
            <p class="w5-feedback" data-w5-perform-feedback role="status">${span != null ? spanFeedback(span) : "Press start, read the story aloud, then press stop."}</p>
            ${micFallbackNote()}
            <div class="w5-actions column">
              ${micSupported() ? `<button type="button" class="w5-primary" data-w5-action="perform">${span != null ? "Read it again" : "Start reading"}</button>` : ""}
              <button type="button" class="w5-quiet" data-w5-action="perform-self">${micSupported() ? "No mic? I read it aloud" : "I read it aloud"}</button>
            </div>
          </aside>
        </div>
      `, { className: "w5-perform-screen" });
    } else if (step === 11) {
      const mission = state.mission || missionTemplates[level - 1];
      page = shell(`
        <p class="w3-eyebrow">CHOOSE THE RIGHT-SIZED MISSION</p>
        <h1 id="week5PageTitle">One real conversation.<br /><em>One deliberate melody.</em></h1>
        <div class="w3-level-picker" role="group" aria-label="Exposure level">${exposure.levels.map((item, index) => `<button type="button" class="${index + 1 === level ? "selected" : ""}" data-w5-level="${index + 1}"><span>${index + 1}</span><small>${esc(item.name)}</small></button>`).join("")}</div>
        <div class="w3-level-focus"><small>LEVEL ${level} · SITUATION</small><h2>${esc(levelData.name)}</h2><p>${esc(levelData.behavior)}</p></div>
        <label class="w3-mission-edit"><span>YOUR WEEK 5 CHALLENGE</span><textarea data-w5-mission rows="2">${esc(mission)}</textarea></label>
        <div class="w3-win-line"><small>WIN CONDITION</small><strong>I used at least one deliberate pitch move: a step up, a lift, or a landed ending.</strong></div>
      `, { footer: '<button class="w3-next mission-accept" type="button" data-w5-action="accept-mission">Accept mission</button>' });
    } else if (step === 12) {
      page = shell(`
        <p class="w3-eyebrow">LECTURE 5 COMPLETE</p>
        <h1 id="week5PageTitle">Your voice has a melody.<br /><em>Your mission is active.</em></h1>
        <article class="w3-mission-mini active"><small>YOUR WEEK 5 MISSION</small><p>${esc(state.mission)}</p><strong>Win with one deliberate pitch move.</strong></article>
        <div class="w3-leave-plan"><article><span>01</span><strong>Leave the lecture</strong><p>Step, lift, drop and land. Bring one of them into a real conversation.</p></article><article><span>02</span><strong>Attempt the mission</strong><p>If it feels theatrical to you, it probably sounds natural to them.</p></article><article><span>03</span><strong>Return with reality</strong><p>Use "Report mission" in your portal.</p></article></div>
        <blockquote>The lecture ends here.<br /><strong>The evidence begins the first time someone hears how you feel.</strong></blockquote>
      `, { footer: '<button class="w3-next" type="button" data-w5-action="close">Return to my portal</button>' });
    } else if (step === 13) {
      page = shell(`
        <p class="w3-eyebrow">WELCOME BACK</p>
        <h1 id="week5PageTitle">Did you let<br /><em>the melody through?</em></h1>
        <p class="w3-lede">The win is the attempt. Nothing else is required.</p>
        <article class="w3-mission-mini"><small>YOUR MISSION</small><p>${esc(state.mission)}</p></article>
        <div class="w3-did-it"><button type="button" data-w5-action="mission-not-yet"><span>NOT YET</span><small>Save and return later</small></button><button type="button" class="yes" data-w5-action="mission-yes"><span>YES</span><small>I attempted it</small></button></div>
      `, { lockBack: true, footer: '<span class="w3-footer-hint">Your mission stays active until you attempt it.</span>' });
    } else if (step === 14) {
      page = shell(`
        <p class="w3-eyebrow">REALITY CHECK</p>
        <h1 id="week5PageTitle">What actually happened?</h1>
        <p class="w3-lede">One short answer. No report and no long reflection.</p>
        <div class="w3-input-card">
          <textarea data-w5-result rows="3" placeholder="I landed my last sentence when I introduced my work. It sounded more certain, and they asked a follow-up question…">${esc(state.actualResult)}</textarea>
        </div>
      `, { lockBack: true, footer: '<button class="w3-next" type="button" data-w5-action="collect-evidence">Collect evidence</button>' });
    } else {
      const evidence = (portal.getState().evidence || []).find(item => item.id === state.evidenceId);
      page = shell(`
        <p class="w3-eyebrow">WEEK 5 COMPLETE</p>
        <h1 id="week5PageTitle">They heard the words.<br /><em>Now they hear you.</em></h1>
        <div class="w3-completion-stats"><article><small>SKILL UNLOCKED</small><strong>Vocal Variety</strong></article><article><small>PITCH MOVES</small><strong>Step · Lift · Drop · Land</strong></article><article><small>EXPOSURE</small><strong>Level ${state.missionLevel || level}</strong></article><article><small>EVIDENCE COLLECTED</small><strong>1</strong></article></div>
        <article class="w3-evidence-card"><header><small>EVIDENCE COLLECTED</small><span>WEEK 5</span></header><div><small>YOUR MISSION</small><p>${esc(evidence?.action || state.mission)}</p></div><div><small>WHAT HAPPENED</small><p>${esc(evidence?.result || state.actualResult)}</p></div></article>
        <div class="w3-week-progress">${[1, 2, 3, 4, 5].map(number => `<span class="complete">W${number} <i>●</i></span>`).join("")}<span>W6 <i>○</i></span></div>
        <div class="w3-next-week"><small>NEXT</small><strong>Lecture 6: tell stories that move people.</strong></div>
      `, { lockBack: true, footer: '<button class="w3-next" type="button" data-w5-action="close">Return to my portal</button>' });
    }

    root.innerHTML = page;
    document.body.classList.add("week5-open");
    requestAnimationFrame(() => {
      root.querySelectorAll("[data-w3-animate]").forEach(el => el.classList.add("in"));
      if (step === 0) playHero();
      if (step === 1 && getState().demoMode) setDemo(getState().demoMode, false);
      if (step === 6 || step === 9) { const canvas = root.querySelector("[data-w5-trace]"); if (canvas) traceView(canvas, ...rangeWindow()).draw(); }
      root.querySelector("textarea, input, button:not([disabled])")?.focus({ preventScroll: true });
    });
  }

  function spanFeedback(span) {
    if (span < 5) return "Mostly one note so far. Exaggerate the moves. What feels theatrical to you sounds natural to them.";
    if (span < 8) return "The melody is arriving. Push the step-ups further on your key words.";
    return "That is music. Your voice moved with the story.";
  }

  /* ---------- opening: one note becomes a melody ---------- */
  function playHero() {
    const line = root.querySelector(".w5-melody.opening-line");
    const tag = root.querySelector("[data-w5-hero-tag]");
    if (!line) return;
    const cycle = () => {
      line.classList.remove("sung"); if (tag) tag.textContent = "ONE NOTE";
      later(() => { line.classList.add("sung"); if (tag) tag.textContent = "WITH MELODY"; }, 1800);
      later(cycle, 6200);
    };
    cycle();
  }

  /* ---------- slide 1: flat vs melody ---------- */
  function setDemo(mode, save = true) {
    const card = root.querySelector("[data-w5-demo]");
    if (!card) return;
    card.classList.remove("flat", "sung");
    void card.offsetWidth;
    card.classList.add(mode);
    card.querySelector(".w5-melody").classList.toggle("sung", mode === "sung");
    root.querySelectorAll("[data-w5-demo-mode]").forEach(button => button.classList.toggle("selected", button.dataset.w5DemoMode === mode));
    root.querySelector("[data-w5-meter-label]").textContent = mode === "flat" ? "Drifting" : "Leaning in";
    root.querySelector("[data-w5-demo-read]").textContent = mode === "flat" ? "Sounds: unsure, rehearsed, not that excited." : "Sounds: genuinely excited. The words finally match.";
    if (!save) return;
    const tried = [...new Set([...(getState().demoTried || []), mode])];
    update({ demoMode: mode, demoTried: tried });
  }

  /* ---------- slide 3: siren range finder ---------- */
  async function runSiren(button) {
    const dot = root.querySelector("[data-w5-range-dot]");
    const band = root.querySelector("[data-w5-range-band]");
    const result = root.querySelector("[data-w5-range-result]");
    const sub = root.querySelector("[data-w5-range-sub]");
    const values = [];
    const place = sirenPlace;
    button.disabled = true;
    try {
      await micStart(st => {
        if (st == null) { dot.classList.remove("live"); return; }
        values.push(st);
        dot.classList.add("live");
        dot.style.bottom = place(st);
        if (values.length > 6) {
          band.style.bottom = place(percentile(values, 0.05));
          band.style.top = `calc(100% - ${place(percentile(values, 0.95))})`;
        }
      });
    } catch {
      button.disabled = false;
      result.textContent = "Microphone not available";
      sub.textContent = "Allow microphone access, or use the self-check button.";
      return;
    }
    let left = 8;
    result.textContent = "Siren… 8";
    sub.textContent = "Lowest to highest, and back down.";
    const tick = () => {
      left -= 1;
      if (left > 0) { result.textContent = `Siren… ${left}`; later(tick, 1000); return; }
      micStop();
      dot.classList.remove("live");
      button.disabled = false;
      button.textContent = "Measure again";
      if (values.length < 15) {
        result.textContent = "I couldn't hear enough";
        sub.textContent = "Move closer to the microphone and sustain the \"ooo\".";
        return;
      }
      const low = percentile(values, 0.05), high = percentile(values, 0.95);
      const span = Math.round(high - low);
      update({ rangeLow: Number(low.toFixed(1)), rangeHigh: Number(high.toFixed(1)) });
      result.textContent = `You reached ${span} notes`;
      sub.textContent = "That is the instrument you speak with. Under pressure, most of us use only a narrow slice of it.";
      portal.showToast(`You reached ${span} notes. Let's use more of them.`);
    };
    later(tick, 1000);
  }

  /* ---------- slide 6: land it ---------- */
  async function recordLanding(button) {
    const canvas = root.querySelector("[data-w5-trace]");
    const feedback = root.querySelector("[data-w5-land-feedback]");
    const view = traceView(canvas, ...rangeWindow());
    let voiced = 0, silentSince = null;
    const started = performance.now();
    button.disabled = true;
    feedback.className = "w5-feedback";
    feedback.textContent = "Listening… say the sentence now.";
    const finish = () => {
      micStop();
      button.disabled = false;
      button.textContent = "Try again";
      const series = smooth(view.points).filter(st => st != null);
      if (series.length < 12) { feedback.textContent = "I couldn't hear enough. Speak a little closer to the microphone."; return; }
      const middle = percentile(series.slice(Math.floor(series.length * 0.3), Math.floor(series.length * 0.75)), 0.5);
      const ending = percentile(series.slice(Math.floor(series.length * 0.82)), 0.5);
      const change = ending - middle;
      if (change <= -1) {
        const landed = Number(getState().landed || 0) + 1;
        update({ landed });
        feedback.className = "w5-feedback good";
        feedback.textContent = "Landed ↘ Your voice went down at the end. That sounds sure.";
        if (landed === 1) portal.showToast("Landed. That is the sound of certainty.");
      } else if (change >= 1) {
        feedback.className = "w5-feedback soon";
        feedback.textContent = "Rose ↗ at the end. It sounded like a question. Let \"Monday\" go down this time.";
      } else {
        feedback.className = "w5-feedback soon";
        feedback.textContent = "Level ending. Close to landing. Drop the last word a little lower.";
      }
    };
    try {
      await micStart(st => {
        view.push(st);
        const now = performance.now();
        if (st != null) { voiced += 1; silentSince = null; }
        else if (voiced > 8 && silentSince == null) silentSince = now;
        if ((silentSince && now - silentSince > 900) || now - started > 8000) finish();
      });
    } catch {
      button.disabled = false;
      feedback.textContent = "Microphone not available. Allow access, or use the self-check button.";
    }
  }

  /* ---------- slide 8: preview the mix ---------- */
  function playMix(button) {
    clearTimers();
    const status = root.querySelector("[data-w5-mix-status]");
    const mix = getState().mix || {};
    button.disabled = true;
    let offset = 200;
    storyBeats.forEach(beat => {
      const card = root.querySelector(`[data-w5-beat="${beat.id}"]`);
      const text = card.querySelector(".w5-beat-text");
      const words = beat.text.split(" ");
      const perWord = mix[beat.id]?.pace === "slow" ? 430 : 170;
      later(() => {
        root.querySelectorAll(".w5-beat").forEach(el => el.classList.remove("playing"));
        card.classList.add("playing");
        card.scrollIntoView({ block: "nearest", behavior: "smooth" });
        text.innerHTML = words.map(word => `<span>${esc(word)}</span>`).join(" ");
        status.textContent = `${beat.label.toLowerCase()} · ${mixLabel("pitch", mix[beat.id].pitch)}, ${mixLabel("pace", mix[beat.id].pace).toLowerCase()}, ${mixLabel("volume", mix[beat.id].volume).toLowerCase()}`;
      }, offset);
      words.forEach((_, index) => later(() => text.children[index]?.classList.add("said"), offset + 120 + index * perWord));
      offset += 120 + words.length * perWord + 500;
      if (beat.pauseAfter) {
        later(() => { status.textContent = "‖ pause"; root.querySelector(".w5-desk-pause")?.classList.add("playing"); }, offset);
        offset += 1600;
        later(() => root.querySelector(".w5-desk-pause")?.classList.remove("playing"), offset);
      }
    });
    later(() => {
      root.querySelectorAll(".w5-beat").forEach(el => el.classList.remove("playing"));
      button.disabled = false;
      button.textContent = "▶ Preview again";
      status.textContent = "Now it's your turn to perform it.";
    }, offset);
  }

  /* ---------- slide 9: perform the story ---------- */
  async function performStory(button) {
    if (mic.stream) {
      micStop();
      const canvas = root.querySelector("[data-w5-trace]");
      return finishPerformance(button, canvas?._view);
    }
    const canvas = root.querySelector("[data-w5-trace]");
    const view = traceView(canvas, ...rangeWindow());
    canvas._view = view;
    const feedback = root.querySelector("[data-w5-perform-feedback]");
    const spanEl = root.querySelector("[data-w5-span]");
    try {
      await micStart(st => {
        view.push(st);
        const series = view.points.filter(item => item != null);
        if (series.length > 20 && series.length % 10 === 0) spanEl.textContent = `${Math.round(percentile(series, 0.9) - percentile(series, 0.1))} notes`;
      });
    } catch {
      feedback.textContent = "Microphone not available. Allow access, or use the self-check button.";
      return;
    }
    button.textContent = "Stop";
    button.classList.add("recording");
    feedback.className = "w5-feedback";
    feedback.textContent = "Read the story aloud. Follow your mix.";
    later(() => { if (mic.stream) finishPerformance(button, view, true); }, 75000);
  }

  function finishPerformance(button, view, timedOut = false) {
    micStop();
    button.classList.remove("recording");
    button.textContent = "Read it again";
    const feedback = root.querySelector("[data-w5-perform-feedback]");
    const spanEl = root.querySelector("[data-w5-span]");
    const series = smooth(view?.points || []).filter(st => st != null);
    if (series.length < 40) {
      feedback.textContent = "I couldn't hear enough of the story. Try reading it in full, a little closer to the microphone.";
      return;
    }
    const span = Math.round(percentile(series, 0.9) - percentile(series, 0.1));
    const state = getState();
    const range = state.rangeLow != null ? state.rangeHigh - state.rangeLow : null;
    update({ performSpan: span, performBest: Math.max(span, Number(state.performBest || 0)) });
    spanEl.textContent = `${span} notes`;
    feedback.className = `w5-feedback ${span >= 5 ? "good" : "soon"}`;
    feedback.textContent = `${spanFeedback(span)}${range ? ` You used about ${Math.min(100, Math.round((span / range) * 100))}% of the range you found with the siren.` : ""}${timedOut ? " (Stopped automatically.)" : ""}`;
  }

  function validateAndNext() {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const mix = state.mix || {};
    const requirements = {
      1: [(state.demoTried || []).length >= 2, "Try both versions out loud first."],
      2: [state.rapportChoice, "Pick the reply that feels like you care."],
      3: [state.rangeLow != null || state.rangeSelfCheck, "Find your range with the siren first."],
      5: [(state.stressTried || []).length >= stressTarget, `Step up on at least ${stressTarget} different words.`],
      6: [Number(state.landed || 0) >= 1 || state.landSelfCheck, "Land the sentence at least once."],
      8: [storyBeats.every(beat => ["pitch", "pace", "volume"].every(dial => mix[beat.id]?.[dial])), "Choose pitch, pace and volume for all four parts."],
      9: [state.performSpan != null || state.performSelfCheck, "Read the story aloud first."],
      11: [state.mission || missionTemplates[getLevel() - 1], "Choose one small mission."]
    };
    if (requirements[step] && !requirements[step][0]) {
      portal.showToast(requirements[step][1]);
      return;
    }
    update({ currentStep: stepOrder[Math.min(stepOrder.indexOf(12), stepOrder.indexOf(step) + 1)], lastViewedAt: new Date().toISOString() });
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
    micStop();
    update({ lastViewedAt: new Date().toISOString() });
    root.innerHTML = "";
    document.body.classList.remove("week5-open");
    portal.renderAll();
    previousFocus?.focus?.();
  }

  function collectEvidence() {
    const state = getState();
    if (!String(state.actualResult || "").trim()) {
      portal.showToast("Add one short sentence about what actually happened.");
      root.querySelector("[data-w5-result]")?.focus();
      return;
    }
    const id = state.evidenceId || `week5-${Date.now()}`;
    const card = {
      id,
      week: 5,
      skill: "Vocal variety",
      prediction: state.prediction,
      reality: state.actualResult,
      level: Number(state.missionLevel || getLevel()),
      mission: state.mission,
      completedAt: new Date().toISOString()
    };
    portal.saveEvidence(card);
    update({ evidenceId: id, completedAt: card.completedAt, currentStep: 15 });
    portal.showToast("Melody evidence collected.");
    renderStep();
  }

  root.addEventListener("click", event => {
    const actionEl = event.target.closest("[data-w5-action]");
    const action = actionEl?.dataset.w5Action;
    if (action === "close") return close();
    if (action === "reset") { clearTimers(); if (portal.resetLecture(5)) renderStep(); return; }
    if (action === "back") return back();
    if (action === "next") return validateAndNext();
    if (action === "siren") return runSiren(actionEl);
    if (action === "siren-self") { update({ rangeSelfCheck: true }); return renderStep(); }
    if (action === "land-record") return recordLanding(actionEl);
    if (action === "land-self") { update({ landSelfCheck: true }); portal.showToast("Good. Keep landing every statement about yourself."); return; }
    if (action === "play-mix") return playMix(actionEl);
    if (action === "perform") return performStory(actionEl);
    if (action === "perform-self") { update({ performSelfCheck: true }); portal.showToast("Story performed. Now build your own."); return; }
    if (action === "reset-sort") { update({ sortAnswers: {} }); return renderStep(); }
    if (action === "accept-mission") {
      const state = getState();
      const level = getLevel();
      update({ mission: state.mission || missionTemplates[level - 1], missionLevel: level, missionStatus: "accepted", acceptedAt: new Date().toISOString(), lectureCompletedAt: new Date().toISOString(), currentStep: 12 });
      portal.showToast("Mission accepted. One deliberate pitch move is the win.");
      return renderStep();
    }
    if (action === "mission-not-yet") return close();
    if (action === "mission-yes") { update({ missionStatus: "completed", currentStep: 14 }); return renderStep(); }
    if (action === "collect-evidence") return collectEvidence();

    const demo = event.target.closest("[data-w5-demo-mode]");
    if (demo) return setDemo(demo.dataset.w5DemoMode);

    const reply = event.target.closest("[data-w5-rapport]");
    if (reply) { update({ rapportChoice: reply.dataset.w5Rapport }); return renderStep(); }

    const move = event.target.closest("[data-w5-move]");
    if (move) {
      move.classList.remove("replay");
      void move.offsetWidth;
      move.classList.add("replay");
      return;
    }

    const stress = event.target.closest("[data-w5-stress]");
    if (stress) {
      const index = Number(stress.dataset.w5Stress);
      const tried = [...(getState().stressTried || []).filter(item => item !== index), index];
      update({ stressTried: tried });
      root.querySelectorAll("[data-w5-stress]").forEach(button => {
        button.classList.toggle("up", button === stress);
        if (tried.includes(Number(button.dataset.w5Stress))) button.classList.add("tried");
      });
      const meaning = root.querySelector("[data-w5-stress-meaning]");
      meaning.classList.remove("in"); void meaning.offsetWidth; meaning.classList.add("in");
      meaning.textContent = `"${stressWords[index].meaning}"`;
      root.querySelector("[data-w5-stress-count]").textContent = `${tried.length} / ${stressWords.length}`;
      if (tried.length === stressTarget) portal.showToast("One sentence, many meanings. Pitch decides which one they hear.");
      return;
    }

    const sort = event.target.closest("[data-w5-sort]");
    if (sort) {
      const answers = { ...(getState().sortAnswers || {}) };
      const item = sortItems.find(entry => entry.id === sort.dataset.w5Sort);
      const chosen = sort.dataset.w5Choice;
      const correct = chosen === item.answer;
      answers[item.id] = chosen;
      update({ sortAnswers: answers });
      const card = sort.closest("article");
      card.classList.add(correct ? "correct" : "wrong");
      card.querySelectorAll("[data-w5-sort]").forEach(button => { button.disabled = true; button.classList.toggle("chosen", button === sort); });
      card.querySelector("small").textContent = `${correct ? "Yes." : `${sortLabels[item.answer]}.`} ${item.why}`;
      return;
    }

    const dial = event.target.closest("[data-w5-mix]");
    if (dial) {
      const mix = JSON.parse(JSON.stringify(getState().mix || {}));
      const beat = dial.dataset.w5Mix;
      mix[beat] = { ...(mix[beat] || {}), [dial.dataset.w5Dial]: dial.dataset.w5Value };
      update({ mix });
      const card = dial.closest(".w5-beat");
      dial.parentElement.querySelectorAll("button").forEach(button => button.classList.toggle("on", button === dial));
      const settings = mix[beat];
      card.querySelector(".w5-beat-text").className = `w5-beat-text pitch-${settings.pitch || "mid"} pace-${settings.pace || "none"} vol-${settings.volume || "none"}`;
      const complete = storyBeats.every(item => ["pitch", "pace", "volume"].every(key => mix[item.id]?.[key]));
      if (complete) {
        root.querySelectorAll(".w5-coach-mix").forEach(el => { el.hidden = false; });
        const play = root.querySelector('[data-w5-action="play-mix"]');
        if (play.disabled && !timers.length) play.disabled = false;
        root.querySelector("[data-w5-mix-status]").textContent = "Compare with the coach's mix. Yours is allowed to differ.";
      }
      return;
    }

    const levelButton = event.target.closest("[data-w5-level]");
    if (levelButton) {
      const level = exposure.clampLevel(levelButton.dataset.w5Level);
      portal.setExposureLevel(level);
      update({ currentLevel: level, mission: missionTemplates[level - 1], missionLevel: null });
      return renderStep();
    }
  });

  root.addEventListener("input", event => {
    if (event.target.matches("[data-w5-mission]")) update({ mission: event.target.value });
    else if (event.target.matches("[data-w5-result]")) update({ actualResult: event.target.value });
  });

  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-week5-reflection]")) {
      previousFocus = document.activeElement;
      update({ currentStep: 13 });
      return renderStep();
    }
    if (!event.target.closest("[data-open-week5-lecture]")) return;
    previousFocus = document.activeElement;
    renderStep();
  });

  document.addEventListener("keydown", event => {
    if (!document.body.classList.contains("week5-open")) return;
    if (event.key === "Escape") close();
  });
})();
