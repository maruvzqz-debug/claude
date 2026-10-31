// Contenido de ejemplo (marcado como tal). El agente/WhatsApp nunca se precarga.
export const OFFICE_DEFAULT = {
  nombre: "KEYMEX Caribe",
  tagline: "LA REVOLUCIÓN DEL REAL ESTATE",
  instagram: "@keymexcaribe",
  web: "",
  email: "",
  lat: "LAT 18°N",
  chantal: "",
  chantalName: "",
};

export const DEFAULTS = {
  propiedad: {
    tipo: "villa", operacion: "venta", variante: "clara", segmento: "inversor",
    titulo: "Villa en Venta", palabra_acento: "Venta", proyecto: "Proyecto de ejemplo",
    zona: "Playa Nueva Romana", ciudad: "La Romana",
    bajada: "Amplios espacios, privacidad y estilo de vida exclusivo en el Caribe.",
    frase_script: "Tu próximo hogar te espera",
    moneda: "USD", precio: "695000", precio_desde: false,
    m2_solar: "639.99", m2_construccion: "350", habitaciones: "3", banos: "3.5",
    amenidades: ["piscina", "terraza", "marquesina", "jardin", "seguridad"],
    caracteristicas: [], terminaciones: [], plan_pagos: [], confotur: false,
    descripcion: "", cierre_caption: "", foto_pos: "center",
    lote: { poligono: [], medidas: [], uso: "Vivienda unifamiliar", niveles: "2", etiqueta_superior: "RESIDENCIAL" },
  },
  hook: {
    segmento: "inversor", confotur: false,
    pregunta: "¿Qué pasaría si tuvieras *tu villa* en Cap Cana?",
    bajada: "Golf, mar y privacidad a minutos de casa",
    valores: [{ icon: "mar", label: "Mar" }, { icon: "naturaleza", label: "Naturaleza" }, { icon: "exclusividad", label: "Exclusividad" }],
    texto_caption: "",
  },
  pasos: {
    segmento: "sur", confotur: true, titulo: "para invertir en", zona: "Playa Nueva Romana",
    pasos: [
      { texto: "Elige el proyecto y la unidad", icon: "casa" },
      { texto: "Reserva con un monto inicial", icon: "dinero" },
      { texto: "Firma el contrato de promesa", icon: "firma" },
      { texto: "Paga en cuotas durante la obra", icon: "calendario" },
      { texto: "Recibe tus llaves y empieza a rentar", icon: "llave" },
    ],
    cierre: "Tu inversión comienza aquí",
  },
  social: { segmento: "inversor", confotur: false, titulo_script: "Juntos", titulo_bold: "Celebramos", pill: "PROPERTY SOLD", texto: "" },
  destacadas: {
    items: [
      { label: "Clientes felices", icon: "laurel" }, { label: "PNR", icon: "pin" }, { label: "Cap Cana", icon: "pin" },
      { label: "Juan Dolio", icon: "pin" }, { label: "SPM", icon: "pin" }, { label: "Promociones", icon: "estrella" },
      { label: "Invertir desde Argentina", icon: "avion" }, { label: "Sumate como agente", icon: "apreton" },
    ],
  },
};
