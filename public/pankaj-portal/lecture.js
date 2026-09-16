(function () {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const exposure = window.SpeakersGymExposure;
  const root = document.querySelector("#lectureRoot");
  if (!portal || !exposure || !root) return;

  const chapters = [
    { title: "Understand what your voice signals", steps: [6, 7, 2, 3] },
    { title: "Build a strong, supported voice", steps: [4, 5] },
    { title: "One answer. One adjustment.", steps: [9, 10, 11] },
    { title: "Name the prediction. Test it.", steps: [12, 13, 14] },
    { title: "Choose one audible moment", steps: [15, 16, 17] }
  ];

  const missionTemplates = [
    "Record one 60-second PREP answer in the Speaker's Gym app at your ideal 7/10 volume.",
    "Post one 60-second audio speech in the community Speech channel and keep a steady 7/10 volume through the final sentence.",
    "Post one 60-second video speech in the community Speech channel using a supported 7/10 volume and a fully audible ending.",
    "Speak with a colleague in a familiar one-to-one conversation and deliver one clear opinion or recommendation at your ideal 7/10 volume.",
    "Share one structured idea or short story with two to four familiar people at a volume that comfortably reaches everyone.",
    "Contribute once in a routine meeting at your ideal 7/10 volume with a fully audible ending.",
    "Answer one unplanned workplace question in 45 to 90 seconds while keeping your voice supported at 7/10 as you think.",
    "Lead a three to five-minute workplace update with room-filling 7/10 projection, no more than three supporting points and a clear next step.",
    "Answer one unexpected management question in 45 to 90 seconds without shrinking your volume or rushing the conclusion.",
    "Present one recommendation in a meaningful management or client meeting with calibrated 7/10 projection, relevant evidence and a clear next step."
  ];

  const voicePatterns = [
    { id: "quiet", label: "I become too quiet", note: "The listener has to work to hear me." },
    { id: "fade", label: "My endings disappear", note: "I begin clearly, then lose the final words." },
    { id: "push", label: "I push from my throat", note: "I try to sound louder and become tense." }
  ];

  // Keep stored step IDs stable while placing two new teaching screens after Slide 2.
  const lectureFlow = [0, 1, 6, 7, 2, 3, 4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const mergedPracticeStep = 5;
  const retiredSteps = [8];
  const missionFollowUpStep = 18;
  const lectureStepCount = lectureFlow.length;
  const lastStep = 20;
  let previousFocus = null;
  let timer = null;

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
      ["P", "POINT", material.keywords.point],
      ["R", "REASON", material.keywords.reason],
      ["E", "EXAMPLE", material.keywords.example],
      ["P", "FINAL POINT", material.keywords.finalPoint]
    ];
    return `<div class="w2-prep-guide" aria-label="PREP speaking guide">${items.map((item, index) => `<article style="--cue-order:${index}"><span>${item[0]}</span><div><small>${item[1]}</small><strong>${esc(item[2])}</strong></div><em>${index === 3 ? "Land the ending" : "Pause · breathe if needed"}</em></article>`).join("")}</div>
      <details class="w2-prep-example"><summary>See the complete PREP example</summary>
        <p class="w2-example-note">Practice example: a habit that improves your day · Read once. Close it. Speak from keywords.</p>
        <div>${items.map((item, index) => `<article><small>${item[1]}</small>${endingSentence(material.sentences[index])}<span class="w2-pause-cue">${index === 3 ? "● Finish. Let it land." : "Ⅱ Pause. Breathe if needed."}</span></article>`).join("")}</div>
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
    const afterMission = step >= missionFollowUpStep;
    const flowIndex = lectureFlow.indexOf(step);
    const slideNumber = flowIndex >= 0 ? flowIndex + 1 : lectureStepCount;
    const canBack = step > 0;
    const progress = Math.round((Math.min(lectureStepCount, slideNumber) / lectureStepCount) * 100);
    const chapterLabel = step <= 1 ? "YOUR FIVE OUTCOMES" : afterMission ? "MISSION FOLLOW-UP" : "WEEK 2";
    const chapterTitle = chapter?.title || (step <= 1 ? "Develop a Stronger Voice" : "Turn experience into evidence");

    return `<div class="week2-page" role="dialog" aria-modal="true" aria-labelledby="lecturePageTitle">
      <header class="w2-header">
        <div class="w2-brand"><img src="Logo.png?v=pankaj-lecture-v1" alt="" /><div><small>THE SPEAKER'S GYM</small><strong>WEEK 2 · DEVELOP A STRONGER VOICE</strong></div></div>
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

  function renderStep() {
    clearInterval(timer);
    timer = null;
    const state = getState();
    const step = Number(state.currentStep || 0);
    // Resume retired sentence drills at the single combined exercise.
    if (retiredSteps.includes(step)) {
      update({ currentStep: mergedPracticeStep });
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
        <p class="w2-eyebrow">WHY PROJECTION MATTERS</p>
        <h1>Your voice carries more<br />than your words.</h1>
        <div class="w2-voice-signal">
          <article class="quiet"><header><span>3/10</span><small>WHEN THE VOICE SHRINKS</small></header><div class="w2-mini-wave"><i></i><i></i><i></i><i></i><i></i></div><p>The listener may read hesitation, shyness or self-doubt, even when your idea is strong.</p></article>
          <div class="w2-signal-shift" aria-hidden="true"><span>PROJECT</span><i>→</i></div>
          <article class="present"><header><span>7/10</span><small>WHEN THE VOICE ARRIVES</small></header><div class="w2-mini-wave"><i></i><i></i><i></i><i></i><i></i></div><p>Your idea is easier to follow, carries more weight and can strengthen impressions of confidence, presence and respect.</p></article>
        </div>
        <blockquote>Your voice is part of your personality.<br /><strong>Make your expertise audible.</strong></blockquote>
      `, { className: "w2-why-volume", nextLabel: "Build a stronger voice" });
    } else if (step === 7) {
      page = shell(`
        <p class="w2-eyebrow">BUILD THE VOICE, DO NOT FORCE IT</p>
        <h1>Three habits make<br />projection sustainable.</h1>
        <div class="w2-strong-voice">
          <article><span>01</span><div class="w2-tip-icon breath" aria-hidden="true"><i></i><i></i><i></i></div><small>BREATH</small><h2>Support the sound.</h2><p>Inhale low and quietly. Speak on a steady exhale so the throat does not have to push.</p></article>
          <article><span>02</span><div class="w2-tip-icon posture" aria-hidden="true"><i></i></div><small>POSTURE</small><h2>Give the voice space.</h2><p>Ground your feet. Lengthen your spine. Release your shoulders, jaw and face.</p></article>
          <article><span>03</span><div class="w2-tip-icon habit" aria-hidden="true"><i></i><i></i><i></i></div><small>HABIT</small><h2>Train a volume ladder.</h2><p>Say one sentence at 3/10, 5/10, 7/10 and 8/10. Treat 7/10 as ideal. Push to 8/10 so 7/10 feels easier and controlled.</p></article>
        </div>
        <div class="w2-projection-formula"><strong>SUPPORTED BREATH</strong><i>+</i><strong>OPEN POSTURE</strong><i>+</i><strong>DAILY REPETITION</strong><span>= STRONGER VOICE</span></div>
        <p class="w2-coach-note">Add melody as volume rises. A louder flat voice can sound aggressive. A supported, varied voice sounds present.</p>
      `, { className: "w2-voice-tips", nextLabel: "Notice my pressure pattern" });
    } else if (step === 2) {
      page = shell(`
        <p class="w2-eyebrow">WHEN PRESSURE RISES</p>
        <h1>Your voice can shrink<br />before your ideas do.</h1>
        <div class="w2-pressure-path"><article><small>01</small><strong>Pressure rises</strong></article><i>→</i><article><small>02</small><strong>The body tightens</strong></article><i>→</i><article><small>03</small><strong>The voice gets smaller</strong></article></div>
        <p class="w2-lede">Your ideas are there. Give them a voice the listener can hear.</p>
      `);
    } else if (step === 3) {
      page = shell(`
        <p class="w2-eyebrow">NOTICE YOUR PATTERN</p>
        <h1>Where does your voice<br />usually disappear?</h1>
        <div class="w2-patterns">${voicePatterns.map(item => `<button type="button" class="${state.voicePattern === item.id ? "selected" : ""}" data-w2-pattern="${item.id}"><strong>${esc(item.label)}</strong><span>${esc(item.note)}</span></button>`).join("")}</div>
        <p class="w2-coach-note">Choose one pattern to train today.</p>
      `);
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
    } else if (step === 5) {
      page = shell(`
        <p class="w2-eyebrow">VOICE PRACTICE · TWO ATTEMPTS</p>
        <h1>Make every word arrive.</h1>
        <article class="w2-calibration-sentence">
          <small>READ ALOUD</small>
          <p>A short walk is a habit that improves <strong>my day.</strong></p>
          <div class="w2-arrival"><article><span>YOU</span><i class="source"></i></article><div><i></i><i></i><i></i><strong>ACROSS THE CALL</strong></div><article><i class="listener"></i><span>LISTENER</span></article></div>
        </article>
        <ol class="w2-attempts" aria-label="Exercise instructions">
          <li><span aria-hidden="true">01</span><div><h2>Say it naturally.</h2><p>Read the sentence at your usual speaking volume.</p></div></li>
          <li><span aria-hidden="true">02</span><div><h2>Say it again.</h2><p>Send it to your listener. Keep “clear your mind” audible.</p></div></li>
        </ol>
        <p class="w2-calibration-note">Keep your microphone position steady. Speak comfortably.</p>
      `, { className: "w2-calibration", nextLabel: "Speak with PREP" });
    } else if (step === 9) {
      page = shell(`
        <p class="w2-eyebrow">VERSION 1 · PROJECTION DRILL</p>
        ${topicChip(material)}
        <h1>PREP gives you the words.<br /><em>Projection delivers them.</em></h1>
        <div class="w2-projection-brief">
          <article><span>01</span><p>Use the four PREP keywords to build a 45 to 60-second answer. Do not read a script.</p></article>
          <article><span>02</span><p>Deliver every PREP section at your ideal 7/10 volume, as if speaking to someone across the room.</p></article>
          <article><span>03</span><p>Keep the final three words of each section fully audible. Do not rush, fade or shout.</p></article>
        </div>
        ${prepGuide(material)}
        <div class="w2-timer"><strong data-w2-timer-display>60</strong><span>seconds</span><button type="button" data-w2-action="timer">Start timer</button></div>
        <p class="w2-coach-note">Listener test: could someone across the room hear every word without strain? PREP is the content. Supported volume is the skill.</p>
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
        <div class="w2-improvement-options"><button type="button" data-w2-improvement-option="Begin one level stronger">Begin one level stronger</button><button type="button" data-w2-improvement-option="Send the sentence to the listener">Send it to the listener</button><button type="button" data-w2-improvement-option="Keep the final words audible">Keep the ending audible</button></div>
      `, { nextLabel: "Speak Version 2" });
    } else if (step === 11) {
      page = shell(`
        <p class="w2-eyebrow">VERSION 2</p>
        ${topicChip(material)}
        <h1>Same message.<br /><em>More of your voice.</em></h1>
        <article class="w2-improvement-banner"><small>YOUR ONE IMPROVEMENT</small><strong>${esc(state.coachImprovement || "Keep the final words audible")}</strong></article>
        ${prepGuide(material)}
        <div class="w2-timer"><strong data-w2-timer-display>60</strong><span>seconds</span><button type="button" data-w2-action="timer">Start timer</button></div>
      `, { footer: '<button class="w2-next" type="button" data-w2-action="complete-v2">Version 2 complete</button>' });
    } else if (step === 12) {
      page = shell(`
        <p class="w2-eyebrow">FROM PRACTICE TO REAL LIFE</p>
        <h1>What changed<br />the second time?</h1>
        <div class="w2-version-result"><article><small>VERSION 1</small><strong>Your natural baseline</strong></article><i>→</i><article><small>ONE CHANGE</small><strong>${esc(state.coachImprovement || "Grounded through the ending")}</strong></article><i>→</i><article class="strong"><small>VERSION 2</small><strong>What sounded clearer?</strong></article></div>
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
        <div class="w2-experiment"><article><small>PREDICTION</small><p>${esc(state.prediction || "What do you predict will happen?")}</p></article><i>↓</i><article><small>MISSION</small><p>Use grounded volume once in a situation that matches your current level.</p></article><i>↓</i><article><small>REALITY</small><p>What actually happened?</p></article></div>
        <div class="w2-equation"><strong>PREDICTION</strong><i>→</i><strong>VOICE EXPOSURE</strong><i>→</i><strong>EVIDENCE</strong></div>
      `);
    } else if (step === 15) {
      const mission = state.mission || missionTemplates[level - 1];
      page = shell(`
        <p class="w2-eyebrow">CHOOSE THE RIGHT-SIZED MISSION</p>
        <h1>One voice skill.<br />The right situation.</h1>
        <p class="w2-lede">Grounded volume is the only new challenge. Your level simply chooses how safe or demanding the situation will be.</p>
        <div class="w2-level-picker" role="group" aria-label="Exposure level">${exposure.levels.map((item, index) => `<button type="button" class="${index + 1 === level ? "selected" : ""}" data-w2-level="${index + 1}"><span>${index + 1}</span><small>${esc(item.name)}</small></button>`).join("")}</div>
        <div class="w2-level-focus"><small>LEVEL ${level} · SITUATION</small><h2>${esc(levelData.name)}</h2><p>${esc(levelData.behavior)}</p></div>
        <label class="w2-mission-edit"><span>YOUR WEEK 2 CHALLENGE</span><textarea data-w2-mission rows="2">${esc(mission)}</textarea></label>
      `, { nextLabel: "Build mission card" });
    } else if (step === 16) {
      const mission = state.mission || missionTemplates[level - 1];
      page = shell(`
        <p class="w2-eyebrow">WEEK 2 MISSION</p>
        <h1>One skill.<br />One audible moment.</h1>
        <article class="w2-mission-card ${state.missionStatus === "accepted" ? "activated" : ""}">
          <div><small>SKILL</small><strong>Grounded Volume</strong></div><div><small>SITUATION</small><strong>Level ${state.missionLevel || level} · ${esc(levelData.name)}</strong></div>
          <section><small>CHALLENGE</small><p>${esc(mission)}</p></section><section><small>YOUR PREDICTION</small><p>“${esc(state.prediction)}”</p></section>
          <section class="win"><small>WIN CONDITION</small><strong>I made one sentence clearly audible.</strong><p>You do not need to feel calm, maintain eye contact or sound perfect.</p></section>
        </article>
      `, { footer: '<button class="w2-next mission-accept" type="button" data-w2-action="accept-mission">Accept mission</button>' });
    } else if (step === 17) {
      page = shell(`
        <p class="w2-eyebrow">LECTURE 2 COMPLETE</p>
        <h1>Your voice is ready.<br /><em>Your mission is active.</em></h1>
        <article class="w2-mission-mini active"><small>YOUR WEEK 2 MISSION</small><p>${esc(state.mission)}</p><strong>Win by making one sentence clearly audible.</strong></article>
        <div class="w2-leave-plan"><article><span>01</span><strong>Leave the lecture</strong><p>Take grounded volume into your week.</p></article><article><span>02</span><strong>Attempt the mission</strong><p>Nervous and imperfect are allowed.</p></article><article><span>03</span><strong>Return with reality</strong><p>Use “Report mission” in your portal.</p></article></div>
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
        <div class="w2-completion-stats"><article><small>SKILL UNLOCKED</small><strong>Grounded Volume</strong></article><article><small>VERSIONS COMPLETED</small><strong>${state.versionsCompleted || 2}</strong></article><article><small>EXPOSURE</small><strong>Level ${state.missionLevel || level}</strong></article><article><small>EVIDENCE COLLECTED</small><strong>1</strong></article></div>
        <article class="w2-evidence-card"><header><small>EVIDENCE COLLECTED</small><span>WEEK 2</span></header><div><small>PREDICTION</small><p>${esc(evidence?.prediction || state.prediction)}</p></div><div><small>REALITY</small><p>${esc(evidence?.reality || state.actualResult)}</p></div><div class="belief"><small>BELIEF</small><strong>${state.beliefBefore}% → ${state.beliefAfter}%</strong></div></article>
        <div class="w2-week-progress"><span class="complete">W1 <i>●</i></span><span class="complete">W2 <i>●</i></span>${[3,4,5,6].map(number => `<span>W${number} <i>○</i></span>`).join("")}</div>
        <div class="w2-next-week"><small>NEXT</small><strong>Make your voice more expressive and engaging.</strong></div>
      `, { footer: '<button class="w2-next" type="button" data-w2-action="close">Return to my portal</button>' });
    }

    root.innerHTML = page;
    root.querySelector("h1")?.setAttribute("id", "lecturePageTitle");
    document.body.classList.add("lecture-open");
    requestAnimationFrame(() => root.querySelector("textarea, input, button")?.focus({ preventScroll: true }));
  }

  function validateAndNext() {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const requirements = {
      3: [state.voicePattern, "Choose the voice pattern that feels closest."],
      10: [state.coachImprovement, "Choose one voice adjustment for Version 2."],
      13: [state.prediction, "Name what you fear might happen if you make yourself heard."],
      15: [state.mission || missionTemplates[getLevel() - 1], "Choose one small mission."]
    };
    if (requirements[step] && !String(requirements[step][0] || "").trim()) {
      portal.showToast(requirements[step][1]);
      root.querySelector("textarea, input, button")?.focus();
      return;
    }
    const flowIndex = lectureFlow.indexOf(step);
    const nextStep = flowIndex >= 0 && flowIndex < lectureFlow.length - 1 ? lectureFlow[flowIndex + 1] : Math.min(lastStep, step + 1);
    const patch = { currentStep: nextStep, lastViewedAt: new Date().toISOString() };
    if (step === 15 && !state.mission) patch.mission = missionTemplates[getLevel() - 1];
    update(patch);
    renderStep();
  }

  function back() {
    const step = Number(getState().currentStep || 0);
    if (step >= missionFollowUpStep) {
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
    clearInterval(timer);
    update({ lastViewedAt: new Date().toISOString() });
    root.innerHTML = "";
    document.body.classList.remove("lecture-open");
    portal.renderAll();
    previousFocus?.focus?.();
  }

  function startTimer(button) {
    clearInterval(timer);
    let remaining = 60;
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
      skill: "Grounded Volume",
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
      update({ mission: state.mission || missionTemplates[level - 1], missionLevel: level, missionStatus: "accepted", acceptedAt: new Date().toISOString(), lectureCompletedAt: new Date().toISOString(), currentStep: 17 });
      portal.showToast("Mission accepted. One audible sentence is the win.");
      return renderStep();
    }
    if (action === "mission-not-yet") return close();
    if (action === "mission-yes") {
      update({ missionStatus: "completed", currentStep: 19 });
      return renderStep();
    }
    if (action === "collect-evidence") return collectEvidence();

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
      update({ mission: missionTemplates[level - 1], missionLevel: null });
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
