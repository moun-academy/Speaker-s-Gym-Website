import { Stripe } from "stripe";

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
    // TODO: replace with your real Stripe Price ID.
    line_items: [{ price: "price_...", quantity: 1 }],
  };
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
