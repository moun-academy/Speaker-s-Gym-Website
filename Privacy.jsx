import { useEffect } from "react";

/* ─── /privacy — Google Play compliant privacy policy ─── */
export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy — Speaker's Gym";
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

        .pp-wrap { max-width:780px; margin:0 auto; padding: 72px 24px 96px; }
        .pp-back { display:inline-block; color:var(--text-dim); text-decoration:none; font-size:.85rem; margin-bottom:32px; transition:color .2s; }
        .pp-back:hover { color:var(--accent); }
        .pp-title { font-family:var(--font-display); font-style:italic; font-weight:600; font-size:clamp(2.2rem,6vw,3rem); color:var(--accent); margin-bottom:10px; }
        .pp-updated { color:var(--text-dim); font-size:.85rem; margin-bottom:40px; }
        .pp-intro { color:var(--text-dim); line-height:1.75; font-size:1.02rem; margin-bottom:40px; }
        .pp-section { margin-bottom:36px; }
        .pp-section h2 { font-family:var(--font-display); font-style:italic; font-weight:600; font-size:1.4rem; color:#f2ecdf; margin-bottom:14px; }
        .pp-section p { color:var(--text-dim); line-height:1.75; font-size:.98rem; margin-bottom:12px; }
        .pp-section ul { list-style:none; margin:8px 0 12px; }
        .pp-section li { position:relative; padding:6px 0 6px 22px; color:var(--text-dim); line-height:1.6; font-size:.98rem; }
        .pp-section li::before { content:'→'; position:absolute; left:0; color:var(--accent); }
        .pp-section a { color:var(--accent); text-decoration:none; border-bottom:1px solid var(--border); }
        .pp-section a:hover { border-color:var(--accent); }
        .pp-section strong { color:#c8bc9a; font-weight:600; }
        .pp-divider { height:1px; background:var(--border); margin:44px 0; }
        .pp-meta { color:var(--text-dim); font-size:.92rem; line-height:1.9; }
        .pp-meta strong { color:#c8bc9a; font-weight:600; }
      `}</style>

      <main className="pp-wrap">
        <a href="/" className="pp-back">← Back to Home</a>
        <h1 className="pp-title">Privacy Policy</h1>
        <p className="pp-updated">Last updated: June 2026</p>

        <p className="pp-intro">
          This Privacy Policy explains how <strong>Speaker's Gym</strong> ("the app", "we", "us")
          collects, uses, and protects your information when you use our mobile application and
          related services. By using Speaker's Gym, you agree to the practices described below.
        </p>

        <div className="pp-section">
          <h2>Information We Collect</h2>
          <p>To provide the app's features, we may collect the following:</p>
          <ul>
            <li><strong>Account sign-in information</strong> — such as your name and email address used to create and access your account.</li>
            <li><strong>Transcripts</strong> — text generated from your speaking practice.</li>
            <li><strong>Speaking practice metrics</strong> — such as pace, clarity, and progress over time.</li>
            <li><strong>AI feedback</strong> — feedback generated about your speaking practice.</li>
            <li><strong>Usage and activity data</strong> — information needed for the app to function, such as which features you use and your in-app progress.</li>
          </ul>
        </div>

        <div className="pp-section">
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Let you log in and securely access your account.</li>
            <li>Save your progress and speaking practice over time.</li>
            <li>Show you analytics and performance metrics.</li>
            <li>Generate AI-based feedback on your speaking.</li>
            <li>Maintain, support, and improve the overall app experience.</li>
          </ul>
          <p>We do not sell your personal information.</p>
        </div>

        <div className="pp-section">
          <h2>Third-Party Services</h2>
          <p>
            Speaker's Gym relies on trusted third-party services to operate. These providers may
            process certain data on our behalf, subject to their own privacy policies:
          </p>
          <ul>
            <li><strong>Firebase</strong> (Google) — authentication, data storage, and app infrastructure.</li>
            <li><strong>Google Sign-In</strong> — secure account login.</li>
            <li><strong>Google Play Services</strong> — core functionality on Android devices.</li>
            <li><strong>OpenAI / AI processing service</strong> — used to generate AI speaking feedback and transcripts, where applicable.</li>
          </ul>
        </div>

        <div className="pp-section">
          <h2>Data Retention &amp; Your Rights</h2>
          <p>
            We keep your information only as long as needed to provide the app's features. You may
            request access to or <strong>deletion of your data</strong> at any time by emailing us at the
            address below. We will respond and act on valid requests within a reasonable timeframe.
          </p>
        </div>

        <div className="pp-section">
          <h2>Children's Privacy</h2>
          <p>
            Speaker's Gym is <strong>not directed to children under 13</strong>. We do not knowingly
            collect personal information from children under 13. If you believe a child has provided us
            with personal information, please contact us and we will delete it.
          </p>
        </div>

        <div className="pp-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the
            "Last updated" date at the top of this page. Continued use of the app after changes
            means you accept the updated policy.
          </p>
        </div>

        <div className="pp-divider" />

        <div className="pp-section">
          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or your data, contact us:</p>
          <p className="pp-meta">
            <strong>App:</strong> Speaker's Gym<br />
            <strong>Developer:</strong> Marouane Al Mandri<br />
            <strong>Email:</strong> <a href="mailto:speakersgym@marouanealmandri.com">speakersgym@marouanealmandri.com</a>
          </p>
        </div>
      </main>
    </>
  );
}
