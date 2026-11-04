import { houses } from "../data/houses";

const done = new Set<string>();

// Fetch + decode an image in the background so it appears instantly later.
export function preload(urls: string[]) {
  for (const u of urls) {
    if (done.has(u)) continue;
    done.add(u);
    const img = new Image();
    img.decoding = "async";
    img.src = u;
    img.decode?.().catch(() => {}); // a missing file is reported by scripts/check-assets.mjs
  }
}

// Full literal paths on purpose: scripts/check-assets.mjs verifies every one exists.
export const SPLASH = [
  "/assets/shared/splash/family.webp",
  "/assets/shared/splash/frames.webp",
  "/assets/shared/splash/wall-texture.webp",
];
export const STREET = [
  "/assets/shared/street/sky.webp",
  "/assets/dunphy/street/street-sky.webp",
  "/assets/dunphy/street/street-trees.webp",
  "/assets/dunphy/street/house.webp",
  "/assets/dunphy/street/phil.webp",
  "/assets/dunphy/street/luke.webp",
  "/assets/dunphy/street/luke-hurt.webp",
  "/assets/pritchett/street/trees.webp",
  "/assets/pritchett/street/house.webp",
  "/assets/pritchett/street/hit.webp",
  "/assets/pritchett/street/gloria-1.webp",
  "/assets/pritchett/street/gloria-2.webp",
  "/assets/pritchett/street/stella-1.webp",
  "/assets/pritchett/street/stella-2.webp",
  "/assets/tucker-pritchett/street/trees.webp",
  "/assets/tucker-pritchett/street/house.webp",
  "/assets/tucker-pritchett/street/cam-1.webp",
  "/assets/tucker-pritchett/street/cam-2.webp",
];

export const roomUrls = (houseId?: string) =>
  houses
    .filter((h) => !houseId || h.id === houseId)
    .flatMap((h) => h.rooms.flatMap((r) => r.layers.flatMap((l) => [l.src, l.alt].filter(Boolean) as string[])));
