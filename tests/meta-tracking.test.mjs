import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";

import { buildMetaEvent } from "../api/meta-conversion.js";
import { isConfirmedCalendlyBooking } from "../metaTracking.js";

const SOURCE_URL = "https://www.speakers-gym.com/book-a-call";

test("recognizes only confirmed Calendly booking messages", () => {
  assert.equal(isConfirmedCalendlyBooking({
    origin: "https://calendly.com",
    data: { event: "calendly.event_scheduled" },
  }), true);
  assert.equal(isConfirmedCalendlyBooking({
    origin: "https://example.com",
    data: { event: "calendly.event_scheduled" },
  }), false);
  assert.equal(isConfirmedCalendlyBooking({
    origin: "https://calendly.com",
    data: { event: "calendly.profile_page_viewed" },
  }), false);
});

test("builds a Schedule event with matching data and consented hashes", () => {
  const event = buildMetaEvent({
    event_id: "schedule_test_12345678",
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: SOURCE_URL,
    fbp: "fb.1.1234567890.example",
    fbc: "fb.1.1234567890.clickid",
    customer_data: {
      marketing_consent: true,
      email: " Person@Example.com ",
    },
  }, {
    "x-forwarded-for": "203.0.113.10, 10.0.0.1",
    "user-agent": "SpeakerGymTest/1.0",
  });

  assert.equal(event.event_name, "Schedule");
  assert.equal(event.event_id, "schedule_test_12345678");
  assert.equal(event.action_source, "website");
  assert.equal(event.event_source_url, SOURCE_URL);
  assert.equal(event.user_data.client_ip_address, "203.0.113.10");
  assert.equal(event.user_data.client_user_agent, "SpeakerGymTest/1.0");
  assert.equal(event.user_data.fbp, "fb.1.1234567890.example");
  assert.equal(event.user_data.fbc, "fb.1.1234567890.clickid");
  assert.deepEqual(event.user_data.em, [
    createHash("sha256").update("person@example.com").digest("hex"),
  ]);
});

test("does not use customer data without explicit marketing consent", () => {
  const event = buildMetaEvent({
    event_id: "schedule_test_87654321",
    event_source_url: SOURCE_URL,
    customer_data: {
      marketing_consent: false,
      email: "person@example.com",
    },
  });

  assert.equal(event.user_data.em, undefined);
});

test("rejects events attributed to an unrelated website", () => {
  assert.throws(() => buildMetaEvent({
    event_id: "schedule_test_11223344",
    event_source_url: "https://example.com/book-a-call",
  }), /invalid_source_url/);
});
