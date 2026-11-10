import { useEffect, useRef, useState } from "react";
import { SiteFooter, SiteHeader } from "./SiteChrome.jsx";
import { BOOK_URL, WHATSAPP_NUMBER, WHATSAPP_URL, whatsappLink } from "./siteConfig.js";
import WhatsAppIcon from "./WhatsAppIcon.jsx";
import HeroVideo from "./HeroVideo.jsx";
import YouTubeEmbed from "./YouTubeEmbed.jsx";
import { VIDEOS } from "./testimonials.js";
import marouanePhoto from "./Marouane.webp";
import brandLogo from "./Logo.webp";
import "./Sales.css";
import "./Zlin.css";

const CONTACT_EMAIL = "marouane@speakers-gym.com";
const CONTACT_HREF = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Zlín program question")}&body=${encodeURIComponent("Hello Speaker's Gym team,\n\nI'm interested in the Zlín program.\n\nThank you!")}`;
/* Stripe payment link (Czech crowns): in-person group, 2 000 Kč. The tag lets us see which page the payment came from. */
const RESERVE_URL = "https://buy.stripe.com/3cI6oHfZPdg9a4n8GZ1ck0b?client_reference_id=zlin_group";
const START_DATE = "22 November";

/* Prices are in Czech crowns, per person. The holiday offer halves the regular price. */
const LIST_PRICE = 4000;
const DEAL_PRICE = 2000;
const ONE_PRICE = 3000;
const GROUP_MAX = 10;
const kc = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Kč`;

const cx = (...c) => c.filter(Boolean).join(" ");

const OUTCOMES = [
  ["🎯", "Speak on the spot", "Answer with clarity the moment you are asked. No scripts. No hesitation."],
  ["🔥", "Speak with influence", "Be clear and persuasive. Make people listen, and act."],
  ["🚀", "Reach the next level", "Move from speaking English well to communicating like a leader."],
];

const HOW = [
  ["🤝", "Weekly coaching", "One session a week. In person in Zlín for the group, 60 minutes online for 1-on-1."],
  ["📱", "Daily practice", "A daily speaking rep in the Speaker's Gym app. Practice becomes a habit."],
  ["💬", "Daily feedback", "We review your work in our online community, every day."],
  ["📲", "Ongoing follow-up", "We stay in touch on WhatsApp and in the school community."],
];

const CURRICULUM = [
  ["Speak on the spot", "Organize your thoughts in seconds and answer without rehearsing."],
  ["Volume and vocal variety", "Use volume and vocal range so your message lands."],
  ["Pace", "Control your pace. Speak with composure and influence."],
  ["The pitch", "Bring every skill together in one pitch, then prove it in a gamified challenge, such as an interview or a speech."],
];

const GROUP_LIST = [
  "Weekly in-person coaching in Zlín",
  `Small group, maximum ${GROUP_MAX} people`,
  "Daily practice in the Speaker's Gym app",
  "Daily feedback in our online community",
  "Follow-up on WhatsApp and in the school community",
];

const ONE_LIST = [
  "Weekly 60-minute private session, live online",
  "Built around your goals",
  "Daily practice in the Speaker's Gym app",
  "Daily feedback in our online community",
  "Follow-up on WhatsApp and in the school community",
];

const FOR_YOU = [
  "You speak English and want to speak it with command.",
  "You want to answer on the spot, without rehearsing.",
  "You want to sound clear, confident and influential.",
  "You learn best face to face, and through play.",
];

const FAQS = [
  ["Is the group in person?", `Yes. In Zlín, face to face, with a maximum of ${GROUP_MAX} people. The 1-on-1 coaching is online.`],
  ["Where and when does it take place?", `In Zlín, Czech Republic. The first group starts on ${START_DATE}. We confirm the venue when you reserve your spot.`],
  ["In which language is the program?", "English. It is built for people who already speak it and want to use it with more impact."],
  ["What is the Speaker's Gym app?", "Your daily practice: a short speaking rep each day, with feedback. It feels like a game, not homework."],
  ["How long are the sessions?", "The 1-on-1 session lasts 60 minutes, weekly, for four weeks. The group meets in person in Zlín every week."],
  ["How does feedback work?", "Daily, in our online community, with follow-up on WhatsApp and in the school community."],
  ["What is the holiday offer?", `The in-person group costs ${kc(DEAL_PRICE)} per person, down from ${kc(LIST_PRICE)}.`],
  ["How do I reserve a spot?", "Book a free discovery call or message us on WhatsApp. We will confirm your place."],
];

function Reveal({ children, delay = 0, className = "", instant = false }) {
  const ref = useRef(null);
  const [on, setOn] = useState(instant);
  useEffect(() => {
    if (instant || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setOn(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [instant]);
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

const Check = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

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

export default function Zlin() {
  useEffect(() => {
    const prev = document.title;
    document.title = "In-Person Communication Coaching in Zlín | The Speaker's Gym";
    return () => { document.title = prev; };
  }, []);

  return (
    <div className="sales-page zlin-page s-lean">
      <SiteHeader page="zlin" ctaCall />

      {/* ── HERO ── */}
      <header className="s-hero">
        <HeroVideo />
        <div className="s-hero-glow" aria-hidden="true" />
        <Reveal instant><img className="z-logo" src={brandLogo} alt="The Speaker's Gym" width="120" height="120" /></Reveal>
        <Reveal instant><p className="s-kicker"><span className="s-dot" aria-hidden="true" />Ahoj, Zlín · In person · Four weeks</p></Reveal>
        <Reveal instant>
          <p className="s-holiday-pill"><span aria-hidden="true">🎄</span>
            <span className="s-holiday-pill-text">
              <span>Holiday offer: <b>{kc(DEAL_PRICE)}</b> per person, down from {kc(LIST_PRICE)}</span>
              <small>First group starts {START_DATE} · limited to {GROUP_MAX} people</small>
            </span>
          </p>
        </Reveal>
        <Reveal instant delay={80}><h1>Speak on the spot. Speak with <em>influence.</em></h1></Reveal>
        <Reveal instant delay={160}>
          <p className="s-hero-sub">A four-week intensive in Zlín, for professionals who already speak English and want to lead with it.</p>
        </Reveal>
        <Reveal instant delay={240}>
          <div className="s-transforms">
            {[["Rehearsed", "Spontaneous"], ["Understood", "Influential"], ["Fluent", "Commanding"]].map(([a, b]) => (
              <span key={a}><s>{a}</s><i aria-hidden="true">→</i><b>{b}</b></span>
            ))}
          </div>
        </Reveal>
        <Reveal instant delay={300}>
          <div className="s-hero-btns">
            <a href={BOOK_URL} className="s-btn s-btn--gold s-btn--xl" target="_blank" rel="noopener noreferrer"><CalendarIcon size={20} /> Book a free discovery call</a>
          </div>
        </Reveal>
        <Reveal instant delay={330}>
          <p className="s-hero-price">In person in Zlín from <b>{kc(DEAL_PRICE)}</b> · Four weeks · {GROUP_MAX} seats</p>
        </Reveal>
        <Reveal instant delay={360}>
          <ul className="s-assure">
            <li><Check />In person in Zlín</li>
            <li><Check />Four-week intensive</li>
            <li><Check />Daily practice and feedback</li>
          </ul>
        </Reveal>
      </header>

      {/* ── OUTCOMES ── */}
      <section className="s-section" id="outcomes">
        <Reveal>
          <p className="s-label">The outcome</p>
          <h2 className="s-title">Think clearly. <em>Speak powerfully.</em></h2>
          <p className="s-sub">Built for professionals who already speak English.</p>
        </Reveal>
        <div className="s-why">
          {OUTCOMES.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 100}>
              <article className="s-why-card"><span aria-hidden="true">{icon}</span><h3>{title}</h3><p>{text}</p></article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── COACH ── */}
      <section className="s-section s-section--tint" id="coach">
        <div className="z-coach">
          <Reveal>
            <div className="z-coach-media">
              <div className="s-coach-photo"><img src={marouanePhoto} alt="Marouane Al Mandri, communication coach" loading="lazy" /></div>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="z-coach-text">
              <p className="s-label s-label--left">Your communication coach</p>
              <h2>Marouane <em>Al Mandri</em></h2>
              <p className="z-lede">I have mentored people in Dubai and Montréal for six years.</p>
              <p>I turn shy people into confident communicators. Not with tricks, but by changing how they structure their thoughts, and how they think about what they are about to say.</p>
              <p>I watch how you speak, and tell you the one thing to fix next.</p>
              <ul className="z-creds">
                <li><Check /><span><b>Six years</b> mentoring in Dubai and Montréal</span></li>
                <li><Check /><span>Founder of <b>The Speaker's Gym</b> and its app</span></li>
                <li><Check /><span>Creator of the <b>MOUN Academy</b> course</span></li>
                <li><Check /><span>Now coaching in person in <b>Zlín</b></span></li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── RESULTS ── */}
      <section className="s-section" id="results">
        <Reveal>
          <p className="s-label">Results</p>
          <h2 className="s-title">Hear it from <em>them.</em></h2>
          <p className="s-sub">Workshop participants, in their own words.</p>
        </Reveal>
        <div className="s-videos">
          {VIDEOS.map(([id, name, role, quote], i) => (
            <Reveal key={id} delay={(i % 3) * 100}>
              <figure className="s-video">
                <div className="s-embed"><YouTubeEmbed id={id} title={`${name}'s testimonial`} /></div>
                <figcaption>
                  <blockquote>“{quote}”</blockquote>
                  <cite><b>{name}</b>{role && <span>{role}</span>}</cite>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── CURRICULUM ── */}
      <section className="s-section" id="curriculum">
        <Reveal>
          <p className="s-label">The curriculum</p>
          <h2 className="s-title">Four weeks. <em>Each skill builds on the last.</em></h2>
          <p className="s-sub">One focus per week.</p>
        </Reveal>
        <div className="s-why z-how">
          {CURRICULUM.map(([title, text], i) => (
            <Reveal key={title} delay={i * 90}>
              <article className="s-why-card z-week">
                <span aria-hidden="true">{i + 1}</span>
                <small>Week {i + 1}</small>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            </Reveal>
          ))}
        </div>
        <Reveal>
          <div className="z-record">
            <span className="z-record-ico" aria-hidden="true">🎥</span>
            <div>
              <small>Gamified, with video</small>
              <strong>We record you. You see what we see.</strong>
              <p>Watch your gestures and your voice on screen. We pinpoint exactly what to improve, and you go again.</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="s-section s-section--tint" id="how">
        <Reveal>
          <p className="s-label">How it works</p>
          <h2 className="s-title">Practice daily. <em>Improve weekly.</em></h2>
          <p className="s-sub">You are never practicing alone.</p>
        </Reveal>
        <div className="s-why z-how">
          {HOW.map(([icon, title, text], i) => (
            <Reveal key={title} delay={i * 90}>
              <article className="s-why-card"><span aria-hidden="true">{icon}</span><h3>{title}</h3><p>{text}</p></article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="s-section" id="plans">
        <Reveal>
          <p className="s-label">Holiday offer</p>
          <h2 className="s-title">Train in your city. <em>Face to face.</em></h2>
          <p className="s-sub">Two ways to join. Prices are in Czech crowns, per person.</p>
        </Reveal>
        <div className="s-plans">
          <Reveal>
            <article className="s-plan s-plan--featured" id="in-person">
              <span className="s-ribbon">IN PERSON · ZLÍN</span>
              <p className="s-plan-tag">IN-PERSON GROUP · MAX {GROUP_MAX}</p>
              <h3>The Zlín intensive</h3>
              <p className="s-plan-desc">Four weeks, face to face, with a small group of up to {GROUP_MAX}. The first group starts on <b>{START_DATE}</b>.</p>
              <div className="s-price">
                <s>{kc(LIST_PRICE)}</s>
                <strong>{kc(DEAL_PRICE)}</strong>
                <span>per person · Four weeks</span>
                <em className="s-deal">Holiday offer · save {kc(LIST_PRICE - DEAL_PRICE)}</em>
              </div>
              <ul className="s-list">{GROUP_LIST.map((t) => <li key={t}><Check />{t}</li>)}</ul>
              <a className="s-btn s-btn--gold s-btn--block" href={RESERVE_URL} target="_blank" rel="noopener noreferrer">Reserve my spot · {kc(DEAL_PRICE)} <span aria-hidden="true">→</span></a>
              <p className="s-ask">Questions? <a href={BOOK_URL} target="_blank" rel="noopener noreferrer"><CalendarIcon size={15} /> Book a free call</a></p>
            </article>
          </Reveal>
          <Reveal delay={120}>
            <article className="s-plan">
              <span className="s-ribbon s-ribbon--quiet">ONLINE</span>
              <p className="s-plan-tag">1-ON-1 COACHING <span className="s-online">Live online</span></p>
              <h3>Private coaching</h3>
              <p className="s-plan-desc">The same four weeks, one to one, fully online.</p>
              <div className="s-price">
                <strong>{kc(ONE_PRICE)}</strong>
                <span>per person · Four weeks · weekly 60-minute sessions</span>
              </div>
              <ul className="s-list">{ONE_LIST.map((t) => <li key={t}><Check />{t}</li>)}</ul>
              <a className="s-btn s-btn--ghost s-btn--block" href={BOOK_URL} target="_blank" rel="noopener noreferrer"><CalendarIcon size={18} /> Book a free discovery call</a>
              <p className="s-ask">Prefer WhatsApp? <a href={whatsappLink("Hello Speaker's Gym team, I have a question about 1-on-1 coaching.")} target="_blank" rel="noopener noreferrer"><WhatsAppIcon size={15} /> WhatsApp us</a></p>
            </article>
          </Reveal>
        </div>
      </section>

      {/* ── WHO ── */}
      <section className="s-section s-section--tint" id="who">
        <Reveal>
          <p className="s-label">Is this for you?</p>
          <h2 className="s-title">This is for you <em>if...</em></h2>
        </Reveal>
        <Reveal>
          <ul className="z-for">{FOR_YOU.map((t) => <li key={t}><Check />{t}</li>)}</ul>
        </Reveal>
        <Reveal>
          <div className="s-hero-btns z-for-cta">
            <a href={BOOK_URL} className="s-btn s-btn--gold s-btn--xl" target="_blank" rel="noopener noreferrer"><CalendarIcon size={20} /> Book a free discovery call</a>
          </div>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section className="s-section" id="faq">
        <Reveal>
          <p className="s-label">Questions</p>
          <h2 className="s-title">Everything <em>you need to know.</em></h2>
        </Reveal>
        <div className="s-faq-list">
          {FAQS.map(([q, a]) => <Reveal key={q}><FAQ q={q} a={a} /></Reveal>)}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="s-final" id="contact">
        <Reveal>
          <p className="s-label">Next step</p>
          <h2>Ready to lead the room? <em>Book a free discovery call.</em></h2>
          <p>Tell us where you want your communication to go. We will tell you honestly if the program fits, and reply within <b>24 hours</b>.</p>
          <div className="s-hero-btns">
            <a href={BOOK_URL} className="s-btn s-btn--gold s-btn--xl" target="_blank" rel="noopener noreferrer"><CalendarIcon size={20} /> Book a free discovery call</a>
            <a href={WHATSAPP_URL} className="s-btn s-btn--ghost s-btn--wa" target="_blank" rel="noopener noreferrer"><WhatsAppIcon /> WhatsApp us</a>
          </div>
          <p className="s-final-small">{CONTACT_EMAIL} <i aria-hidden="true">·</i> WhatsApp {WHATSAPP_NUMBER}</p>
        </Reveal>
      </section>

      <SiteFooter />

      <a href={BOOK_URL} className="s-call-float" aria-label="Book a free call" target="_blank" rel="noopener noreferrer">
        <CalendarIcon size={22} />
        <span>Book a call</span>
      </a>
      <a href={BOOK_URL} className="s-sticky" target="_blank" rel="noopener noreferrer">Book a free discovery call <span aria-hidden="true">→</span></a>
    </div>
  );
}
