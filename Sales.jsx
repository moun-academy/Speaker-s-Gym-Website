import { useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter, SiteHeader } from "./SiteChrome.jsx";
import { COMMUNITY_URL } from "./siteConfig.js";
import marouanePhoto from "./Marouane.png";
import "./Sales.css";

/* ─── Checkout links: paste the Stripe Payment Links here ───
   While a link is empty, its button shows "Checkout opens soon" and can't be clicked.
   Early-bird groups sell through CHECKOUT.earlyBird; if that link is empty they open the waiting list form. */
const CHECKOUT = {
  oneOnOne: "https://buy.stripe.com/6oU14n5lb3Fz6Sb6yR1ck03", // $197 special price, until the deal ends
  oneOnOneFull: "", // paste a $250 Stripe link here for after the deal; while empty, the button emails Marouane
  group: "https://buy.stripe.com/7sY00jbJz0tndgz0at1ck05", // $129 · next group
  earlyBird: "https://buy.stripe.com/cNi3cvfZPb81ccv3mF1ck07", // $97 · later groups. While empty, early-bird cards open the waiting list form.
};

const PRICE = { oneOnOne: 250, oneOnOneDeal: 197, group: 149, groupDeal: 129, earlyBird: 97 };
/* The 1-on-1 special price ends at the end of October 31, Dubai time (GMT+4). */
const DEAL_END = Date.UTC(2026, 9, 31, 19, 59, 59);
const GROUP_MAX = 5;
const GROUPS_SHOWN = 3;        // next group + two early-bird groups
const CONTACT_EMAIL = "marouane@speakers-gym.com";
const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Question about The Speaker's Gym")}&body=${encodeURIComponent("Hi Marouane,\n\nMy name is \nI'm interested in: 1-on-1 coaching / group coaching\nWhat I'd like to improve: \n\nThank you!")}`;
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

function trackCheckout(value, name) {
  try { window.fbq?.("track", "InitiateCheckout", { value, currency: "USD", content_name: name }); } catch (e) { /* ignore */ }
  try { window.gtag?.("event", "begin_checkout", { value, currency: "USD", items: [{ item_name: name }] }); } catch (e) { /* ignore */ }
}

function CheckoutButton({ href, className, value, name, children, fallbackHref, fallbackLabel }) {
  if (!href && fallbackHref) {
    return <a className={cx("s-btn s-btn--block", className)} href={fallbackHref}>{fallbackLabel} <span aria-hidden="true">→</span></a>;
  }
  if (!href) {
    return <span className={cx("s-btn s-btn--block s-btn--soon", className)} aria-disabled="true">Checkout opens soon</span>;
  }
  return (
    <a className={cx("s-btn s-btn--block", className)} href={href} target="_blank" rel="noopener" onClick={() => trackCheckout(value, name)}>
      {children} <span aria-hidden="true">→</span>
    </a>
  );
}

/* ─── Waiting list form (early-bird groups) ─── */
function WaitlistModal({ group, onClose }) {
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
            <p>We've saved your spot on the waiting list for the group starting <b>{when}</b>, at the early-bird price of <b>${PRICE.earlyBird}</b>. We'll be in touch before enrollment opens.</p>
            <button type="button" className="s-btn s-btn--gold s-btn--block" onClick={onClose}>Done</button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <p className="s-modal-kicker">EARLY BIRD · ${PRICE.earlyBird}</p>
            <h3 id="wl-title">Join the waiting list</h3>
            <p className="s-modal-sub">Group starting <b>{when}</b>. Six Sundays, 12–1 pm GMT, max {GROUP_MAX} people.</p>
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
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    if (!ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={cx("s-reveal", on && "s-reveal--in", className)} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function Pull({ name }) {
  const v = VIDEOS.find((x) => x[1] === name);
  if (!v) return null;
  const [, who, role, quote] = v;
  return (
    <figure className="s-pull">
      <blockquote>“{quote}”</blockquote>
      <figcaption><b>{who}</b>{role && <span>{role}</span>}</figcaption>
    </figure>
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
  "Six private 60-minute sessions with Marouane",
  "Personalized roadmap and exposure plan",
  "1 year of weekly group coaching, included",
  "1 year of the Speaker's Gym app with AI feedback",
  "1 year in the community + private WhatsApp group",
  "1 year of the MOUN Academy full course (3 hours)",
  "Your own private portal and progress tracking",
  "Bonus: The Conversation Playbook",
];

const GROUP = [
  "Six live group sessions, Sundays 12–1 pm GMT (4–5 pm GMT+4)",
  `Maximum ${GROUP_MAX} people, so you speak every session`,
  "The same 6-week plan as 1-on-1",
  "1 year of the Speaker's Gym app with AI feedback",
  "1 year in the community + private WhatsApp group",
];

const THOUGHTS = [
  ["💭", "I know the answer. Why won't my words come out?", "Nerves"],
  ["🌀", "I rehearse it in my head, then stay quiet.", "Overthinking"],
  ["🎢", "I start well, then ramble and lose my point.", "Rambling"],
];

const SKILLS = ["Structure", "Volume", "Pace", "Pauses", "Pitch", "Storytelling"];

const LEVELS = [
  ["Become Visible", "Initiate one greeting and maintain eye contact."],
  ["Initiate", "Start one short conversation at work."],
  ["Participate", "Give one structured answer when someone asks for your opinion."],
  ["Volunteer", "Contribute once before someone calls on you."],
  ["Hold the Floor", "Deliver one complete PREP answer without rushing."],
  ["Disagree Respectfully", "Express one respectful disagreement using PREP."],
  ["Lead a Moment", "Lead one small moment during a meeting or conversation."],
  ["Speak Under Pressure", "Answer one unexpected question without escaping or rushing."],
  ["Influence", "Present one recommendation and explain why it matters."],
  ["Full Expression", "Express an idea without hiding your personality."],
];

const LOOP = [
  ["🎤", "Rehearse", "Practice out loud with me"],
  ["🏢", "Try it for real", "In your meeting or conversation"],
  ["🔍", "Review", "See what worked"],
  ["🔁", "Repeat", "Each time, a little easier"],
];

const BETWEEN = [
  ["📱", "Daily reps in the app, with AI feedback"],
  ["💬", "Feedback from me in the community"],
  ["📊", "Progress tracking, so you always know where you stand"],
];

const WEEK_QUOTES = { 0: "Vivek", 4: "Avinash" };

const WEEKS = [
  ["Organize Your Thoughts with PREP", "Structure your ideas clearly, answer with confidence and stop rambling under pressure."],
  ["Make Your Voice Heard", "Develop stronger volume and speak clearly without forcing or straining your voice."],
  ["Take Control of Your Pace", "Slow down, stay composed and respond spontaneously without rushing."],
  ["Pause, Think and Own the Silence", "Give yourself time to think and use intentional silence instead of filler words."],
  ["Find the Music in Your Voice", "Mix pitch with pace and volume so people hear how you feel."],
  ["Tell Stories That Move People", "Combine every skill and tell a story that drives your point home."],
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

export default function SalesPage() {
  const [spots, setSpots] = useState({ max: GROUP_MAX, taken: {}, full: [] });
  const [waitFor, setWaitFor] = useState(null);
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const prev = document.title;
    document.title = "Join The Speaker's Gym | 1-on-1 or Group Coaching";
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
          end: addDays(d, 35),
          link: withRef(early ? CHECKOUT.earlyBird : CHECKOUT.group, `${early ? "early" : "group"}_${key}`),
        };
      });
  }, [spots]);

  const next = groups[0];
  const daysToNext = next ? Math.round((next.date - new Date(new Date().toDateString())) / 86400000) : null;
  const dealMsLeft = DEAL_END - Date.now();
  const dealLive = dealMsLeft > 0;
  const dealDays = Math.ceil(dealMsLeft / 86400000);
  const oneOnOnePrice = dealLive ? PRICE.oneOnOneDeal : PRICE.oneOnOne;
  const oneLink = withRef(dealLive ? CHECKOUT.oneOnOne : CHECKOUT.oneOnOneFull, "one_on_one");

  return (
    <div className="sales-page">
      <SiteHeader page="sales" />

      {/* ── 1 · HERO ── */}
      <header className="s-hero">
        <div className="s-hero-glow" aria-hidden="true" />
        <div className="s-wave" aria-hidden="true">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ "--i": i }} />)}</div>
        <Reveal><p className="s-kicker"><span className="s-dot" aria-hidden="true" />Enrollment open</p></Reveal>
        <Reveal delay={80}><h1>Speak up in <em>meetings and conversations.</em></h1></Reveal>
        <Reveal delay={160}>
          <p className="s-hero-sub">Explain your ideas <mark>clearly</mark> and bring them to life with an <mark>engaging voice</mark>, <span className="s-hero-sub-end">even when you feel nervous.</span></p>
        </Reveal>
        <Reveal delay={240}>
          <div className="s-transforms">
            {[["Rambling", "Articulate"], ["Monotone", "Expressive"], ["Shy", "Confident"]].map(([a, b]) => (
              <span key={a}><s>{a}</s><i aria-hidden="true">→</i><b>{b}</b></span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={300}>
          <div className="s-hero-btns">
            <a href="#plans" className="s-btn s-btn--gold">See the plans</a>
            {next && <a href="#plans" className="s-btn s-btn--ghost">Next group: {fmt(next.date, { weekday: "short", month: "short", day: "numeric" })}</a>}
          </div>
        </Reveal>
        <Reveal delay={360}>
          <ul className="s-assure">
            <li><Check />4-week money-back guarantee</li>
            <li><Check />1 year of access included</li>
          </ul>
        </Reveal>
      </header>

      {/* ── 2 · IS THIS FOR ME ── */}
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
        <Reveal><Pull name="Imane" /></Reveal>
      </section>

      {/* ── 3 · TWO TRACKS ── */}
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
        <Reveal><Pull name="Kevin" /></Reveal>
      </section>

      {/* ── 4 · HOW PRACTICE WORKS ── */}
      <section className="s-section" id="practice">
        <Reveal>
          <p className="s-label">Practice with me</p>
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
        <Reveal><Pull name="Marisol" /></Reveal>
      </section>

      {/* ── 5 · COACH ── */}
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
              <Pull name="Seta" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── 6 · EXPOSURE LADDER ── */}
      <section className="s-section" id="ladder">
        <Reveal>
          <p className="s-label">At your pace</p>
          <h2 className="s-title">One level at a time. <em>Never a leap.</em></h2>
          <p className="s-sub">Tap a level to see what a real step looks like.</p>
        </Reveal>
        <Reveal>
          <div className="s-ladder" role="tablist" aria-label="Exposure levels">
            {LEVELS.map(([name], i) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={level === i}
                className={cx("s-rung", i <= level && "s-rung--reached", level === i && "s-rung--on")}
                style={{ height: `${16 + i * 9}%` }}
                onClick={() => setLevel(i)}
              >
                <b>{i + 1}</b>
              </button>
            ))}
          </div>
          <div className="s-level-card" aria-live="polite" key={level}>
            <small>Level {level + 1}</small>
            <h3>{LEVELS[level][0]}</h3>
            <p>Your mission: {LEVELS[level][1]}</p>
          </div>
          <p className="s-ladder-note">Level 10 does not mean becoming loud or extroverted. It means having the freedom to express yourself fully when you choose.</p>
        </Reveal>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="s-section s-section--tint" id="results">
        <Reveal>
          <p className="s-label">Results</p>
          <h2 className="s-title">Don't take my word for it. <em>Take theirs.</em></h2>
          <p className="s-sub">Real students, in their own words.</p>
        </Reveal>
        <div className="s-videos">
          {VIDEOS.map(([id, name, role, quote], i) => (
            <Reveal key={id} delay={i * 100}>
              <figure className="s-video">
                <div className="s-embed">
                  <iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`} title={`${name}'s testimonial`} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
                <figcaption>
                  <blockquote>“{quote}”</blockquote>
                  <cite><b>{name}</b>{role && <span>{role}</span>}</cite>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 8 · SIX WEEKS ── */}
      <section className="s-section" id="program">
        <Reveal>
          <p className="s-label">Your six weeks</p>
          <h2 className="s-title">One skill a week. <em>Used in real life that same week.</em></h2>
          <p className="s-sub">Real-world practice begins in week 1 and continues every week.</p>
        </Reveal>
        <div className="s-timeline">
          {WEEKS.map(([name, text], i) => (
            <Reveal key={name} delay={i * 70}>
              <article className="s-tl">
                <span className="s-tl-n">{i + 1}</span>
                <div>
                  <small>Week {i + 1}</small>
                  <h3>{name}</h3>
                  <p>{text}</p>
                  {WEEK_QUOTES[i] && <Pull name={WEEK_QUOTES[i]} />}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 9 · YOUR WEEK ── */}
      <section className="s-section s-section--tint" id="effort">
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

      {/* ── PLANS ── */}
      <section className="s-section" id="plans">
        <Reveal>
          <p className="s-label">Choose your plan</p>
          <h2 className="s-title">Choose how you want <em>to learn.</em></h2>
        </Reveal>
        <div className="s-plans">
          <Reveal>
            <article className="s-plan s-plan--featured">
              <span className="s-ribbon">MOST PERSONAL</span>
              <p className="s-plan-tag">1-ON-1 COACHING</p>
              <h3>Private coaching with Marouane</h3>
              <p className="s-plan-desc">Every session built around you: your fears, your workplace, your goals.</p>
              <div className="s-price">
                {dealLive && <s>${PRICE.oneOnOne}</s>}
                <strong>${oneOnOnePrice}</strong>
                <span>one payment · 6 weeks + 1 year of access</span>
                {dealLive && <em className="s-deal">Special price · ends October 31 · {dealDays <= 1 ? "last day" : `${dealDays} days left`}</em>}
              </div>
              <ul className="s-list">{ONE_ON_ONE.map((t) => <li key={t}><Check />{t}</li>)}</ul>
              <CheckoutButton href={oneLink} className="s-btn--gold" value={oneOnOnePrice} name="1-on-1 coaching" fallbackHref={CONTACT_HREF} fallbackLabel="Email me to enroll">Enroll in 1-on-1 coaching</CheckoutButton>
            </article>
          </Reveal>
          <Reveal delay={120}>
            <article className="s-plan">
              <span className="s-ribbon s-ribbon--quiet">BEST VALUE</span>
              <p className="s-plan-tag">GROUP COACHING · MAX {GROUP_MAX}</p>
              <h3>Small-group coaching</h3>
              <p className="s-plan-desc">Practise with real people every Sunday. Small enough that everyone speaks.</p>
              <div className="s-price">
                <s>${PRICE.group}</s>
                <strong>${PRICE.groupDeal}</strong>
                <span>next group · or <b>${PRICE.earlyBird}</b> early-bird for later dates · 1 year of access</span>
              </div>
              <ul className="s-list">{GROUP.map((t) => <li key={t}><Check />{t}</li>)}</ul>
              <a className="s-btn s-btn--ghost s-btn--block" href="#dates">Pick a start date <span aria-hidden="true">↓</span></a>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ── GROUP DATES ── */}
      <section className="s-section s-section--tint" id="dates">
        <Reveal>
          <p className="s-label">Upcoming groups</p>
          <h2 className="s-title">Book early, <em>save ${PRICE.group - PRICE.earlyBird}.</em></h2>
          <p className="s-sub">Each group meets six Sundays in a row, 12–1 pm GMT (4–5 pm GMT+4). {daysToNext != null && daysToNext >= 0 && <>The next one starts in <b>{daysToNext} {daysToNext === 1 ? "day" : "days"}</b>.</>}</p>
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
                  <p className="s-date-meta">6 Sundays · {fmt(g.date, { month: "short", day: "numeric" })} – {fmt(g.end, { month: "short", day: "numeric" })}</p>
                  <p className="s-date-meta">Every Sunday · <span>12–1 pm GMT (4–5 pm GMT+4)</span></p>
                  <div className="s-seats" aria-label={full ? "This group is full" : `${g.left} of ${spots.max} seats left`}>
                    <div className="s-seat-row" aria-hidden="true">
                      {Array.from({ length: spots.max }, (_, k) => <i key={k} className={k < spots.max - g.left ? "taken" : ""} />)}
                    </div>
                    <span>{full ? "Full" : g.left === spots.max ? `${spots.max} seats available` : `Only ${g.left} of ${spots.max} seats left`}</span>
                  </div>
                  <div className="s-date-price">
                    <s>${PRICE.group}</s>
                    <strong>${g.price}</strong>
                    <span>Save ${PRICE.group - g.price}</span>
                  </div>
                  {full ? (
                    <span className="s-btn s-btn--disabled s-btn--block">Group full</span>
                  ) : (
                    g.early && !g.link ? (
                      <button type="button" className="s-btn s-btn--ghost s-btn--block" onClick={() => setWaitFor(g)}>
                        Join the waiting list <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <CheckoutButton href={g.link} className="s-btn--gold" value={g.price} name={`Group ${g.key}`}>{g.early ? "Reserve my early-bird seat" : "Reserve my seat"}</CheckoutButton>
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
            ["1-on-1 or group: which should I choose?", "Choose 1-on-1 if you want every session built around your exact situation and schedule. Choose the group if you'd like to practice with real people and keep the investment lower. Both follow the same 6-week plan, and you can upgrade later with everything you paid counting toward it."],
            ["Why pay for coaching when AI can help?", "In Speaker's Gym the app gives you daily reps, including AI feedback. The coaching adds a person who knows you, notices your progress, adjusts your plan and talks through what happened in your real meeting."],
            ["I prefer in-person coaching because it feels more immersive.", "Our sessions are live and interactive. And the most immersive practice is your own life. You take what we rehearse into your real meetings and conversations, then we review how it went."],
            ["How big are the groups?", `Never more than ${GROUP_MAX} people, so everyone speaks and gets feedback in every session.`],
            ["When do the group sessions happen?", "Every Sunday from 12 to 1 pm GMT (4 to 5 pm GMT+4), for six weeks in a row. New groups start on the first Sunday of the month and around the 15th."],
            ["How much time do I need between sessions?", "About 10 to 15 minutes a day for your speaking rep in the app, plus one manageable real-world step each week."],
            ["How does the guarantee work?", "Show up to your sessions and do the practice in the community. If after 4 weeks you don't feel the change in your influence as a communicator, you get your money back, no questions asked."],
            ["What happens after the six weeks?", "You keep one year of access. With 1-on-1 that includes the Speaker's Gym app, the community and WhatsApp group, the MOUN Academy course, your private portal and weekly group coaching. With the group plan you keep the app, the community and the WhatsApp group."],
            ["When can I start?", "You get access to the app right after joining. For 1-on-1, I'll contact you personally to schedule your first session. For groups, you start on the date you chose."],
          ].map(([q, a]) => <Reveal key={q}><FAQ q={q} a={a} /></Reveal>)}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="s-final" id="contact">
        <Reveal>
          <p className="s-label">Contact me</p>
          <h2>Want to know more? <em>Send me an email.</em></h2>
          <p>Ask me anything about the program, the dates or which plan fits you best. I answer within <b>24 hours</b>. If you'd like, we can book a quick call.</p>
          <div className="s-hero-btns">
            <a href={CONTACT_HREF} className="s-btn s-btn--gold">Email Marouane</a>
          </div>
          <p className="s-final-small">{CONTACT_EMAIL}</p>
          <p className="s-final-small">Prefer to start free? <a href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer">Join the free community</a>.</p>
        </Reveal>
      </section>

      <SiteFooter />

      {waitFor && <WaitlistModal group={waitFor} onClose={() => setWaitFor(null)} />}

      <a href="#plans" className="s-sticky">See plans and dates <span aria-hidden="true">→</span></a>
    </div>
  );
}
