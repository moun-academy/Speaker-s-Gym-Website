const META_EVENT_NAME = "Schedule";
const CALENDLY_ORIGIN = "https://calendly.com";

function readCookie(name) {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  const cookie = document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix));

  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : undefined;
}

function readStorageValue(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function hasMarketingConsent() {
  if (typeof window === "undefined") return false;

  const oneTrustGroups = String(window.OnetrustActiveGroups || "")
    .split(",")
    .map((group) => group.trim());

  return (
    window.speakerGymConsent?.marketing === true ||
    window.Cookiebot?.consent?.marketing === true ||
    oneTrustGroups.includes("C0004") ||
    readStorageValue("speaker_gym_marketing_consent") === "granted"
  );
}

function createEventId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `sg_schedule_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
}

function getFbc() {
  const cookieValue = readCookie("_fbc");
  if (cookieValue) return cookieValue;

  const fbclid = new URLSearchParams(window.location.search).get("fbclid");
  return fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined;
}

function cleanCustomerData(calendlyEvent) {
  if (!hasMarketingConsent()) {
    return { marketing_consent: false };
  }

  const invitee = calendlyEvent?.data?.payload?.invitee || {};
  const customer = calendlyEvent?.data?.payload?.customer || {};
  const source = { ...customer, ...invitee };

  return {
    marketing_consent: true,
    email: source.email,
    phone: source.phone || source.phone_number,
    first_name: source.first_name,
    last_name: source.last_name,
    city: source.city,
    state: source.state,
    zip: source.zip || source.postal_code,
    country: source.country,
  };
}

export function isConfirmedCalendlyBooking(event) {
  return (
    event?.origin === CALENDLY_ORIGIN &&
    event?.data?.event === "calendly.event_scheduled"
  );
}

export async function trackConfirmedCalendlyBooking(calendlyEvent) {
  const eventId = createEventId();
  const eventSourceUrl = window.location.href;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "calendly_booking_complete",
    event_id: eventId,
  });

  if (typeof window.fbq === "function") {
    window.fbq("track", META_EVENT_NAME, {}, { eventID: eventId });
  }

  const response = await fetch("/api/meta-conversion", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    credentials: "same-origin",
    body: JSON.stringify({
      event_id: eventId,
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: eventSourceUrl,
      fbp: readCookie("_fbp"),
      fbc: getFbc(),
      customer_data: cleanCustomerData(calendlyEvent),
    }),
  });

  if (!response.ok) {
    throw new Error(`Meta conversion request failed with status ${response.status}`);
  }

  return eventId;
}
