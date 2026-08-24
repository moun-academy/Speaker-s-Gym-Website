import { useState, useEffect, useRef } from "react";
import marouanePhoto from "./Marouane.png";
import { SiteFooter, SiteHeader } from "./SiteChrome.jsx";
import { BOOK_URL, COMMUNITY_URL, PURCHASE_URL } from "./siteConfig.js";

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

/* ─── countdown (dynamic, resets at the start of every month and ends at month end) ─── */
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

        @media(max-width:1120px) {
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

        /* ── ABOUT ME ── */
        .about-grid { display:grid; grid-template-columns: 0.85fr 1.15fr; gap:56px; align-items:center; margin-top:8px; }
        .about-photo-wrap { position:relative; }
        .about-photo-wrap::before { content:''; position:absolute; inset:-1px; border-radius:18px; background: radial-gradient(ellipse at 30% 0%, var(--accent-glow), transparent 70%); pointer-events:none; }
        .about-photo { width:100%; height:auto; display:block; border-radius:16px; border:1px solid var(--border); object-fit:cover; }
        .about-text h2 { font-family:var(--font-display); font-style:italic; font-weight:600; font-size:clamp(2rem,4.5vw,2.8rem); color:#f2ecdf; margin-bottom:22px; }
        .about-text p { color:var(--text-dim); line-height:1.8; font-size:1.02rem; margin-bottom:18px; }
        .about-text p:last-child { margin-bottom:0; }
        .about-text strong { color:var(--accent); font-weight:600; }
        @media(max-width:768px) {
          .about-grid { grid-template-columns:1fr; gap:32px; }
          .about-photo { max-width:340px; margin:0 auto; }
        }

        /* ── HOW IT WORKS ── */
        .how-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:32px; margin-top:48px; }
        .how-card { position:relative; padding:40px 32px 36px; background:var(--bg2); border:1px solid var(--border); border-radius:14px; }
        .how-num { font-family:var(--font-display); font-size:4rem; color:var(--accent); opacity:.2; position:absolute; top:12px; right:24px; line-height:1; font-style: italic; }
        .how-card h3 { font-family:var(--font-display); font-size:1.25rem; font-style: italic; margin-bottom:10px; }
        .how-card p { color:var(--text-dim); font-size:.95rem; line-height:1.6; }

        /* ── METHOD PREVIEW ── */
        .method-preview { position:relative; display:grid; grid-template-columns:1.05fr .95fr; gap:54px; align-items:center; overflow:hidden; padding:54px; border:1px solid rgba(217,192,111,.28); border-radius:24px; background:#14201c; box-shadow:0 28px 70px rgba(0,0,0,.22); }
        .method-preview::before { content:''; position:absolute; width:360px; height:360px; right:-180px; top:-210px; border-radius:50%; background:radial-gradient(circle,rgba(217,192,111,.16),transparent 68%); pointer-events:none; }
        .method-preview-copy { position:relative; z-index:1; }
        .method-preview-copy h2 { margin:0 0 16px; color:#f2ecdf; font-family:var(--font-display); font-size:clamp(2rem,4vw,3.15rem); font-style:italic; font-weight:600; line-height:1.08; }
        .method-preview-copy p { max-width:560px; margin:0 0 26px; color:#a2aaa5; line-height:1.7; }
        .method-preview-link { display:inline-flex; align-items:center; gap:10px; padding:12px 20px; border:1px solid rgba(217,192,111,.36); border-radius:8px; color:var(--accent); font-size:.82rem; font-weight:700; text-decoration:none; transition:transform .2s ease,background .2s ease; }
        .method-preview-link:hover { transform:translateY(-2px); background:rgba(217,192,111,.06); }
        .method-equation { position:relative; z-index:1; display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:12px; }
        .method-equation-card { min-height:150px; padding:22px 16px; display:flex; flex-direction:column; justify-content:center; border:1px solid rgba(217,192,111,.18); border-radius:16px; background:rgba(8,13,11,.42); text-align:center; }
        .method-equation-card span { display:block; margin-bottom:10px; color:var(--accent); font-family:var(--font-display); font-size:2rem; font-style:italic; }
        .method-equation-card strong { color:#f2ecdf; font-size:.76rem; line-height:1.4; }
        .method-equation-symbol { color:#8fa99d; font-family:var(--font-display); font-size:1.8rem; font-style:italic; }
        .method-equation-result { grid-column:1/-1; padding:13px; border:1px solid rgba(143,169,157,.3); border-radius:10px; color:#cddbd4; background:rgba(143,169,157,.07); font-size:.74rem; font-weight:700; letter-spacing:.06em; text-align:center; text-transform:uppercase; }
        @media(max-width:820px){ .method-preview{grid-template-columns:1fr;padding:38px 28px;gap:36px;} }
        @media(max-width:460px){ .method-equation{grid-template-columns:1fr;} .method-equation-symbol{transform:rotate(90deg);text-align:center;} .method-equation-result{grid-column:auto;} }

        /* ── PRICING ── */
        .sgp-section { width:100%; padding:80px 24px; background:#0f0f0f; font-family:var(--font-body); box-sizing:border-box; }
        .sgp-inner { max-width:920px; margin:0 auto; }
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
        .sgp-offer-card { position:relative; overflow:hidden; background:linear-gradient(145deg,#1b1912 0%,#121311 52%,#101210 100%); border:1px solid rgba(217,192,111,.35); border-radius:24px; padding:48px; box-shadow:0 30px 90px rgba(0,0,0,.32); }
        .sgp-offer-card::before { content:''; position:absolute; width:380px; height:380px; top:-230px; right:-120px; border-radius:50%; background:radial-gradient(circle,rgba(217,192,111,.2),transparent 68%); pointer-events:none; }
        .sgp-offer-card::after { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg,transparent,var(--accent),transparent); }
        .sgp-popular { position:absolute; top:22px; right:24px; background:rgba(217,192,111,.12); border:1px solid rgba(217,192,111,.28); color:#e8d590; font-size:10px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; padding:7px 14px; border-radius:20px; white-space:nowrap; }
        .sgp-offer-top { display:grid; grid-template-columns:1.25fr .75fr; gap:44px; align-items:end; position:relative; }
        .sgp-tier { font-size:11px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:#d9c06f; margin:0 0 12px; }
        .sgp-title { max-width:540px; font-family:var(--font-display); font-size:clamp(30px,5vw,48px); font-style:italic; font-weight:600; color:#f5eedb; margin:0 0 16px; line-height:1.08; }
        .sgp-offer-description { max-width:540px; color:#a59d88; font-size:15px; line-height:1.65; }
        .sgp-price-block { margin:0; padding:22px; background:rgba(8,8,8,.32); border:1px solid rgba(217,192,111,.13); border-radius:16px; }
        .sgp-original { font-size:15px; color:#c0503a; text-decoration:line-through; font-weight:300; margin:0 0 2px; min-height:22px; }
        .sgp-price-row { display:flex; align-items:baseline; gap:8px; }
        .sgp-price { font-family:var(--font-display); font-size:48px; font-weight:700; color:#d9c06f; line-height:1; }
        .sgp-period { font-size:13px; color:#5a5040; font-weight:300; }
        .sgp-save { font-size:12px; color:#8aad6e; font-weight:500; margin:6px 0 0; min-height:18px; }
        .sgp-rule { height:1px; background:linear-gradient(90deg,transparent,rgba(217,192,111,.22),transparent); margin:34px 0; }
        .sgp-included-title { font-family:var(--font-display); font-size:20px; font-style:italic; color:#f0e8cc; margin:0 0 20px; }
        .sgp-features { list-style:none; padding:0; margin:0 0 32px; display:grid; grid-template-columns:1fr 1fr; gap:16px 24px; }
        .sgp-feature { display:flex; align-items:flex-start; gap:12px; padding:15px; font-size:13px; color:#998f77; line-height:1.5; background:rgba(255,255,255,.018); border:1px solid rgba(217,192,111,.08); border-radius:12px; }
        .sgp-feature .tick { flex-shrink:0; width:20px; height:20px; border-radius:50%; background:rgba(217,192,111,.1); border:1px solid rgba(217,192,111,.25); display:flex; align-items:center; justify-content:center; margin-top:1px; color:#d9c06f; font-size:10px; line-height:1; }
        .sgp-feature .tick svg { width:9px; height:9px; }
        .sgp-feature strong { display:block; color:#ddd2b5; font-weight:600; margin-bottom:2px; }
        .sgp-offer-action { display:grid; grid-template-columns:1fr auto; gap:20px; align-items:center; }
        .sgp-offer-action .sgp-btn { min-width:280px; }
        .sgp-btn { display:block; width:100%; padding:15px 20px; border-radius:10px; font-family:var(--font-body); font-size:14px; font-weight:500; text-align:center; text-decoration:none; cursor:pointer; transition:opacity .15s ease, transform .15s ease; box-sizing:border-box; letter-spacing:.01em; }
        .sgp-btn:hover { opacity:.88; transform:translateY(-1px); }
        .sgp-btn:active { transform:translateY(0); opacity:1; }
        .sgp-btn.outline { background:transparent; color:#d9c06f; border:1px solid rgba(217,192,111,.3); }
        .sgp-btn.solid { background:#d9c06f; color:#0f0f0f; border:none; }
        .sgp-btn.green { background:transparent; color:#8aad6e; border:1px solid rgba(138,173,110,.35); }
        .sgp-footer-note { font-size:12px; color:#4a4030; text-align:center; margin:32px 0 0; font-weight:300; }
        .sgp-access-note { display:flex; align-items:flex-start; gap:7px; font-size:12px; color:#8a7f65; line-height:1.45; margin:0; }
        .sgp-access-note .dot { flex-shrink:0; color:#8aad6e; font-size:13px; line-height:1.3; }
        .sgp-trustbar { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:14px 28px; margin:28px auto 0; max-width:620px; }
        .sgp-trust-item { display:flex; align-items:center; gap:8px; font-size:12.5px; color:#8a7f65; }
        .sgp-trust-item svg { flex-shrink:0; }
        .sgp-trust-item strong { color:#c8bc9a; font-weight:600; }
        .sgp-guarantee { position:relative; display:grid; grid-template-columns:190px 1fr; align-items:center; gap:46px; overflow:hidden; margin:32px auto 0; padding:48px 52px; background:linear-gradient(135deg,#1b1810 0%,#151510 48%,#101310 100%); border:1px solid rgba(217,192,111,.34); border-radius:24px; box-shadow:0 24px 70px rgba(0,0,0,.28); }
        .sgp-guarantee::before { content:''; position:absolute; width:360px; height:360px; left:-170px; top:-190px; border-radius:50%; background:radial-gradient(circle,rgba(217,192,111,.2),transparent 68%); pointer-events:none; }
        .sgp-guarantee::after { content:''; position:absolute; top:0; left:12%; right:12%; height:2px; background:linear-gradient(90deg,transparent,#d9c06f,transparent); }
        .sgp-guarantee-seal { position:relative; z-index:1; width:164px; height:164px; display:flex; flex-direction:column; align-items:center; justify-content:center; border:1px solid rgba(217,192,111,.42); border-radius:50%; background:radial-gradient(circle at 35% 30%,rgba(217,192,111,.18),rgba(10,10,9,.72) 68%); box-shadow:inset 0 0 0 8px rgba(217,192,111,.04),0 12px 40px rgba(0,0,0,.3); }
        .sgp-guarantee-seal svg { width:28px; height:28px; margin-bottom:7px; }
        .sgp-guarantee-seal strong { font-family:var(--font-display); font-size:2.35rem; font-style:italic; color:#e8d590; line-height:1; }
        .sgp-guarantee-seal span { margin-top:7px; font-size:9px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; color:#8f835f; }
        .sgp-guarantee-content { position:relative; z-index:1; }
        .sgp-guarantee-eyebrow { margin:0 0 10px; color:#d9c06f; font-size:10px; font-weight:700; letter-spacing:.2em; text-transform:uppercase; }
        .sgp-guarantee-title { max-width:650px; margin:0 0 16px; font-family:var(--font-display); font-size:clamp(2rem,4.8vw,3.5rem); font-style:italic; font-weight:600; color:#f5eedb; line-height:1.05; }
        .sgp-guarantee-text { max-width:650px; margin:0; color:#a59d88; font-size:14px; line-height:1.7; }
        .sgp-guarantee-benefits { display:flex; flex-wrap:wrap; gap:10px 24px; margin-top:22px; }
        .sgp-guarantee-benefit { display:flex; align-items:center; gap:8px; color:#c8bc9a; font-size:12px; font-weight:600; }
        .sgp-guarantee-check { width:20px; height:20px; display:inline-flex; align-items:center; justify-content:center; flex-shrink:0; border-radius:50%; color:#d9c06f; background:rgba(217,192,111,.1); border:1px solid rgba(217,192,111,.24); }
        @media (max-width:760px) {
          .sgp-offer-card { padding:38px 24px 28px; }
          .sgp-popular { position:static; display:inline-block; margin-bottom:22px; }
          .sgp-offer-top { grid-template-columns:1fr; gap:26px; }
          .sgp-features { grid-template-columns:1fr; }
          .sgp-offer-action { grid-template-columns:1fr; }
          .sgp-offer-action .sgp-btn { min-width:0; }
          .sgp-section { padding:56px 20px; }
          .sgp-price { font-size:40px; }
          .sgp-timer-num { font-size:24px; min-width:46px; padding:6px 10px; }
          .sgp-timer-sep { font-size:22px; }
          .sgp-guarantee { grid-template-columns:1fr; gap:28px; padding:38px 24px; text-align:center; }
          .sgp-guarantee-seal { width:132px; height:132px; margin:0 auto; }
          .sgp-guarantee-seal strong { font-size:2rem; }
          .sgp-guarantee-title { font-size:2.2rem; }
          .sgp-guarantee-benefits { justify-content:center; }
        }

        /* ── ROADMAP ── */
        .roadmap-section { position:relative; overflow:hidden; }
        .roadmap-section::before { content:''; position:absolute; width:440px; height:440px; top:80px; right:-240px; border-radius:50%; background:radial-gradient(circle, rgba(217,192,111,.09), transparent 68%); pointer-events:none; }
        .roadmap-intro { max-width:760px; }
        .roadmap-grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:20px; margin-top:56px; position:relative; }
        .roadmap-card { position:relative; min-height:250px; padding:32px; overflow:hidden; border:1px solid var(--border); border-radius:20px; background:linear-gradient(145deg, rgba(27,27,27,.98), rgba(20,20,20,.96)); transition:transform .3s ease, border-color .3s ease, box-shadow .3s ease; }
        .roadmap-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:3px; background:linear-gradient(90deg, var(--accent), transparent 75%); opacity:.75; }
        .roadmap-card:hover { transform:translateY(-5px); border-color:rgba(217,192,111,.32); box-shadow:0 24px 60px rgba(0,0,0,.24); }
        .roadmap-card-head { display:flex; align-items:center; gap:10px; margin-bottom:28px; }
        .roadmap-step { width:9px; height:9px; border-radius:50%; background:var(--accent); box-shadow:0 0 0 6px var(--accent-glow); }
        .roadmap-week-label { color:var(--accent); font-size:.72rem; line-height:1; font-weight:700; letter-spacing:.18em; text-transform:uppercase; }
        .roadmap-number { position:absolute; top:14px; right:22px; color:rgba(217,192,111,.07); font-family:var(--font-display); font-size:6rem; font-style:italic; line-height:1; pointer-events:none; }
        .roadmap-card h3 { max-width:82%; margin-bottom:14px; font-family:var(--font-display); font-size:1.55rem; font-style:italic; line-height:1.2; color:var(--text); }
        .roadmap-card p { color:var(--text-dim); font-size:.95rem; line-height:1.7; }
        @media(max-width:760px){
          .roadmap-grid { grid-template-columns:1fr; margin-top:40px; }
          .roadmap-card { min-height:0; padding:28px 24px; }
          .roadmap-card-head { margin-bottom:22px; }
          .roadmap-card h3 { max-width:88%; font-size:1.4rem; }
          .roadmap-number { font-size:5rem; }
        }

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

      <SiteHeader />

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
                <a href={BOOK_URL} className="btn-primary">Book a Strategy Call</a>
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

      {/* ── METHOD PREVIEW ── */}
      <section className="section" id="method-preview">
        <Reveal>
          <div className="method-preview">
            <div className="method-preview-copy">
              <div className="section-label">The Speaker's Gym Method</div>
              <h2>Technique is only half the transformation.</h2>
              <p>Learn the communication skills. Apply them through gradual exposure. Build confidence through real evidence.</p>
              <a className="method-preview-link" href="/method">Explore the Method <span aria-hidden="true">→</span></a>
            </div>
            <div className="method-equation" aria-label="Technical Training plus Exposure Training equals Confident Communication">
              <div className="method-equation-card"><span>01</span><strong>Technical Training</strong></div>
              <div className="method-equation-symbol" aria-hidden="true">+</div>
              <div className="method-equation-card"><span>02</span><strong>Exposure Training</strong></div>
              <div className="method-equation-result">Confident Communication</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── ABOUT ME ── */}
      <section className="section" id="about">
        <div className="about-grid">
          <Reveal>
            <div className="about-photo-wrap">
              <img src={marouanePhoto} alt="Marouane Al Mandri, public speaking coach" className="about-photo" loading="lazy" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="about-text">
              <div className="section-label">Your Coach</div>
              <h2>Hi, I'm Marouane</h2>
              <p>
                I am <strong>Marouane Al Mandri</strong>, a public speaking coach for socially nervous professionals.
                I know what it feels like to have the knowledge but struggle to express it clearly. To freeze in
                meetings, ramble under pressure, or go unnoticed because your voice does not match your ability.
              </p>
              <p>
                I built The Speaker's Gym because I believe <strong>communication is a skill, not a talent</strong>.
                With the right training and real feedback, anyone can learn to speak with clarity, confidence, and presence.
              </p>
              <p>
                My approach is practical, not theoretical. No generic tips. No "just be confident" advice. Just
                structured exercises, honest feedback, and a system that works in real situations: meetings,
                presentations, and conversations.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── ROADMAP ── */}
      <section className="section roadmap-section" id="roadmap">
        <Reveal className="roadmap-intro">
          <div className="section-label">The Roadmap</div>
          <div className="section-title">The Speaker's Gym: 6-Week Program</div>
          <p className="section-subtitle">Build clear thinking, a stronger voice, and the confidence to speak when it matters. Every week adds a practical skill you can use immediately.</p>
        </Reveal>

        <div className="roadmap-grid">
          {[
            { w: "1", name: "Think Clearly, Speak Simply", desc: "Use the PREP framework to organize your thoughts, answer questions concisely, and stop rambling under pressure." },
            { w: "2", name: "Be Heard", desc: "Develop stronger volume, breathing, and posture so you stop shrinking your voice and begin speaking with authority." },
            { w: "3", name: "Slow Down and Own the Moment", desc: "Control your pace, use intentional pauses, and replace filler words with calm silence." },
            { w: "4", name: "Bring Your Voice to Life", desc: "Use pitch, melody, tonality, and vocal contrast to sound expressive, engaging, and naturally confident." },
            { w: "5", name: "Speak Before Fear Wins", desc: "Use the five-second rule to overcome hesitation, contribute during meetings, express opinions, and disagree respectfully." },
            { w: "6", name: "Communicate With Confidence", desc: "Combine structure, voice, expression, and presence in real meetings, conversations, presentations, and impromptu questions." },
          ].map((wk, i) => (
            <Reveal key={i} delay={i * 100}>
              <article className="roadmap-card">
                <span className="roadmap-number" aria-hidden="true">{wk.w}</span>
                <div className="roadmap-card-head">
                  <span className="roadmap-step" />
                  <span className="roadmap-week-label">Week {wk.w}</span>
                </div>
                <h3>{wk.name}</h3>
                <p>{wk.desc}</p>
              </article>
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
          <p className="sgp-subline">50% off. This month only.</p>

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

          <div className="sgp-offer-card">
            <span className="sgp-popular">Private Coaching</span>
            <div className="sgp-offer-top">
              <div>
                <p className="sgp-tier">The Complete 6-Week Experience</p>
                <h3 className="sgp-title">Private 1-on-1 Communication Coaching</h3>
                <p className="sgp-offer-description">A focused coaching experience built around your voice, your challenges, and the real speaking situations that matter in your life and career.</p>
              </div>
              <div className="sgp-price-block">
                <p className="sgp-original">$300</p>
                <div className="sgp-price-row">
                  <span className="sgp-price">$197</span>
                  <span className="sgp-period">/ 6 weeks</span>
                </div>
                <p className="sgp-save">Save $103. Fastest path to results.</p>
              </div>
            </div>
            <div className="sgp-rule" />
            <h4 className="sgp-included-title">Everything you need to transform how you communicate</h4>
            <ul className="sgp-features">
              {[
                ["6 private coaching sessions", "One focused 1-hour session with me every week."],
                ["A personal communication plan", "Training shaped around your goals, habits, and real challenges."],
                ["The complete 6-week roadmap", "Structure, voice, pace, expression, courage, and confident application."],
                ["Feedback on real situations", "Bring your meetings, presentations, interviews, and conversations."],
                ["Premium Speaker's Gym App", "Daily speaking reps with AI feedback and performance tracking."],
                ["Full MOUN Academy course", "Three hours of practical lessons and guided exercises."],
                ["Between-session support", "Stay accountable and get direction while you practice each week."],
                ["Conversation Playbook bonus", "Practical tools for starting, leading, and deepening conversations."],
              ].map(([title, detail]) => (
                <li className="sgp-feature" key={title}><span className="tick"><svg viewBox="0 0 8 8" fill="none"><path d="M1.5 4L3.5 6L6.5 2" stroke="#d9c06f" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span><strong>{title}</strong>{detail}</span></li>
              ))}
            </ul>
            <div className="sgp-offer-action">
              <p className="sgp-access-note"><span className="dot">✓</span><span>Get instant access to the app and course. I will personally contact you to schedule your first private session.</span></p>
              <a href={PURCHASE_URL} className="sgp-btn solid" onClick={trackLead} target="_blank" rel="noopener noreferrer">Start Your 6-Week Transformation →</a>
            </div>
          </div>

          <div className="sgp-guarantee">
            <div className="sgp-guarantee-seal" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 2.5l7 3v5.6c0 4.8-3.2 8.3-7 9.4-3.8-1.1-7-4.6-7-9.4V5.5l7-3z" stroke="#d9c06f" strokeWidth="1.5"/><path d="M8.7 11.8l2.1 2.1 4.6-4.7" stroke="#d9c06f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <strong>100%</strong>
              <span>Protected</span>
            </div>
            <div className="sgp-guarantee-content">
              <p className="sgp-guarantee-eyebrow">Train With Complete Confidence</p>
              <h3 className="sgp-guarantee-title">100% Money-Back Guarantee</h3>
              <p className="sgp-guarantee-text">Complete the six-week program and put the exercises into practice. If you do not feel significantly more confident speaking by the end, I'll refund every penny and coach you for another 30 days, completely free. I'm committed to helping you get there.</p>
              <div className="sgp-guarantee-benefits">
                <span className="sgp-guarantee-benefit"><span className="sgp-guarantee-check">✓</span>Every penny refunded</span>
                <span className="sgp-guarantee-benefit"><span className="sgp-guarantee-check">✓</span>30 extra days of coaching free</span>
              </div>
            </div>
          </div>

          <div className="sgp-trustbar">
            <span className="sgp-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l7 3v6c0 5-3.5 8.5-7 9-3.5-.5-7-4-7-9V5l7-3z" stroke="#8aad6e" strokeWidth="1.6" strokeLinejoin="round"/><path d="M9 12l2 2 4-4" stroke="#8aad6e" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span>Secure checkout via <strong>Stripe</strong></span>
            </span>
            <span className="sgp-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="6" width="18" height="13" rx="2" stroke="#d9c06f" strokeWidth="1.6"/><path d="M3 10h18" stroke="#d9c06f" strokeWidth="1.6"/></svg>
              <span>Cards &amp; Apple Pay accepted</span>
            </span>
            <span className="sgp-trust-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#d9c06f" strokeWidth="1.6"/><path d="M8 11V8a4 4 0 018 0v3" stroke="#d9c06f" strokeWidth="1.6"/></svg>
              <span>SSL encrypted &amp; private</span>
            </span>
          </div>

          <a href={BOOK_URL} className="sgp-btn outline" style={{ marginTop: 24 }}>Not ready? Book a Free Strategy Call</a>
        </div>
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
            { q: "What is included in the Speaker's Gym program?", a: "You receive six weekly private coaching sessions, a communication plan built around your goals, the complete 6-week roadmap, feedback on your real speaking situations, full access to the 3-hour MOUN Academy course, the Premium Speaker's Gym App with AI feedback and performance tracking, between-session support, and the Conversation Playbook bonus." },
            { q: "How much does the Speaker's Gym program cost?", a: "The complete six-week one-on-one program is $197. This includes six private coaching sessions, the MOUN Academy course, Speaker's Gym App access, performance tracking, personalized feedback, and the Conversation Playbook bonus." },
            { q: "What do we cover in the 6-week program?", a: "Week 1 builds clear, concise answers with PREP. Week 2 develops volume, breathing, and posture. Week 3 focuses on pace, pauses, and calm silence. Week 4 brings in pitch, tonality, and vocal contrast. Week 5 helps you speak before fear wins. Week 6 combines every skill in real meetings, conversations, presentations, and impromptu questions." },
            { q: "Is this for beginners or people who already speak well?", a: "Both. Whether you're just starting to work on your speaking or you already present regularly but want to sharpen your delivery, the training adapts to your level through direct feedback and daily practice." },
            { q: "What makes this different from a public speaking course?", a: "Most courses give you theory to watch. This is a training program. You practice speaking live every week, get direct feedback, and build the habit with daily reps on the app. It's closer to working with a personal trainer than watching a course." },
            { q: "How much time do I need each week?", a: "Plan for one 1-hour private coaching session plus 10 to 15 minutes of daily speaking practice. In total, expect around 2 to 3 hours per week." },
            { q: "What if I feel shy or nervous speaking in front of others?", a: "That is exactly who this is for. Every coaching session is private, supportive, and adapted to your current level. We start with low-pressure practice and build your confidence gradually." },
            { q: "Is the coaching personalized?", a: "Yes. Your sessions and action plan are built around your specific weaknesses, goals, and real speaking situations. You can bring upcoming meetings, presentations, interviews, and conversations into our work together." },
            { q: "When does the program start?", a: "You get immediate access to the course and app after joining. I will personally contact you to schedule your first private coaching session." },
          ].map((item, i) => (
            <Reveal key={i} delay={i * 60}>
              <FAQ q={item.q} a={item.a} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <a href={BOOK_URL} className="btn-primary">Book a Free Strategy Call</a>
          </div>
        </Reveal>
      </section>

      <SiteFooter />

      {/* ── STICKY MOBILE CTA ── */}
      <div className="sticky-cta">
        <a href={BOOK_URL}>Book a Free Call</a>
      </div>
    </>
  );
}
