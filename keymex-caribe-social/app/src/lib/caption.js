// Creador de copy por red social (Instagram · TikTok · Facebook) con 5 hashtags de nicho
// orientados a la operación (venta / alquiler / alquiler temporal), el tipo y la zona.
import { fmtNum, precioTexto, precioRotulo, operacionTexto } from "./format.js";
import { AMENIDADES } from "../components/Icons.jsx";

export const REDES = { instagram: "Instagram", tiktok: "TikTok", facebook: "Facebook" };
export const SEGMENTOS = {
  inversor: "Inversor / segunda vivienda (US$)",
  familia: "Familia local · primera vivienda (RD$)",
  sur: "Inversor Argentina · Chile · Paraguay (rioplatense)",
};
const EMOJI = { villa: "🌴", apartamento: "🏙️", casa: "🏡", adosado: "🏘️", lote: "📍", penthouse: "🌇" };
const TIPO = { villa: ["Villa", "Villas"], apartamento: ["Apartamento", "Apartamentos"], casa: ["Casa", "Casas"], adosado: ["Townhouse", "Townhouses"], penthouse: ["Penthouse", "Penthouses"], lote: ["Terreno", "Terrenos"] };
const T = (s) => (s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const clean = (s) => (s || "").replace(/\*/g, "");

/* ---------- 5 hashtags de nicho ---------- */
export function hashtagsNicho(d, kind = "propiedad") {
  const [uno, varios] = TIPO[d.tipo] || ["Propiedad", "Propiedades"];
  const Z = T(d.zona), C = T(d.ciudad);
  const lugar = Z || C;
  const tiene = (a) => (d.amenidades || []).includes(a);
  const sur = d.segmento === "sur", fam = d.segmento === "familia";
  let c = [];
  if (kind === "pasos") c = [`#ComoInvertir${lugar ? "En" + lugar : "EnRD"}`, "#InvertirEnRD", d.confotur ? "#LeyConfotur" : "#InversionInmobiliariaRD", sur ? "#InvertirDesdeArgentina" : "#RentaEnDolares", "#BienesRaicesRD"];
  else if (kind === "social") c = ["#ClienteFelizKeymex", `#Vendido${lugar ? "En" + lugar : "RD"}`, "#EntregaDeLlaves", "#PropertySoldRD", "#AgentesInmobiliariosRD"];
  else if (d.operacion === "temporal") c = [
    `#AlquilerVacacional${lugar || "RD"}`, `#Vacaciones${lugar ? "En" + lugar : "EnRD"}`, `#${uno}Vacacional`,
    tiene("piscina") ? `#${uno}ConPiscina` : tiene("playa") || tiene("vista_mar") ? "#FrenteAlMarRD" : "#EscapadaCaribe",
    "#RentaVacacionalRD",
  ];
  else if (d.operacion === "alquiler") c = [
    `#${varios}EnAlquiler${lugar}`, `#Alquiler${lugar || "RD"}`, `#${uno}EnAlquilerRD`,
    tiene("amueblado") ? "#AlquilerAmuebladoRD" : "#AlquilerLargoPlazo",
    fam ? "#ViviendaEnAlquilerRD" : "#RentaMensualRD",
  ];
  else if (d.tipo === "lote") c = [`#TerrenoEnVenta${lugar}`, "#LotesEnVentaRD", `#Invertir${lugar ? "En" + lugar : "EnRD"}`, d.confotur ? "#ProyectoConfotur" : "#ConstruyeTuCasaRD", sur ? "#InvertirDesdeArgentina" : "#TerrenosRD"];
  else c = [
    `#${varios}EnVenta${lugar}`, `#${uno}EnVentaRD`, `#Invertir${lugar ? "En" + lugar : "EnRD"}`,
    d.confotur ? "#ProyectoConfotur" : "#InversionInmobiliariaRD",
    fam ? "#TuPrimeraCasaRD" : sur ? "#InvertirDesdeArgentina" : "#SegundaViviendaRD",
  ];
  const fill = ["#BienesRaicesRD", "#RealEstateRD", "#InmobiliariaRD", "#PropiedadesRD", "#CaribeRD"];
  return [...new Set([...c.filter((h) => h && h.length > 2), ...fill])].slice(0, 5);
}

function voz(seg) {
  const sur = seg === "sur";
  return { escribi: sur ? "Escribinos" : "Escríbenos", coord: sur ? "Coordinamos una videollamada o visita cuando quieras." : "Coordinamos tu visita cuando quieras.", desliza: sur ? "Deslizá" : "Desliza", guarda: sur ? "Guardá" : "Guarda", mudate: sur ? "Mudate" : "Múdate" };
}
function gancho(d) {
  if (d.gancho) return d.gancho;
  if (d.frase_script && d.operacion !== "temporal") return d.frase_script;
  const z = d.zona || d.ciudad || "el Caribe";
  if (d.operacion === "temporal") return `Tus días en ${z} empiezan aquí ☀️`;
  if (d.operacion === "alquiler") return `${voz(d.segmento).mudate} a ${z} con todo resuelto.`;
  return `Tu próximo hogar en ${z} te espera.`;
}
function firma(d, office, corto) {
  const v = voz(d.segmento), a = d.agente || {};
  if (d.operacion === "temporal") v.coord = d.segmento === "sur" ? "Te mandamos disponibilidad y tarifas al instante." : "Te enviamos disponibilidad y tarifas al instante.";
  const wa = a.whatsapp || "[WhatsApp]";
  if (corto) return [`📲 WhatsApp ${wa}${a.nombre ? ` · ${a.nombre}` : ""}`, `${office.nombre || "KEYMEX Caribe"} · @keymexamerica`];
  return [
    `📲 ${v.escribi} al ${wa}${a.nombre ? ` (${a.nombre})` : ""} o al link de la bio. ${v.coord}`,
    "",
    office.nombre || "KEYMEX Caribe",
    office.tagline ? office.tagline.charAt(0) + office.tagline.slice(1).toLowerCase() + "." : "",
    "@keymexamerica",
  ];
}
const join = (L) => L.filter((x) => x !== null && x !== undefined && x !== false).join("\n").replace(/\n{3,}/g, "\n\n").trim();

function fichaLineas(d) {
  const dims = [fmtNum(d.m2_solar) && `${fmtNum(d.m2_solar)} m² de solar`, fmtNum(d.m2_construccion) && `${fmtNum(d.m2_construccion)} m² de construcción`].filter(Boolean);
  const car = [
    fmtNum(d.habitaciones) && `${fmtNum(d.habitaciones)} habitaciones`, fmtNum(d.banos) && `${fmtNum(d.banos)} baños`,
    d.operacion === "temporal" && fmtNum(d.huespedes) && `Hasta ${fmtNum(d.huespedes)} huéspedes`,
    d.operacion === "temporal" && fmtNum(d.min_noches) && `Mínimo ${fmtNum(d.min_noches)} noches`,
    d.tipo === "lote" && d.lote?.uso && `Uso: ${d.lote.uso}`, d.tipo === "lote" && fmtNum(d.lote?.niveles) && `Hasta ${fmtNum(d.lote.niveles)} niveles`,
    ...(d.amenidades || []).map((a) => AMENIDADES[a]), ...(d.caracteristicas || []),
  ].filter(Boolean);
  return { dims, car };
}

/* ---------- Propiedad (ficha / lote) ---------- */
export function captionPropiedad(d, office, red = "instagram") {
  const tipo = (TIPO[d.tipo]?.[0] || "Propiedad");
  const op = operacionTexto(d);
  const precio = precioTexto(d) || "a consultar";
  const { dims, car } = fichaLineas(d);
  const tags = hashtagsNicho(d).join(" ");
  const lugar = [d.zona, d.ciudad].filter(Boolean).join(", ");
  const conf = d.confotur && (d.operacion || "venta") === "venta" ? `Proyecto clasificado CONFOTUR: beneficios fiscales para el comprador. ${d.segmento === "sur" ? "Consultanos" : "Consulta"} las condiciones.` : null;

  if (red === "tiktok") {
    // TikTok: gancho en la 1ª línea, datos en 1 línea, CTA corto, 5 hashtags. Ideal < 300 caracteres.
    const datos = [fmtNum(d.habitaciones) && `${fmtNum(d.habitaciones)} hab`, fmtNum(d.m2_construccion || d.m2_solar) && `${fmtNum(d.m2_construccion || d.m2_solar)} m²`, precio].filter(Boolean).join(" · ");
    return join([`${gancho(d)} ${EMOJI[d.tipo] || "🏠"}`, `${tipo} en ${op} en ${lugar || "RD"}: ${datos}`, d.confotur && (d.operacion || "venta") === "venta" ? "✅ Proyecto CONFOTUR" : null, ...firma(d, office, true), "", tags]);
  }
  if (red === "facebook") {
    // Facebook: texto descriptivo, pocas emojis, listas claras, CTA a WhatsApp/Messenger.
    return join([
      `${tipo.toUpperCase()} EN ${op.toUpperCase()}${lugar ? ` EN ${lugar.toUpperCase()}` : ""}${d.proyecto ? ` – ${d.proyecto}` : ""}`, "",
      gancho(d), "",
      d.descripcion || d.bajada || null, d.descripcion || d.bajada ? "" : null,
      dims.length || car.length ? "Características:" : null, ...[...dims, ...car].map((x) => `• ${x}`), dims.length || car.length ? "" : null,
      (d.terminaciones || []).length ? "Terminaciones:" : null, ...(d.terminaciones || []).map((x) => `• ${x}`), (d.terminaciones || []).length ? "" : null,
      (d.plan_pagos || []).filter((p) => p.etapa).length ? "Plan de pagos:" : null, ...(d.plan_pagos || []).filter((p) => p.etapa).map((p) => `• ${p.etapa}: ${p.valor}`), "",
      `${precioRotulo(d)}: ${precio}`, conf, "",
      `${voz(d.segmento).escribi} por WhatsApp al ${d.agente?.whatsapp || "[WhatsApp]"}${d.agente?.nombre ? ` (${d.agente.nombre})` : ""} o envíanos un mensaje por aquí.`.replace("envíanos", d.segmento === "sur" ? "mandanos" : "envíanos"),
      `${office.nombre || "KEYMEX Caribe"} – ${office.tagline ? office.tagline.charAt(0) + office.tagline.slice(1).toLowerCase() : ""} | @keymexamerica`, "",
      tags,
    ]);
  }
  // Instagram: gancho + historia + ficha con emojis + precio + CTA + firma + 5 hashtags
  return join([
    `${EMOJI[d.tipo] || "🏠"} ${tipo.toUpperCase()} EN ${op.toUpperCase()}${d.proyecto ? ` | ${d.proyecto.toUpperCase()}` : ""}`, "",
    gancho(d), "",
    d.descripcion || d.bajada || null, "",
    dims.length ? "📐 Dimensiones" : null, ...dims.map((x) => `• ${x}`), dims.length ? "" : null,
    car.length ? "🏠 Características" : null, ...car.map((x) => `• ${x}`), car.length ? "" : null,
    (d.terminaciones || []).length ? "✨ Terminaciones" : null, ...(d.terminaciones || []).map((x) => `• ${x}`), (d.terminaciones || []).length ? "" : null,
    (d.plan_pagos || []).filter((p) => p.etapa).length ? "💳 Plan de pagos" : null, ...(d.plan_pagos || []).filter((p) => p.etapa).map((p) => `• ${p.etapa}: ${p.valor}`), "",
    `💰 ${precioRotulo(d)}: ${precio}`, conf ? `🏛️ ${conf}` : null, "",
    d.cierre_caption || null, d.cierre_caption ? "" : null,
    ...firma(d, office), "",
    tags,
  ]);
}

/* ---------- Hook · Educativo · Prueba social ---------- */
export function captionGenerica(kind, d, office, red = "instagram") {
  const v = voz(d.segmento);
  const tags = hashtagsNicho(d, kind).join(" ");
  const pasos = (d.pasos || []).filter((s) => s.texto);
  let cuerpo = [];
  if (kind === "hook") cuerpo = [clean(d.pregunta), "", d.texto_caption || d.bajada || null];
  if (kind === "pasos") cuerpo = [`${pasos.length} pasos ${d.titulo || "para invertir en"} ${d.zona || ""} 👇`, "", ...(red === "tiktok" ? [] : pasos.map((s, i) => `${i + 1}️⃣ ${s.texto}`)), "", d.cierre ? d.cierre + "." : null, red === "instagram" ? `💾 ${v.guarda} este post para cuando lo necesites.` : null];
  if (kind === "social") cuerpo = [`${d.titulo_script || "Juntos"} ${(d.titulo_bold || "celebramos").toLowerCase()} 🥂${d.pill ? ` | ${d.pill}` : ""}`, "", d.texto || null];
  if (red === "tiktok") return join([...cuerpo.slice(0, 3), ...firma(d, office, true), "", tags]);
  return join([...cuerpo, "", ...firma(d, office), "", tags]);
}

/* ---------- Carrusel por guion ---------- */
export function captionCarrusel(slides, d, office, red = "instagram") {
  const v = voz(d.segmento);
  const tags = hashtagsNicho({ ...d, tipo: d.tipo || "villa" }, d.tema === "educativo" ? "pasos" : "propiedad").join(" ");
  const portada = slides.find((s) => s.tipo === "PORTADA");
  const titulo = clean(portada?.valor || slides[0]?.valor || "");
  const resumen = [];
  let n = 0;
  for (const s of slides) {
    if (s.tipo === "PASO") resumen.push(`${++n}️⃣ ${clean(s.valor)}`);
    else if (s.tipo === "DATO") resumen.push(`📌 ${clean(s.valor)} ${clean(s.texto)}`.trim());
    else if (s.tipo === "LISTA") resumen.push(...s.items.map((x) => `• ${clean(x)}`));
  }
  const cierre = slides.find((s) => s.tipo === "CIERRE");
  if (red === "tiktok") return join([`${titulo} 👇`, cierre ? clean(cierre.valor) : null, ...firma(d, office, true), "", tags]);
  return join([
    titulo, portada?.bajada ? clean(portada.bajada) : null, "",
    red === "instagram" ? `${v.desliza} 👉` : null, "",
    ...resumen, resumen.length ? "" : null,
    cierre ? clean(cierre.valor) + (cierre.texto ? `. ${clean(cierre.texto)}` : "") : null,
    red === "instagram" ? `💾 ${v.guarda} este post para después.` : null, "",
    ...firma(d, office), "",
    tags,
  ]);
}
