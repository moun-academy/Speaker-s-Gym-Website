import { useEffect, useMemo, useState } from "react";
import brandLogo from "./Logo.png";
import "./GroupCoaching.css";

const CHALLENGE_URL = "https://www.skool.com/speakersgym/classroom/452d41c9?md=d4ac2851b073485ea1595cfe6245736b";

/* Paste the Speaker's Gym app link here to show the "Open the app" button. */
const APP_URL = "";

const navItems = [
  ["agenda", "Plan"],
  ["intros", "Meet"],
  ["prep", "PREP"],
  ["app", "App"],
  ["challenge", "Challenge"],
];

const agenda = [
  ["01", "👋", "Get to know each other", "Who is in the room, and what makes you smile."],
  ["02", "🧩", "Review PREP", "Four questions, four phrases, one clear answer."],
  ["03", "📱", "Speaker's Gym app", "Practice PREP out loud and get feedback."],
  ["04", "🔥", "The 5-Day Challenge", "Take it into the community and keep going."],
];

const introPrompts = [
  ["🌤️", "Your name, where you are joining from, and one word for how your day is going"],
  ["🎣", "What is a hobby or activity you could talk about for an hour without noticing the time?"],
  ["🦸", "If you could instantly master any skill, what would you pick?"],
  ["🍜", "What is the best meal you have ever had, and where were you?"],
  ["🎧", "What song always puts you in a good mood?"],
  ["🎤", "Would you rather speak to a crowd of 1,000 or have a one-on-one chat with your hero?"],
  ["☕", "What is a small thing that always makes your day better?"],
  ["🍽️", "If you could have dinner with anyone, living or not, who would be at the table?"],
  ["✈️", "What is the best trip you have ever taken?"],
  ["💬", "What is one thing you would love to feel confident saying out loud by the end of this program?"],
];

/* Questions, phrases and anchors come from the student portals (Week 1). */
const prep = [
  {
    letter: "P", name: "Point", emoji: "🎯", tone: "gold", anchor: "IDEA",
    ask: "What is the one thing I am trying to say?",
    hint: "One sentence. Say the idea before you explain it.",
    starters: ["I believe…", "In my opinion…"],
    example: "A short walk is one of the best ways to reset your mind.",
  },
  {
    letter: "R", name: "Reason", emoji: "💡", tone: "coral", anchor: "WHY",
    ask: "Why do I believe it?",
    hint: "One strong why. Choose the reason that matters most.",
    starters: ["The main reason is…", "This matters because…"],
    example: "Movement creates distance from whatever is making you feel stuck.",
  },
  {
    letter: "E", name: "Example", emoji: "📖", tone: "teal", anchor: "MOMENT",
    ask: "When have I seen it?",
    hint: "Be specific. Choose one moment, action, or observation.",
    starters: ["For example…", "For instance…"],
    example: "When I walk after a stressful meeting, I return calmer and think more clearly.",
  },
  {
    letter: "P", name: "Final Point", emoji: "🏁", tone: "violet", anchor: "TAKEAWAY",
    ask: "What should they remember?",
    hint: "Restate your opinion, make a recommendation, or reinforce what you believe.",
    starters: ["That’s why…", "That is why I believe…"],
    example: "That is why I recommend a short walk when your mind feels crowded.",
  },
];

const topics = [
  "A habit that improves your day",
  "A place you would recommend",
  "An activity that helps you relax",
  "Something useful you recently learned",
];

const appSteps = [
  ["🎲", "Choose a prompt"],
  ["🎙️", "Record your PREP answer"],
  ["🤖", "Review the AI feedback"],
  ["🔁", "Try again with one improvement"],
];

const challengeDays = [
  ["Day 1", "🧱", "Clear structure", "PREP"],
  ["Day 2", "🔊", "Volume variety", "PREP + volume"],
  ["Day 3", "🐢", "Control your pace", "PREP + pace"],
  ["Day 4", "⏸️", "The power of a pause", "PREP + pauses"],
  ["Day 5", "🎭", "Speak with expression", "PREP + pitch"],
];

const routine = [["📚", "Learn"], ["💪", "Try"], ["🎥", "Record"], ["🤝", "Share"]];
const heroChips = ["I believe…", "The main reason is…", "For example…", "That’s why…"];

function GroupCoaching() {
  const [section, setSection] = useState("");
  const [pick, setPick] = useState(0);
  const [flip, setFlip] = useState(0);
  const [active, setActive] = useState(0);
  const [topic, setTopic] = useState(topics[0]);
  const [answers, setAnswers] = useState(["", "", "", ""]);

  const drawQuestion = () => {
    setPick((current) => {
      let next = current;
      while (next === current) next = Math.floor(Math.random() * introPrompts.length);
      return next;
    });
    setFlip((n) => n + 1);
  };

  const setAnswer = (i, value) => setAnswers((a) => a.map((v, idx) => (idx === i ? value : v)));
  const addStarter = (i, starter) =>
    setAnswers((a) => a.map((v, idx) => (idx === i && !v.trim() ? starter.replace("…", " ") : v)));
  const assembled = useMemo(() => answers.map((a) => a.trim()).filter(Boolean).join(" "), [answers]);
  const filled = answers.filter((a) => a.trim()).length;

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

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setSection(e.target.id); }),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    navItems.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const current = prep[active];

  return (
    <div className="gc-page">
      <header className="gc-nav">
        <a href="/" className="gc-nav-logo" aria-label="The Speaker's Gym home">
          <img src={brandLogo} alt="The Speaker's Gym" />
        </a>
        <nav className="gc-pills" aria-label="Session sections">
          {navItems.map(([id, label]) => (
            <a key={id} href={`#${id}`} className={section === id ? "is-on" : ""}>{label}</a>
          ))}
        </nav>
      </header>

      <section className="gc-hero">
        <div className="gc-hero-glow" aria-hidden="true" />
        <div className="gc-floaters" aria-hidden="true">
          {heroChips.map((c, i) => <span key={c} style={{ "--i": i }}>{c}</span>)}
        </div>
        <p className="gc-eyebrow">Group Coaching Session</p>
        <h1>Welcome to the <em>room.</em> 👋</h1>
        <p className="gc-lede">
          Let's meet each other, learn the four questions behind every clear answer, practice in
          the Speaker's Gym app, and finish with a challenge that's actually fun.
        </p>
        <a href="#agenda" className="gc-btn gc-btn--gold">Let's go ↓</a>
      </section>

      <section id="agenda" className="gc-section">
        <div className="gc-wrap">
          <p className="gc-eyebrow gc-reveal">Today's plan</p>
          <h2 className="gc-reveal">Four steps. One session.</h2>
          <ol className="gc-agenda">
            {agenda.map(([n, icon, title, text]) => (
              <li key={n} className="gc-agenda-item gc-reveal">
                <span className="gc-icon" aria-hidden="true">{icon}</span>
                <div>
                  <small>Step {n}</small>
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
              Speaking is easier in a room where people know you. Pick a question, answer it in
              a sentence or two, then pass it on.
            </p>
            <button type="button" className="gc-btn gc-btn--gold" onClick={drawQuestion}>🎲 Pick a question</button>
          </div>
          <div className="gc-reveal">
            <div className="gc-card" aria-live="polite" key={flip}>
              <span className="gc-card-emoji" aria-hidden="true">{introPrompts[pick][0]}</span>
              <small>Question {pick + 1} of {introPrompts.length}</small>
              <p>{introPrompts[pick][1]}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="prep" className="gc-section">
        <div className="gc-wrap">
          <p className="gc-eyebrow gc-reveal">Step 2</p>
          <h2 className="gc-reveal">PREP: four questions to ask yourself</h2>
          <p className="gc-sub gc-reveal">
            Ask the question. Start the sentence with the phrase. Move to the next step. Tap each
            one to see how it works.
          </p>

          <div className="gc-prep gc-reveal" data-tone={current.tone}>
            <div className="gc-prep-tabs" role="tablist" aria-label="PREP steps">
              {prep.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  data-tone={s.tone}
                  aria-selected={i === active}
                  className={i === active ? "is-active" : ""}
                  onClick={() => setActive(i)}
                >
                  <em aria-hidden="true">{s.emoji}</em>
                  <b>{s.letter}</b>
                  <span>{s.name}</span>
                </button>
              ))}
            </div>
            <div className="gc-prep-panel" role="tabpanel" aria-live="polite" key={active}>
              <small>Ask yourself</small>
              <p className="gc-prep-ask">{current.ask}</p>
              <p className="gc-prep-hint">{current.hint}</p>

              <div className="gc-prep-row">
                <div>
                  <small>Start your sentence with</small>
                  <div className="gc-chips">
                    {current.starters.map((s) => <span key={s}>{s}</span>)}
                  </div>
                </div>
                <div>
                  <small>Your keyword to remember</small>
                  <div className="gc-chips"><span className="gc-anchor">{current.anchor}</span></div>
                </div>
              </div>

              <blockquote>
                <small>In action</small>
                “{current.example}”
              </blockquote>

              <div className="gc-prep-nav">
                <button type="button" onClick={() => setActive((active + 3) % 4)} aria-label="Previous step">← Back</button>
                <button type="button" onClick={() => setActive((active + 1) % 4)}>
                  {active < 3 ? `Next: ${prep[active + 1].name} →` : "Start over ↺"}
                </button>
              </div>
            </div>
          </div>

          <div className="gc-lab gc-reveal">
            <div className="gc-lab-head">
              <h3>🧪 Try it now</h3>
              <p>Pick a topic, answer each question in your own words, and watch your answer come together.</p>
            </div>
            <div className="gc-topics" role="group" aria-label="Topic">
              {topics.map((t) => (
                <button key={t} type="button" className={t === topic ? "is-on" : ""} onClick={() => setTopic(t)}>{t}</button>
              ))}
            </div>
            <div className="gc-lab-grid">
              {prep.map((s, i) => (
                <label key={i} className="gc-field" data-tone={s.tone}>
                  <span><b>{s.letter}</b> {s.name} · {s.ask}</span>
                  <textarea
                    rows="2"
                    value={answers[i]}
                    placeholder={s.starters[0]}
                    onChange={(e) => setAnswer(i, e.target.value)}
                  />
                  <div className="gc-field-chips">
                    {s.starters.map((st) => (
                      <button type="button" key={st} onClick={() => addStarter(i, st)}>{st}</button>
                    ))}
                  </div>
                </label>
              ))}
            </div>
            <div className="gc-result" aria-live="polite">
              <div className="gc-meter" aria-hidden="true"><i style={{ width: `${filled * 25}%` }} /></div>
              <small>{filled === 4 ? "🎉 Your PREP answer" : `${filled} of 4 steps · ${topic}`}</small>
              <p>{assembled || "Your answer will build here as you type."}</p>
              {filled > 0 && <button type="button" onClick={() => setAnswers(["", "", "", ""])}>Clear</button>}
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
            {appSteps.map(([icon, s], i) => (
              <li key={s}><span aria-hidden="true">{icon}</span><div><small>Step {i + 1}</small>{s}</div></li>
            ))}
          </ol>
        </div>
      </section>

      <section id="challenge" className="gc-section gc-final">
        <div className="gc-wrap">
          <p className="gc-eyebrow gc-reveal">Step 4</p>
          <h2 className="gc-reveal">Take the 5-Day Challenge 🔥</h2>
          <p className="gc-sub gc-reveal">
            A clear thought. A voice that brings it to life. Five short practice sessions inside our
            Skool community, 10 to 15 minutes a day.
          </p>
          <ul className="gc-routine gc-reveal" aria-label="Daily routine">
            {routine.map(([icon, label], i) => (
              <li key={label}><span aria-hidden="true">{icon}</span>{label}{i < routine.length - 1 && <i aria-hidden="true">→</i>}</li>
            ))}
          </ul>
          <ul className="gc-days gc-reveal">
            {challengeDays.map(([d, icon, t, k]) => (
              <li key={d}><em aria-hidden="true">{icon}</em><small>{d}</small><strong>{t}</strong><span>{k}</span></li>
            ))}
          </ul>
          <a href={CHALLENGE_URL} className="gc-btn gc-btn--gold gc-btn--big gc-reveal" target="_blank" rel="noopener noreferrer">
            Join the challenge on Skool →
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
