import { useState, useEffect, useRef } from "react";

const SCHEDULE_URL = "https://calendly.com/marouane-speakers-gym/30min";
const COMMUNITY_URL = "https://www.skool.com/moun-academy-2097/about";

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

/* ─── countdown (dynamic — resets at the start of every month, ends at month end) ─── */
function useCountdown() {
  const calc = () => {
    const now = new Date();
    // End of the current month: midnight on the 1st of next month, minus 1 second.
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0, 0);
    const diff = Math.max(0, end - now);
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
  const countdown = useCountdown();
  const [mobileNav, setMobileNav] = useState(false);

  const trackLead = () => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }
  };

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
        .nav-links a.nav-cta { background:var(--accent); color:#000; font-weight:700; font-size:.8rem; padding:10px 22px; border-radius:6px; text-decoration:none; letter-spacing:.04em; text-transform:uppercase; transition: transform .2s, box-shadow .2s; }
        .nav-links a.nav-cta:hover { transform:translateY(-1px); box-shadow: 0 0 20px var(--accent-glow); color:#000; }
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

        /* ── PROOF STAT BAND ── */
        .proof-band { display:grid; grid-template-columns:repeat(4,1fr); gap:24px; margin-top:40px; padding:36px 32px; background:var(--surface); border:1px solid var(--border); border-radius:16px; }
        .proof-stat { text-align:center; }
        .proof-num { font-family:var(--font-display); font-style:italic; font-weight:700; font-size:clamp(2rem,4vw,2.8rem); color:var(--accent); line-height:1; }
        .proof-label { font-size:.8rem; color:var(--text-dim); margin-top:8px; letter-spacing:.02em; line-height:1.4; }
        @media(max-width:680px){ .proof-band { grid-template-columns:repeat(2,1fr); gap:28px 16px; padding:28px 20px; } }

        /* ── TESTIMONIALS ── */
        .testimonials-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:24px; margin-top:48px; }
        .testimonial-card { border:1px solid var(--border); border-radius:14px; overflow:hidden; background:#000; }
        .testimonial-embed { position:relative; width:100%; height:0; padding-bottom:56.25%; }
        .testimonial-embed iframe { position:absolute; inset:0; width:100%; height:100%; border:0; display:block; }
        @media(max-width:768px) {
          .testimonials-grid { grid-template-columns:1fr; }
        }

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
        .sgp-section { width:100%; padding:80px 24px; background:#0f0f0f; font-family:var(--font-body); box-sizing:border-box; }
        .sgp-inner { max-width:760px; margin:0 auto; }
        .sgp-eyebrow { font-size:11px; font-weight:500; letter-spacing:.18em; text-transform:uppercase; color:#d9c06f; text-align:center; margin:0 0 16px; }
        .sgp-headline { font-family:var(--font-display); font-size:clamp(28px,4vw,42px); font-weight:600; color:#f5eedb; text-align:center; margin:0 0 12px; line-height:1.2; }
        .sgp-subline { font-size:15px; color:#7a6f55; text-align:center; margin:0 0 20px; font-weight:300; }
        .sgp-timer-wrap { text-align:center; margin:0 0 48px; }
        .sgp-timer-label { font-size:13px; color:#c0503a; font-weight:500; margin:0 0 12px; letter-spacing:.05em; }
        .sgp-timer { display:inline-flex; gap:12px; align-items:center; }
        .sgp-timer-unit { display:flex; flex-direction:column; align-items:center; gap:4px; }
        .sgp-timer-num { font-family:var(--font-display); font-size:32px; font-weight:700; color:#d9c06f; background:#141414; border:1px solid rgba(217,192,111,.2); border-radius:10px; padding:8px 14px; min-width:56px; text-align:center; line-height:1; }
        .sgp-timer-text { font-size:10px; font-weight:500; letter-spacing:.12em; text-transform:uppercase; color:#5a5040; }
        .sgp-timer-sep { font-family:var(--font-display); font-size:28px; color:rgba(217,192,111,.3); margin-bottom:18px; }
        .sgp-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start; }
        .sgp-card { background:#141414; border:1px solid rgba(217,192,111,.12); border-radius:16px; padding:36px 28px; box-sizing:border-box; display:flex; flex-direction:column; position:relative; }
        .sgp-card.featured { background:#181610; border-color:rgba(217,192,111,.35); padding:44px 28px; margin-top:-12px; }
        .sgp-card.vip { background:#0e100e; border-color:rgba(138,173,110,.2); }
        .sgp-popular { position:absolute; top:-14px; left:50%; transform:translateX(-50%); background:#d9c06f; color:#0f0f0f; font-size:10px; font-weight:500; letter-spacing:.14em; text-transform:uppercase; padding:4px 16px; border-radius:20px; white-space:nowrap; }
        .sgp-tier { font-size:11px; font-weight:500; letter-spacing:.16em; text-transform:uppercase; color:#6a5f45; margin:0 0 10px; }
        .sgp-card.vip .sgp-tier { color:#6a8a5a; }
        .sgp-title { font-family:var(--font-display); font-size:20px; font-weight:600; color:#f0e8cc; margin:0 0 24px; line-height:1.2; min-height:52px; }
        .sgp-price-block { margin-bottom:24px; }
        .sgp-original { font-size:15px; color:#c0503a; text-decoration:line-through; font-weight:300; margin:0 0 2px; min-height:22px; }
        .sgp-price-row { display:flex; align-items:baseline; gap:8px; }
        .sgp-price { font-family:var(--font-display); font-size:48px; font-weight:700; color:#d9c06f; line-height:1; }
        .sgp-card.vip .sgp-price { color:#8aad6e; }
        .sgp-period { font-size:13px; color:#5a5040; font-weight:300; }
        .sgp-save { font-size:12px; color:#8aad6e; font-weight:500; margin:6px 0 0; min-height:18px; }
        .sgp-rule { height:1px; background:rgba(217,192,111,.07); margin:0 0 24px; }
        .sgp-card.vip .sgp-rule { background:rgba(138,173,110,.07); }
        .sgp-features { list-style:none; padding:0; margin:0 0 32px; display:flex; flex-direction:column; gap:12px; flex:1; }
        .sgp-feature { display:flex; align-items:flex-start; gap:10px; font-size:13px; color:#8a7f65; line-height:1.45; }
        .sgp-feature .tick { flex-shrink:0; width:16px; height:16px; border-radius:50%; background:rgba(217,192,111,.1); border:1px solid rgba(217,192,111,.2); display:flex; align-items:center; justify-content:center; margin-top:1px; color:#d9c06f; font-size:10px; line-height:1; }
        .sgp-card.vip .sgp-feature .tick { background:rgba(138,173,110,.1); border-color:rgba(138,173,110,.2); color:#8aad6e; }
        .sgp-feature .tick svg { width:8px; height:8px; }
        .sgp-feature strong { color:#c8bc9a; font-weight:500; }
        .sgp-hours-badge { display:inline-block; font-size:11px; font-weight:500; letter-spacing:.1em; text-transform:uppercase; color:#d9c06f; background:rgba(217,192,111,.08); border:1px solid rgba(217,192,111,.15); padding:5px 12px; border-radius:20px; margin-bottom:20px; }
        .sgp-card.vip .sgp-hours-badge { color:#8aad6e; background:rgba(138,173,110,.08); border-color:rgba(138,173,110,.15); }
        .sgp-btn { display:block; width:100%; padding:15px 20px; border-radius:10px; font-family:var(--font-body); font-size:14px; font-weight:500; text-align:center; text-decoration:none; cursor:pointer; transition:opacity .15s ease, transform .15s ease; box-sizing:border-box; letter-spacing:.01em; }
        .sgp-btn:hover { opacity:.88; transform:translateY(-1px); }
        .sgp-btn:active { transform:translateY(0); opacity:1; }
        .sgp-btn.outline { background:transparent; color:#d9c06f; border:1px solid rgba(217,192,111,.3); }
        .sgp-btn.solid { background:#d9c06f; color:#0f0f0f; border:none; }
        .sgp-btn.green { background:transparent; color:#8aad6e; border:1px solid rgba(138,173,110,.35); }
        .sgp-footer-note { font-size:12px; color:#4a4030; text-align:center; margin:32px 0 0; font-weight:300; }
        @media (max-width:760px) {
          .sgp-grid { grid-template-columns:1fr; gap:16px; max-width:400px; margin:0 auto; }
          .sgp-card.featured { margin-top:0; padding:36px 28px; }
          .sgp-section { padding:56px 20px; }
          .sgp-price { font-size:40px; }
          .sgp-title { min-height:unset; }
          .sgp-timer-num { font-size:24px; min-width:46px; padding:6px 10px; }
          .sgp-timer-sep { font-size:22px; }
        }

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

        /* ── STICKY MOBILE CTA ── */
        .sticky-cta { display:none; }
        @media(max-width:768px){
          .sticky-cta { display:block; position:fixed; left:0; right:0; bottom:0; z-index:90; padding:12px 16px calc(12px + env(safe-area-inset-bottom)); background:rgba(17,17,17,.92); backdrop-filter:blur(14px); border-top:1px solid var(--border); }
          .sticky-cta a { display:block; width:100%; text-align:center; background:var(--accent); color:#0a0a0a; font-weight:700; font-size:.9rem; padding:15px 20px; border-radius:8px; text-decoration:none; letter-spacing:.04em; text-transform:uppercase; }
          .footer { padding-bottom:96px; }
        }

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
            <a href="#testimonials">Testimonials</a>
            <a href="#faq">FAQ</a>
            <a href={SCHEDULE_URL} className="nav-cta" target="_blank" rel="noopener noreferrer" onClick={trackLead}>Book a Call</a>
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
          <a href="#testimonials" onClick={() => setMobileNav(false)}>Testimonials</a>
          <a href="#faq" onClick={() => setMobileNav(false)}>FAQ</a>
          <a href={SCHEDULE_URL} className="btn-primary" target="_blank" rel="noopener noreferrer" onClick={() => { trackLead(); setMobileNav(false); }}>Book a Call</a>
        </div>
      )}

      {/* ── HERO ── */}
      <div className="hero-wrap">
        <section className="hero">
          <div className="hero-content">
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
            <Reveal delay={320}>
              <div className="hero-btns">
                <a href={SCHEDULE_URL} className="btn-primary" onClick={trackLead} target="_blank" rel="noopener noreferrer">Book a Strategy Call</a>
                <a href="#roadmap" className="btn-secondary">View Program</a>
                <a href={COMMUNITY_URL} className="btn-secondary" target="_blank" rel="noopener noreferrer">Join Free Community</a>
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

      {/* ── ROADMAP ── */}
      <section className="section" id="roadmap">
        <Reveal>
          <div className="section-label">The Roadmap</div>
          <div className="section-title">Your 6-Week Communication Plan</div>
          <p className="section-subtitle">Each phase builds on the last. By Week 6, you'll speak with more clarity, control, and confidence in real situations.</p>
        </Reveal>

        <div className="roadmap-timeline">
          <div className="roadmap-line" />
          {[
            { w: "1-2", name: "Speak With Structure", sub: "Weeks 1 & 2", desc: "You learn simple frameworks to organize your thoughts, answer questions with more structure, and speak without going in circles. The goal is to help you sound clearer and more prepared, even when you are speaking on the spot." },
            { w: "3-4", name: "Build a Stronger Voice", sub: "Weeks 3 & 4", desc: "You work on volume, pauses, and vocal variety so your voice sounds more steady and intentional. This helps you avoid speaking too quietly, too fast, or in a way that makes people lose attention." },
            { w: "5", name: "Add Energy and Expression", sub: "Week 5", desc: "You practice using pitch and pace to sound more natural and engaged. The goal is not to perform. It is to sound more like yourself, with more energy and control." },
            { w: "6", name: "Put It Into Real Life", sub: "Week 6", desc: "You apply everything in real situations such as interviews, meetings, conversations, and presentations. Then we compare your Week 6 speaking to Week 1 so you can clearly see your progress." },
          ].map((wk, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className="roadmap-week">
                <div className="roadmap-dot">{wk.w}</div>
                <div className="roadmap-body">
                  <h3>{wk.name}</h3>
                  <div className="sub">{wk.sub}</div>
                  <p>{wk.desc}</p>
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
            By the end of 6 weeks, you'll speak with more clarity in presentations at work and connect with more confidence at networking events.
          </p>
        </Reveal>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="section" id="testimonials">
        <Reveal>
          <div className="section-label">Testimonials</div>
          <div className="section-title">What Others Are Saying</div>
        </Reveal>
        <Reveal>
          <div className="proof-band">
            {[
              { num: "200+", label: "Professionals trained" },
              { num: "4.9★", label: "Average rating" },
              { num: "6 wks", label: "To visible results" },
              { num: "100%", label: "Money-back guarantee" },
            ].map((s, i) => (
              <div className="proof-stat" key={i}>
                <div className="proof-num">{s.num}</div>
                <div className="proof-label">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
        <div className="testimonials-grid">
          {[
            "AmX2dVv8qcM",
            "cm3G7biEwHI",
            "Kctzf04s41c",
            "QzFvN_5MPWI",
            "fiyvwTk2Iq4",
            "XQ5x8_tnI7M",
          ].map((videoId, i) => (
            <Reveal key={videoId} delay={i * 80}>
              <div className="testimonial-card">
                <div className="testimonial-embed">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?controls=1&modestbranding=1&rel=0`}
                    title={`Testimonial video ${i + 1}`}
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="sgp-section" id="pricing">
        <div className="sgp-inner">

          <p className="sgp-eyebrow">Pricing</p>
          <h2 className="sgp-headline">Train Your Voice. Transform Your Career.</h2>
          <p className="sgp-subline">50% off — this month only.</p>

          <div className="sgp-timer-wrap">
            <p className="sgp-timer-label">⚡ 50% discount ends in</p>
            <div className="sgp-timer">
              <div className="sgp-timer-unit"><span className="sgp-timer-num">{countdown.days}</span><span className="sgp-timer-text">Days</span></div>
              <span className="sgp-timer-sep">:</span>
              <div className="sgp-timer-unit"><span className="sgp-timer-num">{countdown.hours}</span><span className="sgp-timer-text">Hrs</span></div>
              <span className="sgp-timer-sep">:</span>
              <div className="sgp-timer-unit"><span className="sgp-timer-num">{countdown.min}</span><span className="sgp-timer-text">Min</span></div>
              <span className="sgp-timer-sep">:</span>
              <div className="sgp-timer-unit"><span className="sgp-timer-num">{countdown.sec}</span><span className="sgp-timer-text">Sec</span></div>
            </div>
          </div>

          <div className="sgp-grid">

            {/* TIER 1: 6-Week Group — FEATURED */}
            <div className="sgp-card featured">
              <span className="sgp-popular">Most Popular</span>
              <p className="sgp-tier">6-Week Group</p>
              <h3 className="sgp-title">Group of 6</h3>
              <div className="sgp-price-block">
                <p className="sgp-original">$94</p>
                <div className="sgp-price-row">
                  <span className="sgp-price">$47</span>
                  <span className="sgp-period">per person / 6 weeks</span>
                </div>
                <p className="sgp-save">Save 50% — $47 off</p>
              </div>
              <span className="sgp-hours-badge">6 hours live training</span>
              <div className="sgp-rule" />
              <ul className="sgp-features">
                <li className="sgp-feature"><span className="tick"><svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#d9c06f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><strong>1-hour live workshop every weekend</strong> for 6 weeks (frameworks + vocal variety)</span></li>
                <li className="sgp-feature"><span className="tick"><svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#d9c06f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><strong>3-hour MOUN Academy course</strong> with exercises for each lecture</span></li>
                <li className="sgp-feature"><span className="tick"><svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#d9c06f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><strong>Premium Speaker's Gym App</strong> with AI feedback</span></li>
                <li className="sgp-feature"><span className="tick"><svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#d9c06f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><strong>Performance tracking</strong> so you always know where you stand</span></li>
                <li className="sgp-feature"><span className="tick"><svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#d9c06f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><strong>Conversation Playbook</strong> (bonus)</span></li>
              </ul>
              <a href={SCHEDULE_URL} className="sgp-btn solid" onClick={trackLead} target="_blank" rel="noopener noreferrer">Book a Call →</a>
            </div>

            {/* TIER 2: 1-on-1 Coaching */}
            <div className="sgp-card vip">
              <p className="sgp-tier">VIP</p>
              <h3 className="sgp-title">1-on-1 Coaching</h3>
              <div className="sgp-price-block">
                <p className="sgp-original">$300</p>
                <div className="sgp-price-row">
                  <span className="sgp-price">$147</span>
                  <span className="sgp-period">/ 6 weeks</span>
                </div>
                <p className="sgp-save">Save $153 — fastest path to results</p>
              </div>
              <span className="sgp-hours-badge">Group + private coaching</span>
              <div className="sgp-rule" />
              <ul className="sgp-features">
                <li className="sgp-feature"><span className="tick"><svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#8aad6e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><strong>Everything in the 6-Week Group plan</strong></span></li>
                <li className="sgp-feature"><span className="tick"><svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#8aad6e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><strong>Weekly 1-on-1 session</strong> where I focus on your specific weaknesses and work with you directly to get results faster</span></li>
                <li className="sgp-feature"><span className="tick"><svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#8aad6e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>Direct feedback on your real meetings, presentations, and conversations</span></li>
                <li className="sgp-feature"><span className="tick"><svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#8aad6e" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>Clear action plan built around your specific goals</span></li>
              </ul>
              <a href={SCHEDULE_URL} className="sgp-btn green" onClick={trackLead} target="_blank" rel="noopener noreferrer">Book a Call →</a>
            </div>

          </div>

          <p className="sgp-footer-note">All plans start with a free strategy call. Click any button above to book yours.</p>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="guarantee">
        <Reveal>
          <div className="guarantee-badge">100%</div>
          <div className="section-label">Try It Risk Free</div>
          <div className="section-title">Money-Back Guarantee</div>
          <p>If by the end you don't feel significantly more confident speaking in conversations and meetings, I'll refund you 100% of your money and personally coach you for another 30 days for free until we fix it.</p>
          <a href={SCHEDULE_URL} className="btn-primary" target="_blank" rel="noopener noreferrer" onClick={trackLead}>Book Free Call</a>
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
            { q: "What is included in the Speaker's Gym program?", a: "Every plan includes full access to the 3-hour MOUN Academy course on speech structure and vocal variety with exercises, the Premium Speaker's Gym App with AI feedback, performance tracking, and a Conversation Playbook bonus. The 6-Week Group plan includes 6 hours of live group training (one 1-hour workshop every weekend for 6 weeks). The VIP plan includes everything in the Group plan plus a weekly private 1-on-1 session." },
            { q: "What do we cover in the 6 weeks?", a: "Weeks 1-2: Speak with structure — simple frameworks so you can answer any question clearly and on the spot. Weeks 3-4: Build a stronger voice — volume, pauses, and vocal variety so you sound steady and intentional. Week 5: Add energy and expression using pitch and pace. Week 6: Put it into real life — interviews, meetings, conversations, and presentations, then compare your Week 6 speaking to Week 1 to see your progress." },
            { q: "Is this for beginners or people who already speak well?", a: "Both. Whether you're just starting to work on your speaking or you already present regularly but want to sharpen your delivery, the training adapts to your level through direct feedback and daily practice." },
            { q: "What makes this different from a public speaking course?", a: "Most courses give you theory to watch. This is a training program. You practice speaking live every week, get direct feedback, and build the habit with daily reps on the app. It's closer to working with a personal trainer than watching a course." },
            { q: "How much time do I need each week?", a: "One 1-hour live workshop on the weekend, plus 10 to 15 minutes of daily reps on the app. In total, expect around 2 to 3 hours per week." },
            { q: "What if I feel shy or nervous speaking in front of others?", a: "That's exactly who this is for. The group is small (6 people max). You start with low-pressure practice and build up gradually. Most people say the nerves start fading within the first two weeks." },
            { q: "What is the difference between the two plans?", a: "The 6-Week Group is a group of 6, with a 1-hour live workshop every weekend. VIP gives you everything in the Group plan plus a weekly private 1-on-1 session focused on your specific weaknesses and your real meetings, presentations, and conversations. Both include the same core content: the full course, the app, and performance tracking." },
            { q: "When does the program start?", a: "The next cohort starts soon. As soon as you join, you get immediate access to the course and the app so you can start before the live sessions begin." },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <FAQ q={item.q} a={item.a} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <a href={SCHEDULE_URL} className="btn-primary" target="_blank" rel="noopener noreferrer" onClick={trackLead}>Book a Free Strategy Call</a>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="footer-logo">THE SPEAKER'S <span>GYM</span></div>
        <p>© {new Date().getFullYear()} The Speaker's Gym · All Rights Reserved</p>
      </footer>

      {/* ── STICKY MOBILE CTA ── */}
      <div className="sticky-cta">
        <a href={SCHEDULE_URL} target="_blank" rel="noopener noreferrer" onClick={trackLead}>Book a Free Call</a>
      </div>
    </>
  );
}
