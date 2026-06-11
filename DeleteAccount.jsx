import { useEffect } from "react";

const DELETE_EMAIL = "marouane@speakers-gym.com";

/* ─── /delete-account — Google Play account deletion page ─── */
export default function DeleteAccount() {
  useEffect(() => {
    document.title = "Delete Your Account — Speaker's Gym";
  }, []);

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
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
        }
        *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
        html { background: var(--bg); scroll-behavior:smooth; }
        body { font-family: var(--font-body); color: var(--text); background: var(--bg); -webkit-font-smoothing: antialiased; }

        .da-wrap { max-width:780px; margin:0 auto; padding: 72px 24px 96px; }
        .da-back { display:inline-block; color:var(--text-dim); text-decoration:none; font-size:.85rem; margin-bottom:32px; transition:color .2s; }
        .da-back:hover { color:var(--accent); }
        .da-title { font-family:var(--font-display); font-style:italic; font-weight:600; font-size:clamp(2.2rem,6vw,3rem); color:var(--accent); margin-bottom:10px; }
        .da-app { color:var(--text-dim); font-size:.9rem; margin-bottom:36px; }
        .da-app strong { color:#c8bc9a; font-weight:600; }
        .da-intro { color:var(--text-dim); line-height:1.75; font-size:1.02rem; margin-bottom:36px; }
        .da-section { margin-bottom:36px; }
        .da-section h2 { font-family:var(--font-display); font-style:italic; font-weight:600; font-size:1.4rem; color:#f2ecdf; margin-bottom:16px; }
        .da-section p { color:var(--text-dim); line-height:1.75; font-size:.98rem; margin-bottom:12px; }
        .da-steps { counter-reset: step; list-style:none; margin:8px 0; }
        .da-steps li { position:relative; padding:6px 0 6px 44px; color:var(--text-dim); line-height:1.6; font-size:1rem; margin-bottom:10px; }
        .da-steps li::before { counter-increment: step; content: counter(step); position:absolute; left:0; top:4px; width:28px; height:28px; border-radius:50%; background:rgba(217,192,111,.1); border:1px solid rgba(217,192,111,.3); color:var(--accent); font-family:var(--font-display); font-style:italic; font-size:.9rem; display:flex; align-items:center; justify-content:center; }
        .da-list { list-style:none; margin:8px 0 12px; }
        .da-list li { position:relative; padding:6px 0 6px 22px; color:var(--text-dim); line-height:1.6; font-size:.98rem; }
        .da-list li::before { content:'→'; position:absolute; left:0; color:var(--accent); }
        .da-section strong { color:#c8bc9a; font-weight:600; }
        .da-callout { background:#141414; border:1px solid rgba(217,192,111,.18); border-radius:14px; padding:24px 26px; margin:8px 0 4px; }
        .da-callout-label { font-size:.72rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; color:var(--accent); margin-bottom:10px; }
        .da-email { font-family:var(--font-display); font-style:italic; font-size:1.4rem; color:var(--accent); text-decoration:none; word-break:break-all; }
        .da-email:hover { text-decoration:underline; }
        .da-subject { display:inline-block; margin-top:12px; font-size:.92rem; color:var(--text-dim); }
        .da-subject code { color:#c8bc9a; background:rgba(217,192,111,.08); border:1px solid var(--border); padding:2px 8px; border-radius:5px; font-size:.88rem; }
      `}</style>

      <main className="da-wrap">
        <a href="/" className="da-back">← Back to Home</a>
        <h1 className="da-title">Delete Your Account</h1>
        <p className="da-app"><strong>App:</strong> Speaker's Gym &nbsp;·&nbsp; <strong>Developer:</strong> Marouane Al Mandri</p>

        <p className="da-intro">
          You can request deletion of your <strong>Speaker's Gym</strong> account and its associated
          data at any time. This page explains how to make the request and what happens to your data.
        </p>

        <div className="da-section">
          <h2>How to Request Deletion</h2>
          <ol className="da-steps">
            <li>Email us at <strong>{DELETE_EMAIL}</strong> from the email address linked to your Speaker's Gym account.</li>
            <li>Use the subject line <strong>"Delete My Account"</strong>.</li>
            <li>Send the email. We will confirm and process your request.</li>
          </ol>

          <div className="da-callout">
            <div className="da-callout-label">Send your request to</div>
            <a className="da-email" href={`mailto:${DELETE_EMAIL}?subject=Delete%20My%20Account`}>{DELETE_EMAIL}</a>
            <span className="da-subject">Subject: <code>Delete My Account</code></span>
          </div>
        </div>

        <div className="da-section">
          <h2>What Gets Deleted</h2>
          <p>When we process your request, we permanently delete the data associated with your account, including:</p>
          <ul className="da-list">
            <li>Your account and sign-in information</li>
            <li>Transcripts from your speaking practice</li>
            <li>Speaking practice metrics and progress</li>
            <li>AI feedback generated for you</li>
            <li>Usage and activity data tied to your account</li>
          </ul>
        </div>

        <div className="da-section">
          <h2>Data We May Retain</h2>
          <p>
            We may retain a limited amount of information only where required to comply with legal,
            tax, or accounting obligations (for example, basic records of a purchase). Any such data
            is kept only for as long as the law requires and is then deleted.
          </p>
        </div>

        <div className="da-section">
          <h2>How Long It Takes</h2>
          <p>
            We will delete your account and associated data <strong>within 14 days</strong> of receiving
            your request. If you have any questions, contact us at <strong>{DELETE_EMAIL}</strong>.
          </p>
        </div>
      </main>
    </>
  );
}
