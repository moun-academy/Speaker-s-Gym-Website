import { useState } from "react";
import "./YouTubeEmbed.css";

/* Shows a light thumbnail first and only loads the YouTube player when it is tapped. */
export default function YouTubeEmbed({ id, title, params = "rel=0&modestbranding=1" }) {
  const [play, setPlay] = useState(false);
  if (play) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?${params}&autoplay=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }
  return (
    <button type="button" className="yt-facade" onClick={() => setPlay(true)} aria-label={`Play video: ${title}`}>
      <img src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" loading="lazy" decoding="async" />
      <span className="yt-play" aria-hidden="true" />
    </button>
  );
}
