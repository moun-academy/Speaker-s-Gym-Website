(function () {
  'use strict';
  const DATA = window.MUHAMMAD_DATA;
  const COACHING = window.MUHAMMAD_COACHING_UPDATE;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clampLevel = value => Math.max(1, Math.min(10, Number(value) || 1));
  const flatDays = DATA.weeks.flatMap((week, weekIndex) => week.days.map((day, dayIndex) => ({title:day[0],description:day[1],prompt:day[2],steps:day[3],weekIndex,dayIndex})));
  const defaults = {...window.MUHAMMAD_DEFAULTS,version:1,selectedDay:0,selectedWeek:0,currentLevel:1,nextLevel:1,reflections:[],callNote:''};
  const merge = (base, patch) => Object.fromEntries([...Object.entries(patch && typeof patch==='object' ? patch : {}),...Object.entries(base).map(([key,value])=>[key,value && typeof value==='object' && !Array.isArray(value) ? merge(value,patch?.[key]) : patch?.[key] ?? value])]);
  let state;
  let canSave = true;
  function normalizeState(saved) {
    const next = merge(defaults, saved);
    next.selectedDay = Math.max(0,Math.min(41,Number(next.selectedDay)||0));
    next.selectedWeek = Math.max(0,Math.min(5,Number(next.selectedWeek)||0));
    if (!Array.isArray(next.reflections)) next.reflections=[];
    if (!Array.isArray(next.evidence)) next.evidence=[];
    for(const week of COACHING?.completedLectures||[]){const lecture=next['week'+week+'Lecture'];if(lecture&&next.coachingLectureResets?.[week]!==COACHING.id)lecture.lectureCompletedAt=lecture.lectureCompletedAt||COACHING.date;}
    return next;
  }
  try { state = normalizeState(JSON.parse(localStorage.getItem(DATA.storageKey) || 'null')); }
  catch { state = normalizeState(null); }
  // Online sync. mode: 'starting' until the server answers, 'cloud' when logged in, 'local' when the server is not set up.
  const CLIENT_ID = 'muhammadashraf';
  try{const flag=new URLSearchParams(location.search).get('coach');if(flag==='1')localStorage.setItem('sgCoach','1');if(flag==='0')localStorage.removeItem('sgCoach');}catch{}
  const sync = {mode:'starting', role:null, version:0, updatedAt:null, coach:{missions:{}}, timer:null, saving:false, pending:false};
  let toastTimer;
  let tourStep=0;
  const tour = [
    ['One small practice each day.','Your home gives you one speaking prompt. Open the app, choose video, and practise for 10–15 minutes. Mark it done when you finish.','Today’s speaking reps','Your starting point'],
    ['Learn, then try it out loud.','Your lectures guide you through structure, voice, pace, pauses, melody and storytelling. Each one ends with a real-life mission.','Your speaking foundations','Learn → Practise → Apply'],
    ['Keep the evidence of progress.','Save small wins and questions in your reflections. Bring them to your weekly one-hour call with Marouane, and message him on WhatsApp anytime.','Small wins, real evidence','Notice. Learn. Continue.']
  ];

  function showToast(message) {
    clearTimeout(toastTimer); $('#toast').textContent=message; $('#toast').classList.add('show');
    toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);
  }
  function saveLocal() {
    try { localStorage.setItem(DATA.storageKey,JSON.stringify(state)); canSave=true; return true; }
    catch { canSave=false; return false; }
  }
  function setSaveStatus(kind) {
    const text={local:'Your progress stays in this browser.',localFail:'Saving is unavailable. Export notes before leaving.',saving:'Saving…',saved:'Saved to your account.',retry:'Not saved yet. Trying again…',coach:'Coach view. Changes here are not saved.'}[kind];
    $('#storageStatus').textContent=text;$('#storageStatus').dataset.kind=kind;
  }
  function saveState() {
    if (sync.role==='coach') return true;
    const stored=saveLocal();
    if (sync.mode==='cloud') { clearTimeout(sync.timer); sync.timer=setTimeout(pushState,700); setSaveStatus('saving'); return true; }
    if (!stored) { setSaveStatus('localFail'); showToast('This browser could not save your progress. Export notes before leaving.'); return false; }
    setSaveStatus('local'); return true;
  }
  async function api(method, action, body) {
    const response=await fetch(`/api/portal?action=${action}&client=${CLIENT_ID}`,{method,credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});
    let json={}; try { json=await response.json(); } catch {}
    return {status:response.status,json};
  }
  async function pushState() {
    if (sync.mode!=='cloud' || sync.role!=='client') return;
    if (sync.saving) { sync.pending=true; return; }
    sync.saving=true; clearTimeout(sync.timer); sync.timer=null;
    try {
      const result=await api('PUT','state',{version:sync.version,state});
      if (result.status===200) { sync.version=result.json.version; sync.updatedAt=result.json.updatedAt; setSaveStatus('saved'); }
      else if (result.status===409) { applyRemote(result.json.state,result.json.version); showToast('Updated with newer progress from another device.'); }
      else if (result.status===401) { showLogin('Please log in again to keep saving.'); }
      else throw new Error('save_failed');
    } catch { setSaveStatus('retry'); sync.timer=setTimeout(pushState,8000); }
    finally { sync.saving=false; if (sync.pending) { sync.pending=false; pushState(); } }
  }
  function applyRemote(remote, version) {
    state=normalizeState(remote); sync.version=version;
    if (sync.role==='client') saveLocal();
    renderAll(); setSaveStatus(sync.role==='coach'?'coach':'saved');
  }
  async function boot() {
    let result;
    try { result=await api('GET','state'); } catch { result={status:0,json:{}}; }
    if (result.status===200) return startCloud(result.json);
    if (result.status===401) return showLogin();
    if (result.status===503 || result.status===404 || result.status===405) {
      // The online store is not set up (or this is a static preview): keep the original browser-only behaviour.
      sync.mode='local'; document.body.classList.remove('portal-locked'); setSaveStatus('local'); return;
    }
    showLogin('We could not reach your account. Check your connection and try again.');
  }
  function startCloud(data) {
    sync.open=Boolean(data.open);sync.editor=data.role==='coach'||(sync.open&&localStorage.getItem('sgCoach')==='1');sync.mode='cloud'; sync.role=data.role; sync.version=data.version||0; sync.updatedAt=data.updatedAt; sync.coach=data.coach||{missions:{}};
    document.body.classList.toggle('coach-view',sync.role==='coach');if(!sync.open)document.body.classList.add('cloud-mode');
    document.body.classList.remove('portal-locked'); $('#loginDialog')?.remove();
    if (data.state) applyRemote(data.state,sync.version);
    else if (sync.role==='client') { renderAll(); pushState(); showToast('Your progress is now saved to your account.'); }
    else { state=normalizeState(null); renderAll(); }
    setSaveStatus(sync.role==='coach'?'coach':'saved');
    $$('[data-cloud-copy]').forEach(el=>{el.textContent=el.dataset.cloudCopy;});
  }
  function showLogin(message='') {
    document.body.classList.add('portal-locked');
    if (!$('#loginDialog')) document.body.insertAdjacentHTML('beforeend',`<div class="login-screen" id="loginDialog" role="dialog" aria-modal="true" aria-labelledby="loginTitle"><form class="login-card" id="loginForm"><img src="Logo.png" alt=""><span class="eyebrow">THE SPEAKER'S GYM</span><h1 id="loginTitle">Welcome back.</h1><p>Enter your password to open your coaching space.</p><label>Password<input type="password" id="loginPassword" autocomplete="current-password" required></label><p class="login-error" id="loginError" role="alert"></p><button class="button dark" type="submit">Open my space <span>→</span></button></form></div>`);
    $('#loginError').textContent=message; $('#loginPassword').focus();
  }
  document.addEventListener('submit',async event=>{
    if (event.target.id!=='loginForm') return;
    event.preventDefault();
    const button=event.target.querySelector('button'); button.disabled=true; $('#loginError').textContent='';
    try {
      const result=await api('POST','login',{client:CLIENT_ID,password:$('#loginPassword').value});
      if (result.status===200) { const data=await api('GET','state'); if (data.status===200) return startCloud(data.json); }
      $('#loginError').textContent=result.status===429?'Too many attempts. Please wait 15 minutes.':result.status===401?'That password did not work. Please try again.':'Something went wrong. Please try again.';
    } catch { $('#loginError').textContent='We could not reach your account. Check your connection.'; }
    button.disabled=false;
  });
  async function logout() {
    try { await api('POST','logout'); } catch {}
    try { localStorage.removeItem(DATA.storageKey); } catch {}
    location.reload();
  }
  function saveFeedback(message) { if(saveState()) showToast(message); }
  function setDay(index) {state.selectedDay=Math.max(0,Math.min(41,Number(index)||0));saveState();renderPractice();}
  function renderPractice() {
    const day=flatDays[state.selectedDay]; const done=!!state.completedDays[state.selectedDay];
    $('#dayLabel').textContent=`WEEK ${String(day.weekIndex+1).padStart(2,'0')} · DAY ${String(day.dayIndex+1).padStart(2,'0')}`;
    $('#practiceTitle').textContent=day.title; $('#practiceDescription').textContent=day.description; $('#practicePrompt').textContent=`“${day.prompt}”`;
    const steps=day.steps || ['Open the app in video mode and use the prompt above.','Speak for 60–90 seconds. Use the skill from this week; keep it natural.','Watch once. Keep one strength and choose one small adjustment.'];
    $('#practiceSteps').innerHTML=steps.map(step=>`<li>${esc(step)}</li>`).join('');
    $('#daySelect').value=state.selectedDay; $('#previousDay').disabled=state.selectedDay===0;$('#nextDay').disabled=state.selectedDay===41;
    $('#completePractice').innerHTML=done?'Completed <span>✓</span>':'Mark as done <span>✓</span>';
    $('#completePractice').setAttribute('aria-pressed',String(done));$('#dailyPractice').classList.toggle('is-complete',done);
    $('#practiceDoneLabel').textContent=done?'Practice saved. Well done.':'Small steps count.';
  }
  function renderJourney() { renderProgress(); }
  function lectureArt(type) {
    const content={
      structure:'<rect x="26" y="58" width="40" height="42" rx="5"/><rect x="86" y="45" width="40" height="55" rx="5"/><rect x="146" y="28" width="40" height="72" rx="5"/><rect x="206" y="10" width="40" height="90" rx="5"/><path d="M66 79H86M126 68H146M186 58H206"/>',
      voice:'<path d="M30 60V64M45 47V77M60 37V87M75 49V75M90 22V102M105 37V87M120 8V116M135 32V92M150 40V84M165 20V104M180 34V90M195 46V78M210 40V84M225 51V73M240 57V67" stroke-width="5" stroke-linecap="round"/>',
      pace:'<path d="M15 89C45 89 45 39 75 39S105 89 135 89S165 19 195 19S225 79 255 79" stroke-width="2"/><circle cx="75" cy="39" r="6"/><circle cx="135" cy="89" r="6"/><circle cx="195" cy="19" r="6"/><path d="M15 108H255" stroke-dasharray="2 5"/>',
      pauses:'<circle cx="135" cy="62" r="51" stroke-opacity=".3"/><circle cx="135" cy="62" r="39" stroke-opacity=".5"/><rect x="120" y="43" width="8" height="38" rx="4"/><rect x="142" y="43" width="8" height="38" rx="4"/><path d="M40 62H62M208 62H230"/>',
      melody:'<path d="M15 72H70" stroke-opacity=".35" stroke-dasharray="3 5"/><path d="M70 72C90 72 92 40 112 40S136 22 150 22 172 60 190 60 220 92 255 96" stroke-width="2.5" stroke-linecap="round"/><circle cx="112" cy="40" r="5"/><circle cx="150" cy="22" r="5"/><circle cx="190" cy="60" r="5"/><circle cx="255" cy="96" r="5"/>',
      story:'<path d="M135 30C110 16 70 14 40 22V104C70 96 110 98 135 112C160 98 200 96 230 104V22C200 14 160 16 135 30Z"/><path d="M135 30V112"/><path d="M58 44C78 40 100 42 118 50M58 62C78 58 100 60 118 68M58 80C78 76 100 78 118 86" stroke-opacity=".5"/><path d="M152 50C170 42 192 40 212 44M152 68C170 60 192 58 212 62" stroke-opacity=".5"/><circle cx="190" cy="84" r="5"/><path d="M135 8V0M110 10L104 3M160 10L166 3" stroke-linecap="round"/>'
    };
    return `<svg viewBox="0 0 270 125" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${content[type]}</svg>`;
  }
  function renderLectures() {
    $('#lectureCards').innerHTML=DATA.lectures.map(item=>{
      const lecture=state[`week${item.week}Lecture`];const started=Number(lecture.currentStep)>0;const finished=!!lecture.lectureCompletedAt;
      return `<article class="lecture-card card"><div class="lecture-art ${item.art}" aria-hidden="true"><span>LECTURE ${String(item.week).padStart(2,'0')}</span>${lectureArt(item.art)}<small>LEARN · PRACTICE · PROVE</small></div><div class="lecture-copy"><span class="micro">${esc(item.skill)}<span class="lecture-status">${finished?'Completed ✓':started?'In progress':'Ready to explore'}</span></span><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><button class="button ${item.week===1?'dark':'outline'}" ${item.trigger}>${finished?'Review lecture':started?'Continue lecture':'Explore lecture'}<span>→</span></button></div></article>`;
    }).join('');
  }
  function renderReflections() {
    $('#callNote').value=state.callNote;
    const moments=[...state.reflections,...state.evidence].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
    $('#savedReflections').innerHTML=moments.length?moments.map(item=>`<article class="saved-moment card"><small>${esc(new Date(item.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}))}${item.sourceLecture?` · LECTURE ${Number(item.sourceLecture)}`:''}</small><h3>${esc(item.action||item.mission)}</h3><p>${esc(item.result||item.reality)}</p>${item.next?`<p class="next-note">Next: ${esc(item.next)}</p>`:''}</article>`).join(''):'<div class="empty-state"><span>✧</span>Your first small win belongs here.<br>Start with one moment you want to remember.</div>';
  }
  function weekStatus(index) {
    const week=index+1;
    const lecture=state[`week${week}Lecture`]||{};
    const lectureState=lecture.lectureCompletedAt?'done':Number(lecture.currentStep)>0?'started':'none';
    const win=state.wins?.[week]||{};const missionState=winDone(week)?'done':lecture.missionStatus==='accepted'?'set':'none';
    return {week,lecture:DATA.lectures.find(item=>item.week===week),lectureState,mission:lecture.mission||DATA.wins?.[week]?.title||'',missionState,result:lecture.actualResult||(win.lockedAt?(week===1?'Posted in the community.':'Goal done.'):''),level:lecture.missionStatus&&lecture.missionStatus!=='not-started'?Number(lecture.missionLevel)||null:null};
  }
  function renderProgress() {
    const rows=DATA.weeks.map((_,index)=>weekStatus(index));
    const current=rows.find(row=>row.missionState!=='done');
    const missionsDone=rows.filter(row=>row.missionState==='done').length;
    const lecturesDone=rows.filter(row=>row.lectureState==='done').length;
    const lectureLabel={done:'✓ Finished',started:'◐ Started',none:'○ Not started'};
    const missionPill={done:'<span class="track-pill done">✓ Done</span>',set:'<span class="track-pill waiting">Waiting for report</span>',none:'<span class="track-pill">Not set yet</span>'};
    const coach=sync.role==='coach';const editor=coach||sync.editor;
    const level=clampLevel(state.currentLevel);
    $('#progressSummary').innerHTML=`<div><span class="eyebrow">${current?'WHERE WE ARE':'JOURNEY COMPLETE'}</span><h2>${current?`Week ${current.week} of 6 · ${esc(DATA.weeks[current.week-1].short)}`:'All six weeks complete'}</h2>${coach&&sync.updatedAt?`<p>Last saved ${esc(new Date(sync.updatedAt).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}))}</p>`:''}<ol class="track-dots" aria-hidden="true">${rows.map(row=>`<li class="${row.missionState==='done'?'done':current&&row.week===current.week?'current':''}">${row.week}</li>`).join('')}</ol></div><div class="pillars"><div><small>PILLAR 1 · LECTURES</small><strong>${lecturesDone} <span>of 6 finished</span></strong><i><b style="width:${lecturesDone/6*100}%"></b></i></div><div><small>PILLAR 2 · EXPOSURE</small><strong>${missionsDone} <span>of 6 missions done</span></strong><i><b style="width:${missionsDone/6*100}%"></b></i></div><div><small>SPEAKING LADDER</small><strong>Step ${level} <span>of 10</span></strong><i><b style="width:${level*10}%"></b></i></div></div>`;
    $('#ladder').innerHTML=`<header><div><span class="eyebrow">PILLAR 2 · EXPOSURE</span><h2 id="ladderTitle">Your speaking ladder</h2></div><p>Every mission is a real speaking moment. Start where it feels manageable and climb one step at a time${coach?'':'. Tap a step to update where you are'}.</p></header><ol class="ladder-steps">${DATA.levels.map((item,index)=>`<li class="${index+1<level?'past':index+1===level?'current':''}"><button type="button" data-ladder-step="${index+1}" ${coach?'disabled':''} aria-label="Step ${index+1}: ${esc(item.name)}"><b>${index+1}</b><span>${esc(item.name)}</span></button></li>`).join('')}</ol><p class="ladder-focus"><strong>Step ${level} · ${esc(DATA.levels[level-1].name)}.</strong> ${esc(DATA.levels[level-1].behavior)}</p>`;
    $('#progressCallNote').innerHTML=state.callNote?`<span class="eyebrow">NOTE FOR THE NEXT CALL</span><p>${esc(state.callNote)}</p>`:'';
    $('#progressCallNote').hidden=!state.callNote;
    $('#progressTracker').innerHTML=rows.map(row=>{
      const week=DATA.weeks[row.week-1];
      const lectureCell=row.lecture?`<div class="track-cell"><small>PILLAR 1 · LECTURE</small><strong>${lectureLabel[row.lectureState]}</strong><button class="text-button" ${row.lecture.trigger}>${row.lectureState==='none'?'Open lecture':'Open lecture again'} <span>→</span></button></div>`:`<div class="track-cell"><small>PILLAR 1 · LECTURE</small><strong>No lecture</strong><p>Bring every skill together with your coach.</p></div>`;
      let missionBody=row.mission?`<p class="track-mission">${esc(row.mission)}</p>`:'<p class="track-muted">You choose it at the end of the lecture.</p>';
      if (row.missionState==='set'&&!coach) missionBody+=`<button class="text-button" data-open-week${row.week}-reflection>Report mission <span>→</span></button>`;
      const levelChip=row.level?`<span class="track-level">Ladder step ${row.level} · ${esc(DATA.levels[row.level-1].name)}</span>`:'';
      const result=row.missionState==='done'&&row.result?`<p class="track-result"><small>WHAT HAPPENED</small>${esc(row.result)}</p>`:'';
      return `<article class="track-row card ${current&&row.week===current.week?'is-current':''} ${row.missionState==='done'?'is-done':''}"><header><span class="track-week">WEEK ${String(row.week).padStart(2,'0')}</span><h3>${esc(week.short)}</h3><p>${esc(week.outcome)}</p></header>${lectureCell}<div class="track-cell mission"><small>PILLAR 2 · MISSION ${missionPill[row.missionState]}</small>${missionBody}${levelChip}${result}</div></article>`;
    }).join('');
  }
  /* ---------- Lock Your Win ---------- */
  let celebrating=null;
  function winDone(week){const lecture=state[`week${week}Lecture`]||{};return !!state.wins?.[week]?.lockedAt||lecture.missionStatus==='completed';}
  function currentWinWeek(){for(let week=1;week<=6;week++)if(!winDone(week))return week;return null;}
  const lockIcon='<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function padlock(locked,burst){
    const sparks=burst?Array.from({length:12},(_,index)=>`<i style="--a:${index*30}deg;--d:${52+(index%3)*14}px"></i>`).join(''):'';
    return `<div class="win-lock ${locked?'locked':''} ${burst?'burst':''}" aria-hidden="true"><div class="win-sparks">${sparks}</div><svg viewBox="0 0 120 140"><path class="shackle" d="M40 64V44a20 20 0 0 1 40 0v20"/><rect class="body" x="22" y="62" width="76" height="62" rx="13"/><circle class="keyhole" cx="60" cy="88" r="7.5"/><rect class="keyhole" x="57" y="92" width="6" height="17" rx="3"/></svg></div>`;
  }
  function renderWin(){
    const target=$('#lockWin');if(!target||!DATA.wins)return;
    const coach=sync.role==='coach';
    const current=currentWinWeek();
    const names=DATA.weeks.slice(0,6).map(week=>week.short);
    const rail=`<ol class="win-rail" style="--fill:${current===null?1:(current-1)/5}" aria-label="Your wins, one for each lecture">${[1,2,3,4,5,6].map((week,index)=>{const status=winDone(week)?'done':week===current?'current':'next';return `<li class="${status} ${celebrating?.week===week?'pop':''}" aria-label="Lecture ${week}, ${names[index]}: ${status==='done'?'win locked':status==='current'?'current win':'coming up'}"><span class="win-node">${status==='done'?'✓':status==='current'?week:lockIcon}</span><small>${esc(names[index])}</small></li>`;}).join('')}</ol>`;
    const trophies=[1,2,3,4,5,6].filter(week=>state.wins?.[week]?.lockedAt).map(week=>{return `<li><b>${String(week).padStart(2,'0')}</b><span>${esc(names[week-1])}</span>${coach?'':`<button type="button" data-unlock-win="${week}" aria-label="Undo the win for lecture ${week}">Undo</button>`}</li>`;}).join('');
    let main;
    if(celebrating&&Date.now()<celebrating.until){
      const def=DATA.wins[celebrating.week];
      main=`<div class="win-main celebrate" role="status"><div class="win-copy"><span class="eyebrow">WIN LOCKED</span><h2 id="lockWinTitle">${esc(def.title)}</h2><p>Lecture ${celebrating.week} is yours. That one is in the bank.</p><button class="win-button" type="button" data-win-next>${current===null?'See my six wins':'Next win →'}</button></div>${padlock(true,true)}</div>`;
    }else if(current===null){
      main=`<div class="win-main"><div class="win-copy"><span class="eyebrow">ALL SIX WINS LOCKED</span><h2 id="lockWinTitle">Six lectures. Six wins.</h2><p>Every skill, put to work in real life.</p></div>${padlock(true,false)}</div>`;
    }else{
      const def=DATA.wins[current];const lecture=state[`week${current}Lecture`]||{};
      const mission=current!==1&&lecture.mission?`<p class="win-mission">Your mission: ${esc(lecture.mission)}</p>`:'';
      main=`<div class="win-main"><div class="win-copy"><span class="eyebrow">LOCK YOUR WIN · LECTURE ${current}</span><h2 id="lockWinTitle">${esc(def.title)}</h2><p>${esc(def.hint)}</p>${mission}<form id="winForm" class="win-form" data-win-week="${current}"><button class="win-check" type="submit" ${coach?'disabled':''}><span class="win-tick" aria-hidden="true">✓</span><span>My goal is done</span></button></form></div>${padlock(false,false)}</div>`;
    }
    target.innerHTML=`${main}${rail}${trophies?`<ul class="win-trophies" aria-label="Locked wins">${trophies}</ul>`:''}`;
  }
  document.addEventListener('submit',event=>{
    if(event.target.id!=='winForm')return;
    event.preventDefault();
    if(sync.role==='coach')return;
    const week=Number(event.target.dataset.winWeek);const def=DATA.wins?.[week];if(!def)return;
    state.wins={...(state.wins||{}),[week]:{lockedAt:new Date().toISOString()}};
    if(week===1&&COACHING?.missions?.some(m=>m.id==='prep-video'))state.coachingFollowUps={...(state.coachingFollowUps||{}),[COACHING.id]:{...(state.coachingFollowUps?.[COACHING.id]||{}),'prep-video':true}};
    celebrating={week,until:Date.now()+3600};
    saveFeedback('Win locked. Well done.');
    renderAll();
    setTimeout(()=>{if(celebrating?.week===week){celebrating=null;renderAll();}},3700);
  });

  function renderAll() {renderWin();renderCoachingUpdate();renderPractice();renderJourney();renderLectures();renderReflections();renderProgress();}
  function route() {
    const requested=location.hash.slice(1);const view=requested==='progress'?'journey':['home','journey','lectures','reflections'].includes(requested)?requested:'home';
    $$('.view').forEach(el=>el.hidden=el.id!==`${view}View`);
    $$('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===view);if(el.dataset.view===view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    $('#currentViewLabel').textContent={home:'My home',journey:'My journey',lectures:'My lectures',reflections:'My reflections'}[view];
    if(requested!=='dailyPractice') window.scrollTo({top:0,behavior:'instant'});
  }
  function updateLecture(week,patch) {state[`week${week}Lecture`]={...state[`week${week}Lecture`],...patch};saveState();}
  const portal = {
    client:{id:'muhammadashraf',name:'Muhammad',storageKey:DATA.storageKey},getState:()=>state,
    updateWeek1:patch=>updateLecture(1,patch),updateLecture:patch=>updateLecture(2,patch),updateWeek3:patch=>updateLecture(3,patch),updateWeek4:patch=>updateLecture(4,patch),updateWeek5:patch=>updateLecture(5,patch),updateWeek6:patch=>updateLecture(6,patch),
    setExposureLevel(level){state.currentLevel=clampLevel(level);state.week2Lecture.currentLevel=state.currentLevel;saveState();renderJourney();},
    resetLecture(week){
      if(!window.confirm(`Reset Lecture ${week}? This clears its answers and mission. Your other progress stays saved.`)) return false;
      state.coachingLectureResets={...(state.coachingLectureResets||{}),[week]:COACHING?.id};state[`week${week}Lecture`]=structuredClone(defaults[`week${week}Lecture`]);state.evidence=state.evidence.filter(item=>Number(item.sourceLecture)!==Number(week));saveState();renderAll();showToast(`Lecture ${week} is ready for a fresh start.`);return true;
    },
    saveEvidence(card){
      const entry={id:card.id,sourceLecture:Number(card.week),action:card.mission,result:card.reality,next:card.prediction?`Notice how the result compared with my prediction: ${card.prediction}`:'Repeat the skill in another conversation.',createdAt:card.completedAt||new Date().toISOString()};
      const existing=state.evidence.findIndex(item=>item.id===entry.id);if(existing>=0)state.evidence[existing]=entry;else state.evidence.unshift(entry);saveState();renderReflections();
    },renderAll,showToast,saveState
  };
  window.SpeakersGymPortal=portal; window.SpeakersGymExposure={levels:DATA.levels,clampLevel};
  function renderTour() {
    $('#tourTitle').textContent=tour[tourStep][0];$('#tourDescription').textContent=tour[tourStep][1];
    $('#tourArt').innerHTML=`<span class="tour-number">0${tourStep+1}</span><div class="tour-mini"><small>${esc(tour[tourStep][2].toUpperCase())}</small><strong>${esc(tour[tourStep][3])}</strong><div></div><div></div></div>`;
    $('#tourStepLabel').textContent=`YOUR SPACE · STEP ${tourStep+1} OF 3`;
    $('#tourDots').innerHTML=tour.map((_,index)=>`<span class="${index===tourStep?'active':''}"></span>`).join('');
    $('#tourBack').hidden=tourStep===0;$('#tourNext').innerHTML=tourStep===2?"Let's practice <span>↗</span>":'Next <span>→</span>';
  }
  $('#daySelect').innerHTML=flatDays.map((_,index)=>`<option value="${index}">${index+1}</option>`).join('');
  $('#daySelect').addEventListener('change',event=>setDay(event.target.value));
  $('#previousDay').addEventListener('click',()=>setDay(state.selectedDay-1));$('#nextDay').addEventListener('click',()=>setDay(state.selectedDay+1));
  $('#completePractice').addEventListener('click',()=>{state.completedDays[state.selectedDay]=!state.completedDays[state.selectedDay];saveFeedback(state.completedDays[state.selectedDay]?'One more small step. Your practice is saved.':'Practice marked as incomplete.');renderPractice();renderJourney();});
  document.addEventListener('click',event=>{
    const day=event.target.closest('[data-day]');if(day){setDay(day.dataset.day);location.hash='dailyPractice';route();$('#dailyPractice').scrollIntoView({behavior:'smooth',block:'start'});}
    const reset=event.target.closest('[data-reset-lecture]');if(reset)portal.resetLecture(Number(reset.dataset.resetLecture));
    if(event.target.closest('[data-tour]')){tourStep=0;renderTour();$('#tourDialog').showModal();}
    const ladderStep=event.target.closest('[data-ladder-step]');if(ladderStep&&sync.role!=='coach'){portal.setExposureLevel(ladderStep.dataset.ladderStep);showToast('Your speaking ladder step is saved.');}
    if(event.target.closest('[data-win-next]')){celebrating=null;renderAll();}
    const unlock=event.target.closest('[data-unlock-win]');
    if(unlock&&sync.role!=='coach'){const week=Number(unlock.dataset.unlockWin);state.wins={...(state.wins||{}),[week]:{}};if(week===1&&COACHING)state.coachingFollowUps={...(state.coachingFollowUps||{}),[COACHING.id]:{...(state.coachingFollowUps?.[COACHING.id]||{}),'prep-video':false}};saveFeedback('Win unlocked. Lock it again when it is done.');renderAll();}
    if(event.target.closest('[data-logout]'))logout();
    if(event.target.closest('#saveCoachMission'))saveCoachMission();
    if(event.target.closest('#completeWeek6')){const result=$('#week6Result').value.trim();if(!result){showToast('Add one sentence about what happened.');$('#week6Result').focus();return;}state.week6Mission={status:'completed',result,completedAt:new Date().toISOString()};saveFeedback('Week 6 mission saved. Well done.');renderProgress();}
  });
  async function saveCoachMission() {
    const missions={...(sync.coach.missions||{}),6:$('#coachMission6').value.trim()};
    try { const result=await api('PUT','coach',{coach:{...sync.coach,missions}}); if(result.status!==200) throw new Error(); sync.coach={...sync.coach,missions}; showToast('Week 6 mission saved. Muhammad will see it.'); renderProgress(); }
    catch { showToast('The mission could not be saved. Please try again.'); }
  }
  // Pick up changes made on another device when someone comes back to this tab.
  document.addEventListener('visibilitychange',async()=>{
    if(document.visibilityState!=='visible'||sync.mode!=='cloud'||sync.saving||sync.timer)return;
    try{const result=await api('GET','state');if(result.status!==200)return;sync.coach=result.json.coach||sync.coach;sync.updatedAt=result.json.updatedAt;if(result.json.version!==sync.version&&result.json.state)applyRemote(result.json.state,result.json.version);else renderProgress();}catch{}
  });
  $('#prepareCall').addEventListener('click',()=>{location.hash='reflections';route();$('#callNote').focus();});
  $('#saveCallNote').addEventListener('click',()=>{state.callNote=$('#callNote').value.trim();saveFeedback('Your note is saved for your call.');});
  $('#reflectionForm').addEventListener('submit',event=>{event.preventDefault();const action=$('#reflectionAction').value.trim(),result=$('#reflectionResult').value.trim();if(!action||!result){showToast('Add what you tried and what you noticed.');return;}state.reflections.unshift({id:crypto.randomUUID(),action,result,next:$('#reflectionNext').value.trim(),createdAt:new Date().toISOString()});saveFeedback('Your reflection is saved.');$('#reflectionForm').reset();renderReflections();});
  $('#exportNotes').addEventListener('click',()=>{
    const moments=[...state.reflections,...state.evidence];
    const text=["Muhammad's Speaker's Gym notes",'',`Coaching note: ${state.callNote||'No note yet.'}`,'',...moments.flatMap(item=>[new Date(item.createdAt).toLocaleDateString('en-GB'),`Tried: ${item.action||''}`,`Noticed: ${item.result||''}`,`Next: ${item.next||''}`,''])].join('\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='muhammad-coaching-notes.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('#closeTour').addEventListener('click',()=>$('#tourDialog').close());
  $('#tourNext').addEventListener('click',()=>{if(tourStep<2){tourStep++;renderTour();$('#tourNext').focus();}else{$('#tourDialog').close();location.hash='dailyPractice';route();$('#dailyPractice').scrollIntoView({behavior:'smooth',block:'start'});$('#completePractice').focus({preventScroll:true});}});
  $('#tourBack').addEventListener('click',()=>{tourStep=Math.max(0,tourStep-1);renderTour();});
  window.addEventListener('hashchange',route);

  function renderCoachingUpdate(){
    if(!COACHING)return;
    const done=state.coachingFollowUps?.[COACHING.id]||{};
    const count=COACHING.missions.filter(m=>done[m.id]).length;
    $('#coachingUpdate').innerHTML='<div class="coaching-head"><div><span class="eyebrow">'+esc(COACHING.label||'YOUR LATEST CALL')+'</span><h2>'+esc(COACHING.title||'Your focus this week')+'</h2></div><span class="coaching-count" aria-label="'+count+' of '+COACHING.missions.length+' done">'+count+'/'+COACHING.missions.length+'</span></div><p>'+esc(COACHING.summary)+'</p><div class="coaching-missions">'+COACHING.missions.map((m,i)=>'<label class="coaching-mission'+(done[m.id]?' is-done':'')+'"><input type="checkbox" data-coaching-mission="'+esc(m.id)+'" '+(done[m.id]?'checked':'')+(sync.role==='coach'?' disabled':'')+'><span class="mission-number">'+(i+1)+'</span><span><strong>'+esc(m.title)+'</strong><small>'+esc(m.text)+'</small></span></label>').join('')+'</div><details><summary>A few gentle tips</summary><ul>'+COACHING.challenges.map(c=>'<li>'+esc(c)+'</li>').join('')+'</ul></details>';
    const call=COACHING.nextCall;const when=new Date(call.start);
    const part=(opts,tz)=>new Intl.DateTimeFormat('en-GB',{...opts,timeZone:tz}).format(when);
    const time=tz=>part({hour:'numeric',minute:'2-digit',hour12:true},tz).replace('am','a.m.').replace('pm','p.m.');
    const link=call.meetingLink?'<a class="button dark" href="'+esc(call.meetingLink)+'" target="_blank" rel="noopener">Join coaching call ↗</a>':'<span class="status-pill"><i></i>Agreed together</span><p class="helper">Calendar invitation and joining link to follow.</p>';
    $('#coachingSession').innerHTML='<span class="eyebrow">YOUR LIVE COACHING SESSION</span><h2 id="sessionTitle">'+(COACHING.callNumber?'Your next coaching call':'Your first coaching call')+'</h2><div class="session-date"><div class="date-tile"><small>'+esc(part({month:'short'},call.timeZone).toUpperCase())+'</small><strong>'+esc(part({day:'2-digit'},call.timeZone))+'</strong></div><div><strong>'+esc(part({weekday:'long',day:'numeric',month:'long'},call.timeZone))+'</strong><span>60 minutes with Marouane</span></div></div><div class="session-times"><div><span>Dubai</span><strong>'+esc(time(call.timeZone))+'</strong></div><div><span>Prague</span><strong>'+esc(time(call.coachTimeZone||'Europe/Prague'))+'</strong></div></div>'+link+'<div class="session-prep"><strong>'+esc(call.prepTitle||'Come as you are.')+'</strong><p>'+esc(call.prepText||'')+'</p></div><button class="text-button" id="prepareCall">Save a note for our call <span>→</span></button>';
    $('#prepareCall').addEventListener('click',()=>{location.hash='reflections';$('#callNote').focus();});
  }
  document.addEventListener('change',event=>{const input=event.target.closest('[data-coaching-mission]');if(!input||sync.role==='coach'||!COACHING.missions.some(m=>m.id===input.dataset.coachingMission))return;state.coachingFollowUps={...(state.coachingFollowUps||{}),[COACHING.id]:{...(state.coachingFollowUps?.[COACHING.id]||{}),[input.dataset.coachingMission]:input.checked}};saveState();renderCoachingUpdate();});

  renderAll();route();
  document.body.classList.add('portal-locked');boot();
})();
