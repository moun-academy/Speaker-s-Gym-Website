import { useEffect } from "react";

/* ─── shared theme + layout for the thank-you pages ─── */
const SCHEDULE_URL = "https://calendly.com/marouane-speakers-gym/30min";

function ThankYouLayout({ badge, title, subtitle, body, footerNote }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --bg: #111111;
          --surface: #171717;
          --border: rgba(217, 192, 111, 0.14);
          --text: #e0ddd4;
          --text-dim: #9a9790;
          --accent: #d9c06f;
          --accent-glow: rgba(217, 192, 111, 0.12);
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
        }
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { background: var(--bg); }
        body { font-family: var(--font-body); color: var(--text); background: var(--bg); -webkit-font-smoothing: antialiased; }

        .ty-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center; padding: 100px 24px; position:relative; overflow:hidden; }
        .ty-wrap::before {
          content:''; position:absolute; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px; pointer-events:none;
        }
        .ty-wrap::after {
          content:''; position:absolute; top:-80px; left:50%; transform:translateX(-50%);
          width:900px; height:560px;
          background: radial-gradient(ellipse, rgba(217, 192, 111, 0.08) 0%, transparent 65%);
          pointer-events:none;
        }
        .ty-card { position:relative; z-index:1; max-width:640px; width:100%; }
        .ty-flourish { display:flex; align-items:center; justify-content:center; gap:16px; margin: 0 auto 28px; }
        .ty-flourish-line { width:60px; height:1px; background: linear-gradient(90deg, transparent, var(--accent), transparent); }
        .ty-flourish-diamond { width:8px; height:8px; background:var(--accent); transform:rotate(45deg); opacity:.7; }
        .ty-badge { display:inline-block; border:1px solid var(--accent); color:var(--accent); font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:6px 16px; border-radius:100px; margin-bottom:28px; }
        .ty-title { font-family:var(--font-display); font-style:italic; font-weight:600; font-size:clamp(2.6rem,7vw,4.2rem); line-height:1.1; color:var(--accent); margin-bottom:18px; }
        .ty-subtitle { font-family:var(--font-display); font-style:italic; font-size:clamp(1.15rem,3vw,1.5rem); color:#f2ecdf; margin:0 auto 28px; max-width:520px; line-height:1.4; }
        .ty-body { font-size:1.05rem; color:var(--text-dim); line-height:1.75; max-width:560px; margin:0 auto 40px; }
        .ty-body a { color:var(--accent); text-decoration:none; border-bottom:1px solid var(--border); }
        .ty-body a:hover { border-color:var(--accent); }
        .ty-btn { background:var(--accent); color:#0a0a0a; font-weight:700; font-size:.85rem; padding:14px 34px; border-radius:8px; text-decoration:none; letter-spacing:.04em; text-transform:uppercase; transition: transform .2s, box-shadow .2s; display:inline-block; }
        .ty-btn:hover { transform:translateY(-2px); box-shadow: 0 4px 30px var(--accent-glow); }
        .ty-footnote { margin-top:36px; font-size:.85rem; color:var(--text-dim); }
        .ty-footnote a { color:var(--accent); text-decoration:none; }
        .ty-footnote a:hover { text-decoration:underline; }
      `}</style>

      <main className="ty-wrap">
        <div className="ty-card">
          <div className="ty-flourish">
            <div className="ty-flourish-line" />
            <div className="ty-flourish-diamond" />
            <div className="ty-flourish-line" />
          </div>
          {badge && <div className="ty-badge">{badge}</div>}
          <h1 className="ty-title">{title}</h1>
          <p className="ty-subtitle">{subtitle}</p>
          <p className="ty-body">{body}</p>
          <a href="/" className="ty-btn">Back to Home</a>
          {footerNote && <div className="ty-footnote">{footerNote}</div>}
        </div>
      </main>
    </>
  );
}

/* ─── /thank-you-call ───
   Dedicated booking-confirmation page. Visitors land here only after a
   successful Calendly booking (BookACall redirects on calendly.event_scheduled),
   so its own URL doubles as the Meta pixel conversion event. */
export function ThankYouCall() {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      // A booked call is the conversion we care about on this page.
      window.fbq("track", "Schedule");
    }
    document.title = "You're Booked! — The Speaker's Gym";
  }, []);

  const steps = [
    {
      title: "Check your inbox",
      desc: "Your confirmation and calendar invite are on their way. Add it to your calendar so the time is blocked off.",
    },
    {
      title: "Come as you are",
      desc: "No prep needed. Just think about one speaking situation that makes you nervous — a meeting, a pitch, a presentation.",
    },
    {
      title: "We talk it through",
      desc: "30 minutes, 1-on-1. We map where you are, what's holding you back, and whether the Speaker's Gym is the right fit. No pressure, no pitch.",
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --bg: #111111;
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
        html { background: var(--bg); scroll-behavior:smooth; }
        body { font-family: var(--font-body); color: var(--text); background: var(--bg); -webkit-font-smoothing: antialiased; }

        .tyc-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center; padding: 96px 24px; position:relative; overflow:hidden; }
        .tyc-wrap::before {
          content:''; position:absolute; inset:0;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px; pointer-events:none;
        }
        .tyc-wrap::after {
          content:''; position:absolute; top:-120px; left:50%; transform:translateX(-50%);
          width:1000px; height:620px; max-width:120%;
          background: radial-gradient(ellipse, rgba(217, 192, 111, 0.09) 0%, transparent 65%);
          pointer-events:none;
        }
        .tyc-card { position:relative; z-index:1; max-width:660px; width:100%; }

        /* animated success check */
        .tyc-check { width:88px; height:88px; margin:0 auto 30px; position:relative; }
        .tyc-check-ring { position:absolute; inset:0; border-radius:50%; border:1px solid var(--border); }
        .tyc-check-ring::after {
          content:''; position:absolute; inset:-1px; border-radius:50%;
          background: radial-gradient(circle, var(--accent-glow), transparent 70%);
        }
        .tyc-check svg { position:absolute; inset:0; width:100%; height:100%; }
        .tyc-check-circle { stroke:var(--accent); stroke-width:1.6; fill:none; stroke-dasharray:264; stroke-dashoffset:264; animation: tyc-draw .7s cubic-bezier(.65,0,.35,1) forwards; }
        .tyc-check-tick { stroke:var(--accent); stroke-width:2.4; fill:none; stroke-linecap:round; stroke-linejoin:round; stroke-dasharray:48; stroke-dashoffset:48; animation: tyc-draw .4s cubic-bezier(.65,0,.35,1) .55s forwards; }
        @keyframes tyc-draw { to { stroke-dashoffset:0; } }

        .tyc-rise { opacity:0; transform:translateY(16px); animation: tyc-rise .7s cubic-bezier(.16,1,.3,1) forwards; }
        @keyframes tyc-rise { to { opacity:1; transform:translateY(0); } }

        .tyc-badge { display:inline-block; border:1px solid var(--accent); color:var(--accent); font-size:.72rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; padding:6px 16px; border-radius:100px; margin-bottom:22px; }
        .tyc-title { font-family:var(--font-display); font-style:italic; font-weight:600; font-size:clamp(2.6rem,7vw,4rem); line-height:1.1; color:var(--accent); margin-bottom:16px; }
        .tyc-subtitle { font-family:var(--font-display); font-style:italic; font-size:clamp(1.15rem,3vw,1.45rem); color:#f2ecdf; margin:0 auto 44px; max-width:520px; line-height:1.45; }

        .tyc-steps-label { font-size:.72rem; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--accent); margin-bottom:22px; }
        .tyc-steps { display:flex; flex-direction:column; gap:14px; text-align:left; margin:0 auto 44px; max-width:540px; }
        .tyc-step { display:flex; gap:18px; align-items:flex-start; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:20px 22px; transition: border-color .3s, transform .3s; }
        .tyc-step:hover { border-color:var(--accent); transform:translateY(-2px); }
        .tyc-step-num { flex-shrink:0; width:34px; height:34px; border-radius:50%; border:1px solid var(--accent); color:var(--accent); display:flex; align-items:center; justify-content:center; font-family:var(--font-display); font-style:italic; font-size:1.05rem; }
        .tyc-step h3 { font-family:var(--font-display); font-style:italic; font-weight:600; font-size:1.15rem; color:#f2ecdf; margin-bottom:5px; }
        .tyc-step p { color:var(--text-dim); font-size:.94rem; line-height:1.6; }

        .tyc-btns { display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .tyc-btn { background:var(--accent); color:#0a0a0a; font-weight:700; font-size:.85rem; padding:14px 32px; border-radius:8px; text-decoration:none; letter-spacing:.04em; text-transform:uppercase; transition: transform .2s, box-shadow .2s; display:inline-block; }
        .tyc-btn:hover { transform:translateY(-2px); box-shadow: 0 4px 30px var(--accent-glow); }
        .tyc-btn-ghost { border:1px solid var(--border); color:var(--text); font-weight:600; font-size:.85rem; padding:14px 32px; border-radius:8px; text-decoration:none; letter-spacing:.02em; transition: border-color .2s, color .2s; display:inline-block; }
        .tyc-btn-ghost:hover { border-color:var(--accent); color:var(--accent); }

        .tyc-footnote { margin-top:34px; font-size:.85rem; color:var(--text-dim); }
        .tyc-footnote a { color:var(--accent); text-decoration:none; }
        .tyc-footnote a:hover { text-decoration:underline; }
      `}</style>

      <main className="tyc-wrap">
        <div className="tyc-card">
          <div className="tyc-check">
            <div className="tyc-check-ring" />
            <svg viewBox="0 0 96 96">
              <circle className="tyc-check-circle" cx="48" cy="48" r="42" />
              <path className="tyc-check-tick" d="M31 49l11 11 23-25" />
            </svg>
          </div>

          <div className="tyc-rise" style={{ animationDelay: ".15s" }}>
            <div className="tyc-badge">Call Confirmed</div>
          </div>
          <h1 className="tyc-title tyc-rise" style={{ animationDelay: ".22s" }}>You're Booked!</h1>
          <p className="tyc-subtitle tyc-rise" style={{ animationDelay: ".3s" }}>
            Your free 30-minute strategy call is confirmed. I'm looking forward to speaking with you.
          </p>

          <div className="tyc-rise" style={{ animationDelay: ".4s" }}>
            <div className="tyc-steps-label">What happens next</div>
            <div className="tyc-steps">
              {steps.map((s, i) => (
                <div className="tyc-step" key={i}>
                  <div className="tyc-step-num">{i + 1}</div>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tyc-btns tyc-rise" style={{ animationDelay: ".5s" }}>
            <a href="/" className="tyc-btn">Back to Home</a>
            <a href="https://www.skool.com/moun-academy-2097/about" className="tyc-btn-ghost" target="_blank" rel="noopener noreferrer">Join the Free Community</a>
          </div>

          <div className="tyc-footnote tyc-rise" style={{ animationDelay: ".58s" }}>
            Need to reschedule? <a href={SCHEDULE_URL} target="_blank" rel="noopener noreferrer">Manage your booking</a>
          </div>
        </div>
      </main>
    </>
  );
}

/* ─── /thank-you-purchase ─── */
export function ThankYouPurchase() {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Purchase", { value: 0, currency: "USD" });
    }
    document.title = "Welcome to The Speaker's Gym!";
  }, []);

  return (
    <ThankYouLayout
      badge="Spot Confirmed"
      title="Welcome to The Speaker's Gym!"
      subtitle="Your spot is confirmed. You made a great decision."
      body={
        <>
          You will receive an email shortly with everything you need to get started.
          If you have any questions in the meantime, reach out at{" "}
          <a href="mailto:marouane@speakers-gym.com">marouane@speakers-gym.com</a>.
        </>
      }
    />
  );
}
