import { useEffect } from 'react';
import './AshwinPortal.css';

export default function AshwinPortal() {
  useEffect(() => {
    const previousTitle = document.title;
    const existing = document.querySelector('meta[name="robots"]');
    const previous = existing?.getAttribute('content');
    const robots = existing || document.createElement('meta');
    if (!existing) { robots.name = 'robots'; document.head.appendChild(robots); }
    document.title = "Ashwin's Journey | The Speaker's Gym";
    robots.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet');
    return () => {
      document.title = previousTitle;
      if (!existing) robots.remove();
      else if (previous == null) robots.removeAttribute('content');
      else robots.setAttribute('content', previous);
    };
  }, []);
  return <main className="ashwin-portal-shell"><iframe className="ashwin-portal-frame" src="/ashwin-portal/index.html" title="Ashwin's personal Speaker's Gym coaching space" /></main>;
}
