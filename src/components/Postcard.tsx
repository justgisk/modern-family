import { useEffect, useRef, useState } from "react";
import { RoomDef } from "../data/houses";
import { useTilt } from "../lib/useTilt";
import { onTiltTravel } from "../lib/tiltTravel";
import { usePoseSwap } from "../lib/usePoseSwap";
import { Art } from "./Art";

export function Postcard({ room }: { room: RoomDef }) {
  const ref = useRef<HTMLDivElement>(null);
  useTilt(ref);
  const pose = usePoseSwap(ref); // 0 = layer.src, 1 = layer.alt

  // Hover / swipe / drag makes the character speak: a bubble plus fading music notes.
  const [bursts, setBursts] = useState<number[]>([]);
  const last = useRef(0);
  const n = useRef(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const speak = () => {
    if (!room.bubble) return;
    const now = performance.now();
    if (now - last.current < 1400) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    last.current = now;
    const id = ++n.current;
    setBursts((b) => [...b, id]);
    timers.current.push(window.setTimeout(() => setBursts((b) => b.filter((x) => x !== id)), 1800));
  };

  const speakRef = useRef(speak);
  speakRef.current = speak;
  useEffect(() => onTiltTravel(20, () => speakRef.current()), []); // tilting the phone makes them talk

  return (
    <div className="postcard-stage" onPointerMove={speak} onPointerDown={speak}>
      <div className="postcard" ref={ref} key={room.id} style={{ ["--wall" as any]: room.wall }}>
        {room.layers.map((l) => (
          <div
            key={l.key}
            className="layer"
            style={{ ["--k" as any]: `${l.depth * 0.28}px` }}
          >
            {[l.src, l.alt].map(
              (src, i) =>
                src && (
                  <Art
                    key={src}
                    src={src}
                    label={l.file.replace(".webp", "")}
                    tint={l.tint}
                    className={`${l.box ? "placed" : "fill"}${l.alt ? ` pose${pose === i ? " on" : ""}` : ""}`}
                    style={
                      l.box
                        ? { left: `${l.box.x}%`, top: `${l.box.y}%`, width: `${l.box.w}%`, height: `${l.box.h}%` }
                        : undefined
                    }
                    fit={l.fit}
                    phStyle={
                      l.key === "wall" || i
                        ? l.key === "wall" ? undefined : { display: "none" }
                        : {
                            inset: "auto",
                            left: `${l.ph.x}%`,
                            top: `${l.ph.y}%`,
                            width: `${l.ph.w}%`,
                            height: `${l.ph.h}%`,
                          }
                    }
                  />
                ),
            )}
          </div>
        ))}
        {room.bubble &&
          bursts.map((id) => (
            <div
              key={id}
              className="speech"
              style={{
                ["--bx" as any]: `${room.bubble!.x}%`,
                ["--by" as any]: `${room.bubble!.y}%`,
              }}
            >
              <svg className="speech-bubble" viewBox="0 0 430 205" aria-hidden>
                <path
                  d="M50 12H380A38 38 0 0 1 418 50V124A38 38 0 0 1 380 162H364L408 198L290 162H50A38 38 0 0 1 12 124V50A38 38 0 0 1 50 12Z"
                  fill="#fff"
                  stroke="#000"
                  strokeWidth="11"
                  strokeLinejoin="round"
                />
                <text x="215" y="112" textAnchor="middle" fontSize="80" fontWeight="400" fill="#000" fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif">
                  {room.bubble!.text}
                </text>
              </svg>
              <span className="note n1">♪</span>
              <span className="note n2">♫</span>
              <span className="note n3">♬</span>
            </div>
          ))}
        <div className="glare" />
      </div>
    </div>
  );
}
