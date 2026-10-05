import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
const root = process.env.ASHWIN_TEST_ROOT || fileURLToPath(new URL('../public/ashwin-portal',import.meta.url));
function fixture(saved,remote,coaching=false) {
  const elements=new Map(), store=new Map([['speakers-gym-ashwin-v1',JSON.stringify(saved)]]), calls=[],timers=[],events={};
  const make=()=>({innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(type,fn){this[type]=fn;},remove(){},focus(){},scrollIntoView(){},reset(){}});
  const node=selector=>{if(!elements.has(selector))elements.set(selector,make());return elements.get(selector);};
  const env={window:{addEventListener(){},scrollTo(){},confirm:()=>true},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(type,fn){events[type]=fn;},body:make()},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},location:{hash:'',search:''},URLSearchParams,structuredClone,Date,console,crypto:{randomUUID:()=> 'fixture-id'},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout(){},fetch:async(url,options)=>{calls.push({url,options});return {status:remote?200:503,json:async()=>options.method==='GET'?remote:{version:8}};}};
  const context=vm.createContext(env);
  for(const file of ['data.js','lecture-defaults.js',...(coaching?['coaching-update.js']:[]),'app.js'])vm.runInContext(fs.readFileSync(`${root}/${file}`,'utf8'),context,{filename:file});
  return {portal:env.window.SpeakersGymPortal,env,store,elements,calls,timers,events};
}

test('Ashwin call-one guidance preserves progress and separates lecture completion from missions',async()=>{
 const saved={completedDays:{3:true},reflections:[{id:'keep',action:'My answer',result:'Clearer'}],evidence:[{id:'own',sourceLecture:2}],week1Lecture:{currentStep:4,prep:{point:'My point'}}};
 const app=fixture(saved,null,true);for(let i=0;i<8;i++)await Promise.resolve();
 const state=app.portal.getState();assert.equal(state.week1Lecture.lectureCompletedAt,'2026-10-05');assert.notEqual(state.week1Lecture.missionStatus,'completed');assert.ok(!state.week2Lecture.lectureCompletedAt);assert.equal(state.week1Lecture.prep.point,'My point');assert.equal(state.reflections[0].id,'keep');assert.equal(state.evidence[0].id,'own');assert.equal(state.completedDays[3],true);
 assert.match(app.elements.get('#coachingSession').innerHTML,/11:30/);assert.match(app.elements.get('#coachingSession').innerHTML,/kwz-hpne-xef/);assert.match(app.elements.get('#coachingUpdate').innerHTML,/60-second PREP/);
 app.events.change({target:{closest:()=>({dataset:{coachingMission:'prep-video'},checked:true})}});
 app.portal.resetLecture(1);const stored=JSON.parse(app.store.get('speakers-gym-ashwin-v1'));const reload=fixture(stored,null,true);assert.ok(!reload.portal.getState().week1Lecture.lectureCompletedAt);assert.equal(reload.portal.getState().coachingFollowUps['coaching-1-2026-10-05']['prep-video'],true);
});

