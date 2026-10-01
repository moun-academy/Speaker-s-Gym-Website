import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
const root = process.env.PANKAJ_TEST_ROOT || fileURLToPath(new URL('../public/pankaj-portal',import.meta.url));
function fixture(saved,remote) {
  const elements=new Map(), store=new Map([['speakers-gym-pankaj',JSON.stringify(saved)]]), calls=[],timers=[];
  const make=()=>({innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(type,fn){this[type]=fn;},remove(){},focus(){},scrollIntoView(){},reset(){}});
  const node=selector=>{if(!elements.has(selector))elements.set(selector,make());return elements.get(selector);};
  const env={window:{addEventListener(){},scrollTo(){},confirm:()=>true},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(){},body:make()},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},location:{hash:'',search:''},URLSearchParams,structuredClone,Date,console,crypto:{randomUUID:()=> 'fixture-id'},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout(){},fetch:async(url,options)=>{calls.push({url,options});return {status:remote?200:503,json:async()=>options.method==='GET'?remote:{version:8}};}};
  const context=vm.createContext(env);
  for(const file of ['data.js','journey-data.js','lecture-defaults.js','app.js'])vm.runInContext(fs.readFileSync(`${root}/${file}`,'utf8'),context,{filename:file});
  return {portal:env.window.SpeakersGymPortal,env,store,elements,calls,timers};
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
