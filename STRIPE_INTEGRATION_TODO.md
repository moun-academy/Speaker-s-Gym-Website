# Stripe Integration TODO

This is the single source of truth for finishing the Stripe Checkout (embedded form) setup.

No existing Checkout Session API call was found (the site only used hosted Stripe payment links), so a new endpoint was added. Nothing on the live pages uses it yet.

## Values to Replace

The following values are placeholders and must be updated before going live.

**Files containing placeholders:**
- [api/create-checkout-session.js](api/create-checkout-session.js)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| mode | payment | Set to "payment" for one-time charges or "subscription" for recurring billing. |
| line_items[].price | price_... | Your actual Stripe Price ID from the Dashboard (https://dashboard.stripe.com/prices) or API. |

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly.

**Files containing these parameters:**
- [api/create-checkout-session.js](api/create-checkout-session.js)

| Parameter | Value |
|-----------|-------|
| ui_mode | form |
| billing_address_collection | auto |
| phone_number_collection | { enabled: false } |
| automatic_tax | { enabled: false } |
| submit_type | auto |
| integration_identifier | custom_embedded_web_0001 |
| payment_method_collection | always (only sent when mode is "subscription") |
| API version | 2026-03-25.dahlia |

## Setup and next steps

**Environment variables** (see [.env.example](.env.example)). Set them locally in `.env.local` and in Vercel (Project Settings > Environment Variables):
- `VITE_STRIPE_PUBLISHABLE_KEY`: publishable key, browser-accessible (needs the `VITE_` prefix).
- `STRIPE_SECRET_KEY`: secret key, server only (no `VITE_` prefix).

Keys: https://dashboard.stripe.com/test/apikeys. Redeploy after adding them, because Vite reads `VITE_` variables at build time.

**Dependencies:** `stripe` was added to `package.json` (run `npm install`).

**Files added:**
- [api/create-checkout-session.js](api/create-checkout-session.js): Vercel function, `POST /api/create-checkout-session`, returns `{ client_secret }`.
- [StripeCheckoutForm.jsx](StripeCheckoutForm.jsx): React component that loads Stripe.js from `https://js.stripe.com/dahlia/stripe.js` (on demand, so the landing pages stay fast), then mounts and confirms the form.
- [.env.example](.env.example)

**Using the form:** render `<StripeCheckoutForm />` in the page or modal where you want to take payment. It is not wired into any page yet, so the current Stripe payment links keep working unchanged. Because the endpoint uses one Price ID, add a request body (for example a plan key) if you need several plans.

**How it works:**
1. The component loads Stripe.js and calls `POST /api/create-checkout-session`.
2. The server creates a Checkout Session (`ui_mode: "form"`) and returns its `client_secret`.
3. `stripe.initCheckoutFormSdk` renders the payment form in a Stripe-hosted iframe.
4. On submit, `actions.confirm` completes the payment.

**Not included (add if needed):** a webhook handler for `checkout.session.completed` (fulfillment, access, emails) and a return/thank-you step. The site already has `/thank-you-purchase`.

**Testing:** use test keys. Card `4242 4242 4242 4242`, any future expiry, any CVC, any postal code. Declined card: `4000 0000 0000 0002`. 3D Secure: `4000 0025 0000 3155`. More: https://docs.stripe.com/testing

**Next steps:** create products and Prices in the Dashboard, set the Price ID and `mode`, add a webhook for fulfillment, then switch to live keys.

**Resources:** https://support.stripe.com and https://docs.stripe.com/mcp
