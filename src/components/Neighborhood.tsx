import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { houses, HouseDef } from "../data/houses";
import { Art } from "./Art";
import { DunphyStop } from "./DunphyStop";
import { PritchettStop } from "./PritchettStop";
import { TuckerPritchettStop } from "./TuckerPritchettStop";

const PLATE_TITLE: Record<string, string> = {
  dunphy: "The Dunphy’s",
  pritchett: "The Pritchett’s",
  "tucker-pritchett": "The Tucker-Pritchett’s",
};

let introSeen = false; // show the swipe overlay once per visit, not every time you come back from a room

export function Neighborhood({
  initial = 0,
  onPick,
  onBack,
}: {
  initial?: number; // house to land on (the one just visited)
  onPick: (house: HouseDef) => void;
  onBack: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const sky = useRef<HTMLImageElement>(null);
  const [active, setActive] = useState(initial);
  const [hint, setHint] = useState(!introSeen); // dark swipe overlay, fades after 2s or on tap

  // Coming back from a room: start on that house, no scroll animation.
  useLayoutEffect(() => {
    const s = scroller.current;
    if (s && initial > 0) s.scrollLeft = initial * s.clientWidth;
  }, []);

  useEffect(() => {
    introSeen = true;
    const t = window.setTimeout(() => setHint(false), 2000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const s = scroller.current;
    const r = root.current;
    if (!s || !r) return;
    // One shared sky: slides slower than the houses (parallax), so it reads as far away.
    const SKY_DRIFT = 48; // extra px reserved for the slow idle drift
    const moveSky = () => {
      const img = sky.current;
      if (!img) return;
      const max = s.scrollWidth - s.clientWidth;
      const t = max > 0 ? s.scrollLeft / max : 0;
      const travel = Math.max(img.offsetWidth - s.clientWidth - SKY_DRIFT, 0);
      img.style.transform = `translate3d(${-t * travel}px,0,0)`;
    };
    const onScroll = () => {
      moveSky();
      r.style.setProperty("--sx", String(s.scrollLeft));
      r.style.setProperty("--sp", (s.scrollLeft / (s.clientWidth || 1)).toFixed(4));
      setActive(Math.round(s.scrollLeft / (s.clientWidth || 1)));
    };
    // the fixed plate drives the dots and the art stage, whatever its height
    const plate = r.querySelector<HTMLElement>(".dplate");
    const fit = () => plate && r.style.setProperty("--plate-h", `${plate.offsetHeight}px`);
    fit();
    const ro = new ResizeObserver(fit);
    if (plate) ro.observe(plate);
    onScroll();
    const img = sky.current;
    img?.addEventListener("load", onScroll);
    window.addEventListener("resize", onScroll);
    s.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      img?.removeEventListener("load", onScroll);
      window.removeEventListener("resize", onScroll);
      s.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  // Touch: the street never pans under the finger (drag = tilt only, see useTilt).
  // A quick flick is the only way to move to the next / previous house.
  useEffect(() => {
    const s = scroller.current;
    if (!s) return;
    let start: { x: number; y: number; t: number } | null = null;
    const down = (e: TouchEvent) => {
      const t = e.touches[0];
      start = t ? { x: t.clientX, y: t.clientY, t: performance.now() } : null;
    };
    const up = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!start || !t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      const dt = Math.max(performance.now() - start.t, 1);
      start = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.5 || Math.abs(dx) / dt < 0.5) return;
      const w = s.clientWidth || 1;
      const next = Math.max(0, Math.min(houses.length - 1, Math.round(s.scrollLeft / w) + (dx < 0 ? 1 : -1)));
      s.scrollTo({ left: next * w, behavior: "smooth" });
    };
    s.addEventListener("touchstart", down, { passive: true });
    s.addEventListener("touchend", up, { passive: true });
    return () => {
      s.removeEventListener("touchstart", down);
      s.removeEventListener("touchend", up);
    };
  }, []);

  const current = houses[Math.min(active, houses.length - 1)];

  return (
    <div className="screen street" ref={root}>
      <header className="topbar">
        <button className="icon-btn" onClick={onBack} aria-label="Back to title">
          <img src="/assets/dunphy/street/back.svg" alt="" />
        </button>
        <img className="topbar-logo" src="/assets/dunphy/street/logo.svg" alt="Modern Family" />
        <span className="icon-btn-spacer" aria-hidden />
      </header>

      <div className="street-sky" aria-hidden>
        <div className="street-sky-drift">
          <img ref={sky} src="/assets/shared/street/sky.webp" alt="" draggable={false} />
        </div>
      </div>

      <div className="street-scroll" ref={scroller}>
        {houses.map((h, i) =>
          h.id === "dunphy" ? (
            <DunphyStop key={h.id} index={i} />
          ) : h.id === "pritchett" ? (
            <PritchettStop key={h.id} index={i} />
          ) : h.id === "tucker-pritchett" ? (
            <TuckerPritchettStop key={h.id} index={i} />
          ) : (
          <section key={h.id} className="street-stop">
            <button className="house-btn" onClick={() => onPick(h)} aria-label={`Enter ${h.name}`}>
              <Art
                src={h.exterior.src}
                label={`${h.id}/exterior.webp · ${h.exterior.desc.split(".")[0]}`}
                tint={h.accent}
                fit="contain"
                className="house-art"
                style={{ width: "100%", height: "100%" }}
              />
            </button>
            <div className="plate">
              <h2>{h.name}</h2>
              <p>{h.family}</p>
              <p className="blurb">{h.blurb}</p>
              <button className="cta" style={{ background: h.accent }} onClick={() => onPick(h)}>
                Go inside
              </button>
            </div>
          </section>
          ),
        )}
      </div>

      <div className="dplate">
        <h2 key={current.id}>{PLATE_TITLE[current.id] ?? current.name}</h2>
        <button className="dknock" onClick={() => onPick(current)}>
          Knock on door
        </button>
      </div>

      <div className="street-dots" role="tablist" aria-label="Houses">
        {houses.map((h, i) => (
          <button
            key={h.id}
            role="tab"
            aria-selected={i === active}
            aria-label={h.name}
            className={i === active ? "on" : ""}
            onClick={() => scroller.current?.scrollTo({ left: i * (scroller.current.clientWidth || 1), behavior: "smooth" })}
          />
        ))}
      </div>

      <div className={`swipe-intro${hint ? " on" : ""}`} aria-hidden={!hint} onPointerDown={() => setHint(false)}>
        <svg className="swipe-hand" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8" />
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
        </svg>
        <span>Swipe to explore the street</span>
      </div>
    </div>
  );
}
