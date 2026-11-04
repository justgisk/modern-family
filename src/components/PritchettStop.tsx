import { useEffect, useRef, useState } from "react";
import { useTilt } from "../lib/useTilt";
import { usePoseSwap } from "../lib/usePoseSwap";

const A = "/assets/pritchett/street";

// Same layering as the Dunphy stop: only the trees get depth parallax.
const TREES_Z = -150;
const TREES_S = (900 - TREES_Z) / 900;

export function PritchettStop({ index }: { index: number }) {
  const scene = useRef<HTMLDivElement>(null);
  useTilt(scene);

  // 0 = pose 1, 1 = pose 2. Flips while the pointer moves / finger drags.
  const pose = usePoseSwap(scene);

  // Pose 1 is the shovel coming down on the mouse: every swap back to it is a hit.
  const [hits, setHits] = useState<number[]>([]);
  const first = useRef(true);
  const hitId = useRef(0);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (pose !== 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = ++hitId.current;
    setHits((h) => [...h, id]);
    const t = window.setTimeout(() => setHits((h) => h.filter((x) => x !== id)), 700);
    return () => window.clearTimeout(t);
  }, [pose]);

  const frames = (name: string, ext: string[]) =>
    [1, 2].map((n, i) => (
      <img
        key={n}
        className={`pframe${pose === i ? " on" : ""}`}
        src={`${A}/${name}-${n}.${ext[i]}`}
        alt=""
        draggable={false}
      />
    ));

  return (
    <section className="street-stop dunphy-stop" style={{ ["--i" as any]: index }}>
      <div className="dscene" ref={scene}>
        <div className="dstage">
          <div className="dworld">
            <div className="dl" style={{ ["--z" as any]: `${TREES_Z}px`, ["--s" as any]: TREES_S }}>
              <img className="dtrees" src={`${A}/trees.webp`} alt="" draggable={false} />
            </div>
          </div>

          <div className="dhouse phouse">
            <img className="dhouse-img" src={`${A}/house.webp`} alt="" draggable={false} />
            <div className="dchar pgloria bob-a">{frames("gloria", ["webp", "webp"])}</div>
            {hits.map((id) => (
              <img key={id} className="phit" src={`${A}/hit.webp`} alt="" draggable={false} />
            ))}
            <div className="dchar pstella bob-b">{frames("stella", ["webp", "webp"])}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
