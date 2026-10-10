import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Shared logic for the private client portals: login sessions and saved progress.
// Files starting with "_" inside /api are not deployed as their own functions.

export const SESSION_COOKIE = "sg_portal";
const SESSION_DAYS = 30;
const MAX_STATE_BYTES = 512 * 1024;
const LOGIN_LIMIT = 10;
const LOGIN_WINDOW_SECONDS = 15 * 60;

export const isClientId = value => /^[a-z]{2,24}$/.test(String(value || ""));

function sha256(value) {
  return createHash("sha256").update(String(value)).digest();
}

// Compares hashes so the comparison takes the same time whatever the input.
export function samePassword(given, expected) {
  if (!given || !expected) return false;
  return timingSafeEqual(sha256(given), sha256(expected));
}

const base64url = value => Buffer.from(value).toString("base64url");
const sign = (payload, secret) => createHmac("sha256", secret).update(payload).digest("base64url");

export function createSession({ role, client }, secret, now = Date.now()) {
  const payload = base64url(JSON.stringify({ role, client: client || null, exp: now + SESSION_DAYS * 864e5 }));
  return `${payload}.${sign(payload, secret)}`;
}

export function readSession(token, secret, now = Date.now()) {
  if (!token || !secret) return null;
  const [payload, signature] = String(token).split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload, secret);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!session.exp || session.exp < now) return null;
    if (session.role !== "coach" && !(session.role === "client" && isClientId(session.client))) return null;
    return session;
  } catch {
    return null;
  }
}

export function canAccess(session, client) {
  if (!session || !isClientId(client)) return false;
  return session.role === "coach" || session.client === client;
}

export function readCookie(header, name) {
  const match = String(header || "").split(/;\s*/).find(part => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

export function sessionCookie(token, { secure = true, clear = false } = {}) {
  const parts = [`${SESSION_COOKIE}=${clear ? "" : encodeURIComponent(token)}`, "Path=/", "HttpOnly", "SameSite=Lax", `Max-Age=${clear ? 0 : SESSION_DAYS * 86400}`];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function clientPassword(env, client) {
  return isClientId(client) ? env[`PORTAL_PASSWORD_${client.toUpperCase()}`] || "" : "";
}

// Decide who is logging in. The same password box accepts the client's password or the coach password.
export function resolveLogin(env, client, password) {
  if (!isClientId(client) || !clientPassword(env, client)) return null;
  if (samePassword(password, clientPassword(env, client))) return { role: "client", client };
  if (samePassword(password, env.PORTAL_COACH_PASSWORD)) return { role: "coach", client: null };
  return null;
}

export function validState(state) {
  if (!state || typeof state !== "object" || Array.isArray(state)) return false;
  return Buffer.byteLength(JSON.stringify(state)) <= MAX_STATE_BYTES;
}

export function validCoachData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const missions = data.missions || {};
  if (typeof missions !== "object" || Array.isArray(missions)) return false;
  return Object.entries(missions).every(([week, text]) => /^[1-6]$/.test(week) && typeof text === "string" && text.length <= 600)
    && Buffer.byteLength(JSON.stringify(data)) <= 16 * 1024;
}

/* ---------- storage ---------- */

// Upstash Redis over its REST API. Vercel's Upstash integration sets KV_* or UPSTASH_* variables.
export function redisStore(env, fetchImpl = fetch) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const command = async args => {
    const response = await fetchImpl(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(args) });
    const body = await response.json();
    if (!response.ok || body.error) throw new Error("store_failed");
    return body.result;
  };
  return {
    async get(key) { const value = await command(["GET", key]); return value ? JSON.parse(value) : null; },
    async set(key, value) { await command(["SET", key, JSON.stringify(value)]); },
    // Saves only if nobody else saved in between. Returns false on a version conflict.
    async setIfVersion(key, expectedVersion, value) {
      const script = "local c = redis.call('GET', KEYS[1]); local v = 0; if c then v = cjson.decode(c).version or 0 end; if v ~= tonumber(ARGV[1]) then return 0 end; redis.call('SET', KEYS[1], ARGV[2]); return 1";
      return (await command(["EVAL", script, "1", key, String(expectedVersion), JSON.stringify(value)])) === 1;
    },
    async hit(key, windowSeconds) {
      const count = await command(["INCR", key]);
      if (count === 1) await command(["EXPIRE", key, String(windowSeconds)]);
      return count;
    }
  };
}

// In-memory store for local testing only.
export function memoryStore() {
  const data = new Map();
  return {
    async get(key) { return data.has(key) ? structuredClone(data.get(key)) : null; },
    async set(key, value) { data.set(key, structuredClone(value)); },
    async setIfVersion(key, expectedVersion, value) {
      if ((data.get(key)?.version || 0) !== expectedVersion) return false;
      data.set(key, structuredClone(value));
      return true;
    },
    async hit(key) { const count = (data.get(key) || 0) + 1; data.set(key, count); return count; }
  };
}

export const stateKey = client => `portal:${client}:state`;
export const coachKey = client => `portal:${client}:coach`;
const loginKey = ip => `portal:login:${sha256(ip).toString("hex").slice(0, 24)}`;

/* ---------- request handling (framework-free so it can be tested) ---------- */

const knownClients = env => String(env.PORTAL_CLIENTS || "ashwin,pankaj,khadija,nadira,muhammadashraf").split(",").map(item => item.trim()).filter(Boolean);

export async function handlePortal({ method, action, client, body, cookie, ip, env, store, secure }) {
  const secret = env.PORTAL_SESSION_SECRET;
  // Without a session secret the portals run in open mode: no login, and each known client's
  // progress is reachable through that client's own (unlisted) portal link.
  const open = !secret;
  if (!store || (!open && secret.length < 32)) return { status: 503, json: { ok: false, error: "portal_not_configured" } };
  const session = open
    ? (isClientId(client) && knownClients(env).includes(client) ? { role: "client", client } : null)
    : readSession(readCookie(cookie, SESSION_COOKIE), secret);

  if (action === "login" && method === "POST" && open) return { status: 200, json: { ok: true, role: "client", open: true } };

  if (action === "login" && method === "POST") {
    if ((await store.hit(loginKey(ip || "unknown"), LOGIN_WINDOW_SECONDS)) > LOGIN_LIMIT) return { status: 429, json: { ok: false, error: "too_many_attempts" } };
    const who = resolveLogin(env, body?.client, body?.password);
    if (!who) return { status: 401, json: { ok: false, error: "wrong_password" } };
    return { status: 200, json: { ok: true, role: who.role }, cookie: sessionCookie(createSession(who, secret), { secure }) };
  }

  if (action === "logout" && method === "POST") return { status: 200, json: { ok: true }, cookie: sessionCookie("", { secure, clear: true }) };

  if (!canAccess(session, client)) return { status: 401, json: { ok: false, error: "login_required" } };

  if (action === "state" && method === "GET") {
    const [saved, coach] = await Promise.all([store.get(stateKey(client)), store.get(coachKey(client))]);
    return { status: 200, json: { ok: true, open, role: session.role, version: saved?.version || 0, updatedAt: saved?.updatedAt || null, state: saved?.state || null, coach: coach || { missions: {} } } };
  }

  if (action === "state" && method === "PUT") {
    // The coach view is read-only for the student's own progress.
    if (session.role !== "client") return { status: 403, json: { ok: false, error: "read_only" } };
    if (!validState(body?.state) || !Number.isInteger(body?.version)) return { status: 400, json: { ok: false, error: "invalid_state" } };
    const next = { version: body.version + 1, updatedAt: new Date().toISOString(), state: body.state };
    if (!(await store.setIfVersion(stateKey(client), body.version, next))) {
      const current = await store.get(stateKey(client));
      return { status: 409, json: { ok: false, error: "conflict", version: current?.version || 0, state: current?.state || null } };
    }
    return { status: 200, json: { ok: true, version: next.version, updatedAt: next.updatedAt } };
  }

  if (action === "coach" && method === "PUT") {
    if (session.role !== "coach" && !open) return { status: 403, json: { ok: false, error: "coach_only" } };
    if (!validCoachData(body?.coach)) return { status: 400, json: { ok: false, error: "invalid_coach_data" } };
    await store.set(coachKey(client), body.coach);
    return { status: 200, json: { ok: true } };
  }

  return { status: 405, json: { ok: false, error: "method_not_allowed" } };
}
