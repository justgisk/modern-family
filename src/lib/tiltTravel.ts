// Calls `cb` every `stepDeg` degrees of phone tilt (any direction), the gyro twin of
// "every N px of finger travel". Returns an unsubscribe fn. No-op where there is no gyro.
export function onTiltTravel(stepDeg: number, cb: () => void): () => void {
  let last: { b: number; g: number } | null = null;
  let dist = 0;
  const wrap = (d: number) => (d > 180 ? d - 360 : d < -180 ? d + 360 : d);
  const handler = (e: DeviceOrientationEvent) => {
    if (e.beta == null || e.gamma == null) return;
    if (last) {
      const db = wrap(e.beta - last.b);
      const dg = e.gamma - last.g;
      const d = Math.hypot(db, dg);
      if (d > 0.35) dist += d; // ignore sensor jitter while the phone rests
    }
    last = { b: e.beta, g: e.gamma };
    if (dist >= stepDeg) {
      dist = 0;
      cb();
    }
  };
  window.addEventListener("deviceorientation", handler);
  return () => window.removeEventListener("deviceorientation", handler);
}
