// iOS needs a user tap before DeviceOrientation events are delivered.
export async function requestMotion(): Promise<boolean> {
  const DOE = (window as any).DeviceOrientationEvent;
  if (!DOE) return false;
  if (typeof DOE.requestPermission === "function") {
    try {
      return (await DOE.requestPermission()) === "granted";
    } catch {
      return false;
    }
  }
  return true;
}
