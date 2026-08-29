import { createHash } from "node:crypto";

const PIXEL_ID = "952702819397221";
const DEFAULT_GRAPH_API_VERSION = "v26.0";
const EVENT_NAME = "Schedule";
const MAX_EVENT_AGE_SECONDS = 24 * 60 * 60;

const HASH_FIELDS = {
  email: "em",
  phone: "ph",
  first_name: "fn",
  last_name: "ln",
  city: "ct",
  state: "st",
  zip: "zp",
  country: "country",
};

function firstHeaderValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function normalize(value, field) {
  const text = String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

  if (field === "email") return text.trim().toLowerCase();
  if (field === "phone") return text.replace(/\D/g, "");
  if (field === "zip") return text.trim().toLowerCase().replace(/[\s-]/g, "");

  return text.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function hashCustomerData(customerData) {
  if (customerData?.marketing_consent !== true) return {};

  return Object.entries(HASH_FIELDS).reduce((result, [inputField, metaField]) => {
    const normalized = normalize(customerData[inputField], inputField);
    if (normalized) result[metaField] = [hash(normalized)];
    return result;
  }, {});
}

function isAllowedSourceUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    const deploymentHost = String(process.env.VERCEL_URL || "").toLowerCase();
    const hostname = url.hostname.toLowerCase();
    const isLocal = process.env.NODE_ENV !== "production" &&
      (hostname === "localhost" || hostname === "127.0.0.1");

    return (
      url.protocol === "https:" &&
      (hostname === "speakers-gym.com" ||
        hostname === "www.speakers-gym.com" ||
        (deploymentHost && hostname === deploymentHost))
    ) || isLocal;
  } catch {
    return false;
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") return JSON.parse(body);
  return body;
}

function validEventId(value) {
  return typeof value === "string" && /^[a-zA-Z0-9_-]{8,128}$/.test(value);
}

export function buildMetaEvent(body, headers = {}) {
  if (!validEventId(body.event_id)) throw new Error("invalid_event_id");
  if (!isAllowedSourceUrl(body.event_source_url)) throw new Error("invalid_source_url");

  const now = Math.floor(Date.now() / 1000);
  const suppliedTime = Number(body.event_time);
  const eventTime = Number.isInteger(suppliedTime) &&
    suppliedTime <= now + 60 &&
    suppliedTime >= now - MAX_EVENT_AGE_SECONDS
    ? suppliedTime
    : now;

  const forwardedFor = firstHeaderValue(headers["x-forwarded-for"]);
  const clientIp = String(forwardedFor || "").split(",")[0].trim();
  const clientUserAgent = firstHeaderValue(headers["user-agent"]);
  const userData = {
    ...hashCustomerData(body.customer_data),
  };

  if (clientIp) userData.client_ip_address = clientIp;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;
  if (typeof body.fbp === "string" && body.fbp.length <= 255) userData.fbp = body.fbp;
  if (typeof body.fbc === "string" && body.fbc.length <= 255) userData.fbc = body.fbc;

  return {
    event_name: EVENT_NAME,
    event_time: eventTime,
    event_id: body.event_id,
    action_source: "website",
    event_source_url: body.event_source_url,
    user_data: userData,
  };
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ ok: false, error: "method_not_allowed" });
  }

  const accessToken = process.env.META_CONVERSIONS_API_TOKEN;
  if (!accessToken) {
    return response.status(503).json({ ok: false, error: "meta_not_configured" });
  }

  let event;
  try {
    event = buildMetaEvent(parseBody(request.body), request.headers);
  } catch (error) {
    const code = error instanceof SyntaxError ? "invalid_json" : error.message;
    return response.status(400).json({ ok: false, error: code });
  }

  const graphVersion = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const payload = { data: [event] };
  if (process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const metaResponse = await fetch(
      `https://graph.facebook.com/${graphVersion}/${PIXEL_ID}/events`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    const result = await metaResponse.json();

    if (!metaResponse.ok) {
      console.error("Meta CAPI request failed", {
        status: metaResponse.status,
        code: result?.error?.code,
        type: result?.error?.type,
      });
      return response.status(502).json({ ok: false, error: "meta_request_failed" });
    }

    return response.status(200).json({
      ok: true,
      events_received: result.events_received,
      fbtrace_id: result.fbtrace_id,
      test_mode: Boolean(process.env.META_TEST_EVENT_CODE),
    });
  } catch {
    return response.status(502).json({ ok: false, error: "meta_unavailable" });
  }
}
