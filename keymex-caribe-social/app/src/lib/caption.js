import { fmtMoney, fmtNum } from "./format.js";
import { AMENIDADES } from "../components/Icons.jsx";

const EMOJI = { villa: "🌴", apartamento: "🏙️", casa: "🏡", adosado: "🏘️", lote: "📍", penthouse: "🌇" };
const tag = (s) => (s ? "#" + s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]/g, "") : null);

export const SEGMENTOS = {
  inversor: "Inversor / segunda vivienda (US$)",
  familia: "Familia local · primera vivienda (RD$)",
  sur: "Inversor Argentina · Chile · Paraguay (rioplatense)",
};

function voz(seg) {
  const sur = seg === "sur";
  return {
    escribi: sur ? "Escribinos" : "Escríbenos",
    cerrar: sur ? "Coordinamos una videollamada o visita cuando quieras." : "Coordinamos tu visita cuando quieras.",
  };
}

export function hashtags(d, extra = []) {
  const base = ["#KEYMEX", "#KEYMEXCaribe", tag(d.proyecto), tag(d.zona), tag(d.ciudad)];
  const seg = d.segmento === "sur" ? ["#InvertirEnRD", "#RentaEnDolares"] : d.segmento === "familia" ? ["#TuPrimerHogar", "#CasaPropia"] : ["#LuxuryRealEstate", "#SegundaVivienda"];
  const gen = ["#BienesRaicesRD", "#RealEstateRD", "#InversionRD", "#RepublicaDominicana"];
  const all = [...base, ...(d.confotur ? ["#CONFOTUR"] : []), ...seg, ...extra, ...gen].filter(Boolean);
  return [...new Set(all)].slice(0, 12).join(" ");
}

function firma(office, agente, seg, wa) {
  const v = voz(seg);
  return [
    `📲 ${v.escribi} al ${wa || "[WhatsApp]"}${agente?.nombre ? ` (${agente.nombre})` : ""} o al link de la bio. ${v.cerrar}`,
    "",
    office.nombre || "KEYMEX Caribe",
    office.tagline ? office.tagline.charAt(0) + office.tagline.slice(1).toLowerCase() + "." : "",
    "@keymexamerica",
  ].filter((x) => x !== null);
}

export function captionPropiedad(d, office) {
  const tipo = (d.tipo || "propiedad").toUpperCase();
  const precio = fmtMoney(d.precio, d.moneda);
  const L = [];
  L.push(`${EMOJI[d.tipo] || "🏠"} ${tipo} EN ${d.operacion === "alquiler" ? "ALQUILER" : "VENTA"}${d.proyecto ? ` | ${d.proyecto.toUpperCase()}` : ""}`);
  L.push("");
  L.push(`Precio ${d.precio_desde ? "desde " : ""}${precio || "a consultar"}`);
  L.push("");
  if (d.gancho || d.frase_script) L.push(d.gancho || d.frase_script), L.push("");
  if (d.descripcion || d.bajada) L.push(d.descripcion || d.bajada), L.push("");
  const dims = [fmtNum(d.m2_solar) && `• ${fmtNum(d.m2_solar)} m² de solar`, fmtNum(d.m2_construccion) && `• ${fmtNum(d.m2_construccion)} m² de construcción`].filter(Boolean);
  if (dims.length) L.push("📐 Dimensiones", ...dims, "");
  const car = [
    fmtNum(d.habitaciones) && `• ${fmtNum(d.habitaciones)} habitaciones`,
    fmtNum(d.banos) && `• ${fmtNum(d.banos)} baños`,
    ...(d.amenidades || []).map((a) => AMENIDADES[a] && `• ${AMENIDADES[a]}`),
    ...(d.caracteristicas || []).map((x) => `• ${x}`),
  ].filter(Boolean);
  if (d.tipo === "lote" && d.lote) {
    if (d.lote.uso) car.unshift(`• Uso: ${d.lote.uso}`);
    if (fmtNum(d.lote.niveles)) car.push(`• Hasta ${fmtNum(d.lote.niveles)} niveles`);
  }
  if (car.length) L.push("🏠 Características", ...car, "");
  if ((d.terminaciones || []).length) L.push("✨ Terminaciones", ...d.terminaciones.map((x) => `• ${x}`), "");
  if ((d.plan_pagos || []).filter((p) => p.etapa).length) L.push("💳 Plan de pagos", ...d.plan_pagos.filter((p) => p.etapa).map((p) => `• ${p.etapa}: ${p.valor}`), "");
  if (d.confotur) L.push(d.segmento === "sur"
    ? "🏛️ Proyecto clasificado CONFOTUR: beneficios fiscales para el comprador. Consultanos las condiciones."
    : "🏛️ Proyecto clasificado CONFOTUR: beneficios fiscales para el comprador. Consulta las condiciones.", "");
  if (d.cierre_caption) L.push(d.cierre_caption, "");
  L.push(...firma(office, d.agente, d.segmento, d.agente?.whatsapp));
  L.push("", hashtags(d));
  return L.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function captionGenerica(kind, d, office) {
  const L = [];
  if (kind === "hook") {
    L.push(d.pregunta.replace(/\*/g, ""), "");
    if (d.texto_caption) L.push(d.texto_caption, "");
  } else if (kind === "pasos") {
    L.push(`${(d.pasos || []).filter((s) => s.texto).length} pasos ${d.titulo || "para invertir en"} ${d.zona || ""} 👇`, "");
    (d.pasos || []).filter((s) => s.texto).forEach((s, i) => L.push(`${i + 1}️⃣ ${s.texto}`));
    L.push("");
    if (d.cierre) L.push(d.cierre + ".", "");
    L.push("💾 Guardá este post para cuando lo necesites.".replace("Guardá", d.segmento === "sur" ? "Guardá" : "Guarda"), "");
  } else if (kind === "social") {
    L.push(`${d.titulo_script || "Juntos"} ${(d.titulo_bold || "celebramos").toLowerCase()} 🥂${d.pill ? ` | ${d.pill}` : ""}`, "");
    if (d.texto) L.push(d.texto, "");
  }
  L.push(...firma(office, d.agente, d.segmento, d.agente?.whatsapp));
  L.push("", hashtags(d, kind === "social" ? ["#ClienteFeliz", "#PropertySold"] : kind === "pasos" ? ["#ComoInvertir"] : []));
  return L.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
