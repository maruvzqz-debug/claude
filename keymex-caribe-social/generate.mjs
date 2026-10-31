#!/usr/bin/env node
// KEYMEX Caribe — Generador de Post (carrusel) + Reel a partir de una propiedad.
// Uso:  node generate.mjs propiedades/<carpeta>
// La carpeta debe tener propiedad.json y fotos/ (jpg/png/webp) y/o video.mp4 (opcional) y musica.mp3 (opcional).
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const dir = path.resolve(process.argv[2] || "");
if (!process.argv[2] || !fs.existsSync(path.join(dir, "propiedad.json"))) {
  console.error("Uso: node generate.mjs propiedades/<carpeta>   (requiere propiedad.json)");
  process.exit(1);
}
const data = JSON.parse(fs.readFileSync(path.join(dir, "propiedad.json"), "utf8"));
const out = path.join(dir, "salida");
const tmp = path.join(out, ".tmp");
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });

const FPS = 30;
const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });
const ffprobeDur = (f) => parseFloat(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString());

// ---------- Fotos ----------
const videoPath = data.video ? path.join(dir, data.video) : fs.existsSync(path.join(dir, "video.mp4")) ? path.join(dir, "video.mp4") : null;
let fotos = (data.fotos && data.fotos.length ? data.fotos : (fs.existsSync(path.join(dir, "fotos")) ? fs.readdirSync(path.join(dir, "fotos")).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort().map((f) => "fotos/" + f) : []))
  .map((f) => path.join(dir, f));

if (!fotos.length && videoPath) {
  // Sin fotos: extraemos fotogramas del video para el carrusel.
  const dur = ffprobeDur(videoPath);
  fotos = [];
  for (let i = 0; i < 6; i++) {
    const t = ((i + 0.5) * dur) / 6;
    const f = path.join(tmp, `frame-${i}.jpg`);
    ff(["-ss", t.toFixed(2), "-i", videoPath, "-frames:v", "1", "-q:v", "2", f]);
    fotos.push(f);
  }
}
if (!fotos.length) { console.error("No hay fotos ni video en la carpeta."); process.exit(1); }

// Logos oficiales (si están cargados en assets/)
const logo = (n) => { const p = path.join(ROOT, "assets", n); return fs.existsSync(p) ? pathToFileURL(p).href : null; };
const pageData = {
  ...data,
  fotos: fotos.map((f) => pathToFileURL(f).href),
  __logos: { blanco: logo("logo-keymex-blanco.png"), rojo: logo("logo-keymex-rojo.png") },
};

// ---------- Escenas del reel ----------
const zona = [data.zona, data.ciudad].filter(Boolean).join(", ");
const facts = [];
if (data.habitaciones) facts.push({ sub: "Habitaciones", text: `${data.habitaciones} habitaciones` });
if (data.banos) facts.push({ sub: "Baños", text: `${data.banos} baños` });
if (data.m2_construidos) facts.push({ sub: "Superficie", text: `${data.m2_construidos} m² construidos` });
for (const x of (data.destacados || [])) facts.push({ sub: "Destacado", text: x });
const reelFacts = facts.slice(0, Math.max(1, Math.min(facts.length, data.reel_max_datos || 5)));
const a = data.agente || {};
const scenes = [
  { type: "hook", tag: data.etiqueta || "En venta", text: data.hook_reel || data.titulo, sub: zona },
  ...reelFacts.map((f) => ({ type: "fact", ...f })),
  { type: "price", text: data.precio || "Consultar precio", sub: zona, extra: [data.tipo, data.habitaciones && `${data.habitaciones} hab`, data.m2_construidos && `${data.m2_construidos} m²`].filter(Boolean).join(" · ") },
  { type: "end", text: data.cta_titulo || "Agenda tu visita privada", sub: data.cta_reel || "Escríbenos por WhatsApp", name: a.nombre || "KEYMEX Caribe", phone: a.telefono || "", ig: data.instagram || "" },
];
pageData.__scenes = scenes;

// ---------- Render HTML -> PNG ----------
const browser = await chromium.launch();
async function renderAll(template, w, h, selector, prefix, transparent) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.addInitScript((d) => { window.__DATA__ = d; }, pageData);
  await page.goto(pathToFileURL(path.join(ROOT, "templates", template)).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForLoadState("networkidle");
  const els = await page.$$(selector);
  const files = [];
  for (let i = 0; i < els.length; i++) {
    const f = path.join(prefix.dir, `${prefix.name}-${String(i + 1).padStart(2, "0")}.png`);
    await els[i].screenshot({ path: f, omitBackground: transparent });
    files.push(f);
  }
  await page.close();
  return files;
}
const slides = await renderAll("post.html", 1080, 1350, ".slide", { dir: out, name: "post" }, false);
const overlays = await renderAll("reel.html", 1080, 1920, ".scene", { dir: tmp, name: "ov" }, true);
await browser.close();
console.log(`✓ Carrusel: ${slides.length} slides 1080x1350`);

// ---------- Reel ----------
const reel = path.join(out, "reel.mp4");
const endOv = overlays[overlays.length - 1];
const musica = fs.existsSync(path.join(dir, "musica.mp3")) ? path.join(dir, "musica.mp3") : null;
const clips = [];

// Clip de cierre (placa roja 3s con zoom suave del logo/textos)
const endClip = path.join(tmp, "end.mp4");
ff(["-loop", "1", "-t", "3", "-i", endOv, "-vf", `scale=1080:1920,format=yuv420p,fps=${FPS}`, "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", endClip]);

if (videoPath) {
  // MODO VIDEO: recorte 9:16, máximo N segundos, overlays por tramos.
  const maxDur = data.reel_duracion || 24;
  const dur = Math.min(ffprobeDur(videoPath), maxDur);
  const ovs = overlays.slice(0, -1);
  const seg = dur / ovs.length;
  const inputs = ["-ss", "0", "-t", dur.toFixed(2), "-i", videoPath];
  ovs.forEach((o) => inputs.push("-i", o));
  let fc = `[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=${FPS},setsar=1[v0]`;
  ovs.forEach((_, i) => {
    const s = (i * seg).toFixed(2), e = ((i + 1) * seg).toFixed(2);
    fc += `;[v${i}][${i + 1}:v]overlay=0:0:enable='between(t,${s},${e})'[v${i + 1}]`;
  });
  const body = path.join(tmp, "body.mp4");
  ff([...inputs, "-filter_complex", fc, "-map", `[v${ovs.length}]`, "-an", "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", body]);
  clips.push(body);
} else {
  // MODO FOTOS: Ken Burns por foto + overlay de cada escena.
  const ovs = overlays.slice(0, -1);
  const per = data.reel_seg_por_escena || 2.6;
  const frames = Math.round(per * FPS);
  ovs.forEach((o, i) => {
    const foto = fotos[i % fotos.length];
    const zin = i % 2 === 0;
    const z = zin ? `min(1+0.10*on/${frames},1.10)` : `max(1.10-0.10*on/${frames},1.0)`;
    const c = path.join(tmp, `c${i}.mp4`);
    ff(["-loop", "1", "-i", foto, "-i", o, "-filter_complex",
      `[0:v]scale=2160:3840:force_original_aspect_ratio=increase,crop=2160:3840,zoompan=z='${z}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=1080x1920:fps=${FPS},setsar=1[bg];[bg][1:v]overlay=0:0,format=yuv420p[v]`,
      "-map", "[v]", "-frames:v", String(frames), "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", c]);
    clips.push(c);
  });
}
clips.push(endClip);

// Unión con transiciones (fundido 0.4s)
const T = 0.4;
const durs = clips.map(ffprobeDur);
let fc = "", last = "[0:v]", acc = durs[0];
for (let i = 1; i < clips.length; i++) {
  const off = (acc - T).toFixed(3);
  fc += `${last}[${i}:v]xfade=transition=fade:duration=${T}:offset=${off}[x${i}];`;
  last = `[x${i}]`; acc = acc - T + durs[i];
}
const silent = path.join(tmp, "silent.mp4");
ff([...clips.flatMap((c) => ["-i", c]), "-filter_complex", fc.replace(/;$/, ""), "-map", last, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p", "-r", String(FPS), "-movflags", "+faststart", silent]);

if (musica) {
  ff(["-i", silent, "-i", musica, "-filter_complex", `[1:a]afade=t=in:d=0.5,afade=t=out:st=${(acc - 1.5).toFixed(2)}:d=1.5,volume=0.8[a]`, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", reel]);
} else if (videoPath && data.reel_audio_original) {
  ff(["-i", silent, "-i", videoPath, "-map", "0:v", "-map", "1:a?", "-c:v", "copy", "-c:a", "aac", "-shortest", reel]);
} else {
  fs.renameSync(silent, reel);
}
// Portada del reel (frame del hook)
ff(["-ss", "1.2", "-i", reel, "-frames:v", "1", "-q:v", "2", path.join(out, "reel-portada.jpg")]);
console.log(`✓ Reel: ${acc.toFixed(1)}s 1080x1920 ${musica ? "(con música)" : "(sin música — agrega en IG un audio de la biblioteca)"}`);

// ---------- Caption ----------
const caption = data.caption || defaultCaption(data, zona);
fs.writeFileSync(path.join(out, "caption.txt"), caption + "\n");
fs.writeFileSync(path.join(out, "caption-reel.txt"), (data.caption_reel || caption) + "\n");
console.log("✓ Caption en salida/caption.txt");
fs.rmSync(tmp, { recursive: true, force: true });
console.log("Listo →", out);

function defaultCaption(d, zona) {
  const a = d.agente || {};
  const lines = [
    `${d.titulo} | ${zona} 🌴`, "",
    d.descripcion || "",
    "",
    ...[d.habitaciones && `🛏 ${d.habitaciones} habitaciones`, d.banos && `🛁 ${d.banos} baños`, d.m2_construidos && `📐 ${d.m2_construidos} m² construidos`, d.m2_terreno && `🌿 ${d.m2_terreno} m² de terreno`, d.parqueos && `🚗 ${d.parqueos} parqueos`].filter(Boolean),
    ...(d.destacados || []).map((x) => `✔️ ${x}`),
    "", `💰 ${d.precio || "Precio a consultar"}`, "",
    `📲 Agenda tu visita: ${a.telefono || ""}${a.nombre ? " · " + a.nombre : ""}`,
    `🔗 Ficha completa en el link de la bio`, "",
    (d.hashtags || ["#KeymexCaribe", "#Keymex", "#RealEstate", "#BienesRaices", "#PuntaCana", "#RepublicaDominicana", "#CaribbeanLiving", "#LuxuryRealEstate", "#InversionInmobiliaria"]).join(" "),
  ];
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
