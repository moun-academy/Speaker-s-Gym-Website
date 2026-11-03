import { Stripe } from "stripe";
import { redisCommand } from "./_waitlist-core.js";

// Stripe needs the raw request body to verify the signature.
export const config = { api: { bodyParser: false } };

function rawBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (c) => chunks.push(typeof c === "string" ? Buffer.from(c) : c));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return response.status(500).json({ error: "webhook_not_configured" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });
  let event;
  try {
    event = stripe.webhooks.constructEvent(await rawBody(request), request.headers["stripe-signature"], secret);
  } catch (err) {
    console.error("Stripe webhook signature check failed:", err.message);
    return response.status(400).json({ error: "invalid_signature" });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object;
    const record = {
      at: new Date().toISOString(),
      session: s.id,
      ref: s.client_reference_id || null,
      email: s.customer_details?.email || null,
      name: s.customer_details?.name || null,
      country: s.customer_details?.address?.country || null,
      amount: s.amount_total != null ? s.amount_total / 100 : null,
      currency: s.currency || null,
      paid: s.payment_status === "paid",
      live: event.livemode === true,
    };
    console.log("Checkout completed:", JSON.stringify(record));
    try {
      const command = redisCommand(process.env);
      if (command) await command(["LPUSH", "stripe:purchases", JSON.stringify(record)]);
    } catch (err) {
      // Never fail the webhook over storage: Stripe would retry and we would double-record.
      console.error("Could not store purchase:", err.message);
    }
  }
  return response.status(200).json({ received: true });
}
