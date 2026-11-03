import { Stripe } from "stripe";

// Plan key sent by the Europe page -> Stripe Price ID (set these in Vercel, see STRIPE_INTEGRATION_TODO.md).
const PLAN_PRICES = {
  eu_one_on_one: process.env.STRIPE_PRICE_EU_ONE_ON_ONE, // €180
  eu_group: process.env.STRIPE_PRICE_EU_GROUP, // €110
  eu_early_bird: process.env.STRIPE_PRICE_EU_EARLY_BIRD, // €85
};

function readBody(body) {
  try {
    if (!body) return {};
    if (typeof body === "string") return JSON.parse(body);
    return body;
  } catch {
    return {};
  }
}

// Creates a Stripe Checkout Session for the embedded form (ui_mode "form").
// See STRIPE_INTEGRATION_TODO.md for the placeholders that must be replaced.
export default async function handler(request, response) {
  response.setHeader("Cache-Control", "private, no-store");
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "method_not_allowed" });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return response.status(500).json({ error: "stripe_not_configured" });
  }

  const { plan, ref } = readBody(request.body);
  const price = PLAN_PRICES[plan];
  if (!price) return response.status(400).json({ error: "price_not_configured" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-03-25.dahlia" });

  // TODO: Set mode to "subscription" if selling recurring products.
  const mode = "payment";

  const sessionParams = {
    ui_mode: "form",
    billing_address_collection: "auto",
    phone_number_collection: { enabled: false },
    automatic_tax: { enabled: false },
    submit_type: "auto",
    integration_identifier: "custom_embedded_web_0001",
    mode,
    line_items: [{ price, quantity: 1 }],
  };
  if (typeof ref === "string" && /^[\w-]{1,200}$/.test(ref)) sessionParams.client_reference_id = ref;
  if (mode === "subscription") {
    sessionParams.payment_method_collection = "always";
  }

  try {
    const session = await stripe.checkout.sessions.create(sessionParams);
    return response.status(200).json({ client_secret: session.client_secret });
  } catch (err) {
    console.error("Checkout session error:", err.message);
    return response.status(500).json({ error: "checkout_session_failed" });
  }
}
