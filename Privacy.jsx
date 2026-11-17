import { useEffect } from "react";

/* ─── /privacy — privacy policy for the website and the Speaker's Gym app (Google Play compliant) ─── */
export default function Privacy() {
  useEffect(() => {
    document.title = "Privacy Policy | The Speaker's Gym";
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
        <p className="pp-updated">Last updated: November 2026</p>

        <p className="pp-intro">
          This Privacy Policy explains how <strong>The Speaker's Gym</strong> by Marouane Al Mandri
          ("we", "us") collects, uses, and protects your information when you visit our website
          (speakers-gym.com), book or join our programs, or use the <strong>Speaker's Gym</strong> app.
          By using them, you agree to the practices described below.
        </p>

        <div className="pp-section">
          <h2>Information We Collect</h2>
          <p>Depending on how you use our website, programs and app, we may collect:</p>
          <ul>
            <li><strong>Contact details you give us</strong> — your name, email address and phone number when you book a call, join a session, sign up to a waiting list, buy a program or message us.</li>
            <li><strong>Booking information</strong> — the time you choose and your answers to our booking questions.</li>
            <li><strong>Payment information</strong> — payments are handled by Stripe. We receive confirmation of your purchase and your contact details, but <strong>we never see or store your card number</strong>.</li>
            <li><strong>Account sign-in information</strong> — such as your name and email address used to create and access your app account.</li>
            <li><strong>App practice data</strong> — transcripts from your speaking practice, speaking metrics such as pace, clarity and progress, and the AI feedback generated for you.</li>
            <li><strong>Usage and device data</strong> — pages you visit, the features you use, your in-app progress, and basic technical information such as browser, device and approximate location.</li>
            <li><strong>Messages</strong> — anything you send us by email, WhatsApp or in our community.</li>
          </ul>
        </div>

        <div className="pp-section">
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Book, confirm and run your calls, sessions and programs.</li>
            <li>Process payments and give you access to what you bought.</li>
            <li>Let you log in and securely access your app account.</li>
            <li>Save your progress and speaking practice over time, and generate AI-based feedback.</li>
            <li>Contact you about your booking, program or questions, and follow up with you on WhatsApp, by email or in our community.</li>
            <li>Send you updates and offers by email. You can unsubscribe at any time.</li>
            <li>Measure how our website and advertising perform, and improve them.</li>
            <li>Keep our website and app secure and working properly.</li>
          </ul>
          <p>We do not sell your personal information.</p>
        </div>

        <div className="pp-section">
          <h2>Cookies, Analytics &amp; Advertising</h2>
          <p>
            Our website uses cookies and similar technologies to understand how visitors use it and
            to measure our advertising. These include <strong>Google Tag Manager</strong>,{" "}
            <strong>Google Analytics</strong>, <strong>Google Ads</strong> and the{" "}
            <strong>Meta (Facebook) Pixel</strong>. With your consent, we may share limited,
            hashed contact details with Meta to measure bookings. You can block or delete cookies in
            your browser settings, and opt out of personalized ads through your Google and Meta ad
            settings.
          </p>
        </div>

        <div className="pp-section">
          <h2>Third-Party Services</h2>
          <p>
            We rely on trusted third-party services to operate. These providers may process certain
            data on our behalf, subject to their own privacy policies:
          </p>
          <ul>
            <li><strong>Vercel</strong> — website hosting and infrastructure.</li>
            <li><strong>Stripe</strong> — secure payment processing.</li>
            <li><strong>Calendly</strong> — booking calls and sessions.</li>
            <li><strong>Klaviyo, Zoho Mail and Make</strong> — email, follow-up messages and automations.</li>
            <li><strong>WhatsApp</strong> and <strong>Skool</strong> — messaging and our private student community.</li>
            <li><strong>YouTube</strong> — student testimonial videos on our pages. The video player loads only when you press play.</li>
            <li><strong>Google Analytics, Google Ads and Meta</strong> — analytics and advertising measurement, as described above.</li>
            <li><strong>Firebase</strong> (Google) — authentication, data storage and app infrastructure.</li>
            <li><strong>Google Sign-In</strong> and <strong>Google Play Services</strong> — app login and core Android functionality.</li>
            <li><strong>OpenAI / AI processing service</strong> — used to generate AI speaking feedback and transcripts, where applicable.</li>
          </ul>
        </div>

        <div className="pp-section">
          <h2>Data Retention &amp; Your Rights</h2>
          <p>
            We keep your information only as long as needed to provide our programs and app, meet
            legal and accounting obligations, and run our business. Depending on where you live
            (including the European Union and the Czech Republic), you may have the right to{" "}
            <strong>access</strong>, <strong>correct</strong> or <strong>delete</strong> your data,
            to object to or restrict how we use it, to withdraw your consent, and to receive a copy
            of your data. To use any of these rights, email us at the address below. We will respond
            to valid requests within a reasonable timeframe. You can also request deletion of your
            app account on our{" "}
            <a href="/delete-account">account deletion page</a>. You may also complain to your local
            data protection authority.
          </p>
        </div>

        <div className="pp-section">
          <h2>International Transfers</h2>
          <p>
            Some of our providers are based outside your country, including in the United States.
            When your data is transferred, we rely on the safeguards these providers offer to
            protect it.
          </p>
        </div>

        <div className="pp-section">
          <h2>Children's Privacy</h2>
          <p>
            Our website, programs and app are <strong>not directed to children under 13</strong>. We
            do not knowingly collect personal information from children under 13. If you believe a
            child has provided us with personal information, please contact us and we will delete it.
          </p>
        </div>

        <div className="pp-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the
            "Last updated" date at the top of this page. Continued use of our website or app after
            changes means you accept the updated policy.
          </p>
        </div>

        <div className="pp-divider" />

        <div className="pp-section">
          <h2>Contact Us</h2>
          <p>If you have any questions about this Privacy Policy or your data, contact us:</p>
          <p className="pp-meta">
            <strong>Business:</strong> The Speaker's Gym<br />
            <strong>Owner:</strong> Marouane Al Mandri<br />
            <strong>Email:</strong> <a href="mailto:marouane@speakers-gym.com">marouane@speakers-gym.com</a><br />
            <strong>Website:</strong> <a href="https://www.speakers-gym.com">www.speakers-gym.com</a>
          </p>
        </div>
      </main>
    </>
  );
}
