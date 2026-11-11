import { useEffect } from 'react';
import './NezhouPortal.css';

export default function NezhouPortal() {
  useEffect(() => {
    const previousTitle = document.title;
    const existing = document.querySelector('meta[name="robots"]');
    const previous = existing?.getAttribute('content');
    const robots = existing || document.createElement('meta');
    if (!existing) { robots.name = 'robots'; document.head.appendChild(robots); }
    document.title = "Nezha's Journey | The Speaker's Gym";
    robots.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet');
    return () => {
      document.title = previousTitle;
      if (!existing) robots.remove();
      else if (previous == null) robots.removeAttribute('content');
      else robots.setAttribute('content', previous);
    };
  }, []);
  return <main className="nezhou-portal-shell"><iframe className="nezhou-portal-frame" src="/nezhou-portal/index.html" title="Nezha's personal Speaker's Gym coaching space" /></main>;
}
