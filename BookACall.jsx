import { useEffect, useRef, useState } from "react";
import brandLogo from "./Logo.png";
const CALENDLY_SLUG = "https://calendly.com/marouane-speakers-gym/30min";
const CALENDLY_URL =
  `${CALENDLY_SLUG}` +
  "?hide_gdpr_banner=1" +
  "&primary_color=c2a14a";

export default function BookACall() {
  const widgetRef = useRef(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    document.title = "Book a Free Strategy Call - The Speaker's Gym";

    const initWidget = () => {
      const element = widgetRef.current;
      if (!window.Calendly || !element) return;
      if (element.dataset.calInit === "1" || element.querySelector("iframe")) {
        setStatus("ready");
        return;
      }

      element.dataset.calInit = "1";
      element.innerHTML = "";
      window.Calendly.initInlineWidget({
        url: CALENDLY_URL,
        parentElement: element,
      });
      setStatus("ready");
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
        script.addEventListener("error", () => setStatus("error"), { once: true });
        document.body.appendChild(script);
      }
      if (script.dataset.calListener !== "1") {
        script.dataset.calListener = "1";
        script.addEventListener("load", initWidget);
      }
    }

    const timeoutId = window.setTimeout(() => {
      if (!widgetRef.current?.querySelector("iframe")) setStatus("error");
    }, 9000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:wght@400;500;600;700&display=swap');

        :root {
          --bg: #111111;
          --surface-strong: rgba(16, 16, 16, 0.9);
          --border: rgba(217, 192, 111, 0.2);
          --text: #e0ddd4;
          --text-dim: #9a9790;
          --accent: #d9c06f;
          --font-display: 'Playfair Display', Georgia, serif;
          --font-body: 'DM Sans', sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: var(--bg); }
        body { font-family: var(--font-body); color: var(--text); -webkit-font-smoothing: antialiased; }

        .book-page {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
          background:
            radial-gradient(circle at 22% 18%, rgba(217, 192, 111, 0.12), transparent 28%),
            linear-gradient(135deg, #080808 0%, #111111 48%, #17130d 100%);
        }

        .book-page::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(8,8,8,.98) 0%, rgba(8,8,8,.86) 34%, rgba(8,8,8,.6) 58%, rgba(8,8,8,.86) 100%),
            linear-gradient(0deg, rgba(8,8,8,.96) 0%, rgba(8,8,8,.18) 50%, rgba(8,8,8,.76) 100%);
          z-index: 1;
        }

        .book-page::after {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          background-size: 210px;
          pointer-events: none;
          z-index: 2;
        }

        .book-nav {
          position: relative;
          z-index: 3;
          width: 100%;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          gap: 18px;
          padding: 24px clamp(20px, 5vw, 56px);
        }

        .book-logo {
          position: absolute;
          left: 50%;
          width: 78px;
          height: 78px;
          display: block;
          transform: translateX(-50%);
          text-decoration: none;
        }
        .book-logo img { width: 100%; height: 100%; display: block; object-fit: contain; filter: drop-shadow(0 6px 16px rgba(0,0,0,.32)); }

        .book-back {
          color: var(--text-dim);
          font-size: .88rem;
          font-weight: 600;
          text-decoration: none;
          border: 1px solid rgba(224,221,212,.18);
          border-radius: 999px;
          padding: 9px 16px;
          background: rgba(10,10,10,.32);
          backdrop-filter: blur(10px);
          transition: border-color .2s, color .2s;
        }
        .book-back:hover { color: var(--accent); border-color: rgba(217,192,111,.42); }

        .book-shell {
          position: relative;
          z-index: 3;
          min-height: calc(100vh - 86px);
          display: grid;
          grid-template-columns: minmax(0, 0.86fr) minmax(380px, 1.14fr);
          align-items: center;
          gap: clamp(28px, 4vw, 64px);
          padding: 20px clamp(20px, 5vw, 72px) 56px;
        }

        .book-content { width: min(100%, 660px); }

        .book-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--accent);
          font-size: .74rem;
          font-weight: 700;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 22px;
        }
        .book-eyebrow::before {
          content: "";
          width: 34px;
          height: 1px;
          background: var(--accent);
          opacity: .72;
        }

        .book-title {
          font-family: var(--font-display);
          font-size: clamp(3rem, 5vw, 6rem);
          font-style: italic;
          font-weight: 600;
          line-height: .98;
          letter-spacing: 0;
          color: #f6efdf;
          max-width: 760px;
          margin-bottom: 24px;
        }
        .book-title span { display: block; white-space: nowrap; }

        .book-copy {
          color: #bbb5a6;
          font-size: clamp(1rem, 2vw, 1.18rem);
          line-height: 1.72;
          max-width: 560px;
          margin-bottom: 30px;
        }

        .book-meta {
          display: grid;
          gap: 12px;
          margin-bottom: 34px;
          color: #c8c0ad;
          font-size: .96rem;
          line-height: 1.55;
        }
        .book-meta span {
          display: grid;
          grid-template-columns: 7px minmax(0, 1fr);
          align-items: start;
          gap: 11px;
        }
        .book-meta span::before {
          content: "";
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 0 6px rgba(217, 192, 111, 0.12);
          margin-top: .48em;
        }

        .book-proof {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          width: min(100%, 660px);
          border-top: 1px solid rgba(217,192,111,.16);
          padding-top: 24px;
        }
        .book-proof-item strong {
          display: block;
          font-family: var(--font-display);
          font-size: 1.7rem;
          font-style: italic;
          color: var(--accent);
          line-height: 1;
          margin-bottom: 8px;
        }
        .book-proof-item span {
          display: block;
          color: #8d8677;
          font-size: .82rem;
          line-height: 1.45;
        }

        .calendar-panel {
          position: relative;
          width: min(100%, 900px);
          justify-self: end;
          padding: 14px;
          border: 1px solid rgba(217, 192, 111, 0.28);
          border-radius: 18px;
          background:
            linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.02)),
            var(--surface-strong);
          box-shadow: 0 28px 80px rgba(0, 0, 0, .45);
          backdrop-filter: blur(18px);
        }

        .calendar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 8px 8px 14px;
        }
        .calendar-header h2 {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 3vw, 2.35rem);
          font-style: italic;
          font-weight: 600;
          line-height: 1.08;
          color: #f6efdf;
        }
        .calendar-status {
          color: var(--text-dim);
          font-size: .84rem;
          line-height: 1.45;
          text-align: right;
          max-width: 230px;
        }

        .calendar-frame {
          position: relative;
          min-width: 320px;
          min-height: 710px;
          overflow: hidden;
          border-radius: 12px;
          background: #ffffff;
        }
        .calendly-inline-widget {
          width: 100%;
          min-width: 320px;
          height: 710px;
        }

        .calendar-loading,
        .calendar-fallback {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 28px;
          background: #ffffff;
          color: #1d1d1d;
          text-align: center;
          font-weight: 700;
          line-height: 1.45;
          z-index: 2;
        }
        .calendar-fallback {
          gap: 14px;
          align-content: center;
        }
        .calendar-fallback a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          border-radius: 8px;
          background: #111111;
          color: #ffffff;
          padding: 13px 20px;
          text-decoration: none;
        }

        @media (max-width: 860px) {
          .book-page::before {
            background:
              linear-gradient(0deg, rgba(10,10,10,.98) 0%, rgba(10,10,10,.82) 48%, rgba(10,10,10,.38) 100%),
              linear-gradient(90deg, rgba(10,10,10,.84) 0%, rgba(10,10,10,.38) 100%);
          }
          .book-shell {
            grid-template-columns: 1fr;
            align-items: start;
            padding-top: 70px;
          }
          .book-title { font-size: clamp(3rem, 14vw, 5.25rem); }
          .book-copy { max-width: 620px; }
          .book-proof {
            grid-template-columns: 1fr;
            gap: 18px;
            width: min(100%, 420px);
          }
          .book-proof-item {
            display: grid;
            grid-template-columns: 76px 1fr;
            align-items: center;
            gap: 14px;
          }
          .book-proof-item strong { margin-bottom: 0; }
          .calendar-panel { justify-self: stretch; }
        }

        @media (max-width: 520px) {
          .book-nav { padding: 20px; align-items: flex-start; }
          .book-logo { width: 68px; height: 68px; }
          .book-back { font-size: .8rem; padding: 8px 12px; }
          .book-shell { padding: 20px 16px 34px; gap: 22px; }
          .book-eyebrow { margin-bottom: 12px; }
          .book-title {
            font-size: clamp(2.25rem, 11vw, 2.85rem);
            margin-bottom: 14px;
            max-width: 100%;
          }
          .book-copy { line-height: 1.55; margin-bottom: 18px; }
          .book-meta { gap: 10px; font-size: .92rem; }
          .book-meta { margin-bottom: 0; }
          .book-proof { display: none; }
          .calendar-panel { padding: 8px; border-radius: 14px; }
          .calendar-header { display: block; padding: 8px 8px 12px; }
          .calendar-status { margin-top: 8px; text-align: left; max-width: none; }
          .calendar-frame { min-height: 660px; }
          .calendly-inline-widget { height: 660px; }
        }
      `}</style>

      <main className="book-page">
        <nav className="book-nav" aria-label="Book a call navigation">
          <a href="/" className="book-logo" aria-label="The Speaker's Gym home">
            <img src={brandLogo} alt="The Speaker's Gym" />
          </a>
          <a href="/" className="book-back">Back to site</a>
        </nav>

        <section className="book-shell" aria-labelledby="book-call-title">
          <div className="book-content">
            <p className="book-eyebrow">Book a Call</p>
            <h1 className="book-title" id="book-call-title">
              <span>Your Voice</span>
              <span>Deserves a Plan.</span>
            </h1>
            <p className="book-copy">
              Pick a time for a free 30-minute strategy call. We will look at where your speaking confidence is getting blocked and what to train first.
            </p>
            <div className="book-meta" aria-label="Call details">
              <span>Free 30-minute strategy session</span>
              <span>Clear next steps for your speaking confidence</span>
              <span>No pressure, just a useful plan</span>
            </div>

            <div className="book-proof" aria-label="Program proof">
              <div className="book-proof-item">
                <strong>200+</strong>
                <span>professionals trained</span>
              </div>
              <div className="book-proof-item">
                <strong>6 wks</strong>
                <span>to visible speaking progress</span>
              </div>
              <div className="book-proof-item">
                <strong>4.9</strong>
                <span>average student rating</span>
              </div>
            </div>
          </div>

          <aside className="calendar-panel" aria-label="Schedule your call">
            <div className="calendar-header">
              <h2>Choose your time</h2>
              <p className="calendar-status" aria-live="polite">
                {status === "loading" && "Loading available times..."}
                {status === "ready" && "Times are shown in your local timezone."}
                {status === "error" && "Calendar could not load here."}
              </p>
            </div>
            <div className="calendar-frame">
              {status === "loading" && <div className="calendar-loading">Loading available times...</div>}
              {status === "error" && (
                <div className="calendar-fallback">
                  <p>The calendar did not load in this browser.</p>
                  <a href={CALENDLY_SLUG} target="_blank" rel="noopener noreferrer">Open Calendly</a>
                </div>
              )}
              <div ref={widgetRef} className="calendly-inline-widget" data-url={CALENDLY_URL} />
            </div>
          </aside>
        </section>
      </main>
    </>
  );
}
