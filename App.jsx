import { useState, useEffect, useRef } from "react";

const SCHEDULE_URL = "https://marouanealmandri.com/schedule";
const COMMUNITY_URL = "https://www.skool.com/speakers-gym/about";

/* ─── tiny helpers ─── */
const cx = (...cls) => cls.filter(Boolean).join(" ");

function useOnScreen(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const visible = useOnScreen(ref);
  return (
    <div
      ref={ref}
      className={cx("reveal", visible && "reveal--visible", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

/* ─── countdown (static target — swap to your real date) ─── */
function useCountdown(target) {
  const calc = () => {
    const diff = Math.max(0, new Date(target) - new Date());
    return {
      days: String(Math.floor(diff / 864e5)).padStart(2, "0"),
      hours: String(Math.floor((diff % 864e5) / 36e5)).padStart(2, "0"),
      min: String(Math.floor((diff % 36e5) / 6e4)).padStart(2, "0"),
      sec: String(Math.floor((diff % 6e4) / 1e3)).padStart(2, "0"),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => { const id = setInterval(() => setT(calc()), 1000); return () => clearInterval(id); }, []);
  return t;
}

/* ─── FAQ Accordion ─── */
function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item" onClick={() => setOpen(!open)}>
      <div className="faq-q">
        <span>{q}</span>
        <span className={cx("faq-icon", open && "faq-icon--open")}>+</span>
      </div>
      <div className={cx("faq-a", open && "faq-a--open")}>
        <div className="faq-a-inner">{a}</div>
      </div>
    </div>
  );
}

/* ─────────────────── MAIN ─────────────────── */
export default function SpeakersGym() {
  const countdown = useCountdown("2026-04-30T23:59:59");
  const [mobileNav, setMobileNav] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --bg: #111111;
          --bg2: #141414;
          --bg3: #1b1b1b;
          --surface: #171717;
          --border: rgba(217, 192, 111, 0.14);
          --text: #e0ddd4;
          --text-dim: #9a9790;
          --accent: #d9c06f;
          --accent-dim: #e8d590;
          --accent-glow: rgba(217, 192, 111, 0.12);
          --danger: #ff4d4d;
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
        }

        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }

        html { scroll-behavior: smooth; background: var(--bg); }
        body { font-family: var(--font-body); color: var(--text); background: var(--bg); -webkit-font-smoothing: antialiased; }

        /* reveal animation */
        .reveal { opacity: 0; transform: translateY(32px); transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
        .reveal--visible { opacity: 1; transform: translateY(0); }

        /* ── NAV ── */
        .nav { position: fixed; top:0; left:0; right:0; z-index:100; background: rgba(17,17,17,.82); backdrop-filter: blur(14px); border-bottom: 1px solid var(--border); }
        .nav-inner { max-width:1200px; margin:0 auto; padding: 0 24px; height:64px; display:flex; align-items:center; justify-content:space-between; }
        .nav-logo { font-family:var(--font-display); font-size:1.3rem; font-style: italic; font-weight: 600; letter-spacing:.02em; color:var(--text); text-decoration:none; }
        .nav-logo span { color:var(--accent); }
        .nav-links { display:flex; gap:28px; align-items:center; }
        .nav-links a { color:var(--text-dim); text-decoration:none; font-size:.875rem; font-weight:500; transition: color .2s; }
        .nav-links a:hover { color:var(--accent); }
        .nav-cta { background:var(--accent); color:#0a0a0a; font-weight:700; font-size:.8rem; padding:10px 22px; border-radius:6px; text-decoration:none; letter-spacing:.04em; text-transform:uppercase; transition: transform .2s, box-shadow .2s; }
        .nav-cta:hover { transform:translateY(-1px); box-shadow: 0 0 20px var(--accent-glow); color:#0a0a0a; }
        .nav-hamburger { display:none; background:none; border:none; color:var(--text); font-size:1.5rem; cursor:pointer; }

        @media(max-width:768px) {
          .nav-links { display:none; }
          .nav-hamburger { display:block; }
          .mobile-menu { position:fixed; inset:0; z-index:99; background:rgba(10,10,10,.97); backdrop-filter:blur(20px); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:32px; }
          .mobile-menu a { color:var(--text); font-family:var(--font-display); font-size:2rem; text-decoration:none; letter-spacing:.02em; font-style: italic; }
          .mobile-menu a:hover { color:var(--accent); }
          .mobile-close { position:absolute; top:20px; right:24px; background:none; border:none; color:var(--text); font-size:2rem; cursor:pointer; }
        }

        /* ── HERO ── */
        .hero-wrap::before {
          content: '';
          display: block;
          height: 3px;
          background: linear-gradient(90deg, transparent 5%, var(--accent) 30%, var(--accent-dim) 50%, var(--accent) 70%, transparent 95%);
        }
        .hero { min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center; padding: 120px 24px 80px; position:relative; overflow:hidden; }
        .hero::before {
          content:'';
          position:absolute;
          inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px;
          pointer-events:none;
        }
        .hero::after {
          content:'';
          position:absolute;
          top:-60px;
          left:50%;
          transform:translateX(-50%);
          width:900px;
          height:520px;
          background: radial-gradient(ellipse, rgba(217, 192, 111, 0.06) 0%, transparent 65%);
          pointer-events:none;
        }
        .hero-content { position:relative; z-index:1; max-width:900px; }
        .hero-badge { display:inline-block; border:1px solid var(--accent); color:var(--accent); font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:6px 16px; border-radius:100px; margin-bottom:28px; }
        .hero-flourish { display:flex; align-items:center; justify-content:center; gap:16px; margin: 0 auto 36px; }
        .hero-flourish-line { width:60px; height:1px; background: linear-gradient(90deg, transparent, var(--accent), transparent); }
        .hero-flourish-diamond { width:8px; height:8px; background:var(--accent); transform:rotate(45deg); opacity:.7; }
        .hero h1 { font-family:var(--font-display); font-size:clamp(2.3rem,6vw,3.6rem); line-height:1.2; letter-spacing:.01em; margin-bottom:18px; font-style: italic; font-weight:600; color: var(--accent); }
        .hero p { font-size:1.1rem; color:var(--text-dim); max-width:650px; margin:0 auto 30px; line-height:1.7; }
        .hero-transforms { display:flex; flex-direction:column; align-items:center; margin:0 auto 40px; }
        .hero-transform-line { display:flex; align-items:center; gap:16px; padding:14px 0; }
        .hero-transform-line:not(:last-child) { border-bottom: 1px solid rgba(217, 192, 111, 0.08); }
        .hero-transform-from { font-size:16px; color:#5a5550; text-align:right; min-width:120px; }
        .hero-transform-arrow { display:flex; align-items:center; gap:6px; }
        .hero-transform-arrow-line { width:24px; height:1px; background:var(--accent); opacity:0.4; }
        .hero-transform-arrow-tip { width:6px; height:6px; border-top:1.5px solid var(--accent); border-right:1.5px solid var(--accent); transform:rotate(45deg); opacity:.6; }
        .hero-transform-to { font-family:var(--font-display); font-size:20px; font-style:italic; font-weight:600; color:#fff; text-align:left; min-width:120px; }
        .hero-btns { display:flex; gap:16px; justify-content:center; flex-wrap:wrap; }
        .btn-primary { background:var(--accent); color:#0a0a0a; font-weight:700; font-size:.85rem; padding:14px 32px; border-radius:8px; text-decoration:none; letter-spacing:.04em; text-transform:uppercase; transition: transform .2s, box-shadow .2s; display:inline-block; }
        .btn-primary:hover { transform:translateY(-2px); box-shadow: 0 4px 30px var(--accent-glow); }
        .btn-secondary { border:1px solid var(--border); color:var(--text); font-weight:600; font-size:.85rem; padding:14px 32px; border-radius:8px; text-decoration:none; letter-spacing:.02em; transition: border-color .2s, color .2s; display:inline-block; }
        .btn-secondary:hover { border-color:var(--accent); color:var(--accent); }

        .hero-video { max-width:900px; width:100%; margin:48px auto 0; border:1px solid var(--border); border-radius:14px; overflow:hidden; }
        .hero-video-embed { position:relative; width:100%; height:0; padding-bottom:56.25%; background:#000; }
        .hero-video-embed iframe { position:absolute; inset:0; width:100%; height:100%; border:0; display:block; }

        /* ── SECTION SHARED ── */
        .section { padding: 100px 24px; max-width:1200px; margin:0 auto; }
        .section-label { font-size:.75rem; font-weight:600; letter-spacing:.15em; text-transform:uppercase; color:var(--accent); margin-bottom:12px; }
        .section-title { font-family:var(--font-display); font-size:clamp(2rem,5vw,3rem); font-style:italic; font-weight:600; letter-spacing:.01em; margin-bottom:20px; color: #f2ecdf; }
        .section-subtitle { color:var(--text-dim); max-width:580px; line-height:1.6; font-size:1rem; }

        /* ── WHO IT'S FOR ── */
        .who-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:24px; margin-top:48px; }
        .who-card { background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:36px 32px; transition: border-color .3s, transform .3s; }
        .who-card:hover { border-color:var(--accent); transform:translateY(-4px); }
        .who-card-icon { font-size:2rem; margin-bottom:16px; display:block; }
        .who-card h3 { font-family:var(--font-display); font-size:1.35rem; font-style: italic; margin-bottom:10px; }
        .who-card p { color:var(--text-dim); line-height:1.6; font-size:.95rem; }

        /* ── HOW IT WORKS ── */
        .how-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:32px; margin-top:48px; }
        .how-card { position:relative; padding:40px 32px 36px; background:var(--bg2); border:1px solid var(--border); border-radius:14px; }
        .how-num { font-family:var(--font-display); font-size:4rem; color:var(--accent); opacity:.2; position:absolute; top:12px; right:24px; line-height:1; font-style: italic; }
        .how-card h3 { font-family:var(--font-display); font-size:1.25rem; font-style: italic; margin-bottom:10px; }
        .how-card p { color:var(--text-dim); font-size:.95rem; line-height:1.6; }

        /* ── PRICING ── */
        .pricing-section { background: var(--bg2); border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding: 100px 24px; }
        .pricing-inner { max-width:1200px; margin:0 auto; }
        .countdown-bar { display:flex; gap:20px; justify-content:center; margin:32px 0 48px; }
        .countdown-unit { text-align:center; }
        .countdown-num { font-family:var(--font-display); font-size:2.4rem; color:var(--accent); display:block; font-style: italic; }
        .countdown-lbl { font-size:.7rem; letter-spacing:.1em; text-transform:uppercase; color:var(--text-dim); }
        .countdown-sep { font-family:var(--font-display); font-size:2rem; color:var(--border); line-height:1.3; }

        .pricing-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(300px,1fr)); gap:24px; }
        .price-card { background:var(--bg); border:1px solid var(--border); border-radius:16px; padding:40px 32px; display:flex; flex-direction:column; transition: border-color .3s, transform .3s; }
        .price-card--pop { border-color:var(--accent); position:relative; }
        .price-card--pop::before { content:'Most Popular'; position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:var(--accent); color:#0a0a0a; font-size:.7rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; padding:5px 18px; border-radius:100px; }
        .price-card:hover { border-color:var(--accent); transform:translateY(-4px); }
        .price-tier { font-size:.75rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); margin-bottom:4px; }
        .price-label { font-family:var(--font-display); font-size:1.5rem; font-style: italic; margin-bottom:16px; }
        .price-row { display:flex; align-items:baseline; gap:10px; margin-bottom:4px; }
        .price-old { font-size:1.1rem; color:var(--text-dim); text-decoration:line-through; }
        .price-now { font-family:var(--font-display); font-size:3rem; color:var(--text); font-style: italic; }
        .price-per { color:var(--text-dim); font-size:.85rem; margin-bottom:6px; }
        .price-save { display:inline-block; background:rgba(200,255,0,.1); color:var(--accent); font-size:.75rem; font-weight:600; padding:3px 10px; border-radius:6px; margin-bottom:20px; }
        .price-hours { font-size:.85rem; color:var(--text-dim); margin-bottom:20px; padding-bottom:20px; border-bottom:1px solid var(--border); }
        .price-features { list-style:none; flex:1; margin-bottom:28px; }
        .price-features li { font-size:.9rem; color:var(--text-dim); padding:6px 0; padding-left:22px; position:relative; line-height:1.5; }
        .price-features li::before { content:'✓'; position:absolute; left:0; color:var(--accent); font-weight:700; }
        .price-cta { display:block; text-align:center; background:var(--accent); color:#0a0a0a; font-weight:700; font-size:.85rem; padding:14px; border-radius:8px; text-decoration:none; letter-spacing:.04em; text-transform:uppercase; transition: transform .2s, box-shadow .2s; }
        .price-cta:hover { transform:translateY(-2px); box-shadow: 0 4px 30px var(--accent-glow); }

        /* ── ROADMAP ── */
        .roadmap-timeline { position:relative; margin-top:56px; }
        .roadmap-line { position:absolute; left:27px; top:0; bottom:0; width:2px; background:var(--border); }
        @media(max-width:600px){ .roadmap-line{ left:19px; } }
        .roadmap-week { display:flex; gap:32px; margin-bottom:48px; position:relative; }
        .roadmap-dot { width:56px; min-width:56px; height:56px; border-radius:50%; background:var(--surface); border:2px solid var(--accent); display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-size:1.3rem; color:var(--accent); position:relative; z-index:1; font-style: italic; }
        @media(max-width:600px){ .roadmap-dot{ width:40px; min-width:40px; height:40px; font-size:1rem; } }
        .roadmap-body h3 { font-family:var(--font-display); font-size:1.4rem; font-style: italic; margin-bottom:4px; }
        .roadmap-body h3 span { color:var(--accent); }
        .roadmap-body .sub { font-size:.8rem; color:var(--text-dim); margin-bottom:8px; }
        .roadmap-body p { color:var(--text-dim); font-size:.95rem; line-height:1.6; margin-bottom:10px; }
        .roadmap-tags { display:flex; flex-wrap:wrap; gap:8px; }
        .roadmap-tag { background:var(--bg3); border:1px solid var(--border); font-size:.75rem; padding:4px 12px; border-radius:100px; color:var(--text-dim); }

        /* between sessions */
        .between { background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:40px 36px; margin-top:16px; }
        .between h4 { font-family:var(--font-display); font-size:1.2rem; font-style: italic; margin-bottom:16px; color:var(--accent); }
        .between ul { list-style:none; }
        .between li { padding:6px 0 6px 22px; position:relative; color:var(--text-dim); font-size:.95rem; line-height:1.5; }
        .between li::before { content:'→'; position:absolute; left:0; color:var(--accent); }

        /* ── GUARANTEE ── */
        .guarantee { text-align:center; padding:100px 24px; }
        .guarantee-badge { font-family:var(--font-display); font-size:6rem; color:var(--accent); margin-bottom:8px; font-style: italic; }
        .guarantee p { color:var(--text-dim); max-width:600px; margin:16px auto 32px; line-height:1.65; font-size:1rem; }

        /* ── FAQ ── */
        .faq-list { max-width:760px; margin:48px auto 0; }
        .faq-item { border-bottom:1px solid var(--border); cursor:pointer; }
        .faq-q { display:flex; justify-content:space-between; align-items:center; padding:20px 0; font-weight:600; font-size:1rem; gap:16px; }
        .faq-icon { font-family:var(--font-display); font-size:1.5rem; color:var(--accent); transition:transform .3s; flex-shrink:0; font-style: italic; }
        .faq-icon--open { transform:rotate(45deg); }
        .faq-a { max-height:0; overflow:hidden; transition: max-height .4s ease; }
        .faq-a--open { max-height:600px; }
        .faq-a-inner { padding:0 0 20px; color:var(--text-dim); line-height:1.65; font-size:.95rem; }

        /* ── FOOTER ── */
        .footer { border-top:1px solid var(--border); padding:48px 24px; text-align:center; }
        .footer-logo { font-family:var(--font-display); font-size:1.3rem; font-style: italic; letter-spacing:.02em; margin-bottom:8px; }

        @media (max-width: 600px) {
          .hero-transform-from { font-size: 14px; min-width: 90px; }
          .hero-transform-to { font-size: 17px; min-width: 90px; }
          .hero-transform-arrow-line { width: 16px; }
          .hero-flourish-line { width: 36px; }
        }
        .footer-logo span { color:var(--accent); }
        .footer p { color:var(--text-dim); font-size:.8rem; }

        /* ── UTILITY ── */
        .text-center { text-align:center; }
        .mx-auto { margin-left:auto; margin-right:auto; }
      `}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="#" className="nav-logo">THE SPEAKER'S <span>GYM</span></a>
          <div className="nav-links">
            <a href="#who">Who It's For</a>
            <a href="#how">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#faq">FAQ</a>
            <a href={SCHEDULE_URL} className="nav-cta">Book a Call</a>
          </div>
          <button className="nav-hamburger" onClick={() => setMobileNav(true)}>☰</button>
        </div>
      </nav>

      {mobileNav && (
        <div className="mobile-menu">
          <button className="mobile-close" onClick={() => setMobileNav(false)}>✕</button>
          <a href="#who" onClick={() => setMobileNav(false)}>Who It's For</a>
          <a href="#how" onClick={() => setMobileNav(false)}>How It Works</a>
          <a href="#pricing" onClick={() => setMobileNav(false)}>Pricing</a>
          <a href="#roadmap" onClick={() => setMobileNav(false)}>Roadmap</a>
          <a href="#faq" onClick={() => setMobileNav(false)}>FAQ</a>
          <a href={SCHEDULE_URL} className="btn-primary" onClick={() => setMobileNav(false)}>Book a Call</a>
        </div>
      )}

      {/* ── HERO ── */}
      <div className="hero-wrap">
        <section className="hero">
          <div className="hero-content">
            <Reveal>
              <div className="hero-badge">Public Speaking Coach for Socially Nervous Professionals</div>
            </Reveal>
            <Reveal delay={100}>
              <div className="hero-flourish">
                <div className="hero-flourish-line" />
                <div className="hero-flourish-diamond" />
                <div className="hero-flourish-line" />
              </div>
            </Reveal>
            <Reveal delay={150}>
              <h1>From Nervous Professional to Confident Communicator</h1>
            </Reveal>
            <Reveal delay={220}>
              <div className="hero-transforms">
                {[
                  ["Rambling", "Articulate"],
                  ["Monotone", "Expressive"],
                  ["Shy", "Confident"],
                ].map(([from, to]) => (
                  <div key={from} className="hero-transform-line">
                    <span className="hero-transform-from">{from}</span>
                    <span className="hero-transform-arrow">
                      <span className="hero-transform-arrow-line" />
                      <span className="hero-transform-arrow-tip" />
                    </span>
                    <span className="hero-transform-to">{to}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal delay={260}>
              <p>A 4-week training program where you practice speaking twice a week, get real feedback, and build the confidence to speak clearly at work and in conversations.</p>
            </Reveal>
            <Reveal delay={320}>
              <div className="hero-btns">
                <a href={SCHEDULE_URL} className="btn-primary">Book a Strategy Call</a>
                <a href="#roadmap" className="btn-secondary">View Program</a>
                <a href={COMMUNITY_URL} className="btn-secondary">Join Free Community</a>
              </div>
            </Reveal>
            <Reveal delay={380}>
              <div className="hero-video">
                <div className="hero-video-embed">
                  <iframe
                    src="https://www.youtube-nocookie.com/embed/ast-27XSUsE?rel=0&modestbranding=1"
                    title="Speaker's Gym video"
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      {/* ── WHO IT'S FOR ── */}
      <section className="section" id="who">
        <Reveal>
          <div className="section-label">Find Your Fit</div>
          <div className="section-title">Who The Speaker's Gym Is For</div>
        </Reveal>
        <div className="who-grid">
          {[
            { icon: "⚡", title: "Professionals Who Get Nervous", desc: "You know your stuff, but when it's time to speak in meetings or in front of others, your nerves take over." },
            { icon: "💭", title: "People Who Overthink", desc: "You have ideas in your head, but you struggle to say them clearly and confidently in the moment." },
            { icon: "🎯", title: "People Who Want Real Practice", desc: "You don't want more theory. You want reps, feedback, and a system that helps you improve fast." },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="who-card">
                <span className="who-card-icon">{c.icon}</span>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how">
        <Reveal>
          <div className="section-label">The Process</div>
          <div className="section-title">How It Works</div>
        </Reveal>
        <div className="how-grid">
          {[
            { n: "01", title: "Live Coaching", desc: "Practice speaking live and receive direct feedback on your structure, delivery, and presence." },
            { n: "02", title: "Daily Speaking Reps", desc: "Build confidence with daily speaking reps inside the Premium Speaker's Gym app with AI feedback." },
            { n: "03", title: "The Full Roadmap", desc: "Master vocal variety and speech structure with the complete MOUN Academy roadmap." },
          ].map((c, i) => (
            <Reveal key={i} delay={i * 120}>
              <div className="how-card">
                <span className="how-num">{c.n}</span>
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing-section" id="pricing">
        <div className="pricing-inner">
          <Reveal>
            <div className="text-center">
              <div className="section-label">Pricing</div>
              <div className="section-title">Pick Your Group</div>
              <p className="section-subtitle mx-auto">Every plan includes the full MOUN Academy course, Speaker's Gym App, and performance tracking.</p>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div style={{ textAlign: "center", margin: "24px 0 8px", color: "var(--accent)", fontWeight: 600, fontSize: ".9rem" }}>
              50% off — limited time offer
            </div>
            <div className="countdown-bar">
              {[["days", countdown.days], ["hours", countdown.hours], ["min", countdown.min], ["sec", countdown.sec]].map(([label, val], i) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: i < 3 ? 20 : 0 }}>
                  <div className="countdown-unit">
                    <span className="countdown-num">{val}</span>
                    <span className="countdown-lbl">{label}</span>
                  </div>
                  {i < 3 && <span className="countdown-sep">:</span>}
                </div>
              ))}
            </div>
          </Reveal>

          <div className="pricing-grid">
            {[
              {
                tier: "Standard", label: "3+ Members", old: "$94", now: "$47", per: "per person / 4 weeks",
                save: "Save 50%", hours: "4 hours live training", pop: false,
                features: [
                  "One live workshop per week for 4 weeks",
                  "3-hour MOUN Academy course with exercises",
                  "Premium Speaker's Gym App with AI feedback",
                  "Conversation Playbook (bonus)",
                ],
              },
              {
                tier: "Small Group", label: "Group of 3", old: "$194", now: "$97", per: "per person / 4 weeks",
                save: "Save 50%", hours: "8 hours live training", pop: true,
                features: [
                  "2 live sessions per week for 4 weeks",
                  "3-hour MOUN Academy course with exercises",
                  "Premium Speaker's Gym App with AI feedback",
                  "Performance tracking — always know where you stand",
                  "Conversation Playbook (bonus)",
                ],
              },
              {
                tier: "VIP", label: "1-on-1 Coaching", old: "$294", now: "$147", per: "/ 4 weeks",
                save: "Save 50%", hours: "8 hours private coaching", pop: false,
                features: [
                  "Everything in Small Group",
                  "8 private 1-on-1 sessions (2/week, 1 hour each)",
                  "Feedback on real meetings & presentations",
                  "Action plan built around your specific goals",
                ],
              },
            ].map((p, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className={cx("price-card", p.pop && "price-card--pop")}>
                  <div className="price-tier">{p.tier}</div>
                  <div className="price-label">{p.label}</div>
                  <div className="price-row">
                    <span className="price-old">{p.old}</span>
                    <span className="price-now">{p.now}</span>
                  </div>
                  <div className="price-per">{p.per}</div>
                  <div className="price-save">{p.save}</div>
                  <div className="price-hours">{p.hours}</div>
                  <ul className="price-features">
                    {p.features.map((f, j) => <li key={j}>{f}</li>)}
                  </ul>
                  <a href={SCHEDULE_URL} className="price-cta">Book a Call →</a>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p style={{ textAlign: "center", color: "var(--text-dim)", marginTop: 28, fontSize: ".9rem" }}>
              All plans start with a free strategy call. Click any button above to book yours.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section className="section" id="roadmap">
        <Reveal>
          <div className="section-label">The Roadmap</div>
          <div className="section-title">Your 4-Week Transformation</div>
          <p className="section-subtitle">Each week builds on the last. Two live sessions per week, plus daily practice on the app. By Week 4, you'll speak with clarity and confidence.</p>
        </Reveal>

        <div className="roadmap-timeline">
          <div className="roadmap-line" />
          {[
            { w: 1, name: "Foundation", focus: "Clarity", desc: "Learn and practice simple frameworks to answer any question clearly and on the spot. No more rambling. No more going blank.", tags: ["Speech frameworks", "Live practice", "Daily app reps"] },
            { w: 2, name: "Vocal Power", focus: "Volume & Pace", desc: "Train your volume and pace variety. Learn how to slow down for impact, speed up for energy, and use volume to hold attention.", tags: ["Volume training", "Pace training", "Daily app reps"] },
            { w: 3, name: "Expression", focus: "Pitch & Pauses", desc: "Work on pitch variety and effective pauses. This is what separates someone who sounds flat from someone people actually listen to.", tags: ["Pitch training", "Pause training", "Daily app reps"] },
            { w: 4, name: "Transformation", focus: "Full Integration", desc: "Bring it all together. Practice speaking with clarity, vocal variety, and presence in real scenarios like presentations and networking.", tags: ["Full skill integration", "Real scenario practice", "Before vs after review"] },
          ].map((wk, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="roadmap-week">
                <div className="roadmap-dot">{wk.w}</div>
                <div className="roadmap-body">
                  <h3>{wk.name} — <span>{wk.focus}</span></h3>
                  <div className="sub">2 live sessions</div>
                  <p>{wk.desc}</p>
                  <div className="roadmap-tags">
                    {wk.tags.map((t, j) => <span key={j} className="roadmap-tag">{t}</span>)}
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="between">
            <h4>Between Sessions</h4>
            <ul>
              <li>Daily reps on the Speaker's Gym App with AI feedback</li>
              <li>Post your practice on the community and get feedback from me personally</li>
              <li>Individual performance tracking so you always know where you stand</li>
            </ul>
          </div>
        </Reveal>

        <Reveal>
          <p style={{ color: "var(--text-dim)", marginTop: 32, lineHeight: 1.6 }}>
            By the end of 4 weeks, you'll speak with more clarity in presentations at work and connect with more confidence at networking events.
          </p>
        </Reveal>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="guarantee">
        <Reveal>
          <div className="guarantee-badge">100%</div>
          <div className="section-label">Try It Risk Free</div>
          <div className="section-title">Money-Back Guarantee</div>
          <p>If by the end you don't feel significantly more confident speaking in conversations and meetings, I'll refund you 100% of your money and personally coach you for another 30 days for free until we fix it.</p>
          <a href={SCHEDULE_URL} className="btn-primary">Book Free Call</a>
        </Reveal>
      </section>

      {/* ── FAQ ── */}
      <section className="section" id="faq">
        <Reveal>
          <div className="text-center">
            <div className="section-label">Still Not Sure?</div>
            <div className="section-title">Frequently Asked Questions</div>
          </div>
        </Reveal>
        <div className="faq-list">
          {[
            { q: "What is included in the Speaker's Gym program?", a: "Every plan includes full access to the 3-hour MOUN Academy course on speech structure and vocal variety with exercises, the Premium Speaker's Gym App with AI feedback, performance tracking, and a Conversation Playbook bonus. Standard and Small Group plans include 8 hours of live group training. VIP gives you 8 hours of private 1-on-1 coaching." },
            { q: "What do we cover in the 4 weeks?", a: "Week 1: Speech frameworks so you can answer any question clearly on the spot. Week 2: Volume variety and pace variety. Week 3: Pitch variety and effective pauses. Week 4: Full integration in real scenarios like presentations and networking." },
            { q: "Is this for beginners or people who already speak well?", a: "Both. Whether you're just starting to work on your speaking or you already present regularly but want to sharpen your delivery, the training adapts to your level through direct feedback and daily practice." },
            { q: "What makes this different from a public speaking course?", a: "Most courses give you theory to watch. This is a training program. You practice speaking twice a week in live sessions, get direct feedback, and build the habit with daily reps on the app. It's closer to working with a personal trainer than watching a course." },
            { q: "How much time do I need each week?", a: "Two live sessions of 1 hour each, plus 10 to 15 minutes of daily reps on the app. In total, expect around 3 to 4 hours per week." },
            { q: "What if I feel shy or nervous speaking in front of others?", a: "That's exactly who this is for. The groups are small (3 or 6 people max). You start with low-pressure practice and build up gradually. Most people say the nerves start fading within the first two weeks." },
            { q: "What is the difference between the three plans?", a: "Standard is a group of 6. Small Group is a group of 3, so you get more personal attention. VIP is private 1-on-1 coaching. All three include the same core content: the full course, the app, and performance tracking." },
            { q: "When does the program start?", a: "The next cohort starts soon. As soon as you join, you get immediate access to the course and the app so you can start before the live sessions begin." },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <FAQ q={item.q} a={item.a} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <a href={SCHEDULE_URL} className="btn-primary">Book a Free Strategy Call</a>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-logo">THE SPEAKER'S <span>GYM</span></div>
        <p>© {new Date().getFullYear()} The Speaker's Gym · All Rights Reserved</p>
      </footer>
    </>
  );
}
