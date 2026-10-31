export const FORMATS = {
  feed: { w: 1080, h: 1350, label: "Feed 4:5 · 1080×1350" },
  story: { w: 1080, h: 1920, label: "Story / portada reel 9:16 · 1080×1920" },
  square: { w: 1080, h: 1080, label: "Cuadrado 1:1 · 1080×1080" },
};

export function toNumber(v) {
  if (typeof v === "number") return v;
  if (v == null) return NaN;
  const s = String(v).replace(/[^\d.,-]/g, "");
  // "9.200.000" o "9,200,000" o "639,99"
  if (/^\d{1,3}([.,]\d{3})+$/.test(s)) return Number(s.replace(/[.,]/g, ""));
  return Number(s.replace(",", "."));
}

export function fmtMoney(precio, moneda = "USD") {
  const n = toNumber(precio);
  if (!isFinite(n) || n <= 0) return "";
  const sym = moneda === "RD$" ? "RD$" : "US$";
  return `${sym} ${Math.round(n).toLocaleString("en-US")}`;
}

export function fmtNum(v) {
  const n = toNumber(v);
  if (!isFinite(n) || n === 0) return "";
  return Number.isInteger(n) ? n.toLocaleString("en-US") : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// Divide el título resaltando la palabra acento (1 sola palabra).
export function splitAcento(titulo = "", palabra = "") {
  const p = (palabra || "").trim();
  if (!p) return [{ t: titulo, a: false }];
  const i = titulo.toLowerCase().lastIndexOf(p.toLowerCase());
  if (i < 0) return [{ t: titulo, a: false }];
  return [
    { t: titulo.slice(0, i), a: false },
    { t: titulo.slice(i, i + p.length), a: true },
    { t: titulo.slice(i + p.length), a: false },
  ].filter((x) => x.t);
}

// "¿Qué pasaría si tuvieras *tu villa* en Cap Cana?" → segmento entre * en script
export function splitScript(text = "") {
  return text.split(/(\*[^*]+\*)/g).filter(Boolean).map((t) => (t.startsWith("*") && t.endsWith("*") ? { t: t.slice(1, -1), s: true } : { t, s: false }));
}

export function slugify(s = "") {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50) || "pieza";
}

// ---------- Zonas seguras (px sobre el lienzo de 1080 de ancho) ----------
// Vertical 9:16 = la unión más estricta de Instagram Reels, Instagram Stories y TikTok:
//   arriba 220 (título "Reels", cámara, barra de progreso de Stories, búsqueda de TikTok)
//   abajo 480 (usuario, caption, audio, barra de respuesta, navegación de TikTok)
//   derecha 140 (me gusta / comentar / compartir / perfil), izquierda 60
// Feed 4:5: la grilla del perfil muestra el centro en 3:4 → recorta 34 px por lado.
export const SAFE = {
  vertical: { top: 220, bottom: 480, left: 60, right: 140 },
  feed: { side: 34 },
};
