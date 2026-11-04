// Usage: npm run check:assets
// Fails (exit 1) if code references an /assets file that does not exist on disk,
// and lists files in public/assets that nothing references.
import { promises as fs } from "node:fs";
import path from "node:path";
import { build } from "esbuild";

const ROOT = process.cwd();
const walk = async (dir, out = []) => {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    e.isDirectory() ? await walk(p, out) : out.push(p);
  }
  return out;
};

const srcFiles = (await walk("src")).filter((f) => /\.(tsx?|css)$/.test(f));
const refs = new Map(); // url -> file that mentions it

for (const f of srcFiles) {
  let text = await fs.readFile(f, "utf8");
  if (f.endsWith("houses.ts")) {
    // legacy placeholder specs (exterior fallback, sharedAssets) are not loaded at runtime
    text = text.split("export const sharedAssets")[0].replace(/^.*exterior.*$/gm, "");
    text = text.replace(/exterior: \{[\s\S]*?\},\n/g, "");
  }
  // const A = "/assets/x/y";  then `${A}/file.webp`
  const consts = Object.fromEntries([...text.matchAll(/const (\w+) = ["'`](\/assets[^"'`]*)["'`]/g)].map((m) => [m[1], m[2]]));
  for (const m of text.matchAll(/["'`(]((?:\/assets|\$\{\w+\})[^"'`)\s]*\.(?:webp|png|jpe?g|svg|gif))["'`)]/g)) {
    let u = m[1].replace(/\$\{(\w+)\}/, (_, k) => consts[k] ?? "${" + k + "}");
    if (/\$\{/.test(u)) {
      // pattern like cam-${n}.webp: expand n = 1,2
      for (const n of [1, 2]) refs.set(u.replace(/\$\{\w+\}/g, String(n)), f);
    } else refs.set(u, f);
  }
}

// Room layers are built by functions in houses.ts, so load the real data instead of regexing it.
const bundled = await build({ entryPoints: ["src/data/houses.ts"], bundle: true, write: false, format: "esm", platform: "node" });
const { houses } = await import("data:text/javascript;base64," + Buffer.from(bundled.outputFiles[0].text).toString("base64"));
for (const h of houses)
  for (const r of h.rooms)
    for (const l of r.layers) for (const u of [l.src, l.alt]) if (u) refs.set(u, `${h.id}/${r.id} layer "${l.key}"`);

const onDisk = new Set((await walk("public/assets")).filter((f) => !/\.(DS_Store|gitkeep)$/.test(f)).map((f) => "/" + path.relative("public", f)));
const missing = [...refs].filter(([u]) => !onDisk.has(u));
const unused = [...onDisk].filter((u) => !refs.has(u));

console.log(`${refs.size} referenced, ${onDisk.size} on disk`);
if (unused.length) console.log("\nNot referenced in src/ (ok if used in data-built paths):\n  " + unused.join("\n  "));
if (missing.length) {
  console.error("\nMISSING files:\n" + missing.map(([u, f]) => `  ${u}   (in ${f})`).join("\n"));
  process.exit(1);
}
console.log("\nAll referenced assets exist.");
