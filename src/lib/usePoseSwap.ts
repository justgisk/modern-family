import { RefObject, useEffect, useState } from "react";
import { onTiltTravel } from "./tiltTravel";

// Swap between pose 0 and pose 1 every STEP_PX of pointer / finger travel.
const STEP_PX = 240;
const TILT_STEP_DEG = 22; // phone tilt that counts as one swap (same job as STEP_PX)
const MIN_STEP_MS = 450; // never swap faster than this, however fast the pointer moves

// 0 = pose 1, 1 = pose 2. Starts on pose 1 and flips 0,1,0,1… while the pointer moves / finger drags.
export function usePoseSwap(ref: RefObject<HTMLElement>) {
  const [pose, setPose] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last: { x: number; y: number } | null = null;
    let dist = 0;
    let lastSwap = 0;
    const move = (x: number, y: number) => {
      if (last) dist += Math.hypot(x - last.x, y - last.y);
      last = { x, y };
      const now = performance.now();
      if (dist >= STEP_PX && now - lastSwap >= MIN_STEP_MS) {
        dist = 0;
        lastSwap = now;
        setPose((p) => 1 - p);
      }
    };
    const reset = () => (last = null);
    const onPointer = (e: PointerEvent) => e.pointerType === "mouse" && move(e.clientX, e.clientY);
    // touchmove keeps firing while the street scroller pans (pointermove is cancelled)
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) move(t.clientX, t.clientY);
    };
    const offTilt = onTiltTravel(TILT_STEP_DEG, () => {
      const now = performance.now();
      if (now - lastSwap < MIN_STEP_MS) return;
      lastSwap = now;
      setPose((p) => 1 - p);
    });
    el.addEventListener("pointermove", onPointer);
    el.addEventListener("pointerleave", reset);
    el.addEventListener("touchstart", reset, { passive: true });
    el.addEventListener("touchmove", onTouch, { passive: true });
    el.addEventListener("touchend", reset, { passive: true });
    return () => {
      offTilt();
      el.removeEventListener("pointermove", onPointer);
      el.removeEventListener("pointerleave", reset);
      el.removeEventListener("touchstart", reset);
      el.removeEventListener("touchmove", onTouch);
      el.removeEventListener("touchend", reset);
    };
  }, [ref]);
  return pose;
}
