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

/* ─── /thank-you-call ─── */
export function ThankYouCall() {
  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }
    document.title = "You're Booked! — The Speaker's Gym";
  }, []);

  return (
    <ThankYouLayout
      badge="Call Confirmed"
      title="You're Booked!"
      subtitle="Your free strategy call is confirmed. Check your email for the details."
      body="While you wait, here is what to expect on the call: we will talk about where you are now, what is holding you back, and whether the Speaker's Gym is the right fit for you. No pressure, no pitch. Just a real conversation."
      footerNote={
        <>Need to reschedule? <a href={SCHEDULE_URL} target="_blank" rel="noopener noreferrer">Manage your booking</a></>
      }
    />
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
