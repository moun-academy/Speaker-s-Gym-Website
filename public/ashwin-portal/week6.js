(function () {
  "use strict";

  const portal = window.SpeakersGymPortal;
  const exposure = window.SpeakersGymExposure;
  const root = document.querySelector("#week6Root");
  if (!portal || !exposure || !root) return;

  const chapters = [
    { title: "Why Stories Move People", start: 1, end: 3 },
    { title: "Structure + Vocal Variety", start: 4, end: 5 },
    { title: "Build the Incident", start: 6, end: 8 },
    { title: "The Point and the Link", start: 9, end: 10 },
    { title: "Tell It and Keep It", start: 11, end: 14 }
  ];

  const stages = [
    { name: "WHY", end: 3 },
    { name: "FORMULA", end: 5 },
    { name: "INCIDENT", end: 8 },
    { name: "POINT", end: 10 },
    { name: "TELL", end: 14 },
    { name: "PROVE", end: 16 }
  ];

  const missionTemplates = window.ASHWIN_DATA.levels.map(level => level.behavior + " Use one short true story: set the scene, tell the incident, then say “The reason I’m telling you this is because…”");

  const skills = [
    { n: 1, name: "Structure", side: "structure", lost: "They get lost. Lots of detail, but no point to hold on to." },
    { n: 2, name: "Volume", side: "voice", lost: "They can’t hear the best part. The key line disappears." },
    { n: 3, name: "Pace", side: "voice", lost: "Everything sounds equally important, so nothing feels important." },
    { n: 4, name: "Pauses", side: "voice", lost: "No suspense. The big moment has no time to land." },
    { n: 5, name: "Melody", side: "voice", lost: "Flat. They hear the words, but they don’t feel them." }
  ];

  const chemicals = [
    { id: "dopamine", name: "Dopamine", nick: "The curiosity chemical", when: "They wonder what happens next.", effects: ["Focus", "Attention", "Motivation", "Memory"], use: "Motivate people." },
    { id: "oxytocin", name: "Oxytocin", nick: "The trust chemical", when: "You share a true story where you were vulnerable: a struggle, a mistake, a fear.", effects: ["Trust", "Bonding", "Empathy", "Generosity"], use: "Build a deeper connection." },
    { id: "endorphins", name: "Endorphins", nick: "The feel-good chemical", when: "Your story makes them smile or laugh.", effects: ["Relaxed", "Present", "Creative", "Rapport"], use: "Break the ice and build rapport quickly." }
  ];

  const chemSort = [
    { id: "ice", text: "You start a talk, and the room of strangers looks tense.", answer: "endorphins", why: "A light, funny story relaxes them and breaks the ice." },
    { id: "team", text: "Your team is tired, and you want them to keep going.", answer: "dopamine", why: "Curiosity about what comes next gives energy and motivation." },
    { id: "trust", text: "You want a new client to trust you.", answer: "oxytocin", why: "A true story where you show a struggle builds trust." },
    { id: "remember", text: "You want people to remember your message next week.", answer: "dopamine", why: "Curiosity locks attention, and attention builds memory." },
    { id: "network", text: "You meet someone at an event and want to connect fast.", answer: "endorphins", why: "Shared laughter builds rapport in seconds." },
    { id: "interview", text: "In an interview, you want them to see who you really are.", answer: "oxytocin", why: "Being honest about a hard moment makes you human and trusted." }
  ];
  const chemLabels = { dopamine: "DOPAMINE", oxytocin: "OXYTOCIN", endorphins: "ENDORPHINS" };

  const wParts = [
    { key: "when", text: "Two years ago," },
    { key: "who", text: "I" },
    { key: "", text: "walked into a job interview" },
    { key: "where", text: "in a small glass meeting room." },
    { key: "", text: "The manager asked me one simple question, and" },
    { key: "what", text: "my mind went completely blank." }
  ];
  const senses = [
    { id: "V", name: "See", full: "Visual", line: "Three faces were looking at me. One of them stopped writing." },
    { id: "A", name: "Hear", full: "Auditory", line: "The only sound was the air conditioning, humming." },
    { id: "K", name: "Feel", full: "Kinesthetic", line: "My face went hot, and my hands were sweating on the table." },
    { id: "S", name: "Smell", full: "Smell", line: "The room smelled of fresh coffee that nobody was drinking." }
  ];

  const characterVersions = {
    told: { label: "TOLD ABOUT", text: "The manager asked me why they should hire me, and I didn’t know what to say.", note: "We understand it. We don’t see it." },
    alive: { label: "BROUGHT TO LIFE", text: "She put her pen down. Leaned back in her chair. And said, slowly: “So… why should we hire you?”", note: "Now we are in the room with you." }
  };

  const audiences = [
    { id: "interview", name: "In a job interview", point: "I learned to stay calm under pressure. When I don’t know an answer, I pause, think, and start with my point. That is what I would bring to this role." },
    { id: "team", name: "With your team", point: "many of us freeze when we speak up. It is normal. Take two seconds. Nobody minds the silence as much as you do." },
    { id: "friend", name: "With a friend", point: "you are not the only one who goes blank. It happens to everyone, even in the moments that matter most." }
  ];

  const linkStories = [
    { id: "blank", name: "My mind went blank in an interview" },
    { id: "phone", name: "Teaching my dad to use a smartphone" },
    { id: "cook", name: "Cooking for ten people for the first time" }
  ];
  const linkSituations = [
    { id: "job", name: "Starting a new job" },
    { id: "talk", name: "Giving a presentation" },
    { id: "learn", name: "Learning a new skill" }
  ];
  const links = {
    "blank-job": "A new job is like that interview room. The silence feels long to you, but to everyone else, it looks like you are thinking.",
    "blank-talk": "A presentation is like that interview room. If you go blank, a pause looks calm, not lost. Breathe, and start with your point.",
    "blank-learn": "Learning anything new is like that interview. You will go blank sometimes. That is not failure. It is the moment before you get better.",
    "phone-job": "A new job is like teaching my dad to use his phone. Nobody expects you to know every button on day one. Ask twice if you need to.",
    "phone-talk": "A presentation is like teaching my dad his phone. If they look lost, slow down and show one button at a time.",
    "phone-learn": "Learning a new skill is like my dad with his phone. The first week is all mistakes. Then one day, you are sending everyone photos.",
    "cook-job": "A new job is like cooking for ten people for the first time. You will burn something, and nobody will remember it by dessert.",
    "cook-talk": "A presentation is like cooking for ten people. Get the main dish right, and nobody notices the small mistakes.",
    "cook-learn": "Learning a new skill is like cooking for ten. The second time is always easier than the first."
  };

  const storyBeats = [
    { part: "SET THE SCENE", text: "Two years ago, I walked into a job interview, in a small glass meeting room.", cues: [["pace", "Steady pace"], ["voice", "Normal volume"]], ms: 230 },
    { part: "THE SENSES", text: "Three faces were looking at me. The only sound was the air conditioning. My hands were sweating on the table.", cues: [["pace", "Slow down"], ["voice", "Softer"], ["pitch", "Lower"]], ms: 330 },
    { part: "THE CHARACTER", text: "The manager put her pen down, leaned back, and said: “So… why should we hire you?”", cues: [["pause", "Pause before her line"], ["pitch", "Change your voice for her"]], ms: 300, pauseBefore: true },
    { part: "THE INCIDENT", text: "And my mind went completely blank.", cues: [["pace", "Very slow"], ["voice", "Soft"], ["pause", "Hold 3 seconds"]], ms: 520, pauseAfter: true },
    { part: "THE POINT", text: "The reason I’m telling you this is because that silence taught me something: a pause is not a failure.", cues: [["voice", "Stronger"], ["pitch", "Step up on “not”"], ["pitch", "Land the ending"]], ms: 280 },
    { part: "THE LINK", text: "Life is like that interview room. The silence feels long to you, but to everyone else, it looks like you are thinking.", cues: [["pace", "Slow"], ["pitch", "Land it low"]], ms: 300 }
  ];
  const cueLecture = { pace: "L3", voice: "L2", pause: "L4", pitch: "L5" };

  const storyFields = [
    { key: "who", label: "WHO", hint: "Who is in the story?", placeholder: "Me and my first manager" },
    { key: "where", label: "WHERE AND WHEN", hint: "Set the scene.", placeholder: "My first week at work, in a busy open office" },
    { key: "what", label: "WHAT HAPPENED · THE INCIDENT", hint: "The moment everything changed.", placeholder: "I sent an email to the whole company by mistake" },
    { key: "senses", label: "VAKS · SEE, HEAR, FEEL, SMELL", hint: "One or two details from your senses.", placeholder: "My phone started buzzing. My stomach dropped." },
    { key: "dialogue", label: "BRING A CHARACTER TO LIFE", hint: "One line someone actually said.", placeholder: "She walked over, smiled, and said: “Welcome to the team.”" },
    { key: "point", label: "THE POINT", hint: "The reason I’m telling you this is because…", placeholder: "mistakes feel huge to you and small to everyone else" },
    { key: "link", label: "THE LINK", hint: "… is like …", placeholder: "Starting anything new is like that first week…" }
  ];

  const prompts = {
    "Places": ["A place you still think about.", "A place where something surprised you."],
    "People": ["Someone who changed how you think.", "Someone who made you laugh when you needed it."],
    "Things you love": ["A hobby that taught you something.", "An object you would never throw away."],
    "Life events": ["A day that changed your plans.", "A moment you felt really proud."],
    "Periods of life": ["Your first year in a new city.", "A hard season you got through."],
    "First times": ["Your first job.", "The first time you spoke in front of a group."],
    "Favourite songs": ["A song that takes you back to one exact moment.", "A song you played on repeat during a big change."]
  };

  const eyes = [
    { id: "writer", name: "Eye of the Writer", icon: "pen", short: "Notice it. Write it down.", back: "When a moment moves you, write it down the same day with the story template. Feelings fade fast. Details fade faster." },
    { id: "video", name: "Eye of the Videographer", icon: "camera", short: "Keep the pictures.", back: "Add photos or short videos to each story. They bring the senses back: what you saw, heard and felt. Then you can tell it with detail." },
    { id: "director", name: "Eye of the Director", icon: "clapper", short: "Choose the angle.", back: "The same story can be told from your eyes, someone else’s eyes, or even from a small object in the room. Choose the angle that fits your point." }
  ];

  const stepOrder = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  const lectureStepCount = 17;
  const completeStep = 16;
  let previousFocus = null;
  let timers = [];
  let clock = null;

  const esc = (value = "") => String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  })[character]);

  const getState = () => portal.getState().week6Lecture;
  const update = patch => portal.updateWeek6(patch);
  const getLevel = () => exposure.clampLevel(getState().currentLevel || portal.getState().currentLevel || 1);
  const chapterFor = step => chapters.find(chapter => step >= chapter.start && step <= chapter.end);
  const stageFor = step => stages.find(stage => step <= stage.end) || stages[stages.length - 1];

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
    const afterMission = step > completeStep;
    const canBack = step > 0 && !options.lockBack;
    const progress = Math.round((Math.min(lectureStepCount, slideNumber) / lectureStepCount) * 100);
    const chapterLabel = step === 0 ? "YOUR FIVE CHAPTERS" : afterMission ? "MISSION FOLLOW-UP" : "WEEK 6 · FINAL LECTURE";
    const chapterTitle = chapter?.title || (step === 0 ? "Storytelling" : afterMission ? "Turn experience into evidence" : "Bring it all together");
    const stage = stageFor(step);

    return `<div class="week3-page week6-page" role="dialog" aria-modal="true" aria-labelledby="week6PageTitle">
      <header class="w3-header">
        <div class="w3-brand"><img src="Logo.png?v=ashwin-lecture-v1" alt="" /><div><small>THE SPEAKER'S GYM</small><strong>WEEK 6 · STORYTELLING</strong></div></div>
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
    return `<i class="w6-cue ${kind}"><b>${cueLecture[kind]}</b>${esc(text)}</i>`;
  }

  function incidentLine(state) {
    const chosen = new Set(state.senses || []);
    const base = wParts.map(part => part.key ? `<span class="w6-w ${part.key}"><small>${part.key.toUpperCase()}</small>${esc(part.text)}</span>` : esc(part.text)).join(" ");
    const extra = senses.filter(sense => chosen.has(sense.id)).map(sense => `<span class="w6-sense-line ${sense.id}"><b>${sense.id}</b>${esc(sense.line)}</span>`).join(" ");
    return `<p class="w6-incident-text">${base}</p><p class="w6-incident-senses" data-w6-sense-lines>${extra}</p>`;
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
    const step = stepOrder.find(item => item >= savedStep) ?? 0;
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
    } else if (step === 1) {
      const choice = state.memoryChoice || "";
      page = shell(`
        <p class="w3-eyebrow">WHY STORIES MATTER</p>
        <h1 id="week6PageTitle">Facts inform.<br /><em>Stories stay.</em></h1>
        <p class="w3-lede">Read both. Which one will you still remember tomorrow?</p>
        <div class="w6-pair">
          <button type="button" class="w6-card fact ${choice === "fact" ? "chosen" : ""}" data-w6-memory="fact"><small>A FACT</small><p>“Most people feel nervous before they speak in front of others.”</p></button>
          <button type="button" class="w6-card story ${choice === "story" ? "chosen" : ""}" data-w6-memory="story"><small>A STORY</small><p>“Two years ago, in a job interview, the manager asked me one simple question… and my mind went completely blank.”</p></button>
        </div>
        <div class="w6-reveal ${choice ? "in" : ""}" data-w6-reveal>
          <p class="w6-verdict">${choice === "fact" ? "Most people choose the story. Facts slip away. A moment you can picture stays." : "Most people choose the story too. You can see the room. You feel the blank."}</p>
          <div class="w6-three">
            <article style="--i:0"><span>01</span><strong>Remembered</strong><p>Told well, a story sticks long after the facts are gone.</p></article>
            <article style="--i:1"><span>02</span><strong>Connected</strong><p>The more stories you tell, the deeper the connection with people.</p></article>
            <article style="--i:2"><span>03</span><strong>Moved to act</strong><p>Facts make people think. Stories make people do something.</p></article>
          </div>
          <div class="w3-research w6-research">
            <article><small>STANFORD · CHIP HEATH</small><strong>2 in 3 remembered the story</strong><p>Students gave one-minute talks. Afterwards, only about 1 in 20 people remembered a number. About 2 in 3 remembered a story.</p></article>
            <article><small>BRAIN SCIENCE · PAUL ZAK</small><strong>Stories make people give</strong><p>People watched a short true story about a father and his sick son. Their brains made more of the trust chemical, and they gave more money to charity.</p></article>
          </div>
        </div>
      `, { className: "w6-why" });
    } else if (step === 2) {
      const seen = new Set(state.chemicalsSeen || []);
      page = shell(`
        <p class="w3-eyebrow">WHAT A STORY DOES TO THE BRAIN</p>
        <h1 id="week6PageTitle">Three chemicals.<br /><em>Your story decides which.</em></h1>
        <div class="w6-chems">${chemicals.map((chem, index) => `<button type="button" class="w6-chem ${chem.id} ${seen.has(chem.id) ? "open" : ""}" data-w6-chem="${chem.id}" data-w3-animate style="--i:${index}" aria-expanded="${seen.has(chem.id)}">
          <span class="w6-flask" aria-hidden="true"><i></i><em></em><em></em><em></em></span>
          <small>${esc(chem.nick)}</small>
          <h2>${esc(chem.name)}</h2>
          <span class="w6-chem-more">
            <span class="row"><b>RELEASED WHEN</b>${esc(chem.when)}</span>
            <span class="tags">${chem.effects.map(effect => `<i>${esc(effect)}</i>`).join("")}</span>
            <span class="row use"><b>USE IT TO</b>${esc(chem.use)}</span>
          </span>
          <strong class="w6-tap">Tap to open</strong>
        </button>`).join("")}</div>
        <p class="w3-coach-note">Speaker David JP Phillips calls this mix the “angel’s cocktail”. A good story can serve all three. <span data-w6-chem-count>${seen.size} / 3</span> opened.</p>
      `, { className: "w6-chem-screen" });
    } else if (step === 3) {
      const answers = state.chemSort || {};
      page = shell(`
        <p class="w3-eyebrow">PICK THE RIGHT STORY</p>
        <h1 id="week6PageTitle">What do you want<br /><em>them to feel?</em></h1>
        <div class="w6-sorter">${chemSort.map((item, index) => {
          const chosen = answers[item.id];
          const correct = chosen && chosen === item.answer;
          return `<article class="${chosen ? (correct ? "correct" : "wrong") : ""}" data-w3-animate style="--i:${index}">
            <strong>${esc(item.text)}</strong>
            <div class="w6-sort-buttons">${Object.keys(chemLabels).map(key => `<button type="button" class="${key} ${chosen === key ? "chosen" : ""}" data-w6-sort="${item.id}" data-w6-choice="${key}" ${chosen ? "disabled" : ""}>${chemLabels[key]}</button>`).join("")}</div>
            <small>${chosen ? `${correct ? "Yes." : `${chemLabels[item.answer]}.`} ${esc(item.why)}` : "&nbsp;"}</small>
          </article>`;
        }).join("")}</div>
        <div class="w3-coach-actions"><p class="w3-coach-note">Curious story, honest story or funny story. Choose by the feeling you want.</p><button type="button" class="w3-reset-button" data-w6-action="reset-sort">Reset</button></div>
      `, { className: "w6-sort-screen" });
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
    } else if (step === 5) {
      page = shell(`
        <p class="w3-eyebrow">THE STORYTELLING FORMULA</p>
        <h1 id="week6PageTitle">Incident. Point. Link.<br /><em>Three parts, every time.</em></h1>
        <div class="w6-formula">
          <article class="incident" data-w3-animate style="--i:0"><span>01</span><h2>The Incident</h2><p>What happened. Who, what, where, when. Bring it to life with the senses and with real characters.</p><i>“Two years ago, in a job interview…”</i></article>
          <b class="w6-arrow" aria-hidden="true"></b>
          <article class="point" data-w3-animate style="--i:1"><span>02</span><h2>The Point</h2><p>Why you told it. Every story needs one. It turns a memory into a lesson.</p><i>“The reason I’m telling you this is because…”</i></article>
          <b class="w6-arrow" aria-hidden="true"></b>
          <article class="link" data-w3-animate style="--i:2"><span>03</span><h2>The Link</h2><p>Connect it to the moment you are in, so it feels useful to them right now.</p><i>“Life is like…”</i></article>
        </div>
        <div class="w6-timebar" aria-label="Most of the time goes to the incident. The point and the link take one or two sentences each."><span class="incident"><small>INCIDENT · most of your time</small></span><span class="point"><small>POINT</small></span><span class="link"><small>LINK</small></span></div>
        <blockquote>PREP puts the point first.<br /><strong>A story saves the point for after the incident. That is what keeps them curious.</strong></blockquote>
      `, { className: "w6-formula-screen" });
    } else if (step === 6) {
      const chosen = new Set(state.senses || []);
      page = shell(`
        <p class="w3-eyebrow">THE INCIDENT · WHO, WHAT, WHERE, WHEN + VAKS</p>
        <h1 id="week6PageTitle">Don’t just say what happened.<br /><em>Put them in the room.</em></h1>
        <article class="w6-incident" data-w6-incident>${incidentLine(state)}</article>
        <div class="w6-senses" role="group" aria-label="Add a sense">${senses.map(sense => `<button type="button" class="${sense.id} ${chosen.has(sense.id) ? "on" : ""}" data-w6-sense="${sense.id}" aria-pressed="${chosen.has(sense.id)}"><b>${sense.id}</b><strong>${esc(sense.name)}</strong><small>${esc(sense.full)}</small></button>`).join("")}</div>
        <p class="w3-coach-note">VAKS = what they <b>see</b>, <b>hear</b>, <b>feel</b> and <b>smell</b>. Tap all four senses and watch the story grow. Read it out loud each time.</p>
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
          <article style="--i:1"><span>BODY LANGUAGE</span><strong>Show what they did</strong><p>Put the pen down. Lean back. Do it as you say it.</p></article>
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
          <p class="w6-point-out ${active ? "in" : ""}" data-w6-point-out aria-live="polite">${active ? `…${esc(active.point)}` : "Same interview story. Choose who is listening, and see how the point changes."}</p>
        </article>
        <p class="w3-coach-note">Without a point, a story is just a nice memory. With a point, it becomes a lesson people keep. Try at least two listeners.</p>
      `, { className: "w6-point-screen" });
    } else if (step === 10) {
      const storyId = state.linkStory || "";
      const situationId = state.linkSituation || "";
      const text = storyId && situationId ? links[`${storyId}-${situationId}`] : "";
      page = shell(`
        <p class="w3-eyebrow">THE LINK · MAKE IT MATTER NOW</p>
        <h1 id="week6PageTitle">Any story can fit<br /><em>any moment.</em></h1>
        <div class="w6-linker">
          <div class="w6-reel"><small>YOUR STORY</small>${linkStories.map(item => `<button type="button" class="${storyId === item.id ? "on" : ""}" data-w6-link-story="${item.id}">${esc(item.name)}</button>`).join("")}</div>
          <div class="w6-chain" aria-hidden="true"><i></i><b>is like</b><i></i></div>
          <div class="w6-reel"><small>THE MOMENT</small>${linkSituations.map(item => `<button type="button" class="${situationId === item.id ? "on" : ""}" data-w6-link-situation="${item.id}">${esc(item.name)}</button>`).join("")}</div>
        </div>
        <p class="w6-link-out ${text ? "in" : ""}" data-w6-link-out aria-live="polite">${text ? `“${esc(text)}”` : "Pick one story and one moment."}</p>
        <p class="w3-coach-note">The pattern: <b>[the moment] is like [your story], because [the lesson].</b> Try at least two pairs. <span data-w6-link-count>${(state.linkTried || []).length}</span> tried.</p>
      `, { className: "w6-link-screen" });
    } else if (step === 11) {
      page = shell(`
        <p class="w3-eyebrow">PUT IT ALL TOGETHER · L1 TO L5 IN ONE STORY</p>
        <h1 id="week6PageTitle">Same story.<br /><em>Now tell it with everything.</em></h1>
        <div class="w6-legend" aria-hidden="true"><span class="voice">L2 Volume</span><span class="pace">L3 Pace</span><span class="pause">L4 Pauses</span><span class="pitch">L5 Melody</span></div>
        <div class="w6-script" data-w6-script>${storyBeats.map((beat, index) => `${beat.pauseBefore ? '<div class="w6-hold" data-w6-hold>‖ pause</div>' : ""}<article class="w6-beat" data-w6-beat="${index}"><header><small>${esc(beat.part)}</small><span>${beat.cues.map(cueChip).join("")}</span></header><p>${esc(beat.text)}</p></article>${beat.pauseAfter ? '<div class="w6-hold long" data-w6-hold>‖ hold the silence · 3 seconds</div>' : ""}`).join("")}</div>
        <div class="w5-actions"><button type="button" class="w5-primary" data-w6-action="play-guide">▶ Play the guide</button><button type="button" class="w5-quiet ${state.toldAloud ? "done" : ""}" data-w6-action="told-aloud">${state.toldAloud ? "✓ I told it out loud" : "I told it out loud"}</button></div>
        <p class="w3-coach-note">Watch the guide once. Then stand up and tell the story out loud, following the cues.</p>
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
        <div class="w6-prompts" role="group" aria-label="Story idea starters">${Object.keys(prompts).map(name => `<button type="button" class="${category === name ? "on" : ""}" data-w6-prompt="${esc(name)}">${esc(name)}</button>`).join("")}</div>
        <p class="w6-prompt-out ${category ? "in" : ""}" data-w6-prompt-out aria-live="polite">${category ? esc(state.promptText || prompts[category][0]) : "Tap a starter. Let a memory come back."}</p>
        <form class="w6-add" data-w6-add><input type="text" maxlength="60" placeholder="Give the story a short title, like “The blank interview”" data-w6-book-title aria-label="Story title" /><button type="submit" class="w5-primary">Add to my shelf</button></form>
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
          <div><section><b>THE INCIDENT</b><ul><li>Who</li><li>What</li><li>Where</li><li>When</li><li>VAKS: see, hear, feel, smell</li><li>Bring characters to life (dialogue)</li></ul></section><section><b>THE POINT</b><p>The reason I’m telling you this is because…</p><b>THE LINK</b><p>… is like …</p></section></div>
        </article>
      `, { className: "w6-eyes-screen" });
    } else if (step === 15) {
      const mission = state.mission || missionTemplates[level - 1];
      page = shell(`
        <p class="w3-eyebrow">CHOOSE THE RIGHT-SIZED MISSION</p>
        <h1 id="week6PageTitle">One real moment.<br /><em>One true story.</em></h1>
        <div class="w3-level-picker" role="group" aria-label="Exposure level">${exposure.levels.map((item, index) => `<button type="button" class="${index + 1 === level ? "selected" : ""}" data-w6-level="${index + 1}"><span>${index + 1}</span><small>${esc(item.name)}</small></button>`).join("")}</div>
        <div class="w3-level-focus"><small>LEVEL ${level} · SITUATION</small><h2>${esc(levelData.name)}</h2><p>${esc(levelData.behavior)}</p></div>
        <label class="w3-mission-edit"><span>YOUR WEEK 6 CHALLENGE</span><textarea data-w6-mission rows="3">${esc(mission)}</textarea></label>
        <div class="w3-win-line"><small>WIN CONDITION</small><strong>I told one true story with an incident and a clear point.</strong></div>
      `, { footer: '<button class="w3-next mission-accept" type="button" data-w6-action="accept-mission">Accept mission</button>' });
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
        <div class="w3-completion-stats"><article><small>SKILL UNLOCKED</small><strong>Storytelling</strong></article><article><small>THE FORMULA</small><strong>Incident · Point · Link</strong></article><article><small>EXPOSURE</small><strong>Level ${state.missionLevel || level}</strong></article><article><small>STORIES ON YOUR SHELF</small><strong>${(state.library || []).length}</strong></article></div>
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
      hint.textContent = seconds < 60 ? "Short and sweet. Next time, add one more sense or a line of dialogue." : seconds <= 240 ? "Nicely told. That is a story people can follow and feel." : "A long one. Try cutting the setup so you reach the incident sooner.";
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
    const story = state.story || {};
    const requirements = {
      1: [state.memoryChoice, "Choose the one you will remember tomorrow."],
      2: [(state.chemicalsSeen || []).length >= 3, "Open all three chemicals first."],
      3: [chemSort.every(item => (state.chemSort || {})[item.id]), "Choose a chemical for every moment."],
      4: [(state.removedTried || []).length >= 2, "Take away at least two pieces to see what happens."],
      6: [(state.senses || []).length >= 4, "Add all four senses: see, hear, feel and smell."],
      7: [(state.charTried || []).length >= 2, "Try both versions out loud."],
      8: [state.setupHit, "Find the sweet spot on the slider: two to three minutes."],
      9: [(state.pointTried || []).length >= 2, "Try at least two different listeners."],
      10: [(state.linkTried || []).length >= 2, "Try at least two story and moment pairs."],
      11: [state.toldAloud, "Tell the story out loud, then tap “I told it out loud”."],
      12: [String(story.what || "").trim() && String(story.point || "").trim(), "Write at least the incident and the point."],
      13: [(state.library || []).length >= 3, "Add at least three story ideas to your shelf."],
      14: [(state.eyesSeen || []).length >= 3, "Turn all three cards first."],
      15: [state.mission || missionTemplates[getLevel() - 1], "Choose one small mission."]
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
    if (action === "reset-sort") { update({ chemSort: {} }); return renderStep(); }
    if (action === "accept-mission") {
      const state = getState();
      const level = getLevel();
      update({ mission: state.mission || missionTemplates[level - 1], missionLevel: level, missionStatus: "accepted", acceptedAt: new Date().toISOString(), lectureCompletedAt: new Date().toISOString(), currentStep: completeStep });
      portal.showToast("Mission accepted. One true story is the win.");
      return renderStep();
    }
    if (action === "mission-not-yet") return close();
    if (action === "mission-yes") { update({ missionStatus: "completed", currentStep: 18 }); return renderStep(); }
    if (action === "collect-evidence") return collectEvidence();

    const memory = event.target.closest("[data-w6-memory]");
    if (memory) { update({ memoryChoice: memory.dataset.w6Memory }); return renderStep(); }

    const chem = event.target.closest("[data-w6-chem]");
    if (chem) {
      const seen = addUnique(getState().chemicalsSeen, chem.dataset.w6Chem);
      update({ chemicalsSeen: seen });
      chem.classList.add("open");
      chem.setAttribute("aria-expanded", "true");
      root.querySelector("[data-w6-chem-count]").textContent = `${seen.length} / 3`;
      if (seen.length === 3) portal.showToast("Curiosity, trust and a smile. That is the angel’s cocktail.");
      return;
    }

    const sort = event.target.closest("[data-w6-sort]");
    if (sort) {
      const answers = { ...(getState().chemSort || {}) };
      const item = chemSort.find(entry => entry.id === sort.dataset.w6Sort);
      const chosen = sort.dataset.w6Choice;
      const correct = chosen === item.answer;
      answers[item.id] = chosen;
      update({ chemSort: answers });
      const card = sort.closest("article");
      card.classList.add(correct ? "correct" : "wrong");
      card.querySelectorAll("[data-w6-sort]").forEach(button => { button.disabled = true; button.classList.toggle("chosen", button === sort); });
      card.querySelector("small").textContent = `${correct ? "Yes." : `${chemLabels[item.answer]}.`} ${item.why}`;
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

    const sense = event.target.closest("[data-w6-sense]");
    if (sense) {
      const chosen = new Set(getState().senses || []);
      if (chosen.has(sense.dataset.w6Sense)) chosen.delete(sense.dataset.w6Sense); else chosen.add(sense.dataset.w6Sense);
      const list = senses.map(item => item.id).filter(id => chosen.has(id));
      update({ senses: list });
      sense.classList.toggle("on", chosen.has(sense.dataset.w6Sense));
      sense.setAttribute("aria-pressed", String(chosen.has(sense.dataset.w6Sense)));
      root.querySelector("[data-w6-incident]").innerHTML = incidentLine(getState());
      if (list.length === 4) portal.showToast("Now they are in the room with you.");
      return;
    }

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

    const linkStory = event.target.closest("[data-w6-link-story]");
    const linkSituation = event.target.closest("[data-w6-link-situation]");
    if (linkStory || linkSituation) {
      const patch = linkStory ? { linkStory: linkStory.dataset.w6LinkStory } : { linkSituation: linkSituation.dataset.w6LinkSituation };
      const next = { ...getState(), ...patch };
      if (next.linkStory && next.linkSituation) patch.linkTried = addUnique(getState().linkTried, `${next.linkStory}-${next.linkSituation}`);
      update(patch);
      const group = (linkStory || linkSituation).parentElement;
      group.querySelectorAll("button").forEach(button => button.classList.toggle("on", button === (linkStory || linkSituation)));
      const out = root.querySelector("[data-w6-link-out]");
      if (next.linkStory && next.linkSituation) {
        out.classList.remove("in"); void out.offsetWidth; out.classList.add("in");
        out.textContent = `“${links[`${next.linkStory}-${next.linkSituation}`]}”`;
        root.querySelector(".w6-chain")?.classList.add("joined");
      }
      root.querySelector("[data-w6-link-count]").textContent = (getState().linkTried || []).length;
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
