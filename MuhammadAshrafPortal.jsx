import { useEffect } from 'react';
import './MuhammadAshrafPortal.css';

export default function MuhammadAshrafPortal() {
  useEffect(() => {
    const previousTitle = document.title;
    const existing = document.querySelector('meta[name="robots"]');
    const previous = existing?.getAttribute('content');
    const robots = existing || document.createElement('meta');
    if (!existing) { robots.name = 'robots'; document.head.appendChild(robots); }
    document.title = "Muhammad's Journey | The Speaker's Gym";
    robots.setAttribute('content', 'noindex, nofollow, noarchive, nosnippet');
    return () => {
      document.title = previousTitle;
      if (!existing) robots.remove();
      else if (previous == null) robots.removeAttribute('content');
      else robots.setAttribute('content', previous);
    };
  }, []);
  return <main className="muhammad-portal-shell"><iframe className="muhammad-portal-frame" src="/muhammad-ashraf-portal/index.html" title="Muhammad's personal Speaker's Gym coaching space" /></main>;
}
