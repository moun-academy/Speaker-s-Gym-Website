import { useEffect } from "react";
import "./KhadijaPortal.css";

export default function NadiraPortal() {
  useEffect(() => {
    const previousTitle = document.title;
    const existingRobots = document.querySelector('meta[name="robots"]');
    const previousRobots = existingRobots?.getAttribute("content") ?? null;
    const robots = existingRobots || document.createElement("meta");

    if (!existingRobots) {
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }

    document.title = "Nadira's Speaking Journey | Speaker's Gym";
    robots.setAttribute("content", "noindex, nofollow, noarchive, nosnippet");

    return () => {
      document.title = previousTitle;
      if (!existingRobots) robots.remove();
      else if (previousRobots === null) robots.removeAttribute("content");
      else robots.setAttribute("content", previousRobots);
    };
  }, []);

  return (
    <main className="khadija-portal-shell">
      <iframe
        className="khadija-portal-frame"
        src="https://nadira-speaking-journey.vercel.app/"
        title="Nadira's private Speaker's Gym coaching portal"
      />
    </main>
  );
}
