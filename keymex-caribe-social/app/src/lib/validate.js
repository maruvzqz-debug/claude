import { toNumber, FORMATS } from "./format.js";

export function validate(kind, d) {
  const errors = [], warnings = [];
  const a = d.agente || {};
  if (kind !== "destacadas") {
    if (!a.nombre?.trim()) errors.push("Falta el nombre del agente.");
    if (!a.whatsapp?.trim()) errors.push("Falta el WhatsApp del agente (va en el footer y en la caption).");
  }
  if (kind === "propiedad") {
    if (!d.titulo?.trim()) errors.push("Falta el título.");
    const p = toNumber(d.precio);
    if (!isFinite(p) || p <= 0) errors.push("El precio es obligatorio en la portada.");
    if (!d.fotos?.length) errors.push("Carga al menos la foto de portada.");
    const pa = (d.palabra_acento || "").trim();
    if (pa && /\s/.test(pa)) errors.push("La palabra acento debe ser UNA sola palabra.");
    if (pa && !d.titulo?.toLowerCase().includes(pa.toLowerCase())) errors.push(`La palabra acento “${pa}” no está en el título.`);
    if (d.tipo === "lote" && (d.lote?.poligono || []).length < 3) warnings.push("Lote: marca al menos 3 puntos del polígono sobre la foto.");
    if (d.moneda === "RD$" && d.segmento === "inversor") warnings.push("Segmento inversor suele publicarse en US$.");
  }
  if (kind === "hook") {
    if (!d.pregunta?.trim()) errors.push("Falta la pregunta/gancho.");
    const n = ((d.pregunta || "").match(/\*[^*]+\*/g) || []).length;
    if (n > 1) errors.push("Máximo 1 acento en script por titular (un solo *texto*).");
    if (!d.fotos?.length) errors.push("Carga la foto de fondo.");
  }
  if (kind === "pasos") {
    const n = (d.pasos || []).filter((s) => s.texto?.trim()).length;
    if (n < 3 || n > 6) errors.push("Usa entre 3 y 6 pasos.");
  }
  if (kind === "social") {
    const n = (d.fotos || []).filter(Boolean).length;
    if (n < 3 || n > 5) errors.push("El collage lleva de 3 a 5 fotos.");
  }
  return { errors, warnings };
}

/* ---------- Contraste AA del texto sobre la foto ---------- */
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lum = ([r, g, b]) => {
  const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const lerp = (a, b, t) => a + (b - a) * t;
function gradAlpha(stops, y) { // stops: [[pos, alpha], ...] pos 0..1
  for (let i = 0; i < stops.length - 1; i++) {
    const [p0, a0] = stops[i], [p1, a1] = stops[i + 1];
    if (y >= p0 && y <= p1) return lerp(a0, a1, (y - p0) / (p1 - p0 || 1));
  }
  return y < stops[0][0] ? stops[0][1] : stops[stops.length - 1][1];
}

// Zonas de texto sobre foto por plantilla: [label, x, y, w, h (px), overlayRGB, stops, textHex, minRatio]
function zones(tpl, variant, fmt) {
  const H = FORMATS[fmt].h;
  const top = { feed: 168, story: 340, square: 150 }[fmt];
  if (tpl === "ficha" && variant !== "oscura") return [
    ["Título", 64, top, 800, 200, [255, 255, 255], [[0, .96], [.24, .9], [.46, 0]], "#AD1D28", 3],
    ["Bajada", 64, top + 290, 720, 80, [255, 255, 255], [[0, .96], [.24, .9], [.46, 0]], "#3A3A3A", 4.5],
    ["Frase script", 400, H * (fmt === "story" ? 0.39 : 0.46), 620, 160, [0, 0, 0], [[0, 0], [.6, 0], [1, .45]], "#FFFFFF", 3],
  ];
  if (tpl === "ficha") return [
    ["Título", 64, top, 800, 200, [0, 0, 0], [[0, .56], [1, .56]], "#FFFFFF", 3],
    ["Frase script", 400, H * (fmt === "story" ? 0.39 : 0.46), 620, 160, [0, 0, 0], [[0, .56], [1, .56]], "#FFFFFF", 3],
  ];
  if (tpl === "lote") return [["Nombre del proyecto", 64, top + 30, 760, 120, [0, 0, 0], [[0, .6], [.34, 0]], "#FFFFFF", 3]];
  if (tpl === "hook") return [["Pregunta", 64, top + 60, 950, 330, [0, 0, 0], [[0, .55], [.45, .15], [1, .6]], "#FFFFFF", 3]];
  return [];
}

function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

export async function checkContrast(tpl, variant, fmt, src) {
  const zs = zones(tpl, variant, fmt);
  if (!zs.length || !src) return [];
  const { w, h } = FORMATS[fmt];
  const k = 0.25;
  try {
    const img = await loadImg(src);
    const c = document.createElement("canvas"); c.width = w * k; c.height = h * k;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    const s = Math.max(c.width / img.width, c.height / img.height);
    ctx.drawImage(img, (c.width - img.width * s) / 2, (c.height - img.height * s) / 2, img.width * s, img.height * s);
    const out = [];
    for (const [label, x, y, zw, zh, ov, stops, txt, min] of zs) {
      const data = ctx.getImageData(x * k, y * k, zw * k, zh * k).data;
      // peor caso: percentil de las filas — evaluamos el 90% de píxeles más desfavorables por promedio de bloques
      let worst = Infinity;
      const rows = Math.max(1, Math.floor(zh * k / 6));
      for (let r = 0; r < rows; r++) {
        let R = 0, G = 0, B = 0, n = 0;
        const y0 = Math.floor(r * zh * k / rows), y1 = Math.floor((r + 1) * zh * k / rows);
        for (let yy = y0; yy < y1; yy++) for (let xx = 0; xx < Math.floor(zw * k); xx++) {
          const i = (yy * Math.floor(zw * k) + xx) * 4; R += data[i]; G += data[i + 1]; B += data[i + 2]; n++;
        }
        if (!n) continue;
        const a = gradAlpha(stops, (y + (r + 0.5) * zh / rows) / h);
        const bg = [R / n, G / n, B / n].map((v, j) => ov[j] * a + v * (1 - a));
        worst = Math.min(worst, ratio(hex(txt), bg));
      }
      if (worst < min) out.push(`Contraste bajo en “${label}” (${worst.toFixed(1)}:1, mínimo ${min}:1). Prueba la variante oscura u otra foto/encuadre.`);
    }
    return out;
  } catch {
    return ["No se pudo verificar el contraste (foto desde URL externa). Mejor subir el archivo."];
  }
}
