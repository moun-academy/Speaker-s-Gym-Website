import { useEffect, useRef, useState } from "react";
import { SiteFooter, SiteHeader } from "./SiteChrome.jsx";
import { BOOK_URL, PURCHASE_URL } from "./siteConfig.js";
import "./Method.css";

const levels = [
  { id: 1, name: "Become Visible", objective: "Stop disappearing during everyday interactions.", actions: ["Make eye contact", "Greet someone first", "Give one complete answer instead of one word"], mission: "Initiate one greeting and maintain eye contact.", unlock: "Presence" },
  { id: 2, name: "Initiate", objective: "Become comfortable beginning interactions.", actions: ["Start a short conversation", "Ask a simple question", "Speak before someone approaches you"], mission: "Start one short conversation at work.", unlock: "Initiative" },
  { id: 3, name: "Participate", objective: "Contribute when invited.", actions: ["Answer a question using PREP", "Share one complete opinion", "Remove apologetic openings"], mission: "Give one structured answer when someone asks for your opinion.", unlock: "Clarity" },
  { id: 4, name: "Volunteer", objective: "Speak without waiting to be invited.", actions: ["Ask a question during a meeting", "Add one useful point", "Volunteer an idea"], mission: "Contribute once before someone calls on you.", unlock: "Courage" },
  { id: 5, name: "Hold the Floor", objective: "Remain visible for longer.", actions: ["Give a 30 to 60-second opinion", "Use pauses instead of rushing", "Complete the thought without retreating"], mission: "Deliver one complete PREP answer without rushing.", unlock: "Control" },
  { id: 6, name: "Disagree Respectfully", objective: "Express a different opinion without shrinking.", actions: ["State disagreement calmly", "Remove excessive apologies", "Support the opinion with a clear reason"], mission: "Express one respectful disagreement using PREP.", unlock: "Assertiveness" },
  { id: 7, name: "Lead a Moment", objective: "Guide part of an interaction.", actions: ["Give a team update", "Introduce a topic", "Guide part of a discussion"], mission: "Lead one small moment during a meeting or conversation.", unlock: "Leadership" },
  { id: 8, name: "Speak Under Pressure", objective: "Remain clear when pressure increases.", actions: ["Respond to an unexpected question", "Recover after an interruption", "Pause before answering", "Continue after making a mistake"], mission: "Answer one unexpected question without escaping or rushing.", unlock: "Composure" },
  { id: 9, name: "Influence", objective: "Move people through communication.", actions: ["Present a recommendation", "Tell a relevant story", "Defend an idea", "Persuade using evidence"], mission: "Present one recommendation and explain why it matters.", unlock: "Influence" },
  { id: 10, name: "Full Expression", objective: "Gain full access to your personality.", actions: ["Use vocal variety naturally", "Show emotion", "Use gestures freely", "Speak spontaneously", "Communicate with warmth and strength"], mission: "Express an idea without hiding your personality.", unlock: "Freedom" },
];

const assessmentStatements = [
  { statement: "I avoid eye contact and rarely initiate conversations.", level: 1, capable: "You are noticing the moments when fear asks you to disappear. That awareness is a real starting point.", next: "Become visible in one low-pressure interaction.", mission: levels[0].mission },
  { statement: "I can speak when someone asks me a direct question.", level: 2, capable: "You can respond when the path is opened for you. Your next step is learning to open it yourself.", next: "Begin one simple interaction instead of waiting.", mission: levels[1].mission },
  { statement: "I contribute when invited, but rarely volunteer.", level: 3, capable: "You already have useful thoughts and can share them when invited.", next: "Contribute before someone calls on you.", mission: levels[3].mission },
  { statement: "I can share opinions, but I rush or minimize them.", level: 5, capable: "You are willing to be heard. Now you can practise staying visible long enough to complete the thought.", next: "Hold the floor with a calm, structured answer.", mission: levels[4].mission },
  { statement: "I can lead conversations, but pressure affects my delivery.", level: 8, capable: "You can lead and contribute. Your next growth edge is keeping access to those skills under pressure.", next: "Pause, recover and continue when the moment becomes unpredictable.", mission: levels[7].mission },
  { statement: "I speak freely and show my personality in most situations.", level: 10, capable: "You can communicate with freedom in most situations and let people experience the real you.", next: "Keep expanding where and when that freedom is available.", mission: levels[9].mission },
];

const programWeeks = [
  ["1", "Think Clearly", "Learn PREP and simple frameworks that remove the fear of not knowing what to say."],
  ["2", "Start the Exposure Journey", "Identify your current level, build your first version and begin small real-world speaking actions."],
  ["3", "Build a Stronger Voice", "Develop volume and vocal strength while continuing your exposure missions."],
  ["4", "Slow Down and Take Space", "Use pauses, pace and composure while moving higher through the Exposure Ladder."],
  ["5", "Show More Personality", "Develop vocal variety, expression and body language as confidence becomes more accessible."],
  ["6", "Communicate Under Pressure", "Apply everything during meetings, interviews, presentations and difficult conversations."],
];

function useOnScreen(ref, threshold = 0.12) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);
  return visible;
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  return <div ref={ref} className={`method-reveal ${visible ? "is-visible" : ""} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function trackMethodCta(label, isPurchase = false) {
  if (typeof window === "undefined") return;
  if (typeof window.gtag === "function") window.gtag("event", "method_cta_click", { cta_label: label, page_path: "/method" });
  if (isPurchase && typeof window.fbq === "function") window.fbq("track", "Lead");
}

function PersonJourney({ id = "journey" }) {
  return (
    <div className="person-journey">
      <svg viewBox="0 0 720 430" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
        <title id={`${id}-title`}>The same professional moving from holding back to full expression</title>
        <desc id={`${id}-desc`}>A respectful workplace illustration showing one person first listening quietly, then contributing openly while remaining recognizably themselves.</desc>
        <defs>
          <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#19302b"/><stop offset="1" stopColor="#0f1715"/></linearGradient>
          <linearGradient id={`${id}-line`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#d9c06f" stopOpacity="0"/><stop offset=".5" stopColor="#d9c06f"/><stop offset="1" stopColor="#d9c06f" stopOpacity="0"/></linearGradient>
        </defs>
        <rect x="1" y="1" width="718" height="428" rx="30" fill={`url(#${id}-bg)`} stroke="#d9c06f" strokeOpacity=".22"/>
        <path d="M360 44v340" stroke={`url(#${id}-line)`} strokeOpacity=".5"/>
        <g opacity=".42" fill="#9fb5aa">
          <rect x="52" y="76" width="245" height="118" rx="12" fill="#203b35"/><path d="M70 176h210" stroke="#9fb5aa" strokeOpacity=".2"/>
          <circle cx="87" cy="279" r="26"/><rect x="63" y="305" width="50" height="69" rx="18"/>
          <circle cx="637" cy="279" r="26"/><rect x="612" y="305" width="50" height="69" rx="18"/>
          <rect x="421" y="76" width="245" height="118" rx="12" fill="#203b35"/><path d="M439 176h210" stroke="#9fb5aa" strokeOpacity=".2"/>
        </g>
        <g transform="translate(118 128)">
          <circle cx="100" cy="86" r="43" fill="#c98568"/><path d="M59 82c2-43 75-58 84 1-17-14-62-19-84-1z" fill="#302720"/>
          <path d="M67 130c21-13 47-13 68 0l16 106H49z" fill="#55786e"/>
          <path d="M66 147l-31 58" stroke="#55786e" strokeWidth="24" strokeLinecap="round"/><path d="M135 147l24 54" stroke="#55786e" strokeWidth="24" strokeLinecap="round"/>
          <path d="M87 90h7M111 90h7" stroke="#2a211d" strokeWidth="4" strokeLinecap="round"/><path d="M94 107c7 4 12 4 19 0" stroke="#824f40" strokeWidth="3" strokeLinecap="round"/>
        </g>
        <g transform="translate(485 128)">
          <circle cx="100" cy="86" r="43" fill="#c98568"/><path d="M59 82c2-43 75-58 84 1-17-14-62-19-84-1z" fill="#302720"/>
          <path d="M67 130c21-13 47-13 68 0l16 106H49z" fill="#55786e"/>
          <path d="M66 147l-49 30" stroke="#55786e" strokeWidth="24" strokeLinecap="round"/><path d="M135 147l54-45" stroke="#55786e" strokeWidth="24" strokeLinecap="round"/>
          <circle cx="194" cy="98" r="11" fill="#c98568"/><path d="M87 90h7M111 90h7" stroke="#2a211d" strokeWidth="4" strokeLinecap="round"/><path d="M91 105c10 10 20 10 30 0" stroke="#824f40" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <path d="M184 76l14-15M202 78l17-7" stroke="#d9c06f" strokeWidth="3" strokeLinecap="round"/>
        </g>
        <text x="180" y="394" textAnchor="middle" fill="#9fb5aa" fontFamily="DM Sans" fontSize="14" letterSpacing="2">HOLDING BACK</text>
        <text x="548" y="394" textAnchor="middle" fill="#e8d590" fontFamily="DM Sans" fontSize="14" letterSpacing="2">FULL ACCESS</text>
      </svg>
      <p>Same intelligence. Same warmth. More access when the moment matters.</p>
    </div>
  );
}

function EngineSection() {
  const [technical, setTechnical] = useState(true);
  const [exposure, setExposure] = useState(false);
  const both = technical && exposure;
  const outcome = both ? "Clearer thinking + stronger delivery + real-world courage" : technical ? "The tools are learned, but fear can still keep them out of reach." : exposure ? "Action is growing. Add technique to make each speaking moment stronger." : "Activate an engine to see how the method works.";

  return (
    <section className="method-section method-engines" id="engines">
      <Reveal className="method-heading">
        <p className="method-eyebrow">The Two Engines of Transformation</p>
        <h2>Knowing how is not the same as being able to do it under pressure.</h2>
        <p>Activate each engine to see why lasting progress needs both.</p>
      </Reveal>
      <div className={`engine-system ${both ? "both-active" : ""}`}>
        <button className={`engine-card ${technical ? "active" : ""}`} type="button" aria-pressed={technical} onClick={() => setTechnical((value) => !value)}>
          <span className="engine-switch" aria-hidden="true"><span /></span>
          <span className="engine-number">01</span>
          <strong>Technical Training</strong>
          <small>How you communicate</small>
          <span className="engine-skills">Structure · Volume · Pauses · Vocal variety · Body language · Storytelling</span>
        </button>
        <div className="engine-link" aria-hidden="true"><span className="engine-pulse" /></div>
        <button className={`engine-card exposure ${exposure ? "active" : ""}`} type="button" aria-pressed={exposure} onClick={() => setExposure((value) => !value)}>
          <span className="engine-switch" aria-hidden="true"><span /></span>
          <span className="engine-number">02</span>
          <strong>Exposure Training</strong>
          <small>Whether you communicate when it matters</small>
          <span className="engine-skills">Start small · Act early · Repeat · Collect evidence · Increase the challenge</span>
        </button>
      </div>
      <div className={`access-visual ${both ? "unlocked" : technical ? "tools-only" : ""}`} aria-live="polite">
        <div className="access-tools" aria-label="Communication tools">
          {["PREP", "VOICE", "PAUSE", "STORY"].map((tool) => <span key={tool}>{tool}</span>)}
        </div>
        <div className="access-gate"><span>{both ? "ACCESS OPEN" : "ACCESS LIMITED"}</span></div>
        <div className="access-world">
          {[
            ["Meeting", "M"], ["Conversation", "C"], ["Interview", "I"], ["Presentation", "P"],
          ].map(([label, initial]) => <span key={label} aria-label={label}>{initial}<small>{label}</small></span>)}
        </div>
      </div>
      <p className="engine-outcome" aria-live="polite">{outcome}</p>
    </section>
  );
}

function ExposureLadder() {
  const [selected, setSelected] = useState(1);
  const level = levels[selected - 1];
  return (
    <section className="method-section ladder-section" id="ladder">
      <Reveal className="method-heading">
        <p className="method-eyebrow">The Ten-Level Exposure Ladder</p>
        <h2>Confidence grows one visible behavior at a time.</h2>
        <p>Choose any level to explore its objective, workplace actions and one practical mission.</p>
      </Reveal>
      <div className="ladder-scroll" aria-label="Ten-level Exposure Ladder">
        <div className="ladder-steps">
          {levels.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`ladder-step ${selected === item.id ? "active" : ""} ${item.id <= selected ? "reached" : ""}`}
              style={{ "--step": item.id }}
              aria-pressed={selected === item.id}
              aria-label={`Level ${item.id}: ${item.name}`}
              onClick={() => setSelected(item.id)}
            >
              <span>{String(item.id).padStart(2, "0")}</span>
              <strong>{item.name}</strong>
            </button>
          ))}
        </div>
      </div>
      <div className="level-detail" aria-live="polite">
        <div className="level-detail-intro">
          <p>Level {level.id}</p>
          <h3>{level.name}</h3>
          <strong>{level.objective}</strong>
          <span className="unlock-pill">Unlocks: {level.unlock}</span>
        </div>
        <div className="level-actions">
          <p className="detail-label">Workplace actions</p>
          <ul>{level.actions.map((action) => <li key={action}>{action}</li>)}</ul>
        </div>
        <div className="level-mission">
          <p className="detail-label">Your exposure mission</p>
          <p>{level.mission}</p>
        </div>
      </div>
      <div className="transformation-line" aria-label="Transformation from invisible to fully expressed">
        {[
          "Invisible", "Present", "Participating", "Contributing", "Leading", "Fully Expressed",
        ].map((stage, index) => <span key={stage} className={selected >= index * 2 ? "active" : ""}>{stage}</span>)}
      </div>
      <p className="ladder-note">Level 10 does not mean becoming loud or extroverted. It means having the freedom to express yourself fully when you choose.</p>
    </section>
  );
}

function LevelAssessment() {
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const current = assessmentStatements[step];
  const resultLevel = result ? levels[result.level - 1] : null;

  const choose = () => setResult(current);
  const next = () => setStep((value) => Math.min(value + 1, assessmentStatements.length - 1));
  const reset = () => { setResult(null); setStep(0); };

  return (
    <section className="method-section assessment-section" id="assessment">
      <Reveal className="method-heading">
        <p className="method-eyebrow">Find Your Current Level</p>
        <h2>Your next step should feel challenging, not overwhelming.</h2>
        <p>Choose the first statement that feels closest to your current behavior. This is a helpful self-assessment, not a clinical evaluation.</p>
      </Reveal>
      <div className="assessment-card">
        {!result ? (
          <div className="assessment-question">
            <div className="assessment-progress" aria-label={`Statement ${step + 1} of ${assessmentStatements.length}`}>
              <span style={{ width: `${((step + 1) / assessmentStatements.length) * 100}%` }} />
            </div>
            <p className="assessment-count">Statement {step + 1} of {assessmentStatements.length}</p>
            <h3>“{current.statement}”</h3>
            <div className="assessment-actions">
              <button type="button" className="method-btn primary" onClick={choose}>This sounds like me</button>
              {step < assessmentStatements.length - 1 && <button type="button" className="method-btn ghost" onClick={next}>Not quite, show me the next one</button>}
            </div>
            {step > 0 && <button type="button" className="assessment-back" onClick={() => setStep((value) => value - 1)}>Previous statement</button>}
          </div>
        ) : (
          <div className="assessment-result" aria-live="polite">
            <div className="result-level"><span>Likely current level</span><strong>{result.level}</strong></div>
            <div className="result-copy">
              <p className="method-eyebrow">Level {result.level}</p>
              <h3>{resultLevel.name}</h3>
              <p><strong>What you may already be capable of:</strong> {result.capable}</p>
              <p><strong>Your next behavior:</strong> {result.next}</p>
              <div className="result-mission"><span>Your small exposure mission</span>{result.mission}</div>
              <p className="result-reminder">You do not need to conquer all ten levels today. You only need to take the next step.</p>
              <div className="assessment-actions">
                <a className="method-btn primary" href={PURCHASE_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackMethodCta("assessment_purchase", true)}>Build My Confidence With Speaker's Gym</a>
                <button type="button" className="method-btn ghost" onClick={reset}>Retake assessment</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function VersionsGame() {
  const [outcome, setOutcome] = useState("completed");
  return (
    <section className="method-section versions-section" id="versions">
      <Reveal className="method-heading">
        <p className="method-eyebrow">The Version's Game</p>
        <h2>Progress is not pass or fail. It is test, learn and improve.</h2>
        <p className="method-distinction"><strong>Levels</strong> measure the capability you are building. <strong>Versions</strong> improve the strategy you use to reach the next level.</p>
      </Reveal>
      <div className="version-loop" aria-label="Six-step Version's Game loop">
        {["Choose a goal", "Attempt it", "Record evidence", "Notice what worked", "Improve the strategy", "Attempt again"].map((label, index) => (
          <div className="version-loop-step" key={label}><span>{index + 1}</span><strong>{label}</strong></div>
        ))}
        <span className="version-runner" aria-hidden="true" />
      </div>
      <div className="version-example">
        <div className="version-goal">
          <p>Version 1 Goal</p>
          <h3>Ask one question during Tuesday's team meeting.</h3>
          <ul><li>One specific goal</li><li>One real-world situation</li><li>One visible action</li><li>A defined period</li></ul>
        </div>
        <div className="version-outcome">
          <div className="outcome-tabs" role="group" aria-label="Choose the version outcome">
            <button type="button" className={outcome === "completed" ? "active" : ""} aria-pressed={outcome === "completed"} onClick={() => setOutcome("completed")}>Mission completed</button>
            <button type="button" className={outcome === "retry" ? "active" : ""} aria-pressed={outcome === "retry"} onClick={() => setOutcome("retry")}>Not completed yet</button>
          </div>
          {outcome === "completed" ? (
            <div className="outcome-panel" aria-live="polite"><span>Evidence collected</span><h4>The action happened.</h4><p>Record the evidence, repeat until the behavior becomes reliable, then prepare for the next version or level.</p></div>
          ) : (
            <div className="outcome-panel retry" aria-live="polite"><span>Strategy update</span><h4>Remove judgment. Keep the destination.</h4><p>Ask: <strong>What five ideas could help me win tomorrow?</strong> Improve the strategy, make the action more achievable and attempt it again.</p></div>
          )}
        </div>
      </div>
      <div className="version-quotes"><p>“A loss is simply an opportunity to try again, but smarter.”</p><p>“Every worthwhile destination is several versions away.”</p></div>
    </section>
  );
}

function MethodPage() {
  useEffect(() => {
    const title = "The Speaker's Gym Method | Build Confidence Through Action";
    const description = "Discover how technical communication training, gradual exposure, the ten-level Exposure Ladder and the Version's Game build real speaking confidence.";
    const previousTitle = document.title;
    const updates = [];
    const setMeta = (selector, attributes) => {
      let element = document.querySelector(selector);
      const created = !element;
      if (!element) { element = document.createElement("meta"); document.head.appendChild(element); }
      const previous = {};
      Object.entries(attributes).forEach(([name, value]) => { previous[name] = element.getAttribute(name); element.setAttribute(name, value); });
      updates.push({ element, created, previous });
    };
    document.title = title;
    setMeta('meta[name="description"]', { name: "description", content: description });
    setMeta('meta[property="og:title"]', { property: "og:title", content: title });
    setMeta('meta[property="og:description"]', { property: "og:description", content: description });
    setMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    setMeta('meta[property="og:url"]', { property: "og:url", content: "https://www.speakers-gym.com/method" });
    setMeta('meta[property="og:image"]', { property: "og:image", content: "https://www.speakers-gym.com/Logo.png" });
    setMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    setMeta('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    setMeta('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    setMeta('meta[name="twitter:image"]', { name: "twitter:image", content: "https://www.speakers-gym.com/Logo.png" });
    window.scrollTo(0, 0);
    if (typeof window.gtag === "function") window.gtag("event", "method_page_view", { page_path: "/method" });
    if (typeof window.fbq === "function") window.fbq("trackCustom", "MethodPageView");
    return () => {
      document.title = previousTitle;
      updates.forEach(({ element, created, previous }) => {
        if (created) element.remove();
        else Object.entries(previous).forEach(([name, value]) => value === null ? element.removeAttribute(name) : element.setAttribute(name, value));
      });
    };
  }, []);

  return (
    <div className="method-page">
      <SiteHeader page="method" />
      <main>
        <section className="method-hero">
          <div className="method-shell method-hero-grid">
            <Reveal className="method-hero-copy">
              <p className="method-eyebrow">The Speaker's Gym Method</p>
              <h1>Your voice is already there.</h1>
              <h2>We train you to use it when it matters.</h2>
              <p>You can understand structure, volume and vocal variety perfectly, but those skills cannot help if fear stops you from speaking. Speaker's Gym combines communication training with gradual real-world exposure so confidence becomes something you build through action.</p>
              <div className="method-hero-actions">
                <a href="#assessment" className="method-btn primary" onClick={() => trackMethodCta("discover_level")}>Discover Your Current Level</a>
                <a href={BOOK_URL} className="method-btn ghost" onClick={() => trackMethodCta("hero_book")}>Book a Strategy Call</a>
              </div>
              <blockquote>Technique gives you the tools. <strong>Exposure gives you access to them.</strong></blockquote>
            </Reveal>
            <Reveal delay={120}><PersonJourney id="hero-journey" /></Reveal>
          </div>
        </section>

        <section className="method-section method-why" id="why">
          <Reveal className="method-heading">
            <p className="method-eyebrow">Why Traditional Training Falls Short</p>
            <h2>The problem is not always that you do not know what to say.</h2>
            <p>Sometimes, fear does not give you permission to say it.</p>
          </Reveal>
          <div className="comparison-grid">
            <Reveal>
              <article className="comparison-card traditional">
                <div className="comparison-icon" aria-hidden="true">◌</div>
                <p>Traditional training</p><h3>Learn the technique</h3>
                <ul><li>Watch lessons</li><li>Study frameworks</li><li>Practise alone</li><li>Understand good speaking</li></ul>
                <div className="comparison-result"><span className="lock-icon">⌁</span><p>The tools exist, but fear keeps them locked when the real moment arrives.</p></div>
              </article>
            </Reveal>
            <Reveal delay={120}>
              <article className="comparison-card method">
                <div className="comparison-icon" aria-hidden="true">✓</div>
                <p>The Speaker's Gym Method</p><h3>Learn, apply and collect evidence</h3>
                <ul><li>Learn one skill</li><li>Practise it safely</li><li>Apply it through gradual exposure</li><li>Reflect, adapt and repeat</li></ul>
                <div className="comparison-result"><span className="unlock-icon">↗</span><p>The student gains access to their skills under real conditions.</p></div>
              </article>
            </Reveal>
          </div>
          <Reveal><p className="method-manifesto">You do not become confident and then speak. <strong>You speak, collect evidence and build confidence.</strong></p></Reveal>
        </section>

        <EngineSection />
        <ExposureLadder />
        <LevelAssessment />
        <VersionsGame />

        <section className="method-section system-section" id="system">
          <Reveal className="method-heading">
            <p className="method-eyebrow">One Connected System</p>
            <h2>Every part tells you exactly what to do next.</h2>
          </Reveal>
          <div className="system-path">
            {[
              ["Levels", "Where you are going", "01"],
              ["Versions", "What you are trying next", "02"],
              ["Technical Training", "How you improve your communication", "03"],
              ["Exposure", "How you use those skills in real life", "04"],
            ].map(([title, description, number], index) => (
              <Reveal key={title} delay={index * 90}>
                <article className="system-card"><span>{number}</span><h3>{title}</h3><p>{description}</p></article>
              </Reveal>
            ))}
            <div className="system-path-line" aria-hidden="true" />
          </div>
          <div className="system-summary">
            <p>The level shows where you are going.</p><p>The version shows what you are trying next.</p><p>Technical training improves how you speak.</p><p>Exposure teaches you to speak when it matters.</p>
          </div>
        </section>

        <section className="method-section method-program" id="program">
          <Reveal className="method-heading">
            <p className="method-eyebrow">The Method in Action</p>
            <h2>Six weeks. One connected transformation.</h2>
            <p>Exposure begins in Week 2 and continues through every remaining week. Each new communication skill is carried into real life.</p>
          </Reveal>
          <div className="program-timeline">
            {programWeeks.map(([week, title, description], index) => (
              <Reveal key={week} delay={index * 70}>
                <article className="program-week"><span>Week {week}</span><div><h3>{title}</h3><p>{description}</p></div></article>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="method-closing">
          <div className="method-shell method-closing-grid">
            <Reveal><PersonJourney id="closing-journey" /></Reveal>
            <Reveal delay={100} className="method-closing-copy">
              <p className="method-eyebrow">Your Personality, Fully Available</p>
              <h2>You do not need a different personality.</h2>
              <h3>You need a system that helps your real personality come through.</h3>
              <p>Speaker's Gym combines practical communication skills, gradual exposure, live coaching and repeated feedback. You build confidence through real evidence, one level and one version at a time.</p>
              <div className="method-hero-actions">
                <a href={PURCHASE_URL} target="_blank" rel="noopener noreferrer" className="method-btn primary" onClick={() => trackMethodCta("closing_purchase", true)}>Start Your Transformation</a>
                <a href={BOOK_URL} className="method-btn ghost" onClick={() => trackMethodCta("closing_book")}>Book a Free Strategy Call</a>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
      <div className="method-sticky-cta"><a href="#assessment">Discover Your Level</a></div>
    </div>
  );
}

export default MethodPage;
