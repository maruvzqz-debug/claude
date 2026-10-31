// Guion de carrusel → slides (1 a 10).
// Formato: bloques separados por una línea "---". La 1ª línea de cada bloque dice el tipo:
//   PORTADA: título (marca con *asteriscos* la parte en script dorada)   BAJADA: …   FOTO: n
//   PASO: título            TEXTO: …   ICONO: nombre (casa, dinero, llave, firma…)
//   DATO: cifra grande      TEXTO: qué significa
//   LISTA: título           - ítem   - ítem   (hasta 7)
//   TEXTO: título           párrafo libre en las líneas siguientes   FOTO: n (opcional)
//   FOTO: n                 LEYENDA: …
//   FRASE: frase en script  FOTO: n (opcional)
//   CIERRE: llamado a la acción   TEXTO: …
// Líneas que empiezan con # se ignoran. La línea "CARRUSEL: …" del inicio es opcional.
export const TIPOS = ["PORTADA", "PASO", "DATO", "LISTA", "TEXTO", "FOTO", "FRASE", "CIERRE"];
const CLAVES = ["BAJADA", "TEXTO", "ICONO", "FOTO", "LEYENDA"];
export const MAX_SLIDES = 10;

export function parseCarrusel(src = "") {
  const errors = [], warnings = [];
  let titulo = "";
  const lines = src.replace(/\r/g, "").split("\n");
  const blocks = [];
  let cur = [];
  lines.forEach((l, i) => {
    if (/^\s*---+\s*$/.test(l)) { if (cur.length) blocks.push(cur); cur = []; return; }
    if (/^\s*#/.test(l)) return;
    const m = /^\s*CARRUSEL\s*:\s*(.*)$/i.exec(l);
    if (m && !blocks.length && !cur.some((x) => x.t.trim())) { titulo = m[1].trim(); return; }
    cur.push({ t: l, n: i + 1 });
  });
  if (cur.length) blocks.push(cur);

  const slides = [];
  for (const b of blocks) {
    const body = b.filter((x) => x.t.trim());
    if (!body.length) continue;
    const head = /^\s*([A-ZÁÉÍÓÚÑ]+)\s*:\s*(.*)$/i.exec(body[0].t);
    const tipo = head ? head[1].toUpperCase().normalize("NFD").replace(/[̀-ͯ]/g, "") : "";
    if (!TIPOS.includes(tipo)) { errors.push(`Línea ${body[0].n}: el bloque tiene que empezar con un tipo (${TIPOS.join(", ")}). Encontré “${body[0].t.trim().slice(0, 40)}”.`); continue; }
    const s = { tipo, valor: head[2].trim(), texto: "", bajada: "", icono: "", foto: null, leyenda: "", items: [], linea: body[0].n };
    const libres = [];
    for (const x of body.slice(1)) {
      const kv = /^\s*([A-ZÁÉÍÓÚÑ]+)\s*:\s*(.*)$/i.exec(x.t);
      const k = kv && kv[1].toUpperCase();
      if (k && CLAVES.includes(k)) {
        if (k === "FOTO") s.foto = parseInt(kv[2], 10) || null; else s[k.toLowerCase()] = kv[2].trim();
      } else if (/^\s*[-•]\s+/.test(x.t)) s.items.push(x.t.replace(/^\s*[-•]\s+/, "").trim());
      else libres.push(x.t.trim());
    }
    if (libres.length) s.texto = [s.texto, ...libres].filter(Boolean).join(" ");
    if (tipo === "FOTO") { s.foto = s.foto || parseInt(s.valor, 10) || null; if (!s.foto) errors.push(`Línea ${s.linea}: FOTO necesita el número de foto (ej. FOTO: 3).`); }
    if (tipo === "LISTA" && !s.items.length) errors.push(`Línea ${s.linea}: la LISTA no tiene ítems (empezá cada uno con “- ”).`);
    if (tipo === "LISTA" && s.items.length > 7) { warnings.push(`Línea ${s.linea}: la lista tiene ${s.items.length} ítems; se muestran 7.`); s.items = s.items.slice(0, 7); }
    if (tipo !== "FOTO" && !s.valor) errors.push(`Línea ${s.linea}: ${tipo} necesita un texto después de los dos puntos.`);
    if ((s.valor.match(/\*/g) || []).length > 2) errors.push(`Línea ${s.linea}: solo una parte en script por título (un par de *asteriscos*).`);
    slides.push(s);
  }
  if (!slides.length && !errors.length) errors.push("El guion está vacío. Usá “Insertar ejemplo” para ver el formato.");
  if (slides.length && slides[0].tipo !== "PORTADA") warnings.push("La primera slide no es PORTADA: el carrusel arranca sin gancho ni datos de contacto.");
  if (slides.length > MAX_SLIDES) { errors.push(`Hay ${slides.length} slides: Instagram permite hasta ${MAX_SLIDES}. Uní o borrá ${slides.length - MAX_SLIDES}.`); }
  // Si falta el cierre y hay lugar, lo agregamos para que nunca falte el contacto
  if (slides.length && slides.length < MAX_SLIDES && !slides.some((s) => s.tipo === "CIERRE")) {
    slides.push({ tipo: "CIERRE", valor: "", texto: "", bajada: "", icono: "", foto: null, leyenda: "", items: [], linea: 0, auto: true });
    warnings.push("No había CIERRE: agregué una slide final con el contacto del agente.");
  }
  return { titulo, slides: slides.slice(0, MAX_SLIDES), errors, warnings };
}

export const EJEMPLO_CARRUSEL = `CARRUSEL: Invertir desde Argentina
---
PORTADA: Cómo invertir en *República Dominicana* desde Argentina
BAJADA: Guía rápida en 4 pasos
FOTO: 1
---
DATO: 15 años
TEXTO: de beneficios fiscales en proyectos clasificados CONFOTUR
---
PASO: Elegí el proyecto
TEXTO: Te mostramos opciones en preventa con plan de pagos en dólares.
ICONO: casa
---
PASO: Reservá tu unidad
TEXTO: Con un monto inicial bloqueás precio y ubicación.
ICONO: dinero
---
PASO: Firmá a distancia
TEXTO: Todo el proceso se puede hacer online, con respaldo legal.
ICONO: firma
---
PASO: Recibí tus llaves
TEXTO: Y empezá a rentar en temporada alta.
ICONO: llave
---
LISTA: Qué incluye el proyecto
- Piscina y área social
- Seguridad 24/7
- A minutos de la playa
- Administración de rentas
---
FRASE: Tu inversión comienza aquí
FOTO: 2
---
CIERRE: Agendá tu videollamada
TEXTO: Te mandamos la ficha completa y el plan de pagos por WhatsApp.`;
