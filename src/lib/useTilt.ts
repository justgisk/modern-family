import { RefObject, useEffect } from "react";

const clamp = (v: number, a = -1, b = 1) => Math.max(a, Math.min(b, v));

// Writes --tx / --ty (-1..1) onto the element every frame. Gyro wins when it is
// delivering events; otherwise the pointer drives it (desktop / motion denied).
export function useTilt(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let gyro = false;
    let base: { b: number; g: number } | null = null;
    let raf = 0;

    const onOrient = (e: DeviceOrientationEvent) => {
      if (e.beta == null || e.gamma == null) return;
      gyro = true;
      if (!base) base = { b: e.beta, g: e.gamma };
      target.x = clamp((e.gamma - base.g) / 22);
      target.y = clamp((e.beta - base.b) / 22);
    };

    // Mouse: hover position drives it. Touch: finger drag / swipe drives it, easing back on release.
    let drag: { x: number; y: number } | null = null;

    const onPointer = (e: PointerEvent) => {
      if (gyro || e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      target.x = clamp(((e.clientX - r.left) / r.width - 0.5) * 2);
      target.y = clamp(((e.clientY - r.top) / r.height - 0.5) * 2);
    };

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t || (e.target as HTMLElement).closest("button")) return;
      drag = { x: t.clientX, y: t.clientY };
    };

    // touchmove keeps firing while the street scroller pans, unlike pointermove (pointercancel).
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (gyro || !drag || !t) return;
      const r = el.getBoundingClientRect();
      target.x = clamp(((t.clientX - drag.x) / r.width) * 3);
      target.y = clamp(((t.clientY - drag.y) / r.height) * 3);
    };

    const onLeave = () => {
      drag = null;
      if (gyro) return;
      target.x = 0;
      target.y = 0;
    };

    const tick = () => {
      cur.x += (target.x - cur.x) * 0.1;
      cur.y += (target.y - cur.y) * 0.1;
      el.style.setProperty("--tx", cur.x.toFixed(4));
      el.style.setProperty("--ty", cur.y.toFixed(4));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("deviceorientation", onOrient);
    window.addEventListener("pointermove", onPointer);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onLeave);
    window.addEventListener("touchcancel", onLeave);
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("pointermove", onPointer);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("touchcancel", onLeave);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [ref]);
}
