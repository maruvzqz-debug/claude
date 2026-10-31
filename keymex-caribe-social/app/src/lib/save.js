// Guarda un archivo: dentro de claude.ai usa la capacidad "downloads" (el visor confirma);
// fuera (npm run dev, hosting propio) usa una descarga normal del navegador.
let dl;
async function downloads() {
  if (dl !== undefined) return dl;
  dl = window.claude?.use ? await window.claude.use("downloads").catch(() => null) : null;
  return dl;
}

export async function saveFile(blob, filename) {
  const d = await downloads();
  if (d) {
    try { await d.save({ filename, data: blob }); return true; }
    catch (e) {
      if (e?.code === "declined") return false;
      throw new Error(e?.code === "rate_limited" ? "Ya hay una descarga esperando confirmación." : `No se pudo guardar (${e?.code || "error"}).`);
    }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  return true;
}
