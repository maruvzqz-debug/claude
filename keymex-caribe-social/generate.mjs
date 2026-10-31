#!/usr/bin/env node
// KEYMEX Caribe — Propiedad → Carrusel + Story + Reel animado + Caption.
// Usa las MISMAS plantillas que KEYMEX Caribe Studio (app/dist/index.html en modo render).
//
//   node generate.mjs propiedades/<carpeta>            genera todo
//   node generate.mjs propiedades/<carpeta> --frame    solo guarda salida/marcar-poligono.jpg
//                                                      (fotograma 9:16 con grilla para ubicar el polígono del lote)
//
// La carpeta lleva propiedad.json + fotos/ y/o video.mp4 (+ musica.mp3 opcional).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const APP = path.join(ROOT, "app", "dist", "index.html");
const dir = path.resolve(process.argv[2] || "");
const ONLY_FRAME = process.argv.includes("--frame");
const die = (m) => { console.error("✗ " + m); process.exit(1); };
if (!process.argv[2] || !fs.existsSync(path.join(dir, "propiedad.json"))) die("Uso: node generate.mjs propiedades/<carpeta> [--frame]");
if (!fs.existsSync(APP)) die("Falta compilar la app: cd app && npm install && npm run build");

const FPS = 30, T = 0.4; // fundido entre escenas
// Zona segura 9:16 = unión de Instagram Reels/Stories y TikTok (igual que app/src/lib/format.js)
const SAFE = { top: 220, bottom: 480, left: 60, right: 140 };
const out = path.join(dir, "salida"), tmp = path.join(out, ".tmp");
fs.mkdirSync(out, { recursive: true });
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const probe = (f, what) => execFileSync("ffprobe", ["-v", "error", ...what, "-of", "csv=p=0", f]).toString().trim();
const dur = (f) => parseFloat(probe(f, ["-show_entries", "format=duration"]));
const dims = (f) => probe(f, ["-select_streams", "v:0", "-show_entries", "stream=width,height"]).split(",").map(Number);

// ---------- datos ----------
const raw = JSON.parse(fs.readFileSync(path.join(dir, "propiedad.json"), "utf8"));
const d = {
  operacion: "venta", moneda: "USD", segmento: "inversor", variante: "clara", ...raw,
  m2_construccion: raw.m2_construccion ?? raw.m2_construidos, // compatibilidad con el formato anterior
  tipo: (raw.tipo || "villa").toLowerCase(),
  operacion: (raw.operacion || "venta").toLowerCase(),
};
if (/^rd/i.test(d.moneda)) d.moneda = "RD$";
const officeFile = path.join(ROOT, "oficina.json");
const office = fs.existsSync(officeFile) ? JSON.parse(fs.readFileSync(officeFile, "utf8")) : {};
const chantal = ["CHANTAL.woff2", "CHANTAL.otf", "CHANTAL.ttf"].map((f) => path.join(ROOT, "assets", "fonts", f)).find((f) => fs.existsSync(f));
if (chantal) office.chantal = `data:font/${path.extname(chantal).slice(1)};base64,${fs.readFileSync(chantal).toString("base64")}`;
if (!ONLY_FRAME && (!d.agente?.nombre || !d.agente?.whatsapp)) die("Falta agente.nombre y agente.whatsapp en propiedad.json (se pide en cada pieza).");

// ---------- medios ----------
const videoPath = [raw.video, "video.mp4", "video.mov"].filter(Boolean).map((f) => path.join(dir, f)).find((f) => fs.existsSync(f)) || null;
let fotos = (raw.fotos?.length ? raw.fotos : fs.existsSync(path.join(dir, "fotos")) ? fs.readdirSync(path.join(dir, "fotos")).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => "fotos/" + f) : []).map((f) => path.join(dir, f));
if (!fotos.length && videoPath) {
  const vd = dur(videoPath);
  fotos = [0.15, 0.35, 0.55, 0.75, 0.9].map((r, i) => { const f = path.join(tmp, `frame-${i}.jpg`); ff(["-ss", (vd * r).toFixed(2), "-i", videoPath, "-frames:v", "1", "-q:v", "2", f]); return f; });
}
if (!fotos.length) die("No hay fotos ni video.");

// ---------- lote: imagen fija para el revelado + polígono en coordenadas 9:16 ----------
const isLote = d.tipo === "lote";
let still = null;
if (isLote) {
  const L = (d.lote ||= {});
  if (L.still) still = path.join(dir, L.still);
  else if (videoPath) { still = path.join(out, "lote-fotograma.jpg"); ff(["-ss", String(L.t_freeze ?? Math.min(dur(videoPath) * 0.5, 6)), "-i", videoPath, "-frames:v", "1", "-q:v", "2", still]); }
  else still = fotos[0];
  // Polígono marcado en la portada 4:5 (app) → convertir a 9:16 sobre la misma foto
  if (!L.poligono_reel?.length && L.poligono?.length >= 3 && still === fotos[0]) {
    const [iw, ih] = dims(still);
    const map = ([x, y], from, to) => {
      const s1 = Math.max(from[0] / iw, from[1] / ih), vw1 = from[0] / s1, vh1 = from[1] / s1;
      const ix = (iw - vw1) / 2 + x * vw1, iy = (ih - vh1) / 2 + y * vh1;
      const s2 = Math.max(to[0] / iw, to[1] / ih), vw2 = to[0] / s2, vh2 = to[1] / s2;
      return [+((ix - (iw - vw2) / 2) / vw2).toFixed(4), +((iy - (ih - vh2) / 2) / vh2).toFixed(4)];
    };
    L.poligono_reel = L.poligono.map((p) => map(p, [1080, 1350], [1080, 1920]));
  }
  if (ONLY_FRAME || !L.poligono_reel?.length) {
    // Fotograma 9:16 con grilla al 10% para ubicar los vértices (x,y de 0 a 1)
    const g = path.join(out, "marcar-poligono.jpg");
    let vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920";
    for (let i = 1; i < 10; i++) vf += `,drawbox=x=${i * 108}:y=0:w=2:h=1920:color=white@0.6:t=fill,drawbox=x=0:y=${i * 192}:w=1080:h=2:color=white@0.6:t=fill`;
    // zonas tapadas por Instagram/TikTok en rojo: el lote tiene que quedar fuera de ellas
    vf += `,drawbox=x=0:y=0:w=1080:h=${SAFE.top}:color=red@0.35:t=fill,drawbox=x=0:y=${1920 - SAFE.bottom}:w=1080:h=${SAFE.bottom}:color=red@0.35:t=fill,drawbox=x=${1080 - SAFE.right}:y=${SAFE.top}:w=${SAFE.right}:h=${1920 - SAFE.top - SAFE.bottom}:color=red@0.35:t=fill`;
    ff(["-i", still, "-vf", vf, "-frames:v", "1", "-q:v", "3", g]);
    console.log(`→ ${g}\n  Marca lote.poligono_reel en propiedad.json como [[x,y],…] (0–1; cada línea de la grilla = 0.1).`);
    if (ONLY_FRAME) process.exit(0);
    console.warn("⚠ Lote sin polígono: el revelado saldrá sin trazado.");
  }
}

if (isLote && d.lote.poligono_reel?.length) {
  const fuera = d.lote.poligono_reel.filter(([x, y]) => x * 1080 < SAFE.left || x * 1080 > 1080 - SAFE.right || y * 1920 < SAFE.top || y * 1920 > 1920 - SAFE.bottom);
  if (fuera.length) console.warn(`⚠ ${fuera.length} vértice(s) del lote caen bajo la interfaz de Instagram/TikTok. Elegí otro t_freeze o encuadre (ver marcar-poligono.jpg).`);
}

// ---------- escenas del reel ----------
const has = (v) => v != null && v !== "" && Number(String(v).replace(/[^\d.]/g, "")) > 0;
const scenes = isLote
  ? [["gancho", 2.8], ["revelado", 4.6], (d.lote.uso || has(d.lote.niveles) || has(d.habitaciones)) && ["infolote", 3.0], ["precio", 3.0], ["cierre", 3.4]]
  : [["gancho", 3.0], (has(d.m2_solar) || has(d.m2_construccion) || has(d.habitaciones)) && ["medidas", 2.8],
     ((d.amenidades || []).length || (d.destacados || []).length) && ["amenidades", 3.0], d.frase_script && ["frase", 2.6], ["precio", 3.0], ["cierre", 3.4]];
const SCENES = scenes.filter(Boolean).map(([name, len]) => ({ name, len, anim: name === "revelado" ? 2.8 : name === "cierre" ? 1.4 : 1.0 }));

// ---------- render con las plantillas de la app ----------
const fileUrl = (f) => pathToFileURL(f).href;
const pageData = { ...d, fotos: fotos.map(fileUrl) };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.addInitScript(() => { window.__KX_RENDER__ = true; });
await page.goto(fileUrl(APP));
await page.waitForFunction(() => typeof window.__kxSet === "function");
async function shot(props, file, transparent = false) {
  await page.evaluate((p) => window.__kxSet(p), props);
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
  if (props.kind !== "reel") await page.waitForTimeout(150); // fondos CSS
  await (await page.$("#kx-render > .kx")).screenshot({ path: file, omitBackground: transparent });
}

// Carrusel + story (mismas plantillas que la app)
const portadaKind = isLote ? "lote" : "ficha";
await shot({ kind: portadaKind, d: pageData, office, fmt: "feed" }, path.join(out, "post-01-portada.png"));
for (let i = 1; i < Math.min(fotos.length, 10); i++) await shot({ kind: "foto", src: fileUrl(fotos[i]), fmt: "feed" }, path.join(out, `post-${String(i + 1).padStart(2, "0")}-foto.png`));
await shot({ kind: portadaKind, d: pageData, office, fmt: "story" }, path.join(out, "story-portada.png"));
fs.copyFileSync(path.join(out, "story-portada.png"), path.join(out, "reel-portada.png"));
const caption = raw.caption || (await page.evaluate(([dd, oo]) => window.__kxCaption(dd, oo), [pageData, office]));
fs.writeFileSync(path.join(out, "caption.txt"), caption + "\n");
console.log(`✓ Carrusel ${Math.min(fotos.length, 10)} slides + story + caption`);

// Capas animadas del reel (PNG transparentes por fotograma)
for (const s of SCENES) {
  s.seq = path.join(tmp, s.name); fs.mkdirSync(s.seq);
  const n = Math.round(s.anim * FPS);
  for (let i = 0; i < n; i++) await shot({ kind: "reel", scene: s.name, d: pageData, office, p: i / (n - 1) }, path.join(s.seq, `${String(i).padStart(3, "0")}.png`), true);
  s.frames = n;
}
await browser.close();
console.log("✓ Capas animadas renderizadas");

// ---------- fondos + composición ----------
const COVER = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1";
const venc = ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-r", String(FPS)];
const vlen = videoPath ? dur(videoPath) : 0;
let cursor = Math.min(0.5, vlen / 10), fotoIdx = 0;
const clips = [];
for (const [k, s] of SCENES.entries()) {
  const L = s.len + (k < SCENES.length - 1 ? T : 0); // margen para el fundido
  const frames = Math.round(L * FPS);
  let bgIn, bgF;
  if (s.name === "cierre") { bgIn = ["-f", "lavfi", "-i", `color=c=0x7A141C:s=1080x1920:r=${FPS}:d=${L}`]; bgF = "[0:v]setsar=1[bg]"; }
  else if (s.name === "revelado") { bgIn = ["-loop", "1", "-t", L.toFixed(2), "-i", still]; bgF = `[0:v]${COVER},fps=${FPS}[bg]`; }
  else if (videoPath) {
    if (cursor + L > vlen) cursor = Math.max(0, (cursor + L) % Math.max(vlen - L, 0.01));
    bgIn = ["-ss", cursor.toFixed(2), "-t", L.toFixed(2), "-i", videoPath]; cursor += s.len;
    bgF = `[0:v]${COVER},fps=${FPS},tpad=stop_mode=clone:stop_duration=${L}[bg]`;
  } else {
    const foto = fotos[fotoIdx++ % fotos.length];
    const zin = k % 2 === 0, z = zin ? `min(1+0.12*on/${frames},1.12)` : `max(1.12-0.12*on/${frames},1.0)`;
    bgIn = ["-loop", "1", "-i", foto];
    bgF = `[0:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,zoompan=z='${z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${FPS},setsar=1[bg]`;
  }
  const c = path.join(tmp, `c${k}.mp4`);
  ff([...bgIn, "-framerate", String(FPS), "-i", path.join(s.seq, "%03d.png"), "-filter_complex",
    `${bgF};[1:v]tpad=stop_mode=clone:stop_duration=${L}[ov];[bg][ov]overlay=0:0:shortest=0,trim=duration=${L.toFixed(3)},format=yuv420p[v]`,
    "-map", "[v]", "-frames:v", String(frames), ...venc, c]);
  clips.push(c);
}

let fc = "", last = "[0:v]", acc = dur(clips[0]);
for (let i = 1; i < clips.length; i++) {
  fc += `${last}[${i}:v]xfade=transition=fade:duration=${T}:offset=${(acc - T).toFixed(3)}[x${i}];`;
  last = `[x${i}]`; acc += dur(clips[i]) - T;
}
const silent = path.join(tmp, "silent.mp4"), reel = path.join(out, "reel.mp4");
ff([...clips.flatMap((c) => ["-i", c]), ...(fc ? ["-filter_complex", fc.replace(/;$/, ""), "-map", last] : []), "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", silent]);
const musica = fs.existsSync(path.join(dir, "musica.mp3")) ? path.join(dir, "musica.mp3") : null;
if (musica) ff(["-i", silent, "-i", musica, "-filter_complex", `[1:a]afade=t=in:d=0.5,afade=t=out:st=${(acc - 1.5).toFixed(2)}:d=1.5[a]`, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", reel]);
else if (videoPath && raw.reel_audio_original) ff(["-i", silent, "-i", videoPath, "-map", "0:v", "-map", "1:a?", "-c:v", "copy", "-c:a", "aac", "-shortest", reel]);
else fs.renameSync(silent, reel);
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`✓ Reel ${acc.toFixed(1)} s · ${SCENES.map((s) => s.name).join(" → ")} ${musica ? "· con música" : "· sin música (agregar audio en Instagram)"}`);
console.log("Listo →", out);
