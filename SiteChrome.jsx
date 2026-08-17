import { useEffect, useState } from "react";
import { BOOK_URL } from "./siteConfig.js";

const homeLinks = [
  ["Who It's For", "#who"],
  ["How It Works", "#how"],
  ["The Method", "/method"],
  ["About", "#about"],
  ["Pricing", "#pricing"],
  ["Roadmap", "#roadmap"],
  ["Testimonials", "#testimonials"],
  ["FAQ", "#faq"],
];

const methodLinks = [
  ["Why It Works", "#why"],
  ["Two Engines", "#engines"],
  ["Exposure Ladder", "#ladder"],
  ["Find Your Level", "#assessment"],
  ["6-Week Program", "#program"],
];

export function SiteHeader({ page = "home" }) {
  const [open, setOpen] = useState(false);
  const links = page === "method" ? methodLinks : homeLinks;

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <nav className="nav" aria-label="Main navigation">
        <div className="nav-inner">
          <a href={page === "home" ? "#" : "/"} className="nav-logo">THE SPEAKER'S <span>GYM</span></a>
          <div className="nav-links">
            {links.map(([label, href]) => <a href={href} key={href}>{label}</a>)}
            <a href={BOOK_URL} className="nav-cta">Book a Call</a>
          </div>
          <button
            className="nav-hamburger"
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            onClick={() => setOpen(true)}
          >☰</button>
        </div>
      </nav>

      {open && (
        <div className="mobile-menu" id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Navigation menu">
          <button className="mobile-close" type="button" aria-label="Close navigation menu" onClick={() => setOpen(false)}>✕</button>
          {links.map(([label, href]) => <a href={href} key={href} onClick={() => setOpen(false)}>{label}</a>)}
          <a href={BOOK_URL} className="btn-primary" onClick={() => setOpen(false)}>Book a Call</a>
        </div>
      )}
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-logo">THE SPEAKER'S <span>GYM</span></div>
      <p>© {new Date().getFullYear()} The Speaker's Gym · All Rights Reserved</p>
      <p style={{ marginTop: 8 }}><a href="/privacy" style={{ color: "var(--accent)", textDecoration: "none" }}>Privacy Policy</a></p>
    </footer>
  );
}
