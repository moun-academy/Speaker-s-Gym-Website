import { useEffect } from 'react';
import './AhmedPortal.css';

export default function AhmedPortal() {
  useEffect(() => {
    const previousTitle = document.title;
    const existing = document.querySelector('meta[name="robots"]');
    const previous = existing?.getAttribute('content');
    const robots = existing || document.createElement('meta');
    if (!existing) { robots.name = 'robots'; document.head.appendChild(robots); }
    document.title = "Ahmed's Journey | The Speaker's Gym";
    robots.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet');
    return () => {
      document.title = previousTitle;
      if (!existing) robots.remove();
      else if (previous == null) robots.removeAttribute('content');
      else robots.setAttribute('content', previous);
    };
  }, []);
  return <main className="ahmed-portal-shell"><iframe className="ahmed-portal-frame" src="/ahmed-portal/index.html" title="Ahmed's personal Speaker's Gym coaching space" /></main>;
}
