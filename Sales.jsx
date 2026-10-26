import { useEffect, useMemo, useRef, useState } from "react";
import { SiteFooter, SiteHeader } from "./SiteChrome.jsx";
import { COMMUNITY_URL } from "./siteConfig.js";
import "./Sales.css";

/* ─── Checkout links: paste the Stripe Payment Links here ───
   While a link is empty, its button shows "Checkout opens soon" and can't be clicked.
   Early-bird groups don't sell yet: their button opens the waiting list form. */
const CHECKOUT = {
  oneOnOne: "", // $250 · 6 weeks of private coaching. While empty, the button emails Marouane instead.
  group: "https://buy.stripe.com/7sY00jbJz0tndgz0at1ck05", // $129 · next group
};

const PRICE = { oneOnOne: 250, group: 129, earlyBird: 97 };
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

const WHY_POINTS = [
  ["🎯", "Live coaching that fits your real situations", "Your meetings, your conversations, your goals. We rehearse the real thing."],
  ["🤝", "Small group practice", `Speak with a few others on the same journey, so you are never practicing alone.`],
  ["📈", "Real-world challenges that grow at your pace", "Ten levels, from low pressure to the moments that matter most to you."],
];

const LOOP = ["Rehearse", "Try it for real", "Review", "Repeat"];

const OBJECTIONS = [
  ["Why pay for coaching when AI can help?", "In Speaker's Gym the app gives you daily reps, including AI feedback. The coaching adds a person who knows you, notices your progress, adjusts your plan, and talks through what happened in your real meeting."],
  ["I prefer in-person coaching because it feels more immersive.", "Our sessions are live and interactive. And the most immersive practice is your own life. You take what we rehearse into your real meetings and conversations, then we review how it went."],
];

const EFFORT = [
  ["☕", "10 to 15 minutes a day", "Your daily speaking rep in the app. Do it with your morning coffee."],
  ["🗓️", "One live hour a week", "Sundays for the group, or a time that suits you for 1-on-1."],
  ["🪜", "One real-world challenge a week", "Small, manageable, and chosen at your level."],
];

const WEEKS = [
  ["Structure & Prep", "Organize your thoughts with PREP"],
  ["Volume & Presence", "Make your voice heard"],
  ["Pace", "Take control of your pace"],
  ["Silence & Composure", "Pause, think and own the silence"],
  ["Pitch & Vocal Variety", "Find the music in your voice"],
  ["Storytelling", "Tell stories that move people"],
];

const VIDEOS = [["AmX2dVv8qcM", "Imane"], ["cm3G7biEwHI", "Vivek"], ["Kctzf04s41c", "Kevin"], ["QzFvN_5MPWI", "Seta"], ["fiyvwTk2Iq4", "Marisol"], ["XQ5x8_tnI7M", "Avinash"]];

export default function SalesPage() {
  const [spots, setSpots] = useState({ max: GROUP_MAX, taken: {}, full: [] });
  const [waitFor, setWaitFor] = useState(null);

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
          price: early ? PRICE.earlyBird : PRICE.group,
          end: addDays(d, 35),
          link: early ? "" : withRef(CHECKOUT.group, `group_${key}`),
        };
      });
  }, [spots]);

  const next = groups[0];
  const daysToNext = next ? Math.round((next.date - new Date(new Date().toDateString())) / 86400000) : null;
  const oneLink = withRef(CHECKOUT.oneOnOne, "one_on_one");

  return (
    <div className="sales-page">
      <SiteHeader page="sales" />

      {/* ── HERO · DREAM OUTCOME ── */}
      <header className="s-hero">
        <div className="s-hero-glow" aria-hidden="true" />
        <Reveal><p className="s-kicker"><span className="s-dot" aria-hidden="true" />Enrollment open</p></Reveal>
        <Reveal delay={80}><h1>Trust yourself to find your words <em>when it matters.</em></h1></Reveal>
        <Reveal delay={160}>
          <p className="s-hero-sub">Speak up in meetings and conversations, explain your ideas clearly, and bring them to life with an engaging voice, even when you feel nervous.</p>
        </Reveal>
        <Reveal delay={200}>
          <p className="s-hero-for">A six-week program for shy and nervous professionals. Private 1-on-1 coaching or a small group of {GROUP_MAX}.</p>
        </Reveal>
        <Reveal delay={240}>
          <div className="s-transforms">
            {[["Rambling", "Articulate"], ["Monotone", "Expressive"], ["Shy", "Confident"]].map(([a, b]) => (
              <span key={a}><s>{a}</s><i aria-hidden="true">→</i><b>{b}</b></span>
            ))}
          </div>
        </Reveal>
        <Reveal delay={280}>
          <div className="s-hero-btns">
            <a href="#plans" className="s-btn s-btn--gold">Choose your plan</a>
            {next && <a href="#dates" className="s-btn s-btn--ghost">Next group: {fmt(next.date, { weekday: "short", month: "short", day: "numeric" })}</a>}
          </div>
        </Reveal>
        <Reveal delay={340}>
          <ul className="s-assure">
            <li><Check />Money-back guarantee</li>
            <li><Check />1 year of access included</li>
            <li><Check />Start this week</li>
          </ul>
        </Reveal>
      </header>

      {/* ── WHY IT WORKS · LIKELIHOOD ── */}
      <section className="s-section" id="why">
        <Reveal>
          <p className="s-label">Why it works</p>
          <h2 className="s-title">You don't get braver by watching videos. <em>You get braver by practicing with someone beside you.</em></h2>
          <p className="s-sub">In Speaker's Gym you rehearse out loud with me, then take it into your real world. Maybe a point in Monday's meeting, or an idea you have been holding back. We prepare it together, you try it, and we look at what happened.</p>
        </Reveal>
        <div className="s-why">
          {WHY_POINTS.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 90}>
              <article className="s-why-card">
                <span aria-hidden="true">{icon}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="s-loop" aria-label="The practice loop">
            {LOOP.map((t, i) => <span key={t}>{t}{i < LOOP.length - 1 && <i aria-hidden="true">→</i>}</span>)}
          </div>
          <p className="s-loop-note">For example: rehearse a meeting contribution, improve the structure and delivery, try it in a real meeting, then review what happened.</p>
        </Reveal>
        <Reveal>
          <p className="s-wonder-title">You might be wondering</p>
        </Reveal>
        <div className="s-wonder">
          {OBJECTIONS.map(([q, a], i) => (
            <Reveal key={q} delay={i * 90}>
              <article className="s-offer-item">
                <h3>{q}</h3>
                <p>{a}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="s-section" id="testimonials">
        <Reveal>
          <p className="s-label">Real people, in their own words</p>
          <h2 className="s-title">Don't take my word for it. <em>Take theirs.</em></h2>
          <p className="s-sub">Professionals who were nervous, rambled or went quiet, in their own words after The Speaker's Gym.</p>
        </Reveal>
        <div className="s-videos">
          {VIDEOS.map(([id, name], i) => (
            <Reveal key={id} delay={i * 100}>
              <article className="s-video">
                <div className="s-embed">
                  <iframe src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`} title={`${name}'s testimonial`} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                </div>
                <p>{name}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── THE PLAN · TIME DELAY ── */}
      <section className="s-section s-section--tint" id="program">
        <Reveal>
          <p className="s-label">The 6-week plan</p>
          <h2 className="s-title">One skill a week. <em>Use it the same week.</em></h2>
          <p className="s-sub">Both plans follow the same roadmap. Each week you learn one skill, then try it in a real situation, so you feel the change as you go.</p>
        </Reveal>
        <div className="s-weeks">
          {WEEKS.map(([theme, name], i) => (
            <Reveal key={theme} delay={i * 70}>
              <article className="s-week">
                <span className="s-week-n">0{i + 1}</span>
                <p>{theme}</p>
                <h3>{name}</h3>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── EFFORT AND SACRIFICE ── */}
      <section className="s-section" id="effort">
        <Reveal>
          <p className="s-label">Easy to fit in</p>
          <h2 className="s-title">Small effort. <em>Real change.</em></h2>
          <p className="s-sub">No long lectures. No hour-long homework. Just a few minutes a day and one live hour a week.</p>
        </Reveal>
        <div className="s-weeks s-effort">
          {EFFORT.map(([icon, title, text], i) => (
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

      {/* ── PLANS ── */}
      <section className="s-section" id="plans">
        <Reveal>
          <p className="s-label">Choose your plan</p>
          <h2 className="s-title">Two ways in. <em>One outcome.</em></h2>
        </Reveal>
        <div className="s-plans">
          <Reveal>
            <article className="s-plan s-plan--featured">
              <span className="s-ribbon">MOST PERSONAL</span>
              <p className="s-plan-tag">1-ON-1 COACHING</p>
              <h3>Private coaching with Marouane</h3>
              <p className="s-plan-desc">Every session built around you: your fears, your workplace, your goals.</p>
              <div className="s-price"><strong>${PRICE.oneOnOne}</strong><span>one payment · 6 weeks + 1 year of access</span></div>
              <ul className="s-list">{ONE_ON_ONE.map((t) => <li key={t}><Check />{t}</li>)}</ul>
              <CheckoutButton href={oneLink} className="s-btn--gold" value={PRICE.oneOnOne} name="1-on-1 coaching" fallbackHref={CONTACT_HREF} fallbackLabel="Email me to enroll">Enroll in 1-on-1 coaching</CheckoutButton>
            </article>
          </Reveal>
          <Reveal delay={120}>
            <article className="s-plan">
              <span className="s-ribbon s-ribbon--quiet">BEST VALUE</span>
              <p className="s-plan-tag">GROUP COACHING · MAX {GROUP_MAX}</p>
              <h3>Small-group coaching</h3>
              <p className="s-plan-desc">Practise with real people every Sunday. Small enough that everyone speaks.</p>
              <div className="s-price"><strong>${PRICE.group}</strong><span>next group · or <b>${PRICE.earlyBird}</b> early-bird for later dates · 1 year of access</span></div>
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
                    {g.early && <s>${PRICE.group}</s>}
                    <strong>${g.price}</strong>
                    {g.early && <span>Save ${PRICE.group - PRICE.earlyBird}</span>}
                  </div>
                  {full ? (
                    <span className="s-btn s-btn--disabled s-btn--block">Group full</span>
                  ) : (
                    g.early ? (
                      <button type="button" className="s-btn s-btn--ghost s-btn--block" onClick={() => setWaitFor(g)}>
                        Join the waiting list <span aria-hidden="true">→</span>
                      </button>
                    ) : (
                      <CheckoutButton href={g.link} className="s-btn--gold" value={g.price} name={`Group ${g.key}`}>Reserve my seat</CheckoutButton>
                    )
                  )}
                </article>
              </Reveal>
            );
          })}
        </div>
        <Reveal><p className="s-note">New groups open twice a month: the first Sunday and mid-month.</p></Reveal>
      </section>

      {/* ── THE OFFER ── */}
      <section className="s-section" id="guarantee">
        <Reveal>
          <p className="s-label">Zero risk</p>
          <h2 className="s-title">An offer that's <em>easy to say yes to.</em></h2>
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
              <div className="s-seal-mid"><strong>100%</strong><span>REFUND</span></div>
            </div>
          </Reveal>
          <div className="s-offer-items">
            <Reveal>
              <article className="s-offer-item">
                <h3>The confidence guarantee</h3>
                <p>Complete the six weeks and put the exercises into practice. If you don't feel significantly more confident speaking by the end, I'll refund every penny <b>and</b> coach you for another 30 days, completely free.</p>
              </article>
            </Reveal>
            <Reveal delay={90}>
              <article className="s-offer-item">
                <h3>Upgrade without losing a cent</h3>
                <p>Start in a group. If you want private coaching later, everything you paid counts toward 1-on-1.</p>
              </article>
            </Reveal>
            <Reveal delay={180}>
              <article className="s-offer-item">
                <h3>You won't do this alone</h3>
                <p>Every student joins the community and our private WhatsApp group: practice partners, wins shared every day, and meetups in person.</p>
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
            ["1-on-1 or group: which should I choose?", "Choose 1-on-1 if you want every session built around your exact situation and schedule. Choose the group if you'd like to practise with real people and keep the investment lower. Both follow the same 6-week plan, and you can upgrade from group to 1-on-1 later with everything you paid counting toward it."],
            ["What happens after the six weeks?", "You keep one year of access. With 1-on-1 that includes the Speaker's Gym app, the community and WhatsApp group, the MOUN Academy course, your private portal and weekly group coaching. With the group plan you keep the app, the community and the WhatsApp group."],
            ["How big are the groups?", `Never more than ${GROUP_MAX} people, so everyone speaks and gets feedback in every session.`],
            ["When do the group sessions happen?", "Every Sunday from 12 to 1 pm GMT (4 to 5 pm GMT+4), for six weeks in a row."],
            ["How much time do I need between sessions?", "About 10 to 15 minutes a day for your speaking rep in the app, plus one manageable real-world mission each week."],
            ["Is there a money-back guarantee?", "Yes. Complete the six-week program and put the exercises into practice. If you don't feel significantly more confident speaking by the end, I'll refund every penny and coach you for another 30 days, completely free."],
            ["When can I start?", "You get access to the app right after joining. For 1-on-1, I'll contact you personally to schedule your first session. For groups, you start on the date you chose."],
          ].map(([q, a]) => <Reveal key={q}><FAQ q={q} a={a} /></Reveal>)}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="s-final" id="contact">
        <Reveal>
          <p className="s-label">Contact us</p>
          <h2>Have a question? <em>Send me an email.</em></h2>
          <p>Ask anything about the program, the dates or which plan fits you best. I reply personally. If it feels like a good fit, we will set up a quick call.</p>
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
