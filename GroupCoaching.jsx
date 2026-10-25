import { useEffect, useState } from "react";
import { COMMUNITY_URL } from "./siteConfig.js";
import brandLogo from "./Logo.png";
import "./GroupCoaching.css";

/* Paste the Speaker's Gym app link here to show the "Open the app" button. */
const APP_URL = "";

const agenda = [
  ["01", "Get to know each other", "Who is in the room and what each of us wants to change."],
  ["02", "Review PREP", "The four-step structure that ends rambling."],
  ["03", "Speaker's Gym app", "Practice PREP live and get feedback."],
  ["04", "The 5-Day Challenge", "Take what you practiced into the community."],
];

const introPrompts = [
  "Your name and where you are joining from",
  "Where speaking feels hardest: work, meetings, social situations",
  "One moment you wish you had spoken up",
  "What would feel like a win after the next six weeks",
];

const prep = [
  { letter: "P", name: "Point", line: "Say your main idea first.", example: "I think we should move the launch to March." },
  { letter: "R", name: "Reason", line: "Give the one reason that matters most.", example: "The team needs two more weeks to test properly." },
  { letter: "E", name: "Example", line: "Make it real with a specific moment.", example: "Last release we rushed, and customers found three bugs in a day." },
  { letter: "P", name: "Point", line: "Close by restating it, so it lands.", example: "That is why March is the safer and stronger date." },
];

const appSteps = [
  "Choose a prompt",
  "Record your PREP answer",
  "Review the AI feedback",
  "Try again with one improvement",
];

const challengeDays = [
  ["Day 1", "Structure"],
  ["Day 2", "Volume"],
  ["Day 3", "Pace"],
  ["Day 4", "Pauses"],
  ["Day 5", "Pitch"],
];

function GroupCoaching() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const previousTitle = document.title;
    const existing = document.querySelector('meta[name="robots"]');
    const previousRobots = existing?.getAttribute("content");
    const robots = existing || document.createElement("meta");
    if (!existing) {
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }
    document.title = "Group Coaching Session | The Speaker's Gym";
    robots.setAttribute("content", "noindex, nofollow");
    return () => {
      document.title = previousTitle;
      if (existing) existing.setAttribute("content", previousRobots ?? "");
      else robots.remove();
    };
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll(".gc-reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-in"));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.12 },
    );
    items.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const current = prep[active];

  return (
    <div className="gc-page">
      <header className="gc-nav">
        <a href="/" className="gc-nav-logo" aria-label="The Speaker's Gym home">
          <img src={brandLogo} alt="The Speaker's Gym" />
        </a>
      </header>

      <section className="gc-hero">
        <div className="gc-hero-glow" aria-hidden="true" />
        <p className="gc-eyebrow">Group Coaching Session</p>
        <h1>Welcome to the <em>room.</em></h1>
        <p className="gc-lede">
          Today we get to know each other, sharpen your structure with PREP, practice in the
          Speaker's Gym app, and finish with a challenge you can start right away.
        </p>
        <a href="#agenda" className="gc-btn gc-btn--gold">See today's plan</a>
      </section>

      <section id="agenda" className="gc-section">
        <div className="gc-wrap">
          <p className="gc-eyebrow gc-reveal">Today's plan</p>
          <h2 className="gc-reveal">Four steps. One session.</h2>
          <ol className="gc-agenda">
            {agenda.map(([n, title, text]) => (
              <li key={n} className="gc-agenda-item gc-reveal">
                <span className="gc-num">{n}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="intros" className="gc-section gc-section--alt">
        <div className="gc-wrap gc-split">
          <div className="gc-reveal">
            <p className="gc-eyebrow">Step 1</p>
            <h2>Get to know each other</h2>
            <p>
              Speaking is easier in a room where people know you. Take a minute and share:
            </p>
          </div>
          <ul className="gc-prompts gc-reveal">
            {introPrompts.map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
      </section>

      <section id="prep" className="gc-section">
        <div className="gc-wrap">
          <p className="gc-eyebrow gc-reveal">Step 2</p>
          <h2 className="gc-reveal">Review the PREP framework</h2>
          <p className="gc-sub gc-reveal">Tap each step to see it in action.</p>

          <div className="gc-prep gc-reveal">
            <div className="gc-prep-tabs" role="tablist" aria-label="PREP steps">
              {prep.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  className={i === active ? "is-active" : ""}
                  onClick={() => setActive(i)}
                >
                  <b>{s.letter}</b>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
            <div className="gc-prep-panel" role="tabpanel" aria-live="polite">
              <p className="gc-prep-line">{current.line}</p>
              <blockquote>“{current.example}”</blockquote>
            </div>
          </div>
        </div>
      </section>

      <section id="app" className="gc-section gc-section--alt">
        <div className="gc-wrap gc-split">
          <div className="gc-reveal">
            <p className="gc-eyebrow">Step 3</p>
            <h2>Into the Speaker's Gym app</h2>
            <p>
              Now we put PREP to work. Record a real answer, see what the AI feedback picks up,
              and improve it on the next attempt.
            </p>
            {APP_URL && <a href={APP_URL} className="gc-btn gc-btn--gold" target="_blank" rel="noopener noreferrer">Open the app</a>}
          </div>
          <ol className="gc-steps gc-reveal">
            {appSteps.map((s, i) => (
              <li key={s}><span>{i + 1}</span>{s}</li>
            ))}
          </ol>
        </div>
      </section>

      <section id="challenge" className="gc-section gc-final">
        <div className="gc-wrap">
          <p className="gc-eyebrow gc-reveal">Step 4</p>
          <h2 className="gc-reveal">Take the 5-Day Challenge</h2>
          <p className="gc-sub gc-reveal">
            Ten to fifteen minutes a day inside our Skool community. Record a short video each day
            and get feedback from other members.
          </p>
          <ul className="gc-days gc-reveal">
            {challengeDays.map(([d, t]) => (
              <li key={d}><small>{d}</small><strong>{t}</strong></li>
            ))}
          </ul>
          <a href={COMMUNITY_URL} className="gc-btn gc-btn--gold gc-reveal" target="_blank" rel="noopener noreferrer">
            Join the challenge on Skool
          </a>
        </div>
      </section>

      <footer className="gc-footer">
        <p>© {new Date().getFullYear()} The Speaker's Gym · All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default GroupCoaching;
