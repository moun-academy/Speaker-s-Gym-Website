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
const RESERVE_URL = whatsappLink("Hello Speaker's Gym team, I'd like to reserve a spot in the in-person group in Zlín.");

/* Prices are in Czech crowns, per person. The holiday offer halves the regular price. */
const LIST_PRICE = 4000;
const DEAL_PRICE = 2000;
const GROUP_MAX = 10;
const kc = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Kč`;

const cx = (...c) => c.filter(Boolean).join(" ");

const OUTCOMES = [
  ["🎯", "Speak on the spot", "Answer questions, join discussions and share ideas in English without freezing or over-preparing."],
  ["🔥", "Speak in an influential way", "Be clear, convincing and memorable, so people listen and act on what you say."],
  ["🚀", "Take your communication to the next level", "Go from speaking English well to communicating like a leader."],
];

const HOW = [
  ["🤝", "Weekly coaching", "A weekly in-person coaching session in Zlín for the group. Private sessions are online for 1-on-1."],
  ["📱", "Practice every day", "The Speaker's Gym app gives you a daily speaking rep, so practice becomes a habit."],
  ["💬", "Feedback every day", "In our online community, we give you feedback every single day."],
  ["📲", "We follow up with you", "We stay in touch on WhatsApp and in the school community, so your momentum never drops."],
];

const GROUP_LIST = [
  "Weekly in-person coaching sessions in Zlín",
  `In person, in a group of max ${GROUP_MAX} people`,
  "Speaker's Gym app: practice every day",
  "Online community: feedback every single day",
  "Follow-up on WhatsApp and in the school community",
];

const ONE_LIST = [
  "Weekly 1-on-1 coaching sessions, live online",
  "Every session built around you and your goals",
  "Speaker's Gym app: practice every day",
  "Online community: feedback every single day",
  "Follow-up on WhatsApp and in the school community",
];

const FOR_YOU = [
  "You already speak English and want to use it with more ease.",
  "You want to speak on the spot, without rehearsing every sentence.",
  "You want to sound clear, confident and influential in meetings and conversations.",
  "You learn best with real people in the room, and a bit of play.",
];

const FAQS = [
  ["Is the group really in person?", `Yes. The group is in person in Zlín, face to face, with a maximum of ${GROUP_MAX} people. The 1-on-1 coaching is online.`],
  ["Where and when does it take place?", "In Zlín, Czech Republic. We confirm the venue and the start date when you reserve your spot, so book a free call or message us on WhatsApp."],
  ["Is the program in English?", "Yes. It is for people who already speak English and want to take it to the next level: speaking on the spot and speaking in an influential way."],
  ["What is the Speaker's Gym app?", "Your daily practice. You do a short speaking rep every day and get feedback, so improving feels like a game and not like homework."],
  ["How do I get feedback between sessions?", "Every day, in our online community. We also follow up with you on WhatsApp and in the school community."],
  ["What is the holiday season offer?", `The in-person group is ${kc(DEAL_PRICE)} per person instead of ${kc(LIST_PRICE)}. Prices are in Czech crowns.`],
  ["How do I reserve my spot?", "Book a free discovery call or message us on WhatsApp. We will answer your questions and send you the details to confirm your place."],
];

/* Workshop highlights: loads and plays only when it is on screen. */
function HighlightVideo() {
  const ref = useRef(null);
  const [src, setSrc] = useState(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !("IntersectionObserver" in window)) return undefined;
    const small = window.matchMedia("(max-width: 760px)").matches;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSrc((cur) => cur || (small ? "/media/hero-bg-mobile.mp4" : "/media/hero-bg.mp4"));
        v.play().catch(() => {});
      } else v.pause();
    }, { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return (
    <figure className="z-video">
      <video ref={ref} src={src || undefined} poster="/media/about-highlight-poster.webp" muted loop playsInline preload="none" aria-label="Highlights from Marouane's workshops" />
      <span className="z-video-tag">WORKSHOP HIGHLIGHTS</span>
    </figure>
  );
}

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

function Snow() {
  return (
    <div className="s-snow" aria-hidden="true">
      {Array.from({ length: 26 }, (_, i) => (
        <i key={i} style={{ left: `${(i * 37) % 100}%`, width: `${3 + ((i * 3) % 5)}px`, height: `${3 + ((i * 3) % 5)}px`, opacity: 0.3 + ((i * 13) % 45) / 100, animationDuration: `${10 + ((i * 7) % 9)}s`, animationDelay: `${-((i * 5) % 14)}s` }} />
      ))}
    </div>
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
        <Snow />
        <Reveal instant><img className="z-logo" src={brandLogo} alt="The Speaker's Gym" width="120" height="120" /></Reveal>
        <Reveal instant><p className="s-kicker"><span className="s-dot" aria-hidden="true" />Ahoj, Zlín · In-person 4-week intensive</p></Reveal>
        <Reveal instant>
          <p className="s-holiday-pill"><span aria-hidden="true">🎄</span>
            <span className="s-holiday-pill-text">
              <span>Holiday season offer: <b>{kc(DEAL_PRICE)}</b> per person instead of {kc(LIST_PRICE)}</span>
              <small>In person in Zlín · max {GROUP_MAX} people</small>
            </span>
          </p>
        </Reveal>
        <Reveal instant delay={80}><h1>Take your English communication to the <em>next level.</em></h1></Reveal>
        <Reveal instant delay={160}>
          <p className="s-hero-sub">A 4-week in-person intensive in Zlín for people who speak English and want to communicate with more impact. Speak on the spot and speak in an influential way, in a gamified way.</p>
        </Reveal>
        <Reveal instant delay={240}>
          <div className="s-transforms">
            {[["Rehearsing every sentence", "Speaking on the spot"], ["Being understood", "Being influential"], ["Good English", "Next-level communicator"]].map(([a, b]) => (
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
          <p className="s-hero-price">In person in Zlín from <b>{kc(DEAL_PRICE)}</b> · 4 weeks · max {GROUP_MAX} people</p>
        </Reveal>
        <Reveal instant delay={360}>
          <ul className="s-assure">
            <li><Check />In person in Zlín</li>
            <li><Check />4-week intensive</li>
            <li><Check />Daily practice and feedback</li>
          </ul>
        </Reveal>
      </header>

      {/* ── OUTCOMES ── */}
      <section className="s-section" id="outcomes">
        <Reveal>
          <p className="s-label">What you walk away with</p>
          <h2 className="s-title">Speak on the spot. <em>Speak with influence.</em></h2>
          <p className="s-sub">For people who already speak English and are ready for the next level.</p>
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
              <h2>Hi, I'm <em>Marouane.</em></h2>
              <p className="z-lede">I'm a communication coach. I have mentored people in Dubai and Montréal for the past 6 years.</p>
              <p>I help professionals speak on the spot and speak with influence, through structured practice, honest feedback and a system that works in real situations.</p>
              <ul className="z-creds">
                <li><Check /><span><b>6 years</b> mentoring people in Dubai and Montréal</span></li>
                <li><Check /><span>Founder of <b>The Speaker's Gym</b> and the Speaker's Gym app</span></li>
                <li><Check /><span>Creator of the <b>MOUN Academy</b> communication course</span></li>
                <li><Check /><span>Now coaching in person in <b>Zlín</b></span></li>
              </ul>
            </div>
          </Reveal>
        </div>
        <Reveal><HighlightVideo /></Reveal>
      </section>

      {/* ── RESULTS ── */}
      <section className="s-section" id="results">
        <Reveal>
          <p className="s-label">Results</p>
          <h2 className="s-title">Don't take our word for it. <em>Take theirs.</em></h2>
          <p className="s-sub">Workshop participants, in their own words.</p>
        </Reveal>
        <div className="s-videos">
          {VIDEOS.slice(0, 3).map(([id, name, role, quote], i) => (
            <Reveal key={id} delay={i * 100}>
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

      {/* ── HOW IT WORKS ── */}
      <section className="s-section s-section--tint" id="how">
        <Reveal>
          <p className="s-label">4 weeks. Gamified.</p>
          <h2 className="s-title">Practice that feels like a game, <em>coaching that gets results.</em></h2>
          <p className="s-sub">Every week you meet, every day you practice, and you are never on your own.</p>
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
          <p className="s-label">Holiday season offer</p>
          <h2 className="s-title">Train in your own city. <em>Face to face.</em></h2>
          <p className="s-sub">Choose the in-person group in Zlín, or private coaching online. Prices are in Czech crowns (Kč) per person.</p>
        </Reveal>
        <div className="s-plans">
          <Reveal>
            <article className="s-plan s-plan--featured" id="in-person">
              <span className="s-ribbon">IN PERSON · ZLÍN</span>
              <p className="s-plan-tag">IN-PERSON GROUP · MAX {GROUP_MAX}</p>
              <h3>Small-group intensive in Zlín</h3>
              <p className="s-plan-desc">Four weeks of in-person coaching with a group of up to {GROUP_MAX} people. Practice with real people, face to face.</p>
              <div className="s-price">
                <s>{kc(LIST_PRICE)}</s>
                <strong>{kc(DEAL_PRICE)}</strong>
                <span>per person · 4 weeks</span>
                <em className="s-deal">Holiday season offer · you save {kc(LIST_PRICE - DEAL_PRICE)}</em>
              </div>
              <ul className="s-list">{GROUP_LIST.map((t) => <li key={t}><Check />{t}</li>)}</ul>
              <a className="s-btn s-btn--gold s-btn--block" href={RESERVE_URL} target="_blank" rel="noopener noreferrer">Reserve my spot <span aria-hidden="true">→</span></a>
              <p className="s-ask">Questions? <a href={BOOK_URL} target="_blank" rel="noopener noreferrer"><CalendarIcon size={15} /> Book a free call</a></p>
            </article>
          </Reveal>
          <Reveal delay={120}>
            <article className="s-plan">
              <span className="s-ribbon s-ribbon--quiet">ONLINE</span>
              <p className="s-plan-tag">1-ON-1 COACHING <span className="s-online">Live online</span></p>
              <h3>Private coaching with Marouane</h3>
              <p className="s-plan-desc">The same 4-week intensive, one-to-one and fully online. Every session built around you.</p>
              <div className="s-price">
                <strong className="z-ask-price">Let's talk</strong>
                <span>Book a free call and we will tell you the price and the next available start.</span>
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
          <p className="s-label">Still deciding?</p>
          <h2 className="s-title">Questions, <em>answered.</em></h2>
        </Reveal>
        <div className="s-faq-list">
          {FAQS.map(([q, a]) => <Reveal key={q}><FAQ q={q} a={a} /></Reveal>)}
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="s-final" id="contact">
        <Reveal>
          <p className="s-label">Ready when you are</p>
          <h2>Ready to take it to the next level? <em>Book a free discovery call.</em></h2>
          <p>Tell us where you want your English communication to go. We will tell you honestly if this program fits you, and answer within <b>24 hours</b>.</p>
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
