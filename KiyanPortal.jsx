import { useEffect } from 'react';
import './KiyanPortal.css';

export default function KiyanPortal() {
  useEffect(() => {
    const previousTitle = document.title;
    const existing = document.querySelector('meta[name="robots"]');
    const previous = existing?.getAttribute('content');
    const robots = existing || document.createElement('meta');
    if (!existing) { robots.name = 'robots'; document.head.appendChild(robots); }
    document.title = "Kiyan's Journey | The Speaker's Gym";
    robots.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet');
    return () => {
      document.title = previousTitle;
      if (!existing) robots.remove();
      else if (previous == null) robots.removeAttribute('content');
      else robots.setAttribute('content', previous);
    };
  }, []);
  return <main className="kiyan-portal-shell"><iframe className="kiyan-portal-frame" src="/kiyan-portal/index.html" title="Kiyan's personal Speaker's Gym coaching space" /></main>;
}
