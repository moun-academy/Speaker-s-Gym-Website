const CLIENT_PROFILE = window.SPEAKERS_GYM_CLIENT || {
  id: "client",
  name: "Speaker",
  storageKey: "speakers-gym-client-journey-v1"
};
const PROGRAM_KEY = CLIENT_PROFILE.storageKey || `speakers-gym-${CLIENT_PROFILE.id}-journey-v1`;
const EXPOSURE = window.SpeakersGymExposure;

const weeks = [
  {
    short: "Structure",
    title: "Speak With Structure",
    why: "A simple framework gives you something reliable to return to when anxiety makes your mind feel blank.",
    outcome: "You can give one concise professional opinion using PREP without scripting every sentence.",
    learn: ["The PREP framework", "Thinking in keywords instead of scripts", "Starting with one clear point", "Recovering when your mind goes blank"],
    spotlight: "Give a 90-second professional opinion using Point, Reason, Example, Point.",
    work: "Share one clear recommendation or observation during a professional conversation.",
    home: "Explain one everyday opinion in three clear sentences.",
    days: [
      day("Foundation day", "Create your baseline", "Your starting point is information, not a judgment.", "Record a 90-second answer about a change you would make at work", "Notice where your voice, eye contact or thoughts become unsteady", "Write the situations that trigger the most pressure", "What happens in my body and thoughts when pressure begins?"),
      day("Framework day", "Build with PREP", "Structure gives your thoughts somewhere to go.", "Turn three workplace opinions into PREP keywords", "Practise one answer in the Speaker's Gym app", "Deliver it once without reading a script", "Which part of PREP helped me stay clear?"),
      day("Conciseness day", "Say the point first", "Leadership communication begins with a clear recommendation.", "Answer one question in 30 seconds", "Remove every sentence that does not support the main point", "Repeat the shorter version in the app", "What became stronger when I used fewer words?"),
      day("Recovery day", "Return after a blank", "A pause is a recovery tool, not proof that you failed.", "Intentionally stop halfway through an answer", "Pause, breathe and say: Let me put that clearly", "Restart with your main point", "What helped me continue instead of retreating?"),
      day("Real-world day", "Contribute one clear idea", "Confidence grows when your skill enters a real situation.", "Choose one useful observation from your work", "Prepare only three PREP keywords", "Share the idea with a colleague or supervisor", "What happened after I made my thinking visible?"),
      day("Spotlight day", "Let your experience be heard", "Your professional experience deserves a concise voice.", "Record your 90-second PREP opinion", "Post your honest attempt in the community", "Ask whether your main point was easy to follow", "What part of this speech already sounds leader-like?"),
      day("Integration day", "Keep the evidence", "Reflection teaches your brain to recognize progress.", "Compare your first and final Week 1 recordings", "Name three visible improvements", "Choose one structure cue for next week", "What can I now do more clearly than seven days ago?")
    ]
  },
  {
    short: "Voice",
    title: "Develop a Stronger Voice",
    subtitle: "From physical anxiety to audible presence",
    why: "Breath, volume and steady sentence endings help your voice remain available even when your body feels nervous.",
    outcome: "You can begin audibly, finish sentences firmly and complete your next exposure level with evidence.",
    learn: ["Breath-supported volume", "Steady sentence endings", "Starting despite a shaky voice", "Choosing your current exposure level", "Using gentle eye contact"],
    spotlight: "Deliver a 60-second PREP answer with grounded volume and two intentional moments of eye contact.",
    work: "Use a stronger opening sentence in one professional interaction.",
    home: "Practise comfortable eye contact while completing one full thought.",
    days: [
      day("Breath day", "Steady the first sentence", "You do not need to eliminate nerves before you begin.", "Take one low breath and speak on the exhale", "Practise three opening sentences at normal volume", "Notice what reduces throat and jaw tension", "What helped my voice settle after I started?"),
      day("Volume day", "Project without pushing", "Being clearly heard is not the same as being aggressive.", "Say one sentence at quiet, normal and strong volume", "Choose the level that sounds grounded", "Repeat it in the app with relaxed shoulders", "Which volume felt confident and still like me?"),
      day("Eye-contact day", "Look up, then return", "Eye contact can be brief, natural and manageable.", "Practise looking at the listener for one complete phrase", "Look away naturally while thinking", "Return for your final sentence", "What made eye contact feel safer today?"),
      day("Level day", "Choose your current reliable level", "Your level is a training position, not an identity.", "Open the level-based coaching experience", "Choose the highest behavior you can repeat reliably", "Write three small next-level attempts", "Why is this level challenging and possible?"),
      day("Exposure day", "Complete one small visible action", "Action gives your brain new evidence about what is safe.", "Use your next-level first sentence", "Complete one real interaction within five seconds", "Record exactly what happened afterward", "What did reality teach me that anxiety did not?"),
      day("Spotlight day", "Sound present", "We measure observable behavior, not how nervous you felt.", "Record a one-minute structured answer", "Use grounded volume and two moments of eye contact", "Post it in the community for one focus point", "Which behavior became more reliable?"),
      day("Integration day", "Collect your voice evidence", "Confidence grows when you notice what your action proved.", "Review your three exposure attempts", "Name three changes in volume or eye contact", "Choose your next useful level", "What can I now repeat that felt harder last week?")
    ]
  },
  {
    short: "Vocal Variety",
    title: "Speak With Vocal Variety",
    why: "Pace, tone and emphasis help your meaning come through so you sound engaged rather than guarded.",
    outcome: "You use pace, tone and emphasis to sound natural, warm and confident in a professional story.",
    learn: ["Intentional pace", "Pitch and emphasis", "Warm professional tone", "Eye contact while telling a story"],
    spotlight: "Tell a two-minute career story with clear emphasis, natural pace and connected eye contact.",
    work: "Tell one concise example from your medical-scribe experience with visible enthusiasm.",
    home: "Tell a short story using your face, tone and voice instead of only the words.",
    days: [
      day("Pace day", "Change speed with purpose", "Important ideas deserve a little more time.", "Record one answer at your natural pace", "Slow only the sentence that carries the main point", "Listen for where the message becomes easier to follow", "Where did a slower pace add authority?"),
      day("Emphasis day", "Make the key words land", "Emphasis guides the listener through your thinking.", "Underline three key words in a short answer", "Stress only those words while speaking", "Repeat without sounding rehearsed", "Which word carried the meaning most clearly?"),
      day("Tone day", "Sound warm and capable", "Professional confidence can include warmth.", "Say the same sentence with neutral, uncertain and assured tone", "Choose the version that feels both kind and credible", "Use it in one real conversation", "What did my tone communicate beyond my words?"),
      day("Story day", "Turn experience into evidence", "A concise story makes your value memorable.", "Choose one challenge from your work experience", "Tell it as situation, action and result", "Add one moment of vocal emphasis", "What value does this story reveal about me?"),
      day("Connection day", "Stay connected while speaking", "Eye contact helps your message feel shared rather than performed.", "Tell your story to one safe listener", "Hold eye contact for one complete key sentence", "Notice the listener instead of monitoring yourself", "What changed when I focused on connection?"),
      day("Spotlight day", "Let your personality be heard", "Expression makes competence easier to remember.", "Record your two-minute career story", "Use deliberate pace, tone and emphasis", "Post it and ask what felt most engaging", "Where can I hear more of myself?"),
      day("Integration day", "Keep your natural authority", "Vocal variety is meaning made audible.", "Compare your first and final recordings", "Name three moments that sound more engaging", "Choose one vocal cue to keep", "How has my delivery changed the way my experience lands?")
    ]
  },
  {
    short: "Pauses",
    title: "Think While You Speak",
    why: "Silence gives your thoughts room to arrive and lets you recover without hiding or apologizing.",
    outcome: "You can pause, organize and continue through an unexpected professional question.",
    learn: ["Purposeful pauses", "Buying thinking time", "Recovering from a mind blank", "Answering unexpected questions"],
    spotlight: "Answer three surprise questions while using calm pauses and clear recovery language.",
    work: "Use one full pause before answering an unexpected question.",
    home: "Allow silence in one conversation without rushing to fill it.",
    days: [
      day("Awareness day", "Notice the rush", "Awareness creates choice.", "Record one unexpected answer", "Mark where your pace speeds up or your thoughts disappear", "Choose one place where a pause would help", "What triggers me to rush?"),
      day("Pause day", "Let silence support you", "A pause can sound composed even when you feel nervous.", "Pause before your first word", "Breathe without adding filler words", "Repeat one answer in the app", "What changed when I allowed the silence?"),
      day("Thinking-time day", "Buy time with confidence", "You can ask for a moment without losing credibility.", "Practise: Let me think about that for a moment", "Choose three keywords before continuing", "Answer with one clear point", "Which phrase helped me feel most in control?"),
      day("Blank-mind day", "Recover without retreating", "A blank moment does not have to end the conversation.", "Stop intentionally during an answer", "Look up, breathe and restate the question", "Continue from one PREP keyword", "What proves that I can recover?"),
      day("Real-world day", "Pause in the real moment", "The skill becomes reliable when it leaves practice.", "Choose one likely professional question", "Use one full pause before answering", "Record what the listener actually did", "How did the pause affect the interaction?"),
      day("Spotlight day", "Stay composed through surprise", "Composure means continuing with choice.", "Ask someone to give you three surprise questions", "Use a pause and one recovery phrase", "Post your strongest answer for feedback", "Where did I sound most composed?"),
      day("Integration day", "Trust the space", "Silence is now part of your communication toolkit.", "Review your three surprise answers", "Name three pieces of recovery evidence", "Choose your permanent pause cue", "What have I learned about my ability to think under pressure?")
    ]
  },
  {
    short: "Personality",
    title: "Bring Out Your Personality",
    why: "Confidence grows when you stop performing communication and let curiosity, warmth and your real perspective come through.",
    outcome: "You initiate and sustain a natural conversation with someone less familiar while staying visibly present.",
    learn: ["Starting conversations", "Open questions and follow-ups", "Sharing your perspective", "Natural eye contact", "Professional presence"],
    spotlight: "Lead a five-minute conversation that moves from a simple opener to a meaningful exchange.",
    work: "Initiate one conversation with a colleague you do not normally speak with.",
    home: "Practise curiosity, listening and personal sharing in one relaxed conversation.",
    days: [
      day("Opener day", "Start naturally", "A conversation only needs one simple opening.", "Prepare three situational openers", "Say each opener with a warm tone and brief eye contact", "Use one with someone less familiar", "What happened after I opened the door?"),
      day("Curiosity day", "Ask what invites more", "Open questions reduce the pressure to perform.", "Turn five closed questions into open questions", "Practise asking them naturally", "Use one and listen to the full answer", "Which question created the most openness?"),
      day("Follow-up day", "Stay with the answer", "Connection grows when people feel genuinely heard.", "Practise two follow-up questions", "Reflect back one detail you heard", "Keep your attention on the other person", "What did I notice when I stopped monitoring myself?"),
      day("Sharing day", "Let yourself be known", "A real conversation includes some of your perspective too.", "Respond with one opinion or related experience", "Keep it concise and connected to what was said", "Notice whether the conversation deepens", "How comfortable was I sharing more of myself?"),
      day("Work connection day", "Initiate professionally", "Leadership starts with visible, human connection.", "Choose a colleague you rarely speak with", "Open a short work-related conversation", "Ask one follow-up and share one useful thought", "What leadership quality did I practise?"),
      day("Spotlight day", "Lead a complete conversation", "Presence is measured through connection, not perfect wording.", "Hold a five-minute conversation with someone less familiar", "Use eye contact, curiosity and one personal contribution", "Write the moment you felt most present", "Which part felt more natural than before?"),
      day("Integration day", "Recognize social courage", "Every completed conversation expands what feels possible.", "Review three conversations from this week", "Name the strongest connection behavior", "Choose one weekly conversation ritual", "What evidence shows I can connect beyond my comfort zone?")
    ]
  },
  {
    short: "Integration",
    title: "Perform Where It Matters",
    why: "Your transformation becomes real when structure, voice, eye contact and recovery remain available in leadership moments.",
    outcome: "You deliver a concise leadership message and handle follow-up questions without withdrawing.",
    learn: ["Leadership communication", "Recommendations and career stories", "Handling follow-up questions", "Your permanent confidence routine"],
    spotlight: "Deliver a three-minute leadership proposal, answer two follow-up questions and compare it with your Week 1 baseline.",
    work: "Complete one meaningful meeting, leadership or career conversation.",
    home: "Initiate one conversation you would previously have avoided.",
    days: [
      day("Integration day", "Assemble your leadership toolkit", "You already have the tools. Now you choose them deliberately.", "List your strongest structure, voice and recovery cues", "Use all three in one app response", "Choose your real leadership challenge", "Which tool gives me the greatest sense of control?"),
      day("Recommendation day", "Make a clear proposal", "Leaders make their thinking visible and actionable.", "Choose one workplace improvement", "Present the recommendation using PREP", "End with one clear next step", "Does my message make the decision easier?"),
      day("Career-story day", "Make your experience visible", "More than a decade of experience deserves clarity and conviction.", "Prepare one structured career story", "Record it with eye contact and vocal intention", "Post it for feedback on leadership presence", "Does my answer reflect the value of my experience?"),
      day("Pressure day", "Handle the follow-up", "Leadership confidence includes staying available when challenged.", "Ask someone to challenge your recommendation", "Pause before answering", "Return to one clear reason and example", "How did I stay present when the pressure increased?"),
      day("Final refinement", "Make one change, then trust", "Preparation should support your voice, not become another hiding place.", "Review feedback and choose one adjustment", "Repeat your final message only twice", "Stop editing and trust your honest best attempt", "What happens when I trust the work I have done?"),
      day("Final spotlight", "Let the transformation be seen", "Your final speech is evidence, not a performance of perfection.", "Record your three-minute leadership proposal", "Answer two unscripted follow-up questions", "Compare it directly with your Week 1 baseline", "What visible changes can I name in myself?"),
      day("Graduation day", "Claim the leader you built", "The six weeks end. Your evidence and new habits continue.", "Write your five strongest pieces of evidence", "Choose three weekly habits to continue", "Record a message to your future self", "Who am I now when it is time to speak and lead?")
    ]
  }
];

function day(type, title, intention, task1, task2, task3, prompt) {
  return {
    type, title, intention, prompt,
    tasks: [
      { title: task1, description: `Complete this first focused step for ${title.toLowerCase()}.`, tag: "5 min" },
      { title: task2, description: "Practise deliberately, then notice one observable change.", tag: "5 min" },
      { title: task3, description: "Take the skill into a visible action and save the evidence.", tag: "5 min" }
    ]
  };
}

const defaultState = {
  startDate: toDateInputValue(new Date()),
  selectedDay: 0,
  selectedWeek: 0,
  completedTasks: {},
  completedDays: {},
  reflections: {},
  confidence: {},
  week2Lecture: {
    currentLevel: null,
    missions: ["", "", ""],
    lastScroll: 0,
    lastViewedAt: null
  }
};

let state = loadState();
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(PROGRAM_KEY));
    return {
      ...defaultState,
      ...stored,
      week2Lecture: {
        ...defaultState.week2Lecture,
        ...(stored?.week2Lecture || {}),
        missions: Array.isArray(stored?.week2Lecture?.missions) ? stored.week2Lecture.missions.slice(0, 3) : ["", "", ""]
      }
    };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  localStorage.setItem(PROGRAM_KEY, JSON.stringify(state));
}

function toDateInputValue(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().split("T")[0];
}

function getProgramDate(dayIndex) {
  const date = new Date(`${state.startDate}T12:00:00`);
  date.setDate(date.getDate() + dayIndex);
  return date;
}

function dayKey(dayIndex) { return `day-${dayIndex}`; }
function taskKey(dayIndex, taskIndex) { return `${dayKey(dayIndex)}-task-${taskIndex}`; }

function getWeekAndDay(dayIndex = state.selectedDay) {
  return { weekIndex: Math.floor(dayIndex / 7), dayOfWeek: dayIndex % 7 };
}

function renderAll() {
  renderHeader();
  renderProgress();
  renderToday();
  renderRoadmap();
  renderWeekDetail();
  renderReflection();
  renderExposureDashboard();
  renderActiveVersion();
}

function renderHeader() {
  const clientName = CLIENT_PROFILE.name || "Speaker";
  document.title = `${clientName}'s Speaking Journey | Speaker's Gym`;
  const welcome = $("#clientWelcome");
  if (welcome) welcome.textContent = `Welcome back, ${clientName}.`;
  const footer = $("#clientFooter");
  if (footer) footer.textContent = `Private six-week coaching journey for ${clientName} · Progress is saved on this device.`;
  $("#todayDate").textContent = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date());
  const start = getProgramDate(0);
  $("#startDateLabel").textContent = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(start);
  $("#startDateInput").value = state.startDate;
}

function renderProgress() {
  const completed = Object.values(state.completedDays).filter(Boolean).length;
  const progress = Math.round((completed / 42) * 100);
  const current = getWeekAndDay(state.selectedDay);
  const courageReps = Object.entries(state.completedTasks).filter(([key, value]) => value && key.endsWith("task-2")).length;
  let streak = 0;
  for (let i = state.selectedDay; i >= 0 && state.completedDays[dayKey(i)]; i--) streak++;

  $("#progressRing").style.setProperty("--progress", progress);
  $("#progressPercent").textContent = `${progress}%`;
  $("#progressSummary").textContent = `Week ${current.weekIndex + 1} · Day ${state.selectedDay + 1} of 42`;
  $("#streakValue").textContent = streak;
  $("#courageValue").textContent = courageReps;
}

function renderToday() {
  const { weekIndex, dayOfWeek } = getWeekAndDay();
  const week = weeks[weekIndex];
  const currentDay = week.days[dayOfWeek];
  const tasksDone = currentDay.tasks.filter((_, i) => state.completedTasks[taskKey(state.selectedDay, i)]).length;

  $("#todayWeekLabel").textContent = `Week ${weekIndex + 1}: ${week.title}`;
  $("#daySwitcherLabel").textContent = `Day ${state.selectedDay + 1}`;
  $("#previousDay").disabled = state.selectedDay === 0;
  $("#nextDay").disabled = state.selectedDay === 41;
  $("#dayNumber").textContent = String(state.selectedDay + 1).padStart(2, "0");
  $("#dayType").textContent = currentDay.type;
  $("#dayTitle").textContent = currentDay.title;
  $("#dayIntention").textContent = currentDay.intention;
  $("#focusTitle").textContent = week.title;
  $("#focusWhy").textContent = week.why;
  $("#focusOutcome").textContent = week.outcome;
  $("#taskCount").textContent = `${tasksDone} of 3 complete`;
  $("#taskProgress").style.width = `${(tasksDone / 3) * 100}%`;

  const complete = Boolean(state.completedDays[dayKey(state.selectedDay)]);
  $("#completeDayButton").textContent = complete ? "Day completed ✓" : "Complete today";
  $("#completeDayButton").classList.toggle("completed", complete);

  $("#taskList").innerHTML = currentDay.tasks.map((task, i) => {
    const done = Boolean(state.completedTasks[taskKey(state.selectedDay, i)]);
    return `<label class="task-item ${done ? "done" : ""}">
      <input type="checkbox" data-task-index="${i}" ${done ? "checked" : ""} />
      <span class="task-check" aria-hidden="true">✓</span>
      <span class="task-copy"><strong>${task.title}</strong><small>${task.description}</small></span>
      <span class="task-tag">${task.tag}</span>
    </label>`;
  }).join("");

  $$("#taskList input").forEach(input => {
    input.addEventListener("change", (event) => {
      const taskIndex = Number(event.target.dataset.taskIndex);
      state.completedTasks[taskKey(state.selectedDay, taskIndex)] = event.target.checked;
      if (!event.target.checked) state.completedDays[dayKey(state.selectedDay)] = false;
      saveState();
      renderProgress(); renderToday(); renderRoadmap();
    });
  });
}

function renderActiveVersion() {
  const panel = $("#activeVersionMission");
  if (!panel) return;
  const lecture = state.week2Lecture;
  const missions = (lecture?.missions || []).filter(Boolean);
  if (!lecture?.currentLevel && !missions.length) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  const currentLevel = Number(lecture.currentLevel || 1);
  const nextLevel = Math.min(10, currentLevel + 1);
  $("#activeVersionLevel").textContent = `Level ${currentLevel} → Level ${nextLevel}`;
  $("#activeVersionTitle").textContent = "This week's exposure commitments";
  $("#activeVersionMissions").innerHTML = missions.length
    ? missions.map(mission => `<li>${escapeHTML(mission)}</li>`).join("")
    : "<li>Choose three small actions inside Lecture 2.</li>";
}

function renderExposureDashboard() {
  const staircase = $("#mainExposureStaircase");
  const detail = $("#mainExposureDetail");
  const plan = $("#mainExposurePlan");
  if (!EXPOSURE || !staircase || !detail || !plan) return;

  const selected = EXPOSURE.clampLevel(state.week2Lecture.currentLevel || 1);
  const next = Math.min(10, selected + 1);
  const currentLevel = EXPOSURE.levels[selected - 1];
  const nextLevel = EXPOSURE.levels[next - 1];
  const isTop = selected === 10;
  const missions = (state.week2Lecture.missions || []).filter(Boolean);
  staircase.style.setProperty("--current-level", selected);

  staircase.innerHTML = EXPOSURE.levels.map((level, index) => {
    const number = index + 1;
    const levelState = number < selected ? "done" : number === selected ? "current" : number === next ? "next" : "ahead";
    return `<button class="exposure-node ${levelState}" type="button" data-main-level="${number}" aria-label="Level ${number}: ${level.name}" aria-pressed="${number === selected}" title="Level ${number}: ${level.name}">
      <span>${number}</span><small>${level.name}</small>
    </button>`;
  }).join("");

  detail.innerHTML = `<article class="level-focus-card current">
      <small>CURRENT RELIABLE LEVEL</small>
      <span>LEVEL ${selected}</span>
      <h3>${currentLevel.name}</h3>
      <p>${currentLevel.behavior}</p>
    </article>
    <span class="level-focus-arrow" aria-hidden="true">→</span>
    <article class="level-focus-card next">
      <small>${isTop ? "KEEP EXPRESSING" : "PRACTISE NEXT"}</small>
      <span>LEVEL ${next}</span>
      <h3>${nextLevel.name}</h3>
      <p>${nextLevel.behavior}</p>
      <strong>Begin with: “${nextLevel.starter}”</strong>
    </article>
    ${missions.length ? `<article class="level-focus-card commitments"><small>THIS WEEK</small><ul>${missions.map(mission => `<li>${escapeHTML(mission)}</li>`).join("")}</ul></article>` : ""}`;

  plan.innerHTML = `<div><small>PRACTISE IN THE APP</small><p>${nextLevel.practice}</p></div>
    <div><small>POST ON SKOOL</small><p>${nextLevel.community}</p></div>
    <div><small>COLLECT THE EVIDENCE</small><p>${nextLevel.evidence}</p></div>`;
  $("#mainCurrentLevel").textContent = `Level ${selected} · ${EXPOSURE.levels[selected - 1].name}`;
  $("#mainNextLevel").textContent = selected === 10
    ? "Level 10 · Keep expressing"
    : `Level ${next} · ${EXPOSURE.levels[next - 1].name}`;

  staircase.querySelectorAll("[data-main-level]").forEach(button => {
    button.addEventListener("click", () => {
      const level = EXPOSURE.clampLevel(button.dataset.mainLevel);
      state.week2Lecture.currentLevel = level;
      saveState();
      renderExposureDashboard();
      renderActiveVersion();
      renderWeekDetail();
      showToast(`Level ${level} saved as your current training position.`);
    });
  });
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

function formatLectureDate(value) {
  if (!value) return "Date to be chosen";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T12:00:00`));
}

function renderRoadmap() {
  $("#weekRoadmap").innerHTML = weeks.map((week, index) => {
    const completedCount = week.days.filter((_, dayIndex) => state.completedDays[dayKey(index * 7 + dayIndex)]).length;
    const complete = completedCount === 7;
    return `<button class="week-card ${state.selectedWeek === index ? "selected" : ""} ${complete ? "complete" : ""}" data-week="${index}" type="button">
      <span class="week-card-number">${complete ? "✓" : index + 1}</span>
      <small>Week ${index + 1}</small>
      <strong>${week.title}</strong>
      <p>${completedCount}/7 days complete</p>
    </button>`;
  }).join("");

  $$(".week-card").forEach(button => button.addEventListener("click", () => {
    state.selectedWeek = Number(button.dataset.week);
    saveState(); renderRoadmap(); renderWeekDetail();
    $("#weekDetail").scrollIntoView({ behavior: "smooth", block: "center" });
  }));
}

function renderWeekDetail() {
  const week = weeks[state.selectedWeek];
  const currentWeek = getWeekAndDay(state.selectedDay).weekIndex;
  $("#detailWeek").textContent = `Week ${state.selectedWeek + 1} lecture`;
  $("#detailTitle").textContent = week.title;
  $("#weekStatus").textContent = state.selectedWeek === currentWeek ? "Current focus" : state.selectedWeek < currentWeek ? "Previous week" : "Coming up";
  $("#weekOutcomeSummary").textContent = week.outcome;
  $("#weekCoreSkill").textContent = week.learn[0];
  $("#learnList").innerHTML = week.learn.map(item => `<li>${item}</li>`).join("");
  $("#spotlightCopy").textContent = week.spotlight;
  $("#workMission").textContent = week.work;
  $("#homeMission").textContent = week.home;
  const lectureEntry = $("#week2LectureEntry");
  if (lectureEntry) {
    const show = state.selectedWeek === 1;
    lectureEntry.hidden = !show;
    if (show) {
      const lecture = state.week2Lecture;
      const missions = (lecture.missions || []).filter(Boolean);
      $("#week2LectureButton").textContent = lecture.lastViewedAt ? "Open Lecture 2" : "Start Lecture 2";
      $("#week2LectureStatus").innerHTML = lecture.currentLevel
        ? `<strong>Current level: Level ${lecture.currentLevel}</strong><span>Next level: Level ${Math.min(10, Number(lecture.currentLevel) + 1)}</span><span>${missions.length}/3 weekly commitments saved</span>`
        : `<strong>Live coaching experience</strong><span>Understand, choose, speak, repeat and commit.</span>`;
    }
  }
}

function renderReflection() {
  const { weekIndex, dayOfWeek } = getWeekAndDay();
  const currentDay = weeks[weekIndex].days[dayOfWeek];
  $("#reflectionPrompt").textContent = currentDay.prompt;
  $("#reflectionDay").textContent = `Day ${state.selectedDay + 1} reflection`;
  $("#reflectionTopic").textContent = currentDay.title;
  $("#reflectionText").value = state.reflections[dayKey(state.selectedDay)] || "";
  $$('input[name="confidence"]').forEach(input => {
    input.checked = Number(input.value) === Number(state.confidence[dayKey(state.selectedDay)]);
  });

  const reflections = Object.entries(state.reflections)
    .filter(([, text]) => String(text || "").trim())
    .map(([key, text]) => {
      const dayIndex = Number(key.replace("day-", ""));
      const position = getWeekAndDay(dayIndex);
      return {
        dayIndex,
        text: String(text).trim(),
        confidence: Number(state.confidence[key] || 0),
        title: weeks[position.weekIndex].days[position.dayOfWeek].title,
        date: getProgramDate(dayIndex)
      };
    })
    .sort((a, b) => b.dayIndex - a.dayIndex);

  $("#reflectionCount").textContent = reflections.length;
  $("#reflectionHistory").innerHTML = reflections.length
    ? reflections.map(item => `<button class="reflection-entry" type="button" data-reflection-day="${item.dayIndex}">
        <span><small>DAY ${item.dayIndex + 1}</small><time>${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(item.date)}</time></span>
        <strong>${escapeHTML(item.title)}</strong>
        <p>${escapeHTML(item.text)}</p>
        ${item.confidence ? `<em>Confidence ${item.confidence}/5</em>` : ""}
      </button>`).join("")
    : `<div class="reflection-empty"><span>✦</span><strong>Your evidence will collect here.</strong><p>Save your first reflection and return to it whenever you need proof of your progress.</p></div>`;

  $$("[data-reflection-day]").forEach(button => button.addEventListener("click", () => {
    selectDay(Number(button.dataset.reflectionDay));
    $("#reflection").scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}

function selectDay(dayIndex, scroll = false) {
  state.selectedDay = Math.max(0, Math.min(41, dayIndex));
  const { weekIndex } = getWeekAndDay();
  state.selectedWeek = weekIndex;
  saveState(); renderAll();
  if (scroll) $("#today").scrollIntoView({ behavior: "smooth", block: "start" });
}

function showToast(message) {
  clearTimeout(toastTimer);
  $("#toast").textContent = message;
  $("#toast").classList.add("show");
  toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2400);
}

window.SpeakersGymPortal = {
  client: CLIENT_PROFILE,
  weeks,
  getState: () => state,
  updateLecture(patch) {
    state.week2Lecture = { ...state.week2Lecture, ...patch };
    saveState();
  },
  saveState,
  renderAll,
  showToast,
  toDateInputValue
};

$("#previousDay").addEventListener("click", () => selectDay(state.selectedDay - 1));
$("#nextDay").addEventListener("click", () => selectDay(state.selectedDay + 1));
$("#completeDayButton").addEventListener("click", () => {
  const key = dayKey(state.selectedDay);
  const completing = !state.completedDays[key];
  state.completedDays[key] = completing;
  for (let i = 0; i < 3; i++) state.completedTasks[taskKey(state.selectedDay, i)] = completing;
  saveState(); renderProgress(); renderToday(); renderRoadmap();
  showToast(completing ? "Day completed. That is evidence." : "Day reopened for practice.");
});

$("#reflectionForm").addEventListener("submit", event => {
  event.preventDefault();
  state.reflections[dayKey(state.selectedDay)] = $("#reflectionText").value.trim();
  const confidence = $('input[name="confidence"]:checked');
  if (confidence) state.confidence[dayKey(state.selectedDay)] = Number(confidence.value);
  saveState();
  renderReflection();
  $("#savedBadge").classList.add("show");
  setTimeout(() => $("#savedBadge").classList.remove("show"), 1800);
  showToast("Reflection saved privately on this device.");
});

$("#startDateButton").addEventListener("click", () => {
  const input = $("#startDateInput");
  if (typeof input.showPicker === "function") input.showPicker(); else input.click();
});
$("#startDateInput").addEventListener("change", event => {
  if (!event.target.value) return;
  state.startDate = event.target.value;
  saveState(); renderHeader(); renderReflection(); showToast("Program dates updated.");
});

$(".mobile-menu").addEventListener("click", event => {
  document.body.classList.toggle("menu-open");
  event.currentTarget.setAttribute("aria-expanded", document.body.classList.contains("menu-open"));
});
function closeMobileMenu() {
  document.body.classList.remove("menu-open");
  $(".mobile-menu").setAttribute("aria-expanded", "false");
}
$(".menu-close").addEventListener("click", closeMobileMenu);
$(".menu-backdrop").addEventListener("click", closeMobileMenu);
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.body.classList.contains("menu-open")) closeMobileMenu();
});
$$('.side-nav a').forEach(link => link.addEventListener("click", closeMobileMenu));

const sectionObserver = new IntersectionObserver(entries => {
  const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  $$(".side-nav a").forEach(link => link.classList.toggle("active", link.dataset.nav === visible.target.id));
}, { threshold: [0.2, 0.45], rootMargin: "-15% 0px -55%" });
$$('#today, #exposure, #journey, #reflection').forEach(section => sectionObserver.observe(section));

renderAll();
