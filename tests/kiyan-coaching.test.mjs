import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
const root = process.env.KIYAN_TEST_ROOT || fileURLToPath(new URL('../public/kiyan-portal',import.meta.url));
function fixture(saved,remote,coaching=false) {
  const elements=new Map(), store=new Map([['speakers-gym-kiyan-v1',JSON.stringify(saved)]]), calls=[],timers=[],events={};
  const make=()=>({innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(type,fn){this[type]=fn;},remove(){},focus(){},scrollIntoView(){},reset(){}});
  const node=selector=>{if(!elements.has(selector))elements.set(selector,make());return elements.get(selector);};
  const env={window:{addEventListener(){},scrollTo(){},confirm:()=>true},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(type,fn){events[type]=fn;},body:make()},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},location:{hash:'',search:''},URLSearchParams,structuredClone,Date,console,crypto:{randomUUID:()=> 'fixture-id'},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout(){},fetch:async(url,options)=>{calls.push({url,options});return {status:remote?200:503,json:async()=>options.method==='GET'?remote:{version:8}};}};
  const context=vm.createContext(env);
  for(const file of ['data.js','lecture-defaults.js',...(coaching?['coaching-update.js']:[]),'app.js'])vm.runInContext(fs.readFileSync(`${root}/${file}`,'utf8'),context,{filename:file});
  return {portal:env.window.SpeakersGymPortal,env,store,elements,calls,timers,events};
}

test('Kiyan call-three guidance preserves progress and separates lecture completion from missions',async()=>{
 const saved={startDate:'2026-10-12',currentLevel:3,nextLevel:4,completedDays:{3:true},reflections:[{id:'keep',action:'My answer',result:'Clearer'}],evidence:[{id:'own',sourceLecture:2}],week1Lecture:{currentStep:4,prep:{point:'My point'}},week2Lecture:{currentStep:4,mission:'My own mission',actualResult:'My own result'},coachingFollowUps:{'coaching-1-2026-10-12':{'prep-video':true}}};
 const app=fixture(saved,null,true);for(let i=0;i<8;i++)await Promise.resolve();
 const state=app.portal.getState();assert.equal(state.week1Lecture.lectureCompletedAt,'2026-10-12');assert.notEqual(state.week1Lecture.missionStatus,'completed');assert.equal(state.week2Lecture.lectureCompletedAt,'2026-10-19');assert.notEqual(state.week2Lecture.missionStatus,'completed');assert.equal(state.week3Lecture.lectureCompletedAt,'2026-10-26');assert.notEqual(state.week3Lecture.missionStatus,'completed');assert.ok(!state.week4Lecture.lectureCompletedAt);assert.equal(state.startDate,'2026-10-12');assert.equal(state.currentLevel,3);assert.equal(state.nextLevel,4);assert.equal(state.week1Lecture.prep.point,'My point');assert.equal(state.reflections[0].id,'keep');assert.equal(state.evidence[0].id,'own');assert.equal(state.completedDays[3],true);assert.equal(state.week2Lecture.mission,'My own mission');assert.equal(state.week2Lecture.actualResult,'My own result');assert.equal(state.coachingFollowUps['coaching-1-2026-10-12']['prep-video'],true);
 assert.match(app.elements.get('#coachingSession').innerHTML,/1:30/);assert.match(app.elements.get('#coachingSession').innerHTML,/2 November/);assert.match(app.elements.get('#coachingSession').innerHTML,/gyf-frbz-wyr/);assert.doesNotMatch(app.elements.get('#coachingSession').innerHTML,/Next time to be confirmed/);assert.match(app.elements.get('#coachingUpdate').innerHTML,/pace variety/);
 app.events.change({target:{closest:()=>({dataset:{coachingMission:'pace-video'},checked:true})}});
 app.portal.resetLecture(1);const stored=JSON.parse(app.store.get('speakers-gym-kiyan-v1'));const reload=fixture(stored,null,true);assert.ok(!reload.portal.getState().week1Lecture.lectureCompletedAt);assert.equal(reload.portal.getState().coachingFollowUps['coaching-3-2026-10-26']['pace-video'],true);
});

