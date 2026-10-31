import Papa from "papaparse";

export const CSV_COLUMNS = [
  "tipo", "operacion", "titulo", "palabra_acento", "proyecto", "zona", "ciudad", "bajada", "frase_script",
  "moneda", "precio", "precio_desde", "m2_solar", "m2_construccion", "habitaciones", "banos",
  "amenidades", "terminaciones", "confotur", "variante", "segmento", "fotos",
  "agente_nombre", "agente_whatsapp", "agente_email", "descripcion",
];

const list = (s) => String(s || "").split("|").map((x) => x.trim()).filter(Boolean);
const bool = (s) => /^(si|sí|true|1|x|yes)$/i.test(String(s || "").trim());

// Una fila = un carrusel. Listas separadas por "|". fotos = nombres de archivo subidos junto al CSV.
export function parseCSV(text) {
  const { data, errors } = Papa.parse(text.trim(), { header: true, skipEmptyLines: true, transformHeader: (h) => h.trim().toLowerCase() });
  const rows = data.map((r) => ({
    tipo: (r.tipo || "villa").toLowerCase(), operacion: (r.operacion || "venta").toLowerCase(),
    titulo: r.titulo || "", palabra_acento: r.palabra_acento || "", proyecto: r.proyecto || "",
    zona: r.zona || "", ciudad: r.ciudad || "", bajada: r.bajada || "", frase_script: r.frase_script || "",
    moneda: /rd/i.test(r.moneda) ? "RD$" : "USD", precio: r.precio || "", precio_desde: bool(r.precio_desde),
    m2_solar: r.m2_solar || "", m2_construccion: r.m2_construccion || "", habitaciones: r.habitaciones || "", banos: r.banos || "",
    amenidades: list(r.amenidades).map((x) => x.toLowerCase().replace(/\s+/g, "_")), terminaciones: list(r.terminaciones),
    confotur: bool(r.confotur), variante: /oscur/i.test(r.variante) ? "oscura" : "clara",
    segmento: ["inversor", "familia", "sur"].includes((r.segmento || "").toLowerCase()) ? r.segmento.toLowerCase() : "inversor",
    fotosNombres: list(r.fotos), descripcion: r.descripcion || "",
    agente: { nombre: r.agente_nombre || "", whatsapp: r.agente_whatsapp || "", email: r.agente_email || "" },
    lote: { poligono: [], medidas: [] },
  }));
  return { rows, errors };
}

export function sampleCSV() {
  const ex = {
    tipo: "villa", operacion: "venta", titulo: "Villa en Venta", palabra_acento: "Venta", proyecto: "Villas Samán",
    zona: "Playa Nueva Romana", ciudad: "La Romana", bajada: "Amplios espacios, privacidad y estilo de vida exclusivo en el Caribe.",
    frase_script: "Tu próximo hogar te espera", moneda: "USD", precio: "695000", precio_desde: "no", m2_solar: "639.99",
    m2_construccion: "350", habitaciones: "3", banos: "3.5", amenidades: "piscina|terraza|marquesina|jardin",
    terminaciones: "Pisos de porcelanato|Cocina de cuarzo", confotur: "si", variante: "clara", segmento: "inversor",
    fotos: "portada.jpg|int-1.jpg|int-2.jpg", agente_nombre: "Nombre Agente", agente_whatsapp: "+1 809 000 0000",
    agente_email: "agente@keymex.com", descripcion: "",
  };
  return Papa.unparse([ex], { columns: CSV_COLUMNS });
}
