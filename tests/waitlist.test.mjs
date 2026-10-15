import test from "node:test";
import assert from "node:assert/strict";
import { handleWaitlist, toCsv } from "../api/_waitlist-core.js";

function memoryCommand() {
  const data = new Map();
  return {
    data,
    command: async ([op, key, ...rest]) => {
      if (op === "INCR") { const n = (data.get(key) || 0) + 1; data.set(key, n); return n; }
      if (op === "EXPIRE") return 1;
      if (op === "RPUSH") { const l = data.get(key) || []; l.push(rest[0]); data.set(key, l); return l.length; }
      if (op === "LRANGE") return data.get(key) || [];
      throw new Error(`unexpected ${op}`);
    },
  };
}

const valid = { name: "Sara Ali", email: "Sara@Example.com", phone: "+971 50 123 4567", group: "2026-11-01" };
const env = { SPEAKERS_GYM_SALES_PASSWORD: "secret" };
const basic = (u, p) => `Basic ${Buffer.from(`${u}:${p}`).toString("base64")}`;

test("saves a valid sign-up", async () => {
  const { command, data } = memoryCommand();
  const r = await handleWaitlist({ method: "POST", body: valid, ip: "1.1.1.1", env, command, now: new Date("2026-10-15T10:00:00Z") });
  assert.equal(r.status, 200);
  const saved = JSON.parse(data.get("waitlist:groups")[0]);
  assert.equal(saved.email, "sara@example.com");
  assert.equal(saved.group, "2026-11-01");
  assert.equal(saved.createdAt, "2026-10-15T10:00:00.000Z");
});

test("rejects bad email, phone and group", async () => {
  const { command } = memoryCommand();
  for (const [field, value] of [["email", "nope"], ["phone", "12"], ["group", "next week"], ["name", "A"]]) {
    const r = await handleWaitlist({ method: "POST", body: { ...valid, [field]: value }, ip: "1.1.1.1", env, command });
    assert.equal(r.status, 400);
    assert.equal(r.json.error, field);
  }
});

test("honeypot submissions are accepted silently but not stored", async () => {
  const { command, data } = memoryCommand();
  const r = await handleWaitlist({ method: "POST", body: { ...valid, website: "spam.example" }, ip: "1.1.1.1", env, command });
  assert.equal(r.status, 200);
  assert.equal(data.get("waitlist:groups"), undefined);
});

test("limits repeated submissions from one address", async () => {
  const { command } = memoryCommand();
  let last;
  for (let i = 0; i < 11; i++) last = await handleWaitlist({ method: "POST", body: valid, ip: "2.2.2.2", env, command });
  assert.equal(last.status, 429);
});

test("CSV download needs the password", async () => {
  const { command } = memoryCommand();
  await handleWaitlist({ method: "POST", body: valid, ip: "1.1.1.1", env, command });
  assert.equal((await handleWaitlist({ method: "GET", env, command })).status, 401);
  assert.equal((await handleWaitlist({ method: "GET", authorization: basic("speaker", "wrong"), env, command })).status, 401);
  const ok = await handleWaitlist({ method: "GET", authorization: basic("speaker", "secret"), env, command });
  assert.equal(ok.status, 200);
  assert.match(ok.csv, /sara@example\.com/);
});

test("CSV neutralises spreadsheet formulas", () => {
  const csv = toCsv([{ createdAt: "x", group: "2026-11-01", name: "=HYPERLINK(1)", email: "a@b.co", phone: "+1 555 0100" }]);
  assert.match(csv, /"'=HYPERLINK\(1\)"/);
  assert.match(csv, /"'\+1 555 0100"/);
});

test("no database and no sheet returns 503", async () => {
  const r = await handleWaitlist({ method: "POST", body: valid, env, command: null });
  assert.equal(r.status, 503);
});

const sheetEnv = { ...env, WAITLIST_SHEET_URL: "https://script.google.com/macros/s/TEST/exec" };
const okFetch = (calls) => async (url, init) => { calls.push({ url, init }); return { ok: true, json: async () => ({ ok: true }) }; };

test("saves to the Google Sheet when it is configured, without any database", async () => {
  const calls = [];
  const r = await handleWaitlist({ method: "POST", body: valid, ip: "3.3.3.3", env: sheetEnv, command: null, fetchImpl: okFetch(calls), now: new Date("2026-10-15T10:00:00Z") });
  assert.equal(r.status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, sheetEnv.WAITLIST_SHEET_URL);
  assert.deepEqual(JSON.parse(calls[0].init.body), { name: "Sara Ali", email: "sara@example.com", phone: "+971 50 123 4567", group: "2026-11-01", createdAt: "2026-10-15T10:00:00.000Z" });
});

test("sheet failure with no database reports an error, so no sign-up is silently lost", async () => {
  const badFetch = async () => ({ ok: false, json: async () => ({ ok: false }) });
  const r = await handleWaitlist({ method: "POST", body: valid, ip: "3.3.3.3", env: sheetEnv, command: null, fetchImpl: badFetch });
  assert.equal(r.status, 502);
});

test("sheet failure is covered by the database copy", async () => {
  const { command, data } = memoryCommand();
  const badFetch = async () => { throw new Error("network"); };
  const r = await handleWaitlist({ method: "POST", body: valid, ip: "4.4.4.4", env: sheetEnv, command, fetchImpl: badFetch });
  assert.equal(r.status, 200);
  assert.equal(data.get("waitlist:groups").length, 1);
});

test("honeypot never reaches the sheet", async () => {
  const calls = [];
  await handleWaitlist({ method: "POST", body: { ...valid, website: "x.example" }, ip: "5.5.5.5", env: sheetEnv, command: null, fetchImpl: okFetch(calls) });
  assert.equal(calls.length, 0);
});
