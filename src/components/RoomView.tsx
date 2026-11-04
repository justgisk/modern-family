import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { HouseDef } from "../data/houses";
import { Postcard } from "./Postcard";

export function RoomView({
  house,
  roomIdx,
  onRoom,
  onExit,
}: {
  house: HouseDef;
  roomIdx: number;
  onRoom: (i: number) => void;
  onExit: () => void;
}) {
  const room = house.rooms[roomIdx];

  // Preload the other rooms' layers so switching feels instant.
  useEffect(() => {
    house.rooms.forEach((r) =>
      r.layers.forEach((l) => {
        const i = new Image();
        i.src = l.src;
      }),
    );
  }, [house]);

  // Sliding pill behind the active tab.
  const trackRef = useRef<HTMLDivElement>(null);
  const [pill, setPill] = useState<{ x: number; w: number } | null>(null);
  const [animate, setAnimate] = useState(false);
  useLayoutEffect(() => {
    const chip = trackRef.current?.children[roomIdx + 1] as HTMLElement | undefined; // child 0 is the pill
    if (chip) setPill({ x: chip.offsetLeft, w: chip.offsetWidth });
  }, [roomIdx, house]);
  useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true)); // no slide on first paint
    return () => cancelAnimationFrame(id);
  }, []);

  // Swipe left / right anywhere on the screen to move between rooms.
  const screenRef = useRef<HTMLDivElement>(null);
  const idx = useRef(roomIdx);
  idx.current = roomIdx;
  useEffect(() => {
    const el = screenRef.current;
    if (!el) return;
    let start: { x: number; y: number } | null = null;
    const down = (e: TouchEvent) => {
      const t = e.touches[0];
      const inCard = (e.target as Element | null)?.closest(".postcard-stage");
      start = e.touches.length === 1 && t && !inCard ? { x: t.clientX, y: t.clientY } : null;
    };
    const up = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (!start || !t) return;
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      start = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      const next = idx.current + (dx < 0 ? 1 : -1);
      if (next >= 0 && next < house.rooms.length) onRoom(next);
    };
    el.addEventListener("touchstart", down, { passive: true });
    el.addEventListener("touchend", up, { passive: true });
    el.addEventListener("touchcancel", () => (start = null), { passive: true });
    return () => {
      el.removeEventListener("touchstart", down);
      el.removeEventListener("touchend", up);
    };
  }, [house, onRoom]);

  return (
    <div ref={screenRef} className="screen room" style={{ ["--accent" as any]: house.accent }}>
      <header className="topbar">
        <button className="icon-btn" onClick={onExit} aria-label="Back to street">
          <img src="/assets/dunphy/street/back.svg" alt="" />
        </button>
        <span className="room-logo" role="img" aria-label="Modern Family">
          <img className="rl-modern" src="/assets/dunphy/living-room/logo-modern.svg" alt="" />
          <img className="rl-family" src="/assets/dunphy/living-room/logo-family.svg" alt="" />
        </span>
        <span className="icon-btn-spacer" aria-hidden />
      </header>

      <Postcard key={room.id} room={room} />

      <div className="room-meta">
        <p>{house.name.replace(/s$/, "’s")}</p>
        <h2>{room.name}</h2>
      </div>

      <nav className="chips" aria-label="Rooms">
        <div className="chips-track" ref={trackRef}>
          <span
            className={`chip-pill${animate ? " anim" : ""}`}
            style={pill ? ({ "--px": `${pill.x}px`, "--pw": `${pill.w}px` } as any) : { opacity: 0 }}
          />
          {house.rooms.map((r, i) => (
            <button
              key={r.id}
              className={`chip ${i === roomIdx ? "on" : ""}`}
              onClick={() => onRoom(i)}
            >
              {r.name}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
