import { useEffect, useRef, useState } from "react";

// Stage is authored at the Figma frame size (390x844) and scaled to cover the screen.
const STAGE_W = 390;
const STAGE_H = 844;

// ms at which each phase begins (phase n = timeline[n - 1]).
//  (empty frames are visible from load) 1 family photo in · 2 zoom into centre frame
//  3 wash to white · 4 logo reveal · 5 "house tour" slides in + Start button
const TIMELINE = [600, 1700, 3200, 3800, 4500];
const LAST = TIMELINE.length;

export function Splash({ onEnter }: { onEnter: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const fit = () =>
      setScale(Math.max(el.clientWidth / STAGE_W, el.clientHeight / STAGE_H));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase(LAST);
      return;
    }
    const timers = TIMELINE.map((ms, i) => window.setTimeout(() => setPhase(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, []);

  const cls = Array.from({ length: phase }, (_, i) => `p${i + 1}`).join(" ");

  return (
    <div ref={root} className={`screen splash ${cls}`}>
      <div className="sp-wall" />
      <div className="sp-stage" style={{ transform: `scale(${scale})` }}>
        <div className="sp-zoom">
          <div className="sp-family">
            <img src="/assets/shared/splash/family.webp" alt="" draggable={false} />
          </div>
          <img
            className="sp-frames"
            src="/assets/shared/splash/frames.webp"
            alt=""
            draggable={false}
          />
        </div>
        <img
          className="sp-logo sp-modern"
          src="/assets/shared/splash/logo-modern.svg"
          alt="modern"
          draggable={false}
        />
        <img
          className="sp-logo sp-fam"
          src="/assets/shared/splash/logo-family.svg"
          alt="family"
          draggable={false}
        />
        <img
          className="sp-tour"
          src="/assets/shared/splash/house-tour.svg"
          alt="house tour"
          draggable={false}
        />
      </div>

      <button
        className="sp-start"
        disabled={phase < LAST}
        onClick={onEnter}
      >
        Start
      </button>
    </div>
  );
}
