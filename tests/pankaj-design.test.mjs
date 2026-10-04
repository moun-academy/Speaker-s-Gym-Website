import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
const root = process.env.PANKAJ_TEST_ROOT || fileURLToPath(new URL('../public/pankaj-portal',import.meta.url));
function fixture(saved,remote,coaching=false) {
  const elements=new Map(), store=new Map([['speakers-gym-pankaj',JSON.stringify(saved)]]), calls=[],timers=[],events={};
  const make=()=>({innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(type,fn){this[type]=fn;},remove(){},focus(){},scrollIntoView(){},reset(){}});
  const node=selector=>{if(!elements.has(selector))elements.set(selector,make());return elements.get(selector);};
  const env={window:{addEventListener(){},scrollTo(){},confirm:()=>true},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(type,fn){events[type]=fn;},body:make()},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},location:{hash:'',search:''},URLSearchParams,structuredClone,Date,console,crypto:{randomUUID:()=> 'fixture-id'},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout(){},fetch:async(url,options)=>{calls.push({url,options});return {status:remote?200:503,json:async()=>options.method==='GET'?remote:{version:8}};}};
  const context=vm.createContext(env);
  for(const file of ['data.js','journey-data.js','lecture-defaults.js',...(coaching?['coaching-update.js']:[]),'app.js'])vm.runInContext(fs.readFileSync(`${root}/${file}`,'utf8'),context,{filename:file});
  return {portal:env.window.SpeakersGymPortal,env,store,elements,calls,timers,events};
}
const legacy={startDate:'2026-09-14',selectedDay:8,selectedReviewWeek:2,currentLevel:4,completedDays:{0:true,8:true},reflections:{0:'My recommendation was understood.'},weeklyReviews:{2:{improved:'Audible endings',breakdown:'Rushed opening',nextFocus:'Slow the headline'}},coachNotes:{upcomingMoment:'Management review'},repetitions:[{id:'real-1',level:4,note:'Contributed early'}],evidence:[{id:'existing',sourceLecture:1,createdAt:1790000000000,action:'Spoke',result:'Understood'}],week1Lecture:{currentStep:4,prep:{point:'Keep my point'}},week5Lecture:{currentStep:6,mission:'My own mission',actualResult:'Keep this result'}};
const plain=value=>JSON.parse(JSON.stringify(value));
test('Pankaj dashboard keeps his program and migrates saved daily notes without losing progress',async()=>{
  const app=fixture(legacy);await Promise.resolve();await Promise.resolve();
  const state=app.portal.getState();
  for(const key of ['startDate','selectedDay','selectedReviewWeek','currentLevel','completedDays','weeklyReviews','repetitions','evidence']) assert.deepEqual(plain(state[key]),legacy[key],key);
  assert.equal(state.coachNotes.upcomingMoment,legacy.coachNotes.upcomingMoment);
  assert.deepEqual(plain(state.legacyDailyReflections),legacy.reflections);
  assert.equal(state.reflections[0].result,legacy.reflections[0]);
  assert.equal(state.week1Lecture.prep.point,'Keep my point');assert.equal(state.week5Lecture.actualResult,'Keep this result');
  assert.equal(app.env.window.PANKAJ_JOURNEY_DATA.weeks.length,6);assert.equal(app.env.window.PANKAJ_JOURNEY_DATA.weeks.flatMap(week=>week.days).length,42);
  assert.equal(app.env.window.SpeakersGymExposure.levels.length,10);
  assert.equal(app.env.window.PANKAJ_JOURNEY_DATA.lectures[4].week,5);
  app.portal.updateWeek5({currentStep:7});
  const saved=JSON.parse(app.store.get('speakers-gym-pankaj'));
  assert.equal(saved.week5Lecture.currentStep,7);assert.deepEqual(saved.legacyDailyReflections,legacy.reflections);assert.equal(saved.week1Lecture.prep.point,'Keep my point');
  const reload=fixture(saved);assert.equal(reload.portal.getState().reflections.length,1,'migration does not duplicate notes');
});
test('published Call 3 updates stale timing once and keeps mission completion separate from lecture progress',async()=>{
  const app=fixture({...legacy,weeklyCoaching:{day:'Saturday',time:'09:00',timeZone:'Europe/Prague'}},null,true);
  for(let i=0;i<8;i++)await Promise.resolve();
  assert.deepEqual(plain(app.portal.getState().weeklyCoaching),{day:'Sunday',time:'12:00',timeZone:'Asia/Dubai',nextDate:'2026-10-11'});
  assert.match(app.elements.get('#coachingUpdate').innerHTML,/Your focus this week/);
  app.events.change({target:{closest:()=>({dataset:{coachingMission:'pace-prep'},checked:true})}});
  assert.equal(app.portal.getState().coachingFollowUps['coaching-3-2026-10-04']['pace-prep'],true);
  assert.equal(app.portal.getState().week5Lecture.actualResult,legacy.week5Lecture.actualResult);
  assert.deepEqual(plain(app.portal.getState().completedDays),legacy.completedDays);
  const saved=JSON.parse(app.store.get('speakers-gym-pankaj'));
  const edited={...saved,weeklyCoaching:{day:'Sunday',time:'13:00',timeZone:'Asia/Dubai',nextDate:'2026-10-11'}};
  const reload=fixture(edited,null,true);
  assert.equal(reload.portal.getState().weeklyCoaching.time,'13:00','same published update does not overwrite a later edit');
  assert.equal(reload.portal.getState().coachingFollowUps['coaching-3-2026-10-04']['pace-prep'],true);
});
test('Pankaj cloud saves retain legacy progress and use only his own client record',async()=>{
  const app=fixture(null,{role:'client',open:true,version:7,state:legacy,coach:{missions:{6:'Give a management update'}}});
  for(let i=0;i<8;i++)await Promise.resolve();
  assert.equal(app.portal.getState().week5Lecture.actualResult,'Keep this result');
  app.portal.updateWeek5({currentStep:7});await app.timers.find(timer=>timer.delay===700).fn();
  const put=app.calls.find(call=>call.options.method==='PUT');assert.match(put.url,/client=pankaj$/);
  const payload=JSON.parse(put.options.body);assert.equal(payload.version,7);assert.equal(payload.state.week5Lecture.currentStep,7);assert.deepEqual(payload.state.weeklyReviews,legacy.weeklyReviews);assert.deepEqual(payload.state.legacyDailyReflections,legacy.reflections);
});
test('static preview preserves browser progress when the API endpoint returns HTML',async()=>{
  const app=fixture(legacy,{});for(let i=0;i<8;i++)await Promise.resolve();
  assert.equal(app.portal.getState().selectedDay,8);assert.equal(app.portal.getState().week1Lecture.prep.point,'Keep my point');
  assert.equal(app.elements.get('#storageStatus').textContent,'Your progress stays in this browser.');
});

test('weekly coaching time validates, saves and survives reload without changing other progress',async()=>{
  const app=fixture(legacy);for(let i=0;i<8;i++)await Promise.resolve();
  app.elements.get('#coachingDay').value='Tuesday';app.elements.get('#coachingTime').value='15:30';app.elements.get('#coachingTimeZone').value='Asia/Kolkata';
  app.elements.get('#coachingScheduleForm').submit({preventDefault(){}});
  const saved=JSON.parse(app.store.get('speakers-gym-pankaj'));
  assert.deepEqual(saved.weeklyCoaching,{day:'Tuesday',time:'15:30',timeZone:'Asia/Kolkata'});
  assert.deepEqual(saved.completedDays,legacy.completedDays);assert.equal(saved.week1Lecture.prep.point,'Keep my point');
  const reload=fixture(saved);assert.equal(reload.elements.get('#coachingScheduleLabel').textContent,'Tuesday · 15:30');
  app.elements.get('#coachingDay').value='Tuesday';app.elements.get('#coachingTime').value='25:30';app.elements.get('#coachingTimeZone').value='Asia/Kolkata';
  app.elements.get('#coachingScheduleForm').submit({preventDefault(){}});
  assert.equal(app.portal.getState().weeklyCoaching.time,'15:30');
  app.elements.get('#coachingTime').value='16:30';app.elements.get('#coachingTimeZone').value='not-a-timezone';
  app.elements.get('#coachingScheduleForm').submit({preventDefault(){}});
  assert.equal(app.portal.getState().weeklyCoaching.time,'15:30');
});
