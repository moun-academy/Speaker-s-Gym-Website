(function () {
  'use strict';
  const DATA = window.ASHWIN_DATA;
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clampLevel = value => Math.max(1, Math.min(10, Number(value) || 1));
  const flatDays = DATA.weeks.flatMap((week, weekIndex) => week.days.map((day, dayIndex) => ({title:day[0],description:day[1],prompt:day[2],steps:day[3],weekIndex,dayIndex})));
  const defaults = {...window.ASHWIN_DEFAULTS,version:1,selectedDay:0,selectedWeek:0,currentLevel:1,nextLevel:1,reflections:[],callNote:''};
  const merge = (base, patch) => Object.fromEntries([...Object.entries(patch && typeof patch==='object' ? patch : {}),...Object.entries(base).map(([key,value])=>[key,value && typeof value==='object' && !Array.isArray(value) ? merge(value,patch?.[key]) : patch?.[key] ?? value])]);
  let state;
  let canSave = true;
  try { state = merge(defaults, JSON.parse(localStorage.getItem(DATA.storageKey) || 'null')); }
  catch { state = structuredClone(defaults); }
  state.selectedDay = Math.max(0,Math.min(41,Number(state.selectedDay)||0));
  state.selectedWeek = Math.max(0,Math.min(5,Number(state.selectedWeek)||0));
  if (!Array.isArray(state.reflections)) state.reflections=[];
  if (!Array.isArray(state.evidence)) state.evidence=[];
  let toastTimer;
  let tourStep=0;
  const tour = [
    ['One small practice each day.','Your home gives you one speaking prompt. Open the app, choose video, and practice for 5–10 minutes. Mark it done when you finish.','Your one thing today','One clear introduction'],
    ['Learn, then try it out loud.','Your lectures guide you through structure, voice, pace, and pauses. You can explore any lecture. Your place is saved when you leave.','Your speaking foundations','Learn → Practice → Try'],
    ['Keep the evidence of progress.','Save a small win or a question in your reflections. Bring useful notes to your one-hour coaching calls with Marouane.','Small wins, real evidence','Notice. Learn. Continue.']
  ];

  function showToast(message) {
    clearTimeout(toastTimer); $('#toast').textContent=message; $('#toast').classList.add('show');
    toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200);
  }
  function saveState() {
    try { localStorage.setItem(DATA.storageKey,JSON.stringify(state)); canSave=true; $('#storageStatus').textContent='Your progress stays in this browser.'; return true; }
    catch { canSave=false; $('#storageStatus').textContent='Saving is unavailable. Export notes before leaving.'; showToast('This browser could not save your progress. Export notes before leaving.'); return false; }
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
    const count=Object.values(state.completedDays).filter(Boolean).length;
    $('#progressText').textContent=`${count} of 42 daily practices completed`;
    $('#progressFill').style.width=`${count/42*100}%`;
    $('.progress-track').setAttribute('aria-valuenow',count);
  }
  function renderJourney() {
    const week=DATA.weeks[state.selectedWeek]; const offset=state.selectedWeek*7;
    $('#weekTabs').innerHTML=DATA.weeks.map((item,index)=>`<button class="week-tab" id="week-tab-${index}" role="tab" aria-controls="weekDetail" aria-selected="${index===state.selectedWeek}" tabindex="${index===state.selectedWeek?0:-1}" data-week="${index}"><span>WEEK ${String(index+1).padStart(2,'0')}</span>${esc(item.short)}</button>`).join('');
    const lecture=DATA.lectures.find(item=>item.week===week.lecture);
    $('#weekDetail').setAttribute('role','tabpanel');$('#weekDetail').setAttribute('aria-labelledby',`week-tab-${state.selectedWeek}`);
    $('#weekDetail').innerHTML=`<article class="week-detail card"><header class="week-detail-header"><div><span class="eyebrow">WEEK ${state.selectedWeek+1} · ${esc(week.short.toUpperCase())}</span><h2>${esc(week.title)}</h2><p>${esc(week.focus)}</p></div>${lecture?`<button class="button dark" ${lecture.trigger}>Open this week's lecture ↗</button>`:'<span class="status-pill">Applied practice with your coach</span>'}</header><div class="week-outcome"><span class="eyebrow">WHAT YOU ARE WORKING TOWARD</span><p>${esc(week.outcome)}</p></div><ol class="week-days">${week.days.map((day,index)=>`<li><span class="day-index">${String(index+1).padStart(2,'0')}</span><div><h3>${esc(day[0])}</h3><p>${esc(day[1])}</p></div><button data-day="${offset+index}" class="${state.completedDays[offset+index]?'completed-day':''}">${state.completedDays[offset+index]?'Done ✓':'Practice →'}</button></li>`).join('')}</ol></article>`;
    $('#levelSelect').value=state.currentLevel;
    $('#levelList').innerHTML=DATA.levels.map((level,index)=>`<div class="level-row ${state.currentLevel===index+1?'current':''}"><span>${String(index+1).padStart(2,'0')}</span><div><strong>${esc(level.name)}</strong><p>${esc(level.behavior)}</p></div></div>`).join('');
  }
  function lectureArt(type) {
    const content={
      structure:'<rect x="26" y="58" width="40" height="42" rx="5"/><rect x="86" y="45" width="40" height="55" rx="5"/><rect x="146" y="28" width="40" height="72" rx="5"/><rect x="206" y="10" width="40" height="90" rx="5"/><path d="M66 79H86M126 68H146M186 58H206"/>',
      voice:'<path d="M30 60V64M45 47V77M60 37V87M75 49V75M90 22V102M105 37V87M120 8V116M135 32V92M150 40V84M165 20V104M180 34V90M195 46V78M210 40V84M225 51V73M240 57V67" stroke-width="5" stroke-linecap="round"/>',
      pace:'<path d="M15 89C45 89 45 39 75 39S105 89 135 89S165 19 195 19S225 79 255 79" stroke-width="2"/><circle cx="75" cy="39" r="6"/><circle cx="135" cy="89" r="6"/><circle cx="195" cy="19" r="6"/><path d="M15 108H255" stroke-dasharray="2 5"/>',
      pauses:'<circle cx="135" cy="62" r="51" stroke-opacity=".3"/><circle cx="135" cy="62" r="39" stroke-opacity=".5"/><rect x="120" y="43" width="8" height="38" rx="4"/><rect x="142" y="43" width="8" height="38" rx="4"/><path d="M40 62H62M208 62H230"/>'
    };
    return `<svg viewBox="0 0 270 125" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${content[type]}</svg>`;
  }
  function renderLectures() {
    $('#lectureCards').innerHTML=DATA.lectures.map(item=>{
      const lecture=state[`week${item.week}Lecture`];const started=!!lecture.lastViewedAt;const finished=!!lecture.lectureCompletedAt;
      return `<article class="lecture-card card"><div class="lecture-art ${item.art}" aria-hidden="true"><span>LECTURE ${String(item.week).padStart(2,'0')}</span>${lectureArt(item.art)}<small>LEARN · PRACTICE · PROVE</small></div><div class="lecture-copy"><span class="micro">${esc(item.skill)}<span class="lecture-status">${finished?'Explored ✓':started?'In progress':'Ready to explore'}</span></span><h2>${esc(item.title)}</h2><p>${esc(item.description)}</p><button class="button ${item.week===1?'dark':'outline'}" ${item.trigger}>${started?'Continue lecture':'Explore lecture'}<span>→</span></button></div></article>`;
    }).join('');
  }
  function renderReflections() {
    $('#callNote').value=state.callNote;
    const moments=[...state.reflections,...state.evidence].sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt));
    $('#savedReflections').innerHTML=moments.length?moments.map(item=>`<article class="saved-moment card"><small>${esc(new Date(item.createdAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}))}${item.sourceLecture?` · LECTURE ${Number(item.sourceLecture)}`:''}</small><h3>${esc(item.action||item.mission)}</h3><p>${esc(item.result||item.reality)}</p>${item.next?`<p class="next-note">Next: ${esc(item.next)}</p>`:''}</article>`).join(''):'<div class="empty-state"><span>✧</span>Your first small win belongs here.<br>Start with one moment you want to remember.</div>';
  }
  function renderAll() {renderPractice();renderJourney();renderLectures();renderReflections();}
  function route() {
    const requested=location.hash.slice(1);const view=['home','journey','lectures','reflections'].includes(requested)?requested:'home';
    $$('.view').forEach(el=>el.hidden=el.id!==`${view}View`);
    $$('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===view);if(el.dataset.view===view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
    $('#currentViewLabel').textContent={home:'My home',journey:'My journey',lectures:'My lectures',reflections:'My reflections'}[view];
    if(requested!=='dailyPractice') window.scrollTo({top:0,behavior:'instant'});
  }
  function updateLecture(week,patch) {state[`week${week}Lecture`]={...state[`week${week}Lecture`],...patch};saveState();}
  const portal = {
    client:{id:'ashwin',name:'Ashwin',storageKey:DATA.storageKey},getState:()=>state,
    updateWeek1:patch=>updateLecture(1,patch),updateLecture:patch=>updateLecture(2,patch),updateWeek3:patch=>updateLecture(3,patch),updateWeek4:patch=>updateLecture(4,patch),
    setExposureLevel(level){state.currentLevel=clampLevel(level);state.week2Lecture.currentLevel=state.currentLevel;saveState();renderJourney();},
    resetLecture(week){
      if(!window.confirm(`Reset Lecture ${week}? This clears its answers and mission. Ashwin's other progress stays saved.`)) return false;
      state[`week${week}Lecture`]=structuredClone(defaults[`week${week}Lecture`]);state.evidence=state.evidence.filter(item=>Number(item.sourceLecture)!==Number(week));saveState();renderAll();return true;
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
  $('#levelSelect').innerHTML=DATA.levels.map((item,index)=>`<option value="${index+1}">${index+1}. ${esc(item.name)}</option>`).join('');
  $('#daySelect').addEventListener('change',event=>setDay(event.target.value));
  $('#previousDay').addEventListener('click',()=>setDay(state.selectedDay-1));$('#nextDay').addEventListener('click',()=>setDay(state.selectedDay+1));
  $('#completePractice').addEventListener('click',()=>{state.completedDays[state.selectedDay]=!state.completedDays[state.selectedDay];saveFeedback(state.completedDays[state.selectedDay]?'One more small step. Your practice is saved.':'Practice marked as incomplete.');renderPractice();renderJourney();});
  $('#levelSelect').addEventListener('change',event=>portal.setExposureLevel(event.target.value));
  $('#weekTabs').addEventListener('keydown',event=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key))return;event.preventDefault();state.selectedWeek=event.key==='Home'?0:event.key==='End'?5:(state.selectedWeek+(event.key==='ArrowRight'?1:5))%6;saveState();renderJourney();$(`#week-tab-${state.selectedWeek}`).focus();});
  document.addEventListener('click',event=>{
    const week=event.target.closest('[data-week]');if(week){state.selectedWeek=Number(week.dataset.week);saveState();renderJourney();}
    const day=event.target.closest('[data-day]');if(day){setDay(day.dataset.day);location.hash='dailyPractice';route();$('#dailyPractice').scrollIntoView({behavior:'smooth',block:'start'});}
    const reset=event.target.closest('[data-reset-lecture]');if(reset)portal.resetLecture(Number(reset.dataset.resetLecture));
    if(event.target.closest('[data-tour]')){tourStep=0;renderTour();$('#tourDialog').showModal();}
  });
  $('#prepareCall').addEventListener('click',()=>{location.hash='reflections';route();$('#callNote').focus();});
  $('#saveCallNote').addEventListener('click',()=>{state.callNote=$('#callNote').value.trim();saveFeedback('Your note is saved for your call.');});
  $('#reflectionForm').addEventListener('submit',event=>{event.preventDefault();const action=$('#reflectionAction').value.trim(),result=$('#reflectionResult').value.trim();if(!action||!result){showToast('Add what you tried and what you noticed.');return;}state.reflections.unshift({id:crypto.randomUUID(),action,result,next:$('#reflectionNext').value.trim(),createdAt:new Date().toISOString()});saveFeedback('Your reflection is saved.');$('#reflectionForm').reset();renderReflections();});
  $('#exportNotes').addEventListener('click',()=>{
    const moments=[...state.reflections,...state.evidence];
    const text=["Ashwin's Speaker's Gym notes",'',`Coaching note: ${state.callNote||'No note yet.'}`,'',...moments.flatMap(item=>[new Date(item.createdAt).toLocaleDateString('en-GB'),`Tried: ${item.action||''}`,`Noticed: ${item.result||''}`,`Next: ${item.next||''}`,''])].join('\n');
    const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='ashwin-coaching-notes.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  $('#closeTour').addEventListener('click',()=>$('#tourDialog').close());
  $('#tourNext').addEventListener('click',()=>{if(tourStep<2){tourStep++;renderTour();$('#tourNext').focus();}else{$('#tourDialog').close();location.hash='dailyPractice';route();$('#dailyPractice').scrollIntoView({behavior:'smooth',block:'start'});$('#completePractice').focus({preventScroll:true});}});
  $('#tourBack').addEventListener('click',()=>{tourStep=Math.max(0,tourStep-1);renderTour();});
  window.addEventListener('hashchange',route);
  renderAll();route();
})();
