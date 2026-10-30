import { useEffect, useRef, useState } from "react";
import { SiteFooter, SiteHeader } from "./SiteChrome.jsx";
import { BOOK_URL, WHATSAPP_NUMBER, whatsappLink } from "./siteConfig.js";
import WhatsAppIcon from "./WhatsAppIcon.jsx";
import marouanePhoto from "./Marouane.webp";
import "./Sales.css";
import "./Corporate.css";

const CONTACT_EMAIL = "marouane@speakers-gym.com";
const mail = (subject, body) => `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
const PROPOSAL = (label) =>
  mail(
    label ? `Corporate program enquiry: ${label}` : "Corporate program enquiry",
    `Hello Speaker's Gym team,\n\nCompany: \nName and role: \nProgram: ${label || "online / in-person"}\nWhat we'd like our people to improve: \n\nThank you!`,
  );
const WHATSAPP = whatsappLink("Hello Speaker's Gym team, I'd like to discuss a corporate program for my team.");

/* Holiday promotion: list prices in USD, discount ends at the end of November 30, 2026 (Dubai time, GMT+4). */
const ONLINE_LIST = 599;
const ONLINE_OFF = 20;
const PROMO_END = Date.UTC(2026, 10, 30, 19, 59, 59);
const fmt = (n) => n.toLocaleString("en-US");
const INPERSON = 1299;
const onlineDeal = Math.round(ONLINE_LIST * (1 - ONLINE_OFF / 100));

const cx = (...c) => c.filter(Boolean).join(" ");

const ICONS = {
  mic: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3z M5 11a7 7 0 0 0 14 0 M12 18v3",
  layers: "M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5",
  users: "M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1 M9.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7 M21 20v-1a4 4 0 0 0-3-3.9 M16 4.1a3.5 3.5 0 0 1 0 6.8",
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  message: "M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  steps: "M3 17l6-6 4 4 8-8 M15 7h6v6",
  brain: "M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V4a3 3 0 0 0-3 0z M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-3 2",
  check: "M5 12.5l4.5 4.5L19 7.5",
};
function Icon({ name, size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={ICONS[name]} />
    </svg>
  );
}

function Reveal({ children, delay = 0, instant = false, className = "" }) {
  const ref = useRef(null);
  const [on, setOn] = useState(instant);
  useEffect(() => {
    if (instant || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [instant]);
  return (
    <div ref={ref} className={cx("c-reveal", on && "c-reveal--in", className)} style={instant ? { transition: "none" } : { transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const FACTS = [
  ["8", "weeks", "A complete program"],
  ["2 hours", "every week", "Live group workshop"],
  ["Max 6", "participants", "Small, focused groups"],
  ["200+", "professionals", "Trained so far"],
];

const CHALLENGES = [
  ["message", "Ideas that go unheard", "Capable people stay quiet in meetings, or say too much and lose the point."],
  ["mic", "Updates that lose the room", "Rushing, rambling or a flat voice makes strong work hard to follow."],
  ["users", "Talent that stays hidden", "Beliefs like “my idea isn't good enough” keep good people from being seen."],
];

const OUTCOMES = [
  "Contribute clearly in meetings and discussions",
  "Structure ideas so others follow and remember them",
  "Speak with a confident, engaging voice",
  "Stay composed when put on the spot",
];

const SKILLS = ["Structure", "Volume", "Pace", "Pauses", "Pitch", "Storytelling"];

const PARTS = [
  {
    icon: "brain",
    weeks: "2 weeks",
    title: "The psychology of confidence",
    text: "We look at why capable people hold back at work, and break the limiting beliefs behind it with a six-step process.",
  },
  {
    icon: "steps",
    weeks: "6 weeks",
    title: "The communication method",
    text: "One skill at a time, taught live and practiced on real work situations: structure, volume, pace, pauses, pitch and storytelling.",
  },
];

const STEPS = [
  ["Name the worst case", "Identify the worst-case scenario a person fears when they have to speak."],
  ["Uncover the meaning", "List what that scenario would mean to them: status, self-worth, belonging."],
  ["Test the story", "Ask of each meaning: is it actually true?"],
  ["Reframe it", "Find ten reasons the worst case could work in their favor, so it loses its power."],
  ["Make it stick", "Repeat the new meaning every day until it is believed."],
  ["Prove it with exposure", "Practice through a ten-level exposure system, one manageable step at a time."],
];

const IP_STEPS = [
  ["Two days at your workplace", "Two 2-hour workshops on consecutive days, on dates your company chooses. We come to you and break the limiting beliefs together, in person.", "Days 1 and 2"],
  ["Weekly live online workshops", "Learn to use your voice with confidence: what to say and how to say it. Practiced on real work situations.", "Online"],
  ["A final in-person session", "We close the 8 weeks together in person, and bring everything into your team's real work.", "Week 8"],
];

const LOOP = [
  ["users", "Learn live", "Each 2-hour workshop introduces a skill and gives everyone time to practice it with the group."],
  ["target", "Apply at work", "Between sessions, participants take one manageable step in their own meetings and conversations."],
  ["layers", "Review and refine", "We look at what happened, give feedback and decide the next step."],
];

const plans = (promo) => [
  {
    label: "online program",
    name: "Online program",
    lead: "Fully online",
    list: ONLINE_LIST,
    price: promo ? onlineDeal : ONLINE_LIST,
    off: promo ? ONLINE_OFF : 0,
    note: "per group of up to 6 · 8 weekly workshops",
    items: ["The full 8-week program", "A live 2-hour online workshop every week", "Groups of up to 6 participants", "Practice on real work situations", "Feedback from your coach"],
    tag: promo ? "Holiday offer" : null,
  },
  {
    label: "in-person program (3 in-person sessions)",
    name: "In-person program",
    lead: "Switzerland, Germany and Austria",
    list: INPERSON,
    price: INPERSON,
    off: 0,
    note: "per group of up to 6 · 3 in-person sessions",
    items: [
      "The full 8-week program",
      "Two in-person workshops at your workplace, on consecutive days you choose (2 hours each)",
      "Weekly live online workshops on your voice and delivery",
      "A final in-person session to close the 8 weeks",
      "Groups of up to 6 participants",
      "Feedback from your coach",
    ],
    dark: true,
    tag: "In-person option",
  },
];

const QUOTES = [
  ["What I liked the most was how to structure our speech. This two hour workshop has been completely fruitful for me and I learned so many things.", "Vivek"],
  ["What I took away the most was structuring the scripts. That's something I didn't know much about, the core message and how to make it more impactful.", "Kevin"],
  ["Got to know a lot about vocal variety and also how to structure your speeches. It was very interactive and I'm for sure buying his course.", "Avinash"],
];

const faqs = (promo) => [
  ["What is the difference between the two programs?", `The online program is delivered fully online (${promo ? `€${fmt(onlineDeal)}, down from €${fmt(ONLINE_LIST)}` : `€${fmt(ONLINE_LIST)}`}). The in-person program (€${fmt(INPERSON)}) includes three in-person sessions at your workplace, in Switzerland, Germany and Austria. Both run for 8 weeks, for groups of up to 6, with a live 2-hour workshop every week.`],
  ["Can we do it in person?", `Yes, in Switzerland, Germany and Austria, for a group of up to 6, for €${fmt(INPERSON)} per group. We come to your workplace for two in-person workshops on consecutive days you choose, 2 hours each, where we break the limiting beliefs. The weekly workshops on your voice and delivery run live online, and we close the 8 weeks with a final in-person session.`],
  ["Who is it for?", "Professionals who know their work but hold back when they speak: in meetings, updates, presentations and conversations with clients or leadership."],
  ["What do the 8 weeks include?", "Two weeks on the psychology of confidence, where we break limiting beliefs with a six-step process, and six weeks of the communication method, practiced on real work situations. Every week is a live 2-hour workshop."],
  ["How do we get started?", "Send us a message or book a discovery call. We will talk through your team's goals, confirm the right group size and agree a start date."],
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cx("c-faq", open && "c-faq--open")}>
      <button type="button" className="c-faq-q" aria-expanded={open} onClick={() => setOpen(!open)}>
        <span>{q}</span><span className="c-faq-i" aria-hidden="true">+</span>
      </button>
      <div className="c-faq-a"><div><p>{a}</p></div></div>
    </div>
  );
}

export default function Corporate() {
  const promo = Date.now() <= PROMO_END;
  const PLANS = plans(promo);
  const FAQS = faqs(promo);
  useEffect(() => {
    const prev = document.title;
    document.title = "Corporate Communication Training | The Speaker's Gym";
    const meta = document.querySelector('meta[name="description"]');
    const prevDesc = meta?.getAttribute("content");
    meta?.setAttribute("content", "An 8-week group program that helps teams speak up in meetings, explain ideas clearly and present with confidence. Groups of up to 6.");
    return () => {
      document.title = prev;
      if (meta && prevDesc != null) meta.setAttribute("content", prevDesc);
    };
  }, []);

  return (
    <div className="sales-page corp-page">
      <SiteHeader page="corporate" />

      {/* ── HERO ── */}
      <header className="c-hero">
        <div className="c-hero-grid" aria-hidden="true" />
        <div className="c-hero-glow" aria-hidden="true" />
        <div className="c-wrap">
          <Reveal instant><p className="c-eyebrow">Corporate communication training</p></Reveal>
          {promo && (
            <Reveal instant>
              <a href="#pricing" className="c-promo"><b>Holiday offer</b> 20% off the online program · ends November 30</a>
            </Reveal>
          )}
          <Reveal instant><h1>From shy to confident, <em>at work.</em></h1></Reveal>
          <Reveal instant>
            <p className="c-hero-sub">An 8-week group program, with a live 2-hour workshop every week, that helps your people speak up in meetings, explain ideas clearly and present with an engaging voice, even when they feel nervous.</p>
          </Reveal>
          <Reveal instant>
            <div className="c-btns">
              <a href={PROPOSAL()} className="c-btn c-btn--gold">Request a proposal</a>
              <a href={BOOK_URL} className="c-btn c-btn--ghost">Book a discovery call</a>
            </div>
          </Reveal>
          <Reveal instant>
            <p className="c-where">Fully online for teams anywhere, or with three in-person sessions in Switzerland, Germany and Austria.</p>
          </Reveal>
          <Reveal instant>
            <ul className="c-facts">
              {FACTS.map(([big, unit, label]) => (
                <li key={label}><strong>{big}</strong><span>{unit}</span><small>{label}</small></li>
              ))}
            </ul>
          </Reveal>
        </div>
      </header>

      {/* ── OVERVIEW ── */}
      <section className="c-sec" id="overview">
        <div className="c-wrap">
          <Reveal>
            <p className="c-label">The challenge</p>
            <h2 className="c-title">Your people have the expertise. <em>Delivery is what holds them back.</em></h2>
          </Reveal>
          <div className="c-cards c-cards--3">
            {CHALLENGES.map(([icon, title, text], i) => (
              <Reveal key={title} delay={i * 90}>
                <article className="c-card">
                  <span className="c-ico"><Icon name={icon} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="c-outcome">
              <div>
                <p className="c-label c-label--left">What changes</p>
                <h3>After 8 weeks, your people can:</h3>
              </div>
              <ul>
                {OUTCOMES.map((t) => <li key={t}><Icon name="check" size={18} />{t}</li>)}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── METHOD ── */}
      <section className="c-sec c-sec--alt" id="method">
        <div className="c-wrap">
          <Reveal>
            <p className="c-label">The method</p>
            <h2 className="c-title">Mindset first. <em>Then skill, practiced at work.</em></h2>
            <p className="c-sub">Most training stops at technique. We also work on the beliefs that make capable people hold back, then practice the skills on real work situations.</p>
          </Reveal>
          <div className="c-tracks">
            <Reveal>
              <article className="c-track">
                <span className="c-ico"><Icon name="brain" /></span>
                <p>Psychology</p>
                <h3>Break the limiting beliefs</h3>
                <span>Understand why confident people still hesitate, and change the story behind it.</span>
              </article>
            </Reveal>
            <div className="c-plus" aria-hidden="true">+</div>
            <Reveal delay={80}>
              <article className="c-track">
                <span className="c-ico"><Icon name="mic" /></span>
                <p>Technique</p>
                <h3>Build the skill</h3>
                <div className="c-chips">{SKILLS.map((k) => <b key={k}>{k}</b>)}</div>
              </article>
            </Reveal>
            <div className="c-plus" aria-hidden="true">+</div>
            <Reveal delay={160}>
              <article className="c-track">
                <span className="c-ico"><Icon name="target" /></span>
                <p>Exposure</p>
                <h3>Use it at work</h3>
                <span>One manageable real-world step at a time, in your own meetings and conversations.</span>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PROGRAM ── */}
      <section className="c-sec" id="program">
        <div className="c-wrap">
          <Reveal>
            <p className="c-label">The 8-week program</p>
            <h2 className="c-title">Everything in our proven method, <em>plus the psychology.</em></h2>
            <p className="c-sub">The program includes our 6-week communication method and adds two weeks on the psychology of confidence.</p>
          </Reveal>
          <div className="c-parts">
            {PARTS.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <article className="c-part">
                  <div className="c-part-top">
                    <span className="c-ico c-ico--lg"><Icon name={p.icon} size={26} /></span>
                    <strong>{p.weeks}</strong>
                  </div>
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <div className="c-ip-head">
              <p className="c-label c-label--left">The in-person program</p>
              <h3>How it runs, step by step</h3>
              <p>Available in Switzerland, Germany and Austria, for groups of up to 6.</p>
            </div>
          </Reveal>
          <div className="c-ip">
            {IP_STEPS.map(([title, text, when], i) => (
              <Reveal key={title} delay={i * 100}>
                <article className="c-ip-step">
                  <span className="c-ip-when">{when}</span>
                  <span className="c-ip-n">{i + 1}</span>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="c-label c-loop-label">The psychology: our six-step process</p>
            <h3 className="c-subtitle">How we break the limiting beliefs</h3>
          </Reveal>
          <div className="c-steps">
            {STEPS.map(([title, text], i) => (
              <Reveal key={title} delay={(i % 3) * 80}>
                <article className="c-stepcard">
                  <span className="c-stepcard-n">{i + 1}</span>
                  <h4>{title}</h4>
                  <p>{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="c-label c-loop-label">How each week works</p>
          </Reveal>
          <div className="c-cards c-cards--3">
            {LOOP.map(([icon, title, text], i) => (
              <Reveal key={title} delay={i * 90}>
                <article className="c-card c-card--step">
                  <span className="c-step-n">{i + 1}</span>
                  <span className="c-ico"><Icon name={icon} /></span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="c-sec c-sec--dark" id="pricing">
        <div className="c-wrap">
          <Reveal>
            <p className="c-label c-label--gold">Programs and pricing</p>
            <h2 className="c-title c-title--light">Choose the format <em>that fits your team.</em></h2>
            <p className="c-sub c-sub--light">Every program runs for 8 weeks, with a live 2-hour workshop every week. Prices are in euros.{promo && <> Holiday offer on the online program ends November 30.</>}</p>
          </Reveal>
          <div className="c-plans">
            {PLANS.map((p, i) => (
              <Reveal key={p.name} delay={i * 100}>
                <article className={cx("c-plan", p.dark && "c-plan--dark")}>
                  {p.tag && <span className="c-plan-tag">{p.tag}</span>}
                  <h3>{p.name}</h3>
                  <p className="c-plan-lead">{p.lead}</p>
                  <div className="c-price">
                    {p.off > 0 && <s>€{fmt(p.list)}</s>}
                    <strong>€{fmt(p.price)}</strong>
                    <span>{p.note}</span>
                    {p.off > 0 && <em className="c-deal">{p.off}% off · save €{fmt(p.list - p.price)} · ends Nov 30</em>}
                  </div>
                  <ul>{p.items.map((t) => <li key={t}><Icon name="check" size={18} />{t}</li>)}</ul>
                  <a href={PROPOSAL(p.label)} className={cx("c-btn c-btn--block", p.dark ? "c-btn--gold" : "c-btn--ink")}>Request a proposal</a>
                </article>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="c-plans-note">Not sure which fits your team? <a href={BOOK_URL}>Book a discovery call</a> and we will recommend one.</p>
          </Reveal>
        </div>
      </section>

      {/* ── PROOF ── */}
      <section className="c-sec" id="proof">
        <div className="c-wrap">
          <Reveal>
            <p className="c-label">In their words</p>
            <h2 className="c-title">What workshop participants <em>say.</em></h2>
          </Reveal>
          <div className="c-cards c-cards--3">
            {QUOTES.map(([q, who], i) => (
              <Reveal key={who} delay={i * 90}>
                <figure className="c-quote">
                  <blockquote>“{q}”</blockquote>
                  <figcaption><b>{who}</b><span>Workshop participant</span></figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── COACH ── */}
      <section className="c-sec c-sec--alt" id="coach">
        <div className="c-wrap c-coach">
          <Reveal>
            <div className="c-coach-photo"><img src={marouanePhoto} alt="Marouane Al Mandri, communication coach" loading="lazy" /></div>
          </Reveal>
          <Reveal delay={100}>
            <div>
              <p className="c-label c-label--left">Your coach</p>
              <h2 className="c-title c-title--left">Marouane Al Mandri</h2>
              <p>Marouane has coached communication for 6 years, in Dubai, Montréal and the Czech Republic, in person and online.</p>
              <p>He built The Speaker's Gym on one belief: <b>communication is a skill, not a talent</b>, and skills can be trained. No generic tips. Structured practice, honest feedback and a system that works in real work situations.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="c-sec" id="faq">
        <div className="c-wrap c-wrap--narrow">
          <Reveal>
            <p className="c-label">Questions</p>
            <h2 className="c-title">Good to <em>know.</em></h2>
          </Reveal>
          <div className="c-faq-list">
            {FAQS.map(([q, a]) => <Reveal key={q}><FAQ q={q} a={a} /></Reveal>)}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="c-contact" id="contact">
        <div className="c-hero-glow c-hero-glow--low" aria-hidden="true" />
        <div className="c-wrap">
          <Reveal>
            <p className="c-label c-label--gold">Contact us</p>
            <h2 className="c-title c-title--light">Let's plan your team's <em>program.</em></h2>
            <p className="c-sub c-sub--light">Tell us about your team. We reply within <b>24 hours</b> and, if it is a good fit, set up a discovery call.</p>
            <div className="c-btns c-btns--center">
              <a href={PROPOSAL()} className="c-btn c-btn--gold">Request a proposal</a>
              <a href={WHATSAPP} className="c-btn c-btn--ghost" target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> WhatsApp us</a>
              <a href={BOOK_URL} className="c-btn c-btn--ghost">Book a discovery call</a>
            </div>
            <p className="c-contact-line">{CONTACT_EMAIL} <i aria-hidden="true">·</i> WhatsApp {WHATSAPP_NUMBER}</p>
          </Reveal>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
