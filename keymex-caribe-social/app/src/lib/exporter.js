import { toPng } from "html-to-image";
import JSZip from "jszip";

async function waitImages(node) {
  const urls = new Set();
  node.querySelectorAll("img").forEach((i) => urls.add(i.src));
  node.querySelectorAll("*").forEach((el) => {
    const m = /url\("?([^")]+)"?\)/.exec(el.style?.backgroundImage || "");
    if (m) urls.add(m[1]);
  });
  await Promise.all([...urls].map((u) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = u; })));
  await document.fonts.ready;
}

// Renderiza un nodo .kx a PNG en su tamaño exacto (pixelRatio 1 → 1080 px reales).
export async function nodeToPng(node) {
  await waitImages(node);
  const w = node.offsetWidth, h = node.offsetHeight;
  const opts = { width: w, height: h, pixelRatio: 1, cacheBust: false, style: { transform: "none" } };
  await toPng(node, opts); // 1ª pasada: calienta fuentes/imágenes embebidas (bug conocido de Safari)
  return toPng(node, opts);
}

export function dataUrlToBytes(u) {
  const b = atob(u.split(",")[1]); const a = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
  return a;
}

export async function zipAndDownload(files, name, saver) {
  const zip = new JSZip();
  for (const [path, content] of files) zip.file(path, content);
  const blob = await zip.generateAsync({ type: "blob" });
  return saver(blob, name);
}
