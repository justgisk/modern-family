// Usage: npm run optimize
// Originals live in art-src/ (NOT shipped). This turns every png/jpg/webp there into an
// optimized .webp at the same path under public/assets/. Re-run after adding new art.
// First run: moves existing raster files out of public/assets into art-src/.
import sharp from "sharp";
import { promises as fs } from "node:fs";
import path from "node:path";

const SRC = "art-src";
const OUT = "public/assets";
const MAX = 1600; // longest side, px
const RASTER = /\.(png|jpe?g|webp)$/i;

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

// 1. adopt originals still sitting in public/assets
for await (const f of walk(OUT)) {
  if (!RASTER.test(f)) continue;
  const rel = path.relative(OUT, f);
  const dest = path.join(SRC, rel);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.rename(f, dest);
}

// 2. encode
let before = 0;
let after = 0;
for await (const f of walk(SRC)) {
  if (!RASTER.test(f)) continue;
  const rel = path.relative(SRC, f).replace(RASTER, ".webp");
  const out = path.join(OUT, rel);
  await fs.mkdir(path.dirname(out), { recursive: true });
  const buf = await sharp(f)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80, alphaQuality: 90, effort: 6 })
    .toBuffer();
  await fs.writeFile(out, buf);
  const o = (await fs.stat(f)).size;
  before += o;
  after += buf.length;
  console.log(`${(o / 1024).toFixed(0).padStart(6)}KB -> ${(buf.length / 1024).toFixed(0).padStart(5)}KB  ${rel}`);
}
console.log(`\nTotal ${(before / 1048576).toFixed(1)}MB -> ${(after / 1048576).toFixed(1)}MB`);
