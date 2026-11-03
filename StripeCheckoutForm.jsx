import { useEffect, useRef } from "react";

const STRIPE_JS = "https://js.stripe.com/dahlia/stripe.js";

// Stripe.js must come from Stripe's servers (never bundled or self-hosted).
// Loaded on demand so it does not slow down the landing pages.
function loadStripeJs() {
  if (window.Stripe) return Promise.resolve(window.Stripe);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = STRIPE_JS;
    s.async = true;
    s.onload = () => resolve(window.Stripe);
    s.onerror = () => reject(new Error("Could not load Stripe.js"));
    document.head.appendChild(s);
  });
}

const appearance = {
  theme: "stripe",
  labels: "auto",
  inputs: "spaced",
  variables: {
    borderRadius: "4px",
    colorBackground: "#ffffff",
    colorDanger: "#df1b41",
    colorPrimary: "#0570de",
    colorSuccess: "#00c853",
    colorText: "#30313d",
    fontFamily: "default",
    fontSizeBase: "16px",
    spacingUnit: "4px",
  },
};

export default function StripeCheckoutForm({ plan, reference, onError }) {
  const mountRef = useRef(null);

  useEffect(() => {
    let form;
    let cancelled = false;
    (async () => {
      try {
        const Stripe = await loadStripeJs();
        const stripe = Stripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
        const clientSecret = fetch("/api/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan, ref: reference }),
        })
          .then((r) => r.json())
          .then((j) => { if (!j.client_secret) throw new Error(j.error || "no_client_secret"); return j.client_secret; });
        const checkout = stripe.initCheckoutFormSdk({ clientSecret, appearance });
        form = checkout.createForm({ layout: "expanded" });
        if (cancelled) return;
        form.mount(mountRef.current);

        const loaded = await checkout.loadActions();
        if (loaded.type === "success") {
          form.on("confirm", async (event) => {
            try {
              const result = await loaded.actions.confirm({ formConfirmEvent: event });
              if (result && result.type === "error") throw new Error(result.error?.message || "confirm_failed");
              window.location.assign("/thank-you-purchase");
            } catch (error) {
              console.error("Payment confirmation error:", error);
            }
          });
        }
      } catch (error) {
        console.error("Checkout failed to load:", error);
        if (!cancelled && onError) onError(error);
      }
    })();
    return () => {
      cancelled = true;
      try { form && form.unmount && form.unmount(); } catch { /* ignore */ }
    };
  }, []);

  return <div id="checkout-form" ref={mountRef} />;
}
