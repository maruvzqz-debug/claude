#!/usr/bin/env node
// KEYMEX Caribe — Carrusel por guion (1 a 10 slides 1080×1350) + copy por red.
//   node carrusel.mjs propiedades/<carpeta>
// La carpeta lleva guion.txt (formato en app/src/lib/carrusel.js), carrusel.json
// ({agente:{nombre,whatsapp,email}, segmento, operacion, tipo, zona, confotur}) y fotos/ (01.jpg… = FOTO: 1…).
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
const { chromium } = createRequire(import.meta.url)("playwright");

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const APP = path.join(ROOT, "app", "dist", "index.html");
const dir = path.resolve(process.argv[2] || "");
const die = (m) => { console.error("✗ " + m); process.exit(1); };
if (!fs.existsSync(path.join(dir, "guion.txt"))) die("Uso: node carrusel.mjs propiedades/<carpeta>  (requiere guion.txt)");
if (!fs.existsSync(APP)) die("Falta compilar la app: cd app && npm install && npm run build");
const cfg = fs.existsSync(path.join(dir, "carrusel.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "carrusel.json"), "utf8")) : {};
if (!cfg.agente?.nombre || !cfg.agente?.whatsapp) die("Falta agente.nombre y agente.whatsapp en carrusel.json (se pide en cada pieza).");
const office = JSON.parse(fs.readFileSync(path.join(ROOT, "oficina.json"), "utf8"));
const chantal = ["CHANTAL.woff2", "CHANTAL.otf", "CHANTAL.ttf"].map((f) => path.join(ROOT, "assets", "fonts", f)).find((f) => fs.existsSync(f));
if (chantal) office.chantal = `data:font/${path.extname(chantal).slice(1)};base64,${fs.readFileSync(chantal).toString("base64")}`;
const fdir = path.join(dir, "fotos");
const fotos = fs.existsSync(fdir) ? fs.readdirSync(fdir).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => pathToFileURL(path.join(fdir, f)).href) : [];
const d = { segmento: "inversor", operacion: "venta", tipo: "villa", ...cfg, guion: fs.readFileSync(path.join(dir, "guion.txt"), "utf8"), fotos };

const out = path.join(dir, "salida-carrusel");
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1350 } });
await page.addInitScript(() => { window.__KX_RENDER__ = true; });
await page.goto(pathToFileURL(APP).href);
await page.waitForFunction(() => typeof window.__kxSet === "function");
const parsed = await page.evaluate((g) => window.__kxParseCarrusel(g), d.guion);
parsed.warnings.forEach((w) => console.warn("⚠ " + w));
if (parsed.errors.length) { parsed.errors.forEach((e) => console.error("✗ " + e)); await browser.close(); process.exit(1); }
const missing = parsed.slides.filter((s) => s.foto && !fotos[s.foto - 1]).map((s) => s.foto);
if (missing.length) console.warn(`⚠ El guion pide FOTO ${[...new Set(missing)].join(", ")} pero hay ${fotos.length} foto(s).`);
let paso = 0;
for (const [i, s] of parsed.slides.entries()) {
  const pasoN = s.tipo === "PASO" ? ++paso : 0;
  await page.evaluate((p) => window.__kxSet(p), { kind: "carrusel", d, office, slide: { s, i, n: parsed.slides.length, pasoN } });
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((im) => im.decode().catch(() => {}))); });
  await page.waitForTimeout(150);
  await (await page.$("#kx-render > .kx")).screenshot({ path: path.join(out, `${String(i + 1).padStart(2, "0")}-${s.tipo.toLowerCase()}.png`) });
}
for (const red of await page.evaluate(() => window.__kxRedes)) {
  fs.writeFileSync(path.join(out, `copy-${red}.txt`), (await page.evaluate(([dd, oo, rr]) => window.__kxCaptionCarrusel(dd, oo, rr), [d, office, red])) + "\n");
}
await browser.close();
console.log(`✓ ${parsed.slides.length} slides (${parsed.slides.map((s) => s.tipo.toLowerCase()).join(" → ")}) + copy para Instagram, TikTok y Facebook\nListo → ${out}`);
