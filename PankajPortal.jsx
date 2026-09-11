import { useEffect } from "react";
import "./PankajPortal.css";

export default function PankajPortal() {
  useEffect(() => {
    const previousTitle = document.title;
    const existingRobots = document.querySelector('meta[name="robots"]');
    const previousRobots = existingRobots?.getAttribute("content") ?? null;
    const robots = existingRobots || document.createElement("meta");

    if (!existingRobots) {
      robots.setAttribute("name", "robots");
      document.head.appendChild(robots);
    }

    document.title = "Pankaj's Speaking Journey | Speaker's Gym";
    robots.setAttribute("content", "noindex, nofollow, noarchive, nosnippet");

    return () => {
      document.title = previousTitle;
      if (!existingRobots) robots.remove();
      else if (previousRobots === null) robots.removeAttribute("content");
      else robots.setAttribute("content", previousRobots);
    };
  }, []);

  return (
    <main className="pankaj-portal-shell">
      <iframe
        className="pankaj-portal-frame"
        src="/pankaj-portal/index.html"
        title="Pankaj's private Speaker's Gym coaching portal"
      />
    </main>
  );
}
