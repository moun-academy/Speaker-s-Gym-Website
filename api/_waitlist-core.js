// Waiting list for upcoming groups on /sales.
// POST saves { name, email, phone, group }; GET (password protected) downloads everything as CSV.

const LIST_KEY = "waitlist:groups";
const ADMIN_USER = "speaker";
const MAX_PER_IP_PER_HOUR = 10;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9 ()\-.]{6,24}$/;
const GROUP_RE = /^\d{4}-\d{2}-\d{2}$/;

// Upstash Redis REST, same variables as the client portals.
export function redisCommand(env, fetchImpl = fetch) {
  const url = env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return async (args) => {
    const response = await fetchImpl(url, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(args) });
    const body = await response.json();
    if (!response.ok || body.error) throw new Error("store_failed");
    return body.result;
  };
}

const clean = (v, max) => String(v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max);

export function validateEntry(body) {
  const entry = {
    name: clean(body?.name, 100),
    email: clean(body?.email, 160).toLowerCase(),
    phone: clean(body?.phone, 24),
    group: clean(body?.group, 10),
  };
  if (entry.name.length < 2) return { error: "name" };
  if (!EMAIL_RE.test(entry.email)) return { error: "email" };
  if (!PHONE_RE.test(entry.phone) || entry.phone.replace(/\D/g, "").length < 6) return { error: "phone" };
  if (!GROUP_RE.test(entry.group)) return { error: "group" };
  return { entry };
}

function isAdmin(authorization, password) {
  if (!password || !authorization?.startsWith("Basic ")) return false;
  try {
    const decoded = Buffer.from(authorization.slice(6), "base64").toString("utf8");
    const i = decoded.indexOf(":");
    return i > 0 && decoded.slice(0, i) === ADMIN_USER && decoded.slice(i + 1) === password;
  } catch {
    return false;
  }
}

// Spreadsheet apps run cells that start with = + - @ as formulas; prefix those with '.
const csvCell = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
};

export function toCsv(entries) {
  const rows = [["Signed up (UTC)", "Group start", "Name", "Email", "Phone"]];
  for (const e of entries) rows.push([e.createdAt, e.group, e.name, e.email, e.phone]);
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export async function handleWaitlist({ method, body, authorization, ip, env, command, now = new Date(), fetchImpl = fetch }) {
  const sheetUrl = String(env.WAITLIST_SHEET_URL || "").trim();
  if (!command && !sheetUrl) return { status: 503, json: { ok: false, error: "store_unavailable" } };

  if (method === "GET") {
    if (!command) return { status: 503, json: { ok: false, error: "store_unavailable" } };
    if (!isAdmin(authorization, env.SPEAKERS_GYM_SALES_PASSWORD)) {
      return { status: 401, json: { ok: false, error: "unauthorized" }, headers: { "WWW-Authenticate": 'Basic realm="Speaker\'s Gym waiting list", charset="UTF-8"' } };
    }
    const raw = (await command(["LRANGE", LIST_KEY, "0", "-1"])) || [];
    const entries = raw.map((r) => { try { return JSON.parse(r); } catch { return null; } }).filter(Boolean);
    return { status: 200, csv: toCsv(entries) };
  }

  if (method !== "POST") return { status: 405, json: { ok: false, error: "method_not_allowed" } };

  // Honeypot: real people never fill the hidden "website" field.
  if (clean(body?.website, 200)) return { status: 200, json: { ok: true } };

  const { entry, error } = validateEntry(body);
  if (error) return { status: 400, json: { ok: false, error } };

  if (command) {
    const rateKey = `waitlist:rate:${clean(ip, 64) || "unknown"}`;
    const hits = await command(["INCR", rateKey]);
    if (hits === 1) await command(["EXPIRE", rateKey, "3600"]);
    if (hits > MAX_PER_IP_PER_HOUR) return { status: 429, json: { ok: false, error: "too_many" } };
  }

  const saved = { ...entry, createdAt: now.toISOString() };
  let stored = false;

  // Main home: the "Group Waitlist" tab in the Google Sheet (via the Apps Script web app).
  if (sheetUrl) {
    try {
      const res = await fetchImpl(sheetUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(saved), redirect: "follow" });
      const out = await res.json().catch(() => ({}));
      stored = res.ok && out.ok === true;
    } catch {
      stored = false;
    }
  }

  // Safety copy in the database (when one is connected), so a sign-up is never lost.
  if (command) {
    try {
      await command(["RPUSH", LIST_KEY, JSON.stringify(saved)]);
      stored = true;
    } catch {
      /* the sheet may still have it */
    }
  }

  if (!stored) return { status: 502, json: { ok: false, error: "store_unavailable" } };
  return { status: 200, json: { ok: true } };
}
