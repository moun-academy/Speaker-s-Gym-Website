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
| line_items[].price | Price IDs set as defaults in the file | Already filled in (€180, €110, €85). If these are test-mode Prices, set `STRIPE_PRICE_EU_*` in Vercel to the live Price IDs when you go live. |

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

**Where it is used:** the `/europe` page. The "Enroll in 1-on-1 coaching" and "Reserve my seat" buttons open the embedded form in a popup (`PayModal` in [Sales.jsx](Sales.jsx)). The page sends a plan key (`eu_one_on_one`, `eu_group`, `eu_early_bird`) and the endpoint maps it to the Price ID above. The page also sends the same `client_reference_id` tag the payment links used (`eur_...`).

**Safe fallback:** the buttons only open the embedded form when `VITE_STRIPE_PUBLISHABLE_KEY` is set. Without it they open the existing Stripe payment links, as before. If the form fails to load, the popup shows a link to the payment link. `/uae`, `/qatar` and `/sales` are unchanged.

**Automatic switch-on:** the publishable key is built into [StripeCheckoutForm.jsx](StripeCheckoutForm.jsx) (it is public by design). The page asks `GET /api/create-checkout-session` first and only shows the embedded form once `STRIPE_SECRET_KEY` exists on the server. Until then the buttons keep using the payment links.

**To switch `/europe` on:** (1) add `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY` in Vercel (keys from the same mode, test or live, as the Prices), (2) redeploy, (3) test a payment with a test key before using live keys. After a successful payment the page goes to `/thank-you-purchase`.

**How it works:**
1. The component loads Stripe.js and calls `POST /api/create-checkout-session`.
2. The server creates a Checkout Session (`ui_mode: "form"`) and returns its `client_secret`.
3. `stripe.initCheckoutFormSdk` renders the payment form in a Stripe-hosted iframe.
4. On submit, `actions.confirm` completes the payment.

**Webhook:** [api/stripe-webhook.js](api/stripe-webhook.js) verifies Stripe's signature and, on `checkout.session.completed`, logs the payment and (when the site's Redis store is configured) saves it to the `stripe:purchases` list: time, plan tag, email, name, country, amount, live or test. To turn it on, create a webhook endpoint in Stripe (Developers > Webhooks) pointing to `https://YOUR-DOMAIN/api/stripe-webhook` for the event `checkout.session.completed`, then set its signing secret (`whsec_...`) as `STRIPE_WEBHOOK_SECRET` in Vercel. Test and live mode each need their own endpoint and secret. It does not send emails or grant access: add that where marked if you want it.

**Testing:** use test keys. Card `4242 4242 4242 4242`, any future expiry, any CVC, any postal code. Declined card: `4000 0000 0000 0002`. 3D Secure: `4000 0025 0000 3155`. More: https://docs.stripe.com/testing

**Next steps:** create products and Prices in the Dashboard, set the Price ID and `mode`, add a webhook for fulfillment, then switch to live keys.

**Resources:** https://support.stripe.com and https://docs.stripe.com/mcp
