import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
const root=fileURLToPath(new URL('../public/',import.meta.url));
function fixture(client,initial){
 const elements=new Map(),events={},store=new Map([[`${client}-speaking-journey-v1`,JSON.stringify(initial)]]);
 const make=()=>({innerHTML:'',value:'',dataset:{},style:{setProperty(){}},classList:{add(){},remove(){},toggle(){},contains(){return false;}},focus(){},setAttribute(){},getAttribute(){},addEventListener(){},querySelector(){return make();},querySelectorAll(){return[];},scrollIntoView(){}});
 const doc={querySelector(s){if(!elements.has(s))elements.set(s,make());return elements.get(s);},querySelectorAll(){return[];},body:make(),addEventListener(t,f){(events[t]??=[]).push(f);}};
 const env={window:{confirm:()=>true,addEventListener(){}},document:doc,localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},setTimeout(){},clearTimeout(){},IntersectionObserver:class{observe(){}},console,Date,structuredClone};
 const ctx=vm.createContext(env);for(const f of ['client-config.js','exposure-levels.js','coaching-update.js','app.js'])vm.runInContext(readFileSync(`${root}/${client}-portal/${f}`,'utf8'),ctx);
 return{portal:env.window.SpeakersGymPortal,store,elements,events,ctx};
}
for(const client of ['khadija','nadira'])test(client+' confirmed lectures and follow-up checkmarks preserve student work and explicit resets',()=>{
 const initial={week1Lecture:{flowVersion:3,missionModelVersion:2,prep:{point:'My own point'},lectureCompletedAt:'2026-09-01'},week2Lecture:{flowVersion:1,currentLevel:4},reflections:{'day-0':'My own reflection'},completedDays:{0:true},evidenceBank:[{id:'keep',week:5,result:'My own evidence'}]};
 const app=fixture(client,initial),state=app.portal.getState();
 const completed=client==='khadija'?[1,2,3,4,5]:[1,2,4];
 for(const week of completed){assert.ok(state[`week${week}Lecture`].lectureCompletedAt);assert.notEqual(state[`week${week}Lecture`].missionStatus,'completed');}
 assert.equal(state.week1Lecture.lectureCompletedAt,'2026-09-01');assert.equal(state.week1Lecture.prep.point,'My own point');assert.equal(state.reflections['day-0'],'My own reflection');assert.equal(state.week2Lecture.currentLevel,4);assert.deepEqual(JSON.parse(JSON.stringify(state.evidenceBank)),initial.evidenceBank);
 if(client==='nadira')assert.ok(!state.week5Lecture.lectureCompletedAt);
 assert.match(app.elements.get('#coachingUpdate').innerHTML,/Your focus this week/);
 const id=client==='khadija'?'pause-at-work':'meeting-pause';
 for(const fn of app.events.change)fn({target:{closest:s=>s==='[data-coaching-mission]'?{dataset:{coachingMission:id},checked:true}:null}});
 app.portal.resetWeek2();
 const saved=JSON.parse(app.store.get(`${client}-speaking-journey-v1`));const reload=fixture(client,saved);
 assert.ok(!reload.portal.getState().week2Lecture.lectureCompletedAt);
 assert.equal(Object.values(reload.portal.getState().coachingFollowUps)[0][id],true);
 vm.runInContext('state=loadState('+JSON.stringify(initial)+');renderAll();',app.ctx);
 assert.ok(app.portal.getState().week2Lecture.lectureCompletedAt,'account-loaded state receives published completion');
});
