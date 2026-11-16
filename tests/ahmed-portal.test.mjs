import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
const root = process.env.AHMED_TEST_ROOT || fileURLToPath(new URL('../public/ahmed-portal',import.meta.url));
function fixture(saved,remote,coaching=false) {
  const elements=new Map(), store=new Map([['speakers-gym-ahmed-v1',JSON.stringify(saved)]]), calls=[],timers=[],events={};
  const make=()=>({innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(type,fn){this[type]=fn;},remove(){},focus(){},scrollIntoView(){},reset(){}});
  const node=selector=>{if(!elements.has(selector))elements.set(selector,make());return elements.get(selector);};
  const env={window:{addEventListener(){},scrollTo(){},confirm:()=>true},document:{querySelector:node,querySelectorAll:selector=>selector==='[data-pitch]'?['who','focus','value'].map(key=>{const input=node('pitch-'+key);input.dataset.pitch=key;return input;}):[],addEventListener(type,fn){events[type]=fn;},body:make()},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},location:{hash:'',search:''},URLSearchParams,structuredClone,Date,console,crypto:{randomUUID:()=> 'fixture-id'},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout(){},fetch:async(url,options)=>{calls.push({url,options});return {status:remote?200:503,json:async()=>{if(remote==='invalid-json')throw Error('HTML preview response');return options.method==='GET'?remote:{version:8};}};}};
  const context=vm.createContext(env);
  for(const file of ['data.js','lecture-defaults.js',...(coaching?['coaching-update.js']:[]),'app.js'])vm.runInContext(fs.readFileSync(`${root}/${file}`,'utf8'),context,{filename:file});
  return {portal:env.window.SpeakersGymPortal,env,store,elements,calls,timers,events};
}


test('Ahmed starts clean, with the verified booking and no automatic lecture completion',async()=>{
 const app=fixture(null,null,true);for(let i=0;i<8;i++)await Promise.resolve();
 assert.equal(app.portal.client.id,'ahmed');assert.equal(app.portal.client.name,'Ahmed');
 const s=app.portal.getState();assert.equal(s.reflections.length,0);assert.equal(s.evidence.length,0);
 for(let week=1;week<=6;week++){assert.equal(s['week'+week+'Lecture'].lectureCompletedAt,null);assert.equal(s['week'+week+'Lecture'].missionStatus,'not-started');}
 const card=app.elements.get('#coachingSession').innerHTML;assert.match(card,/20 November 2026/);assert.match(card,/5:00/);assert.match(card,/jdv-cfqi-qef/);assert.doesNotMatch(card,/Proposed|awaiting confirmation/);
 assert.ok(app.calls.every(call=>call.url.includes('client=ahmed')));
});
test('Introduction workshop persists across reload alongside answers, reflections, start date and independent missions',()=>{
 const saved={startDate:'2026-11-20',completedDays:{3:true},currentLevel:4,reflections:[{id:'my-reflection'}],evidence:[{id:'my-evidence'}],week1Lecture:{prep:{point:'My own answer'},lectureCompletedAt:'2026-11-20',missionStatus:'not-started'},introductionWorkshop:{who:'Ahmed - my role'},callNote:'My meeting question'};
 const app=fixture(saved,null,true);const who=app.elements.get('pitch-who');assert.equal(who.value,'Ahmed - my role');
 const focus=app.elements.get('pitch-focus');focus.value='A genuine responsibility';focus.input();
 const reload=fixture(JSON.parse(app.store.get('speakers-gym-ahmed-v1')),null,true), s=reload.portal.getState();
 assert.equal(s.introductionWorkshop.focus,'A genuine responsibility');assert.equal(s.introductionWorkshop.who,'Ahmed - my role');assert.equal(s.week1Lecture.prep.point,'My own answer');assert.equal(s.week1Lecture.missionStatus,'not-started');assert.equal(s.week1Lecture.lectureCompletedAt,'2026-11-20');assert.equal(s.startDate,'2026-11-20');assert.equal(s.currentLevel,4);assert.equal(s.reflections[0].id,'my-reflection');assert.equal(s.evidence[0].id,'my-evidence');assert.equal(s.completedDays[3],true);assert.equal(s.callNote,'My meeting question');
 app.events.change({target:{closest:()=>({dataset:{coachingMission:'baseline-introduction'},checked:true})}});const again=fixture(JSON.parse(app.store.get('speakers-gym-ahmed-v1')),null,true);assert.equal(again.portal.getState().coachingFollowUps['onboarding-2026-11-16']['baseline-introduction'],true);
});
test('Ahmed has six weeks, 42 workplace prompts, ten exposure steps and no copied client identity or schedule',()=>{
 const ctx=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(root+'/data.js','utf8'),ctx);const d=ctx.window.AHMED_DATA;assert.equal(d.storageKey,'speakers-gym-ahmed-v1');assert.equal(d.weeks.length,6);assert.equal(d.weeks.flatMap(w=>w.days).length,42);assert.equal(d.levels.length,10);assert.match(d.weeks[0].days[0].join(' '),/30-second/);
 const copy=fs.readdirSync(root).filter(f=>/\.(js|html)$/.test(f)).map(f=>fs.readFileSync(root+'/'+f,'utf8')).join(' ');assert.doesNotMatch(copy,/nezhou|nezha|ashwin|pharmacy|regulatory.affairs|ijr-vkhi|ihnsiefutt9/i);assert.match(copy,/noindex, nofollow, noarchive, nosnippet/);assert.match(copy,/moun-academy-2097\/about/);assert.match(copy,/the-speaker-s-gym-premium.vercel.app/);
});
test('Ahmed progress record cannot leak into another client',async()=>{
 const {handlePortal,memoryStore}=await import('../api/_portal-core.js');const store=memoryStore();const req=(client,method='GET',body)=>handlePortal({env:{},store,method,action:'state',client,body});
 assert.equal((await req('ahmed')).status,200);await req('ahmed','PUT',{version:0,state:{introductionWorkshop:{who:'Only Ahmed'},reflections:[{id:'ahmed-only'}]}});assert.equal((await req('ahmed')).json.state.introductionWorkshop.who,'Only Ahmed');assert.equal((await req('nezhou')).json.state,null);assert.equal((await req('ashwin')).json.state,null);
});
test('Remote workshop values refresh after login through the existing state API',async()=>{
 const app=fixture(null,{state:{introductionWorkshop:{who:'Saved remotely'},reflections:[]},version:2,coach:{missions:{}}},true);for(let i=0;i<20;i++)await Promise.resolve();assert.equal(app.portal.getState().introductionWorkshop.who,'Saved remotely');assert.equal(app.elements.get('pitch-who').value,'Saved remotely');
});

test('Static-preview HTML cannot reset saved learner state or claim cloud storage',async()=>{const app=fixture({introductionWorkshop:{who:'Keep my note'},completedDays:{0:true}},'invalid-json',true);for(let i=0;i<20;i++)await Promise.resolve();assert.equal(app.portal.getState().introductionWorkshop.who,'Keep my note');assert.equal(app.portal.getState().completedDays[0],true);assert.match(app.elements.get('#storageStatus').textContent,/this browser/);});
