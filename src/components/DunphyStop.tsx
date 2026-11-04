import { useEffect, useRef, useState } from "react";
import { useTilt } from "../lib/useTilt";
import { onTiltTravel } from "../lib/tiltTravel";

const A = "/assets/dunphy/street";

// Only the trees get depth parallax. Sky, house and the two characters are flat.
// Perspective shrink for z = -150 at 900px is undone with --s so the trees keep their size.
const TREES_Z = -150;
const TREES_S = (900 - TREES_Z) / 900;

const SHOT_MS = 760; // when the bullet lands on Luke
const HURT_MS = 1100; // how long he stays hurt

export function DunphyStop({ index }: { index: number }) {
  const scene = useRef<HTMLDivElement>(null);
  useTilt(scene);



  // Phil fires toward Luke while the pointer moves over the scene (or on tap).
  const [shots, setShots] = useState<number[]>([]);
  const last = useRef(0);
  const n = useRef(0);
  const [hurt, setHurt] = useState(false);
  const hurtTimers = useRef<number[]>([]);
  useEffect(() => {
    new Image().src = `${A}/luke-hurt.webp`; // preload so the swap never flashes
    return () => hurtTimers.current.forEach(clearTimeout);
  }, []);
  const fireRef = useRef<() => void>(() => {});
  useEffect(() => onTiltTravel(18, () => fireRef.current()), []); // tilting the phone fires too
  const fire = () => {
    const now = performance.now();
    if (now - last.current < 700) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    last.current = now;
    const id = ++n.current;
    setShots((s) => [...s, id]);
    window.setTimeout(() => setShots((s) => s.filter((x) => x !== id)), 1000);
    hurtTimers.current.forEach(clearTimeout);
    hurtTimers.current = [
      window.setTimeout(() => setHurt(true), SHOT_MS),
      window.setTimeout(() => setHurt(false), SHOT_MS + HURT_MS),
    ];
  };

  fireRef.current = fire;

  return (
    <section
      className="street-stop dunphy-stop"
      style={{ ["--i" as any]: index }}
      onPointerMove={fire}
    >
      <div className="dscene" ref={scene}>
        <div className="dstage">
          <div className="dworld">
            <div className="dl" style={{ ["--z" as any]: `${TREES_Z}px`, ["--s" as any]: TREES_S }}>
              <img className="dtrees" src={`${A}/street-trees.webp`} alt="" draggable={false} />
            </div>
          </div>

          <div className="dhouse">
            <img
              className="dhouse-img"
              src={`${A}/house.webp`}
              alt=""
              draggable={false}
            />
            <img className="dchar dphil bob-a" src={`${A}/phil.webp`} alt="" draggable={false} />
            <img
              className={`dchar dluke bob-b${hurt ? " hurt" : ""}`}
              src={hurt ? `${A}/luke-hurt.webp` : `${A}/luke.webp`}
              alt=""
              draggable={false}
            />
            {shots.map((id) => (
              <span key={id} className="dbullet" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
