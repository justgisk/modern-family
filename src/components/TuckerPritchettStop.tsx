import { useRef } from "react";
import { useTilt } from "../lib/useTilt";
import { usePoseSwap } from "../lib/usePoseSwap";

const A = "/assets/tucker-pritchett/street";

// Same layering as the Dunphy stop: only the trees get depth parallax.
const TREES_Z = -150;
const TREES_S = (900 - TREES_Z) / 900;

export function TuckerPritchettStop({ index }: { index: number }) {
  const scene = useRef<HTMLDivElement>(null);
  useTilt(scene);

  // pose 0 = cam-1, pose 1 = cam-2 (yelling). The bubble shows each time we land on cam-2.
  const pose = usePoseSwap(scene);

  return (
    <section className="street-stop dunphy-stop" style={{ ["--i" as any]: index }}>
      <div className="dscene" ref={scene}>
        <div className="dstage">
          <div className="dworld">
            <div className="dl" style={{ ["--z" as any]: `${TREES_Z}px`, ["--s" as any]: TREES_S }}>
              <img className="dtrees ttrees" src={`${A}/trees.webp`} alt="" draggable={false} />
            </div>
          </div>

          <div className="dhouse thouse">
            <img className="dhouse-img" src={`${A}/house.webp`} alt="" draggable={false} />
            <div className="dchar tcam bob-a">
              {[1, 2].map((n, i) => (
                <img
                  key={n}
                  className={`pframe${pose === i ? " on" : ""}`}
                  src={`${A}/cam-${n}.webp`}
                  alt=""
                  draggable={false}
                />
              ))}
            </div>
            {pose === 1 && (
              <div className="tbubble-pos">
                <div className="tbubble">
                  <svg viewBox="0 0 120 52" aria-hidden>
                    <path
                      d="M12 2H108A10 10 0 0 1 118 12V28A10 10 0 0 1 108 38H100L112 50L82 38H12A10 10 0 0 1 2 28V12A10 10 0 0 1 12 2Z"
                      fill="#fff"
                      stroke="#000"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>STELLA!!</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
