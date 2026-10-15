import { handleWaitlist, redisCommand } from "./_waitlist-core.js";

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") return JSON.parse(body);
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString("utf8"));
  return body;
}

const first = (v) => (Array.isArray(v) ? v[0] : v);

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("X-Robots-Tag", "noindex, nofollow");

  let body = {};
  try {
    if (request.method === "POST") body = parseBody(request.body);
  } catch {
    return response.status(400).json({ ok: false, error: "invalid_json" });
  }

  const ip = String(first(request.headers["x-forwarded-for"]) || "").split(",")[0].trim() || request.socket?.remoteAddress;

  try {
    const result = await handleWaitlist({
      method: request.method,
      body,
      authorization: first(request.headers.authorization),
      ip,
      env: process.env,
      command: redisCommand(process.env),
    });
    for (const [k, v] of Object.entries(result.headers || {})) response.setHeader(k, v);
    if (result.csv != null) {
      response.setHeader("Content-Type", "text/csv; charset=utf-8");
      response.setHeader("Content-Disposition", 'attachment; filename="speakers-gym-waitlist.csv"');
      return response.status(200).send("﻿" + result.csv);
    }
    return response.status(result.status).json(result.json);
  } catch {
    return response.status(502).json({ ok: false, error: "store_unavailable" });
  }
}
