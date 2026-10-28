import { useEffect, useRef, useState } from "react";

/* Quiet background video for the hero. It is an extra, never a requirement:
   it starts only after the page has loaded, and is skipped for reduced motion,
   Data Saver and slow connections. It pauses when scrolled out of view. */
export default function HeroVideo() {
  const wrap = useRef(null);
  const video = useRef(null);
  const [src, setSrc] = useState(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const conn = navigator.connection;
    const slow = conn && (conn.saveData || /^(slow-2g|2g|3g)$/.test(conn.effectiveType || ""));
    if (reduce || slow) return undefined;

    const small = window.matchMedia("(max-width: 760px)").matches;
    const start = () => setSrc(small ? "/media/hero-bg-mobile.mp4" : "/media/hero-bg.mp4");
    let idle;
    const onLoad = () => {
      idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 3000 }) : window.setTimeout(start, 1500);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
    return () => {
      window.removeEventListener("load", onLoad);
      if (idle != null) (window.cancelIdleCallback || window.clearTimeout)(idle);
    };
  }, []);

  useEffect(() => {
    if (!src || !wrap.current || !("IntersectionObserver" in window)) return undefined;
    const io = new IntersectionObserver(([e]) => {
      const v = video.current;
      if (!v) return;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, [src]);

  const onTime = (e) => {
    const v = e.currentTarget;
    if (v.duration && v.duration - v.currentTime < 0.8) setOn(false);
  };
  const onEnded = (e) => {
    const v = e.currentTarget;
    v.currentTime = 0;
    v.play().catch(() => {});
    setOn(true);
  };

  if (!src) return <div ref={wrap} className="s-hero-video" aria-hidden="true" />;
  return (
    <div ref={wrap} className="s-hero-video" aria-hidden="true">
      <video
        ref={video}
        className={on ? "is-on" : ""}
        src={src}
        muted
        playsInline
        autoPlay
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
        onCanPlay={() => setOn(true)}
        onTimeUpdate={onTime}
        onEnded={onEnded}
      />
    </div>
  );
}
