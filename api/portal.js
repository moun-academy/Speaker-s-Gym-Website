import { handlePortal, redisStore } from "./_portal-core.js";

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") return JSON.parse(body);
  if (Buffer.isBuffer(body)) return JSON.parse(body.toString("utf8"));
  return body;
}

function firstHeaderValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");
  response.setHeader("X-Robots-Tag", "noindex, nofollow");

  let body;
  try {
    body = request.method === "GET" ? {} : parseBody(request.body);
  } catch {
    return response.status(400).json({ ok: false, error: "invalid_json" });
  }

  const forwarded = String(firstHeaderValue(request.headers["x-forwarded-for"]) || "").split(",")[0].trim();

  try {
    const result = await handlePortal({
      method: request.method,
      action: String(request.query?.action || ""),
      client: String(request.query?.client || ""),
      body,
      cookie: request.headers.cookie,
      ip: forwarded || request.socket?.remoteAddress,
      env: process.env,
      store: redisStore(process.env),
      secure: true,
    });
    if (result.cookie) response.setHeader("Set-Cookie", result.cookie);
    return response.status(result.status).json(result.json);
  } catch {
    return response.status(502).json({ ok: false, error: "store_unavailable" });
  }
}
