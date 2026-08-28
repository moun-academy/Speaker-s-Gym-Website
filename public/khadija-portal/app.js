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
      weekOneDay("Coaching day", "Think clearly, speak simply", "Today is a coaching session. Build PREP, speak twice and accept one real-world mission.", "Open the Week 1 coaching experience and accept your mission", "Practice another PREP response", "Record an extra Version in the Speaker's Gym app", "Which part of PREP made speaking feel easier?"),
      weekOneDay("Mission day", "Use the skill once", "One meaningful action is enough. The win is attempting it.", "Attempt your accepted Week 1 Mission", "Practice another PREP response", "Share an optional rep with the community", "What happened when I acted before I felt completely ready?"),
      weekOneDay("Mission day", "Collect real evidence", "Reality is more useful than the prediction your mind made in advance.", "Attempt your accepted Week 1 Mission", "Record another Version", "Ask AI for one optional focus point", "What did reality show me?"),
      weekOneDay("Mission day", "Speak from anchors", "Remember the idea, not the sentence.", "Attempt your accepted Week 1 Mission", "Practice from four PREP keywords", "Try one gentle workplace question", "What helped me continue without a script?"),
      weekOneDay("Mission day", "Make your thinking visible", "A clear contribution is evidence, even when nerves are present.", "Attempt your accepted Week 1 Mission", "Practice a second workplace PREP answer", "Share an optional community update", "What did I make visible by speaking?"),
      weekOneDay("Evidence day", "Compare prediction with reality", "Confidence grows when you notice what your action proved.", "Return to Week 1 and record what actually happened", "Record one extra PREP Version", "Share your evidence card with the community", "How was reality different from my prediction?"),
      weekOneDay("Integration day", "Keep the evidence", "One completed exposure can become a reference point for the next one.", "Complete your Week 1 Mission reflection", "Practice another PREP response", "Choose one PREP cue to carry into Week 2", "What can I now do more clearly than seven days ago?")
    ]
  },
  {
    short: "Voice",
    title: "Develop a Stronger Voice",
    subtitle: "From physical anxiety to audible presence",
    why: "Grounded volume keeps your message audible from the first word through the final word without forcing your voice.",
    outcome: "You can deliver one complete answer at a clear, natural volume and test that voice in one right-sized real situation.",
    learn: ["Grounded volume", "Audible sentence endings", "Speaking without pushing", "Choosing a right-sized situation", "Collecting voice evidence"],
    spotlight: "Deliver your familiar PREP answer with grounded volume from beginning to end.",
    work: "Make one complete professional sentence clearly audible.",
    home: "Practice one familiar answer at a clear, natural and sustainable volume.",
    days: [
      weekOneDay("Coaching day", "Make your message arrive", "Calibrate grounded volume, speak two Versions and accept one real-world mission.", "Open the Week 2 coaching experience and accept your mission", "Practice the volume ladder once more", "Record an extra grounded-volume Version", "What made my voice feel strong without feeling forced?"),
      weekOneDay("Mission day", "Use your voice once", "One clearly audible sentence is enough. The win is attempting it.", "Attempt your accepted Week 2 Mission", "Practice one familiar sentence at grounded volume", "Share an optional voice rep with the community", "What happened when I allowed myself to be heard?"),
      weekOneDay("Mission day", "Keep the ending alive", "Your message deserves the final word as much as the first.", "Attempt your accepted Week 2 Mission", "Practice carrying one sentence through its final three words", "Record one optional Version in the app", "Where did my voice usually fade, and what changed?"),
      weekOneDay("Mission day", "Send the message", "Focus on the listener receiving the sentence, not on whether you feel loud.", "Attempt your accepted Week 2 Mission", "Practice sending one Point to an imagined listener", "Ask AI for one optional voice focus", "Did the sentence arrive clearly?"),
      weekOneDay("Mission day", "Make yourself audible", "A shaky voice can still carry a complete message.", "Attempt your accepted Week 2 Mission", "Repeat your PREP answer at grounded volume", "Share an optional community update", "What did I communicate even with nerves present?"),
      weekOneDay("Evidence day", "Compare prediction with reality", "Reality is more useful than what voice anxiety predicted.", "Return to Week 2 and record what actually happened", "Record one extra grounded-volume Version", "Share your Evidence Card with the community", "How was reality different from my prediction?"),
      weekOneDay("Integration day", "Keep your stronger setting", "One completed voice exposure becomes a reference point for the next one.", "Complete your Week 2 Mission reflection", "Practice one sentence from first word to final word", "Choose one grounded-volume cue to keep", "What can my voice now do more reliably than last week?")
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
      day("Thinking-time day", "Buy time with confidence", "You can ask for a moment without losing credibility.", "Practice: Let me think about that for a moment", "Choose three keywords before continuing", "Answer with one clear point", "Which phrase helped me feel most in control?"),
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
    home: "Practice curiosity, listening and personal sharing in one relaxed conversation.",
    days: [
      day("Opener day", "Start naturally", "A conversation only needs one simple opening.", "Prepare three situational openers", "Say each opener with a warm tone and brief eye contact", "Use one with someone less familiar", "What happened after I opened the door?"),
      day("Curiosity day", "Ask what invites more", "Open questions reduce the pressure to perform.", "Turn five closed questions into open questions", "Practice asking them naturally", "Use one and listen to the full answer", "Which question created the most openness?"),
      day("Follow-up day", "Stay with the answer", "Connection grows when people feel genuinely heard.", "Practice two follow-up questions", "Reflect back one detail you heard", "Keep your attention on the other person", "What did I notice when I stopped monitoring myself?"),
      day("Sharing day", "Let yourself be known", "A real conversation includes some of your perspective too.", "Respond with one opinion or related experience", "Keep it concise and connected to what was said", "Notice whether the conversation deepens", "How comfortable was I sharing more of myself?"),
      day("Work connection day", "Initiate professionally", "Leadership starts with visible, human connection.", "Choose a colleague you rarely speak with", "Open a short work-related conversation", "Ask one follow-up and share one useful thought", "What leadership quality did I practice?"),
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
      { title: task2, description: "Practice deliberately, then notice one observable change.", tag: "5 min" },
      { title: task3, description: "Take the skill into a visible action and save the evidence.", tag: "5 min" }
    ]
  };
}

function weekOneDay(type, title, intention, required, optionalOne, optionalTwo, prompt) {
  const item = day(type, title, intention, required, optionalOne, optionalTwo, prompt);
  item.tasks[0] = { ...item.tasks[0], kind: "required", tag: "Required" };
  item.tasks[1] = { ...item.tasks[1], kind: "optional", tag: "Optional" };
  item.tasks[2] = { ...item.tasks[2], kind: "optional", tag: "Optional" };
  return item;
}

const defaultState = {
  startDate: toDateInputValue(new Date()),
  selectedDay: 0,
  selectedWeek: 0,
  completedTasks: {},
  completedDays: {},
  reflections: {},
  confidence: {},
  evidenceBank: [],
  week1Lecture: {
    flowVersion: 3,
    missionModelVersion: 2,
    currentStep: 0,
    selectedTopic: "",
    prep: { point: "", reason: "", example: "", finalPoint: "" },
    keywords: { point: "", reason: "", example: "", finalPoint: "" },
    versionsCompleted: 0,
    coachImprovement: "",
    workplaceQuestion: "",
    workplacePrep: { point: "", reason: "", example: "", finalPoint: "" },
    prediction: "",
    beliefBefore: 50,
    missionLevel: null,
    mission: "",
    missionStatus: "not-started",
    acceptedAt: null,
    actualResult: "",
    beliefAfter: 50,
    evidenceId: null,
    lectureCompletedAt: null,
    completedAt: null,
    lastViewedAt: null
  },
  week2Lecture: {
    flowVersion: 1,
    currentStep: 0,
    currentLevel: null,
    voicePattern: "",
    voiceZone: "",
    versionsCompleted: 0,
    coachImprovement: "",
    prediction: "",
    beliefBefore: 50,
    missionLevel: null,
    mission: "",
    missionStatus: "not-started",
    acceptedAt: null,
    actualResult: "",
    beliefAfter: 50,
    evidenceId: null,
    lectureCompletedAt: null,
    completedAt: null,
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
    const storedWeek1 = stored?.week1Lecture || {};
    const storedWeek2 = stored?.week2Lecture || {};
    const keepStoredMission = Number(storedWeek1.missionModelVersion || 0) === 2
      || (storedWeek1.missionStatus === "completed" && Boolean(storedWeek1.evidenceId));
    const legacyStep = Number(storedWeek1.currentStep || 0);
    const migratedStep = legacyStep === 0 ? 0
      : legacyStep <= 12 ? legacyStep + 1
      : legacyStep <= 18 ? 14
      : legacyStep === 19 ? 15
      : legacyStep === 20 ? 16
      : legacyStep === 21 ? 17
      : legacyStep === 22 ? 18
      : legacyStep === 23 ? (storedWeek1.missionStatus === "completed" ? 21 : 20)
      : 22;
    const versionTwoStep = storedWeek1.flowVersion === 2 ? Number(storedWeek1.currentStep || 0) : migratedStep;
    const flowStep = storedWeek1.flowVersion === 3
      ? Number(storedWeek1.currentStep || 0)
      : versionTwoStep <= 2 ? versionTwoStep : versionTwoStep - 1;
    return {
      ...defaultState,
      ...stored,
      evidenceBank: Array.isArray(stored?.evidenceBank) ? stored.evidenceBank : [],
      week1Lecture: {
        ...defaultState.week1Lecture,
        ...storedWeek1,
        flowVersion: 3,
        missionModelVersion: 2,
        currentStep: keepStoredMission ? flowStep : Math.min(flowStep, 16),
        missionLevel: keepStoredMission ? (storedWeek1.missionLevel || null) : null,
        mission: keepStoredMission ? (storedWeek1.mission || "") : "",
        missionStatus: keepStoredMission ? (storedWeek1.missionStatus || "not-started") : "not-started",
        acceptedAt: keepStoredMission ? (storedWeek1.acceptedAt || null) : null,
        actualResult: keepStoredMission ? (storedWeek1.actualResult || "") : "",
        evidenceId: keepStoredMission ? (storedWeek1.evidenceId || null) : null,
        lectureCompletedAt: keepStoredMission
          ? (Number(storedWeek1.flowVersion || 0) >= 2
            ? (storedWeek1.lectureCompletedAt || null)
            : (storedWeek1.missionStatus && storedWeek1.missionStatus !== "not-started" ? storedWeek1.acceptedAt || null : null))
          : null,
        completedAt: keepStoredMission ? (storedWeek1.completedAt || null) : null,
        prep: { ...defaultState.week1Lecture.prep, ...(storedWeek1.prep || {}) },
        keywords: { ...defaultState.week1Lecture.keywords, ...(storedWeek1.keywords || {}) },
        workplacePrep: { ...defaultState.week1Lecture.workplacePrep, ...(storedWeek1.workplacePrep || {}) }
      },
      week2Lecture: {
        ...defaultState.week2Lecture,
        ...(storedWeek2.flowVersion === 1 ? storedWeek2 : {}),
        flowVersion: 1,
        currentLevel: storedWeek2.currentLevel || null
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
  $("#practiceDuration").innerHTML = weekIndex === 0 && dayOfWeek === 0
    ? '<span aria-hidden="true">◷</span> Your 60-minute coaching session'
    : '<span aria-hidden="true">◷</span> Your 15-minute practice ritual';
  $("#focusTitle").textContent = week.title;
  $("#focusWhy").textContent = week.why;
  $("#focusOutcome").textContent = week.outcome;
  $("#taskCount").textContent = weekIndex === 0 ? "One mission · optional extra reps" : `${tasksDone} of 3 complete`;
  $("#taskProgress").style.width = `${(tasksDone / 3) * 100}%`;

  const complete = Boolean(state.completedDays[dayKey(state.selectedDay)]);
  $("#completeDayButton").textContent = complete ? "Day completed ✓" : "Complete today";
  $("#completeDayButton").classList.toggle("completed", complete);

  $("#taskList").innerHTML = currentDay.tasks.map((task, i) => {
    const done = Boolean(state.completedTasks[taskKey(state.selectedDay, i)]);
    return `<label class="task-item ${task.kind || "standard"} ${done ? "done" : ""}">
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
  const week2 = state.week2Lecture;
  if (state.selectedWeek === 1 && week2?.missionStatus && week2.missionStatus !== "not-started" && week2.mission) {
    panel.hidden = false;
    $("#activeVersionLevel").textContent = `Week 2 · Level ${week2.missionLevel || week2.currentLevel || 1}`;
    $("#activeVersionTitle").textContent = week2.missionStatus === "completed" ? "Voice evidence collected" : "Your grounded-volume mission";
    $("#activeVersionMissions").innerHTML = `<li>${escapeHTML(week2.mission)}</li>`;
    return;
  }
  const week1 = state.week1Lecture;
  if (week1?.missionStatus && week1.missionStatus !== "not-started" && week1.mission) {
    panel.hidden = false;
    $("#activeVersionLevel").textContent = `Week 1 · Level ${week1.missionLevel || state.week2Lecture.currentLevel || 1}`;
    $("#activeVersionTitle").textContent = week1.missionStatus === "completed" ? "Evidence collected" : "Your accepted mission";
    $("#activeVersionMissions").innerHTML = `<li>${escapeHTML(week1.mission)}</li>`;
    return;
  }
  const lecture = state.week2Lecture;
  if (!lecture?.currentLevel) {
    panel.hidden = true;
    return;
  }
  panel.hidden = false;
  const currentLevel = Number(lecture.currentLevel || 1);
  const nextLevel = Math.min(10, currentLevel + 1);
  $("#activeVersionLevel").textContent = `Level ${currentLevel} → Level ${nextLevel}`;
  $("#activeVersionTitle").textContent = "Your current voice-exposure level";
  $("#activeVersionMissions").innerHTML = "<li>Complete Lecture 2 to activate one grounded-volume mission.</li>";
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
  const missions = state.week2Lecture.missionStatus !== "not-started" && state.week2Lecture.mission
    ? [state.week2Lecture.mission]
    : [];
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
      <small>${isTop ? "KEEP EXPRESSING" : "PRACTICE NEXT"}</small>
      <span>LEVEL ${next}</span>
      <h3>${nextLevel.name}</h3>
      <p>${nextLevel.behavior}</p>
      <strong>Begin with: “${nextLevel.starter}”</strong>
    </article>
    ${missions.length ? `<article class="level-focus-card commitments"><small>THIS WEEK</small><ul>${missions.map(mission => `<li>${escapeHTML(mission)}</li>`).join("")}</ul></article>` : ""}`;

  plan.innerHTML = `<div><small>PRACTICE IN THE APP</small><p>${nextLevel.practice}</p></div>
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
  const week1Entry = $("#week1LectureEntry");
  if (week1Entry) {
    const showWeek1 = state.selectedWeek === 0;
    week1Entry.hidden = !showWeek1;
    if (showWeek1) {
      const week1 = state.week1Lecture;
      const evidenceComplete = Boolean(week1.completedAt);
      const lectureComplete = Boolean(week1.lectureCompletedAt);
      $("#week1LectureButton").textContent = evidenceComplete || lectureComplete ? "Review Lecture 1" : week1.lastViewedAt ? "Continue Lecture 1" : "Start Lecture 1";
      const reportButton = $("#week1MissionButton");
      if (reportButton) reportButton.hidden = !(lectureComplete && !evidenceComplete);
      $("#week1LectureStatus").innerHTML = evidenceComplete
        ? `<strong>Week 1 complete</strong><span>PREP unlocked · ${week1.versionsCompleted || 0} Versions · Evidence collected</span>`
        : lectureComplete
          ? `<strong>Mission active</strong><span>${escapeHTML(week1.mission)} Return after the real conversation to record what happened.</span>`
          : `<strong>Discover → Build → Speak → Prove</strong><span>A live PREP coaching experience with one real-world mission.</span>`;
    }
  }
  const lectureEntry = $("#week2LectureEntry");
  if (lectureEntry) {
    const show = state.selectedWeek === 1;
    lectureEntry.hidden = !show;
    if (show) {
      const lecture = state.week2Lecture;
      const evidenceComplete = Boolean(lecture.completedAt);
      const lectureComplete = Boolean(lecture.lectureCompletedAt);
      $("#week2LectureButton").textContent = evidenceComplete || lectureComplete ? "Review Lecture 2" : lecture.lastViewedAt ? "Continue Lecture 2" : "Start Lecture 2";
      const reportButton = $("#week2MissionButton");
      if (reportButton) reportButton.hidden = !(lectureComplete && !evidenceComplete);
      $("#week2LectureStatus").innerHTML = evidenceComplete
        ? `<strong>Week 2 complete</strong><span>Grounded Volume unlocked · ${lecture.versionsCompleted || 0} Versions · Evidence collected</span>`
        : lectureComplete
          ? `<strong>Voice mission active</strong><span>${escapeHTML(lecture.mission)} Return after the real conversation to record what happened.</span>`
          : `<strong>Discover → Calibrate → Speak → Prove</strong><span>A live grounded-volume coaching experience with one real-world mission.</span>`;
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

  const evidenceCards = [...state.evidenceBank].sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)));
  $("#reflectionCount").textContent = reflections.length + evidenceCards.length;
  $("#reflectionHistory").innerHTML = evidenceCards.length || reflections.length
    ? `${evidenceCards.map(item => `<article class="evidence-bank-entry">
        <header><small>WEEK ${item.week} · ${escapeHTML(item.skill)}</small><span>EVIDENCE</span></header>
        <div><strong>Prediction</strong><p>${escapeHTML(item.prediction)}</p></div>
        <div><strong>Reality</strong><p>${escapeHTML(item.reality)}</p></div>
        <footer><span>Belief</span><strong>${item.beliefBefore}% → ${item.beliefAfter}%</strong></footer>
      </article>`).join("")}${reflections.map(item => `<button class="reflection-entry" type="button" data-reflection-day="${item.dayIndex}">
        <span><small>DAY ${item.dayIndex + 1}</small><time>${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(item.date)}</time></span>
        <strong>${escapeHTML(item.title)}</strong>
        <p>${escapeHTML(item.text)}</p>
        ${item.confidence ? `<em>Confidence ${item.confidence}/5</em>` : ""}
      </button>`).join("")}`
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
  updateWeek1(patch) {
    state.week1Lecture = { ...state.week1Lecture, ...patch };
    saveState();
  },
  setExposureLevel(level) {
    state.week2Lecture.currentLevel = EXPOSURE?.clampLevel(level) || 1;
    saveState();
    renderAll();
  },
  saveEvidence(card) {
    const existing = state.evidenceBank.findIndex(item => item.id === card.id);
    if (existing >= 0) state.evidenceBank[existing] = card;
    else state.evidenceBank.push(card);
    saveState();
  },
  resetWeek1() {
    state.evidenceBank = state.evidenceBank.filter(item => Number(item.week) !== 1);
    state.week1Lecture = JSON.parse(JSON.stringify(defaultState.week1Lecture));
    state.week2Lecture.currentLevel = null;
    saveState();
    renderAll();
  },
  resetWeek2() {
    state.evidenceBank = state.evidenceBank.filter(item => Number(item.week) !== 2);
    state.week2Lecture = JSON.parse(JSON.stringify(defaultState.week2Lecture));
    saveState();
    renderAll();
  },
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
$("#week1ResetButton")?.addEventListener("click", () => {
  const confirmed = window.confirm("Reset Lecture 1? This will clear the PREP answers, Versions, prediction, mission, Week 1 evidence and selected test level. The rest of Khadija's portal will stay unchanged.");
  if (!confirmed) return;
  window.SpeakersGymPortal.resetWeek1();
  showToast("Lecture 1 is ready for a fresh start.");
});
$("#week2ResetButton")?.addEventListener("click", () => {
  const confirmed = window.confirm("Reset Lecture 2? This will clear the voice pattern, Versions, prediction, mission, Week 2 evidence and selected situation level. The rest of Khadija's portal will stay unchanged.");
  if (!confirmed) return;
  window.SpeakersGymPortal.resetWeek2();
  showToast("Lecture 2 is ready for a fresh start.");
});
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
