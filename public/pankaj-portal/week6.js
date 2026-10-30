(function () {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const exposure = window.SpeakersGymExposure;
  const root = document.querySelector("#week6Root");
  if (!portal || !exposure || !root) return;

  const chapters = [
    { title: "Why Stories Move People", start: 1, end: 2 },
    { title: "Structure + Vocal Variety", start: 4, end: 5 },
    { title: "The Point", start: 9, end: 10 },
    { title: "Tell It and Keep It", start: 11, end: 14 }
  ];

  const stages = [
    { name: "WHY", end: 2 },
    { name: "FORMULA", end: 5 },
    { name: "POINT", end: 10 },
    { name: "TELL", end: 14 },
    { name: "PROVE", end: 16 }
  ];

  // The last week has one final assignment, so there are no exposure levels to choose from.
  const finalAssignment = "Record one final video, 2 minutes long. Tell a story with the who, the when, what happened and the point. Use the vocal variety you learned: volume, pace, pauses and melody.";
  const missionTemplates = exposure.levels.map(() => finalAssignment);

  const skills = [
    { n: 1, name: "Structure", side: "structure", lost: "They get lost. Lots of detail, but no point to hold on to." },
    { n: 2, name: "Volume", side: "voice", lost: "They can’t hear the best part. The key line disappears." },
    { n: 3, name: "Pace", side: "voice", lost: "Everything sounds equally important, so nothing feels important." },
    { n: 4, name: "Pauses", side: "voice", lost: "No suspense. The big moment has no time to land." },
    { n: 5, name: "Melody", side: "voice", lost: "Flat. They hear the words, but they don’t feel them." }
  ];

  const chemicals = [
    { id: "dopamine", name: "Dopamine", nick: "The cliffhanger", moment: "A friend says, “You won’t believe what happened…” and you lean in to hear the rest.", use: "Keep people curious and motivated." },
    { id: "oxytocin", name: "Oxytocin", nick: "The honest friend", moment: "Someone admits they were scared before a big day, and you instantly feel closer to them.", use: "Build trust and connection." },
    { id: "endorphins", name: "Endorphins", nick: "The laugh", moment: "A joke at a family dinner, and everyone relaxes.", use: "Break the ice, fast." }
  ];

  // The four questions every story answers, with the curtain story split by question.
  const fourQs = [
    { id: "who", label: "WHO?", answer: "Me, and the person beside me.", missing: "Who is this about? The listener has no one to follow." },
    { id: "where", label: "WHERE?", answer: "Behind the curtain of a packed hall.", missing: "Where are we? They can’t picture the scene." },
    { id: "when", label: "WHEN?", answer: "Last spring, just before I spoke.", missing: "When did this happen? Last week, or long ago?" },
    { id: "what", label: "WHAT HAPPENED?", answer: "My heart pounded, and someone told me, “That’s not fear. That’s excitement.”", missing: "Then nothing happens. There is no story." },
    { id: "why", label: "WHY? (THE POINT)", answer: "Nervous and excited feel the same in your body.", missing: "Then it’s only a memory. There is nothing to take away." }
  ];
  const fourQStory = [
    ["when", "Last spring,"], ["", " "], ["who", "I"], ["", " stood "], ["where", "behind the curtain of a packed hall,"], ["", " waiting to speak. "],
    ["what", "My heart was pounding,"], ["", " and "], ["who", "the person beside me"], ["", " "], ["what", "smiled and said, “That’s not fear. That’s excitement.”"],
    ["", " "], ["why", "The reason I’m telling you this is because nervous and excited feel the same in your body."]
  ];

  // The game on slide 5: find the words that answer each question in a new short story.
  const huntOrder = ["who", "where", "when", "what", "why"];
  const huntPrompts = {
    who: ["WHO?", "Who is in the story?", "Look for the people."],
    where: ["WHERE?", "Where does it happen?", "Look for a place."],
    when: ["WHEN?", "When does it happen?", "Look for a day or a time."],
    what: ["WHAT HAPPENED?", "What happened?", "Look for the moment something changed."],
    why: ["WHY? (THE POINT)", "Why is the story being told? Find the point.", "Look for the lesson. It comes after “The reason I’m telling you this is because…”"]
  };
  const huntStory = [
    { t: "On Saturday morning,", q: "when" },
    { t: "my brother and I", q: "who" },
    { t: "were waiting", q: "" },
    { t: "at the train station.", q: "where" },
    { t: "The board said our train was canceled.", q: "what" },
    { t: "So we ran across town", q: "what" },
    { t: "and caught the last bus.", q: "what" },
    { t: "The reason I’m telling you this is because sometimes the best days begin when the plan falls apart.", q: "why" }
  ];

  // Slide 7: the same moment told plainly, and told with the body.
  const showVersions = {
    plain: { parts: [{ tag: "", html: "I stood behind the curtain, waiting to speak. There were a lot of people out there." }], read: "We understand it. We don’t see it." },
    senses: {
      parts: [
        { tag: "TOUCH", html: "I gripped the <mark>rough</mark>, <mark>heavy</mark> velvet curtain." },
        { tag: "SEE", html: "A <mark>blinding</mark> white spotlight burned on the <mark>empty</mark> stage." },
        { tag: "HEAR", html: "Three hundred voices <mark>rumbled</mark> like thunder." },
        { tag: "SMELL", html: "The air smelled <mark>sharp</mark>, of <mark>burned</mark> coffee and <mark>hot</mark> dust." }
      ],
      read: "Now we are standing there with you."
    }
  };
  const showLine = mode => showVersions[mode].parts.map((part, index) => `<span style="--d:${index}">${part.tag ? `<i class="w6-sense-tag ${part.tag.toLowerCase()}">${part.tag}</i>` : ""}${part.html}</span>`).join(" ");

  const characterVersions = {
    told: { label: "TOLD ABOUT", text: "The person beside me told me the nerves were really excitement.", note: "We understand it. We don’t see it." },
    alive: { label: "BROUGHT TO LIFE", text: "They leaned over, smiled, and said: “That’s not fear. That’s excitement. Say it with me: I’m excited!”", note: "Now we are backstage with you." }
  };

  const audiences = [
    { id: "interview", name: "In a job interview", point: "nervous and excited feel the same in your body. Tell yourself you are excited, and walk in ready." },
    { id: "team", name: "With your team", point: "nervous and excited feel the same in your body. Before you speak up, say “I’m excited.”" },
    { id: "friend", name: "With a friend", point: "when your heart pounds, you can call it fear, or you can call it excitement. You get to choose." }
  ];

  const linkStories = [
    { id: "curtain", name: "Standing behind the curtain, heart pounding" }
  ];
  const linkSituations = [
    { id: "job", name: "Starting a new job" },
    { id: "talk", name: "Giving a presentation" },
    { id: "learn", name: "Learning a new skill" }
  ];
  const links = {
    "curtain-job": "A new job is like standing behind that curtain. The pounding heart is excitement, not fear.",
    "curtain-talk": "A presentation is like standing behind that curtain. Say “I’m excited” and your body is ready.",
    "curtain-learn": "Learning something new is like standing behind that curtain. Nerves and excitement feel the same, so choose excitement."
  };

  const storyBeats = [
    { part: "SET THE SCENE", text: "Last spring, I stood behind the curtain of a packed hall, waiting to speak.", cues: [["pace", "Steady pace"]], ms: 230 },
    { part: "WHAT IT FELT LIKE", text: "Three hundred people were taking their seats. My mouth was dry, and my hands wouldn’t stop shaking.", cues: [["pace", "Slow down"]], ms: 330 },
    { part: "WHAT THEY SAID", text: "The person beside me leaned over, smiled, and said: “That’s not fear. That’s excitement. Say it with me: I’m excited!”", cues: [["pause", "Pause before their line"]], ms: 300, pauseBefore: true },
    { part: "THE INCIDENT", text: "So I said it too. And I walked out smiling.", cues: [["pause", "Hold the silence"]], ms: 420, pauseAfter: true },
    { part: "THE POINT", text: "The reason I’m telling you this is because nervous and excited feel the same in your body.", cues: [["voice", "Say it stronger"]], ms: 280 },
    { part: "THE LINK", text: "Life is like standing behind that curtain. When your heart pounds, your body is getting ready.", cues: [["pace", "Slow down"]], ms: 300 }
  ];
  const cueLecture = { pace: "L3", voice: "L2", pause: "L4", pitch: "L5" };

  const storyFields = [
    { key: "who", label: "WHO", hint: "Who is in the story?", placeholder: "Me and a speaker with twenty years of experience" },
    { key: "where", label: "WHERE AND WHEN", hint: "Set the scene.", placeholder: "My first week at work, in a busy open office" },
    { key: "what", label: "WHAT HAPPENED · THE INCIDENT", hint: "The moment everything changed.", placeholder: "I sent an email to the whole company by mistake" },
    { key: "point", label: "THE POINT", hint: "The reason I’m telling you this is because…", placeholder: "mistakes feel huge to you and small to everyone else" }
  ];

  const prompts = {
    "Places": ["A place you still think about.", "A place where something surprised you."],
    "People": ["Someone who changed how you think.", "Someone who made you laugh when you needed it."],
    "Things you love": ["A hobby that taught you something.", "An object you would never throw away."],
    "Life events": ["A day that changed your plans.", "A moment you felt really proud."],
    "Periods of life": ["Your first year in a new city.", "A hard season you got through."],
    "First times": ["Your first job.", "The first time you spoke in front of a group."],
    "Favorite songs": ["A song that takes you back to one exact moment.", "A song you played on repeat during a big change."]
  };

  const eyes = [
    { id: "writer", name: "Eye of the Writer", icon: "pen", short: "Notice it. Write it down.", back: "When a moment moves you, write it down the same day with the story template. Feelings fade fast. Details fade faster." },
    { id: "video", name: "Eye of the Videographer", icon: "camera", short: "Keep the pictures.", back: "Add photos or short videos to each story. They bring the senses back: what you saw, heard and felt. Then you can tell it with detail." },
    { id: "director", name: "Eye of the Director", icon: "clapper", short: "Choose the angle.", back: "The same story can be told from your eyes, someone else’s eyes, or even from a small object in the room. Choose the angle that fits your point." }
  ];

  // Step 3 (the chemical quiz) was retired; saved positions on it move on to the next slide.
  // Step 20 (the four questions) is a newer slide placed before the formula, so the list order is the real order.
  // Step 6 (paint the scene) was retired; saved positions on it move on to the next slide.
  // Step 14 (three eyes) comes before step 13 (collect stories): learn where stories hide, then start collecting.
  // Step 21 (why storytelling matters) is a newer slide placed before the fact-versus-story slide.
  const stepOrder = [0, 21, 1, 2, 4, 20, 5, 9, 11, 12, 14, 13, 15, 16, 17, 18, 19];
  const lectureStepCount = 14;
  const completeStep = 16;
  let previousFocus = null;
  let timers = [];
  let clock = null;

  const esc = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  const getState = () => portal.getState().week6Lecture;
  const update = patch => portal.updateWeek6(patch);
  const getLevel = () => exposure.clampLevel(getState().currentLevel || portal.getState().currentLevel || portal.getState().week2Lecture?.currentLevel || 1);
  // Step 20 sits in the same chapter and stage as step 4.
  const slot = step => step === 20 ? 4 : step === 21 ? 1 : step;
  const chapterFor = step => chapters.find(chapter => slot(step) >= chapter.start && slot(step) <= chapter.end);
  const stageFor = step => stages.find(stage => slot(step) <= stage.end) || stages[stages.length - 1];

  function later(fn, ms) { const id = setTimeout(fn, ms); timers.push(id); return id; }
  function clearTimers() {
    timers.forEach(id => clearTimeout(id));
    timers = [];
    if (clock) { clearInterval(clock.interval); clock = null; }
  }

  const icons = {
    pen: '<path d="M14 50l4-14L44 10l10 10-26 26z"/><path d="M38 16l10 10M14 50l14-4"/>',
    camera: '<rect x="8" y="18" width="48" height="34" rx="6"/><circle cx="32" cy="35" r="10"/><path d="M22 18l4-7h12l4 7"/>',
    clapper: '<rect x="8" y="24" width="48" height="28" rx="4"/><path d="M8 24l46-12 2 8M18 21l6 6M30 18l6 6M42 15l6 6"/>'
  };
  const icon = name => `<svg viewBox="0 0 64 64" aria-hidden="true">${icons[name]}</svg>`;

  function shell(content, options = {}) {
    const state = getState();
    const step = Number(state.currentStep || 0);
    const chapter = chapterFor(step);
    const chapterIndex = chapter ? chapters.indexOf(chapter) : -1;
    const slideNumber = stepOrder.indexOf(step) + 1;
    const afterMission = step > completeStep && step < 20;
    const canBack = step > 0 && !options.lockBack;
    const progress = Math.round((Math.min(lectureStepCount, slideNumber) / lectureStepCount) * 100);
    const chapterLabel = step === 0 ? "YOUR FIVE CHAPTERS" : afterMission ? "MISSION FOLLOW-UP" : "WEEK 6 · FINAL LECTURE";
    const chapterTitle = chapter?.title || (step === 0 ? "Storytelling" : afterMission ? "Turn experience into evidence" : "Bring it all together");
    const stage = stageFor(step);

    return `<div class="week3-page week6-page" role="dialog" aria-modal="true" aria-labelledby="week6PageTitle">
      <header class="w3-header">
        <div class="w3-brand"><img src="Logo.png?v=pankaj-lecture-v1" alt="" /><div><small>THE SPEAKER'S GYM</small><strong>WEEK 6 · STORYTELLING</strong></div></div>
        <div class="w3-chapter-track" aria-label="${esc(chapter ? `Chapter ${chapterIndex + 1} of ${chapters.length}: ${chapterTitle}` : chapterTitle)}">
          <div><small>${chapter ? `CHAPTER ${String(chapterIndex + 1).padStart(2, "0")} OF ${String(chapters.length).padStart(2, "0")}` : chapterLabel}</small><strong>${esc(chapterTitle)}</strong></div>
          <div class="w3-chapter-dots" aria-hidden="true">${chapters.map((item, index) => `<i class="${index < chapterIndex || (!chapter && step > 0) ? "done" : index === chapterIndex ? "active" : ""}"></i>`).join("")}</div>
        </div>
        <div class="w3-header-actions"><button class="w3-reset" type="button" data-w6-action="reset">Reset</button><button class="w3-close" type="button" data-w6-action="close" aria-label="Save and close">&times;</button></div>
        <div class="w3-progress" aria-hidden="true"><i style="width:${progress}%"></i></div>
      </header>
      <main class="w3-main"><section class="w3-screen ${options.className || ""}">${content}</section></main>
      <footer class="w3-footer">
        <button class="w3-back" type="button" data-w6-action="back" ${canBack ? "" : "disabled"}>Back</button>
        <span>${afterMission ? "AFTER THE MISSION" : `${stage.name} · ${slideNumber} / ${lectureStepCount}`}</span>
        <div class="w3-footer-actions">${options.footer || `<button class="w3-next" type="button" data-w6-action="next">${options.nextLabel || "Continue"}</button>`}</div>
      </footer>
    </div>`;
  }

  /* ---------- small pieces of markup ---------- */
  function cueChip([kind, text]) {
    return `<i class="w6-cue ${kind}">${esc(text)}</i>`;
  }

  function setShowMode(mode) {
    update({ showMode: mode });
    const box = root.querySelector("[data-w6-show]");
    box.dataset.mode = mode;
    box.querySelectorAll("[data-w6-show-mode]").forEach(button => button.classList.toggle("selected", button.dataset.w6ShowMode === mode));
    box.querySelector("[data-w6-show-line]").innerHTML = showLine(mode);
    const read = box.querySelector("[data-w6-show-read]");
    read.textContent = showVersions[mode].read;
    read.classList.remove("in"); void read.offsetWidth; read.classList.add("in");
  }

  function timingRead(minutes) {
    if (minutes == null) return { band: "", attention: 0, text: "Drag the slider. How long do you talk before the incident happens?" };
    if (minutes < 1) return { band: "short", attention: 30, text: "Too short. They don’t know who you are or why to care, so the incident has no weight." };
    if (minutes < 2) return { band: "near", attention: 62, text: "Almost. Add one more detail: where you were, or how you felt." };
    if (minutes <= 3) return { band: "right", attention: 96, text: "Just right. They know the scene, they care, and now they lean in for the incident." };
    if (minutes <= 4.5) return { band: "near", attention: 55, text: "Getting long. They start to wonder where this is going." };
    return { band: "long", attention: 20, text: "Too long. You lost them before the best part." };
  }

  const clockLabel = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  function shelf(library) {
    if (!library.length) return '<p class="w6-shelf-empty">Your shelf is empty. Write your first story idea above.</p>';
    return library.map((title, index) => `<span class="w6-book" style="--i:${index};--h:${150 + (index * 37) % 50}px;--c:${index % 4}"><b>${esc(title)}</b><button type="button" data-w6-remove-book="${index}" aria-label="Remove ${esc(title)}">×</button></span>`).join("");
  }

  function renderStep() {
    clearTimers();
    const state = getState();
    const savedStep = Number(state.currentStep || 0);
    // A saved spot on a retired slide (3, 6, 7, 8 or 10) moves on to the next slide in the real order.
    const retiredNext = { 3: 4, 6: 9, 7: 9, 8: 9, 10: 11 };
    const resumeAt = retiredNext[savedStep] ?? savedStep;
    const step = stepOrder.includes(resumeAt) ? resumeAt : stepOrder.find(item => item >= resumeAt) ?? 0;
    if (step !== savedStep) update({ currentStep: step });
    const level = getLevel();
    const levelData = exposure.levels[level - 1];
    let page = "";

    if (step === 0) {
      page = shell(`
        <p class="w3-eyebrow">WEEK 6 · THE FINAL LECTURE</p>
        <h1 id="week6PageTitle">Everything you learned<br /><em>meets in one story.</em></h1>
        <div class="w6-gather" aria-label="The five skills from Lectures 1 to 5 come together into one story.">
          <div class="w6-skills">${skills.map((skill, index) => `<span class="${skill.side}" style="--i:${index}"><b>L${skill.n}</b>${esc(skill.name)}</span>`).join("")}</div>
          <svg class="w6-threads" viewBox="0 0 500 90" preserveAspectRatio="none" aria-hidden="true">${[50, 150, 250, 350, 450].map((x, index) => `<path d="M${x} 0 C${x} 50 250 40 250 90" pathLength="1" style="--i:${index}" />`).join("")}</svg>
          <div class="w6-core"><small>STRUCTURE + VOCAL VARIETY</small><strong>= a story people remember</strong></div>
        </div>
        <div class="w3-agenda">${chapters.map((chapter, index) => `<article data-w3-animate style="--i:${index + 6}"><span>${String(index + 1).padStart(2, "0")}</span><strong>${esc(chapter.title)}</strong></article>`).join("")}</div>
      `, { className: "opening w6-opening", nextLabel: "Begin the story" });
    } else if (step === 21) {
      page = shell(`
        <p class="w3-eyebrow">WHY IT MATTERS</p>
        <h1 id="week6PageTitle">Tell it well<br /><em>and people say yes.</em></h1>
        <div class="w6-whys">
          <article data-w3-animate style="--i:0"><small>WHAT YOU WIN</small><h2>The job</h2><p>Recruiters were more likely to recommend candidates who answered with a story than candidates who only described themselves.</p><em>Hiring study · Journal of Business and Psychology</em></article>
          <article data-w3-animate style="--i:1"><small>WHAT YOU WIN</small><h2>The funding</h2><strong class="w6-stat">27%</strong><p>more likely to get funded when the pitch sounded enthusiastic. Over 1,100 pitch videos.</p><em>Yale School of Management</em></article>
          <article data-w3-animate style="--i:2"><small>WHAT YOU WIN</small><h2>The belief</h2><p>Numbers fade. After a delay, a story changes what people believe more than statistics do.</p><em>Graeber, Roth and Zimmermann</em></article>
        </div>
        <blockquote>Structure makes your story clear.<br /><strong>Your voice makes people say yes.</strong></blockquote>
      `, { className: "w6-whys-screen" });
    } else if (step === 1) {
      const choice = state.memoryChoice || "";
      page = shell(`
        <p class="w3-eyebrow">WHY STORIES MATTER</p>
        <h1 id="week6PageTitle">Facts inform.<br /><em>Stories stay.</em></h1>
        <p class="w3-lede">Read both. Which one will you still remember tomorrow?</p>
        <div class="w6-pair">
          <button type="button" class="w6-card fact ${choice === "fact" ? "chosen" : ""}" data-w6-memory="fact"><small>A FACT</small><p>“Nervous and excited feel the same in your body.”</p></button>
          <button type="button" class="w6-card story ${choice === "story" ? "chosen" : ""}" data-w6-memory="story"><small>A STORY</small><p>I stood behind the curtain, listening to three hundred people talk. My heart was pounding, my mouth was dry, and my hands wouldn’t stop shaking. The person beside me, who had spoken on stages for twenty years, leaned over and smiled. “That’s not fear. That’s excitement. Say it with me: I’m excited!” So I did. And I walked out smiling.</p><p class="w6-card-point"><b>The point:</b> Nervous and excited feel the same in your body.</p></button>
        </div>
        <div class="w6-reveal ${choice ? "in" : ""}" data-w6-reveal>
          <p class="w6-verdict">${choice === "fact" ? "Most people choose the story. Facts slip away. A moment you can picture stays." : "Most people choose the story too. You can see the curtain. You feel the pounding heart."}</p>
          <div class="w6-three">
            <article style="--i:0"><span>01</span><strong>Remembered</strong><p>You will remember the curtain long after you forget the fact.</p></article>
            <article style="--i:1"><span>02</span><strong>Connected</strong><p>You felt the dry mouth and the shaking hands. That feeling connects you to the speaker.</p></article>
            <article style="--i:2"><span>03</span><strong>Moves you to act</strong><p>Hearing that nerves are really excitement makes it easier to step on stage yourself.</p></article>
          </div>
        </div>
      `, { className: "w6-why" });
    } else if (step === 2) {
      page = shell(`
        <p class="w3-eyebrow">WHAT A STORY DOES TO US</p>
        <h1 id="week6PageTitle">Three feelings.<br /><em>Your story decides which.</em></h1>
        <div class="w6-chems">${chemicals.map((chem, index) => `<article class="w6-chem open static ${chem.id}" data-w3-animate style="--i:${index}">
          <span class="w6-flask" aria-hidden="true"><i></i><em></em><em></em><em></em></span>
          <small>${esc(chem.name.toUpperCase())}</small>
          <h2>${esc(chem.nick)}</h2>
          <p class="w6-moment">${esc(chem.moment)}</p>
          <p class="w6-use"><b>USE IT TO</b>${esc(chem.use)}</p>
        </article>`).join("")}</div>
        <div class="w6-guess" data-w6-guess>
          <p><b>The curtain story you just read.</b> Which one did it create?</p>
          <div role="group" aria-label="Which feeling did the curtain story create?">${chemicals.map(chem => `<button type="button" data-w6-guess-choice="${chem.id}">${esc(chem.name)}</button>`).join("")}</div>
          <p class="w6-guess-out" data-w6-guess-out aria-live="polite"></p>
        </div>
      `, { className: "w6-chem-screen" });
    } else if (step === 4) {
      const removed = state.removedNow;
      const piece = skills.find(skill => skill.n === removed);
      page = shell(`
        <p class="w3-eyebrow">THE STORY EQUATION</p>
        <h1 id="week6PageTitle">For a story to work, you need<br /><em>structure + vocal variety.</em></h1>
        <div class="w6-equation">
          <div class="w6-side structure"><small>STRUCTURE</small>${skills.filter(skill => skill.side === "structure").map(skill => `<button type="button" class="w6-piece ${removed === skill.n ? "off" : ""}" data-w6-piece="${skill.n}" data-w3-animate style="--i:0"><b>LECTURE ${skill.n}</b><strong>${esc(skill.name)}</strong><span>PREP taught you to give ideas a shape. Stories have a shape too.</span></button>`).join("")}</div>
          <i class="w6-plus" aria-hidden="true">+</i>
          <div class="w6-side voice"><small>VOCAL VARIETY</small><div>${skills.filter(skill => skill.side === "voice").map((skill, index) => `<button type="button" class="w6-piece ${removed === skill.n ? "off" : ""}" data-w6-piece="${skill.n}" data-w3-animate style="--i:${index + 1}"><b>LECTURE ${skill.n}</b><strong>${esc(skill.name)}</strong></button>`).join("")}</div></div>
        </div>
        <div class="w6-equals ${piece ? "broken" : ""}" data-w6-equals aria-live="polite"><span>${piece ? "≠" : "="}</span><p>${piece ? `<b>Without ${esc(piece.name.toLowerCase())}:</b> ${esc(piece.lost)}` : "A story people remember, and feel."}</p></div>
        <p class="w3-coach-note">Tap any piece to take it away, and see what happens to the story. Try at least two.</p>
      `, { className: "w6-equation-screen" });
    } else if (step === 20) {
      const solved = new Set(state.huntSolved || []);
      const finished = huntOrder.every(id => solved.has(id));
      const showExample = finished || state.huntSkipped;
      const current = huntOrder.find(id => !solved.has(id));
      page = shell(`
        <p class="w3-eyebrow">YOUR TURN · FIND THE ANSWERS</p>
        <h1 id="week6PageTitle">Four questions<br /><em>every story answers.</em></h1>
        <article class="w6-hunt" data-w6-hunt>
          <ol class="w6-hunt-stars" aria-label="Your stars">${huntOrder.map(id => `<li class="${id} ${solved.has(id) ? "on" : ""} ${id === current ? "now" : ""}" data-hq="${id}"><b>★</b>${esc(huntPrompts[id][0])}</li>`).join("")}</ol>
          <p class="w6-hunt-prompt" data-w6-hunt-prompt aria-live="polite">${finished ? "★★★★★ You found all five answers." : `Tap the words that answer: <b>${esc(huntPrompts[current][0])}</b> ${esc(huntPrompts[current][1])}`}</p>
          <p class="w6-hunt-story">${huntStory.map((chunk, index) => `<button type="button" class="w6-chunk ${chunk.q && solved.has(chunk.q) ? `solved ${chunk.q}` : ""}" data-chunk="${index}" ${chunk.q && solved.has(chunk.q) ? "disabled" : ""}>${esc(chunk.t)}</button>`).join(" ")}</p>
          <p class="w6-hunt-hint" data-w6-hunt-hint aria-live="polite"></p>
          ${showExample ? "" : '<button type="button" class="w6-fq-miss" data-w6-hunt-skip>Skip, show me the answers</button>'}
        </article>
        <blockquote class="w6-hunt-close" ${showExample ? "" : "hidden"}>Who, where, when and what happened make the incident.<br /><strong>Why is the point.</strong></blockquote>
      `, { className: "w6-fourq-screen" });
    } else if (step === 5) {
      page = shell(`
        <p class="w3-eyebrow">THE STORYTELLING FORMULA</p>
        <h1 id="week6PageTitle">Incident. Point. Link.<br /><em>Three parts, every time.</em></h1>
        <div class="w6-formula">
          <article class="incident" data-w3-animate style="--i:0"><span>01</span><h2>The Incident</h2><strong class="w6-q">What happened?</strong><p>Who, what, where, when. The moment something happened.</p><i>“I stood behind the curtain, listening to three hundred people talk…”</i></article>
          <b class="w6-arrow" aria-hidden="true"></b>
          <article class="point" data-w3-animate style="--i:1"><span>02</span><h2>The Point</h2><strong class="w6-q">Why does it matter?</strong><p>Every story needs one. It turns a memory into a lesson.</p><i>“The reason I’m telling you this is because nervous and excited feel the same in your body.”</i></article>
          <b class="w6-arrow" aria-hidden="true"></b>
          <article class="link" data-w3-animate style="--i:2"><span>03</span><h2>The Link</h2><strong class="w6-q">How does it apply to you?</strong><p>Show how the story applies to the listener’s own life, so it feels useful to them.</p><i>“Life is like standing behind that curtain. When your heart pounds, your body is getting ready.”</i></article>
        </div>
        <div class="w6-timebar" aria-label="Most of the time goes to the incident. The point and the link take one or two sentences each."><span class="incident"><small>INCIDENT · most of your time</small></span><span class="point"><small>POINT</small></span><span class="link"><small>LINK</small></span></div>
        <blockquote>PREP puts the point first.<br /><strong>A story saves the point for after the incident. That is what keeps them curious.</strong></blockquote>
      `, { className: "w6-formula-screen" });
    } else if (step === 6) {
      const mode = state.showMode === "senses" ? "senses" : "plain";
      page = shell(`
        <p class="w3-eyebrow">PAINT THE SCENE</p>
        <h1 id="week6PageTitle">Don’t just say what happened.<br /><em>Put them in the room.</em></h1>
        <article class="w6-show" data-w6-show data-mode="${mode}">
          <div class="w6-show-toggle" role="group" aria-label="Choose a version">
            <button type="button" class="${mode === "plain" ? "selected" : ""}" data-w6-show-mode="plain">Plain</button>
            <button type="button" class="${mode === "senses" ? "selected" : ""}" data-w6-show-mode="senses">With the senses</button>
          </div>
          <p class="w6-show-line" data-w6-show-line aria-live="polite">${showLine(mode)}</p>
          <p class="w6-show-read" data-w6-show-read>${esc(showVersions[mode].read)}</p>
        </article>
        <p class="w6-show-tip"><b>Don’t just say it. Use sharp words to put us there.</b><br />Pick adjectives for what you see, hear, smell and touch.</p>
      `, { className: "w6-incident-screen" });
    } else if (step === 7) {
      const mode = state.charMode || "";
      const version = characterVersions[mode];
      page = shell(`
        <p class="w3-eyebrow">BRING CHARACTERS TO LIFE</p>
        <h1 id="week6PageTitle">Don’t tell us what she said.<br /><em>Let her say it.</em></h1>
        <div class="w5-toggle w6-toggle"><button type="button" class="${mode === "told" ? "selected" : ""}" data-w6-char="told">Told about</button><button type="button" class="${mode === "alive" ? "selected" : ""}" data-w6-char="alive">Brought to life</button></div>
        <article class="w6-character ${mode}" data-w6-character>
          <small>${version ? version.label : "CHOOSE A VERSION"}</small>
          <p>${version ? esc(version.text) : "Tap both versions and read each one out loud."}</p>
          <em>${version ? esc(version.note) : "&nbsp;"}</em>
        </article>
        <div class="w6-char-tips ${mode === "alive" ? "in" : ""}" data-w6-char-tips>
          <article style="--i:0"><span>DIALOGUE</span><strong>Use their real words</strong><p>Quote the line. It makes the moment happen now, in front of them.</p></article>
          <article style="--i:1"><span>BODY LANGUAGE</span><strong>Show what they did</strong><p>Turn to them. Smile. Do it as you say it.</p></article>
          <article style="--i:2"><span>VOICE</span><strong>Give them a voice</strong><p>Pause before their line (L4). Then change your pitch and pace for them (L3, L5).</p></article>
        </div>
      `, { className: "w6-char-screen" });
    } else if (step === 8) {
      const minutes = state.setupMinutes;
      const read = timingRead(minutes);
      const value = minutes == null ? 0 : minutes;
      page = shell(`
        <p class="w3-eyebrow">GET TO THE INCIDENT · NOT TOO SOON, NOT TOO LATE</p>
        <h1 id="week6PageTitle">Set it up in<br /><em>two to three minutes.</em></h1>
        <article class="w6-timing ${read.band}" data-w6-timing>
          <div class="w6-track" style="--p:${(value / 6) * 100}%">
            <span class="sweet" aria-hidden="true"><small>SWEET SPOT</small></span>
            <span class="setup" aria-hidden="true"></span>
            <span class="flag" aria-hidden="true"><b>INCIDENT</b></span>
          </div>
          <input type="range" min="0" max="6" step="0.5" value="${value}" data-w6-setup aria-label="Minutes before the incident" />
          <div class="w6-scale" aria-hidden="true"><span>0 min</span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6 min</span></div>
          <div class="w6-attention"><span>LISTENER</span><div><i data-w6-attention style="width:${read.attention}%"></i></div><strong data-w6-minutes>${minutes == null ? "—" : `${minutes} min`}</strong></div>
          <p class="w6-timing-read" data-w6-timing-read aria-live="polite">${esc(read.text)}</p>
        </article>
        <p class="w3-coach-note">Find the sweet spot on the slider. Too fast and nobody cares yet. Too slow and they stop listening.</p>
      `, { className: "w6-timing-screen" });
    } else if (step === 9) {
      const tried = state.pointTried || [];
      const active = audiences.find(item => item.id === tried[tried.length - 1]);
      page = shell(`
        <p class="w3-eyebrow">THE POINT · EVERY STORY NEEDS ONE</p>
        <h1 id="week6PageTitle">One sentence turns a story<br /><em>into an insight.</em></h1>
        <article class="w6-point">
          <p class="w6-magic"><span data-w6-type>The reason I’m telling you this is because…</span></p>
          <div class="w6-audience" role="group" aria-label="Who are you telling?">${audiences.map(item => `<button type="button" class="${active?.id === item.id ? "on" : ""} ${tried.includes(item.id) ? "tried" : ""}" data-w6-audience="${item.id}">${esc(item.name)}</button>`).join("")}</div>
          <p class="w6-point-out ${active ? "in" : ""}" data-w6-point-out aria-live="polite">${active ? `…${esc(active.point)}` : "Same story. Choose who is listening, and see how the point changes."}</p>
        </article>
        <p class="w3-coach-note">Without a point, a story is just a nice memory. With a point, it becomes a lesson people keep. Try at least two listeners.</p>
      `, { className: "w6-point-screen" });
    } else if (step === 10) {
      const situationId = state.linkSituation || "";
      const text = situationId ? links[`curtain-${situationId}`] : "";
      page = shell(`
        <p class="w3-eyebrow">THE LINK · CONNECT IT TO THEIR LIFE</p>
        <h1 id="week6PageTitle">The link connects<br /><em>your story to their life.</em></h1>
        <p class="w3-lede">Your story is finished. Now show your listener where they will meet the same thing.</p>
        <div class="w6-linker">
          <div class="w6-reel"><small>1 · YOUR STORY</small><p class="w6-link-story">${esc(linkStories[0].name)}</p></div>
          <div class="w6-chain ${text ? "joined" : ""}" aria-hidden="true"><i></i><b>is like</b><i></i></div>
          <div class="w6-reel"><small>2 · WHERE THEY MEET IT</small>${linkSituations.map(item => `<button type="button" class="${situationId === item.id ? "on" : ""}" data-w6-link-situation="${item.id}">${esc(item.name)}</button>`).join("")}</div>
        </div>
        <p class="w6-link-label">3 · THE LINK YOU SAY OUT LOUD</p>
        <p class="w6-link-out ${text ? "in" : ""}" data-w6-link-out aria-live="polite">${text ? `“${esc(text)}”` : "Pick where they will meet it."}</p>
        <p class="w3-coach-note">The link says: <b>[their moment] is like [your story]. Here is what that means for you.</b></p>
      `, { className: "w6-link-screen" });
    } else if (step === 11) {
      page = shell(`
        <p class="w3-eyebrow">A REAL EXAMPLE</p>
        <h1 id="week6PageTitle">Hear it in a real speech.<br /><em>Incident. Point. Link.</em></h1>
        <article class="w6-real">
          <header><small>A REAL SPEECH</small><strong>Steve Jobs · Stanford, 2005</strong></header>
          <div class="w6-real-rows">
            <p class="incident"><b>INCIDENT</b><span>“I decided to take a calligraphy class to learn how to do this.”</span></p>
            <p class="point"><b>POINT</b><span>“You can’t connect the dots looking forward. You can only connect them looking backwards.”</span></p>
            <p class="link"><b>LINK</b><span>“So you have to trust that the dots will somehow connect in your future.”</span></p>
          </div>
          <em>The full incident is a longer story. Here is just the key line.</em>
        </article>
      `, { className: "w6-script-screen" });
    } else if (step === 12) {
      const story = state.story || {};
      page = shell(`
        <p class="w3-eyebrow">YOUR TURN · THE STORY TEMPLATE</p>
        <h1 id="week6PageTitle">Build one story<br /><em>of your own.</em></h1>
        <div class="w6-builder">${storyFields.map((field, index) => `<label class="w6-field ${field.key}" data-w3-animate style="--i:${index}"><span>${esc(field.label)}</span><small>${esc(field.hint)}</small><textarea rows="${field.key === "what" || field.key === "point" ? 2 : 1}" data-w6-story="${field.key}" placeholder="${esc(field.placeholder)}">${esc(story[field.key] || "")}</textarea></label>`).join("")}</div>
        <div class="w6-clock" data-w6-clock><div><small>STORY CLOCK</small><strong data-w6-clock-time>${clockLabel(Number(state.storySeconds || 0))}</strong><span data-w6-clock-hint>Aim for 2–3 minutes before the incident.</span></div><button type="button" class="w5-primary" data-w6-action="clock">${state.storySeconds ? "Tell it again" : "Start telling it"}</button></div>
        <p class="w3-coach-note">Fill in at least the incident and the point. Then press start and tell it out loud.</p>
      `, { className: "w6-builder-screen" });
    } else if (step === 13) {
      const library = state.library || [];
      const category = state.promptCategory || "";
      page = shell(`
        <p class="w3-eyebrow">YOUR LIBRARY OF STORIES</p>
        <h1 id="week6PageTitle">Great storytellers don’t invent stories.<br /><em>They collect them.</em></h1>
        <div class="w6-remind"><p>Every story you collect has the same parts. Remember to find them:</p><div><span class="who">Who</span><span class="where">Where</span><span class="when">When</span><span class="what">What happened</span><span class="why">Why (the point)</span></div></div>
        <div class="w6-prompts" role="group" aria-label="Story idea starters">${Object.keys(prompts).map(name => `<button type="button" class="${category === name ? "on" : ""}" data-w6-prompt="${esc(name)}">${esc(name)}</button>`).join("")}</div>
        <p class="w6-prompt-out ${category ? "in" : ""}" data-w6-prompt-out aria-live="polite">${category ? esc(state.promptText || prompts[category][0]) : "Tap a starter. Let a memory come back."}</p>
        <form class="w6-add" data-w6-add><input type="text" maxlength="60" placeholder="Give the story a short title, like “Behind the curtain”" data-w6-book-title aria-label="Story title" /><button type="submit" class="w5-primary">Add to my shelf</button></form>
        <div class="w6-shelf" data-w6-shelf>${shelf(library)}</div>
        <p class="w3-coach-note">Add at least three story ideas. <span data-w6-book-count>${library.length}</span> on your shelf.</p>
      `, { className: "w6-library-screen" });
    } else if (step === 14) {
      const seen = new Set(state.eyesSeen || []);
      page = shell(`
        <p class="w3-eyebrow">THREE WAYS TO SEE YOUR STORIES</p>
        <h1 id="week6PageTitle">Look at your life<br /><em>with three eyes.</em></h1>
        <div class="w6-eyes">${eyes.map((eye, index) => `<button type="button" class="w6-eye ${seen.has(eye.id) ? "flipped" : ""}" data-w6-eye="${eye.id}" data-w3-animate style="--i:${index}" aria-pressed="${seen.has(eye.id)}"><span class="front">${icon(eye.icon)}<strong>${esc(eye.name)}</strong><small>${esc(eye.short)}</small><b>Tap to turn</b></span><span class="back"><strong>${esc(eye.name)}</strong><p>${esc(eye.back)}</p></span></button>`).join("")}</div>
        <article class="w6-template" data-w3-animate style="--i:3">
          <header><small>THE STORY TEMPLATE · USE IT FOR EVERY STORY</small></header>
          <div><section><b>THE INCIDENT</b><ul><li>Who</li><li>What</li><li>Where</li><li>When</li></ul></section><section><b>THE POINT</b><p>The reason I’m telling you this is because…</p></section></div>
        </article>
      `, { className: "w6-eyes-screen" });
    } else if (step === 15) {
      page = shell(`
        <p class="w3-eyebrow">THE LAST WEEK · ONE FINAL VIDEO</p>
        <h1 id="week6PageTitle">Your final assignment.<br /><em>One video.</em></h1>
        <ol class="w6-final">
          <li data-w3-animate style="--i:0"><b>1</b><div><strong>Record one video that is 2 minutes long.</strong></div></li>
          <li data-w3-animate style="--i:1"><b>2</b><div><strong>Tell a story that includes:</strong><span class="chips"><i class="who">Who</i><i class="when">When</i><i class="what">What happened</i><i class="why">The point</i></span></div></li>
          <li data-w3-animate style="--i:2"><b>3</b><div><strong>Use the vocal variety you learned:</strong><span class="chips"><i class="vol">Volume</i><i class="pace">Pace</i><i class="pause">Pauses</i><i class="melody">Melody</i></span></div></li>
        </ol>
        <p class="w6-final-note">This is your final assignment. It will be used to compare your performance.</p>
      `, { footer: '<button class="w3-next mission-accept" type="button" data-w6-action="accept-mission">Accept my final assignment</button>' });
    } else if (step === 16) {
      const badges = [...skills.map(skill => skill.name), "Story"];
      page = shell(`
        <div class="w6-confetti" aria-hidden="true">${Array.from({ length: 26 }, (_, index) => `<i style="--x:${(index * 37) % 100}%;--d:${(index % 7) * 0.18}s;--r:${(index * 47) % 360}deg;--c:${index % 4}"></i>`).join("")}</div>
        <p class="w3-eyebrow">LECTURE 6 COMPLETE · THE FINAL LECTURE</p>
        <h1 id="week6PageTitle">Six skills.<br /><em>One voice that is yours.</em></h1>
        <div class="w6-badges">${badges.map((name, index) => `<span style="--i:${index}" class="${index === 5 ? "story" : ""}"><b>${index + 1}</b>${esc(name)}</span>`).join("")}</div>
        <article class="w3-mission-mini active"><small>YOUR WEEK 6 MISSION</small><p>${esc(state.mission)}</p><strong>Win with one true story and a clear point.</strong></article>
        <div class="w3-leave-plan"><article><span>01</span><strong>Leave the lecture</strong><p>Pick one story from your shelf. Incident, point, link.</p></article><article><span>02</span><strong>Tell it for real</strong><p>Use your voice: slow down, pause before the big moment, land the point.</p></article><article><span>03</span><strong>Return with reality</strong><p>Use “Report mission” in your portal.</p></article></div>
        <blockquote>Structure gives your story a shape.<br /><strong>Your voice gives it a heartbeat.</strong></blockquote>
      `, { className: "w6-finale", footer: '<button class="w3-next" type="button" data-w6-action="close">Return to my portal</button>' });
    } else if (step === 17) {
      page = shell(`
        <p class="w3-eyebrow">WELCOME BACK</p>
        <h1 id="week6PageTitle">Did you tell<br /><em>your story?</em></h1>
        <p class="w3-lede">The win is the attempt. Nothing else is required.</p>
        <article class="w3-mission-mini"><small>YOUR MISSION</small><p>${esc(state.mission)}</p></article>
        <div class="w3-did-it"><button type="button" data-w6-action="mission-not-yet"><span>NOT YET</span><small>Save and return later</small></button><button type="button" class="yes" data-w6-action="mission-yes"><span>YES</span><small>I attempted it</small></button></div>
      `, { lockBack: true, footer: '<span class="w3-footer-hint">Your mission stays active until you attempt it.</span>' });
    } else if (step === 18) {
      page = shell(`
        <p class="w3-eyebrow">REALITY CHECK</p>
        <h1 id="week6PageTitle">What actually happened?</h1>
        <p class="w3-lede">One short answer. No report and no long reflection.</p>
        <div class="w3-input-card">
          <textarea data-w6-result rows="3" placeholder="I told the story about my first week at work. When I said the point, two people nodded, and one of them told me a story back…">${esc(state.actualResult)}</textarea>
        </div>
      `, { lockBack: true, footer: '<button class="w3-next" type="button" data-w6-action="collect-evidence">Collect evidence</button>' });
    } else {
      const evidence = (portal.getState().evidence || []).find(item => item.id === state.evidenceId);
      page = shell(`
        <div class="w6-confetti" aria-hidden="true">${Array.from({ length: 26 }, (_, index) => `<i style="--x:${(index * 41) % 100}%;--d:${(index % 6) * 0.2}s;--r:${(index * 53) % 360}deg;--c:${index % 4}"></i>`).join("")}</div>
        <p class="w3-eyebrow">THE SPEAKER’S GYM · COMPLETE</p>
        <h1 id="week6PageTitle">Six weeks ago, you started.<br /><em>Now you have stories to tell.</em></h1>
        <div class="w3-completion-stats"><article><small>SKILL UNLOCKED</small><strong>Storytelling</strong></article><article><small>THE FORMULA</small><strong>Incident · Point · Link</strong></article><article><small>STORIES ON YOUR SHELF</small><strong>${(state.library || []).length}</strong></article></div>
        <article class="w3-evidence-card"><header><small>EVIDENCE COLLECTED</small><span>WEEK 6</span></header><div><small>YOUR MISSION</small><p>${esc(evidence?.action || state.mission)}</p></div><div><small>WHAT HAPPENED</small><p>${esc(evidence?.result || state.actualResult)}</p></div></article>
        <div class="w3-week-progress">${[1, 2, 3, 4, 5, 6].map(number => `<span class="complete">W${number} <i>●</i></span>`).join("")}</div>
        <div class="w3-next-week"><small>KEEP GOING</small><strong>Add one story to your library every week, and tell it to someone.</strong></div>
      `, { className: "w6-finale", lockBack: true, footer: '<button class="w3-next" type="button" data-w6-action="close">Return to my portal</button>' });
    }

    root.innerHTML = page;
    document.body.classList.add("week6-open");
    requestAnimationFrame(() => {
      root.querySelectorAll("[data-w3-animate]").forEach(el => el.classList.add("in"));
      if (step === 9) typePhrase();
      root.querySelector("textarea, input, button:not([disabled])")?.focus({ preventScroll: true });
    });
  }

  /* ---------- slide 9: type the magic phrase ---------- */
  function typePhrase() {
    const target = root.querySelector("[data-w6-type]");
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const full = target.textContent;
    target.textContent = "";
    target.classList.add("typing");
    [...full].forEach((character, index) => later(() => { target.textContent += character; }, 300 + index * 38));
    later(() => target.classList.remove("typing"), 300 + full.length * 38 + 400);
  }

  /* ---------- slide 11: play the guide ---------- */
  function tapChunk(button) {
    const state = getState();
    const solved = new Set(state.huntSolved || []);
    const current = huntOrder.find(id => !solved.has(id));
    if (!current) return;
    const chunk = huntStory[Number(button.dataset.chunk)];
    const hint = root.querySelector("[data-w6-hunt-hint]");
    if (chunk.q !== current) {
      button.classList.remove("shake");
      void button.offsetWidth;
      button.classList.add("shake");
      hint.textContent = `Not that one. ${huntPrompts[current][2]}`;
      return;
    }
    solved.add(current);
    update({ huntSolved: [...solved] });
    const finished = huntOrder.every(id => solved.has(id));
    if (finished) {
      portal.showToast("Five stars. You can find the answers in any story.");
      return renderStep();
    }
    root.querySelectorAll(".w6-chunk").forEach((el, index) => {
      if (huntStory[index].q === current) { el.classList.add("solved", current); el.disabled = true; }
    });
    const next = huntOrder.find(id => !solved.has(id));
    root.querySelectorAll("[data-hq]").forEach(li => {
      li.classList.toggle("on", solved.has(li.dataset.hq));
      li.classList.toggle("now", li.dataset.hq === next);
    });
    root.querySelector("[data-w6-hunt-prompt]").innerHTML = `Yes! Next, tap the words that answer: <b>${esc(huntPrompts[next][0])}</b> ${esc(huntPrompts[next][1])}`;
    hint.textContent = "";
  }

  function showFourQ() {
    const box = root.querySelector("[data-w6-fourq]");
    const active = box.dataset.active || "";
    const missing = Boolean(box.dataset.missing);
    const item = fourQs.find(entry => entry.id === active);
    box.classList.toggle("focus", Boolean(active));
    box.classList.toggle("gone", missing);
    box.querySelectorAll("[data-q]").forEach(span => {
      const on = span.dataset.q === active;
      span.classList.toggle("on", on);
      span.textContent = on && missing ? "???" : span.dataset.text;
    });
    box.querySelectorAll("[data-w6-fq]").forEach(button => button.classList.toggle("selected", button.dataset.w6Fq === active));
    const out = box.querySelector("[data-w6-fq-answer]");
    out.textContent = !item ? "Tap a question above." : missing ? item.missing : item.answer;
    out.classList.toggle("bad", missing);
    const button = box.querySelector("[data-w6-fq-miss]");
    button.disabled = !item;
    button.textContent = missing ? "Put it back" : "Take that answer away";
  }

  function playGuide(button) {
    clearTimers();
    const beatsEls = [...root.querySelectorAll("[data-w6-beat]")];
    button.disabled = true;
    root.querySelectorAll(".w6-beat, .w6-hold").forEach(el => el.classList.remove("playing", "played"));
    let offset = 200;
    storyBeats.forEach((beat, index) => {
      const card = beatsEls[index];
      const text = card.querySelector("p");
      const words = beat.text.split(" ");
      if (beat.pauseBefore) {
        const hold = card.previousElementSibling;
        later(() => { hold?.classList.add("playing"); hold?.scrollIntoView({ block: "nearest", behavior: "smooth" }); }, offset);
        offset += 1300;
        later(() => { hold?.classList.remove("playing"); hold?.classList.add("played"); }, offset);
      }
      later(() => {
        card.classList.add("playing");
        card.scrollIntoView({ block: "nearest", behavior: "smooth" });
        text.innerHTML = words.map(word => `<span>${esc(word)}</span>`).join(" ");
      }, offset);
      words.forEach((_, wordIndex) => later(() => text.children[wordIndex]?.classList.add("said"), offset + 100 + wordIndex * beat.ms));
      offset += 100 + words.length * beat.ms + 450;
      later(() => { card.classList.remove("playing"); card.classList.add("played"); }, offset);
      if (beat.pauseAfter) {
        const hold = card.nextElementSibling;
        later(() => hold?.classList.add("playing"), offset);
        offset += 3000;
        later(() => { hold?.classList.remove("playing"); hold?.classList.add("played"); }, offset);
      }
    });
    later(() => {
      button.disabled = false;
      button.textContent = "▶ Play it again";
      update({ guidePlayed: true });
      portal.showToast("Your turn. Stand up and tell it out loud.");
    }, offset);
  }

  /* ---------- slide 12: story clock ---------- */
  function toggleClock(button) {
    const time = root.querySelector("[data-w6-clock-time]");
    const hint = root.querySelector("[data-w6-clock-hint]");
    const box = root.querySelector("[data-w6-clock]");
    if (clock) {
      clearInterval(clock.interval);
      const seconds = clock.seconds;
      clock = null;
      box.classList.remove("running");
      button.textContent = "Tell it again";
      update({ storySeconds: seconds, storyTold: true });
      hint.textContent = seconds < 60 ? "Short and sweet. Next time, add one more detail about what happened." : seconds <= 240 ? "Nicely told. That is a story people can follow and feel." : "A long one. Try cutting the setup so you reach the incident sooner.";
      return;
    }
    clock = { seconds: 0, interval: null };
    box.classList.add("running");
    button.textContent = "Stop";
    time.textContent = clockLabel(0);
    hint.textContent = "Telling… set the scene, then the incident, the point, and the link.";
    clock.interval = setInterval(() => {
      if (!clock) return;
      clock.seconds += 1;
      time.textContent = clockLabel(clock.seconds);
      box.classList.toggle("sweet", clock.seconds >= 120 && clock.seconds <= 180);
    }, 1000);
  }

  function validateAndNext() {
    const state = getState();
    const step = Number(state.currentStep || 0);
    // Nothing blocks Continue: every exercise is optional.
    const requirements = {
    };
    if (requirements[step] && !requirements[step][0]) {
      portal.showToast(requirements[step][1]);
      return;
    }
    update({ currentStep: stepOrder[Math.min(stepOrder.indexOf(15), stepOrder.indexOf(step) + 1)], lastViewedAt: new Date().toISOString() });
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
    document.body.classList.remove("week6-open");
    portal.renderAll();
    previousFocus?.focus?.();
  }

  function collectEvidence() {
    const state = getState();
    if (!String(state.actualResult || "").trim()) {
      portal.showToast("Add one short sentence about what actually happened.");
      root.querySelector("[data-w6-result]")?.focus();
      return;
    }
    const id = state.evidenceId || `week6-${Date.now()}`;
    const card = {
      id,
      week: 6,
      skill: "Storytelling",
      prediction: state.prediction,
      reality: state.actualResult,
      level: Number(state.missionLevel || getLevel()),
      mission: state.mission,
      completedAt: new Date().toISOString()
    };
    portal.saveEvidence(card);
    update({ evidenceId: id, completedAt: card.completedAt, currentStep: 19 });
    portal.showToast("Story evidence collected. Program complete.");
    renderStep();
  }

  const addUnique = (list, value) => [...new Set([...(list || []), value])];

  root.addEventListener("click", event => {
    const actionEl = event.target.closest("[data-w6-action]");
    const action = actionEl?.dataset.w6Action;
    if (action === "close") return close();
    if (action === "reset") { clearTimers(); if (portal.resetLecture(6)) renderStep(); return; }
    if (action === "back") return back();
    if (action === "next") return validateAndNext();
    if (action === "play-guide") return playGuide(actionEl);
    if (action === "told-aloud") {
      update({ toldAloud: true });
      actionEl.classList.add("done");
      actionEl.textContent = "✓ I told it out loud";
      portal.showToast("Structure + vocal variety. That is a story.");
      return;
    }
    if (action === "clock") return toggleClock(actionEl);
    if (action === "accept-mission") {
      const state = getState();
      const level = getLevel();
      update({ mission: finalAssignment, missionLevel: level, missionStatus: "accepted", acceptedAt: new Date().toISOString(), lectureCompletedAt: new Date().toISOString(), currentStep: completeStep });
      portal.showToast("Final assignment accepted. Record your video.");
      return renderStep();
    }
    if (action === "mission-not-yet") return close();
    if (action === "mission-yes") { update({ missionStatus: "completed", currentStep: 18 }); return renderStep(); }
    if (action === "collect-evidence") return collectEvidence();

    const memory = event.target.closest("[data-w6-memory]");
    if (memory) { update({ memoryChoice: memory.dataset.w6Memory }); return renderStep(); }

    const guess = event.target.closest("[data-w6-guess-choice]");
    if (guess) {
      const out = root.querySelector("[data-w6-guess-out]");
      const right = guess.dataset.w6GuessChoice === "oxytocin";
      root.querySelectorAll("[data-w6-guess-choice]").forEach(button => button.classList.toggle("chosen", button === guess));
      out.classList.remove("in"); void out.offsetWidth; out.classList.add("in");
      out.textContent = `${right ? "Yes. " : "Close. "}It was oxytocin. The speaker was honest about the shaking hands, so you felt close to them.`;
      return;
    }

    const chunk = event.target.closest("[data-chunk]");
    if (chunk) return tapChunk(chunk);
    if (event.target.closest("[data-w6-hunt-skip]")) {
      update({ huntSkipped: true, huntSolved: [...huntOrder] });
      return renderStep();
    }

    const fq = event.target.closest("[data-w6-fq]");
    if (fq) {
      const box = root.querySelector("[data-w6-fourq]");
      box.dataset.active = fq.dataset.w6Fq;
      box.dataset.missing = "";
      showFourQ();
      return;
    }
    const fqMiss = event.target.closest("[data-w6-fq-miss]");
    if (fqMiss) {
      const box = root.querySelector("[data-w6-fourq]");
      box.dataset.missing = box.dataset.missing ? "" : "1";
      showFourQ();
      return;
    }

    const piece = event.target.closest("[data-w6-piece]");
    if (piece) {
      const number = Number(piece.dataset.w6Piece);
      const current = getState().removedNow;
      const removedNow = current === number ? null : number;
      update({ removedNow, removedTried: removedNow ? addUnique(getState().removedTried, number) : getState().removedTried });
      root.querySelectorAll("[data-w6-piece]").forEach(button => button.classList.toggle("off", Number(button.dataset.w6Piece) === removedNow));
      const skill = skills.find(item => item.n === removedNow);
      const equals = root.querySelector("[data-w6-equals]");
      equals.classList.toggle("broken", Boolean(skill));
      equals.classList.remove("flash"); void equals.offsetWidth; equals.classList.add("flash");
      equals.querySelector("span").textContent = skill ? "≠" : "=";
      equals.querySelector("p").innerHTML = skill ? `<b>Without ${esc(skill.name.toLowerCase())}:</b> ${esc(skill.lost)}` : "A story people remember, and feel.";
      return;
    }

    const showMode = event.target.closest("[data-w6-show-mode]");
    if (showMode) return setShowMode(showMode.dataset.w6ShowMode);

    const charButton = event.target.closest("[data-w6-char]");
    if (charButton) {
      const mode = charButton.dataset.w6Char;
      update({ charMode: mode, charTried: addUnique(getState().charTried, mode) });
      return renderStep();
    }

    const audience = event.target.closest("[data-w6-audience]");
    if (audience) {
      const id = audience.dataset.w6Audience;
      const tried = [...(getState().pointTried || []).filter(item => item !== id), id];
      update({ pointTried: tried });
      root.querySelectorAll("[data-w6-audience]").forEach(button => {
        button.classList.toggle("on", button === audience);
        if (tried.includes(button.dataset.w6Audience)) button.classList.add("tried");
      });
      const out = root.querySelector("[data-w6-point-out]");
      out.classList.remove("in"); void out.offsetWidth; out.classList.add("in");
      out.textContent = `…${audiences.find(item => item.id === id).point}`;
      return;
    }

    const linkSituation = event.target.closest("[data-w6-link-situation]");
    if (linkSituation) {
      const patch = { linkStory: "curtain", linkSituation: linkSituation.dataset.w6LinkSituation };
      const next = { ...getState(), ...patch };
      if (next.linkStory && next.linkSituation) patch.linkTried = addUnique(getState().linkTried, `${next.linkStory}-${next.linkSituation}`);
      update(patch);
      const group = linkSituation.parentElement;
      group.querySelectorAll("button").forEach(button => button.classList.toggle("on", button === linkSituation));
      const out = root.querySelector("[data-w6-link-out]");
      if (next.linkStory && next.linkSituation) {
        out.classList.remove("in"); void out.offsetWidth; out.classList.add("in");
        out.textContent = `“${links[`${next.linkStory}-${next.linkSituation}`]}”`;
        root.querySelector(".w6-chain")?.classList.add("joined");
      }
      const tried = root.querySelector("[data-w6-link-count]"); if (tried) tried.textContent = (getState().linkTried || []).length;
      return;
    }

    const prompt = event.target.closest("[data-w6-prompt]");
    if (prompt) {
      const name = prompt.dataset.w6Prompt;
      const options = prompts[name];
      const state = getState();
      const text = state.promptCategory === name ? options[(options.indexOf(state.promptText) + 1) % options.length] : options[0];
      update({ promptCategory: name, promptText: text });
      root.querySelectorAll("[data-w6-prompt]").forEach(button => button.classList.toggle("on", button === prompt));
      const out = root.querySelector("[data-w6-prompt-out]");
      out.classList.remove("in"); void out.offsetWidth; out.classList.add("in");
      out.textContent = text;
      root.querySelector("[data-w6-book-title]")?.focus();
      return;
    }

    const removeBook = event.target.closest("[data-w6-remove-book]");
    if (removeBook) {
      const library = [...(getState().library || [])];
      library.splice(Number(removeBook.dataset.w6RemoveBook), 1);
      update({ library });
      root.querySelector("[data-w6-shelf]").innerHTML = shelf(library);
      root.querySelector("[data-w6-book-count]").textContent = library.length;
      return;
    }

    const eye = event.target.closest("[data-w6-eye]");
    if (eye) {
      eye.classList.toggle("flipped");
      eye.setAttribute("aria-pressed", String(eye.classList.contains("flipped")));
      const seen = addUnique(getState().eyesSeen, eye.dataset.w6Eye);
      update({ eyesSeen: seen });
      return;
    }

    const levelButton = event.target.closest("[data-w6-level]");
    if (levelButton) {
      const level = exposure.clampLevel(levelButton.dataset.w6Level);
      portal.setExposureLevel(level);
      update({ currentLevel: level, mission: missionTemplates[level - 1], missionLevel: null });
      return renderStep();
    }
  });

  root.addEventListener("submit", event => {
    if (!event.target.matches("[data-w6-add]")) return;
    event.preventDefault();
    const input = root.querySelector("[data-w6-book-title]");
    const title = input.value.trim();
    if (!title) { portal.showToast("Give the story a short title first."); input.focus(); return; }
    const library = [...(getState().library || []), title].slice(-24);
    update({ library });
    input.value = "";
    root.querySelector("[data-w6-shelf]").innerHTML = shelf(library);
    root.querySelector("[data-w6-book-count]").textContent = library.length;
    if (library.length === 3) portal.showToast("Three stories on your shelf. That is a library.");
    input.focus();
  });

  root.addEventListener("input", event => {
    const target = event.target;
    if (target.matches("[data-w6-mission]")) update({ mission: target.value });
    else if (target.matches("[data-w6-result]")) update({ actualResult: target.value });
    else if (target.matches("[data-w6-story]")) update({ story: { ...(getState().story || {}), [target.dataset.w6Story]: target.value } });
    else if (target.matches("[data-w6-setup]")) {
      const minutes = Number(target.value);
      const read = timingRead(minutes);
      const hit = getState().setupHit || read.band === "right";
      update({ setupMinutes: minutes, setupHit: hit });
      const box = root.querySelector("[data-w6-timing]");
      box.className = `w6-timing ${read.band}`;
      box.querySelector(".w6-track").style.setProperty("--p", `${(minutes / 6) * 100}%`);
      root.querySelector("[data-w6-attention]").style.width = `${read.attention}%`;
      root.querySelector("[data-w6-minutes]").textContent = `${minutes} min`;
      root.querySelector("[data-w6-timing-read]").textContent = read.text;
    }
  });

  document.addEventListener("click", event => {
    if (event.target.closest("[data-open-week6-reflection]")) {
      previousFocus = document.activeElement;
      update({ currentStep: 17 });
      return renderStep();
    }
    if (!event.target.closest("[data-open-week6-lecture]")) return;
    previousFocus = document.activeElement;
    renderStep();
  });

  document.addEventListener("keydown", event => {
    if (!document.body.classList.contains("week6-open")) return;
    if (event.key === "Escape") close();
  });
})();
