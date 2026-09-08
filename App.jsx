import { useState, useEffect, useRef } from "react";
import heroVideoThumbnail from "./4X3A5011.jpg";
import marouanePhoto from "./Marouane.png";
import { SiteFooter, SiteHeader } from "./SiteChrome.jsx";
import { BOOK_URL, COMMUNITY_URL } from "./siteConfig.js";

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
  const [heroVideoPlaying, setHeroVideoPlaying] = useState(false);

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
        .nav { position: fixed; top:0; left:0; right:0; z-index:100; background: rgba(17,17,17,.88); backdrop-filter: blur(18px); border-bottom: 1px solid var(--border); }
        .nav-inner { max-width:1400px; height:78px; margin:0 auto; padding:0 28px; display:grid; grid-template-columns:minmax(0,1fr) 88px minmax(0,1fr); align-items:center; gap:22px; }
        .nav-logo { grid-column:2; width:76px; height:76px; display:inline-flex; align-items:center; justify-content:center; justify-self:center; flex-shrink:0; text-decoration:none; }
        .nav-logo img { width:100%; height:100%; display:block; object-fit:contain; filter:drop-shadow(0 4px 12px rgba(0,0,0,.3)); }
        .nav-links { display:flex; align-items:center; gap:clamp(14px,1.65vw,25px); min-width:0; }
        .nav-links--left { grid-column:1; justify-content:flex-end; }
        .nav-links--right { grid-column:3; justify-content:flex-start; }
        .nav-links a { color:var(--text-dim); text-decoration:none; font-size:.79rem; font-weight:600; white-space:nowrap; transition: color .2s; }
        .nav-links a:hover { color:var(--accent); }
        .nav-links a.nav-cta { background:var(--accent); color:#000; font-weight:700; font-size:.72rem; padding:11px 17px; border-radius:6px; text-decoration:none; letter-spacing:.05em; text-transform:uppercase; transition: transform .2s, box-shadow .2s; }
        .nav-links a.nav-cta:hover { transform:translateY(-1px); box-shadow: 0 0 20px var(--accent-glow); color:#000; }
        .nav-hamburger { display:none; width:42px; height:42px; padding:0; border:1px solid rgba(224,221,212,.14); border-radius:50%; background:rgba(255,255,255,.025); color:var(--text); cursor:pointer; }
        .nav-hamburger-lines { width:17px; display:grid; gap:4px; margin:auto; }
        .nav-hamburger-lines i { display:block; height:1px; background:currentColor; }

        @media(max-width:1180px) {
          .nav-inner { height:72px; grid-template-columns:1fr 76px 1fr; padding:0 20px; }
          .nav-links { display:none; }
          .nav-logo { width:68px; height:68px; }
          .nav-hamburger { grid-column:3; grid-row:1; justify-self:end; display:grid; place-items:center; }
          .mobile-menu { position:fixed; inset:0; z-index:200; overflow-y:auto; background:rgba(12,12,12,.985); backdrop-filter:blur(24px); animation:menu-fade .22s ease both; }
          .mobile-menu-top { position:sticky; top:0; z-index:2; height:88px; display:grid; grid-template-columns:1fr 80px 1fr; align-items:center; padding:0 22px; border-bottom:1px solid var(--border); background:rgba(12,12,12,.94); }
          .mobile-menu-logo { grid-column:2; width:78px; height:78px; display:block; justify-self:center; }
          .mobile-menu-logo img { width:100%; height:100%; display:block; object-fit:contain; filter:drop-shadow(0 6px 16px rgba(0,0,0,.35)); }
          .mobile-menu-panel { width:min(100%,430px); margin:0 auto; padding:42px 28px 38px; animation:menu-rise .32s cubic-bezier(.16,1,.3,1) both; }
          .mobile-menu-label { margin:0 0 16px; color:var(--accent); font-size:.65rem; font-weight:700; letter-spacing:.24em; text-transform:uppercase; }
          .mobile-menu-links { border-top:1px solid var(--border); }
          .mobile-menu-links a { min-height:51px; display:flex; align-items:center; gap:16px; border-bottom:1px solid var(--border); color:var(--text); font-family:var(--font-body); font-size:.88rem; font-style:normal; font-weight:600; letter-spacing:.07em; text-decoration:none; text-transform:uppercase; transition:color .2s,padding-left .2s; }
          .mobile-menu-links a span { min-width:22px; color:var(--accent); font-size:.58rem; letter-spacing:.12em; }
          .mobile-menu-links a:hover { padding-left:5px; color:var(--accent-dim); }
          .mobile-menu-cta { width:100%; margin-top:28px; display:block; padding:15px 20px; border-radius:7px; background:var(--accent); color:#0a0a0a; font-size:.76rem; font-weight:700; letter-spacing:.09em; text-align:center; text-decoration:none; text-transform:uppercase; }
          .mobile-close { grid-column:3; justify-self:end; width:42px; height:42px; display:grid; place-items:center; padding:0; border:1px solid rgba(224,221,212,.14); border-radius:50%; background:rgba(255,255,255,.025); color:var(--text); cursor:pointer; }
          .mobile-close span { margin-top:-2px; font-family:Arial,sans-serif; font-size:1.55rem; font-weight:200; line-height:1; }
          @keyframes menu-fade { from { opacity:0; } to { opacity:1; } }
          @keyframes menu-rise { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        }
        @media(prefers-reduced-motion:reduce) {
          .mobile-menu, .mobile-menu-panel { animation:none; }
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
        .hero-video-poster { position:absolute; inset:0; width:100%; height:100%; padding:0; border:0; cursor:pointer; background:#000; color:#fff; display:block; }
        .hero-video-poster img { width:100%; height:100%; object-fit:cover; display:block; }
        .hero-video-poster::after { content:''; position:absolute; inset:0; background:linear-gradient(180deg, transparent 55%, rgba(0,0,0,.3)); transition:background .2s ease; }
        .hero-video-poster:hover::after { background:rgba(0,0,0,.12); }
        .hero-video-play { position:absolute; z-index:1; left:50%; top:50%; width:76px; height:76px; transform:translate(-50%,-50%); border-radius:50%; background:var(--accent); box-shadow:0 8px 35px rgba(0,0,0,.4); display:grid; place-items:center; transition:transform .2s ease, box-shadow .2s ease; }
        .hero-video-play::before { content:''; width:0; height:0; margin-left:5px; border-top:12px solid transparent; border-bottom:12px solid transparent; border-left:19px solid #111; }
        .hero-video-poster:hover .hero-video-play { transform:translate(-50%,-50%) scale(1.06); box-shadow:0 10px 42px rgba(0,0,0,.5); }
        .hero-video-poster:focus-visible { outline:3px solid var(--accent); outline-offset:-3px; }
        @media(max-width:600px) { .hero-video-play { width:60px; height:60px; } }

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

        /* ── ROADMAP ── */
        .roadmap-section { position:relative; max-width:1240px; overflow:hidden; }
        .roadmap-section::before { content:''; position:absolute; width:520px; height:520px; top:20px; right:-260px; border-radius:50%; background:radial-gradient(circle, rgba(217,192,111,.09), transparent 68%); pointer-events:none; }
        .roadmap-shell { position:relative; overflow:hidden; margin-top:52px; padding:44px 38px 34px; border:1px solid rgba(217,192,111,.2); border-radius:24px; background:linear-gradient(145deg,rgba(20,22,22,.98),rgba(13,15,16,.99)); box-shadow:0 30px 90px rgba(0,0,0,.24); }
        .roadmap-shell::before { content:''; position:absolute; inset:0; background:linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px); background-size:16.666% 100%; pointer-events:none; }
        .roadmap-intro { position:relative; z-index:1; max-width:860px; }
        .roadmap-intro .section-title { max-width:1100px; font-size:clamp(2.6rem,4.3vw,4rem); text-transform:uppercase; letter-spacing:.015em; }
        .roadmap-intro .section-subtitle { max-width:650px; }
        .roadmap-journey { position:relative; z-index:1; display:grid; grid-template-columns:repeat(6,minmax(0,1fr)); gap:16px; padding-top:54px; }
        .roadmap-track { position:absolute; top:17px; left:8.333%; right:8.333%; height:2px; background:linear-gradient(90deg,rgba(217,192,111,.35),var(--accent) 18%,var(--accent) 82%,rgba(217,192,111,.35)); }
        .roadmap-card { position:relative; min-height:260px; padding:28px 18px 22px; border:1px solid rgba(224,221,212,.14); border-top:3px solid var(--accent); border-radius:0 0 8px 8px; background:rgba(28,30,32,.88); transition:transform .3s ease,border-color .3s ease,background .3s ease; }
        .roadmap-card:hover { transform:translateY(-5px); border-color:rgba(217,192,111,.38); background:rgba(32,34,35,.98); }
        .roadmap-node { position:absolute; top:-54px; left:50%; width:36px; height:36px; display:flex; align-items:center; justify-content:center; transform:translateX(-50%); border:1px solid #f0d77f; border-radius:50%; color:#111; background:var(--accent); box-shadow:0 0 0 7px #111314,0 0 28px rgba(217,192,111,.18); font-size:.8rem; font-weight:800; }
        .roadmap-week-label { position:absolute; top:-88px; left:50%; transform:translateX(-50%); color:var(--accent); font-size:.68rem; line-height:1; font-weight:700; letter-spacing:.12em; text-transform:uppercase; white-space:nowrap; }
        .roadmap-focus { display:block; margin-bottom:20px; color:var(--accent); font-size:.72rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; }
        .roadmap-card h3 { min-height:68px; margin:0 0 28px; color:#f2eee5; font-family:var(--font-body); font-size:1rem; font-style:normal; font-weight:700; line-height:1.45; }
        .roadmap-card p { margin-top:auto; color:#9f9d9a; font-size:.78rem; line-height:1.55; }
        .roadmap-exposure { position:relative; z-index:1; display:grid; grid-template-columns:auto 1fr; gap:24px; align-items:center; margin-top:30px; padding:20px 24px; border-top:1px solid rgba(217,192,111,.24); border-bottom:1px solid rgba(217,192,111,.24); background:rgba(217,192,111,.025); }
        .roadmap-exposure strong { color:var(--accent); font-family:var(--font-display); font-size:1rem; font-style:italic; white-space:nowrap; }
        .roadmap-exposure-flow { display:flex; align-items:center; justify-content:flex-end; gap:10px; color:#c7c2b7; font-size:.72rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; }
        .roadmap-exposure-flow i { width:26px; height:1px; background:rgba(217,192,111,.45); }
        @media(max-width:1050px){
          .roadmap-journey { grid-template-columns:repeat(3,minmax(0,1fr)); gap:68px 18px; }
          .roadmap-track { display:none; }
          .roadmap-card { min-height:230px; }
        }
        @media(max-width:700px){
          .roadmap-shell { margin-top:38px; padding:34px 20px 28px; border-radius:18px; }
          .roadmap-shell::before { background-size:50% 100%; }
          .roadmap-journey { grid-template-columns:1fr; gap:18px; padding:0 0 0 42px; }
          .roadmap-journey::before { content:''; position:absolute; top:18px; bottom:18px; left:17px; width:1px; background:linear-gradient(var(--accent),rgba(217,192,111,.18)); }
          .roadmap-card { min-height:0; padding:24px 22px; border-top-width:1px; border-left:3px solid var(--accent); border-radius:0 10px 10px 0; }
          .roadmap-node { top:22px; left:-43px; width:34px; height:34px; transform:none; box-shadow:0 0 0 6px #111314; }
          .roadmap-week-label { position:static; display:block; transform:none; margin-bottom:14px; }
          .roadmap-focus { margin-bottom:10px; }
          .roadmap-card h3 { min-height:0; margin-bottom:12px; font-size:1.05rem; }
          .roadmap-exposure { grid-template-columns:1fr; gap:12px; padding:20px 4px; }
          .roadmap-exposure strong { white-space:normal; }
          .roadmap-exposure-flow { justify-content:flex-start; flex-wrap:wrap; gap:8px; }
          .roadmap-exposure-flow i { width:14px; }
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
        .footer-logo { width:116px; height:116px; margin:0 auto 12px; display:block; }
        .footer-logo img { width:100%; height:100%; display:block; object-fit:contain; filter:drop-shadow(0 10px 24px rgba(0,0,0,.35)); }
        .footer-social { width:max-content; margin:0 auto 18px; display:flex; align-items:center; gap:8px; color:var(--accent); font-size:.82rem; font-weight:600; text-decoration:none; transition:color .2s, transform .2s; }
        .footer-social:hover { color:var(--accent-dim); transform:translateY(-1px); }
        .footer-social svg { width:19px; height:19px; fill:none; stroke:currentColor; stroke-width:1.7; }
        .footer-social .instagram-dot { fill:currentColor; stroke:none; }

        @media (max-width: 600px) {
          .hero-transform-from { font-size: 14px; min-width: 90px; }
          .hero-transform-to { font-size: 17px; min-width: 90px; }
          .hero-transform-arrow-line { width: 16px; }
          .hero-flourish-line { width: 36px; }
        }
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
                  {heroVideoPlaying ? (
                    <iframe
                      src="https://player.vimeo.com/video/1224390886?autoplay=1&title=0&byline=0&portrait=0&badge=0&autopause=0&player_id=0&app_id=58479"
                      title="VSL final-1"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <button
                      type="button"
                      className="hero-video-poster"
                      onClick={() => setHeroVideoPlaying(true)}
                      aria-label="Play Speaker's Gym video with sound"
                    >
                      <img
                        src={heroVideoThumbnail}
                        alt=""
                        loading="lazy"
                      />
                      <span className="hero-video-play" aria-hidden="true" />
                    </button>
                  )}
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
          <div className="section-label">Your Six-Week Journey</div>
          <div className="section-title">Build Your Voice. Week by Week.</div>
          <p className="section-subtitle">Technique and real-world practice, together.</p>
        </Reveal>

        <Reveal>
          <div className="roadmap-shell">
            <div className="roadmap-journey">
              <span className="roadmap-track" aria-hidden="true" />
              {[
                { w: "1", focus: "Structure", outcome: "Organize your thoughts.", tools: "PREP frameworks + baseline video" },
                { w: "2", focus: "Volume", outcome: "Make your voice heard.", tools: "Volume + grounded voice practice" },
                { w: "3", focus: "Pace", outcome: "Take control of your speed.", tools: "Pace + spontaneous delivery" },
                { w: "4", focus: "Pauses", outcome: "Give your words room to land.", tools: "Thinking pauses + comfort with silence" },
                { w: "5", focus: "Storytelling", outcome: "Bring your personality out.", tools: "Stories + tone + pitch + expression" },
                { w: "6", focus: "Progress", outcome: "See how far you have come.", tools: "Full integration + video comparison + next steps" },
              ].map((wk) => (
                <article className="roadmap-card" key={wk.w}>
                  <span className="roadmap-week-label">Week {wk.w}</span>
                  <span className="roadmap-node" aria-hidden="true">{wk.w}</span>
                  <span className="roadmap-focus">{wk.focus}</span>
                  <h3>{wk.outcome}</h3>
                  <p>{wk.tools}</p>
                </article>
              ))}
            </div>
            <div className="roadmap-exposure">
              <strong>Personalized exposure runs through every week.</strong>
              <div className="roadmap-exposure-flow" aria-label="Learn, practise, use it in real life, collect evidence">
                <span>Learn</span><i /><span>Practise</span><i /><span>Use it in real life</span><i /><span>Collect evidence</span>
              </div>
            </div>
          </div>
        </Reveal>

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
            { q: "Who is Speaker's Gym designed for?", a: "Speaker's Gym is built for shy and socially nervous professionals who know what they want to say but struggle to access it under pressure. It helps you speak with more structure, a stronger voice, and greater freedom in meetings, presentations, interviews, networking, and everyday conversations." },
            { q: "What is included in the six-week program?", a: "You receive six private one-on-one coaching sessions, a personalized communication roadmap, a personalized exposure plan, full access to the three-hour MOUN Academy course, practical exercises, the Speaker's Gym App with AI feedback, performance tracking, feedback on real speaking situations, between-session support, and the Conversation Playbook bonus." },
            { q: "What will I work on each week?", a: "Week 1 helps you organize your thoughts with PREP. Week 2 strengthens your volume. Week 3 gives you control of your pace and spontaneous delivery. Week 4 develops intentional pauses and comfort with silence. Week 5 uses storytelling, tone, pitch, and expression to bring out your personality. Week 6 integrates everything, compares your progress, and creates your next-step plan." },
            { q: "Does real-world exposure happen throughout the program?", a: "Yes. Exposure starts in Week 1 and continues every week. Your missions begin with manageable actions and gradually move toward the situations that matter most to you, so confidence grows from real evidence rather than theory alone." },
            { q: "What makes this different from a typical communication course?", a: "MOUN Academy gives you the roadmap and communication techniques. Private coaching and personalized exposure help you use those techniques when you feel nervous. Techniques teach you what to do. Exposure teaches you to do it when it matters." },
            { q: "Is the coaching personalized?", a: "Completely. Your sessions, exposure levels, missions, feedback, and practice plan are built around your fears, workplace, goals, and real speaking situations. This is not a generic exposure challenge or a one-size-fits-all course." },
            { q: "How much time should I set aside each week?", a: "You will have one private 60-minute coaching session each week, plus short practice and one manageable real-world mission. The plan is designed to fit into your life and build steady progress without overwhelming you." },
            { q: "What if I still feel nervous while speaking?", a: "You do not need to wait until you feel fearless. We start at a level that feels manageable, practise the next step, and adjust the strategy when needed. The goal is to help you speak with growing freedom while still being yourself." },
            { q: "Is there a money-back guarantee?", a: "Yes. Complete the six-week program and put the exercises into practice. If you do not feel significantly more confident speaking by the end, I'll refund every penny and coach you for another 30 days, completely free. I'm committed to helping you get there." },
            { q: "When can I start?", a: "You receive immediate access to the course and app after joining. I will personally contact you to schedule your first private coaching session." },
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
