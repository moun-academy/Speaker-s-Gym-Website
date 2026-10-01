(function () {
  "use strict";

  const DATA = window.PANKAJ_PORTAL_DATA;
  const STORAGE_KEY = DATA.storageKey;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const flatDays = DATA.weeks.flatMap((week, weekIndex) => week.days.map((day, dayIndex) => ({ ...day, weekIndex, dayIndex })));
  const clampLevel = value => Math.max(1, Math.min(10, Number(value) || 1));
  window.SpeakersGymExposure = { levels: DATA.levels, clampLevel };
  let toastTimer;

  const todayISO = (() => {
    const date = new Date();
    const offset = date.getTimezoneOffset();
    return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
  })();

  const defaults = {
    version: 3,
    startDate: todayISO,
    selectedDay: 0,
    selectedWeek: 0,
    selectedReviewWeek: 1,
    viewLevel: 2,
    currentLevel: 1,
    nextLevel: 2,
    completedDays: {},
    completedTasks: {},
    reflections: {},
    weeklyReviews: {},
    confidence: {},
    repetitions: [],
    evidence: [],
    coachNotes: { appNotes: "", upcomingMoment: "", pressureSkill: "", nextTarget: "" },
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
    },
    week3Lecture: {
      flowVersion: 1,
      currentStep: 0,
      currentLevel: null,
      demoMode: "",
      baselineWpm: null,
      baselineSeconds: null,
      feltRates: {},
      sortAnswers: {},
      paceMap: { point: "hold", reason: "run", example: "run", finalPoint: "stop" },
      paceMapConfigured: false,
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
    },
    week5Lecture: {
      "flowVersion": 1,
      "currentStep": 0,
      "currentLevel": null,
      "demoMode": "",
      "demoTried": [],
      "rapportChoice": "",
      "rangeLow": null,
      "rangeHigh": null,
      "rangeSelfCheck": false,
      "stressTried": [],
      "landed": 0,
      "landSelfCheck": false,
      "sortAnswers": {},
      "mix": {},
      "performSpan": null,
      "performBest": 0,
      "performSelfCheck": false,
      "story": {},
      "storyMoves": {},
      "prediction": "",
      "missionLevel": null,
      "mission": "",
      "missionStatus": "not-started",
      "acceptedAt": null,
      "actualResult": "",
      "evidenceId": null,
      "lectureCompletedAt": null,
      "completedAt": null,
      "lastViewedAt": null
},
    week4Lecture: {
      flowVersion: 1,
      currentStep: 0,
      currentLevel: null,
      feltSilence: false,
      spotFound: [],
      sortAnswers: {},
      trainerReps: 0,
      trainerAttempts: 0,
      readingCompleted: false,
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

  function loadState(fromAccount) {
    try {
      const saved = fromAccount !== undefined ? fromAccount : JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (!saved || typeof saved !== "object") return structuredClone(defaults);
      return {
        ...structuredClone(defaults),
        ...saved,
      week5Lecture: { ...defaults.week5Lecture, ...(saved?.week5Lecture || {}), currentStep: Math.max(0, Math.min(15, Number(saved?.week5Lecture?.currentStep) || 0)) },
        version: 3,
        selectedReviewWeek: Math.max(1, Math.min(6, Number(saved.selectedReviewWeek) || Math.floor((Number(saved.selectedDay) || 0) / 7) + 1)),
        viewLevel: Number(saved.version) >= 3 ? clampLevel(saved.viewLevel) : clampLevel(saved.nextLevel || 2),
        completedDays: { ...defaults.completedDays, ...(saved.completedDays || {}) },
        completedTasks: { ...defaults.completedTasks, ...(saved.completedTasks || {}) },
        reflections: { ...defaults.reflections, ...(saved.reflections || {}) },
        weeklyReviews: { ...defaults.weeklyReviews, ...(saved.weeklyReviews || {}) },
        confidence: { ...defaults.confidence, ...(saved.confidence || {}) },
        repetitions: Array.isArray(saved.repetitions) ? saved.repetitions : [],
        evidence: Array.isArray(saved.evidence) ? saved.evidence : [],
        coachNotes: { ...defaults.coachNotes, ...(saved.coachNotes || {}) },
        week1Lecture: {
          ...defaults.week1Lecture,
          ...(saved.week1Lecture || {}),
          prep: { ...defaults.week1Lecture.prep, ...(saved.week1Lecture?.prep || {}) },
          keywords: { ...defaults.week1Lecture.keywords, ...(saved.week1Lecture?.keywords || {}) },
          workplacePrep: { ...defaults.week1Lecture.workplacePrep, ...(saved.week1Lecture?.workplacePrep || {}) }
        },
        week2Lecture: { ...defaults.week2Lecture, ...(saved.week2Lecture || {}) },
        week3Lecture: {
          ...defaults.week3Lecture,
          ...(saved.week3Lecture || {}),
          feltRates: { ...defaults.week3Lecture.feltRates, ...(saved.week3Lecture?.feltRates || {}) },
          sortAnswers: { ...defaults.week3Lecture.sortAnswers, ...(saved.week3Lecture?.sortAnswers || {}) },
          paceMap: { ...defaults.week3Lecture.paceMap, ...(saved.week3Lecture?.paceMap || {}) }
        },
        week4Lecture: {
          ...defaults.week4Lecture,
          ...(saved.week4Lecture || {}),
          spotFound: Array.isArray(saved.week4Lecture?.spotFound) ? saved.week4Lecture.spotFound : [],
          sortAnswers: { ...(saved.week4Lecture?.sortAnswers || {}) }
        }
      };
    } catch (error) {
      return structuredClone(defaults);
    }
  }

  let state = loadState();

  function saveState() {
    // The coach view is read-only: never overwrite the student's progress from it.
    if (window.PortalSync?.isCoach()) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.PortalSync?.saved();
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    $("#toast").textContent = message;
    $("#toast").classList.add("show");
    toastTimer = setTimeout(() => $("#toast").classList.remove("show"), 2300);
  }

  function getCompletedCount() {
    return Object.values(state.completedDays).filter(Boolean).length;
  }

  function getStreak() {
    const complete = Object.entries(state.completedDays)
      .filter(([, value]) => value)
      .map(([key]) => Number(key))
      .filter(Number.isFinite)
      .sort((a, b) => b - a);
    if (!complete.length) return 0;
    let streak = 1;
    for (let index = 1; index < complete.length; index += 1) {
      if (complete[index] === complete[index - 1] - 1) streak += 1;
      else if (complete[index] !== complete[index - 1]) break;
    }
    return streak;
  }

  function repetitionCounts() {
    return state.repetitions.reduce((counts, rep) => {
      counts.total += 1;
      if (rep.type === "app") counts.app += 1;
      if (["real", "meeting", "structured", "story"].includes(rep.type)) counts.real += 1;
      if (rep.type === "meeting") counts.meetings += 1;
      if (rep.type === "structured") counts.structured += 1;
      if (rep.type === "story") counts.stories += 1;
      return counts;
    }, { total: 0, app: 0, real: 0, meetings: 0, structured: 0, stories: 0 });
  }

  function renderHeader() {
    $("#todayDate").textContent = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
    $("#startDate").value = state.startDate || todayISO;
  }

  function renderProgress() {
    const completed = getCompletedCount();
    const percent = Math.round((completed / 42) * 100);
    const counts = repetitionCounts();
    $("#progressRing").style.setProperty("--progress", percent);
    $("#progressPercent").textContent = `${percent}%`;
    $("#progressSummary").textContent = `${completed} of 42 days`;
    $("#streakValue").textContent = getStreak();
    $("#appRepsValue").textContent = counts.app;
    $("#realRepsValue").textContent = counts.real;
  }

  function renderDaySelect() {
    $("#daySelect").innerHTML = flatDays.map((day, index) => `<option value="${index}">Day ${index + 1} · W${day.weekIndex + 1}</option>`).join("");
    $("#daySelect").value = String(state.selectedDay);
  }

  function taskKey(dayIndex, taskIndex) {
    return `${dayIndex}:${taskIndex}`;
  }

  function renderToday() {
    const absoluteDay = Math.max(0, Math.min(41, Number(state.selectedDay) || 0));
    state.selectedDay = absoluteDay;
    const day = flatDays[absoluteDay];
    const week = DATA.weeks[day.weekIndex];
    const actions = Array.isArray(day.actions) && day.actions.length
      ? day.actions
      : [{ text: day.required, destination: day.app ? "app" : "" }];

    $("#daySelect").value = String(absoluteDay);
    $("#prevDay").disabled = absoluteDay === 0;
    $("#nextDay").disabled = absoluteDay === 41;
    $("#todayWeek").textContent = `Week ${day.weekIndex + 1} · ${week.short}`;
    $("#dayNumber").textContent = String(absoluteDay + 1).padStart(2, "0");
    $("#dayType").textContent = day.type;
    $("#dayTitle").textContent = day.title;
    $("#dayDuration").textContent = day.time;
    $("#dayIntention").textContent = day.intention;
    $("#dailyPrompt").textContent = "What did today's practice prove?";
    $("#dailyReflection").value = state.reflections[absoluteDay] || "";
    $("#focusTitle").textContent = week.title;
    $("#focusTransformation").textContent = week.transformation;
    $("#focusWhy").textContent = week.why;
    $("#focusOutcome").textContent = week.outcome;

    const realBadge = day.real ? `<span class="eyebrow">REAL-WORLD ACTION</span>` : "";
    const requiredTasks = actions.map((action, taskIndex) => {
      const checked = Boolean(state.completedTasks[taskKey(absoluteDay, taskIndex)]);
      const destination = action.destination === "community"
        ? { href: DATA.links.community, label: "OPEN COMMUNITY ↗" }
        : action.destination === "app"
          ? { href: DATA.links.app, label: "OPEN APP ↗" }
          : null;
      const destinationLink = destination ? `<a href="${destination.href}" target="_blank" rel="noreferrer">${destination.label}</a>` : "";
      return `<label class="task required-task">
        <input type="checkbox" data-task-index="${taskIndex}" ${checked ? "checked" : ""} />
        <span class="task-check"></span>
        <span class="task-copy"><small>REQUIRED ACTION${actions.length > 1 ? ` ${taskIndex + 1}` : ""}</small>${escapeHTML(action.text)}${taskIndex === 0 ? realBadge : ""}</span>
        ${destinationLink}
      </label>`;
    }).join("");
    $("#taskList").innerHTML = requiredTasks;

    $$("[data-task-index]").forEach(input => input.addEventListener("change", event => {
      state.completedTasks[taskKey(absoluteDay, Number(event.target.dataset.taskIndex))] = event.target.checked;
      if (!event.target.checked) state.completedDays[absoluteDay] = false;
      saveState();
      renderDayCompletion();
      renderProgress();
    }));

    $("#dailyConfidence").innerHTML = [1, 2, 3, 4, 5].map(value => `<button type="button" data-confidence="${value}" class="${Number(state.confidence[absoluteDay]) === value ? "active" : ""}" aria-label="Confidence ${value} out of 5">${value}</button>`).join("");
    $$("[data-confidence]").forEach(button => button.addEventListener("click", () => {
      state.confidence[absoluteDay] = Number(button.dataset.confidence);
      saveState();
      renderToday();
      renderCoachDashboard();
      showToast(`Confidence ${button.dataset.confidence} of 5 saved.`);
    }));

    renderDayCompletion();
  }

  function renderDayCompletion() {
    const absoluteDay = state.selectedDay;
    const day = flatDays[absoluteDay];
    const requiredCount = Array.isArray(day.actions) && day.actions.length ? day.actions.length : 1;
    const completedRequired = Array.from({ length: requiredCount }, (_, index) => Boolean(state.completedTasks[taskKey(absoluteDay, index)])).filter(Boolean).length;
    const requiredComplete = completedRequired === requiredCount;
    $("#taskCount").textContent = requiredComplete ? "Required actions complete" : `Complete ${requiredCount - completedRequired} required ${requiredCount - completedRequired === 1 ? "action" : "actions"}`;
    $("#taskProgress").style.width = requiredComplete ? "100%" : "0%";
    const completed = Boolean(state.completedDays[absoluteDay]);
    $("#completeDay").textContent = completed ? "Reopen day" : "Complete day";
    $("#completeDay").classList.toggle("dark", completed);
    $("#completeDay").classList.toggle("gold", !completed);
  }

  function levelOptions(selected) {
    return DATA.levels.map((level, index) => `<option value="${index + 1}" ${Number(selected) === index + 1 ? "selected" : ""}>Level ${index + 1} · ${escapeHTML(level.name)}</option>`).join("");
  }

  function renderLevels() {
    state.currentLevel = Math.max(1, Math.min(10, Number(state.currentLevel) || 1));
    state.nextLevel = Math.max(1, Math.min(10, Number(state.nextLevel) || Math.min(10, state.currentLevel + 1)));
    state.viewLevel = Math.max(1, Math.min(10, Number(state.viewLevel) || state.nextLevel));
    $("#currentLevel").innerHTML = levelOptions(state.currentLevel);
    $("#nextLevel").innerHTML = levelOptions(state.nextLevel);
    $("#repLevel").innerHTML = levelOptions(state.nextLevel);

    const repsAtNext = state.repetitions.filter(rep => Number(rep.level) === state.nextLevel && rep.type !== "app").length;
    $("#levelRepProgress").textContent = `${Math.min(repsAtNext, 3)} of 3 reliable reps at next level`;
    $("#levelGrid").innerHTML = DATA.levels.map((level, index) => {
      const number = index + 1;
      const status = number < state.currentLevel ? "done" : number === state.currentLevel ? "current" : number === state.nextLevel ? "next" : "";
      return `<button type="button" class="level-step ${status}" style="--i:${index}" data-level="${number}" title="Level ${number}: ${escapeHTML(level.name)}">
        <span>LEVEL ${String(number).padStart(2, "0")}</span>
        <strong>${escapeHTML(level.name)}</strong>
        <em>${escapeHTML(level.card || level.behavior)}</em>
      </button>`;
    }).join("");
    $$("[data-level]").forEach(button => button.addEventListener("click", () => {
      state.viewLevel = Number(button.dataset.level);
      saveState();
      renderLevelDetail();
    }));
    renderLevelDetail();
  }

  function renderLevelDetail() {
    const number = state.viewLevel;
    const level = DATA.levels[number - 1];
    const addSpeechChannel = text => /in the community/i.test(text) && !/speech channel/i.test(text) ? text.replace(/in the community/i, "in the speech channel on the community") : text;
    $("#levelDetail").innerHTML = `<div class="level-detail-main">
      <small>LEVEL ${number} ${number === state.currentLevel ? "· CURRENT" : number === state.nextLevel ? "· PRACTICE NEXT" : ""}</small>
      <h3>${escapeHTML(level.name)}</h3>
      <p>${escapeHTML(level.behavior)}</p>
      <div class="starter"><span>SENTENCE STARTER</span><strong>“${escapeHTML(level.starter)}”</strong></div>
    </div>
    <div class="level-info">
      <div><small>APP PRACTICE</small><p>${escapeHTML(level.app)}</p></div>
      <div><small>OPTIONAL COMMUNITY SHARE</small><p>${escapeHTML(addSpeechChannel(level.community || ""))}</p></div>
      <div><small>EVIDENCE REQUIRED</small><p>${escapeHTML(level.evidence)}</p></div>
      <div class="advance-rule"><span>3</span><strong>Advance after three reliable repetitions, not after one perfect performance.</strong></div>
    </div>`;
  }

  // One row per week: Pillar 1 is the lecture, Pillar 2 is the one real-world mission.
  function weekPillars(weekIndex) {
    const week = DATA.weeks[weekIndex];
    if (weekIndex === 5) {
      const coachMission = window.PortalSync?.coach()?.missions?.[6] || "";
      const record = state.week6Mission || {};
      return { lecture: null, lectureState: null, mission: coachMission || week.mission, suggested: !coachMission, missionState: record.status === "completed" ? "done" : "set", result: record.result || "", level: null };
    }
    const lecture = state[`week${weekIndex + 1}Lecture`] || {};
    const lectureState = lecture.lectureCompletedAt ? "done" : Number(lecture.currentStep) > 0 ? "started" : "none";
    const missionState = lecture.missionStatus === "completed" ? "done" : lecture.missionStatus === "accepted" ? "set" : "none";
    return { lecture, lectureState, mission: lecture.mission || week.mission, suggested: !lecture.mission, missionState, result: lecture.actualResult || "", level: missionState !== "none" ? Number(lecture.missionLevel) || null : null };
  }

  function renderJourney() {
    const rows = DATA.weeks.map((_, index) => weekPillars(index));
    const currentIndex = rows.findIndex(row => row.missionState !== "done");
    const lecturesDone = rows.filter(row => row.lectureState === "done").length;
    const missionsDone = rows.filter(row => row.missionState === "done").length;
    const level = clampLevel(state.currentLevel);
    const coach = Boolean(window.PortalSync?.isCoach());
    const updatedAt = window.PortalSync?.updatedAt();
    $("#journeySummary").innerHTML = `<div class="journey-now">
        <span class="eyebrow">${currentIndex < 0 ? "Journey complete" : "Where we are"}</span>
        <h3>${currentIndex < 0 ? "All six weeks complete" : `Week ${currentIndex + 1} of 6 · ${escapeHTML(DATA.weeks[currentIndex].short)}`}</h3>
        ${coach && updatedAt ? `<p>Last saved ${escapeHTML(new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(updatedAt)))}</p>` : ""}
        <ol class="journey-dots" aria-hidden="true">${rows.map((row, index) => `<li class="${row.missionState === "done" ? "done" : index === currentIndex ? "current" : ""}">${index + 1}</li>`).join("")}</ol>
      </div>
      <div class="journey-pillars">
        <div><small>Pillar 1 · Lectures</small><strong>${lecturesDone}<span> of 5 finished</span></strong><i><b style="width:${lecturesDone / 5 * 100}%"></b></i></div>
        <div><small>Pillar 2 · Exposure</small><strong>${missionsDone}<span> of 6 missions done</span></strong><i><b style="width:${missionsDone / 6 * 100}%"></b></i></div>
        <div><small>Speaking level</small><strong>${level}<span> of 10 · ${escapeHTML(DATA.levels[level - 1].name)}</span></strong><i><b style="width:${level * 10}%"></b></i><a class="text-link" href="#levels">Open My Levels →</a></div>
      </div>`;
    const lectureLabel = { done: "✓ Finished", started: "◐ Started", none: "○ Not started" };
    const missionLabel = { done: '<span class="journey-pill done">✓ Done</span>', set: '<span class="journey-pill waiting">Waiting for report</span>', none: '<span class="journey-pill">Chosen at the end of the lecture</span>' };
    $("#journeyWeeks").innerHTML = rows.map((row, index) => {
      const week = DATA.weeks[index];
      const lectureCell = row.lecture
        ? `<div class="journey-cell"><small>Pillar 1 · Lecture</small><strong>${lectureLabel[row.lectureState]}</strong>${renderLectureEntry(index)}</div>`
        : `<div class="journey-cell"><small>Pillar 1 · Lecture</small><strong>No lecture</strong><p>Bring every skill together with your coach.</p></div>`;
      let missionBody = `<p class="journey-mission">${row.suggested ? '<em>Suggested:</em> ' : ""}${escapeHTML(row.mission)}</p>`;
      if (index === 5) {
        if (coach) missionBody = `<label class="journey-edit">Week 6 mission<textarea id="coachMission6" rows="2" maxlength="600">${escapeHTML(window.PortalSync.coach()?.missions?.[6] || "")}</textarea></label><button class="text-link" type="button" id="saveCoachMission">Save mission →</button>`;
        else if (row.missionState !== "done") missionBody += `<label class="journey-edit">What happened?<textarea id="week6Result" rows="2" maxlength="2000" placeholder="One or two sentences.">${escapeHTML(row.result)}</textarea></label><button class="text-link" type="button" id="completeWeek6">Mark as done ✓</button>`;
      }
      const levelChip = row.level ? `<span class="journey-level">Level ${row.level} · ${escapeHTML(DATA.levels[row.level - 1].name)}</span>` : "";
      const result = row.missionState === "done" && row.result ? `<p class="journey-result"><small>What happened</small>${escapeHTML(row.result)}</p>` : "";
      const pill = index === 5 ? (row.missionState === "done" ? missionLabel.done : '<span class="journey-pill">Set with your coach</span>') : missionLabel[row.missionState];
      return `<article class="journey-row card ${index === currentIndex ? "is-current" : ""} ${row.missionState === "done" ? "is-done" : ""}">
        <header><span class="eyebrow">Week ${index + 1}</span><h3>${escapeHTML(week.title)}</h3><p>${escapeHTML(week.outcome)}</p></header>
        ${lectureCell}
        <div class="journey-cell"><small>Pillar 2 · Mission ${pill}</small>${missionBody}${levelChip}${result}</div>
      </article>`;
    }).join("");
  }

  document.addEventListener("click", async event => {
    if (event.target.closest("#saveCoachMission")) {
      try { await window.PortalSync.saveCoachMission(6, $("#coachMission6").value); showToast("Week 6 mission saved. Pankaj will see it."); renderJourney(); }
      catch { showToast("The mission could not be saved. Please try again."); }
    }
    if (event.target.closest("#completeWeek6")) {
      const result = $("#week6Result").value.trim();
      if (!result) { showToast("Add one sentence about what happened."); $("#week6Result").focus(); return; }
      state.week6Mission = { status: "completed", result, completedAt: new Date().toISOString() };
      saveState(); renderJourney(); showToast("Week 6 mission saved. Well done.");
    }
  });

  function renderWeeklyReview() {
    state.selectedReviewWeek = Math.max(1, Math.min(6, Number(state.selectedReviewWeek) || Math.floor(state.selectedDay / 7) + 1));
    const select = $("#weeklyReviewWeek");
    select.innerHTML = DATA.weeks.map((week, index) => `<option value="${index + 1}">Week ${index + 1} · ${escapeHTML(week.short)}</option>`).join("");
    select.value = String(state.selectedReviewWeek);
    const review = state.weeklyReviews[state.selectedReviewWeek] || {};
    $("#weeklyImproved").value = review.improved || "";
    $("#weeklyBreakdown").value = review.breakdown || "";
    $("#weeklyNextFocus").value = review.nextFocus || "";
  }

  function renderLectureEntry(weekIndex) {
    if (weekIndex > 4) return "";
    const settings = [
      { key: "week1Lecture", label: "Lecture 1", path: "Discover · Build · Speak · Prove", summary: "Build and deliver a complete PREP answer, then choose one real-world mission.", open: "data-open-week1", report: "data-open-week1-reflection" },
      { key: "week2Lecture", label: "Lecture 2", path: "Discover · Calibrate · Speak · Prove", summary: "Find grounded volume, carry the final words and test one audible moment.", open: "data-open-week2-lecture", report: "data-open-week2-reflection" },
      { key: "week3Lecture", label: "Lecture 3", path: "Discover · Tune · Speak · Prove", summary: "Use fast, slow and stop to shape the meaning of a professional answer.", open: "data-open-week3-lecture", report: "data-open-week3-reflection" },
      { key: "week4Lecture", label: "Lecture 4", path: "Discover · Still · Speak · Prove", summary: "Replace fillers with silence and take a calm two-second pause before you answer.", open: "data-open-week4-lecture", report: "data-open-week4-reflection" },
      { key: "week5Lecture", label: "Lecture 5", path: "Discover · Range · Shape · Mix · Prove", summary: "Step up, lift, drop and land. Mix pitch with pace and volume so people hear how you feel, then choose one real-world mission.", open: "data-open-week5-lecture", report: "data-open-week5-reflection" }
    ][weekIndex];
    const lecture = state[settings.key];
    const evidenceComplete = Boolean(lecture.completedAt || lecture.evidenceId);
    const lectureComplete = Boolean(lecture.lectureCompletedAt);
    const viewed = Number(lecture.currentStep) > 0;
    const actionLabel = evidenceComplete ? `Review ${settings.label}` : viewed ? `Continue ${settings.label}` : `Start ${settings.label}`;
    return `<div class="lecture-entry">
      <div class="lecture-entry-copy"><span class="lecture-icon">${weekIndex + 1}</span><div><small>INTERACTIVE COACHING EXPERIENCE</small><strong>${settings.path}</strong><p>${settings.summary}</p></div></div>
      <div class="lecture-entry-actions">
        <button class="lecture-reset" type="button" data-reset-lecture="${weekIndex + 1}">Reset</button>
        ${lectureComplete && !evidenceComplete ? `<button class="button dark small" type="button" ${settings.report}>Report mission</button>` : ""}
        <button class="button gold" type="button" ${settings.open}>${actionLabel}</button>
      </div>
    </div>`;
  }

  function averageConfidence() {
    const values = Object.entries(state.confidence)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .map(([, value]) => Number(value))
      .filter(value => value >= 1 && value <= 5)
      .slice(0, 5);
    if (!values.length) return "Not set";
    return `${(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1)}/5`;
  }

  function labelForRep(type) {
    return ({ app: "App practice", real: "Real-world conversation", meeting: "Meeting contribution", structured: "Answer under 90 seconds", story: "Concise story" })[type] || "Practice";
  }

  function renderCoachDashboard() {
    const counts = repetitionCounts();
    const currentWeek = Math.floor(state.selectedDay / 7) + 1;
    const weekEvidence = state.evidence.filter(item => Number(item.week) === currentWeek).length;
    $("#coachMetrics").innerHTML = [
      [`L${state.currentLevel}`, "current level"],
      [`${getCompletedCount()}/42`, "practice days"],
      [getStreak(), "day streak"],
      [averageConfidence(), "latest confidence"],
      [counts.meetings, "meeting contributions"],
      [counts.structured, "answers under 90 sec"],
      [counts.stories, "concise stories"],
      [weekEvidence, "evidence this week"]
    ].map(([value, label]) => `<div><strong>${value}</strong><small>${label}</small></div>`).join("");

    ["appNotes", "upcomingMoment", "pressureSkill", "nextTarget"].forEach(key => {
      const element = $(`#${key}`);
      if (document.activeElement !== element) element.value = state.coachNotes[key] || "";
    });
    const recent = state.repetitions.slice(0, 3);
    $("#recentReps").innerHTML = recent.length ? recent.map(rep => `<article class="recent-rep"><small>${escapeHTML(labelForRep(rep.type))} · Level ${rep.level}</small><p>${escapeHTML(rep.note)}</p></article>`).join("") : `<div class="empty-state"><span>✦</span><strong>No repetitions logged yet.</strong><p>Your three latest actions will appear here for the coach.</p></div>`;
  }

  function renderEvidence() {
    const evidence = state.evidence.map(item => ({ ...item, kind: "evidence" }));
    const weeklyReviews = Object.entries(state.weeklyReviews)
      .filter(([, review]) => review && [review.improved, review.breakdown, review.nextFocus].some(value => String(value || "").trim()))
      .map(([week, review]) => ({ ...review, id: `weekly-${week}`, kind: "weekly", week: Number(week), createdAt: review.updatedAt || Number(week) }));
    const reflections = Object.entries(state.reflections)
      .filter(([, text]) => String(text).trim())
      .map(([day, text]) => ({ id: `reflection-${day}`, kind: "reflection", day: Number(day), text, createdAt: Number(day) }));
    const items = [...evidence, ...weeklyReviews, ...reflections].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    $("#evidenceCount").textContent = `${items.length} ${items.length === 1 ? "entry" : "entries"}`;
    $("#evidenceList").innerHTML = items.length ? items.map(item => {
      if (item.kind === "reflection") {
        const day = flatDays[item.day] || flatDays[0];
        return `<article class="evidence-card"><header><span>DAY ${item.day + 1} REFLECTION</span><span>${state.confidence[item.day] ? `CONFIDENCE ${state.confidence[item.day]}/5` : "REFLECTION"}</span></header><h4>${escapeHTML(day.title)}</h4><dl><div><dt>What today's practice proved</dt><dd>${escapeHTML(item.text)}</dd></div></dl></article>`;
      }
      if (item.kind === "weekly") {
        return `<article class="evidence-card"><header><span>WEEK ${item.week} REVIEW</span><span>WEEKLY</span></header><h4>${escapeHTML(DATA.weeks[item.week - 1]?.title || `Week ${item.week}`)}</h4><dl><div><dt>What improved</dt><dd>${escapeHTML(item.improved || "Not recorded")}</dd></div><div><dt>Where the skill broke down</dt><dd>${escapeHTML(item.breakdown || "Not recorded")}</dd></div><div><dt>One focus next week</dt><dd>${escapeHTML(item.nextFocus || "Not recorded")}</dd></div></dl></article>`;
      }
      const confidence = item.confidenceBefore || item.confidenceAfter ? `<div><dt>Confidence</dt><dd>${item.confidenceBefore || "Not set"} before · ${item.confidenceAfter || "Not set"} after</dd></div>` : "";
      return `<article class="evidence-card"><header><span>WEEK ${item.week} EVIDENCE</span><span>${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(item.createdAt))}</span></header><h4>${escapeHTML(item.category)}</h4><dl><div><dt>What I did</dt><dd>${escapeHTML(item.action || item.situation)}</dd></div><div><dt>What happened</dt><dd>${escapeHTML(item.result || item.lesson)}</dd></div><div><dt>What I will repeat or adjust</dt><dd>${escapeHTML(item.next)}</dd></div>${confidence}</dl></article>`;
    }).join("") : `<div class="empty-state"><span>✦</span><strong>Your evidence will collect here.</strong><p>Save a reflection or evidence card after one observable communication action.</p></div>`;
  }

  function renderAll() {
    renderHeader();
    renderDaySelect();
    renderProgress();
    renderToday();
    renderLevels();
    renderJourney();
    renderWeeklyReview();
    renderCoachDashboard();
    renderEvidence();
  }

  $("#prevDay").addEventListener("click", () => {
    state.selectedDay = Math.max(0, state.selectedDay - 1);
    state.selectedWeek = Math.floor(state.selectedDay / 7);
    saveState(); renderToday(); renderJourney(); renderCoachDashboard();
  });
  $("#nextDay").addEventListener("click", () => {
    state.selectedDay = Math.min(41, state.selectedDay + 1);
    state.selectedWeek = Math.floor(state.selectedDay / 7);
    saveState(); renderToday(); renderJourney(); renderCoachDashboard();
  });
  $("#daySelect").addEventListener("change", event => {
    state.selectedDay = Number(event.target.value);
    state.selectedWeek = Math.floor(state.selectedDay / 7);
    saveState(); renderToday(); renderJourney(); renderCoachDashboard();
  });
  $("#completeDay").addEventListener("click", () => {
    const dayIndex = state.selectedDay;
    const completing = !state.completedDays[dayIndex];
    state.completedDays[dayIndex] = completing;
    if (completing) {
      const day = flatDays[dayIndex];
      const requiredCount = Array.isArray(day.actions) && day.actions.length ? day.actions.length : 1;
      Array.from({ length: requiredCount }, (_, index) => index).forEach(index => {
        state.completedTasks[taskKey(dayIndex, index)] = true;
      });
    }
    saveState(); renderToday(); renderProgress(); renderCoachDashboard();
    showToast(completing ? "Day complete. That is useful evidence." : "Day reopened for another pass.");
  });
  $("#dailyReflection").addEventListener("input", event => {
    const text = event.target.value.trim();
    if (text) state.reflections[state.selectedDay] = text;
    else delete state.reflections[state.selectedDay];
    saveState();
  });
  $("#dailyReflection").addEventListener("blur", () => {
    renderEvidence();
    showToast(window.PortalSync?.isCloud() ? "Reflection saved to your account." : "Reflection saved on this device.");
  });
  $("#startDate").addEventListener("change", event => {
    if (!event.target.value) return;
    state.startDate = event.target.value;
    saveState(); showToast("Program start date updated.");
  });
  $("#currentLevel").addEventListener("change", event => {
    state.currentLevel = Number(event.target.value);
    state.viewLevel = state.nextLevel;
    saveState(); renderLevels(); renderCoachDashboard(); showToast("Current reliable level updated.");
  });
  $("#nextLevel").addEventListener("change", event => {
    state.nextLevel = Number(event.target.value);
    state.viewLevel = state.nextLevel;
    saveState(); renderLevels(); showToast("Next practice level updated.");
  });

  $("#repetitionForm").addEventListener("submit", event => {
    event.preventDefault();
    const note = $("#repNote").value.trim();
    if (!note) return;
    state.repetitions.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      type: $("#repType").value,
      level: Number($("#repLevel").value),
      note,
      confidenceBefore: Number($("#confidenceBefore").value) || null,
      confidenceAfter: Number($("#confidenceAfter").value) || null,
      createdAt: Date.now()
    });
    saveState();
    event.target.reset();
    renderProgress(); renderLevels(); renderCoachDashboard();
    showToast("Repetition added to your practice record.");
  });

  $("#weeklyReviewWeek").addEventListener("change", event => {
    state.selectedReviewWeek = Number(event.target.value);
    saveState();
    renderWeeklyReview();
  });

  $("#weeklyReviewForm").addEventListener("submit", event => {
    event.preventDefault();
    const week = state.selectedReviewWeek;
    state.weeklyReviews[week] = {
      improved: $("#weeklyImproved").value.trim(),
      breakdown: $("#weeklyBreakdown").value.trim(),
      nextFocus: $("#weeklyNextFocus").value.trim(),
      updatedAt: Date.now()
    };
    saveState();
    renderEvidence();
    showToast(window.PortalSync?.isCloud() ? "Weekly review saved to your account." : "Weekly review saved on this device.");
  });

  $("#evidenceForm").addEventListener("submit", event => {
    event.preventDefault();
    const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    const week = Math.floor(state.selectedDay / 7) + 1;
    const action = $("#evidenceAction").value.trim();
    const result = $("#evidenceResult").value.trim();
    const next = $("#evidenceNext").value.trim();
    const confidenceBefore = Number($("#evidenceConfidenceBefore").value) || null;
    const confidenceAfter = Number($("#evidenceConfidenceAfter").value) || null;
    const categories = ["I led with the point.", "I remained composed under pressure.", "I used my voice intentionally.", "I spoke before the moment passed.", "I told a story that supported the message.", "I remained composed under pressure."];
    state.evidence.unshift({ id, week, category: categories[week - 1], situation: "Real-world communication", action, result, lesson: result, next, confidenceBefore, confidenceAfter, createdAt: Date.now() });
    state.repetitions.unshift({ id: `rep-${id}`, type: "real", level: state.currentLevel, note: action, confidenceBefore, confidenceAfter, createdAt: Date.now(), sourceEvidence: id });
    saveState();
    event.target.reset();
    renderEvidence(); renderCoachDashboard(); renderProgress(); renderLevels();
    showToast("Reflection saved and counted as a real-world repetition.");
  });

  $("#saveCoachNotes").addEventListener("click", () => {
    ["appNotes", "upcomingMoment", "pressureSkill", "nextTarget"].forEach(key => { state.coachNotes[key] = $(`#${key}`).value.trim(); });
    saveState(); showToast("Coach review notes saved.");
  });

  const openMenu = () => { document.body.classList.add("menu-open"); $("#menuButton").setAttribute("aria-expanded", "true"); };
  const closeMenu = () => { document.body.classList.remove("menu-open"); $("#menuButton").setAttribute("aria-expanded", "false"); };
  $("#menuButton").addEventListener("click", openMenu);
  $("#menuClose").addEventListener("click", closeMenu);
  $("#backdrop").addEventListener("click", closeMenu);
  $$(".sidebar nav a").forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });

  const observer = new IntersectionObserver(entries => {
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    $$(".sidebar nav a").forEach(link => link.classList.toggle("active", link.dataset.section === visible.target.id));
  }, { threshold: [0.12, 0.3], rootMargin: "-15% 0px -60%" });
  $$("#today, #levels, #journey, #reflections").forEach(section => observer.observe(section));

  function resetLecture(week) {
    const labels = { 1: "PREP", 2: "stronger voice", 3: "pace variety", 4: "pause", 5: "vocal variety" };
    const confirmed = window.confirm(`Reset Lecture ${week}? This clears its ${labels[week]} answers, mission and lecture evidence. The rest of Pankaj's progress stays unchanged.`);
    if (!confirmed) return false;
    state.evidence = state.evidence.filter(item => Number(item.sourceLecture) !== week);
    if (week === 1) state.week1Lecture = structuredClone(defaults.week1Lecture);
    if (week === 2) state.week2Lecture = structuredClone(defaults.week2Lecture);
    if (week === 3) state.week3Lecture = structuredClone(defaults.week3Lecture);
    if (week === 4) state.week4Lecture = structuredClone(defaults.week4Lecture);
    if (week === 5) state.week5Lecture = structuredClone(defaults.week5Lecture);
    saveState();
    renderAll();
    showToast(`Lecture ${week} is ready for a fresh start.`);
    return true;
  }

  document.addEventListener("click", event => {
    const resetButton = event.target.closest("[data-reset-lecture]");
    if (!resetButton) return;
    resetLecture(Number(resetButton.dataset.resetLecture));
  });

  function saveLectureEvidence(card) {
    const categories = {
      1: "I led with the point.",
      2: "I used my voice intentionally.",
      3: "I used my voice intentionally.",
      4: "I remained composed under pressure.",
      5: "I used my voice intentionally."
    };
    const createdAt = Date.parse(card.completedAt || "") || Date.now();
    const normalized = {
      id: card.id,
      week: Number(card.week),
      category: categories[card.week] || "I remained composed under pressure.",
      situation: card.mission || `${card.skill} real-world mission`,
      action: `Completed the ${card.skill} mission at exposure level ${card.level}.`,
      result: card.reality || "Mission completed.",
      lesson: card.prediction ? `My prediction was: ${card.prediction}` : `This repetition created evidence for ${card.skill}.`,
      next: Number(card.week) === 5 ? "Repeat one deliberate pitch move in another real conversation." : `Confidence evidence: ${card.beliefBefore}% before, ${card.beliefAfter}% after.`,
      createdAt,
      sourceLecture: Number(card.week)
    };
    const existing = state.evidence.findIndex(item => item.id === normalized.id);
    if (existing >= 0) state.evidence[existing] = normalized;
    else state.evidence.unshift(normalized);
    saveState();
    renderEvidence();
    renderCoachDashboard();
  }

  const portalApi = {
    client: { id: "pankaj", name: "Pankaj", storageKey: STORAGE_KEY },
    getState: () => state,
    updateWeek1(patch) { state.week1Lecture = { ...state.week1Lecture, ...patch }; saveState(); },
    updateLecture(patch) { state.week2Lecture = { ...state.week2Lecture, ...patch }; saveState(); },
    updateWeek3(patch) { state.week3Lecture = { ...state.week3Lecture, ...patch }; saveState(); },
    updateWeek5(patch) { state.week5Lecture = { ...state.week5Lecture, ...patch }; saveState(); },
    updateWeek4(patch) { state.week4Lecture = { ...state.week4Lecture, ...patch }; saveState(); },
    setExposureLevel(level) {
      const next = clampLevel(level);
      state.currentLevel = next;
      state.nextLevel = Math.min(10, next + 1);
      state.viewLevel = state.nextLevel;
      state.week2Lecture.currentLevel = next;
      saveState();
      renderAll();
    },
    saveEvidence: saveLectureEvidence,
    resetLecture,
    renderAll,
    showToast,
    saveState
  };

  window.SpeakersGymPortal = portalApi;
  window.PankajPortal = { ...portalApi, getState: () => structuredClone(state), storageKey: STORAGE_KEY, data: DATA };
  renderAll();
  window.PortalSync?.init({
    client: "pankaj",
    storageKey: STORAGE_KEY,
    getState: () => state,
    replaceState: saved => { state = loadState(saved); renderAll(); },
    onChange: () => renderJourney(),
    logo: "Logo.png",
    logoutTarget: ".quick-links",
    logoutClass: "quick-logout"
  });
})();
