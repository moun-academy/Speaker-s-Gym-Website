import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
const root = process.env.NEZHOU_TEST_ROOT || fileURLToPath(new URL('../public/nezhou-portal',import.meta.url));
function fixture(saved,remote,coaching=false) {
  const elements=new Map(), store=new Map([['speakers-gym-nezhou-v1',JSON.stringify(saved)]]), calls=[],timers=[],events={};
  const make=()=>({innerHTML:'',textContent:'',value:'',dataset:{},style:{},classList:{add(){},remove(){},toggle(){}},setAttribute(){},removeAttribute(){},addEventListener(type,fn){this[type]=fn;},remove(){},focus(){},scrollIntoView(){},reset(){}});
  const node=selector=>{if(!elements.has(selector))elements.set(selector,make());return elements.get(selector);};
  const env={window:{addEventListener(){},scrollTo(){},confirm:()=>true},document:{querySelector:node,querySelectorAll:()=>[],addEventListener(type,fn){events[type]=fn;},body:make()},localStorage:{getItem:key=>store.get(key)||null,setItem:(key,value)=>store.set(key,value)},location:{hash:'',search:''},URLSearchParams,structuredClone,Date,console,crypto:{randomUUID:()=> 'fixture-id'},setTimeout:(fn,delay)=>{timers.push({fn,delay});return timers.length;},clearTimeout(){},fetch:async(url,options)=>{calls.push({url,options});return {status:remote?200:503,json:async()=>options.method==='GET'?remote:{version:8}};}};
  const context=vm.createContext(env);
  for(const file of ['data.js','lecture-defaults.js',...(coaching?['coaching-update.js']:[]),'app.js'])vm.runInContext(fs.readFileSync(`${root}/${file}`,'utf8'),context,{filename:file});
  return {portal:env.window.SpeakersGymPortal,env,store,elements,calls,timers,events};
}

test('New Nezhou portal starts clean and preserves only her own progress',async()=>{
 const saved={completedDays:{2:true},currentLevel:3,startDate:'2026-11-13',reflections:[{id:'own',action:'A real example',result:'Clear'}],evidence:[{id:'example',sourceLecture:1}],week1Lecture:{currentStep:2,prep:{point:'My own point'}}};
 const app=fixture(saved,null,true); for(let i=0;i<8;i++)await Promise.resolve();
 assert.equal(app.portal.client.id,'nezhou');assert.equal(app.portal.client.name,'Nezhou');
 const s=app.portal.getState();assert.equal(s.startDate,'2026-11-13');assert.equal(s.currentLevel,3);assert.equal(s.week1Lecture.prep.point,'My own point');assert.equal(s.reflections[0].id,'own');assert.equal(s.evidence[0].id,'example');assert.equal(s.completedDays[2],true);
 for(let i=1;i<=6;i++){assert.ok(!s['week'+i+'Lecture'].lectureCompletedAt);assert.equal(s['week'+i+'Lecture'].missionStatus,'not-started');}
 assert.match(app.elements.get('#coachingSession').innerHTML,/17 November 2026/);assert.match(app.elements.get('#coachingSession').innerHTML,/12:30/);assert.match(app.elements.get('#coachingSession').innerHTML,/Proposed · awaiting your confirmation/);assert.doesNotMatch(app.elements.get('#coachingSession').innerHTML,/meet.google|Join coaching/);
 assert.match(app.elements.get('#coachingUpdate').innerHTML,/random questions/);assert.ok(app.calls.every(c=>c.url.includes('client=nezhou')));
 const fresh=fixture(null,null,true);assert.equal(fresh.portal.getState().reflections.length,0);assert.equal(fresh.portal.getState().evidence.length,0);
 app.events.change({target:{closest:()=>({dataset:{coachingMission:'community-introduction'},checked:true})}}); const reloaded=fixture(JSON.parse(app.store.get('speakers-gym-nezhou-v1')),null,true);assert.equal(reloaded.portal.getState().coachingFollowUps['onboarding-2026-11-11']['community-introduction'],true);assert.equal(reloaded.portal.getState().week1Lecture.prep.point,'My own point');
});
test('Six weeks have personal prompts and no source-client identity or appointments',()=>{
 const ctx=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(root+'/data.js','utf8'),ctx);const d=ctx.window.NEZHOU_DATA;assert.equal(d.weeks.length,6);assert.equal(d.weeks.flatMap(w=>w.days).length,42);assert.equal(d.levels.length,10);
 const copy=fs.readdirSync(root).filter(f=>/\.(js|html)$/.test(f)).map(f=>fs.readFileSync(root+'/'+f,'utf8')).join(' ');assert.doesNotMatch(copy,/ashwin|banking|Bulgaria|Greece|petkar|oda-koch-ovr/i);assert.match(copy,/noindex, nofollow, noarchive, nosnippet/);
});

test('Nezhou uses an isolated progress record in the existing API',async()=>{
 const {handlePortal,memoryStore}=await import('../api/_portal-core.js');
 const store=memoryStore();
 const request=(client,method='GET',body)=>handlePortal({env:{},store,method,action:'state',client,body});
 assert.equal((await request('nezhou')).status,200);
 await request('nezhou','PUT',{version:0,state:{reflections:[{id:'her-note'}]}});
 assert.equal((await request('nezhou')).json.state.reflections[0].id,'her-note');
 assert.equal((await request('ashwin')).json.state,null);
 const html=fs.readFileSync(root+'/index.html','utf8');assert.match(html,/id="prepareCall"/);
});

test('Onboarding uses the corrected identity, orientation and professional vocabulary',()=>{const html=fs.readFileSync(root+'/index.html','utf8');assert.match(html,/Nezhou/);assert.doesNotMatch(html,/Nezha|moun-academy-2097/);assert.match(html,/speakersgym\/about/);assert.match(html,/Mitigate/);assert.match(html,/Stakeholder/);assert.equal((html.match(/<dt>/g)||[]).length,16);const ctx=vm.createContext({window:{}});vm.runInContext(fs.readFileSync(root+'/data.js','utf8'),ctx);assert.match(ctx.window.NEZHOU_DATA.weeks[0].days[0][2],/random question/);assert.doesNotMatch(ctx.window.NEZHOU_DATA.weeks[0].days[0].join(' '),/Tell me about yourself/);});
