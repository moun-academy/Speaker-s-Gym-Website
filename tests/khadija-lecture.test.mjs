import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../public/khadija-portal/lecture.js', import.meta.url), 'utf8');

function lecture(savedStep) {
  const events = {};
  const element = { focus() {}, setAttribute() {} };
  const root = {
    innerHTML: '', querySelector: () => element,
    addEventListener: (type, handler) => events[`root:${type}`] = handler,
  };
  const state = {
    week1Lecture: { prep: { point: 'A different saved Week 1 point.' } },
    week2Lecture: { currentStep: savedStep, currentLevel: 1, coachImprovement: 'Clear endings',
      prediction: 'My voice will shake.', mission: 'One audible sentence.', beliefBefore: 60,
      beliefAfter: 40, actualResult: 'Every word was heard.', missionStatus: 'accepted' },
    evidenceBank: [],
  };
  const portal = {
    getState: () => state,
    updateLecture: patch => Object.assign(state.week2Lecture, patch),
    showToast() {}, renderAll() {},
    saveEvidence: evidence => state.evidenceBank.push(evidence),
  };
  vm.runInNewContext(source, {
    window: { SpeakersGymPortal: portal, SpeakersGymExposure: {
      clampLevel: n => n, levels: [{ name: 'Safe Practice', behavior: 'Speak with your coach.' }],
    } },
    document: { querySelector: () => root, activeElement: element,
      body: { classList: { add() {}, remove() {} } },
      addEventListener: (type, handler) => events[`document:${type}`] = handler },
    clearInterval() {}, requestAnimationFrame: fn => fn(),
  });
  const click = (event, selector, node) => events[event]({ target: { closest: value => value === selector ? node : null } });
  return {
    state,
    html: () => root.innerHTML,
    open: () => click('document:click', '[data-open-week2-lecture]', element),
    report: () => click('document:click', '[data-open-week2-reflection]', element),
    action: value => click('root:click', '[data-w2-action]', { dataset: { w2Action: value } }),
  };
}

test('combined exercise keeps its fixed sentence and moves directly to final-word practice', () => {
  const app = lecture(5);
  app.open();
  assert.match(app.html(), /A short walk is a good way to/);
  assert.doesNotMatch(app.html(), /A different saved Week 1 point/);
  assert.match(app.html(), /w2-arrival/);
  assert.match(app.html(), /WEEK 2 · 6 \/ 17/);
  app.action('next');
  assert.match(app.html(), /THE FINAL-WORD TEST/);
  assert.match(app.html(), /WEEK 2 · 7 \/ 17/);
  app.action('back');
  assert.match(app.html(), /Make every word arrive/);
  assert.match(app.html(), /WEEK 2 · 6 \/ 17/);
});

test('a saved position on the removed slide resumes the combined exercise once', () => {
  const app = lecture(6);
  app.open();
  assert.match(app.html(), /Make every word arrive/);
  app.action('close');
  app.open();
  assert.match(app.html(), /WEEK 2 · 6 \/ 17/);
});

test('speaking rounds and their saved positions retain their original actions', () => {
  const app = lecture(9);
  app.open();
  assert.match(app.html(), /WEEK 2 · 9 \/ 17/);
  app.action('complete-v1');
  assert.match(app.html(), /ONE VOICE ADJUSTMENT/);
  app.action('next');
  assert.match(app.html(), /data-w2-action="complete-v2"/);
  app.action('complete-v2');
  assert.match(app.html(), /What changed/);
  assert.equal(app.state.week2Lecture.versionsCompleted, 2);
});

test('lecture completion remains slide 17 and mission reporting still saves evidence', () => {
  const app = lecture(16);
  app.open();
  app.action('accept-mission');
  assert.match(app.html(), /WEEK 2 · 17 \/ 17/);
  assert.doesNotMatch(app.html(), /AFTER THE MISSION/);
  app.report();
  assert.match(app.html(), /AFTER THE MISSION/);
  app.action('mission-yes');
  app.action('collect-evidence');
  assert.match(app.html(), /EVIDENCE COLLECTED/);
  assert.equal(app.state.evidenceBank.length, 1);
  assert.equal(app.state.evidenceBank[0].reality, 'Every word was heard.');
});
