import { useEffect, useRef } from "react";

const CALENDLY_SLUG = "https://calendly.com/marouane-speakers-gym/30min";

/* Calendly renders in its default light theme (clean + readable) inside a
   white card. We only override primary_color so the brand gold carries over
   to the buttons — forcing a dark background_color leaves Calendly's calendar
   grid half-styled, which looks broken. */
const CALENDLY_URL =
  `${CALENDLY_SLUG}` +
  "?hide_gdpr_banner=1" +
  "&primary_color=c2a14a";

export default function BookACall() {
  const widgetRef = useRef(null);

  useEffect(() => {
    document.title = "Book a Free Strategy Call — The Speaker's Gym";

    // Fire the Meta "Lead" pixel as soon as someone lands on the booking page.
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }

    // Listen for a successful booking, then send the visitor to a dedicated
    // success page (/success). Routing the conversion to its own URL lets the
    // Meta pixel track bookings as a clean page-view event instead of an inline
    // fire that's easy to miss.
    const onMessage = (e) => {
      if (
        e.origin === "https://calendly.com" &&
        e.data?.event === "calendly.event_scheduled"
      ) {
        window.location.assign("/success");
      }
    };
    window.addEventListener("message", onMessage);

    // Initialise the Calendly inline widget exactly once. Guarding on the
    // container node prevents a second init (e.g. StrictMode double-invoke or
    // multiple script "load" callbacks) from stacking a second iframe on top —
    // which is what caused the overlapping/ghosting calendar dates.
    const initWidget = () => {
      const el = widgetRef.current;
      if (!window.Calendly || !el || el.dataset.calInit === "1") return;
      el.dataset.calInit = "1";
      el.innerHTML = "";
      window.Calendly.initInlineWidget({ url: CALENDLY_URL, parentElement: el });
    };

    if (!document.querySelector('link[href*="calendly.com/assets/external/widget.css"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://assets.calendly.com/assets/external/widget.css";
      document.head.appendChild(link);
    }

    if (window.Calendly) {
      initWidget();
    } else {
      let script = document.querySelector('script[src*="calendly.com/assets/external/widget.js"]');
      if (!script) {
        script = document.createElement("script");
        script.src = "https://assets.calendly.com/assets/external/widget.js";
        script.async = true;
        document.body.appendChild(script);
      }
      script.addEventListener("load", initWidget);
    }

    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --bg: #111111;
          --bg2: #141414;
          --surface: #171717;
          --border: rgba(217, 192, 111, 0.14);
          --text: #e0ddd4;
          --text-dim: #9a9790;
          --accent: #d9c06f;
          --accent-dim: #e8d590;
          --accent-glow: rgba(217, 192, 111, 0.12);
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
        }
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; background:var(--bg); }
        body { font-family:var(--font-body); color:var(--text); background:var(--bg); -webkit-font-smoothing:antialiased; }

        .bc-nav { position:sticky; top:0; z-index:100; background:rgba(17,17,17,.82); backdrop-filter:blur(14px); border-bottom:1px solid var(--border); }
        .bc-nav-inner { max-width:1100px; margin:0 auto; padding:0 24px; height:64px; display:flex; align-items:center; justify-content:space-between; }
        .bc-logo { font-family:var(--font-display); font-size:1.3rem; font-style:italic; font-weight:600; letter-spacing:.02em; color:var(--text); text-decoration:none; }
        .bc-logo span { color:var(--accent); }
        .bc-back { color:var(--text-dim); text-decoration:none; font-size:.875rem; font-weight:500; transition:color .2s; }
        .bc-back:hover { color:var(--accent); }

        .bc-main { min-height:calc(100vh - 64px); position:relative; overflow:hidden; padding:48px 24px 64px; }
        .bc-main::before {
          content:''; position:absolute; top:-80px; left:50%; transform:translateX(-50%);
          width:900px; height:520px; max-width:100%;
          background:radial-gradient(ellipse, rgba(217,192,111,.07) 0%, transparent 65%);
          pointer-events:none;
        }
        .bc-inner { position:relative; z-index:1; max-width:1000px; margin:0 auto; }

        .bc-head { text-align:center; margin-bottom:36px; }
        .bc-flourish { display:flex; align-items:center; justify-content:center; gap:16px; margin:0 auto 22px; }
        .bc-flourish-line { width:60px; height:1px; background:linear-gradient(90deg, transparent, var(--accent), transparent); }
        .bc-flourish-diamond { width:8px; height:8px; background:var(--accent); transform:rotate(45deg); opacity:.7; }
        .bc-badge { display:inline-block; border:1px solid var(--accent); color:var(--accent); font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:6px 16px; border-radius:100px; margin-bottom:20px; }
        .bc-title { font-family:var(--font-display); font-style:italic; font-weight:600; font-size:clamp(2.1rem,5.5vw,3.2rem); line-height:1.15; color:var(--accent); margin-bottom:14px; }
        .bc-sub { font-size:1.05rem; color:var(--text-dim); max-width:560px; margin:0 auto; line-height:1.65; }

        .bc-points { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:14px 28px; margin:24px auto 0; max-width:760px; }
        .bc-point { display:flex; align-items:center; gap:9px; font-size:.92rem; color:var(--text-dim); }
        .bc-point svg { flex-shrink:0; }
        .bc-point strong { color:#c8bc9a; font-weight:600; }

        .bc-widget-wrap { margin:36px auto 0; border:1px solid var(--border); border-radius:18px; overflow:hidden; background:#ffffff; box-shadow:0 24px 70px rgba(0,0,0,.45), 0 0 0 1px rgba(217,192,111,.06); position:relative; }
        .bc-widget-wrap::before { content:''; position:absolute; top:0; left:0; right:0; height:3px; background:linear-gradient(90deg, transparent 8%, var(--accent) 35%, var(--accent-dim) 50%, var(--accent) 65%, transparent 92%); z-index:2; }
        .bc-widget { min-width:320px; width:100%; height:760px; }
        .bc-widget-loading { display:flex; flex-direction:column; align-items:center; justify-content:center; height:760px; gap:18px; color:#6a6a6a; background:#ffffff; }
        .bc-spinner { width:34px; height:34px; border:3px solid #e5e5e5; border-top-color:var(--accent); border-radius:50%; animation:bc-spin .8s linear infinite; }
        @keyframes bc-spin { to { transform:rotate(360deg); } }

        .bc-footnote { text-align:center; margin-top:28px; font-size:.85rem; color:var(--text-dim); }
        .bc-footnote a { color:var(--accent); text-decoration:none; }
        .bc-footnote a:hover { text-decoration:underline; }

        @media(max-width:680px){
          .bc-main { padding:32px 16px 48px; }
          .bc-widget, .bc-widget-loading { height:680px; }
        }
      `}</style>

      <nav className="bc-nav">
        <div className="bc-nav-inner">
          <a href="/" className="bc-logo">THE SPEAKER'S <span>GYM</span></a>
          <a href="/" className="bc-back">← Back to site</a>
        </div>
      </nav>

      <main className="bc-main">
        <div className="bc-inner">
          <div className="bc-head">
            <div className="bc-flourish">
              <div className="bc-flourish-line" />
              <div className="bc-flourish-diamond" />
              <div className="bc-flourish-line" />
            </div>
            <div className="bc-badge">Free · 30 Minutes</div>
            <h1 className="bc-title">Book Your Free Strategy Call</h1>
            <p className="bc-sub">
              Pick a time below and we'll talk about where you are now, what's holding
              you back, and whether the Speaker's Gym is the right fit. No pressure, no pitch.
            </p>

            <div className="bc-points">
              <span className="bc-point">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#d9c06f" strokeWidth="1.6"/><path d="M12 7v5l3 2" stroke="#d9c06f" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span><strong>30-minute</strong> 1-on-1 call</span>
              </span>
              <span className="bc-point">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="#d9c06f" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span>Honest, <strong>no-pressure</strong> conversation</span>
              </span>
              <span className="bc-point">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="4" y="5" width="16" height="15" rx="2" stroke="#d9c06f" strokeWidth="1.6"/><path d="M4 9h16M8 3v4M16 3v4" stroke="#d9c06f" strokeWidth="1.6" strokeLinecap="round"/></svg>
                <span>Instant calendar <strong>confirmation</strong></span>
              </span>
            </div>
          </div>

          <div className="bc-widget-wrap">
            <div ref={widgetRef} className="bc-widget">
              {/* Calendly inline widget mounts here; fallback shown until it loads */}
              <div className="bc-widget-loading">
                <div className="bc-spinner" />
                <span>Loading available times…</span>
              </div>
            </div>
          </div>

          <p className="bc-footnote">
            Trouble loading the calendar?{" "}
            <a href={CALENDLY_SLUG} target="_blank" rel="noopener noreferrer">Open the booking page in a new tab</a>.
          </p>
        </div>
      </main>
    </>
  );
}
