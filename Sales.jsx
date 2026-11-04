import { createContext, lazy, Suspense, useContext, useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter, SiteHeader } from "./SiteChrome.jsx";
import { BOOK_URL, WHATSAPP_URL, WHATSAPP_NUMBER, whatsappLink } from "./siteConfig.js";
import WhatsAppIcon from "./WhatsAppIcon.jsx";
import marouanePhoto from "./Marouane.webp";
import YouTubeEmbed from "./YouTubeEmbed.jsx";
import HeroVideo from "./HeroVideo.jsx";
import "./Sales.css";

const StripeCheckoutForm = lazy(() => import("./StripeCheckoutForm.jsx"));

const GROUP_MAX = 5;

/* ─── Markets: one page, two price lists ───
   Paste Stripe Payment Links into each market's `checkout`. A link must charge the same amount and currency
   shown on the page. While a link is empty: 1-on-1 and group buttons email us, early-bird cards open the waiting list. */
const MARKETS = {
  usd: {
    key: "usd",
    contact: "whatsapp",
    currency: "USD",
    money: (n) => `$${n}`,
    node: (n) => `$${n}`,
    price: { oneOnOne: 250, oneOnOneDeal: 197, group: 149, groupDeal: 129, earlyBird: 97 },
    checkout: {
      oneOnOne: "https://buy.stripe.com/6oU14n5lb3Fz6Sb6yR1ck03", // $197 special price, until the deal ends
      oneOnOneFull: "", // paste a $250 Stripe link here for after the deal; while empty, the button emails us
      group: "https://buy.stripe.com/7sY00jbJz0tndgz0at1ck05", // $129 · next group
      earlyBird: "https://buy.stripe.com/cNi3cvfZPb81ccv3mF1ck07", // $97 · later groups
    },
    ref: "",
    time: "12–1 pm GMT (4–5 pm GMT+4)",
    timeLong: "12 to 1 pm GMT (4 to 5 pm GMT+4)",
    timeShort: "12–1 pm GMT",
    title: "Join The Speaker's Gym | 1-on-1 or Group Coaching",
    kicker: "Live online program",
    heroFor: null,
    assure: ["100% online · join from anywhere", "4-week money-back guarantee", "1-on-1 includes a year of group coaching"],
    priceNote: null,
    extraFaq: null,
  },
  aed: {
    key: "aed",
    contact: "call",
    currency: "AED",
    money: (n) => `AED ${n}`,
    node: (n) => (<><small className="s-cur">AED</small>{n}</>),
    price: { oneOnOne: 920, oneOnOneDeal: 725, group: 550, groupDeal: 475, earlyBird: 355 },
    usdPrice: { oneOnOne: 250, oneOnOneDeal: 197, group: 149, groupDeal: 129, earlyBird: 97 },
    // Same Stripe links as USD: Stripe charges in USD and shows buyers their own currency at checkout.
    checkout: {
      oneOnOne: "https://buy.stripe.com/6oU14n5lb3Fz6Sb6yR1ck03",
      oneOnOneFull: "",
      group: "https://buy.stripe.com/7sY00jbJz0tndgz0at1ck05",
      earlyBird: "https://buy.stripe.com/cNi3cvfZPb81ccv3mF1ck07",
    },
    ref: "aed_",
    time: "4–5 pm UAE time (GMT+4)",
    timeLong: "4 to 5 pm UAE time (GMT+4)",
    timeShort: "4–5 pm UAE time",
    title: "Join The Speaker's Gym | UAE",
    kicker: "Live online program · UAE",
    heroFor: `A six-week program for shy and nervous professionals in the UAE. Private 1-on-1 coaching or a small group of ${GROUP_MAX}.`,
    assure: ["100% online · join from anywhere", "4-week money-back guarantee", "1-on-1 includes a year of group coaching"],
    priceNote: "Our prices are set in US dollars. You pay in your own currency, so the final amount may differ slightly depending on the exchange rate.",
    extraFaq: ["Which currency do I pay in?", "Our prices are set in US dollars: $197 special price, $250, $129, $149 and $97. At checkout you pay in your own currency, converted at that day's exchange rate, so the final amount can be slightly different from the AED figure shown on this page. The dollar price never changes."],
  },
};
/* The 1-on-1 holiday discount is always on. The end date shown rolls forward by itself: it is the 30th of the
   current month (or the last day of a shorter month), and moves to the next month once that day has passed
   (end of day, Dubai time, GMT+4). */
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function nextDealEnd(now = new Date()) {
  const dubai = new Date(now.getTime() + 4 * 3600 * 1000);
  let y = dubai.getUTCFullYear(), m = dubai.getUTCMonth();
  for (let i = 0; i < 2; i++) {
    const day = Math.min(30, new Date(Date.UTC(y, m + 1, 0)).getUTCDate());
    if (dubai.getTime() <= Date.UTC(y, m, day, 23, 59, 59)) return { label: `${MONTHS[m]} ${day}`, last: dubai.getUTCDate() === day };
    m += 1;
    if (m > 11) { m = 0; y += 1; }
  }
  return { label: "soon", last: false };
}
/* Qatar: same page and USD Stripe links, riyal prices (pegged: 1 USD = 3.64 QAR), Qatar time (GMT+3). */
MARKETS.qar = {
  ...MARKETS.aed,
  key: "qar",
  currency: "QAR",
  money: (n) => `QAR ${n}`,
  node: (n) => (<><small className="s-cur">QAR</small>{n}</>),
  price: { oneOnOne: 910, oneOnOneDeal: 715, group: 540, groupDeal: 470, earlyBird: 355 },
  ref: "qar_",
  time: "3–4 pm Qatar time (GMT+3)",
  timeLong: "3 to 4 pm Qatar time (GMT+3)",
  timeShort: "3–4 pm Qatar time",
  title: "Join The Speaker's Gym | Qatar",
  kicker: "Live online program · Qatar",
  heroFor: `A six-week program for shy and nervous professionals in Qatar. Private 1-on-1 coaching or a small group of ${GROUP_MAX}.`,
  extraFaq: ["Which currency do I pay in?", "Our prices are set in US dollars: $197 special price, $250, $129, $149 and $97. At checkout you pay in your own currency, converted at that day's exchange rate, so the final amount can be slightly different from the QAR figure shown on this page. The dollar price never changes."],
};
/* Europe: a copy of the UAE page with native euro prices and euro Stripe links, European time (CET),
   and "Book a call" instead of WhatsApp. oneOnOneFull (the regular €250 link) is not set yet: after the
   holiday discount ends, the 1-on-1 button emails us until a €250 link is added. */
MARKETS.eur = {
  ...MARKETS.aed,
  key: "eur",
  currency: "EUR",
  money: (n) => `€${n}`,
  node: (n) => `€${n}`,
  price: { oneOnOne: 250, oneOnOneDeal: 180, group: 150, groupDeal: 110, earlyBird: 85 },
  usdPrice: null,
  checkout: {
    oneOnOne: "https://buy.stripe.com/cNi8wP00RekdfoHe1j1ck08", // €180 holiday discount
    oneOnOneFull: "", // €250 after the discount: paste a link here
    group: "https://buy.stripe.com/fZubJ128Z2BvdgzaP71ck09", // €110 · next group
    earlyBird: "https://buy.stripe.com/28E00j00R2Bv7Wf1ex1ck0a", // €85 · later groups
  },
  ref: "eur_",
  time: "1–2 pm CET (12–1 pm GMT)",
  timeLong: "1 to 2 pm CET (12 to 1 pm GMT)",
  timeShort: "1–2 pm CET",
  title: "Confidence Coaching for Shy Professionals | The Speaker's Gym Europe",
  kicker: "For shy professionals · 8-week live online program",
  heroFor: `Two weeks of psychology, six weeks of speaking skills. Private 1-on-1 coaching or a small group of ${GROUP_MAX}.`,
  assure: ["100% online · join from anywhere", "4-week money-back guarantee", "1-on-1 includes a year of group coaching"],
  priceNote: "All prices are in euros.",
  extraFaq: ["Which currency do I pay in?", "Euros (€). The price on this page is the price you pay at checkout."],
};

/* Europe: sessions run 12:00-13:00 GMT. The Czech Republic, Germany, France, Spain, Slovakia, Austria and Switzerland
   share one time zone (Europe/Prague), so the local time is worked out for each date: 1-2 pm in winter, 2-3 pm in summer. */
const EU_CITIES = "(Berlin, Paris, Madrid, Prague)";
function euLabel(date = new Date()) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Prague", hour: "numeric", hour12: false }).format(d)) % 24;
  const start = hour > 12 ? hour - 12 : hour;
  const zone = hour === 13 ? "Central European Time" : "Central European Summer Time";
  return `${start} - ${start + 1}pm ${zone} ${EU_CITIES}`;
}
MARKETS.eur = Object.defineProperties(MARKETS.eur, {
  time: { get: () => euLabel(new Date()), enumerable: true },
  timeLong: { get: () => euLabel(new Date()), enumerable: true },
  timeShort: { get: () => euLabel(new Date()).replace("Central European Summer Time", "CEST").replace("Central European Time", "CET").replace(` ${EU_CITIES}`, ""), enumerable: true },
});
MARKETS.eur.timeAt = euLabel;
MARKETS.eur.timeNote = "";
MARKETS.eur.holiday = true;
MARKETS.eur.embedded = true;
MARKETS.eur.eight = true;
MARKETS.eur.heroCall = true;
MARKETS.eur.pillars = true;

const MarketContext = createContext(MARKETS.usd);
const useMarket = () => useContext(MarketContext);
const GROUPS_SHOWN = 3;        // next group + two early-bird groups
const CONTACT_EMAIL = "marouane@speakers-gym.com";
const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Question about The Speaker's Gym")}&body=${encodeURIComponent("Hello Speaker's Gym team,\n\nMy name is \nI'm interested in: 1-on-1 coaching / group coaching\nWhat I'd like to improve: \n\nThank you!")}`;
const CLOSE_DAYS_BEFORE = 2;   // a group stops taking sign-ups this many days before it starts

const cx = (...c) => c.filter(Boolean).join(" ");

/* ─── Group start dates: first Sunday of each month + the Sunday nearest the 15th ─── */
function groupStartDates(fromDate, months = 5) {
  const out = [];
  for (let k = 0; k < months; k++) {
    const y = fromDate.getFullYear(), m = fromDate.getMonth() + k;
    const sundays = [];
    for (let d = 1; d <= 31; d++) {
      const dt = new Date(y, m, d);
      if (dt.getMonth() !== ((m % 12) + 12) % 12) break;
      if (dt.getDay() === 0) sundays.push(dt);
    }
    const mid = sundays.reduce((a, b) => (Math.abs(b.getDate() - 15) < Math.abs(a.getDate() - 15) ? b : a));
    out.push(sundays[0], mid);
  }
  return out.sort((a, b) => a - b);
}

const isoDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmt = (d, opts) => d.toLocaleDateString("en-US", opts);
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

function withRef(url, ref) {
  if (!url) return "";
  return `${url}${url.includes("?") ? "&" : "?"}client_reference_id=${encodeURIComponent(ref)}`;
}

function trackCheckout(value, name, currency = "USD") {
  try { window.fbq?.("track", "InitiateCheckout", { value, currency, content_name: name }); } catch (e) { /* ignore */ }
  try { window.gtag?.("event", "begin_checkout", { value, currency, items: [{ item_name: name }] }); } catch (e) { /* ignore */ }
}

function CheckoutButton({ href, className, value, name, children, fallbackHref, fallbackLabel, onEmbed }) {
  const M = useMarket();
  if (!href && fallbackHref) {
    return <a className={cx("s-btn s-btn--block", className)} href={fallbackHref}>{fallbackLabel} <span aria-hidden="true">→</span></a>;
  }
  if (!href) {
    return <span className={cx("s-btn s-btn--block s-btn--soon", className)} aria-disabled="true">Checkout opens soon</span>;
  }
  if (onEmbed) {
    return (
      <button type="button" className={cx("s-btn s-btn--block", className)} onClick={() => { trackCheckout(value, name, M.currency); onEmbed(); }}>
        {children} <span aria-hidden="true">→</span>
      </button>
    );
  }
  return (
    <a className={cx("s-btn s-btn--block", className)} href={href} target="_blank" rel="noopener" onClick={() => trackCheckout(value, name, M.currency)}>
      {children} <span aria-hidden="true">→</span>
    </a>
  );
}

/* ─── Embedded payment form (Europe) ─── */
function PayModal({ pay, onClose }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prevOverflow; document.removeEventListener("keydown", onKey); };
  }, [onClose]);
  return (
    <div className="s-modal" role="dialog" aria-modal="true" aria-label="Secure payment" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="s-modal-card s-pay-card">
        <button type="button" className="s-modal-close" onClick={onClose} aria-label="Close">×</button>
        <p className="s-modal-kicker">SECURE PAYMENT</p>
        <h3 className="s-pay-title">{pay.title}</h3>
        <p className="s-pay-sub">{pay.price} · 4-week money-back guarantee</p>
        <div className="s-pay-form">
          {failed ? (
            <p className="s-pay-error">We could not load the payment form. <a href={pay.fallback} target="_blank" rel="noopener">Continue on our secure payment page →</a></p>
          ) : (
            <Suspense fallback={<p className="s-pay-loading">Loading secure form…</p>}>
              <StripeCheckoutForm plan={pay.plan} reference={pay.ref} onError={() => setFailed(true)} />
            </Suspense>
          )}
        </div>
        {!failed && <a className="s-pay-alt" href={pay.fallback} target="_blank" rel="noopener">Trouble paying? Use our payment page</a>}
      </div>
    </div>
  );
}

/* ─── Waiting list form (early-bird groups) ─── */
function WaitlistModal({ group, onClose }) {
  const M = useMarket();
  const PRICE = M.price;
  const [form, setForm] = useState({ name: "", email: "", phone: "", website: "" });
  const [state, setState] = useState("idle"); // idle | sending | done | error
  const [error, setError] = useState("");
  const firstField = useRef(null);
  const when = fmt(group.date, { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    const previous = document.activeElement;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstField.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [onClose]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, group: group.key }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        const messages = {
          name: "Please enter your full name.",
          email: "Please check your email address.",
          phone: "Please enter a phone number with your country code.",
          too_many: "Too many attempts. Please try again in a little while.",
          store_unavailable: "The waiting list is being set up right now. Please try again in a few minutes.",
        };
        setError(messages[data.error] || "Something went wrong. Please try again.");
        setState("error");
        return;
      }
      setState("done");
      try { window.fbq?.("track", "Lead", { content_name: `Waitlist ${group.key}` }); } catch (err) { /* ignore */ }
      try { window.gtag?.("event", "generate_lead", { item_name: `Waitlist ${group.key}` }); } catch (err) { /* ignore */ }
    } catch {
      setError("Couldn't connect. Please check your internet and try again.");
      setState("error");
    }
  }

  return (
    <div className="s-modal" role="dialog" aria-modal="true" aria-labelledby="wl-title" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="s-modal-card">
        <button type="button" className="s-modal-close" aria-label="Close" onClick={onClose}>×</button>
        {state === "done" ? (
          <div className="s-modal-done">
            <span className="s-modal-tick" aria-hidden="true"><Check /></span>
            <h3 id="wl-title">You're on the list!</h3>
            <p>We've saved your spot on the waiting list for the group starting <b>{when}</b>, at the early-bird price of <b>{M.money(PRICE.earlyBird)}</b>. We'll be in touch before enrollment opens.</p>
            <button type="button" className="s-btn s-btn--gold s-btn--block" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="s-modal-kicker">EARLY BIRD · {M.money(PRICE.earlyBird)}</p>
            <h3 id="wl-title">Join the waiting list</h3>
            <p className="s-modal-sub">Group starting <b>{when}</b>. {M.eight ? "Eight" : "Six"} Sundays, {M.timeShort}, max {GROUP_MAX} people.</p>
            <label className="s-field"><span>Full name</span>
              <input ref={firstField} type="text" autoComplete="name" required value={form.name} onChange={update("name")} />
            </label>
            <label className="s-field"><span>Email</span>
              <input type="email" autoComplete="email" inputMode="email" required value={form.email} onChange={update("email")} />
            </label>
            <label className="s-field"><span>Phone (with country code)</span>
              <input type="tel" autoComplete="tel" inputMode="tel" placeholder="+971 50 123 4567" required value={form.phone} onChange={update("phone")} />
            </label>
            <label className="s-hp" aria-hidden="true">Website<input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={update("website")} /></label>
            {state === "error" && <p className="s-modal-error" role="alert">{error}</p>}
            <button type="submit" className="s-btn s-btn--gold s-btn--block" disabled={state === "sending"}>
              {state === "sending" ? "Saving…" : "Save my spot"}
            </button>
            <p className="s-modal-fine">No payment now. We only use your details to contact you about this group.</p>
          </form>
        )}
      </div>
    </div>
  );
}

/* ─── Reveal on scroll ─── */
function Reveal({ children, delay = 0, className = "", instant = false }) {
  const ref = useRef(null);
  const [on, setOn] = useState(instant);
  useEffect(() => {
    if (instant || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={cx("s-reveal", on && "s-reveal--in", className)} style={instant ? { transition: "none" } : { transitionDelay: `${delay}ms` }}>{children}</div>;
}

function CalendarIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none" }}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4" />
    </svg>
  );
}

function Snow() {
  return (
    <div className="s-snow" aria-hidden="true">
      {Array.from({ length: 26 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, width: `${3 + ((i * 3) % 5)}px`, height: `${3 + ((i * 3) % 5)}px`, opacity: 0.3 + ((i * 13) % 45) / 100, animationDuration: `${10 + ((i * 7) % 9)}s`, animationDelay: `${-((i * 5) % 16)}s` }} />
      ))}
    </div>
  );
}

function Lights() {
  return (
    <div className="s-lights" aria-hidden="true">
      {Array.from({ length: 34 }, (_, i) => <i key={i} style={{ "--l": i }} />)}
    </div>
  );
}

function AskLink({ topic, className = "s-ask" }) {
  const M = useMarket();
  if (M.contact === "call") {
    return (
      <p className={className}>
        Questions? <a href={BOOK_URL} target="_blank" rel="noopener noreferrer"><CalendarIcon size={15} /> Book a free call</a>
      </p>
    );
  }
  return (
    <p className={className}>
      Questions? <a href={whatsappLink(`Hello Speaker's Gym team, I have a question about ${topic}.`)} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={15} /> WhatsApp us</a>
    </p>
  );
}

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cx("s-faq", open && "s-faq--open")}>
      <button type="button" className="s-faq-q" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{q}</span><span className="s-faq-icon" aria-hidden="true">+</span>
      </button>
      <div className="s-faq-a"><div><p>{a}</p></div></div>
    </div>
  );
}

const Check = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

const ONE_ON_ONE = [
  "Six private 60-minute online sessions with Marouane",
  "Personalized roadmap and exposure plan",
  "1 year of the Speaker's Gym app with AI feedback",
  "1 year in the community + private WhatsApp group and member meetups",
  "1 year of the MOUN Academy full course (3 hours)",
  "Your own private portal and progress tracking",
  "Bonus: The Conversation Playbook",
];

const groupItems = (M) => [
  `${M.eight ? "Eight" : "Six"} live online group sessions, Sundays${M.eight ? "," : ""} ${M.time}`,
  `Maximum ${GROUP_MAX} people, so you speak every session`,
  `The same ${M.eight ? "8" : "6"}-week plan as 1-on-1`,
  "1 year of the Speaker's Gym app with AI feedback",
  "1 year in the community + private WhatsApp group and member meetups",
];

const THOUGHTS = [
  ["💭", "I know the answer. Why won't my words come out?", "Nerves"],
  ["🌀", "I rehearse it in my head, then stay quiet.", "Overthinking"],
  ["🎢", "I start well, then ramble and lose my point.", "Rambling"],
];

const PILLARS = [
  ["🎯", "Speak on the spot", "Learn structure, so you always know what to say, even when you are put on the spot.", "Structure"],
  ["🎙️", "Sound convincing", "Leave the monotone behind. Build vocal variety, so your voice carries your message.", "Vocal variety"],
  ["🧠", "Take action", "The psychology of genuine confidence. We help you get past the hesitation, so you act on what you already know.", "Psychology"],
];

const SKILLS = ["Structure", "Volume", "Pace", "Pauses", "Pitch", "Storytelling"];

const LOOP = [
  ["🎤", "Rehearse", "Practice out loud with us"],
  ["🏢", "Try it for real", "In your meeting or conversation"],
  ["🔍", "Review", "See what worked"],
  ["🔁", "Repeat", "Each time, a little easier"],
];

const BETWEEN = [
  ["📱", "Daily reps in the app, with AI feedback"],
  ["💬", "Feedback from us in the community"],
  ["📊", "Progress tracking, so you always know where you stand"],
];

/* Europe: the 8-week program starts with two weeks of psychology (the six-step formula). */
const PSYCH_WEEKS = [
  ["Understand what holds you back", "Name the worst case you fear when you have to speak, uncover what it would mean to you, and test whether that story is actually true."],
  ["Rewire it and prove it", "Reframe the worst case, repeat the new meaning until you believe it, then prove it with exposure: one manageable step at a time."],
];

const FORMULA = [
  ["Name the worst case", "Identify the worst-case scenario you fear when you have to speak."],
  ["Uncover the meaning", "List what it would mean about you: status, self-worth, belonging."],
  ["Test the story", "Ask of each meaning: is it actually true?"],
  ["Reframe it", "Find ten reasons the worst case could work in your favor, so it loses its power."],
  ["Make it stick", "Repeat the new meaning every day until you believe it."],
  ["Prove it with exposure", "Practice through a ten-level exposure system, one manageable step at a time."],
];

const WEEKS = [
  ["Organize Your Thoughts with PREP", "Structure your ideas clearly, answer with confidence and stop rambling under pressure."],
  ["Make Your Voice Heard", "Develop stronger volume and speak clearly without forcing or straining your voice."],
  ["Take Control of Your Pace", "Slow down, stay composed and respond spontaneously without rushing."],
  ["Pause, Think and Own the Silence", "Give yourself time to think and use intentional silence instead of filler words."],
  ["Find the Music in Your Voice", "Mix pitch with pace and volume so people hear how you feel."],
  ["Tell Stories That Move People", "Combine every skill and tell a story that drives your point home."],
];

const CREW = [
  ["💬", "Private WhatsApp group", "Share wins, ask anything and get cheered on by people on the same journey."],
  ["🤝", "Practice partners", "Pair up for a quick call between sessions. It is easier, and more fun, with someone beside you."],
  ["📍", "In-person meetups", "We encourage members to meet up, put faces to names and practice speaking with real people."],
];

const WEEK_LIFE = [
  ["10–15", "minutes a day", "Your speaking rep in the app. Do it with your morning coffee."],
  ["1", "live hour a week", "Sundays for the group. A time that suits you for 1-on-1."],
  ["1", "small real-world step", "Chosen at your level. Never a leap."],
];

const VIDEOS = [
  ["AmX2dVv8qcM", "Imane", "", "If you're trying to improve your communication style and to improve public speaking, fight anxiety, I 100% recommend Marouane's course in Moun Academy."],
  ["cm3G7biEwHI", "Vivek", "", "What I liked the most was how to structure our speech. This two hour workshop has been completely fruitful for me and I learned so many things."],
  ["Kctzf04s41c", "Kevin", "", "What I took away the most was structuring the scripts. That's something I didn't know much about, the core message and how to make it more impactful."],
  ["QzFvN_5MPWI", "Seta", "Toastmasters member for over a year", "I've learned a lot in this club. But what I learned today from Marouane's Academy was something else. It was on another level."],
  ["fiyvwTk2Iq4", "Marisol", "", "It was very easy for me to understand, and I'm sure that I will be able to apply what I learned during the workshop."],
  ["XQ5x8_tnI7M", "Avinash", "", "Got to know a lot about vocal variety and also how to structure your speeches. It was very interactive and I'm for sure buying his course."],
];

function SalesContent() {
  const M = useMarket();
  const PRICE = M.price;
  const CHECKOUT = M.checkout;
  const [spots, setSpots] = useState({ max: GROUP_MAX, taken: {}, full: [] });
  const [waitFor, setWaitFor] = useState(null);
  const [pay, setPay] = useState(null);
  const [embedOk, setEmbedOk] = useState(false);
  useEffect(() => {
    if (!M.embedded) return;
    let live = true;
    fetch("/api/create-checkout-session").then((r) => r.json()).then((j) => { if (live && j.ready) setEmbedOk(true); }).catch(() => {});
    return () => { live = false; };
  }, [M.embedded]);
  const [moreVideos, setMoreVideos] = useState(false);
  const [openWeek, setOpenWeek] = useState(0);

  useEffect(() => {
    const prev = document.title;
    document.title = M.title;
    fetch("/sales/spots.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setSpots({ max: d.max || GROUP_MAX, taken: d.taken || {}, full: d.full || [] }); })
      .catch(() => {});
    return () => { document.title = prev; };
  }, []);

  const groups = useMemo(() => {
    const today = new Date();
    const cutoff = addDays(new Date(today.getFullYear(), today.getMonth(), today.getDate()), CLOSE_DAYS_BEFORE);
    return groupStartDates(today)
      .filter((d) => d >= cutoff)
      .slice(0, GROUPS_SHOWN)
      .map((d, i) => {
        const key = isoDay(d);
        const taken = Math.min(spots.max, Number(spots.taken[key]) || 0);
        const left = spots.full.includes(key) ? 0 : spots.max - taken;
        const early = i > 0;
        return {
          date: d, key, left, early,
          price: early ? PRICE.earlyBird : PRICE.groupDeal,
          end: addDays(d, M.eight ? 49 : 35),
          link: withRef(early ? CHECKOUT.earlyBird : CHECKOUT.group, `${M.ref}${early ? "early" : "group"}_${key}`),
        };
      });
  }, [spots]);

  const next = groups[0];
  const daysToNext = next ? Math.round((next.date - new Date(new Date().toDateString())) / 86400000) : null;
  const dealLive = true;
  const dealEnd = nextDealEnd();
  const oneOnOnePrice = dealLive ? PRICE.oneOnOneDeal : PRICE.oneOnOne;
  const usdLine = (key) => (M.usdPrice ? <em className="s-usd">Priced at ${M.usdPrice[key]} USD · pay in your own currency</em> : null);
  const oneLink = withRef(dealLive ? CHECKOUT.oneOnOne : CHECKOUT.oneOnOneFull, `${M.ref}one_on_one`);

  const coachSec = (
      <section className="s-section s-section--tint" id="coach">
        <div className="s-coach">
          <Reveal>
            <div className="s-coach-photo"><img src={marouanePhoto} alt="Marouane Al Mandri, public speaking coach" loading="lazy" /></div>
          </Reveal>
          <Reveal delay={100}>
            <div className="s-coach-text">
              <p className="s-label s-label--left">Your coach</p>
              <h2>Hi, I'm Marouane.</h2>
              <p>I know what it feels like to have the knowledge but struggle to say it clearly. To freeze in meetings, ramble under pressure, or go unnoticed.</p>
              <p>I built The Speaker's Gym because <b>communication is a skill, not a talent</b>. No generic tips. No "just be confident." Just structured practice, honest feedback and a system that works in real situations.</p>
            </div>
          </Reveal>
        </div>
      </section>
  );

  const resultsSec = (
      <section className="s-section s-section--tint" id="results">
        <Reveal>
          <p className="s-label">Results</p>
          <h2 className="s-title">Don't take our word for it. <em>Take theirs.</em></h2>
          <p className="s-sub">Real students, in their own words.</p>
        </Reveal>
        <div className={cx("s-videos", moreVideos && "s-videos--all")}>
          {VIDEOS.map(([id, name, role, quote], i) => (
            <Reveal key={id} delay={i * 100} className={i >= 3 ? "s-video-extra" : ""}>
              <figure className="s-video">
                <div className="s-embed">
                  <YouTubeEmbed id={id} title={`${name}'s testimonial`} />
                </div>
                <figcaption>
                  <blockquote>“{quote}”</blockquote>
                  <cite><b>{name}</b>{role && <span>{role}</span>}</cite>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
        {!moreVideos && (
          <div className="s-more-wrap">
            <button type="button" className="s-btn s-btn--ghost s-more" onClick={() => setMoreVideos(true)}>See more student stories <span aria-hidden="true">↓</span></button>
          </div>
        )}
      </section>
  );

  const lean = !!M.pillars;
  const WK = M.eight ? 8 : 6;
  const weeks = M.eight ? [...PSYCH_WEEKS, ...WEEKS] : WEEKS;

  return (
    <div className={cx("sales-page", M.holiday && "s-holiday", lean && "s-lean")}>
      <SiteHeader page="sales" ctaCall={lean} />

      {/* ── 1 · HERO ── */}
      <header className="s-hero">
        <HeroVideo />
        <div className="s-hero-glow" aria-hidden="true" />
        {M.holiday && <Snow />}
        {M.holiday && <Lights />}
        <div className="s-wave" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ "--i": i }} />)}</div>
        <Reveal instant><p className="s-kicker"><span className="s-dot" aria-hidden="true" />{M.kicker}</p></Reveal>
        {M.holiday && (
          <Reveal instant>
            <p className="s-holiday-pill"><span aria-hidden="true">🎄</span> Holiday season offer: 1-on-1 coaching {M.money(PRICE.oneOnOneDeal)} instead of {M.money(PRICE.oneOnOne)}</p>
          </Reveal>
        )}
        <Reveal instant delay={80}>
          {lean ? <h1>Shy at work? Become <em>confident and outspoken.</em></h1> : <h1>Speak up in <em>meetings and conversations.</em></h1>}
        </Reveal>
        <Reveal instant delay={160}>
          {lean ? <p className="s-hero-sub">We help shy professionals speak up with confidence, through <mark>three pillars</mark>: structure, <mark>vocal variety</mark> and psychology.</p> : <p className="s-hero-sub">Explain your ideas <mark>clearly</mark> and bring them to life with an <mark>engaging voice</mark>, <span className="s-hero-sub-end">even when you feel nervous.</span></p>}
        </Reveal>
        {M.heroFor && (
          <Reveal instant delay={200}>
            <p className="s-hero-for">{M.heroFor}</p>
          </Reveal>
        )}
        <Reveal instant delay={240}>
          <div className="s-transforms">
            {[["Rambling", "Articulate"], ["Monotone", "Expressive"], ["Shy", "Confident"]].map(([a, b]) => (
              <span key={a}><s>{a}</s><i aria-hidden="true">→</i><b>{b}</b></span>
            ))}
          </div>
        </Reveal>
        <Reveal instant delay={300}>
          <div className="s-hero-btns">
            {M.heroCall
              ? <a href={BOOK_URL} className={cx("s-btn s-btn--gold", lean && "s-btn--xl")} target="_blank" rel="noopener noreferrer"><CalendarIcon size={20} /> Book a free discovery call</a>
              : <a href="#plans" className="s-btn s-btn--gold">See the plans</a>}
          </div>
        </Reveal>
        {lean && (
          <Reveal instant delay={310}>
            <p className="s-hero-price">From <b>{M.money(PRICE.earlyBird)}</b> · 8 weeks live online · 4-week money-back guarantee</p>
          </Reveal>
        )}
        {!M.heroCall && <Reveal instant delay={320}>
          {M.contact === "call"
            ? <a href={BOOK_URL} className="s-hero-wa s-hero-call" target="_blank" rel="noopener noreferrer"><CalendarIcon size={16} /> Prefer to talk first? Book a free call</a>
            : <a href={WHATSAPP_URL} className="s-hero-wa" target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={16} /> Prefer to ask first? Chat with us on WhatsApp</a>}
        </Reveal>}
        <Reveal instant delay={360}>
          <ul className="s-assure">
            {M.assure.map((t) => <li key={t}><Check />{t}</li>)}
          </ul>
        </Reveal>
      </header>

      {/* ── 2 · IS THIS FOR ME ── */}
      {/* ── THREE PILLARS (Europe) ── */}
      {M.pillars && (
        <section className="s-section s-pillars-sec" id="method">
          <div className="s-pillars-glow" aria-hidden="true" />
          <Reveal>
            <p className="s-label">The heart of the program</p>
            <h2 className="s-title s-pillars-title">Three pillars. <em>One confident you.</em></h2>
            <p className="s-sub">Built for shy professionals who know the answer at work, but cannot get themselves to take action.</p>
          </Reveal>
          <div className="s-pillars">
            {PILLARS.map(([icon, title, text, tag], i) => (
              <Reveal key={title} delay={i * 120}>
                <article className="s-pillar">
                  <span className="s-pillar-num" aria-hidden="true">0{i + 1}</span>
                  <span className="s-pillar-ico" aria-hidden="true">{icon}</span>
                  <small className="s-pillar-tag">{tag}</small>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="s-pillars-line">Structure gets you started. <b>Voice makes you convincing.</b> Psychology makes you act.</p>
          </Reveal>
        </section>
      )}

      {lean && <>{resultsSec}{coachSec}</>}

      {lean && (
        <section className="s-callstrip" id="discovery-call">
          <Reveal>
            <p className="s-label">Not sure it's for you?</p>
            <h2>Book a free <em>discovery call.</em></h2>
            <p>Tell us where you get stuck at work. We'll tell you honestly if this program fits you, and which plan makes sense.</p>
            <a href={BOOK_URL} className="s-btn s-btn--gold s-btn--xl" target="_blank" rel="noopener noreferrer"><CalendarIcon size={20} /> Book a free discovery call</a>
          </Reveal>
        </section>
      )}

      {!lean && (
      <section className="s-section" id="you">
        <Reveal>
          <p className="s-label">What this is really about</p>
          <h2 className="s-title">Trust yourself to find your words <em>when it matters.</em></h2>
        </Reveal>
        <div className="s-thoughts">
          {THOUGHTS.map(([icon, text, tag], i) => (
            <Reveal key={tag} delay={i * 110}>
              <figure className="s-thought">
                <span className="s-thought-tag">{tag}</span>
                <blockquote><span aria-hidden="true">{icon}</span>{text}</blockquote>
              </figure>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="s-pivot">
            <p>Nothing is wrong with you.</p>
            <strong>Communication is a skill, not a talent. And skills can be trained.</strong>
          </div>
        </Reveal>
      </section>
      )}

      {/* ── 3 · TWO TRACKS ── */}
      {!M.pillars && (
      <section className="s-section s-section--tint" id="method">
          <Reveal>
            <p className="s-label">Why it works</p>
            <h2 className="s-title">Learn the skill. <em>Then use it in your world.</em></h2>
            <p className="s-sub">Most training stops at technique. Here you also practice using it, one small step at a time.</p>
          </Reveal>
          <Reveal>
            <div className="s-tracks">
              <article className="s-track">
                <p>Track one</p>
                <h3>Technique</h3>
                <span>Build the skill</span>
                <div className="s-chips">{SKILLS.map((k) => <b key={k}>{k}</b>)}</div>
              </article>
              <div className="s-plus" aria-hidden="true">+</div>
              <article className="s-track">
                <p>Track two</p>
                <h3>Exposure</h3>
                <span>Build the confidence to use it</span>
                <div className="s-mini-stairs" aria-hidden="true">{Array.from({ length: 10 }, (_, i) => <i key={i} style={{ height: `${18 + i * 8}%` }} />)}</div>
              </article>
            </div>
            <p className="s-merge">= <b>Confident communication</b></p>
          </Reveal>
        </section>
      )}

      {/* ── 4 · HOW PRACTICE WORKS ── */}
      <section className="s-section" id="practice">
        <Reveal>
          <p className="s-label">Practice with us</p>
          <h2 className="s-title">You don't get braver by watching videos. <em>You get braver by practicing with someone beside you.</em></h2>
        </Reveal>
        <div className="s-loop-steps">
          {LOOP.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 90}>
              <article className="s-loop-step">
                <span aria-hidden="true">{icon}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                {i < LOOP.length - 1 && <i className="s-loop-arrow" aria-hidden="true">→</i>}
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="s-example">For example: rehearse your point for Monday's meeting, sharpen the structure and delivery, try it in the real meeting, then review what happened.</p>
        </Reveal>
        <Reveal>
          <ul className="s-between">
            {BETWEEN.map(([icon, text]) => <li key={text}><span aria-hidden="true">{icon}</span>{text}</li>)}
          </ul>
        </Reveal>
      </section>

      {!lean && <>{coachSec}{resultsSec}</>}

      {/* ── 8 · SIX WEEKS ── */}
      <section className="s-section" id="program">
        <Reveal>
          <p className="s-label">{M.eight ? "Your eight weeks" : "Your six weeks"}</p>
          {M.eight ? <h2 className="s-title">Two weeks of psychology. <em>Six weeks of skills you use at work.</em></h2> : <h2 className="s-title">One skill a week. <em>Used in real life that same week.</em></h2>}
          <p className="s-sub">{M.eight ? "We start with the psychology that holds shy people back, using our six-step formula. Then we build the speaking skills, and you use them in real work situations every week." : "Real-world practice begins in week 1 and continues every week."}</p>
        </Reveal>
        <div className="s-timeline">
          {weeks.map(([name, text], i) => {
            const open = openWeek === i;
            return (
              <Reveal key={name} delay={i * 70}>
                <article className={cx("s-tl", open && "s-tl--open")}>
                  <span className="s-tl-n">{i + 1}</span>
                  <button type="button" className="s-tl-body" aria-expanded={open} onClick={() => setOpenWeek(open ? -1 : i)}>
                    <span className="s-tl-head">
                      <small>Week {i + 1}</small>
                      <h3>{name}</h3>
                    </span>
                    <span className="s-tl-plus" aria-hidden="true">+</span>
                    <span className="s-tl-text"><span><span className="s-tl-p">{text}</span></span></span>
                  </button>
                </article>
              </Reveal>
            );
          })}
        </div>
        {M.eight && (
          <div className="s-formula">
            <Reveal>
              <p className="s-label">Weeks 1 and 2</p>
              <h3 className="s-formula-title">Our six-step formula to break limiting beliefs</h3>
            </Reveal>
            <div className="s-formula-grid">
              {FORMULA.map(([title, text], i) => (
                <Reveal key={title} delay={(i % 3) * 80}>
                  <article className="s-formula-card">
                    <span className="s-formula-n">{i + 1}</span>
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── 9 · YOUR WEEK ── */}
      <section className={cx("s-section", !lean && "s-section--tint", lean && "s-effort-lean")} id="effort">
        <Reveal>
          <p className="s-label">Fits your life</p>
          <h2 className="s-title">This is all it asks <em>of your week.</em></h2>
          <p className="s-sub">No long lectures. No hour-long homework.</p>
        </Reveal>
        <div className="s-bignums">
          {WEEK_LIFE.map(([n, unit, text], i) => (
            <Reveal key={unit} delay={i * 90}>
              <article className="s-bignum">
                <strong>{n}</strong>
                <h3>{unit}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── COMMUNITY ── */}
      {!lean && (
      <section className="s-section" id="crew">
        <Reveal>
          <p className="s-label">You won't practice alone</p>
          <h2 className="s-title">Online sessions. <em>Real-world connection.</em></h2>
          <p className="s-sub">Every student joins our private WhatsApp group, and we encourage members to meet in person.</p>
        </Reveal>
        <div className="s-why s-crew">
          {CREW.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 90}>
              <article className="s-why-card">
                <span aria-hidden="true">{icon}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      )}

      {/* ── PLANS ── */}
      <section className="s-section" id="plans">
        <Reveal>
          {M.holiday ? (
            <>
              <p className="s-label">Holiday season offer</p>
              <h2 className="s-title">Give yourself the gift of <em>confidence.</em></h2>
              <p className="s-sub">This holiday season, save {M.money(PRICE.oneOnOne - PRICE.oneOnOneDeal)} on 1-on-1 coaching and {M.money(PRICE.group - PRICE.groupDeal)} on group coaching.</p>
            </>
          ) : (
            <>
              <p className="s-label">Choose your plan</p>
              <h2 className="s-title">Choose how you want <em>to learn.</em></h2>
            </>
          )}
          {M.priceNote && <p className="s-sub s-price-note">{M.priceNote}</p>}
          {lean && <p className="s-sub s-plans-guar"><Check /> 4-week money-back guarantee on every plan. <a href="#guarantee">How it works</a></p>}
        </Reveal>
        <div className="s-plans">
          <Reveal>
            <article className="s-plan s-plan--featured" id="one-on-one">
              <span className="s-ribbon">MOST PERSONAL</span>
              <p className="s-plan-tag">1-ON-1 COACHING <span className="s-online">Live online</span></p>
              <h3>Private coaching with Marouane</h3>
              <p className="s-plan-desc">Every session built around you: your fears, your workplace, your goals.</p>
              <div className="s-price">
                {dealLive && <s>{M.node(PRICE.oneOnOne)}</s>}
                <strong>{M.node(oneOnOnePrice)}</strong>
                <span>one payment · {WK} weeks + 1 year of access</span>
                {usdLine(dealLive ? "oneOnOneDeal" : "oneOnOne")}
                {dealLive && <em className="s-deal">Holiday discount · you save {M.money(PRICE.oneOnOne - PRICE.oneOnOneDeal)} · limited time, ends {dealEnd.label}{dealEnd.last ? " (last day)" : ""}</em>}
              </div>
              <ul className="s-list">{ONE_ON_ONE.map((t) => <li key={t}><Check />{M.eight ? t.replace("Six private", "Eight private") : t}</li>)}</ul>
              <div className="s-bonus">
                <span className="s-bonus-ico" aria-hidden="true">🎁</span>
                <div>
                  <small>Big bonus · included free</small>
                  <strong>Weekly group coaching for a full year</strong>
                  <p>Join 1-on-1 and you also get a live group session every week for 12 months. Fifty-two more chances to practice with people on the same journey.</p>
                </div>
              </div>
              <CheckoutButton href={oneLink} onEmbed={M.embedded && embedOk ? () => setPay({ plan: "eu_one_on_one", ref: `${M.ref}one_on_one`, title: "1-on-1 coaching", price: M.money(oneOnOnePrice), fallback: oneLink }) : undefined} className="s-btn--gold" value={oneOnOnePrice} name="1-on-1 coaching" fallbackHref={CONTACT_HREF} fallbackLabel="Email us to enroll">Enroll in 1-on-1 coaching</CheckoutButton>
              <AskLink topic="1-on-1 coaching" />
            </article>
          </Reveal>
          <Reveal delay={120}>
            <article className="s-plan">
              <span className="s-ribbon s-ribbon--quiet">BEST VALUE</span>
              <p className="s-plan-tag">GROUP COACHING · MAX {GROUP_MAX} <span className="s-online">Live online</span></p>
              <h3>Small-group coaching</h3>
              <p className="s-plan-desc">Practice with real people every Sunday. Small enough that everyone speaks.</p>
              <div className="s-price">
                <s>{M.node(PRICE.group)}</s>
                <strong>{M.node(PRICE.groupDeal)}</strong>
                <span>next group · starting from <b>{M.money(PRICE.earlyBird)}</b> with early-bird for later dates · 1 year of access</span>
                {usdLine("groupDeal")}
                <em className="s-deal">You save {M.money(PRICE.group - PRICE.groupDeal)}</em>
              </div>
              <ul className="s-list">{groupItems(M).map((t) => <li key={t}><Check />{t}</li>)}</ul>
              <a className="s-btn s-btn--ghost s-btn--block" href="#dates">Pick a start date <span aria-hidden="true">↓</span></a>
              <AskLink topic="group coaching" />
              <p className="s-upsell">Want group coaching every week for a full year? <a href="#one-on-one">It comes free with 1-on-1.</a></p>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ── GROUP DATES ── */}
      <section className="s-section s-section--tint" id="dates">
        <Reveal>
          <p className="s-label">Upcoming groups</p>
          <h2 className="s-title">Book early, <em>save {M.money(PRICE.group - PRICE.earlyBird)}.</em></h2>
          <p className="s-sub">Each group meets {M.eight ? "eight" : "six"} Sundays in a row, {M.time}{M.timeNote ? ` ${M.timeNote}` : ""}. {daysToNext != null && daysToNext >= 0 && <>The next one starts in <b>{daysToNext} {daysToNext === 1 ? "day" : "days"}</b>.</>}</p>
        </Reveal>
        <div className="s-dates">
          {groups.map((g, i) => {
            const full = g.left <= 0;
            return (
              <Reveal key={g.key} delay={i * 100}>
                <article className={cx("s-date", g.early && "s-date--early", full && "s-date--full")}>
                  <div className="s-date-top">
                    <span className="s-date-badge">{i === 0 ? "NEXT GROUP" : "EARLY BIRD"}</span>
                    <div className="s-cal" aria-hidden="true">
                      <span>{fmt(g.date, { month: "short" }).toUpperCase()}</span>
                      <strong>{g.date.getDate()}</strong>
                      <em>SUN</em>
                    </div>
                  </div>
                  <h3>Starts {fmt(g.date, { weekday: "long", month: "long", day: "numeric" })}</h3>
                  <p className="s-date-meta">{WK} Sundays · {fmt(g.date, { month: "short", day: "numeric" })} – {fmt(g.end, { month: "short", day: "numeric" })}</p>
                  <p className="s-date-meta">Every Sunday · <span>{M.timeAt ? M.timeAt(g.date) : M.time}</span></p>
                  <div className="s-seats" aria-label={full ? "This group is full" : `${g.left} of ${spots.max} seats left`}>
                    <div className="s-seat-row" aria-hidden="true">
                      {Array.from({ length: spots.max }, (_, k) => <i key={k} className={k < spots.max - g.left ? "taken" : ""} />)}
                    </div>
                    <span>{full ? "Full" : g.left === spots.max ? (M.eight ? "Max " + spots.max + " people" : `${spots.max} seats available`) : `Only ${g.left} of ${spots.max} seats left`}</span>
                  </div>
                  <div className="s-date-price">
                    <s>{M.node(PRICE.group)}</s>
                    <strong>{M.node(g.price)}</strong>
                    <span>Save {M.money(PRICE.group - g.price)}</span>
                    {usdLine(g.early ? "earlyBird" : "groupDeal")}
                  </div>
                  {full ? (
                    <span className="s-btn s-btn--disabled s-btn--block">Group full</span>
                  ) : (
                    g.early && !g.link ? (
                      <button type="button" className="s-btn s-btn--ghost s-btn--block" onClick={() => setWaitFor(g)}>
                        Join the waiting list <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <CheckoutButton href={g.link} onEmbed={M.embedded && embedOk ? () => setPay({ plan: g.early ? "eu_early_bird" : "eu_group", ref: `${M.ref}${g.early ? "early" : "group"}_${g.key}`, title: `Group coaching · starts ${fmt(g.date, { month: "long", day: "numeric" })}`, price: M.money(g.price), fallback: g.link }) : undefined} className="s-btn--gold" value={g.price} name={`Group ${g.key}`} fallbackHref={CONTACT_HREF} fallbackLabel="Email us to reserve">{g.early ? "Reserve my early-bird seat" : "Reserve my seat"}</CheckoutButton>
                    )
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
        <Reveal><p className="s-note">New groups open twice a month: the first Sunday and mid-month.</p></Reveal>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="s-section" id="guarantee">
        <Reveal>
          <p className="s-label">Zero risk</p>
          <h2 className="s-title">The 4-week <em>"feel the change"</em> guarantee</h2>
        </Reveal>
        <div className="s-offer">
          <Reveal>
            <div className="s-seal" aria-hidden="true">
              <svg viewBox="0 0 200 200">
                <defs><path id="sealpath" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0" /></defs>
                <circle cx="100" cy="100" r="96" className="s-seal-ring" />
                <circle cx="100" cy="100" r="58" className="s-seal-core" />
                <text textLength="458" lengthAdjust="spacingAndGlyphs"><textPath href="#sealpath" startOffset="0" textLength="458" lengthAdjust="spacingAndGlyphs">MONEY-BACK GUARANTEE · MONEY-BACK GUARANTEE · </textPath></text>
              </svg>
              <div className="s-seal-mid"><strong>4</strong><span>WEEKS</span></div>
            </div>
          </Reveal>
          <div className="s-offer-items">
            <Reveal>
              <article className="s-offer-item">
                <h3>How it works</h3>
                <ul className="s-guar">
                  <li><Check />You show up to your sessions</li>
                  <li><Check />You do the practice in the community</li>
                  <li><Check />After 4 weeks, you don't feel the change in your influence as a communicator</li>
                </ul>
                <p className="s-guar-end">Then you get your money back. <b>No questions asked.</b></p>
              </article>
            </Reveal>
            <Reveal delay={90}>
              <article className="s-offer-item">
                <h3>Upgrade without losing a cent</h3>
                <p>Start in a group. If you want private coaching later, everything you paid counts toward 1-on-1.</p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="s-section s-section--tint" id="faq">
        <Reveal>
          <p className="s-label">Still deciding?</p>
          <h2 className="s-title">Questions, <em>answered.</em></h2>
        </Reveal>
        <div className="s-faq-list">
          {[
            ["Is this in person or online?", "It's fully online. Every session is live on video, so you can join from anywhere. You practice with us in the session, then use it in your own meetings and conversations. And you are not on your own: members stay connected in our WhatsApp group, and we encourage in-person meetups."],
            ["1-on-1 or group: which should I choose?", `Choose 1-on-1 if you want every session built around your exact situation and schedule. Choose the group if you'd like to practice with real people and keep the investment lower. Both follow the same ${M.eight ? "8" : "6"}-week plan, and you can upgrade later with everything you paid counting toward it.`],
            ["Why pay for coaching when AI can help?", "In Speaker's Gym the app gives you daily reps, including AI feedback. The coaching adds a person who knows you, notices your progress, adjusts your plan and talks through what happened in your real meeting."],
            ["I prefer in-person coaching because it feels more immersive.", "Our sessions are live and interactive. And the most immersive practice is your own life. You take what we rehearse into your real meetings and conversations, then we review how it went."],
            ["How big are the groups?", `Never more than ${GROUP_MAX} people, so everyone speaks and gets feedback in every session.`],
            ["When do the group sessions happen?", `Every Sunday from ${M.timeLong}${M.timeNote ? ` ${M.timeNote}` : ""}, for ${M.eight ? "eight" : "six"} weeks in a row. New groups start on the first Sunday of the month and around the 15th.`],
            ["How much time do I need between sessions?", "About 10 to 15 minutes a day for your speaking rep in the app, plus one manageable real-world step each week."],
            ["How does the guarantee work?", "Show up to your sessions and do the practice in the community. If after 4 weeks you don't feel the change in your influence as a communicator, you get your money back, no questions asked."],
            [`What happens after the ${M.eight ? "eight" : "six"} weeks?`, "You keep one year of access. With 1-on-1 that includes the Speaker's Gym app, the community and WhatsApp group, the MOUN Academy course, your private portal and weekly group coaching. With the group plan you keep the app, the community and the WhatsApp group."],
            ["When can I start?", "You get access to the app right after joining. For 1-on-1, we'll contact you personally to schedule your first session. For groups, you start on the date you chose."],
            ...(M.extraFaq ? [M.extraFaq] : []),
          ].filter(([q]) => !(lean && (q === "How big are the groups?" || q === "When do the group sessions happen?" || q === "When can I start?"))).map(([q, a]) => <Reveal key={q}><FAQ q={q} a={a} /></Reveal>)}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="s-final" id="contact">
        <Reveal>
          <p className="s-label">Contact us</p>
          {lean ? <h2>Ready to speak up? <em>Book a free discovery call.</em></h2> : <h2>Want to know more? <em>Send us a message.</em></h2>}
          <p>Ask us anything about the program, the dates or which plan fits you best. We answer within <b>24 hours</b>. If you'd like, we can book a quick discovery call.</p>
          <div className="s-hero-btns">
            {M.contact === "call" ? (
              <>
                <a href={BOOK_URL} className="s-btn s-btn--gold s-btn--wa" target="_blank" rel="noopener noreferrer"><CalendarIcon /> Book a free call</a>
                <a href={CONTACT_HREF} className="s-btn s-btn--ghost">Email us</a>
              </>
            ) : (
              <>
                <a href={CONTACT_HREF} className="s-btn s-btn--gold">Email us</a>
                <a href={WHATSAPP_URL} className="s-btn s-btn--ghost s-btn--wa" target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> WhatsApp us</a>
              </>
            )}
          </div>
          <p className="s-final-small">{CONTACT_EMAIL}{M.contact !== "call" && <> <i aria-hidden="true">·</i> WhatsApp {WHATSAPP_NUMBER}</>}</p>
        </Reveal>
      </section>

      <SiteFooter />

      {pay && <PayModal pay={pay} onClose={() => setPay(null)} />}
      {waitFor && <WaitlistModal group={waitFor} onClose={() => setWaitFor(null)} />}

      {M.contact === "call" ? (
        <a href={BOOK_URL} className="s-call-float" aria-label="Book a free call" target="_blank" rel="noopener noreferrer">
          <CalendarIcon size={22} />
          <span>Book a call</span>
        </a>
      ) : (
        <a href={WHATSAPP_URL} className="s-wa-float" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">
          <WhatsAppIcon size={30} />
          <span>Chat with us</span>
        </a>
      )}

      {lean
        ? <a href={BOOK_URL} className="s-sticky" target="_blank" rel="noopener noreferrer">Book a free discovery call <span aria-hidden="true">→</span></a>
        : <a href="#plans" className="s-sticky">See plans and dates <span aria-hidden="true">→</span></a>}
    </div>
  );
}

export default function SalesPage({ market = "usd" }) {
  return (
    <MarketContext.Provider value={MARKETS[market] || MARKETS.usd}>
      <SalesContent />
    </MarketContext.Provider>
  );
}
