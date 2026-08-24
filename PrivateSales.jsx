import { useEffect, useRef, useState } from "react";
import { PURCHASE_URL } from "./siteConfig.js";
import "./PrivateSales.css";

const sections = ["Transformation", "The Difference", "Your Levels", "The System", "The Offer"];

const roadmapSkills = ["PREP", "Clear structure", "Vocal variety", "Volume", "Pauses", "Pace", "Pitch", "Tone"];

const practiceSteps = ["Start manageable", "Complete real Missions", "Use the techniques under pressure", "Collect evidence", "Raise the challenge"];

const exposureLevels = [
  { number: "01", title: "Be Seen", group: "LOW PRESSURE" },
  { number: "02", title: "Initiate", group: "LOW PRESSURE" },
  { number: "03", title: "Speak Up", group: "LOW PRESSURE" },
  { number: "04", title: "Hold Attention", group: "BUILDING RANGE" },
  { number: "05", title: "Express", group: "BUILDING RANGE" },
  { number: "06", title: "Take Social Risks", group: "BUILDING RANGE" },
  { number: "07", title: "Show Personality", group: "REAL-WORLD FREEDOM" },
  { number: "08", title: "Be Playful & Personal", group: "REAL-WORLD FREEDOM" },
  { number: "09", title: "Lead the Energy", group: "REAL-WORLD FREEDOM" },
  { number: "10", title: "Your Real Goal", group: "REAL-WORLD FREEDOM" },
];

const programItems = [
  "Six weeks of private one-on-one coaching",
  "Six hours of live coaching",
  "A personalized communication roadmap",
  "A personalized level-based exposure plan",
  "Full access to the three-hour MOUN Academy course",
  "Practical exercises after every lecture",
  "Speaker's Gym App with AI feedback",
  "Performance Tracker showing weekly improvement",
  "Feedback on your real speaking situations",
  "Conversation Playbook bonus",
];

const offerItems = [
  "Six private coaching sessions",
  "Personalized roadmap",
  "Personalized exposure Levels and Missions",
  "MOUN Academy",
  "Speaker's Gym App and AI feedback",
  "Performance Tracker",
  "Conversation Playbook, normally $47, included free",
];

const testimonials = [
  { name: "Imane", videoId: "AmX2dVv8qcM" },
  { name: "Vivek", videoId: "cm3G7biEwHI" },
  { name: "Kevin", videoId: "Kctzf04s41c" },
];

function ArrowIcon({ direction = "next" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={direction === "next" ? "M5 12h14M14 7l5 5-5 5" : "M19 12H5m5-5-5 5 5 5"} />
    </svg>
  );
}

function PrivateSalesPage() {
  const [activeSection, setActiveSection] = useState(0);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const title = "Private Speaker's Gym Program Presentation";
    const previousTitle = document.title;
    const existingRobots = document.querySelector('meta[name="robots"]');
    const previousRobots = existingRobots?.getAttribute("content");
    const robots = existingRobots || document.createElement("meta");

    if (!existingRobots) {
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }

    document.title = title;
    robots.setAttribute("content", "noindex, nofollow, noarchive, nosnippet");
    document.documentElement.classList.add("sales-presentation-active");
    document.body.classList.add("sales-presentation-active");
    window.scrollTo(0, 0);

    return () => {
      document.title = previousTitle;
      document.documentElement.classList.remove("sales-presentation-active");
      document.body.classList.remove("sales-presentation-active");
      if (!existingRobots) robots.remove();
      else if (previousRobots === null) robots.removeAttribute("content");
      else robots.setAttribute("content", previousRobots);
    };
  }, []);

  useEffect(() => {
    const observers = sectionRefs.current.map((section, index) => {
      if (!section) return null;
      const observer = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(index); },
        { threshold: 0.5 }
      );
      observer.observe(section);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, []);

  const goToSection = (index) => {
    const bounded = Math.max(0, Math.min(sections.length - 1, index));
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    sectionRefs.current[bounded]?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(tag)) return;
      if (["ArrowDown", "ArrowRight", "PageDown"].includes(event.key)) {
        event.preventDefault();
        goToSection(activeSection + 1);
      }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        goToSection(activeSection - 1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeSection]);

  const trackPurchase = () => {
    if (typeof window.gtag === "function") window.gtag("event", "private_sales_purchase_click", { page_path: "/private/speakers-gym-program" });
    if (typeof window.fbq === "function") window.fbq("track", "Lead");
  };

  return (
    <div className="private-sales-page">
      <header className="sales-brandbar">
        <a href="/" className="sales-wordmark" aria-label="The Speaker's Gym home">THE SPEAKER'S <span>GYM</span></a>
        <span className="sales-private-label">Private presentation</span>
      </header>

      <nav className="sales-progress" aria-label="Presentation sections">
        <span className="sales-progress-count">{String(activeSection + 1).padStart(2, "0")} / 05</span>
        <div className="sales-progress-track" aria-hidden="true"><span style={{ height: `${((activeSection + 1) / sections.length) * 100}%` }} /></div>
        <div className="sales-progress-dots">
          {sections.map((section, index) => (
            <button key={section} type="button" className={index === activeSection ? "active" : ""} onClick={() => goToSection(index)} aria-label={`Go to ${section}`} aria-current={index === activeSection ? "step" : undefined}>
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}
        </div>
      </nav>

      <main>
        <section className="sales-screen transformation-screen" ref={(node) => { sectionRefs.current[0] = node; }} aria-labelledby="transformation-title">
          <div className="sales-shell transformation-layout">
            <div className="transformation-copy">
              <p className="sales-eyebrow">The Speaker's Gym Transformation</p>
              <h1 id="transformation-title">From Shy Professional to <em>Confident Communicator</em></h1>
              <p className="sales-lede">You already have thoughts worth sharing. Speaker's Gym helps you express them with structure, a stronger voice, and growing confidence in real situations.</p>
            </div>
            <div className="transformation-visual" aria-label="Transformation from shy to confident, rambling to articulate, and monotone to expressive">
              {[["Shy", "Confident"], ["Rambling", "Articulate"], ["Monotone", "Expressive"]].map(([from, to], index) => (
                <div className="transformation-row" key={from} style={{ "--row": index }}>
                  <span>{from}</span><i aria-hidden="true"><b /></i><strong>{to}</strong>
                </div>
              ))}
              <div className="transformation-axis"><span>Held back</span><span>Fully expressed</span></div>
            </div>
          </div>
          <p className="sales-screen-note">Learn how to organize your thoughts, strengthen your voice, and gradually become comfortable speaking when the pressure is real.</p>
        </section>

        <section className="sales-screen difference-screen" ref={(node) => { sectionRefs.current[1] = node; }} aria-labelledby="difference-title">
          <div className="sales-shell">
            <p className="sales-eyebrow">The Speaker's Gym Difference</p>
            <h2 id="difference-title">To achieve any transformation, you need <em>two things.</em></h2>
            <div className="foundations-visual">
              <article className="foundation foundation-roadmap">
                <div className="foundation-number">01</div>
                <p className="foundation-kicker">MOUN Academy</p>
                <h3>The Roadmap</h3>
                <p>Three hours of practical lessons. One clear way forward.</p>
                <div className="skill-line" aria-label={roadmapSkills.join(", ")}>
                  {roadmapSkills.map((skill) => <span key={skill}>{skill}</span>)}
                </div>
              </article>
              <div className="foundation-connector" aria-hidden="true"><span>+</span></div>
              <article className="foundation foundation-practice">
                <div className="foundation-number">02</div>
                <p className="foundation-kicker">Personalized exposure</p>
                <h3>The Practice</h3>
                <p>Real speaking Missions shaped around the moments that matter to you.</p>
                <ol className="practice-line">
                  {practiceSteps.map((step, index) => <li key={step}><span>{String(index + 1).padStart(2, "0")}</span>{step}</li>)}
                </ol>
              </article>
            </div>
            <blockquote>Techniques teach you what to do. <strong>Exposure teaches you to do it when you feel nervous.</strong></blockquote>
          </div>
        </section>

        <section className="sales-screen levels-screen" ref={(node) => { sectionRefs.current[2] = node; }} aria-labelledby="levels-title">
          <div className="sales-shell levels-layout">
            <div className="levels-copy">
              <p className="sales-eyebrow">Personalized Exposure Levels</p>
              <h2 id="levels-title">Your path begins where <em>you are.</em></h2>
              <p>Every ladder is built around the situations you avoid and the communicator you want to become.</p>
              <div className="identity-sequence" aria-label="Mission leads to evidence which leads to confidence">
                <span>Mission</span><i>→</i><span>Evidence</span><i>→</i><strong>Confidence</strong>
              </div>
              <p className="personalization-line">This is not a generic exposure challenge. I build the Levels around your fears, your workplace, your goals, and the situations that matter to you.</p>
            </div>
            <div className="levels-spectrum" aria-label="Representative ten-level exposure progression">
              <div className="spectrum-guide"><span>Low pressure</span><span>Your real goal</span></div>
              <div className="spectrum-line" aria-hidden="true" />
              {exposureLevels.map((level, index) => (
                <div className="spectrum-level" key={level.number} style={{ "--level": index }}>
                  <span className="spectrum-number">{level.number}</span>
                  <strong>{level.title}</strong>
                  <small>{level.group}</small>
                </div>
              ))}
              <p className="spectrum-caption">Representative examples. Your ladder is personalized.</p>
            </div>
          </div>
          <div className="level-examples sales-shell">
            <div><span>LOWER LEVELS</span><p>Eye contact · Start a conversation · Record a private video</p></div>
            <div><span>MIDDLE LEVELS</span><p>Speak louder · Pause · Share more · Contribute in a meeting</p></div>
            <div><span>HIGHER LEVELS</span><p>Show personality · Use vocal variety · Speak to a group · Complete your biggest Mission</p></div>
          </div>
        </section>

        <section className="sales-screen system-screen" ref={(node) => { sectionRefs.current[3] = node; }} aria-labelledby="system-title">
          <div className="sales-shell">
            <div className="system-heading">
              <div>
                <p className="sales-eyebrow">The Complete System</p>
                <h2 id="system-title">Everything works <em>together.</em></h2>
              </div>
              <p>Direct coaching, a clear roadmap, deliberate practice and visible evidence of improvement.</p>
            </div>
            <div className="program-map">
              <div className="program-orbit" aria-hidden="true"><span>6</span><small>WEEKS</small></div>
              <ul>
                {programItems.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
              </ul>
            </div>
            <div className="proof-header"><p className="sales-eyebrow">Real Student Experiences</p><span>Press play during the call</span></div>
            <div className="sales-testimonials">
              {testimonials.map(({ name, videoId }) => (
                <article key={videoId} className="sales-testimonial">
                  <div className="sales-video">
                    <iframe src={`https://www.youtube-nocookie.com/embed/${videoId}?controls=1&modestbranding=1&rel=0`} title={`${name}'s Speaker's Gym testimonial`} loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
                  </div>
                  <p>{name}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="sales-screen offer-screen" ref={(node) => { sectionRefs.current[4] = node; }} aria-labelledby="offer-title">
          <div className="sales-shell offer-layout">
            <div className="offer-copy">
              <p className="sales-eyebrow">Your Invitation</p>
              <h2 id="offer-title">Your Six-Week Speaker's Gym <em>Transformation</em></h2>
              <p>One focused system built around your voice, your goals and the real moments where you want to speak with confidence.</p>
              <div className="offer-price">
                <div><span>Standard price</span><s>$167</s></div>
                <div><span>Exclusive new-member offer</span><strong>$147</strong></div>
              </div>
            </div>
            <div className="offer-card">
              <p className="offer-card-kicker">Start immediately</p>
              <ul>{offerItems.map((item) => <li key={item}><span>✓</span>{item}</li>)}</ul>
              <a href={PURCHASE_URL} target="_blank" rel="noopener noreferrer" onClick={trackPurchase}>Yes, I'm Ready to Start <ArrowIcon /></a>
              <p className="secure-note">Secure checkout via Stripe</p>
            </div>
          </div>
          <div className="sales-guarantee sales-shell">
            <div className="guarantee-seal"><strong>100%</strong><span>Protected</span></div>
            <div>
              <p className="sales-eyebrow">Train With Complete Confidence</p>
              <h3>100% Money-Back Guarantee</h3>
              <p>Complete the six-week program and put the exercises into practice. If you do not feel significantly more confident speaking by the end, I'll refund every penny and coach you for another 30 days, completely free. I'm committed to helping you get there.</p>
            </div>
          </div>
        </section>
      </main>

      <div className="sales-controls" aria-label="Presentation navigation">
        <button type="button" onClick={() => goToSection(activeSection - 1)} disabled={activeSection === 0} aria-label="Previous section"><ArrowIcon direction="previous" /></button>
        <span>{sections[activeSection]}</span>
        <button type="button" onClick={() => goToSection(activeSection + 1)} disabled={activeSection === sections.length - 1} aria-label="Next section"><ArrowIcon /></button>
      </div>
    </div>
  );
}

export default PrivateSalesPage;
