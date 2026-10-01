import assert from 'node:assert/strict';
import test from 'node:test';
import { createSession, readSession, handlePortal, memoryStore, redisStore, SESSION_COOKIE } from '../api/_portal-core.js';

const env = { PORTAL_SESSION_SECRET: 'x'.repeat(40), PORTAL_PASSWORD_ASHWIN: 'student-pass', PORTAL_COACH_PASSWORD: 'coach-pass' };
const cookieFrom = result => result.cookie.split(';')[0];
const call = (store, args) => handlePortal({ env, store, secure: false, ip: '1.1.1.1', method: 'GET', action: 'state', client: 'ashwin', ...args });

test('sessions are signed and expire', () => {
  const token = createSession({ role: 'client', client: 'ashwin' }, env.PORTAL_SESSION_SECRET, 0);
  assert.equal(readSession(token, env.PORTAL_SESSION_SECRET, 1000).client, 'ashwin');
  assert.equal(readSession(token, 'y'.repeat(40), 1000), null);
  assert.equal(readSession(token.replace(/.$/, c => (c === 'a' ? 'b' : 'a')), env.PORTAL_SESSION_SECRET, 1000), null);
  assert.equal(readSession(token, env.PORTAL_SESSION_SECRET, 31 * 864e5), null);
});

test('the portal refuses to run without a strong session secret or a store', async () => {
  const result = await handlePortal({ env: { ...env, PORTAL_SESSION_SECRET: 'short' }, store: memoryStore(), method: 'GET', action: 'state', client: 'ashwin' });
  assert.equal(result.status, 503);
  assert.equal((await handlePortal({ env, store: null, method: 'GET', action: 'state', client: 'ashwin' })).status, 503);
});

test('student and coach log in with the same box; wrong passwords are refused', async () => {
  const store = memoryStore();
  assert.equal((await call(store, { method: 'POST', action: 'login', body: { client: 'ashwin', password: 'nope' } })).status, 401);
  const student = await call(store, { method: 'POST', action: 'login', body: { client: 'ashwin', password: 'student-pass' } });
  assert.equal(student.json.role, 'client');
  assert.match(student.cookie, new RegExp(`^${SESSION_COOKIE}=.+HttpOnly`));
  const coach = await call(store, { method: 'POST', action: 'login', body: { client: 'ashwin', password: 'coach-pass' } });
  assert.equal(coach.json.role, 'coach');
  // A client without a configured password cannot be logged into, even with the coach password.
  assert.equal((await call(store, { method: 'POST', action: 'login', body: { client: 'pankaj', password: 'coach-pass' } })).status, 401);
});

test('progress is private, shared with the coach, and read-only for the coach', async () => {
  const store = memoryStore();
  assert.equal((await call(store, {})).status, 401);
  const student = cookieFrom(await call(store, { method: 'POST', action: 'login', body: { client: 'ashwin', password: 'student-pass' } }));
  const coach = cookieFrom(await call(store, { method: 'POST', action: 'login', body: { client: 'ashwin', password: 'coach-pass' } }));

  const empty = await call(store, { cookie: student });
  assert.deepEqual([empty.status, empty.json.version, empty.json.state], [200, 0, null]);

  const saved = await call(store, { cookie: student, method: 'PUT', body: { version: 0, state: { reflections: ['hello'] } } });
  assert.equal(saved.json.version, 1);

  const seenByCoach = await call(store, { cookie: coach });
  assert.deepEqual([seenByCoach.json.role, seenByCoach.json.state.reflections[0]], ['coach', 'hello']);
  assert.equal((await call(store, { cookie: coach, method: 'PUT', body: { version: 1, state: {} } })).status, 403);

  // Another student's session cannot read Ashwin's portal.
  const other = `${SESSION_COOKIE}=${createSession({ role: 'client', client: 'pankaj' }, env.PORTAL_SESSION_SECRET)}`;
  assert.equal((await call(store, { cookie: other })).status, 401);
});

test('a save based on an old version is rejected with the latest state', async () => {
  const store = memoryStore();
  const student = cookieFrom(await call(store, { method: 'POST', action: 'login', body: { client: 'ashwin', password: 'student-pass' } }));
  await call(store, { cookie: student, method: 'PUT', body: { version: 0, state: { a: 1 } } });
  const stale = await call(store, { cookie: student, method: 'PUT', body: { version: 0, state: { a: 2 } } });
  assert.deepEqual([stale.status, stale.json.version, stale.json.state.a], [409, 1, 1]);
});

test('only the coach can set week missions, and they are validated', async () => {
  const store = memoryStore();
  const student = cookieFrom(await call(store, { method: 'POST', action: 'login', body: { client: 'ashwin', password: 'student-pass' } }));
  const coach = cookieFrom(await call(store, { method: 'POST', action: 'login', body: { client: 'ashwin', password: 'coach-pass' } }));
  assert.equal((await call(store, { cookie: student, method: 'PUT', action: 'coach', body: { coach: { missions: { 6: 'x' } } } })).status, 403);
  assert.equal((await call(store, { cookie: coach, method: 'PUT', action: 'coach', body: { coach: { missions: { 9: 'x' } } } })).status, 400);
  assert.equal((await call(store, { cookie: coach, method: 'PUT', action: 'coach', body: { coach: { missions: { 6: 'Tell your story to a friend.' } } } })).status, 200);
  assert.equal((await call(store, { cookie: student })).json.coach.missions[6], 'Tell your story to a friend.');
});

test('login attempts are limited', async () => {
  const store = memoryStore();
  for (let i = 0; i < 10; i++) await call(store, { method: 'POST', action: 'login', body: { client: 'ashwin', password: 'nope' } });
  assert.equal((await call(store, { method: 'POST', action: 'login', body: { client: 'ashwin', password: 'student-pass' } })).status, 429);
});

test('the Redis store speaks the Upstash REST format', async () => {
  const sent = [];
  const fakeFetch = async (url, options) => {
    sent.push(JSON.parse(options.body));
    return { ok: true, json: async () => ({ result: sent.length === 1 ? JSON.stringify({ version: 2 }) : 1 }) };
  };
  const store = redisStore({ KV_REST_API_URL: 'https://example.upstash.io', KV_REST_API_TOKEN: 't' }, fakeFetch);
  assert.deepEqual(await store.get('k'), { version: 2 });
  assert.equal(await store.setIfVersion('k', 2, { version: 3 }), true);
  assert.deepEqual(sent[0], ['GET', 'k']);
  assert.equal(sent[1][0], 'EVAL');
  assert.equal(redisStore({}), null);
});

test('open mode (no session secret): no login, known clients only, progress saved per client', async () => {
  const open = { };
  const store = memoryStore();
  const call = args => handlePortal({ env: open, store, secure: false, ip: '1.1.1.1', method: 'GET', action: 'state', client: 'ashwin', ...args });
  const first = await call({});
  assert.deepEqual([first.status, first.json.open, first.json.role, first.json.version, first.json.state], [200, true, 'client', 0, null]);
  assert.equal((await call({ method: 'PUT', body: { version: 0, state: { reflections: ['hi'] } } })).json.version, 1);
  assert.equal((await call({})).json.state.reflections[0], 'hi');
  // A different client has its own record, and unknown clients are refused.
  assert.equal((await call({ client: 'pankaj' })).json.state, null);
  assert.equal((await call({ client: 'stranger' })).status, 401);
  // Week 6 mission can be set without a coach login in open mode.
  assert.equal((await call({ method: 'PUT', action: 'coach', body: { coach: { missions: { 6: 'Tell a story.' } } } })).status, 200);
  assert.equal((await call({})).json.coach.missions[6], 'Tell a story.');
  // Still refuses to run with no store at all.
  assert.equal((await handlePortal({ env: open, store: null, method: 'GET', action: 'state', client: 'ashwin' })).status, 503);
});
